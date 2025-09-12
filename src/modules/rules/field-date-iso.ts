import { defineRule } from "./rule-base";

export const DataShouldInISOFormat = defineRule({
  id: "data-should-in-iso-format",
  type: "field",
  targetItemFields: ["date"],

  apply({ item }) {
    const oldDate = item.getField("date") as string;
    const newDate = Zotero.Date.strToISO(oldDate);
    if (newDate)
      item.setField("date", newDate);
    return item;
  },
});
