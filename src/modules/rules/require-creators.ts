import { defineRule } from "./rule-base";

export const RequireCreators = defineRule({
  id: "require-creators",
  scope: "field",
  targetItemField: "creators",
  apply({ item, report }) {
    const creators = item.getCreators();
    if (!creators.length) {
      report({
        level: "error",
        message: "Creators is required",
      });
    }
  },
});
