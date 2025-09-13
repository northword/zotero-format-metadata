import type { MetadataResult } from "../interfaces/metadata-service";
import { getPref } from "../../utils/prefs";
// services/semantic-scholar-service.ts
import { BaseMetadataService } from "./base-metadata-service";

export class SemanticScholarService extends BaseMetadataService {
  readonly name = "Semantic Scholar Service";
  readonly priority = 80;

  isApplicable(item: Zotero.Item): boolean {
    // 检查是否有可用的标识符
    return this.getPaperId(item) !== undefined;
  }

  async fetchMetadata(item: Zotero.Item, options: any): Promise<MetadataResult> {
    const paperId = this.getPaperId(item);

    if (!paperId) {
      return { success: false, error: "No valid paper ID" };
    }

    try {
      const fields = [
        "publicationTypes",
        "title",
        "authors",
        "abstract",
        "externalIds",
        "url",
        "venue",
        "publicationVenue",
        "publicationDate",
        "journal",
      ];

      const url = `https://api.semanticscholar.org/graph/v1/paper/${paperId.trim()}?fields=${fields.join(",")}`;
      const headers = {
        "x-api-key": getPref("semanticScholarToken"),
      };

      const response = await this.makeRequest(url, headers);
      const result = JSON.parse(response);

      return { success: true, data: result };
    }
    catch (error) {
      return { success: false, error: error.message };
    }
  }

  applyMetadata(item: Zotero.Item, metadata: any, options: any): Zotero.Item {
    // Semantic Scholar的特殊处理逻辑
    const fieldHandlers = {
      publicationTypes: (value: string[]) => {
        if (value.includes("Conference")) {
          item.setType(Zotero.ItemTypes.getID("conferencePaper"));
        }
        else if (value.includes("JournalArticle") || value.includes("Review")) {
          item.setType(Zotero.ItemTypes.getID("journalArticle"));
        }
      },
      title: (value: string) => item.setField("title", value),
      abstract: (value: string) => item.setField("abstractNote", value),
      externalIds: (value: any) => {
        if (value?.DOI)
          item.setField("DOI", value.DOI);
      },
      url: (value: string) => item.setField("url", value),
      venue: (value: any) => {
        if (item.itemType === "conferencePaper" && value.name) {
          item.setField("conferenceName", value.name);
        }
        if (item.itemType === "journalArticle" && value.name) {
          item.setField("publicationTitle", value.name);
        }
      },
      publicationVenue: (value: any) => {
        if (item.itemType === "conferencePaper" && value.name) {
          item.setField("proceedingsTitle", value.name);
        }
        if (item.itemType === "journalArticle" && value.name) {
          item.setField("publicationTitle", value.name);
        }
        if (value.issn)
          item.setField("ISSN", value.issn);
      },
      publicationDate: (value: string) => item.setField("date", value),
      journal: (value: any) => {
        if (value.volume)
          item.setField("volume", value.volume);
        if (value.pages)
          item.setField("pages", value.pages);
      },
    };

    for (const [field, handler] of Object.entries(fieldHandlers)) {
      const value = metadata[field];
      if (value !== undefined && value !== null && value !== ""
        && (options.mode === "all" || !item.getField(field))) {
        handler(value);
      }
    }

    if (item.getField("publisher").match(/arxiv/gi)) {
      item.setField("publisher", "");
    }

    item.setField("libraryCatalog", "Semantic Scholar");

    return item;
  }

  private getPaperId(item: Zotero.Item): string | undefined {
    if (item.getField("archiveID").match(/arxiv/i)) {
      return `ARXIV:${item.getField("archiveID").replace(/arxiv:/gi, "")}`;
    }
    if (item.getField("DOI") !== "") {
      return `DOI:${item.getField("DOI")}`;
    }
    if (ztoolkit.ExtraField.getExtraField(item, "PMCID")) {
      return `PMCID:${ztoolkit.ExtraField.getExtraField(item, "PMCID")}`;
    }
    if (ztoolkit.ExtraField.getExtraField(item, "SemanticScholar")) {
      return ztoolkit.ExtraField.getExtraField(item, "SemanticScholar") || undefined;
    }
    if (item.getField("url") !== "") {
      return `URL:${item.getField("url")}`;
    }
    return undefined;
  }
}
