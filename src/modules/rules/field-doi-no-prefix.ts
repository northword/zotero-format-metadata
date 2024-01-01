import { RuleBase, RuleBaseOptions } from "../../utils/rule-base";

class RemoveDOIPrefixOptions implements RuleBaseOptions {}

export default class RemoveDOIPrefix extends RuleBase<RemoveDOIPrefixOptions> {
    constructor(options: RemoveDOIPrefixOptions) {
        super(options);
    }

    apply(item: Zotero.Item): Zotero.Item {
        const doi = item.getField("DOI");
        if (doi && typeof doi == "string") {
            const cleandDOI = Zotero.Utilities.cleanDOI(doi);
            cleandDOI ? item.setField("DOI", cleandDOI) : "pass";
        }
        return item;
    }
}
