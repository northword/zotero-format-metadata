import { getItemFields } from "../../utils/zotero";
import { defineRule } from "./rule-base";

/**
 * Some plugins use starand fields to store other data,
 * for example, Zotero One uses `shortTitle` to store the translated title,
 * and use `libraryCatalog` to store journal ranks, `callNumber` for IFs.
 * It's very bad, we should clean those fields.
 *
 * @see https://github.com/northword/zotero-format-metadata/issues/49
 * @see https://gitee.com/zotero-chinese/zotero-chinese/issues/I6W1QY
 */
export const NoFieldMisuse = defineRule({
  id: "no-field-misuse",
  scope: "item",
  apply({ item, debug }) {
    const fields = getItemFields(item);

    for (const field of fields) {
      const value = item.getField(field);

      if (value === "")
        continue;

      if (field === "extra")
        continue;

      let cleaned = value;

      switch (field) {
        // Some plugins use shortTitle to store the translated title
        // e.g. Zotero One (by qingning), Translate (old version)
        case "shortTitle":
          if (!value.startsWith(item.getField("title")))
            cleaned = "";
          break;

        case "series":
        case "seriesNumber":
        case "seriesText":
        case "seriesTitle":
        case "archive":
        case "archiveLocation":
        case "archiveID":
        case "rights":
          if (hasEmoji(value)) {
            cleaned = "";
            break;
          }

          // TODO: IFs, journal ranks, citation counts, etc.
          // Bad Zotero One plugin, why not use `extra` field and custom column?
          break;

        default:
          break;
      }

      if (cleaned !== value) {
        debug(`Field ${field} was cleaned from ${value} to ${cleaned}`);
        item.setField(field, cleaned);
      }
    }
  },
});

function hasEmoji(str: string): boolean {
  return !!str.match(/\p{Extended_Pictographic}/u);
}
