import { useDialog } from "../../utils/dialog";
import { getPinyin, getSurnamePinyin, splitChineseName } from "../../utils/pinyin";
import { capitalizeFirstLetter } from "../../utils/str";
import { splitPinyin } from "./correct-creators-pinyin";
import { CorrectExtraOrder } from "./correct-extra-order";
import { defineRule } from "./rule-base";

interface Options {
  data?: Record<string, string[]>;
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

  async apply({ item, options, debug, report }) {
    const existingFields = ztoolkit.ExtraField.getExtraFields(item);
    for (const [key, value] of Object.entries(options.data ?? {})) {
      existingFields.set(key, value);
    }
    ztoolkit.ExtraField.replaceExtraFields(item, existingFields, { save: false });
    CorrectExtraOrder.apply({ item, options, debug, report });
  },

  async prepare({ items, debug }) {
    if (items.length !== 1)
      throw new Error("This function only supports a single item.");

    const item = items[0];

    // ----- Constants -----
    // const Zotero_CREATOR_TYPE_TO_CSL_CREATOR_TYPE = Zotero.Schema.CSL_NAME_MAPPINGS as Record<string, string>;
    // const CSL_CREATOR_TYPES_TO_ZOTERO_CREATOR_TYPES = invert(Zotero_CREATOR_TYPE_TO_CSL_CREATOR_TYPE);
    // const ZOTERO_CREATOR_TYPES = Object.keys(Zotero_CREATOR_TYPE_TO_CSL_CREATOR_TYPE);
    // const CSL_CREATOR_TYPES = Object.values(Zotero_CREATOR_TYPE_TO_CSL_CREATOR_TYPE);

    const ZOTERO_FIELD_TO_CSL_FIELD = Zotero.Schema.CSL_FIELD_MAPPINGS_REVERSE as Record<string, string>;
    const CSL_FIELD_TO_ZOTERO_FIELDS = Zotero.Schema.CSL_TEXT_MAPPINGS as Record<string, string[]>;
    // 英文刊名缩写建议使用 `original-container-title-short` 字段而不是 `original-journalAbbreviation`。
    ZOTERO_FIELD_TO_CSL_FIELD.journalAbbreviation = "container-title-short";
    CSL_FIELD_TO_ZOTERO_FIELDS["container-title-short"] = ["journalAbbreviation"];

    // ----- Step 1: Extract existing original metadata -----
    const extraFields = ztoolkit.ExtraField.getExtraFields(item);
    const originalFields: Map<string, string[]> = new Map();

    extraFields.forEach((value, key) => {
      if (key.startsWith("original-"))
        originalFields.set(key, value);
    });
    debug("existingExtra", originalFields);

    // ----- Step 2: Prepare creator translations -----
    const creators = item.getCreators()
      .filter(c => c.creatorTypeID === Zotero.CreatorTypes.getID("author"))
      .map((creator) => {
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

        return `${lastName} || ${firstName}`;
      });

    if (!originalFields.has("original-author"))
      originalFields.set("original-author", creators);

    debug("originalCreators after apply item's creators", originalFields);

    // ----- Step 3: Prepare field translations -----
    const candidateFields = [
      "original-container-title",
      "original-container-title-short", // 期刊缩写
      "original-event-place", //  会议地点
      "original-event-title", //  会议名称
      "original-genre", //  学位论文类型，例如如 `Doctoral dissertation`
      "original-jurisdiction", // 专利国别，例如如 `CN`
      "original-publisher",
      "original-publisher-place",
      "original-title",
    ]
      .flatMap(f => CSL_FIELD_TO_ZOTERO_FIELDS[f.replace("original-", "")])
      .filter(f => !!f)
      .filter(f => Zotero.ItemFields.isValidForType(Zotero.ItemFields.getID(f), item.itemTypeID)); ;

    for (const field of candidateFields) {
      const value = item.getField(field);
      const cslField = ZOTERO_FIELD_TO_CSL_FIELD[field];
      if (!cslField)
        continue;

      const key = `original-${cslField}`;
      if (!originalFields.has(key)) {
        originalFields.set(key, [value]);
      }
    }

    debug("originalFields after apply item's fields", originalFields);

    // ----- Step 4: Open dialog and collect results -----
    const { dialog, open } = useDialog<Record<string, string>>();

    function addField(key: string) {
      debug("adding", key);

      const value = (originalFields.get(key) ?? []).join("\n");
      switch (key) {
        case "original-author": {
          const label = Zotero.CreatorTypes.getLocalizedString("author");
          dialog.addSetting(label, key, {
            tag: "textarea",
            properties: { textContent: value, rows: 5 },
          })
            .addStaticRow("", {
              tag: "label",
              properties: {
                textContent: "说明：作者每行一个，姓与名使用 `||` 分隔。",
              },
            })
            .addStaticRow("", {
              tag: "div",
              namespace: "html",
              styles: {
                display: "flex",
                justifyContent: "space-between",
              },
              children: [
                {
                  tag: "button",
                  namespace: "html",
                  attributes: {
                    type: "button",
                  },
                  properties: {
                    innerHTML: "拆分名拼音",
                  },
                  listeners: [{
                    type: "click",
                    listener: () => {
                      const textarea = dialog.window.document.querySelector("[data-setting-key='original-author']") as HTMLTextAreaElement;
                      if (!textarea)
                        return;
                      const value = textarea.value || "";
                      const newValue = value.split("\n").map((line) => {
                        const [lastName, firstName] = line.split("||").map(s => s.trim());
                        const newFirstName = splitPinyin(firstName);
                        return `${lastName} || ${newFirstName}`;
                      }).join("\n");

                      textarea.value = newValue;
                    },
                  }],
                },

                {
                  tag: "button",
                  namespace: "html",
                  attributes: {
                    type: "button",
                  },
                  properties: {
                    innerHTML: "合并名拼音",
                  },
                  listeners: [{
                    type: "click",
                    listener: () => {
                      const textarea = dialog.window.document.querySelector("[data-setting-key='original-author']") as HTMLTextAreaElement;
                      if (!textarea)
                        return;
                      const value = textarea.value || "";
                      const newValue = value.split("\n").map((line) => {
                        const [lastName, firstName] = line.split("||").map(s => s.trim());
                        const newFirstName = capitalizeFirstLetter(firstName.replaceAll(" ", ""));
                        return `${lastName} || ${newFirstName}`;
                      }).join("\n");

                      textarea.value = newValue;
                    },
                  }],
                },

              ],
            });
          break;
        }

        case "original-title": {
          const label = Zotero.ItemFields.getLocalizedString("title");
          dialog.addSetting(label, key, {
            tag: "textarea",
            properties: { textContent: value, rows: 5 },
          });
          break;
        }

        default: {
          const zoteroField: string | undefined = CSL_FIELD_TO_ZOTERO_FIELDS[key.replace("original-", "")]
            ?.filter(k => Zotero.ItemFields.isValidForType(Zotero.ItemFields.getID(k), item.itemTypeID))?.[0];

          if (zoteroField) {
            const label = Zotero.ItemFields.getLocalizedString(zoteroField!);
            dialog.addSetting(label, key, {
              tag: "input",
              properties: { value },
            });
          }
          else {
            dialog.addSetting(key, key, {
              tag: "input",
              properties: { value },
            }).addStaticRow("", {
              tag: "label",
              properties: {
                textContent: "Seems a invalid field",
              },
            });
          }
          break;
        }
      }
    }

    addField("original-title");
    originalFields.delete("original-title");
    addField("original-author");
    originalFields.delete("original-author");
    originalFields.keys().forEach(addField);

    const result = await open("CSL Helper");
    if (!result)
      return false;

    const outputData: Record<string, string[]> = {};
    for (const [key, value] of Object.entries(result)) {
      const isCreatorField = key === "original-author";
      outputData[key] = isCreatorField
        // in dialog, we use `\n` to separate creators,
        // but in extra fields, we use `||`
        ? value.split("\n").map(v => v.trim()).filter(v => !!v)
        // in dialog, some fields are multiline for better display,
        // but they are stored as single line, e.g. title
        : [value.replace("\n", "")].filter(v => !!v);
    }

    return { data: outputData };
  },
});
