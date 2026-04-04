interface BaseIdentifiers {
  DOI?: string;
  ISBN?: string;
  PMID?: string;
  PMCID?: string;
  SemanticScholarID?: string;
  URL?: string;
}

const KNOW_PREPRINTER_SERVICE_IDs = ["arXiv", "bioRxiv", "medRxiv", "ChemRxiv", "SSRN", "OSF", "ResearchSquare"] as const;
type PreprintServiceId = (typeof KNOW_PREPRINTER_SERVICE_IDs)[number];
type PreprintIdentifiers = Partial<Record<PreprintServiceId, string>>;

export interface Identifiers extends BaseIdentifiers, PreprintIdentifiers {}

/**
 * Known preprint services and their matching patterns
 */
const KNOW_PREPRINTER_SERVICES: {
  id: PreprintServiceId;
  urlPattern: RegExp;
  doiPattern: RegExp;
  archiveIDPattern: RegExp;
}[] = [
  {
    id: "arXiv",
    urlPattern: /https?:\/\/arxiv\.org\/abs\//i,
    doiPattern: /10\.48550\/arXiv\./i,
    archiveIDPattern: /arxiv:/i,
  },
  {
    id: "bioRxiv",
    urlPattern: /https?:\/\/(www\.)?biorxiv\.org\/content\//i,
    doiPattern: /10\.1101\//,
    // bioRxiv 通常使用 DOI 作为主要标识，但内部常以 biorxiv 标记
    archiveIDPattern: /biorxiv:/i,
  },
  {
    id: "medRxiv",
    urlPattern: /https?:\/\/(www\.)?medrxiv\.org\/content\//i,
    doiPattern: /10\.1101\//,
    archiveIDPattern: /medrxiv:/i,
  },
  {
    id: "ChemRxiv",
    urlPattern: /https?:\/\/chemrxiv\.org\/engage\/chemrxiv\/article-details\//i,
    doiPattern: /10\.26434\/chemrxiv\./i,
    archiveIDPattern: /chemrxiv:/i,
  },
  {
    id: "SSRN",
    urlPattern: /https?:\/\/papers\.ssrn\.com\/sol3\/papers\.cfm\?abstract_id=/i,
    doiPattern: /10\.2139\/ssrn\./i,
    archiveIDPattern: /ssrn:/i,
  },
  {
    id: "OSF", // 涵盖 PsyArXiv, SocArXiv 等基于 OSF 框架的服务器
    urlPattern: /https?:\/\/osf\.io\/[a-z0]+\//i,
    doiPattern: /10\.31234\/osf\.io\//i,
    archiveIDPattern: /osf:/i,
  },
  {
    id: "ResearchSquare",
    urlPattern: /https?:\/\/www\.researchsquare\.com\/article\/rs-/i,
    doiPattern: /10\.21203\/rs\./i,
    archiveIDPattern: /researchsquare:/i,
  },
];

/**
 * Extract identifiers from a Zotero item
 */
export function extractIdentifiers(item: Zotero.Item): Identifiers {
  const result: Identifiers = {};

  const archiveID = item.getField("archiveID") || "";

  const URL = item.getField("url") || "";
  if (URL)
    result.URL = URL;

  // Determine final DOI (priority: main -> extra -> extracted from URL)
  const DOI_Field = item.getField("DOI") || "";
  const DOI_Extra = ztoolkit.ExtraField.getExtraField(item, "DOI") || "";
  const DOI_From_URL = extractDOIFromUrl(URL);
  const DOI = DOI_Field || DOI_Extra || DOI_From_URL;
  if (DOI)
    result.DOI = DOI;

  // Detect preprint services based on DOI, archiveID, extra DOI, or URL
  for (const service of KNOW_PREPRINTER_SERVICES) {
    let matchedValue: string | null = null;

    if (DOI_Field.match(service.doiPattern))
      matchedValue = DOI_Field.replace(service.doiPattern, "");
    else if (archiveID.match(service.archiveIDPattern))
      matchedValue = archiveID.replace(service.archiveIDPattern, "");
    else if (DOI_Extra.match(service.doiPattern))
      matchedValue = DOI_Extra.replace(service.doiPattern, "");
    else if (URL.match(service.urlPattern))
      matchedValue = URL.replace(service.urlPattern, "");

    if (matchedValue) {
      result[service.id] = matchedValue;
    }
  }

  // Other optional fields from Extra
  const PMCID = item.getField("PMCID") || ztoolkit.ExtraField.getExtraField(item, "PMCID");
  if (PMCID)
    result.PMCID = PMCID;

  const PMID = item.getField("PMID") || ztoolkit.ExtraField.getExtraField(item, "PMID");
  if (PMID)
    result.PMID = PMID;

  const SemanticScholarID = ztoolkit.ExtraField.getExtraField(item, "SemanticScholar");
  if (SemanticScholarID)
    result.SemanticScholarID = SemanticScholarID;

  const ISBN = item.getField("ISBN") || ztoolkit.ExtraField.getExtraField(item, "ISBN");
  if (ISBN)
    result.ISBN = ISBN;

  return result;
}

/**
 * Extract DOI from a given URL string
 */
export function extractDOIFromUrl(url: string): string | null {
  if (typeof url !== "string" || !url.trim())
    return null;

  // Try decode URL (handle % encoded characters)
  let decoded = url;
  try {
    decoded = decodeURIComponent(url);
  }
  catch {
    // If decode fails, use the original URL
  }

  // Standard DOI detection regex compatible with Crossref format
  const doiRegex = /\b10\.\d{4,9}\/[-.\w;()/:]+/;
  const match = decoded.match(doiRegex);
  if (!match)
    return null;

  let doi = match[0];

  // Clean trailing non-DOI characters (common for punctuation)
  doi = doi.replace(/[^-.\w;()/:]/g, "");

  return doi;
}

export function isPreprint(item: Zotero.Item, identifiers: Identifiers): boolean {
  if (!item.isRegularItem())
    return false;

  if (item.itemType === "preprint")
    return true;

  return KNOW_PREPRINTER_SERVICE_IDs.some(id => identifiers[id]);
}
