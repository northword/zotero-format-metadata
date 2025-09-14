import { useData } from "../../utils/data-loader";
import { getPref } from "../../utils/prefs";
import { convertToRegex, toSentenceCase } from "../../utils/str";
import { defineRule } from "./rule-base";

interface Options {
  data?: any[];
}

function createRequireTitleSentenceCaseRule(targetItemField: "title" | "shortTitle") {
  return defineRule<Options>({
    id: `require-${targetItemField}-sentence-case`,
    scope: "field",
    targetItemField,

    async apply({ item, options, debug }) {
      const lang = item.getField("language");
      let title = item.getField(targetItemField, false, true);
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

      item.setField(targetItemField, title);
    },

    async getOptions() {
      const customTermFilePath = getPref("rule.require-title-sentence-case.custom-term-path");
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

export const RequireTitleSentenceCase = createRequireTitleSentenceCaseRule("title");
export const RequireShortTitleSentenceCase = createRequireTitleSentenceCaseRule("shortTitle");
