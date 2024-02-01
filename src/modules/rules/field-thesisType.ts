import { RuleBase, RuleBaseOptions } from "./rule-base";

class ThesisTypeOptions implements RuleBaseOptions {}
/**
 * Thesis type
 *
 * 硕士 -> 硕士学位论文;
 * 博士 -> 博士学位论文;
 * Dissertation -> Doctoral dissertation;
 * Ph.D. -> Doctoral dissertation;
 * master -> Master thesis;
 *
 * @see https://github.com/northword/zotero-format-metadata/issues/132
 */
export default class ThesisType extends RuleBase<ThesisTypeOptions> {
    constructor(options: ThesisTypeOptions) {
        super(options);
    }

    apply(item: Zotero.Item): Zotero.Item {
        if (item.itemType !== "thesis") return item;

        let type = item.getField("thesisType");
        if (!type) return item;

        if (type.match("硕士")) {
            type = "硕士学位论文";
        } else if (type.match("博士")) {
            type = "博士学位论文";
        } else if (type.match(/doctor/i)) {
            type = "Doctoral dissertation";
        } else if (type.match(/master/i)) {
            type = "Master thesis";
        } else if (type.match(/ph\.? ?d\.?/i)) {
            type = "Doctoral dissertation";
        } else {
            // @ts-ignore https://github.com/windingwind/zotero-types/pull/33
            type = Zotero.Utilities.sentenceCase(type);
        }

        item.setField("thesisType", type);
        return item;
    }
}
