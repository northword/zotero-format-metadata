import type { MetadataService } from "./base-service";
import { ArxivService } from "./arxiv-service";
import { IdentifiersTranslateService, ItemTranslateService } from "./doi-translate-service";
import { SemanticScholarService } from "./semantic-scholar-service";

export const services: MetadataService<any>[] = [
  // Keep preprint service first
  ArxivService,

  // Then Zotero's translate service
  IdentifiersTranslateService,
  ItemTranslateService,

  // Finally, Semantic Scholar
  SemanticScholarService,
];
