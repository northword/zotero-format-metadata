import type { Identifiers } from "../identifiers";
import pThrottle from "p-throttle";
import { getPref } from "../../../../utils/prefs";
import { Rule } from "../../rule-base";

type MetadataResponse = Record<string, any>;

export type TransformedData = {
  itemType?: _ZoteroTypes.Item.ItemType;
  creators?: _ZoteroTypes.Item.Creator[];
} & {
  [field in _ZoteroTypes.Item.ItemField]?: string
};

interface MetadataContext {
  item: Zotero.Item;
  identifiers: Identifiers;
  // options: UpdateMetadataOptions;
  // debug: Logger["debug"];
}

export interface MetadataService<T extends MetadataResponse> {
  id: string;
  name: string;
  /** @todo unimplemented */
  supportedItemTypes?: string[];
  /** @see {@link Rule.cooldown}   */
  cooldown: number;
  /**
   * Determines whether this service should be applied to the current item.
   * Returns `true` if this service is relevant for the item.
   */
  shouldApply: (ctx: MetadataContext) => boolean;
  /**
   * Optionally update or enrich the item's identifiers before fetching metadata.
   * For example, using an arXiv ID to retrieve and store the corresponding DOI.
   */
  updateIdentifiers?: (ctx: MetadataContext) => Promise<void>;
  /**
   * Fetch metadata from an external API.
   * Returns a format-specific raw response, or `null`/`undefined` if no data is available.
   */
  fetch?: (ctx: MetadataContext) => Promise<T | null | undefined>;
  /**
   * Transforms the fetched metadata into a Zotero-compatible data structure.
   * Returned data should contain only fields acceptable by Zotero's item API.
   */
  transform?: (response: T) => TransformedData;
}

export function defineService<T extends MetadataResponse>(service: MetadataService<T>) {
  if (service.cooldown && service.cooldown > 0) {
    const numConcurrent = getPref("lint.numConcurrent") || 1;
    const throttle = pThrottle({
      limit: service.cooldown < 100 ? 1 : numConcurrent,
      interval: service.cooldown,
    });
    service.fetch = service.fetch ? throttle(service.fetch) : undefined;
    service.updateIdentifiers = service.updateIdentifiers ? throttle(service.updateIdentifiers) : undefined;
  }
  return service;
}
