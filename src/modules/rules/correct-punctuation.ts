import { convert as quote } from "quote-quote";
import { getPref } from "../../utils/prefs";
import { defineRule } from "./rule-base";

/**
 * Normalize hyphen-like characters to hyphen-minus U+002D
 * Includes: HYPHEN (U+2010), NON-BREAKING HYPHEN (U+2011), FIGURE DASH (U+2012),
 * HORIZONTAL BAR (U+2015), FULLWIDTH HYPHEN-MINUS (U+FF0D), MINUS SIGN (U+2212)
 */
export function normalizeHyphens(text: string): string {
  if (!text)
    return text;
  const hyphenPattern = /[\u2010\u2011\u2012\u2015\uFF0D\u2212]/g;
  return text.replace(hyphenPattern, "-");
}

export function convertQuotesToCurly(text: string): string {
  return quote(text);
}

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
        const nf = normalizeHyphens(creator.firstName);
        if (nf !== creator.firstName) {
          creator.firstName = nf;
          changed = true;
        }
      }
      if (creator.lastName) {
        const nl = normalizeHyphens(creator.lastName);
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
