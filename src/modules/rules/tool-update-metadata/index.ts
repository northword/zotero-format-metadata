import type { TransformedData } from "./services/base-service";
import { useSettingsDialog } from "../../../utils/dialog";
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
  cooldown: Math.max(...services.map(s => s.cooldown ?? 0)),
  async apply({ item, options, report, debug }) {
    // Save original abstract for potential special handling
    const originalAbstract = item.getField("abstractNote") as string;

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
        // Skip abstractNote - we'll handle it separately
        if (field === "abstractNote")
          continue;

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

    // Special handling for abstract field based on original abstract
    if (data.abstractNote) {
      debug(`Processing abstractNote field with special handling`);
      const hasAbstractHeader = originalAbstract && originalAbstract.includes("ABSTRACT");
      const hasAbstractNotFound = originalAbstract && originalAbstract.includes("Abstract not found");

      if (hasAbstractHeader && !hasAbstractNotFound) {
        // Pipeline already found an abstract - leave it completely alone
        debug(`Skipping abstractNote update - "ABSTRACT" header exists and abstract was already found by pipeline`);
      } else if (hasAbstractNotFound) {
        // Pipeline didn't find abstract - replace "Abstract not found" with Zotero-retrieved abstract
        if (hasAbstractHeader) {
          // ABSTRACT label is present - insert the new abstract after it, preserving everything after "Abstract not found"
          const abstractInsertionPoint = originalAbstract.indexOf("ABSTRACT");
          const beforeAbstract = originalAbstract.substring(0, abstractInsertionPoint + "ABSTRACT".length);

          // Find "Abstract not found" and preserve everything after it
          const abstractNotFoundIndex = originalAbstract.indexOf("Abstract not found");
          const afterAbstractNotFound = originalAbstract.substring(abstractNotFoundIndex + "Abstract not found".length);

          const modifiedAbstract = beforeAbstract + "\n" + data.abstractNote + afterAbstractNotFound;
          debug(`Inserting Zotero-retrieved abstract after "ABSTRACT" label, preserving content after "Abstract not found"`);
          item.setField("abstractNote", modifiedAbstract);
        } else {
          // ABSTRACT label is missing - replace "Abstract not found" but preserve everything after it
          const abstractNotFoundIndex = originalAbstract.indexOf("Abstract not found");
          const afterAbstractNotFound = originalAbstract.substring(abstractNotFoundIndex + "Abstract not found".length);

          const modifiedAbstract = data.abstractNote + afterAbstractNotFound;
          debug(`Replacing "Abstract not found" with Zotero-retrieved abstract, preserving content after`);
          item.setField("abstractNote", modifiedAbstract);
        }
      } else {
        // Normal abstract field update logic (respect mode setting)
        if (options.mode === "all" || !originalAbstract) {
          debug(`Update "abstractNote" from "${originalAbstract}" to "${data.abstractNote}"`);
          item.setField("abstractNote", data.abstractNote);
        } else {
          debug(`Skipping abstractNote update - original value exists and mode is not "all"`);
        }
      }
    }

    // if (options.lint)
    //   addon.runner.add({ rules: "standard", items: item });
  },

  async prepare() {
    const { dialog, openForSettings } = useSettingsDialog<UpdateMetadataOption>();

    dialog.addSetting("Mode", "mode", {
      tag: "select",
      children: [{
        tag: "option",
        properties: {
          value: "all",
          innerHTML: "All Fields",
        },
      }, {
        tag: "option",
        properties: {
          value: "blank",
          innerHTML: "Blank Fields Only",
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
      // .addSetting("Run Lint After Retrive", "lint", {
      //   tag: "input",
      //   attributes: {
      //     type: "checkbox",
      //     checked: true,
      //   },
      // }, { valueType: "boolean" })
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
