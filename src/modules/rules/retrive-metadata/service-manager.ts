// interfaces/metadata-service.ts
export interface MetadataResult {
  success: boolean;
  data?: any;
  error?: string;
}

export interface MetadataService {
  /**
   * 检查服务是否适用于给定条目
   */
  isApplicable: (item: Zotero.Item) => boolean;

  /**
   * 获取元数据
   */
  fetchMetadata: (item: Zotero.Item, options: any) => Promise<MetadataResult>;

  /**
   * 应用元数据到条目
   */
  applyMetadata: (item: Zotero.Item, metadata: any, options: any) => Zotero.Item;

  /**
   * 服务名称
   */
  readonly name: string;

  /**
   * 服务优先级（数值越高优先级越高）
   */
  readonly priority: number;
}

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
