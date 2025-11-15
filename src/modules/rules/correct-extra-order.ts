import { defineRule } from "./rule-base";

export const CorrectExtraOrder = defineRule({
  id: "correct-extra-order",
  scope: "field",
  targetItemField: "extra",
  fieldMenu: {
    l10nID: "rule-correct-extra-order-menu-field",
  },
  apply({ item }) {
    const zoteroFields = (Zotero.ItemFields.getAll() as { id: number; name: string }[]).map(f => f.name);
    const extraFields = ztoolkit.ExtraField.getExtraFields(item);
    const newExtraFields = sortExtraFieldMap(extraFields, zoteroFields);
    ztoolkit.ExtraField.replaceExtraFields(item, newExtraFields, { save: false });
  },
});

export function sortExtraFieldMap(
  input: Map<string, string[]>,
  zoteroFields: string[] = [],
): Map<string, string[]> {
  const isCitationKey = (key: string) => key.toLowerCase() === "citation key" || key.toLowerCase() === "citation-key";
  const isOriginalField = (key: string) => key.toLowerCase().startsWith("original-");

  const entries = Array.from(input.entries());
  const collator = new Intl.Collator("en", { sensitivity: "base" });

  entries.sort(([keyA], [keyB]) => {
    const a = keyA.toLowerCase();
    const b = keyB.toLowerCase();

    // 1️⃣ citation key first
    const aIsCitation = isCitationKey(keyA);
    const bIsCitation = isCitationKey(keyB);
    if (aIsCitation && !bIsCitation)
      return -1;
    if (!aIsCitation && bIsCitation)
      return 1;

    // 2️⃣ Zotero build-in fields
    const aIsZotero = zoteroFields.some(f => f.toLowerCase() === keyA.toLowerCase());
    const bIsZotero = zoteroFields.some(f => f.toLowerCase() === keyB.toLowerCase());
    if (aIsZotero && !bIsZotero)
      return -1;
    if (!aIsZotero && bIsZotero)
      return 1;

    if (aIsZotero && bIsZotero) {
      if (a === "type" && b !== "type")
        return -1;
      if (b === "type" && a !== "type")
        return 1;
      return collator.compare(a, b);
    }

    // 3️⃣ Start with original-
    const aIsOriginal = isOriginalField(keyA);
    const bIsOriginal = isOriginalField(keyB);
    if (aIsOriginal && !bIsOriginal)
      return -1;
    if (!aIsOriginal && bIsOriginal)
      return 1;

    // 4️⃣ __nonStandard__ keep last
    if (keyA === "__nonStandard__" || keyB === "__nonStandard__")
      return -1;

    // 5️⃣ Others, alphabeti
    return collator.compare(keyA, keyB);
  });

  return new Map(entries);
}
