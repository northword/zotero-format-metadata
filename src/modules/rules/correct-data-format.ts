import { defineRule } from "./rule-base";

export const CorrectDataFormat = defineRule({
  id: "correct-data-format",
  scope: "field",
  targetItemField: "date",

  apply({ item }) {
    const oldDate = item.getField("date") as string;
    const newDate = Zotero.Date.strToISO(oldDate);
    if (newDate)
      item.setField("date", newDate);
  },
});
