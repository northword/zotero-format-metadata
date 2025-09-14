import { defineRule } from "./rule-base";

export const CorrectUniversity = defineRule({
  id: "correct-university",
  scope: "field",
  targetItemTypes: ["thesis"],
  targetItemField: "university",
  apply({ item }) {
    const language = item.getField("language");
    let university = item.getField("university");

    university = language.includes("zh") ? university.replace("(", "（").replace(")", "）") : university;

    item.setField("university", university);
  },
});
