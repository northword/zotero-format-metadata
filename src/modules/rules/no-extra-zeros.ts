import { defineRule } from "./rule-base";

export function removeLeadingZeros(input: string): string {
  return input.replace(/\b0+(\d+)/g, "$1");
}

type Field = "pages" | "issue" | "volume";

function createRule(targetItemField: Field) {
  return defineRule({
    id: `no-${targetItemField}-extra-zeros`,
    scope: "field",
    targetItemTypes: ["journalArticle"],
    targetItemField,
    apply: ({ item }) => {
      const fieldValue = String(item.getField(targetItemField));
      const newFieldValue = removeLeadingZeros(fieldValue);
      item.setField(targetItemField, newFieldValue);
    },
  });
}

export const NoPagesExtraZeros = createRule("pages");
export const NoIssueExtraZeros = createRule("issue");
export const NoVolumeExtraZeros = createRule("volume");
