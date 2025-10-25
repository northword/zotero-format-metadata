import type { SettingsDialogHelper, TagElementProps } from "zotero-plugin-toolkit";
import { isEmpty } from "es-toolkit/compat";
import { createLogger } from "./logger";

const logger = createLogger("useDialog");

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

  dialog
    .setSettingHandlers(
      key => data[key],
      (key, value) => data[key] = value,
    )
    .addAutoSaveButton("OK");

  async function open(title: string) {
    dialog.open(title);
    await dialog.dialogData.unloadLock?.promise;
    logger.debug("data:", data);

    if (isEmpty(data))
      return false;
    else
      return data as T;
  }

  return { dialog, open };
}
