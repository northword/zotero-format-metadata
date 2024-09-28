import { getPref } from "../../utils/prefs";
import { convertToRegex, toSentenceCase } from "../../utils/str";
import { RuleBase, RuleBaseOptions } from "./rule-base";
import csv from "csvtojson";

class TitleSentenceCaseOptions implements RuleBaseOptions {}

export class TitleSentenceCase extends RuleBase<TitleSentenceCaseOptions> {
    constructor(options: TitleSentenceCaseOptions) {
        super(options);
    }

    async apply(item: Zotero.Item): Promise<Zotero.Item> {
        let title = item.getField("title", false, true) as string;
        title = item.getField("language").match("zh") ? title : toSentenceCase(title);

        const isLintShortTitle = getPref("title.shortTitle");
        let shortTitle = item.getField("shortTitle", false, true) as string;
        if (isLintShortTitle) {
            shortTitle = item.getField("language").match("zh") ? shortTitle : toSentenceCase(shortTitle);
        }

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
                    if (isLintShortTitle) {
                        shortTitle = shortTitle.replace(search, term.replace);
                    }
                }
            });
        }

        item.setField("title", title);
        if (isLintShortTitle) item.setField("shortTitle", shortTitle);
        return item;
    }
}
