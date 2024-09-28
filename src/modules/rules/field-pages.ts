import { RuleBase, RuleBaseOptions } from "./rule-base";

class PagesConnectorOptions implements RuleBaseOptions {}

export class PagesConnector extends RuleBase<RuleBaseOptions> {
    constructor(options: PagesConnectorOptions) {
        super(options);
    }

    apply(item: Zotero.Item): Zotero.Item | Promise<Zotero.Item> {
        const pages = item.getField("pages");
        const newPages = pages.replace(/~/g, "-").replace(/\+/g, ", ");
        item.setField("pages", newPages);
        return item;
    }
}
