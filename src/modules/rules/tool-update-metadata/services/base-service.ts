import type { Identifiers } from "../identifies";

type ResponseData = Record<string, any>;

export type CleanedData = {
  itemType?: _ZoteroTypes.Item.ItemType;
  creators?: _ZoteroTypes.Item.Creator[];
} & {
  [field in _ZoteroTypes.Item.ItemField]?: string
};

interface BaseContext {
  item: Zotero.Item;
  identifiers: Identifiers;
  // options: UpdateMetadataOptions;
  // debug: Logger["debug"];
}

export interface MetadataService<T extends ResponseData> {
  id: string;
  name: string;
  supportedItemTypes?: string[];
  shouldProcess: (ctx: BaseContext) => boolean;
  refreshIdentifiers?: (ctx: BaseContext) => Promise<void>;
  request?: (ctx: BaseContext) => Promise<T | null | undefined>;
  cleanData?: (response: T) => CleanedData;
}

export function defineService<T extends ResponseData>(service: MetadataService<T>) {
  return service;
}
