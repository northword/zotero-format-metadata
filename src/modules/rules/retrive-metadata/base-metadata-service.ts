// services/base-metadata-service.ts
import type { MetadataResult, MetadataService } from "../interfaces/metadata-service";

export abstract class BaseMetadataService implements MetadataService {
  abstract readonly name: string;
  abstract readonly priority: number;
  abstract isApplicable(item: Zotero.Item): boolean;
  abstract fetchMetadata(item: Zotero.Item, options: any): Promise<MetadataResult>;

  applyMetadata(item: Zotero.Item, metadata: any, options: any): Zotero.Item {
    // 默认实现，子类可以重写
    for (const [field, value] of Object.entries(metadata)) {
      if (value && (options.mode === "all" || !item.getField(field))) {
        item.setField(field, value);
      }
    }
    return item;
  }

  protected async makeRequest(url: string, headers: any = {}): Promise<any> {
    const res = await Zotero.HTTP.request("GET", url, { headers });

    if (res.status !== 200) {
      throw new Error(`Request failed with status ${res.status}`);
    }

    return res.response;
  }
}
