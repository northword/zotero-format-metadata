import type { FluentMessageId } from "../../typings/i10n";
import { getString } from "../utils/locale";
import { createLogger } from "../utils/logger";
import { getPref } from "../utils/prefs";
import { waitUtilAsync } from "../utils/wait";

const logger = createLogger("Progress");

/** Delay before a finished notification closes itself. */
const CLOSE_DELAY = 5000;
/**
 * While the mouse is over the window, the close timer is postponed instead of
 * being paused forever, so that the window cannot stay on the screen when a
 * mouse event is missed.
 */
const HOVER_CLOSE_DELAY = 15_000;

/**
 * `Zotero.ProgressWindow.ItemProgress` only builds its nodes once the popup
 * window has loaded, and the typings do not expose them.
 */
type ProgressLine = _ZoteroTypes.ItemProgress & { _hbox?: XULElement };

/** Result of a run, as shown once it ends. */
export interface RunSummary {
  pass: number;
  error: number;
  saved: number;
  /** In seconds. */
  duration: number;
  /** The user stopped the run before every item was linted. */
  stopped: boolean;
}

function createLine(win: Zotero.ProgressWindow): ProgressLine {
  return new win.ItemProgress("", "") as ProgressLine;
}

/**
 * The notification that shows the progress of a run.
 *
 * A run may span several batches, and they all share the one window this class
 * owns: `init()` opens it once and reuses it afterwards, `linting()` and
 * `saving()` report progress, `finish()` shows the result and schedules the
 * auto close. Every method is a no-op when the notification is disabled, so
 * callers do not need to check it.
 */
export class ProgressUI {
  private win?: Zotero.ProgressWindow;
  private lintLine?: ProgressLine;
  private saveLine?: ProgressLine;
  private actionLine?: ProgressLine;
  private popupWin?: Window;
  private closeTimer?: number;
  private finished = false;
  private readonly onCancel?: () => void;

  constructor(options?: { onCancel?: () => void }) {
    this.onCancel = options?.onCancel;
  }

  /**
   * Open the notification, or take back the one of the previous run.
   * @param silent Do not show any notification for this run.
   */
  public async init(silent = false): Promise<void> {
    if (silent || !getPref("lint.notify"))
      return;

    // The plugin has a single notification: a batch that starts while the
    // previous one is still on the screen continues on that window.
    if (this.win) {
      this.finished = false;
      this.clearCloseTimer();
      this.resetLines();
      return;
    }

    const win = new Zotero.ProgressWindow({ closeOnClick: false });
    win.changeHeadline(addon.data.config.addonName);

    this.lintLine = createLine(win);
    this.saveLine = createLine(win);
    this.actionLine = createLine(win);
    this.resetLines();

    win.show();
    this.win = win;

    // The nodes of the lines, needed by the click and close handling below,
    // only exist once the popup window has loaded. Waiting here keeps the stop
    // button usable from the first item on, and lets the progress write to the
    // window directly instead of queueing every call.
    try {
      await waitUtilAsync(() => !this.win || Boolean(this.actionLine?._hbox));
    }
    catch {
      // The batch must run even if the notification never loads.
      logger.warn("Progress window did not load, it cannot be closed by hand");
      return;
    }

    this.initHandlers();
  }

  /** Progress of the whole run, shown on the first line. */
  public linting(done: number, total: number): void {
    this.setLine(this.lintLine, "info-batch-running", done, total);
  }

  /** Save progress of one batch, shown on the second line. */
  public saving(done: number, total: number): void {
    this.setLine(this.saveLine, "info-batch-saving", done, total);
  }

  public finish({ pass, error, saved, duration, stopped }: RunSummary): void {
    if (!this.win)
      return;

    this.finished = true;

    const result = pass + error > 0
      ? [
          "[",
          `✔️${pass}`,
          error ? ` ❌${error}` : "",
          "] ",
          getString(stopped ? "info-batch-stopped" : "info-batch-finish"),
        ].join("")
      : getString("info-batch-no-selected");

    this.lintLine?.setText(result);
    this.lintLine?.setProgress(100);
    this.saveLine?.setText(
      saved > 0
        ? getString("info-batch-saved", { args: { count: saved } })
        : getString("info-batch-nothing-to-save"),
    );
    this.saveLine?.setProgress(100);
    this.actionLine?.setText(getString("info-batch-duration", { args: { seconds: duration } }));

    this.scheduleClose(CLOSE_DELAY);
  }

  public close(): void {
    this.clearCloseTimer();
    this.finished = false;

    const popup = this.popupWin;
    if (popup && !popup.closed) {
      popup.removeEventListener("mouseover", this.handleMouseOver);
      popup.removeEventListener("mouseout", this.handleMouseOut);
      popup.removeEventListener("mouseup", this.handleMouseUp);
    }
    this.popupWin = undefined;

    this.actionLine?._hbox?.removeEventListener("click", this.handleStopRequest);
    this.actionLine = undefined;
    this.lintLine = undefined;
    this.saveLine = undefined;

    this.win?.close();
    this.win = undefined;
  }

  // ----------------------------
  // Rendering
  // ----------------------------

  private setLine(line: ProgressLine | undefined, label: FluentMessageId, done: number, total: number): void {
    line?.setText(`[${done}/${total}] ${getString(label)}`);
    line?.setProgress(total > 0 ? (done / total) * 100 : 100);
  }

  /** Put the three lines back to the state of a run that is about to start. */
  private resetLines(): void {
    this.lintLine?.setText(getString("info-batch-running"));
    this.lintLine?.setProgress(0);
    this.saveLine?.setText(getString("info-batch-pending-save"));
    this.saveLine?.setProgress(0);
    this.actionLine?.setText(getString("info-batch-break"));
  }

  // ----------------------------
  // Window handlers
  // ----------------------------

  private initHandlers(): void {
    const action = this.actionLine?._hbox;
    // `ownerGlobal` is ChromeOnly and not visible from the plugin sandbox.
    const popup = action?.ownerDocument?.defaultView as Window | undefined;
    if (!action || !popup)
      return;

    action.addEventListener("click", this.handleStopRequest);

    // Zotero's own close timer relies on a coordinate-based bounds check in its
    // `mouseout` handler, which is wrong on scaled displays: the timer is never
    // restarted once the mouse leaves the window and the notification stays
    // forever (#461). Take over the auto close here instead.
    this.popupWin = popup;
    popup.addEventListener("mouseover", this.handleMouseOver);
    popup.addEventListener("mouseout", this.handleMouseOut);
    popup.addEventListener("mouseup", this.handleMouseUp);
  }

  private scheduleClose(delay: number): void {
    this.clearCloseTimer();

    if (!this.finished)
      return;

    const win = this.popupWin;
    if (!win || win.closed) {
      // Fall back to Zotero's timer, which works unless the mouse touched the window
      this.win?.startCloseTimer(delay);
      return;
    }

    this.closeTimer = win.setTimeout(() => {
      this.closeTimer = undefined;
      this.close();
    }, delay);
  }

  private clearCloseTimer(): void {
    if (this.closeTimer === undefined)
      return;

    const win = this.popupWin;
    if (win && !win.closed)
      win.clearTimeout(this.closeTimer);

    this.closeTimer = undefined;
  }

  private handleMouseOver = (): void => {
    this.scheduleClose(HOVER_CLOSE_DELAY);
  };

  private handleMouseOut = (ev: MouseEvent): void => {
    // `relatedTarget` is set when the mouse just moves between elements inside
    // the window, and is null (or a node of another window) when it leaves.
    const related = ev.relatedTarget as Node | null;
    if (related && this.popupWin?.document.contains(related))
      return;

    this.scheduleClose(CLOSE_DELAY);
  };

  private handleMouseUp = (): void => {
    // Allow to close the notification manually once the run is done
    if (this.finished)
      this.close();
  };

  private handleStopRequest = (): void => {
    // Once the run is done, a click only dismisses the notification, which
    // `handleMouseUp` already takes care of.
    if (this.finished) {
      this.close();
      return;
    }

    this.actionLine?.setText(getString("info-batch-stop-next"));
    this.onCancel?.();
  };
}
