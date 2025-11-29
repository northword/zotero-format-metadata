import { convert as quote } from "quote-quote";
import { getPref } from "../../utils/prefs";
import { defineRule } from "./rule-base";

/**
 * Normalize hyphen-like characters to hyphen-minus U+002D
 * Includes: HYPHEN (U+2010), NON-BREAKING HYPHEN (U+2011), FIGURE DASH (U+2012),
 * HORIZONTAL BAR (U+2015), FULLWIDTH HYPHEN-MINUS (U+FF0D), MINUS SIGN (U+2212)
 */
export function normalizeHyphens(text: string): string {
  const hyphenPattern = /[\u2010\u2011\u2012\u2015\uFF0D\u2212]/g;
  return text.replace(hyphenPattern, "-");
}

export function convertQuotesToCurly(text: string): string {
  return quote(text);
}

/**
 * Normalize interpunct-like characters to MIDDLE DOT U+00B7
 * Covers common variants: KATAKANA MIDDLE DOT (U+30FB), HALFWIDTH KATAKANA MIDDLE DOT (U+FF65),
 * DOT OPERATOR (U+22C5), BULLET OPERATOR (U+2219), BULLET (U+2022)
 *
 * {@link https://github.com/l0o0/translators_CN/issues/257 | Context}
 */
export function normalizeInterpuncts(text: string): string {
  const interpunctPattern = /[\u30FB\uFF65\u22C5\u2219\u2022]/g;
  return text.replace(interpunctPattern, "\u00B7");
}

/** ================================================================================= */

/**
 * Rule: normalize punctuation in title
 *
 * @see https://github.com/northword/zotero-format-metadata/issues/337
 */
export const CorrectTitlePunctuation = defineRule({
  id: "correct-title-punctuation",
  scope: "field",
  targetItemField: "title",
  includeMappedFields: true,
  fieldMenu: {
    l10nID: "rule-correct-title-punctuation-menu-field",
  },
  apply({ item, debug }) {
    const title = item.getField("title", false, true);
    if (!title)
      return;

    let newTitle = normalizeHyphens(title);
    if (getPref("rule.correct-title-punctuation.quotes")) {
      newTitle = convertQuotesToCurly(title);
      debug("Converted quotes to curly");
    }

    if (newTitle !== title) {
      debug("Normalized hyphens");
      item.setField("title", newTitle);
    }
  },
});

/**
 * Rule: normalize punctuation in creators
 *
 * @see https://github.com/northword/zotero-format-metadata/issues/337
 */
export const CorrectCreatorsPunctuation = defineRule({
  id: "correct-creators-punctuation",
  scope: "field",
  targetItemField: "creators",
  apply({ item, debug }) {
    const creators = item.getCreators();
    if (!creators || creators.length === 0)
      return;

    let changed = false;
    for (const creator of creators) {
      if (creator.firstName) {
        let nf = normalizeHyphens(creator.firstName);
        nf = normalizeInterpuncts(nf);
        if (nf !== creator.firstName) {
          creator.firstName = nf;
          changed = true;
        }
      }
      if (creator.lastName) {
        let nl = normalizeHyphens(creator.lastName);
        nl = normalizeInterpuncts(nl);
        if (nl !== creator.lastName) {
          creator.lastName = nl;
          changed = true;
        }
      }
    }
    if (changed) {
      debug("Normalized hyphens");
      item.setCreators(creators);
    }
  },
});
