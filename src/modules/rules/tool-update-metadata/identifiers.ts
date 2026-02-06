export interface Identifiers {
  DOI?: string;
  ISBN?: string;
  arXiv?: string;
  PMID?: string;
  SemanticScholarID?: string;
  URL?: string;
}

/**
 * Known preprint services and their matching patterns
 */
const KNOW_PREPRINTER_SERVICES: {
  id: keyof Identifiers;
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
];

/**
 * Extract identifiers from a Zotero item
 */
export function extractIdentifiers(item: Zotero.Item): Identifiers {
  const result: Identifiers = {};

  const archiveID = item.getField("archiveID") || "";
  const DOI = item.getField("DOI") || "";
  const URL = item.getField("url") || "";

  const DOI_Extra = ztoolkit.ExtraField.getExtraField(item, "DOI") || "";

  // Detect preprint services based on DOI, archiveID, extra DOI, or URL
  for (const service of KNOW_PREPRINTER_SERVICES) {
    let matchedValue: string | null = null;

    if (DOI.match(service.doiPattern))
      matchedValue = DOI.replace(service.doiPattern, "");
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

  // Determine final DOI (priority: main -> extra -> extracted from URL)
  const DOI_From_URL = extractDOIFromUrl(URL);
  result.DOI = DOI || DOI_Extra || DOI_From_URL || undefined;

  // Other optional fields from Extra
  const PMCID = item.getField("PMCID") || ztoolkit.ExtraField.getExtraField(item, "PMCID");
  const PMID = item.getField("PMID") || ztoolkit.ExtraField.getExtraField(item, "PMID");
  if (PMCID || PMID)
    result.PMID = PMCID || PMID;

  const SemanticScholarID = ztoolkit.ExtraField.getExtraField(item, "SemanticScholar");
  if (SemanticScholarID)
    result.SemanticScholarID = SemanticScholarID;

  const ISBN = item.getField("ISBN") || ztoolkit.ExtraField.getExtraField(item, "ISBN");
  if (ISBN)
    result.ISBN = ISBN;

  if (URL)
    result.URL = URL;

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
