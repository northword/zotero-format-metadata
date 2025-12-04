import type { TransformedData } from "./services/base-service";
import { useSettingsDialog } from "../../../utils/dialog";
import { getString } from "../../../utils/locale";
import { isFieldValidForItemType } from "../../../utils/zotero";
import { defineRule } from "../rule-base";
import { extractIdentifiers } from "./identifiers";
import { services } from "./services";

interface UpdateMetadataOption {
  mode: "selected" | "blank" | "all";
  allowTypeChanged: boolean;
  // lint: boolean;
}

export const ToolUpdateMetadata = defineRule<UpdateMetadataOption>({
  id: "tool-update-metadata",
  scope: "item",
  targetItemTypes: ["journalArticle", "preprint", "conferencePaper", "webpage"],
  category: "tool",
  cooldown: 0,
  async apply({ item, options, report, debug }) {
    // 1. extract identifiers
    const identifiers = extractIdentifiers(item);
    debug("Identifiers: ", identifiers);
    if (Object.entries(identifiers).length === 0) {
      report({
        level: "error",
        message: "No valid identifiers found",
      });
      return;
    }

    // 2. get available metadata services, request metadata and clean data
    let data: TransformedData | null = null;
    let errorMessage: string = "";
    for (const service of services) {
      if (!service.shouldApply({ item, identifiers }))
        continue;

      debug(`Service ${service.name} processing...`);

      await service.updateIdentifiers?.({ item, identifiers });

      const res = await service.fetch?.({ item, identifiers })
        .catch((error) => {
          debug(`Service ${service.name} failed: ${error.message}`);
          errorMessage += `${service.name}: ${error.message}\n`;
        });

      if (!res) {
        debug(`Service ${service.name} failed: no response`);
        continue;
      }

      const transformedData = service.transform?.(res);
      if (transformedData) {
        data = transformedData;
        break;
      }
    }

    if (!data) {
      report({
        level: "error",
        message: `No metadata found. ${errorMessage}`,
      });
      return;
    }

    debug("Clean data: ", data);

    // 3. apply field changes
    function applyItemType(data: TransformedData) {
      if (!data.itemType) {
        debug("Service did not provide itemType");
        return;
      }

      const newItemTypeID = Zotero.ItemTypes.getID(data.itemType);
      if (!newItemTypeID || data.itemType === item.itemType) {
        debug("Item type is not changed.");
        return;
      }

      if (data.DOI?.match(/arxiv/gi)) {
        debug("DOI has 'arxiv', skip to change itemType.");
        return;
      }

      if (!options.allowTypeChanged) {
        debug("User diasble to change itemType");
        return;
      }

      debug(`Update ItemType from ${item.itemType} to ${data.itemType}`);
      item.setType(newItemTypeID);
    }

    function applyItemCreators(data: TransformedData) {
      if (!data.creators) {
        debug("Service doesn't return creators");
        return;
      }

      if (item.getCreators().length && options.mode !== "all") {
        debug("Original item has creators, blank mode, skip to update creators.");
        return;
      }

      item.setCreators(data.creators);
    }

    function applyItemFields(data: Omit<TransformedData, "itemType" | "creators">) {
      for (const [field, value] of Object.entries(data)) {
        if (!isFieldValidForItemType(field as _ZoteroTypes.Item.ItemField, item.itemType))
          continue;

        let newFieldValue = value;
        const oldFieldValue = item.getField(field);

        if (options.mode !== "all" && !!oldFieldValue)
          continue;

        if (field === "accessDate") {
          newFieldValue = Zotero.Date.dateToSQL(new Date(data[field] ?? ""), true);
        }

        if (!newFieldValue)
          continue;

        debug(`Update "${field}" from "${oldFieldValue}" to "${newFieldValue}"`);
        item.setField(field, newFieldValue);
      }
    }

    applyItemType(data);
    applyItemCreators(data);
    const { itemType, creators, ...fields } = data;
    applyItemFields(fields);

    // if (options.lint)
    //   addon.runner.add({ rules: "standard", items: item });
  },

  async prepare() {
    const { dialog, openForSettings } = useSettingsDialog<UpdateMetadataOption>();

    dialog.addSetting(getString("rule-tool-update-metadata-dialog-mode"), "mode", {
      tag: "select",
      children: [{
        tag: "option",
        properties: {
          value: "all",
          innerHTML: getString("rule-tool-update-metadata-dialog-mode-all"),
        },
      }, {
        tag: "option",
        properties: {
          value: "blank",
          innerHTML: getString("rule-tool-update-metadata-dialog-mode-blank"),
        },
      }],
    })
      .addSetting(getString("rule-tool-update-metadata-dialog-allow-type-changed"), "allowTypeChanged", {
        tag: "input",
        attributes: {
          type: "checkbox",
          checked: true,
        },
      }, { valueType: "boolean" })
      // .addSetting("Run Lint After Retrive", "lint", {
      //   tag: "input",
      //   attributes: {
      //     type: "checkbox",
      //     checked: true,
      //   },
      // }, { valueType: "boolean" })
      .addStaticRow(getString("rule-tool-update-metadata-dialog-notes"), {
        tag: "ul",
        children: [{
          tag: "li",
          properties: {
            textContent: getString("rule-tool-update-metadata-dialog-note-rate-limit"),
          },
        }, {
          tag: "li",
          properties: {
            textContent: getString("rule-tool-update-metadata-dialog-note-chinese-limit"),
          },
        }],
      });

    return await openForSettings(getString("rule-tool-update-metadata-dialog-title"));
  },
});
