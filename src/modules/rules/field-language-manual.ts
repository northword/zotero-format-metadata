import type { TagElementProps } from "zotero-plugin-toolkit";

import type { Rule } from "./rule-base";
import { langName, toISO3 } from "tinyld";
import { getString } from "../../utils/locale";
import { getPref } from "../../utils/prefs";

interface Options {
  language?: string;
}

export const LanguageManual: Rule<Options> = {
  id: "language-manual",
  type: "field",
  targetItemFields: ["language"],
  apply({ item, options }) {
    if (options.language)
      item.setField("language", options.language);
  },

  async getOptions() {
    const language = await createSetLanguageManualDialog();
    return {
      language,
    };
  },
};

/**
 * 手动设置条目语言_选择语言的弹窗
 */
export async function createSetLanguageManualDialog(): Promise<string | undefined> {
  const dialogData: { [key: string | number]: any } = {
    selectedLang: "",
    inputLang: "",
    formData: "",
    loadCallback: () => {
      // eslint-disable-next-line ts/no-use-before-define
      addon.data.dialogs.selectLang = dialog;
    },
    unloadCallback: () => {
      // eslint-disable-next-line ts/no-use-before-define
      const window = dialog.window;
      const form = window.document.querySelector("form") as HTMLFormElement;
      dialogData.formData = new window.FormData(form);
      dialogData.selectedLang = dialogData.formData.get("selectedLang");
      delete addon.data.dialogs.selectLang;
    },
  };

  const allowLangs = ["zh", "en"];
  if (getPref("lang.only")) {
    const otherLang = getPref("lang.only.other") as string;
    if (otherLang !== "" && otherLang !== undefined) {
      allowLangs.push.apply(otherLang.replace(/ /g, "").split(","));
    }
  }
  const row = allowLangs.length > 2 ? allowLangs.length : 3;

  const dialog = new ztoolkit.Dialog(row, 2);

  const radiogroupChildren: Array<TagElementProps> = [];
  // 自动识别语言模块中允许识别的语言
  allowLangs.forEach((lang) => {
    radiogroupChildren.push(
      {
        tag: "input",
        id: `dialog-checkbox-${lang}`,
        attributes: {
          type: "radio",
          name: "selectedLang",
          value: lang,
          // label: langName(lang),
          // "data-bind": "selectedLang",
        },
      },
      {
        tag: "label",
        attributes: {
          for: `dialog-checkbox-${lang}`,
        },
        properties: { innerHTML: `${lang} (${langName(toISO3(lang))})` },
      },
    );
  });
  // 添加一个“其他”输入框
  radiogroupChildren.push({
    tag: "div",
    children: [
      {
        tag: "input",
        namespace: "html",
        id: `dialog-checkbox-other`,
        attributes: {
          type: "radio",
          name: "selectedLang",
          // for: `dialog-checkbox-input`,
          value: "other",
        },
      },
      {
        tag: "input",
        id: `dialog-checkbox-input`,
        attributes: {
          "type": "text",
          "for": "dialog-checkbox-other",
          "placeholder": "Other",
          "data-bind": "inputLang",
          "data-prop": "value",
        },
        listeners: [
          {
            type: "input",
            listener: () => {
              const radioOther = dialog.window.document.getElementById(
                "dialog-checkbox-other",
              ) as HTMLInputElement;
              radioOther.checked = true;
            },
          },
        ],
      },
    ],
  });

  dialog
    .addCell(0, 0, {
      tag: "form",
      id: `dialog-checkboxgroup`,
      // attributes: { "data-bind": "selectedLang", "data-prop": "lang" },
      children: radiogroupChildren,
    })
    .addButton(getString("confirm"), "confirm")
    .addButton(getString("cancel"), "cancel")
    .setDialogData(dialogData)
    .open(getString("dialog-selectLanguage"));
  await dialogData.unloadLock.promise;

  // 如果取消/直接关闭弹窗，则返回 false
  // 如果 text input 存在值，则返回，否则返回 radio 的值
  if (dialogData._lastButtonId !== "confirm") {
    return undefined;
  }
  if (dialogData.selectedLang === "other" && dialogData.inputLang !== undefined) {
    return dialogData.inputLang;
  }
  return dialogData.selectedLang;
}
