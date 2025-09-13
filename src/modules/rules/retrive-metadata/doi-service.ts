import type { MetadataResult } from "../interfaces/metadata-service";
// services/doi-service.ts
import { BaseMetadataService } from "./base-metadata-service";

export class DoiService extends BaseMetadataService {
  readonly name = "DOI Service";
  readonly priority = 100; // 高优先级

  isApplicable(item: Zotero.Item): boolean {
    const doi = item.getField("DOI") || ztoolkit.ExtraField.getExtraField(item, "DOI");
    return !!doi;
  }

  async fetchMetadata(item: Zotero.Item, options: any): Promise<MetadataResult> {
    const doi = item.getField("DOI") || ztoolkit.ExtraField.getExtraField(item, "DOI");

    try {
      const identifier = {
        itemType: item.itemType,
        DOI: doi,
      };

      const translate = new Zotero.Translate.Search();
      translate.setIdentifier(identifier);
      const translators = await translate.getTranslators();

      if (translators.length === 0) {
        return { success: false, error: "No translators found" };
      }

      translate.setTranslator(translators);
      const newItems = await translate.translate({ libraryID: false });

      if (newItems.length === 0) {
        return { success: false, error: "No metadata found" };
      }

      return { success: true, data: newItems[0] };
    }
    catch (error) {
      return { success: false, error: error.message };
    }
  }

  applyMetadata(item: Zotero.Item, metadata: any, options: any): Zotero.Item {
    // DOI服务的特殊处理逻辑
    const fieldsIds = Zotero.ItemFields.getItemTypeFields(item.itemTypeID)
      .map(id => Zotero.ItemFields.getName(id)) as string[];

    for (const field of Object.keys(metadata)) {
      if (["notes", "tags", "seeAlso", "attachments"].includes(field)) {
        continue;
      }

      const oldValue = item.getField(field, false, true);
      let newValue = metadata[field] ?? "";

      if (options.mode !== "all" && oldValue !== "") {
        continue;
      }

      if (field === "title") {
        newValue = newValue.replace(/\s+<(sub|sup)>/g, "<$1>");
      }

      if (fieldsIds.includes(field)) {
        item.setField(field, newValue);
      }
    }

    return item;
  }
}
