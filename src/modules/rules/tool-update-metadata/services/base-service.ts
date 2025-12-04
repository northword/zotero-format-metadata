import type { Identifiers } from "../identifiers";
import { withThrottle } from "../../../../utils/throttle";
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
  service.fetch = withThrottle(service.fetch, service.cooldown);
  service.updateIdentifiers = withThrottle(service.updateIdentifiers, service.cooldown);
  return service;
}
