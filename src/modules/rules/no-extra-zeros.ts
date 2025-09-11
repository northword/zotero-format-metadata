import { defineRule } from "./rule-base";

export function removeLeadingZeros(input: string): string {
  return input.replace(/\b0+(\d+)/g, "$1");
}

type Field = "pages" | "issue" | "volume";

function createRule(field: Field) {
  return defineRule({
    id: `no-extra-zeros-in-${field}`,
    type: "field",
    targetItemTypes: ["journalArticle"],
    targetItemFields: [field],
    apply: ({ item }) => {
      const fieldValue = String(item.getField(field));
      const newFieldValue = removeLeadingZeros(fieldValue);
      item.setField(field, newFieldValue);
    },
  });
}

export const NoExtraZerosInPages = createRule("pages");
export const NoExtraZerosInIssue = createRule("issue");
export const NoExtraZerosInVolume = createRule("volume");
