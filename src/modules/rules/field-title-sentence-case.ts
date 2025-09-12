import { useData } from "../../utils/data-loader";
import { getPref } from "../../utils/prefs";
import { convertToRegex, toSentenceCase } from "../../utils/str";
import { defineRule } from "./rule-base";

function createSentenceCaseRule(targetField: "title" | "shortTitle") {
  return defineRule({
    id: "title-should-sentence-case",
    type: "field",
    targetItemFields: [targetField],

    async apply({ item, debug }) {
      const lang = item.getField("language");
      let title = item.getField(targetField, false, true);
      title = lang.match("zh") ? title : toSentenceCase(title, lang);

      const customTermFilePath = getPref("title.customTermPath");
      if (customTermFilePath) {
        const data = await useData("csv", customTermFilePath, {
          headers: ["search", "replace"],
        });

        data.forEach((term) => {
          const search = convertToRegex(term.search);
          if (search.test(title)) {
            title = title.replace(search, term.replace);
            debug(`[title] Hit custom term: `, search);
          }
        });
      }

      item.setField(targetField, title);
    },
  });
}

export const TitleShouldSentenceCase = createSentenceCaseRule("title");
export const ShortTitleShouldSentenceCase = createSentenceCaseRule("shortTitle");
