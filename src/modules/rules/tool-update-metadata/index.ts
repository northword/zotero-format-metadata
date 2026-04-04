import type { MetadataContext, TransformedData } from "./services/base-service";
import { useSettingsDialog } from "../../../utils/dialog";
import { getString } from "../../../utils/locale";
import { getPref } from "../../../utils/prefs";
import { isFieldValidForItemType } from "../../../utils/zotero";
import { defineRule } from "../rule-base";
import { extractIdentifiers, isPreprint } from "./identifiers";
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

    function createServiceContext(service: typeof services[number]): MetadataContext {
      return {
        item,
        identifiers,
        isPreprint: isPreprint(item, identifiers),
        debug: (msg: string) => debug(`[${service.id}] ${msg}`),
      };
    }

    let errorMessage: string = "";

    // 2. get available metadata services
    const availableServices = services.filter(s => s.shouldApply(createServiceContext(s)));
    debug(`Available services: ${availableServices.map(s => s.id).join(", ")}`);

    // 3. update identidiers
    for (const service of availableServices) {
      if (!service.updateIdentifiers)
        continue;

      const status = await service.updateIdentifiers?.(createServiceContext(service))
        .catch((error) => {
          debug(`Failed to update identifiers via ${service.name}: ${error.message}`);
          errorMessage += `${service.name}: ${error.message}\n`;
        });

      // To save resources, we expect that once a service has obtained a general identifier,
      // it will not attempt further operations.
      // This can prevent some items that could have been updated via DOI service from being
      // forced to use a rate-limited semantic scholar service.
      // When the number of services increases further, we may be able to change this logic.
      if (status) {
        debug(`Identifiers updated via service ${service.name}: ${JSON.stringify(identifiers, null, 2)}`);
        break;
      }
    }

    // 3. request metadata and clean data
    let data: TransformedData | null = null;
    for (const service of availableServices) {
      debug(`Service ${service.name} processing...`);

      const res = await service.fetch?.(createServiceContext(service))
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
        message: `No metadata found. \n${errorMessage}`,
      });
      return;
    }
    else if (errorMessage) {
      report({
        level: "warning",
        message: `Metadata updated with errors:\n\n${errorMessage}`,
      });
    }

    debug("Clean data: ", data);

    // 4. apply field changes
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

        let newFieldValue = "";
        const oldFieldValue = item.getField(field);

        if (options.mode !== "all" && !!oldFieldValue)
          continue;

        switch (field) {
          case "accessDate":
            // https://github.com/northword/zotero-format-metadata/issues/239
            // https://forums.zotero.org/discussion/117940/zoteroobjectuploaderror#latest
            newFieldValue = Zotero.Date.dateToSQL(new Date(data[field] ?? ""), true);
            break;

          case "abstractNote":
            // https://github.com/northword/zotero-format-metadata/issues/404
            newFieldValue = Zotero.Utilities.trimInternal(data[field] || "");
            break;

          default:
            newFieldValue = value;
            break;
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
    // Get Default Settings
    const isSlient = getPref("rule.tool-update-metadata.option.slient");
    const defaultOptions: UpdateMetadataOption = {
      mode: getPref("rule.tool-update-metadata.option.mode") as UpdateMetadataOption["mode"],
      allowTypeChanged: getPref("rule.tool-update-metadata.option.allow-type-changed"),
    };

    if (isSlient)
      return defaultOptions;

    // Create Dialog
    const { dialog, openForSettings } = useSettingsDialog<UpdateMetadataOption>();

    dialog.addSetting(getString("rule-tool-update-metadata-dialog-mode"), "mode", {
      tag: "select",
      children: [{
        tag: "option",
        properties: {
          value: "all",
          innerHTML: getString("rule-tool-update-metadata-dialog-mode-all"),
        },
        attributes: {
          ...defaultOptions.mode === "all" && { selected: "" },
        },
      }, {
        tag: "option",
        properties: {
          value: "blank",
          innerHTML: getString("rule-tool-update-metadata-dialog-mode-blank"),
        },
        attributes: {
          ...defaultOptions.mode === "blank" && { selected: "" },
        },
      }],
    })
      .addSetting(getString("rule-tool-update-metadata-dialog-allow-type-changed"), "allowTypeChanged", {
        tag: "input",
        attributes: {
          type: "checkbox",
          ...defaultOptions.allowTypeChanged && { checked: defaultOptions.allowTypeChanged },
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
