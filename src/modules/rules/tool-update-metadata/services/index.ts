import type { MetadataService } from "./base-service";
import { ArxivService } from "./arxiv-service";
import { SemanticScholarService } from "./semantic-scholar-service";
import { IdentifiersTranslateService, ItemTranslateService } from "./translate-service";

export const services: MetadataService<any>[] = [
  // Keep preprint service first
  ArxivService,

  // Then Zotero's translate service
  IdentifiersTranslateService,
  ItemTranslateService,

  // Finally, Semantic Scholar
  SemanticScholarService,
];
