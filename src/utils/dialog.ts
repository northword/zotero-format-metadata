import type { DialogHelper, SettingsDialogHelper, TagElementProps } from "zotero-plugin-toolkit";
import { kebabCase } from "es-toolkit";
import { isEmpty } from "es-toolkit/compat";
import { createLogger } from "./logger";

const logger = createLogger("useDialog");

const OK_BUTTON_ID = "btn-ok";
/** Share of the screen a dialog may take. */
const MAX_DIALOG_SIZE_RATIO = 0.8;

/**
 * Largest size a dialog window may take, so that it stays on the screen.
 * Pass the dialog window to measure the screen the dialog is actually on.
 */
function getMaxDialogSize(win?: Window): { width: number; height: number } {
  const screen = win?.screen ?? getScreenInfoViaWindow();
  return {
    width: Math.floor((screen?.availWidth ?? 1280) * MAX_DIALOG_SIZE_RATIO),
    height: Math.floor((screen?.availHeight ?? 900) * MAX_DIALOG_SIZE_RATIO),
  };
}

export function closeAllDialogs() {
  for (const [id, window] of addon.data.dialogs) {
    window.close();
    addon.data.dialogs.delete(id);
  }
}

export function useDialog<T extends DialogHelper | SettingsDialogHelper>(dialog: T): {
  dialog: T;
  openAndWaitClose: (title: string) => Promise<void>;
  close: () => void;
  /** Grow the window to what it now shows, up to the size below. */
  fitToContent: () => void;
} {
  const { width, height } = getMaxDialogSize();

  // @ts-expect-error we need to override the default styles to enable scrolling
  Object.assign(dialog.elementProps.styles!, {
    minWidth: "300px",
    maxWidth: `${width}px`,
    maxHeight: `${height}px`,
    backgroundColor: "var(--material-background)",
  });

  // Don't know why toolkit set overflow to hidden,
  // but we expect to see the scroll bar.
  dialog.setDialogData({
    loadCallback: () => {
      const doc = dialog.window.document;
      const body = doc.body!;

      // The toolkit makes the document `color-scheme: light dark`, so on a dark
      // system the canvas — what the content does not cover, e.g. the strip
      // left along the right and bottom after the window is sized to its
      // content — is painted with the dark default colour. A background on the
      // root element is the canvas background, so the window keeps the palette
      // of the dialog however its size and the system scheme come out.
      (doc.documentElement as HTMLElement).style.backgroundColor = "var(--material-background)";

      // The same scheme paints the scroll bars: give them the dialog colours.
      body.style.scrollbarColor = "var(--fill-quinary) transparent";

      // A dialog scrolls vertically only. The horizontal bar is always an
      // accident of the content being one scroll bar too wide once the
      // vertical bar takes its space.
      body.style.overflowX = "hidden";
      body.style.overflowY = "auto";

      // `max-height` on the dialog element does not reach the document size
      // that a window is fitted to, so cap the scroll container itself: the
      // document then stops growing at the same size as the dialog.
      body.style.maxHeight = `${height}px`;
      body.style.maxWidth = `${width}px`;
    },
  });

  let id: string;

  async function openAndWaitClose(title: string) {
    id = `${kebabCase(title)}-${Zotero.Utilities.randomString()}`;

    logger.debug(`opening dialog ${id}...`);
    dialog.open(title);

    await dialog.dialogData.loadLock?.promise;
    addon.data.dialogs.set(id, dialog.window);
    logger.debug("dialog opened, awaiting operation...");

    dialog.window.focus();
    (dialog.window.document.getElementById(OK_BUTTON_ID) as HTMLButtonElement | null)?.focus();

    await dialog.dialogData.unloadLock?.promise;
    addon.data.dialogs.delete(id);
    logger.debug("dialog closed");
  };

  function close() {
    dialog.window.close();
    logger.debug("dialog closed without data");
  }

  /**
   * Grow the window to the content it shows now, without ever passing the size
   * the dialog is capped to. A window only follows its content when asked to,
   * and the toolkit only asks once, when the dialog opens.
   */
  function fitToContent() {
    const win = dialog.window;
    if (!win || win.closed)
      return;

    const body = win.document.body;
    if (!body)
      return;

    // `maxHeight` is what `loadCallback` put on the scroll container, so this
    // never asks for more than the dialog may take; the rest scrolls.
    const maxHeight = Number.parseFloat(win.getComputedStyle(body)?.maxHeight ?? "");
    const needed = Math.min(body.scrollHeight, maxHeight || Number.POSITIVE_INFINITY);

    // Resizing a window that already has the size is what leaves an unpainted
    // strip along the right and bottom edges, until the window is resized by
    // hand: stop as soon as there is nothing left to grow into.
    if (win.innerHeight >= needed - 2)
      return;

    win.sizeToContent();
  }

  return { dialog, openAndWaitClose, close, fitToContent };
}

type SettingsDialogResult = Record<string, any>;

interface SettingsDialog<T extends SettingsDialogResult> extends SettingsDialogHelper {
  addSetting: (label: string, settingKey: keyof T, controlProps: TagElementProps, options?: {
    valueType?: "string" | "number" | "boolean";
    labelProps?: Partial<TagElementProps>;
    condition?: () => boolean;
  }) => this;
}

type SafeSettingsDialogHelper<T extends SettingsDialogResult> = Omit<
  SettingsDialog<T>,
  "setSettingHandlers" | "addAutoSaveButton" | "saveAllSettings"
>;

export function useSettingsDialog<T extends SettingsDialogResult>(): {
  dialog: SafeSettingsDialogHelper<T>;
  openForSettings: (title: string) => Promise<T | false>;
} {
  const data = {} as SettingsDialogResult;
  const { dialog, openAndWaitClose } = useDialog(new ztoolkit.SettingsDialog() as SettingsDialog<T>);

  dialog
    .setSettingHandlers(
      key => data[key],
      (key, value) => data[key] = value,
    )
    .addAutoSaveButton("OK", OK_BUTTON_ID);

  async function openForSettings(title: string) {
    await openAndWaitClose(title);
    return isEmpty(data) ? false : data as T;
  }

  return { dialog, openForSettings };
}

function getScreenInfoViaWindow() {
  try {
    const { classes: Cc, interfaces: Ci } = Components;

    // @ts-expect-error no types
    const windowMediator = Cc["@mozilla.org/appshell/window-mediator;1"]
      .getService(Ci.nsIWindowMediator);

    const recentWindow = windowMediator.getMostRecentWindow("navigator:browser");

    if (recentWindow) {
      const screen = recentWindow.screen;
      return {
        width: screen.width,
        height: screen.height,
        availWidth: screen.availWidth,
        availHeight: screen.availHeight,
        colorDepth: screen.colorDepth,
        pixelDepth: screen.pixelDepth,
      };
    }

    return null;
  }
  catch (e) {
    logger.error("Failed to get screen info", e);
    return null;
  }
}
