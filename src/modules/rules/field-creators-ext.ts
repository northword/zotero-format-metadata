import { RuleBase, RuleBaseOptions } from "../../utils/rule-base";

// 交换作者拓展信息

interface CreatorExt extends Zotero.Item.CreatorJSON {
    country: string;
    fieldMode: number;
    original: string;
}

class UseCreatorsExtOptions implements RuleBaseOptions {
    mark: {
        open: string;
        close: string;
    } = { open: "[", close: "]" };
}

export default class UseCreatorsExt extends RuleBase<UseCreatorsExtOptions> {
    constructor(options: UseCreatorsExtOptions) {
        super(options);
    }

    apply(item: Zotero.Item): Zotero.Item | Promise<Zotero.Item> {
        // const creatorsExt = item.getExtraField("creatorsExt");
        const creatorsExtRaw = ztoolkit.ExtraField.getExtraField(item, "creatorsExt");
        if (!creatorsExtRaw) return item;

        const creatorsExt = JSON.parse(creatorsExtRaw) as CreatorExt[];
        if (!creatorsExt) return item;

        creatorsExt.forEach((creatorExt, index) => {
            let newCreator: Zotero.Item.Creator;
            if (creatorExt.country) {
                creatorExt.lastName = `${this.options.mark.open + creatorExt.country + this.options.mark.close} ${
                    creatorExt.lastName
                }`;
            }
            item.setCreator(index, creatorExt);
        });
        return item;
    }
}
