import { defineRule } from "./rule-base";

export const NewRuleID = defineRule({
  id: "no-rule-id",
  scope: "field",
  targetItemTypes: ["journalArticle"],
  targetItemField: "title",
  apply({ item, debug, report }) {
    // Get a field value
    const title = item.getField("title");

    // Set a field value
    const newTitle = "New Title";
    item.setField("title", newTitle);

    // Debug
    debug(`We changed the title from ${title} to ${newTitle}`);

    // Report a warn or error to lint result dialog
    report({
      message: "This is a new rule",
    });
  },
});
