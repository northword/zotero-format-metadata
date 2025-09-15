import { defineRule } from "./rule-base";

const list = [
  "null",
  "undefined",
  "NaN",
  "n/a",
  "N/A",
  "n.a.",
  "no value",
  "无",
];

export const NoNullishValue = defineRule({
  id: "no-nullish-value",
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
