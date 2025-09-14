import { getString } from "../../utils/locale";
import { isStringMatchStringInArray } from "../../utils/str";
import { defineRule } from "./rule-base";

const publisherUrlKeyWords = ["arxiv.org", "biorxiv.org", "medrxiv.org", "chinaxiv.org"];

export const NoJournalPreprint = defineRule({
  id: "no-journal-preprint",
  scope: "item",
  targetItemTypes: ["journalArticle"],
  async apply({ item, report }) {
    const url = item.getField("url");
    if (typeof url === "string" && url !== "" && isStringMatchStringInArray(url, publisherUrlKeyWords)) {
      // show alart todo: 对话框完善，通过 URL 获取 DOI 并通过 DOI 强制更新条目类别
      report({
        level: "warning",
        message: getString("NoPreprintJournalArticle-warning"),
      });
    }
  },
});
