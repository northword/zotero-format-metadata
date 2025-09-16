import { defineRule } from "./rule-base";

export const CorrectUniversityPunctuation = defineRule({
  id: "correct-university-punctuation",
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
