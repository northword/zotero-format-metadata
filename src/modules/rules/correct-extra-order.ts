import { defineRule } from "./rule-base";

export const CorrectExtraOrder = defineRule({
  id: "correct-extra-order",
  scope: "field",
  targetItemField: "extra",
  apply({ item }) {
    ztoolkit.ExtraField.getExtraFields(item);
  },
});
