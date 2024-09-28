import { RuleBase, RuleBaseOptions } from "./rule-base";

class Options implements RuleBaseOptions {}

/**
 * Replaces dot in title end
 * @see https://github.com/northword/zotero-format-metadata/issues/213
 */
export default class TitleGuillemet extends RuleBase<Options> {
    constructor(options: Options) {
        super(options);
    }

    apply(item: Zotero.Item): Zotero.Item | Promise<Zotero.Item> {
        const title = item.getField("title", false, true) as string;
        const newTitle = title.replace(/.*\.$/g, "");
        item.setField("title", newTitle);
        return item;
    }
}
