import type { SettingsDialogHelper, TagElementProps } from "zotero-plugin-toolkit";
import { kebabCase } from "es-toolkit";
import { isEmpty } from "es-toolkit/compat";
import { createLogger } from "./logger";

const logger = createLogger("useDialog");

export function closeAllDialogs() {
  for (const [id, dialog] of addon.data.dialog) {
    dialog.window.close();
    addon.data.dialog.delete(id);
  }
}

type Result = Record<string, any>;

interface Dialog<T extends Result> extends SettingsDialogHelper {
  addSetting: (label: string, settingKey: keyof T, controlProps: TagElementProps, options?: {
    valueType?: "string" | "number" | "boolean";
    labelProps?: Partial<TagElementProps>;
    condition?: () => boolean;
  }) => this;
}

type SafeSettingsDialogHelper<T extends Result> = Omit<
  Dialog<T>,
  "setSettingHandlers" | "addAutoSaveButton" | "saveAllSettings"
>;

export function useDialog<T extends Result>(): {
  dialog: SafeSettingsDialogHelper<T>;
  open: (title: string) => Promise<T | false>;
} {
  const data = {} as Result;
  const dialog = new ztoolkit.SettingsDialog() as Dialog<T>;

  // @ts-expect-error we need to override the default styles to enable scrolling
  Object.assign(dialog.elementProps.styles!, {
    maxWidth: "1000px",
    minWidth: "300px",
    maxHeight: "500px",
    backgroundColor: "var(--material-background)",
  });

  // Don't know why toolkit set overflow to hidden,
  // but we expect to see the scroll bar.
  dialog.setDialogData({
    loadCallback: () => {
      dialog.window.document.body!.style.overflow = "auto";
    },
  });

  dialog
    .setSettingHandlers(
      key => data[key],
      (key, value) => data[key] = value,
    )
    .addAutoSaveButton("OK");

  async function open(title: string) {
    const id = `${kebabCase(title)}-${Zotero.Utilities.randomString()}`;

    logger.debug(`opening dialog ${id}...`);
    dialog.open(title);

    await dialog.dialogData.loadLock?.promise;
    addon.data.dialog.set(id, dialog.window);
    logger.debug("dialog opened, awaiting operation...");

    await dialog.dialogData.unloadLock?.promise;
    addon.data.dialog.delete(id);
    logger.debug("dialog closed with data:", data);

    if (isEmpty(data))
      return false;
    else
      return data as T;
  }

  return { dialog, open };
}
