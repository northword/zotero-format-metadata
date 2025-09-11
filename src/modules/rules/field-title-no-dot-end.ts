import { defineRule } from "./rule-base";

/**
 * Replaces dot in title end
 * @see https://github.com/northword/zotero-format-metadata/issues/213
 */
export const NoDotEndTitle = defineRule({
  id: "no-title-end-dot",
  type: "field",
  targetItemFields: ["title"],
  async apply({ item }) {
    const title = item.getField("title", false, true) as string;
    const newTitle = title.replace(/(.*)\.$/g, "$1");
    item.setField("title", newTitle);
  },
});
