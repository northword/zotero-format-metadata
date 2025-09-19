import { defineRule } from "./rule-base";

/**
 * Store the main title (before the colon) in the Short Title field
 *
 * @see https://www.zotero.org/support/kb/sentence_casing#sentence_case_and_subtitles
 */
export const RequireShortTitle = defineRule({
  id: "require-short-title",
  scope: "field",
  targetItemField: "shortTitle",
  apply: ({ item, debug }) => {
    const title = item.getField("title");
    if (!title) {
      return;
    }

    if (!title.includes(": ")) {
      debug("No colon found in title, may no need to store the main title in shortTitle field.");
      return;
    }

    // Since the plugin cannot handle titles containing
    // multiple colons and dashes accurately, skip items
    // that already include a shortTitle.
    const shortTitle = item.getField("shortTitle");
    if (shortTitle && title.startsWith(shortTitle)) {
      debug("shortTitle field already contains the main title, skip.");
      return;
    }

    const newshortTitle = getShortTitle(title);
    item.setField("shortTitle", newshortTitle);
  },
});

export function getShortTitle(title: string) {
  return title.split(": ")[0];
}
