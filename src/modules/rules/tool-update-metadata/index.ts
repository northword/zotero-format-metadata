import type { CleanedData } from "./services/base-service";
import { useSettingsDialog } from "../../../utils/dialog";
import { getString } from "../../../utils/locale";
import { isFieldValidForItemType } from "../../../utils/zotero";
import { defineRule } from "../rule-base";
import { extractIdentifiers } from "./identifies";
import { services } from "./services";

interface UpdateMetadataOption {
  mode: "selected" | "blank" | "all";
  allowTypeChanged: boolean;
}

export const ToolUpdateMetadata = defineRule<UpdateMetadataOption>({
  id: "tool-update-metadata",
  scope: "item",
  targetItemTypes: ["journalArticle", "preprint", "conferencePaper"],
  category: "tool",
  async apply({ item, options, report, debug }) {
    // 1. extract identifiers
    const identifiers = extractIdentifiers(item);
    debug("Identifiers: ", identifiers);
    if (Object.entries(identifiers).length === 0) {
      report({
        level: "error",
        message: getString("info-noDOI"),
      });
      return;
    }

    // 2. get available metadata services, request metadata and clean data
    let data: CleanedData | null = null;
    for (const service of services) {
      if (!service.shouldProcess({ item, identifiers }))
        continue;

      debug(`Service ${service.name} processing...`);
      await service.refreshIdentifiers?.({ item, identifiers });

      const res = await service.request?.({ item, identifiers })
        .catch((error) => {
          debug(`Service ${service.name} failed: ${error.message}`);
          if (error.message.match(/Too Many Requests/i)) {
            report({
              level: "error",
              message: `${service.name}: Too Many Requests`,
            });
          }
        });

      if (!res) {
        debug(`Service ${service.name} failed: no response`);
        continue;
      }

      const cleanData = service.cleanData?.(res);
      if (cleanData) {
        data = cleanData;
        break;
      }
    }

    if (!data) {
      report({
        level: "error",
        message: "No metadata found.",
      });
      return;
    }

    debug("Clean data: ", data);

    // 3. apply field changes
    function applyItemType(data: CleanedData) {
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

      if (options.allowTypeChanged === true) {
        debug("User diasble to change itemType");
        return;
      }

      debug(`Update ItemType from ${item.itemType} to ${data.itemType}`);
      item.setType(newItemTypeID);
    }

    function applyItemCreators(data: CleanedData) {
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

    function applyItemFields(data: Omit<CleanedData, "itemType" | "creators">) {
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
  },

  async prepare() {
    const { dialog, openForSettings } = useSettingsDialog<UpdateMetadataOption>();

    dialog.addSetting("Mode", "mode", {
      tag: "select",
      children: [{
        tag: "option",
        properties: {
          value: "blank",
          innerHTML: "Blank Fields Only",
        },
      }, {
        tag: "option",
        properties: {
          value: "all",
          innerHTML: "All Fields",
        },
      }],
    })
      .addSetting("Allow Change Item Type", "allowTypeChanged", {
        tag: "input",
        attributes: {
          type: "checkbox",
          checked: true,
        },
      }, { valueType: "boolean" })
      .addStaticRow("Notes", {
        tag: "ul",
        children: [{
          tag: "li",
          properties: {
            textContent: "Some APIs have rate limits; please avoid bulk processing.",
          },
        }, {
          tag: "li",
          properties: {
            textContent: "Chinese publications could not use this feature due to data source limitations.",
          },
        }],
      });

    return await openForSettings("Retrive Metadata");
  },
});
