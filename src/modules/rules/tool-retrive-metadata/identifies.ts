export interface Identifiers {
  DOI?: string;
  ISBN?: string;
  arXiv?: string;
  PMID?: string;
  SemanticScholarID?: string;
  URL?: string;
}

const KNOW_PREPRINTER_SERVICES: {
  id: keyof Identifiers;
  urlPattern: string | RegExp;
  doiPattern: string | RegExp;
  archiveIDPattern: string | RegExp;
}[] = [
  {
    id: "arXiv",
    urlPattern: /https?:\/\/arxiv\.org\/abs\//i,
    doiPattern: /10.48550\/arXiv\./gi,
    archiveIDPattern: /https?:\/\/arxiv\.org\/abs\//,
  },
];

export function extractIdentifiers(item: Zotero.Item): Identifiers {
  const result: Identifiers = {};

  const archiveID = item.getField("archiveID");
  const DOI = item.getField("DOI");
  const DOI_Extra = ztoolkit.ExtraField.getExtraField(item, "DOI");
  const URL = item.getField("url");

  for (const service of KNOW_PREPRINTER_SERVICES) {
    if (DOI.match(service.doiPattern))
      result[service.id] = DOI.replace(service.doiPattern, "");
    else if (archiveID.match(service.archiveIDPattern))
      result[service.id] = archiveID.replace(service.archiveIDPattern, "");
    else if (DOI_Extra && DOI_Extra.match(service.doiPattern))
      result[service.id] = DOI_Extra.replace(service.doiPattern, "");
    else if (URL.match(service.urlPattern))
      result[service.id] = URL.replace(service.urlPattern, "");
  }

  if (
    DOI
    && !result.arXiv
  ) {
    result.DOI = DOI;
  }

  const PMCID = ztoolkit.ExtraField.getExtraField(item, "PMCID");
  if (PMCID)
    result.PMID = PMCID;

  const SemanticScholarID = ztoolkit.ExtraField.getExtraField(item, "SemanticScholar");
  if (SemanticScholarID)
    result.SemanticScholarID = SemanticScholarID;

  const ISBN = ztoolkit.ExtraField.getExtraField(item, "ISBN");
  if (ISBN)
    result.ISBN = ISBN;

  if (URL)
    result.URL = URL;

  return result;
}
