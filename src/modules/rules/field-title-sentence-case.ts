import type { RuleBaseOptions } from "./rule-base";
import { useData } from "../../utils/data-loader";
import { getPref } from "../../utils/prefs";
import { convertToRegex, toSentenceCase } from "../../utils/str";
import { RuleBase } from "./rule-base";

class TitleSentenceCaseOptions implements RuleBaseOptions {}

export class TitleSentenceCase extends RuleBase<TitleSentenceCaseOptions> {
  constructor(options: TitleSentenceCaseOptions) {
    super(options);
  }

  async apply(item: Zotero.Item): Promise<Zotero.Item> {
    const lang = item.getField("language");
    let title = item.getField("title", false, true) as string;
    title = lang.match("zh") ? title : toSentenceCase(title, lang);

    const isLintShortTitle = getPref("title.shortTitle");
    let shortTitle = item.getField("shortTitle", false, true) as string;
    if (isLintShortTitle) {
      shortTitle = lang.match("zh") ? shortTitle : toSentenceCase(shortTitle, lang);
    }

    const customTermFilePath = getPref("title.customTermPath") as string;
    if (customTermFilePath) {
      const data = await useData("csv", customTermFilePath, {
        headers: ["search", "replace"],
      });
      ztoolkit.log(`[title] Custom terms:`, data, typeof data);

      data.forEach((term) => {
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
    if (isLintShortTitle)
      item.setField("shortTitle", shortTitle);
    return item;
  }
}
