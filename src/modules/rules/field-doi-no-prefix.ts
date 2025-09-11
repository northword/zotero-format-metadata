import { defineRule } from "./rule-base";

export const NoDOIPrefix = defineRule({
  id: "no-doi-prefix",
  type: "field",
  recommended: true,
  targetItemFields: ["DOI"],

  apply({ item }) {
    const doi = item.getField("DOI");
    if (doi && typeof doi === "string") {
      const cleandDOI = Zotero.Utilities.cleanDOI(doi);
      if (cleandDOI)
        item.setField("DOI", cleandDOI);
    }
    return item;
  },
});
