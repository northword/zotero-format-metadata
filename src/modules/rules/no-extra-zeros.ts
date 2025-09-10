import type { Rule } from "./rule-base";
import { removeLeadingZeros } from "../../utils/str";

type Field = "pages" | "issue" | "volume";

function createRule(field: Field): Rule {
  return {
    nameKey: "rule.no-extra-zeros.name",
    type: "field",
    targetItemTypes: "all",
    targetItemFields: [field],
    apply: (item) => {
      const checkFields: _ZoteroTypes.Item.ItemField[] = ["pages", "issue", "volume"];
      checkFields.forEach((fieldName) => {
        const fieldValue = String(item.getField(fieldName));
        const newFieldValue = removeLeadingZeros(fieldValue);
        item.setField(fieldName, newFieldValue);
      });

      return item;
    },
  };
}

export const NoExtraZerosInPages = createRule("pages");
