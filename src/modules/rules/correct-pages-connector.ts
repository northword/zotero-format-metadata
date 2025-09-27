import { defineRule } from "./rule-base";

export const CorrectPagesConnector = defineRule({
  id: "correct-pages-connector",
  scope: "field",
  targetItemTypes: ["journalArticle"],
  targetItemField: "pages",
  apply({ item }) {
    const pages = item.getField("pages");
    const newPages = normizePages(pages);

    item.setField("pages", newPages);
  },

});

function normizePages(pages: string): string {
  return pages.replace(/~/g, "-").replace(/\+/g, ", ");
}
