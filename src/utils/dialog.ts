import type { DialogHelper, SettingsDialogHelper, TagElementProps } from "zotero-plugin-toolkit";
import { kebabCase } from "es-toolkit";
import { isEmpty } from "es-toolkit/compat";
import { createLogger } from "./logger";

const logger = createLogger("useDialog");

export function closeAllDialogs() {
  for (const [id, window] of addon.data.dialogs) {
    window.close();
    addon.data.dialogs.delete(id);
  }
}

export function useDialog<T extends DialogHelper | SettingsDialogHelper>(dialog: T): {
  dialog: T;
  openAndWaitClose: (title: string) => Promise<void>;
} {
  const { height, width } = getScreenInfoViaWindow() ?? {};

  // @ts-expect-error we need to override the default styles to enable scrolling
  Object.assign(dialog.elementProps.styles!, {
    minWidth: "300px",
    maxWidth: `${width * 0.8 || 1000}px`,
    maxHeight: `${height * 0.8 || 500}px`,
    backgroundColor: "var(--material-background)",
  });

  // Don't know why toolkit set overflow to hidden,
  // but we expect to see the scroll bar.
  dialog.setDialogData({
    loadCallback: () => {
      dialog.window.document.body!.style.overflow = "auto";
    },
  });

  async function openAndWaitClose(title: string) {
    const id = `${kebabCase(title)}-${Zotero.Utilities.randomString()}`;

    logger.group(id);
    logger.debug(`opening dialog ${id}...`);
    dialog.open(title);

    await dialog.dialogData.loadLock?.promise;
    addon.data.dialogs.set(id, dialog.window);
    logger.debug("dialog opened, awaiting operation...");

    await dialog.dialogData.unloadLock?.promise;
    addon.data.dialogs.delete(id);
    logger.debug("dialog closed with data");
    logger.groupEnd(id);
  };

  return { dialog, openAndWaitClose };
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
    .addAutoSaveButton("OK");

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
