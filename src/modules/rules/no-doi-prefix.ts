import { defineRule } from "./rule-base";

export const NoDOIPrefix = defineRule({
  id: "no-doi-prefix",
  scope: "field",
  targetItemField: "DOI",

  apply({ item }) {
    const doi = item.getField("DOI");
    if (doi && typeof doi === "string") {
      const cleandDOI = Zotero.Utilities.cleanDOI(doi);
      if (cleandDOI)
        item.setField("DOI", cleandDOI);
    }
  },

  fieldMenu: {
    l10nID: "rule-no-doi-prefix-menu-field",
  },
});
