import type { Data } from "../../utils/data-loader";
import { DataLoader } from "../../utils/data-loader";
import { normalizeKey } from "../../utils/str";
import { defineRule } from "./rule-base";

export const CorrectPublicationTitleAlias = defineRule({
  id: "correct-publication-title-alias",
  scope: "field",

  targetItemTypes: ["journalArticle"],
  targetItemField: "publicationTitle",
  async apply({ item, debug }) {
    const publicationTitle = item.getField("publicationTitle", false, true) as string;
    const data = await DataLoader.load("journalAbbr");

    const publicationTitleDisambiguation = getPublicationTitleDisambiguation(publicationTitle, data);
    if (publicationTitleDisambiguation && publicationTitleDisambiguation !== publicationTitle) {
      debug(`Found alias for ${publicationTitle} -> ${publicationTitleDisambiguation}`);
      item.setField("publicationTitle", publicationTitleDisambiguation);
    }
  },
});

function getPublicationTitleDisambiguation(publicationTitle: string, data: Data) {
  const normalizedInputKey = normalizeKey(publicationTitle);

  for (const originalKey of Object.keys(data)) {
    const normalizedOriginalKey = normalizeKey(originalKey);

    if (normalizedInputKey === normalizedOriginalKey) {
      return originalKey;
    }
  }
  return false;
}
