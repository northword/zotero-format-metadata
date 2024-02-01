import { removeLeadingZeros } from "../../utils/str";
import { RuleBase, RuleBaseOptions } from "./rule-base";

class NoExtraZerosOptions implements RuleBaseOptions {}

export default class NoExtraZeros extends RuleBase<RuleBaseOptions> {
    constructor(options: NoExtraZerosOptions) {
        super(options);
    }

    apply(item: Zotero.Item): Zotero.Item | Promise<Zotero.Item> {
        const checkFields: Zotero.Item.ItemField[] = ["pages", "issue", "volume"];
        checkFields.forEach((fieldName) => {
            const fieldValue = String(item.getField(fieldName));
            const newFieldValue = removeLeadingZeros(fieldValue);
            item.setField(fieldName, newFieldValue);
        });

        return item;
    }
}
