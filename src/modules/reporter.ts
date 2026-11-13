import type { ProgressWindowHelper, TagElementProps } from "zotero-plugin-toolkit";
import { groupBy } from "es-toolkit";
import { useDialog } from "../utils/dialog";
import { getString } from "../utils/locale";
import { getPref } from "../utils/prefs";
import { waitUtilAsync } from "../utils/wait";

export interface ReportInfo {
  level?: "warning" | "error";
  message: string;
  action?: {
    label: string;
    callback: () => void;
  };
  itemID: number;
  title: string;
  ruleID: string;
}

export function createReporter(infos: ReportInfo[]) {
  const resolvedInfos: Record<number, ReportInfo[]> = groupBy(
    infos,
    info => info.itemID,
  );

  const { dialog, openAndWaitClose, close } = useDialog(new ztoolkit.Dialog(1, 1));
  dialog.addCell(0, 0, {
    tag: "div",
    styles: {
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      fontFamily: "Segoe UI, sans-serif",
      fontSize: "14px",
    },
    children: Object.values(resolvedInfos).flatMap(infos => [
      {
        tag: "div",
        styles: {
          border: "var(--material-border)",
          borderRadius: "8px",
          padding: "10px",
          backgroundColor: "var(--material-background)",
        },
        children: [
          {
            tag: "a",
            properties: {
              innerHTML: `${infos[0].itemID} - ${infos[0].title}`,
            },
            styles: {
              fontWeight: "bold",
              marginBottom: "8px",
              display: "block",
              fontSize: "15px",
              color: "var(--fill-primary)",
              textDecoration: "none",
            },
            listeners: [
              {
                type: "click",
                listener: () => {
                  Zotero.getActiveZoteroPane()?.selectItem(infos[0].itemID);
                },
              },
            ],
          },
          ...infos.map(createRuleResultRows),
        ],
      },
    ] satisfies TagElementProps[]),
  });

  function createRuleResultRows(info: ReportInfo): TagElementProps {
    return {
      tag: "div",
      styles: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "6px 8px",
        borderRadius: "6px",
        minHeight: "2rem",
        backgroundColor:
          info.level === "error"
            ? "rgba(255, 0, 0, 0.08)"
            : "rgba(255, 165, 0, 0.08)",
        marginBottom: "6px",
      },
      children: [
        {
          tag: "a",
          properties: {
            innerHTML: info.ruleID,
          // href: `https://github.com/northword/zotero-format-metadata/blob/main/docs/rules/${info.ruleID}.md`,
          },
          styles: {
            fontWeight: "bold",
            color: info.level === "error" ? "var(--accent-red)" : "var(--accent-orange)",
            minWidth: "80px",
            textDecoration: "none",
          },
        },
        {
          tag: "label",
          properties: {
            textContent: info.message,
          },
          styles: {
            flex: "1",
            color: "var(--fill-primary)",
            fontSize: "13px",
            lineHeight: "1.4",
            whiteSpace: "pre-line",
          },
        },
        {
          tag: "button",
          styles: {
            display: info.action ? "inline-block" : "none",
            padding: "4px 10px",
            border: "none",
            cursor: "pointer",
            fontSize: "12px",
          },
          properties: {
            innerHTML: info.action?.label,
            onclick: () => {
              info.action?.callback();

              // If only one rule reports an issue for an item,
              // close the dialog when clicking the button
              if (infos.length === 1) {
                close();
              }
            },
          },
        },
      ],
    };
  }

  openAndWaitClose("Linter for Zotero");
}

const PROGRESS_WINDOW_CLOSE_DELAY = 5000;
// While the mouse is over the window, the close timer is postponed instead of
// being paused forever, so that the window cannot stay on the screen when a
// mouse event is missed.
const PROGRESS_WINDOW_HOVER_CLOSE_DELAY = 15_000;

export class ProgressUI {
  private progressWindow?: ProgressWindowHelper;
  private popupWin?: Window;
  private closeTimer?: number;
  private finished = false;
  private _onCancel?: () => void;

  constructor(options?: { onCancel?: () => void }) {
    this._onCancel = options?.onCancel;
  }

  public async init(slient?: boolean): Promise<void> {
    this.dispose();

    if (slient || !getPref("lint.notify"))
      return;

    this.progressWindow = new ztoolkit.ProgressWindow(addon.data.config.addonName, {
      closeOnClick: false,
      closeTime: -1,
    })
      .createLine({
        type: "default",
        text: getString("info-batch-init"),
        progress: 0,
        idx: 0,
      })
      .createLine({
        type: "default",
        text: getString("info-batch-pending-save"),
        progress: 0,
        idx: 1,
      })
      .createLine({
        text: getString("info-batch-break"),
        idx: 2,
      })
      .show();

    // @ts-expect-error miss types
    await waitUtilAsync(() => Boolean(this.progressWindow?.lines?.[2]?._itemText));
    // @ts-expect-error miss types
    const stopLine = this.progressWindow?.lines?.[2];
    if (!stopLine?._hbox)
      return;

    stopLine._hbox.addEventListener("click", this.handleStopRequest);

    // Zotero's own close timer relies on a coordinate-based bounds check in its
    // `mouseout` handler, which is wrong on scaled displays: the timer is never
    // restarted once the mouse leaves the window and the notification stays
    // forever (#461). Take over the auto close here instead.
    // `ownerGlobal` is ChromeOnly and not visible from the plugin sandbox.
    this.popupWin = stopLine._hbox.ownerDocument?.defaultView as Window | undefined;
    if (!this.popupWin)
      return;

    this.popupWin.addEventListener("mouseover", this.handleMouseOver);
    this.popupWin.addEventListener("mouseout", this.handleMouseOut);
    this.popupWin.addEventListener("mouseup", this.handleMouseUp);
  }

  public updateProgress(current: number, total: number, phase?: "idle" | "linting" | "saving"): void {
    if (!this.progressWindow)
      return;

    const progress = total > 0 ? (current / total) * 100 : 100;

    if (phase === "saving") {
      this.progressWindow.changeLine({
        text: `[${current}/${total}] ${getString("info-batch-saving")}`,
        progress,
        idx: 1,
      });
    }
    else {
      const label = phase === "idle"
        ? getString("info-batch-init")
        : getString("info-batch-running");
      const text = phase === "idle" ? label : `[${current}/${total}] ${label}`;
      this.progressWindow.changeLine({ text, progress, idx: 0 });
    }
  }

  public showError(): void {
    this.progressWindow?.createLine({
      type: "fail",
      text: getString("info-batch-has-error"),
    });
  }

  public showFinished(
    successCount: number,
    errorCount: number,
    duration: number,
    savedCount: number,
  ): void {
    if (!this.progressWindow)
      return;

    this.finished = true;

    const text = successCount + errorCount
      ? [
          "[",
          `✔️${successCount}`,
          errorCount ? ` ❌${errorCount}` : "",
          "] ",
          getString("info-batch-finish"),
        ].join("")
      : getString("info-batch-no-selected");

    const savedText = savedCount > 0
      ? getString("info-batch-saved", { args: { count: savedCount } })
      : getString("info-batch-nothing-to-save");

    this.progressWindow
      .changeLine({ text, progress: 100, idx: 0 })
      .changeLine({ text: savedText, progress: 100, idx: 1 })
      .changeLine({
        text: getString("info-batch-duration", { args: { seconds: duration } }),
        idx: 2,
      });

    this.scheduleClose(PROGRESS_WINDOW_CLOSE_DELAY);
  }

  // ----------------------------
  // Close handling
  // ----------------------------

  private scheduleClose(delay: number): void {
    this.clearCloseTimer();

    if (!this.finished)
      return;

    const win = this.popupWin;
    if (!win || win.closed) {
      // Fall back to Zotero's timer, which works unless the mouse touched the window
      this.progressWindow?.startCloseTimer(delay);
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

  public close(): void {
    this.dispose();
  }

  private dispose(): void {
    this.clearCloseTimer();
    this.finished = false;

    const win = this.popupWin;
    if (win && !win.closed) {
      win.removeEventListener("mouseover", this.handleMouseOver);
      win.removeEventListener("mouseout", this.handleMouseOut);
      win.removeEventListener("mouseup", this.handleMouseUp);
    }
    this.popupWin = undefined;

    this.progressWindow?.close();
    this.progressWindow = undefined;
  }

  private handleMouseOver = (): void => {
    this.scheduleClose(PROGRESS_WINDOW_HOVER_CLOSE_DELAY);
  };

  private handleMouseOut = (ev: MouseEvent): void => {
    // `relatedTarget` is set when the mouse just moves between elements inside
    // the window, and is null (or a node of another window) when it leaves.
    const related = ev.relatedTarget as Node | null;
    if (related && this.popupWin?.document.contains(related))
      return;

    this.scheduleClose(PROGRESS_WINDOW_CLOSE_DELAY);
  };

  private handleMouseUp = (): void => {
    // Allow to close the notification manually once the batch is done
    if (this.finished)
      this.close();
  };

  private handleStopRequest = (ev: MouseEvent): void => {
    ev.stopPropagation();
    ev.preventDefault();

    if (this.finished) {
      this.close();
      return;
    }

    this.progressWindow?.changeLine({
      text: getString("info-batch-stop-next"),
      idx: 2,
    });
    this._onCancel?.();
  };
}
