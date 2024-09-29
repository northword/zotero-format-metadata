import type { TagElementProps } from "zotero-plugin-toolkit/dist/tools/ui";
import { getString } from "../../utils/locale";

/**
 * 应用扩展作者信息选项
 */
export async function getCreatorsExtOptionDialog(): Promise<any | undefined> {
  const dialogData: { [key: string | number]: any } = {
    data: undefined,
    loadCallback: () => {
      // eslint-disable-next-line ts/no-use-before-define
      addon.data.dialogs.selectLang = dialog;
    },
    unloadCallback: () => {
      // eslint-disable-next-line ts/no-use-before-define
      const window = dialog.window;
      const form = window.document.querySelector("form") as HTMLFormElement;
      const formData = new window.FormData(form);
      dialogData.data = {
        mark: {
          open: formData.get("mark")?.slice(0, 1),
          close: formData.get("mark")?.slice(1, 2),
        },
        country: formData.get("country"),
      };

      ztoolkit.log(dialogData.data);
      delete addon.data.dialogs.selectLang;
    },
  };

  const marks: Array<TagElementProps> = ["[]", "()", "【】", "（）", "〔〕"]
    .map((mark, index) => {
      return [
        {
          tag: "input",
          id: `dialog-checkbox-mark-${index}`,
          attributes: {
            type: "radio",
            name: "mark",
            value: mark,
          },
        },
        {
          tag: "label",
          attributes: {
            for: `dialog-checkbox-mark-${index}`,
          },
          properties: { innerHTML: mark },
        },
      ];
    })
    .flat();
  marks.unshift(
    {
      tag: "input",
      id: `dialog-checkbox-mark-0`,
      attributes: {
        type: "radio",
        name: "mark",
        value: "",
        checked: true,
      },
    },
    {
      tag: "label",
      attributes: {
        for: `dialog-checkbox-mark-0`,
      },
      properties: { innerHTML: "No symbols" },
    },
  );

  const dialog = new ztoolkit.Dialog(1, 1)
    .addCell(0, 0, {
      tag: "form",
      // id: `dialog-checkboxgroup`,
      children: [
        { tag: "div", children: [{ tag: "label", properties: { innerHTML: "国籍左右符号：" } }, ...marks] },
        {
          tag: "div",
          children: [
            {
              tag: "label",
              properties: { innerHTML: "国籍: " },
            },
            {
              tag: "input",
              id: `dialog-checkbox-input`,
              attributes: {
                "type": "text",
                "name": "country",
                "for": "dialog-checkbox-other",
                "placeholder": "Default is extra.creatorsExt",
                "data-bind": "inputLang",
                "data-prop": "value",
              },
            },
          ],
        },
      ],
    })
    .addButton(getString("confirm"), "confirm")
    .addButton(getString("cancel"), "cancel")
    .setDialogData(dialogData)
    .open(getString("作者扩展信息"));
  await dialogData.unloadLock.promise;

  if (dialogData._lastButtonId !== "confirm") {
    return undefined;
  }

  return dialogData.data;
}
