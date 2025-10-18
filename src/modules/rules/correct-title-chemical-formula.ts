import { chemElements as ELEMENTS } from "./correct-title-sentence-case";
import { defineRule } from "./rule-base";

export const CorrectTitleChemicalFormula = defineRule({
  id: "correct-title-chemical-formula",
  scope: "field",
  targetItemTypes: ["journalArticle", "conferencePaper", "preprint"],
  targetItemField: "title",
  apply({ item }) {
    const title = item.getField("title");
    const newTitle = formatChemicalFormula(title);
    item.setField("title", newTitle);
  },
});

export function formatChemicalFormula(input: string): string {
  // If string already has markup, we believe that it is already formatted
  if (/<[^>]+>/.test(input))
    return input;

  const parts = input.split(/(\s+)/);
  return parts.map((part) => {
    // Keep space
    if (/^\s+$/.test(part))
      return part;

    return formatPart(part);
  }).join("");
}

export function containsValidElementsOnly(s: string): boolean {
  const letters = s.match(/[A-Z][a-z]*/g);

  if (!letters)
    return false;

  for (const letter of letters) {
    if (!ELEMENTS.includes(letter))
      return false;
  }

  return true;
}

export function formatPart(s: string): string {
  // If string is a prue letter, no number or +/-, return
  if (/^[a-z]*$/i.test(s))
    return s;

  // If one or more letters is not chemical element, return,
  // we do this here, so that we can use /[a-z]/i for element match following
  if (!containsValidElementsOnly(s))
    return s;

  // -----------------------------------------------------
  // Now, we believe that this string needs to be process
  // -----------------------------------------------------

  // In all case, we do not process Mass Number (14C -> ¹⁴C) and Atomic Number (6C -> ₆C),
  // we only process Charge Number and Stoichiometric Number

  // Charge Number - (+1) or (-1), end with +/-
  // Na+ -> Na<sup>+</sup>
  const oxOneRe = /([a-z])([+-])$/gi;
  if (oxOneRe.test(s))
    return s.replace(oxOneRe, (_m, el, sign) => `${el}<sup>${sign}</sup>`);

  // Charge Number - regular
  // Ce3+ -> Ce<sup>3+</sup>
  const oxInlineRe = /([a-z])(\d+(?:\.\d+)?[+-])/gi;
  if (oxInlineRe.test(s))
    return s.replace(oxInlineRe, (_m, el, val) => `${el}<sup>${val}</sup>`);

  // Charge Number - with ()
  // Ce(3+) -> Ce<sup>3+</sup>
  const oxParenRe = /([a-z])\(\s*(\d+(?:\.\d+)?[+-])\s*/gi;
  if (oxParenRe.test(s))
    return s.replace(oxParenRe, (_m, el, val) => `${el}<sup>${val}</sup>`);

  // Stoichiometric Number - CNKI/TeX style
  // Co_3O_4 -> Co<sub>3</sub>O<sub>4</sub>
  const subUnderscoreRe = /([a-z])_(\d+(?:\.\d+)?)/gi;
  if (subUnderscoreRe.test(s))
    return s.replace(subUnderscoreRe, (_m, el, num) => `${el}<sub>${num}</sub>`);

  // Stoichiometric Number - after ()
  // (NH4)2 -> (NH4)<sub>2</sub>
  s = s.replace(/\)(\d+(?:\.\d+)?)/g, ")<sub>$1</sub>");

  // Stoichiometric Number - regular
  // H2O, CO2, O2, Co3O4, Mn0.1Co2.9O4
  const subInlineRe = /([a-z])(\d+(?:\.\d+)?)(?![+-])/gi;
  if (subInlineRe.test(s))
    return s.replace(subInlineRe, (_m, el, num) => `${el}<sub>${num}</sub>`);

  return s;
}
