import { invert } from "es-toolkit";
import { useDialog } from "../../utils/dialog";
import { getPinyin, getSurnamePinyin, splitChineseName } from "../../utils/pinyin";
import { defineRule } from "./rule-base";

interface Options {
  data?: Record<string, string>;
}

/**
 * Some publishers require both CN and EN metadata for CN item.
 * CSL-M supports this feature, but the fully translated metadata must be stored in `extra`.
 *
 * For example (e.g., 心理学报):
 * Chinese documents should include English translations of author names, title, journal, publisher, etc.
 * These go into `extra` under fields like:
 * `original-author`, `original-title`, `original-container-title`, `original-publisher-place`, `original-publisher`.
 */
export const ToolCSLHelper = defineRule<Options>({
  id: "tool-csl-helper",
  scope: "field",
  targetItemField: "extra",
  fieldMenu: {
    l10nID: "rule-tool-csl-helper-menu-field",
  },

  async apply({ item, options }) {
    const extraFields = ztoolkit.ExtraField.getExtraFields(item);
    for (const [key, value] of Object.entries(options.data ?? {})) {
      extraFields.set(key, value);
    }
    await ztoolkit.ExtraField.replaceExtraFields(item, extraFields);
  },

  async prepare({ items, debug }) {
    if (items.length !== 1)
      throw new Error("This function only supports a single item.");

    const item = items[0];

    // ----- Constants -----
    const extraFields = ztoolkit.ExtraField.getExtraFields(item);

    const Zotero_CREATOR_TYPE_TO_CSL_CREATOR_TYPE = Zotero.Schema.CSL_NAME_MAPPINGS as Record<string, string>;
    const CSL_CREATOR_TYPES_TO_ZOTERO_CREATOR_TYPES = invert(Zotero_CREATOR_TYPE_TO_CSL_CREATOR_TYPE);
    const _ZOTERO_CREATOR_TYPES = Object.keys(Zotero_CREATOR_TYPE_TO_CSL_CREATOR_TYPE);
    const CSL_CREATOR_TYPES = Object.values(Zotero_CREATOR_TYPE_TO_CSL_CREATOR_TYPE);

    const ZOTERO_FIELD_TO_CSL_FIELD = Zotero.Schema.CSL_FIELD_MAPPINGS_REVERSE as Record<string, string>;
    const CSL_FIELD_TO_ZOTERO_FIELDS = Zotero.Schema.CSL_TEXT_MAPPINGS as Record<string, string[]>;
    // 英文刊名缩写建议使用 `original-container-title-short` 字段而不是 `original-journalAbbreviation`。
    ZOTERO_FIELD_TO_CSL_FIELD.journalAbbreviation = "container-title-short";
    CSL_FIELD_TO_ZOTERO_FIELDS["container-title-short"] = ["journalAbbreviation"];

    // ----- Step 1: Extract existing original metadata -----
    const originalFields: Map<string, string> = new Map();
    const originalCreators: Map<string, string> = new Map();

    for (const [key, value] of extraFields.entries()) {
      if (!key.startsWith("original-"))
        continue;

      if (CSL_CREATOR_TYPES.includes(key.replace("original-", "")))
        originalCreators.set(key, value);
      else
        originalFields.set(key, value);
    }

    debug("existingExtra", originalFields, originalCreators);

    // ----- Step 2: Prepare creator translations -----
    const creators = item.getCreators();
    const creatorTypeIDs = creators.map(c => c.creatorTypeID);
    for (const creatorTypeID of creatorTypeIDs) {
      const creatorTypeName = Zotero.CreatorTypes.getName(creatorTypeID);
      const cslCreatorType = Zotero_CREATOR_TYPE_TO_CSL_CREATOR_TYPE[creatorTypeName];
      const key = `original-${cslCreatorType}`;

      if (originalCreators.has(key))
        continue;

      const creatorsInThisType = creators.filter(c => c.creatorTypeID === creatorTypeID);
      for (const creator of creatorsInThisType) {
        const isZh = item.getField("language").startsWith("zh");
        let firstName = creator.firstName;
        let lastName = creator.lastName;
        if (creator.fieldMode === 1) {
          [lastName, firstName] = splitChineseName(creator.lastName);
        }
        if (isZh) {
          firstName = getSurnamePinyin(firstName);
          lastName = getPinyin(lastName);
        }

        const fullName = `${lastName} ${firstName}`;

        if (!originalCreators.has(key))
          originalCreators.set(key, fullName);
        else
          originalCreators.set(key, `${originalCreators.get(key)!} || ${fullName}`);
      }
    }

    debug("originalCreators after apply item's creators", originalCreators);

    // ----- Step 3: Prepare field translations -----
    const candidateFields = [
      "title",
      "publicationTitle",
      "journalAbbreviation",
      "place",
      "publisher",
    ].filter(f => Zotero.ItemFields.isValidForType(Zotero.ItemFields.getID(f), item.itemTypeID));

    for (const field of candidateFields) {
      const value = item.getField(field);
      if (!value)
        continue;

      const cslField = ZOTERO_FIELD_TO_CSL_FIELD[field];
      if (!cslField)
        continue;

      const key = `original-${cslField}`;
      if (!originalFields.has(key)) {
        originalFields.set(key, value);
      }
    }

    debug("originalFields after apply item's fields", originalFields);

    // ----- Step 4: Open dialog and collect results -----
    const { dialog, open } = useDialog<Record<string, string>>();
    debug("Creating dialog...");
    dialog.addStaticRow("## Creators", {
      tag: "label",
      properties: {
        textContent: "one name per line",
      },
    });

    for (const [key, value] of originalCreators.entries()) {
      const zoteroCreatorType = CSL_CREATOR_TYPES_TO_ZOTERO_CREATOR_TYPES[key.replace("original-", "")];
      const label = Zotero.CreatorTypes.getLocalizedString(zoteroCreatorType!);
      debug(key, zoteroCreatorType, label);

      dialog.addSetting(label, key, {
        tag: "textarea",
        properties: {
          // we use `\n` to separate creators for better UX
          textContent: value.replace(/\s*\|\|\s*/g, "\n"),
          rows: 5,
        },
      });
    }

    dialog.addStaticRow("## Fields", {
      tag: "label",
    });

    for (const [key, value] of originalFields.entries()) {
      const zoteroField: string = CSL_FIELD_TO_ZOTERO_FIELDS[key.replace("original-", "")]
        .filter(k => Zotero.ItemFields.isValidForType(Zotero.ItemFields.getID(k), item.itemTypeID))?.[0];
      const label = Zotero.ItemFields.getLocalizedString(zoteroField!);
      debug(key, zoteroField, label);

      const isTextarea = key === "original-title";
      dialog.addSetting(label, key, {
        tag: isTextarea ? "textarea" : "input",
        properties: isTextarea
          ? { textContent: value, rows: 3 }
          : { value },
      });
    }

    const result = await open("CSL Helper");
    if (!result)
      return false;

    const outputData: Record<string, string> = {};
    for (const [key, value] of Object.entries(result)) {
      const isCreatorField = CSL_CREATOR_TYPES.includes(key.replace("original-", ""));
      outputData[key] = isCreatorField
        // in dialog, we use `\n` to separate creators,
        // but in extra fields, we use `||`
        ? value.split("\n").map(v => v.trim()).join(" || ")
        // in dialog, some fields are multiline for better display,
        // but they are stored as single line, e.g. title
        : value.replaceAll("\n", "");
    }

    return { data: outputData };
  },
});
