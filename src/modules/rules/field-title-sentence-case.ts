import { useData } from "../../utils/data-loader";
import { getPref } from "../../utils/prefs";
import { convertToRegex, toSentenceCase } from "../../utils/str";
import { defineRule } from "./rule-base";

function createSentenceCaseRule(targetField: "title" | "shortTitle") {
  return defineRule({
    id: "title-should-sentence-case",
    type: "field",
    targetItemFields: [targetField],

    async apply({ item }) {
      const lang = item.getField("language");
      let title = item.getField(targetField, false, true) as string;
      title = lang.match("zh") ? title : toSentenceCase(title, lang);

      // const isLintShortTitle = getPref("title.shortTitle");
      // let shortTitle = item.getField("shortTitle", false, true) as string;
      // if (isLintShortTitle) {
      //   shortTitle = lang.match("zh") ? shortTitle : toSentenceCase(shortTitle, lang);
      // }

      const customTermFilePath = getPref("title.customTermPath") as string;
      if (customTermFilePath) {
        const data = await useData("csv", customTermFilePath, {
          headers: ["search", "replace"],
        });
        // this.debug(`[title] Custom terms:`, data, typeof data);

        data.forEach((term) => {
          const search = convertToRegex(term.search);
          if (search.test(title)) {
            title = title.replace(search, term.replace);
            // this.debug(`[title] Hit custom term: `, search);
            // if (isLintShortTitle) {
            //   shortTitle = shortTitle.replace(search, term.replace);
            // }
          }
        });
      }

      item.setField(targetField, title);
      // if (isLintShortTitle)
      //   item.setField("shortTitle", shortTitle);
    },
  });
}

export const TitleShouldSentenceCase = createSentenceCaseRule("title");
export const ShortTitleShouldSentenceCase = createSentenceCaseRule("shortTitle");
