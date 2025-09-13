import { useData } from "../../utils/data-loader";
import { getPref } from "../../utils/prefs";
import { convertToRegex, toSentenceCase } from "../../utils/str";
import { defineRule } from "./rule-base";

interface Options {
  data?: any[];
}

function createSentenceCaseRule(targetField: "title" | "shortTitle") {
  return defineRule<Options>({
    id: "title-should-sentence-case",
    type: "field",
    targetItemFields: [targetField],

    async apply({ item, options, debug }) {
      const lang = item.getField("language");
      let title = item.getField(targetField, false, true);
      title = lang.match("zh") ? title : toSentenceCase(title, lang);

      const data = options.data;
      if (data) {
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

    async getOptions() {
      const customTermFilePath = getPref("title.customTermPath");
      if (customTermFilePath) {
        return {
          data: await useData("csv", customTermFilePath, {
            headers: ["search", "replace"],
          }),
        };
      }
      else {
        return {};
      }
    },
  });
}

export const TitleShouldSentenceCase = createSentenceCaseRule("title");
export const ShortTitleShouldSentenceCase = createSentenceCaseRule("shortTitle");
