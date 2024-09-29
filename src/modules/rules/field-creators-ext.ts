import type { RuleBaseOptions } from "./rule-base";
import { RuleBase } from "./rule-base";

interface CreatorExt extends Zotero.Item.Creator {
  country?: string;
  original?: string;
}

class UseCreatorsExtOptions implements RuleBaseOptions {
  mark: {
    open?: string;
    close?: string;
  } = { open: "", close: "" };

  country?: string;
}

// 交换作者拓展信息
export class UseCreatorsExt extends RuleBase<UseCreatorsExtOptions> {
  constructor(options: UseCreatorsExtOptions) {
    super(options);
  }

  apply(item: Zotero.Item): Zotero.Item | Promise<Zotero.Item> {
    if (!this.options) {
      ztoolkit.log("参数未定义，可能是弹窗未确认，结束应用规则。");
      return item;
    }
    const creators = item.getCreators();
    const creatorsExtRaw = ztoolkit.ExtraField.getExtraField(item, "creatorsExt");
    let creatorsExt: CreatorExt[];
    if (creatorsExtRaw) {
      creatorsExt = (JSON.parse(creatorsExtRaw) as CreatorExt[]).map((creator) => {
        creator.country = creator.country || this.options.country || "";
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
          country: this.options.country || "",
          original: "",
        };
      });
      ztoolkit.log("可能修改 creators 字段，备份当前 creators 至 extra.creatorsExt.");
      ztoolkit.ExtraField.setExtraField(item, "creatorsExt", JSON.stringify(creators));
    }

    creatorsExt.forEach((creatorExt, index) => {
      if (this.options.mark.open && creatorExt.country) {
        creatorExt.lastName = `${
          (this.options.mark.open ?? "") + creatorExt.country + (this.options.mark.close ?? "")
        } ${creatorExt.lastName}`.trim();
      }
      item.setCreator(index, creatorExt);
    });

    return item;
  }
}
