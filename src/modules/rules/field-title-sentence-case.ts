import { getPref } from "../../utils/prefs";
import { convertToRegex, toSentenceCase } from "../../utils/str";
import { RuleBase, RuleBaseOptions } from "./rule-base";
import csv from "csvtojson";

class TitleSentenceCaseOptions implements RuleBaseOptions {}

export default class TitleSentenceCase extends RuleBase<TitleSentenceCaseOptions> {
    constructor(options: TitleSentenceCaseOptions) {
        super(options);
    }

    async apply(item: Zotero.Item): Promise<Zotero.Item> {
        let title = item.getField("title", false, true) as string;
        title = item.getField("language").match("zh") ? title : toSentenceCase(title);

        const customTermFilePath = getPref("title.customTermPath") as string;
        if (customTermFilePath) {
            const fileContent = (await Zotero.File.getContentsAsync(customTermFilePath)) as string;
            const resolvedTerms = await csv({
                delimiter: "auto",
                trim: true,
                noheader: true,
                headers: ["search", "replace"],
            }).fromString(fileContent);
            ztoolkit.log(`[title] Custom terms:`, resolvedTerms);

            resolvedTerms.forEach((term) => {
                const search = convertToRegex(term.search);
                if (search.test(title)) {
                    title = title.replace(search, term.replace);
                    ztoolkit.log(`[title] Hit custom term: `, search);
                }
            });
        }

        item.setField("title", title);
        return item;
    }
}
