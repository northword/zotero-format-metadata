import { defineRule } from "./rule-base";

const list = [
  "null",
  "undefined",
  "NaN",
  "n/a",
  "N/A",
  "n.a.",
  "n/d",
  "N/D",
  "n.d.",
  "no value",
  "无",
];

export const NoValueNullish = defineRule({
  id: "no-value-nullish",
  scope: "item",
  apply({ item }) {
    const fields = Zotero.ItemFields
      .getItemTypeFields(item.itemTypeID)
      .map((id: number) => Zotero.ItemFields.getName(id));

    for (const field of fields) {
      const value = item.getField(field);
      if (list.includes(value)) {
        item.setField(field, "");
      }
    }
  },
});
