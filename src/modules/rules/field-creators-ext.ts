import type { TagElementProps } from "zotero-plugin-toolkit";
import { getString } from "../../utils/locale";
import { defineRule } from "./rule-base";

interface CreatorExt extends _ZoteroTypes.Item.Creator {
  country?: string;
  original?: string;
}

interface CreatorExtOptions {
  mark: {
    open?: string;
    close?: string;
  };
  country?: string;
}

export const CreatorsExt = defineRule<CreatorExtOptions> ({
  id: "creators-ext",
  type: "field",
  targetItemFields: ["creators"],

  apply({ item, options }) {
    if (!options) {
      ztoolkit.log("参数未定义，可能是弹窗未确认，结束应用规则。");
      return;
    }

    const creators = item.getCreators();
    const creatorsExtRaw = ztoolkit.ExtraField.getExtraField(item, "creatorsExt");
    let creatorsExt: CreatorExt[];
    if (creatorsExtRaw) {
      creatorsExt = (JSON.parse(creatorsExtRaw) as CreatorExt[]).map((creator) => {
        creator.country = creator.country || options.country || "";
        return creator;
      });
    }
    else {
      creatorsExt = creators.map((creator) => {
        return {
          firstName: creator.firstName,
          lastName: creator.lastName,
          fieldMode: creator.fieldMode,
          creatorTypeID: creator.creatorTypeID,
          country: options.country || "",
          original: "",
        };
      });
      ztoolkit.log("可能修改 creators 字段，备份当前 creators 至 extra.creatorsExt.");
      ztoolkit.ExtraField.setExtraField(item, "creatorsExt", JSON.stringify(creators));
    }

    creatorsExt.forEach((creatorExt, index) => {
      if (options.mark.open && creatorExt.country) {
        creatorExt.lastName = `${
          (options.mark.open ?? "") + creatorExt.country + (options.mark.close ?? "")
        } ${creatorExt.lastName}`.trim();
      }
      item.setCreator(index, creatorExt);
    });
  },

  async getOptions() {
    return createCreatorsExtOptionDialog();
  },
});

async function createCreatorsExtOptionDialog(): Promise<any | undefined> {
  const dialogData: { [key: string | number]: any } = {
    data: undefined,
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
              properties: { innerHTML: "国籍：" },
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
    .open("作者扩展信息");
  await dialogData.unloadLock.promise;

  if (dialogData._lastButtonId !== "confirm") {
    return undefined;
  }

  return dialogData.data;
}
