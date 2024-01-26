import { RuleBase, RuleBaseOptions } from "../../utils/rule-base";
import { toSentenceCase } from "../../utils/str";

class TitleSentenceCaseOptions implements RuleBaseOptions {}

export default class TitleSentenceCase extends RuleBase<TitleSentenceCaseOptions> {
    constructor(options: TitleSentenceCaseOptions) {
        super(options);
    }

    apply(item: Zotero.Item): Zotero.Item {
        let title = item.getField("title", false, true) as string;
        title = item.getField("language").includes("zh") ? title : toSentenceCase(title);
        item.setField("title", title);
        return item;
    }
}
