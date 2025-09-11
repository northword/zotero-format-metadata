import { defineRule } from "./rule-base";

/**
 * Thesis type
 *
 * 硕士 -> 硕士学位论文;
 * 博士 -> 博士学位论文;
 * Dissertation -> Doctoral dissertation;
 * Ph.D. -> Doctoral dissertation;
 * master -> Master thesis;
 *
 * @see https://github.com/northword/zotero-format-metadata/issues/132
 */
export const ThesisTypeShouldValid = defineRule({
  id: "thesis-type-name",
  type: "field",
  recommended: true,

  targetItemTypes: ["thesis"],
  targetItemFields: ["thesisType"],

  apply({ item }) {
    let type = item.getField("thesisType");
    if (!type)
      return;

    if (type.match("硕士")) {
      type = "硕士学位论文";
    }
    else if (type.match("博士")) {
      type = "博士学位论文";
    }
    else if (type.match(/doctor/i)) {
      type = "Doctoral dissertation";
    }
    else if (type.match(/master/i)) {
      type = "Master thesis";
    }
    else if (type.match(/ph\.? ?d\.?/i)) {
      type = "Doctoral dissertation";
    }
    else {
      type = Zotero.Utilities.sentenceCase(type);
    }

    item.setField("thesisType", type);
  },

});
