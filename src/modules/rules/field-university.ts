import { defineRule } from "./rule-base";

export const UniversityShouldValid = defineRule({
  id: "university",
  type: "field",
  targetItemTypes: ["thesis"],
  targetItemFields: ["university"],
  apply({ item }) {
    const language = item.getField("language");
    let university = item.getField("university");

    university = language.includes("zh") ? university.replace("(", "（").replace(")", "）") : university;

    item.setField("university", university);
  },
});
