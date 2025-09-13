import type { MetadataResult } from "../interfaces/metadata-service";
// services/arxiv-service.ts
import { BaseMetadataService } from "./base-metadata-service";

export class ArxivService extends BaseMetadataService {
  readonly name = "arXiv Service";
  readonly priority = 90;

  isApplicable(item: Zotero.Item): boolean {
    return this.extractArxivId(item) !== "";
  }

  async fetchMetadata(item: Zotero.Item, options: any): Promise<MetadataResult> {
    const arxivId = this.extractArxivId(item);

    try {
      // 尝试从arXiv获取DOI
      const doi = await this.getDOIFromArxiv(arxivId);

      if (doi) {
        return { success: true, data: { DOI: doi } };
      }

      // 如果获取DOI失败，尝试直接获取arXiv元数据
      const metadata = await this.getArxivMetadata(arxivId);
      return { success: true, data: metadata };
    }
    catch (error) {
      return { success: false, error: error.message };
    }
  }

  private extractArxivId(item: Zotero.Item): string {
    const doi = item.getField("DOI");
    const archiveID = item.getField("archiveID");
    const url = item.getField("url");

    if (doi?.match(/10.48550\/arXiv\./gi)) {
      return doi.replace(/10.48550\/arXiv\./gi, "");
    }
    if (archiveID?.match(/arxiv/gi)) {
      return archiveID.replace("arxiv:", "");
    }
    if (url?.match(/arxiv/gi)) {
      return url.replace(/https?:\/\/arxiv\.org\/abs\//, "");
    }

    return "";
  }

  private async getDOIFromArxiv(arxivId: string): Promise<string | undefined> {
    const id = arxivId.replace(/arxiv:/gi, "").trim();
    const url = `https://export.arxiv.org/api/query?id_list=${id}`;

    const result = await this.makeRequest(url);
    if (!result)
      return undefined;

    const doc = new DOMParser().parseFromString(result, "text/xml");
    const refDoi = doc.querySelector("doi");

    return refDoi?.textContent || undefined;
  }

  private async getArxivMetadata(arxivId: string): Promise<any> {
    // 实现arXiv元数据获取逻辑
    // ...
    return {};
  }
}
