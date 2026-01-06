import { logger } from "../../../../utils/logger";
import { getPref } from "../../../../utils/prefs";
import { defineService } from "./base-service";

export const SemanticScholarService = defineService<Result>({
  id: "semantic-scholar-service",
  name: "Semantic Scholar Service",
  // set cooldown to 1_000 when token is set,
  get cooldown() { return getPref("semanticScholarToken") ? 1_000 : 3_000; },
  shouldApply: () => true,
  async fetch({ identifiers }) {
    const fields: (keyof Result)[] = [
      "publicationTypes",
      "title",
      "authors",
      "abstract",
      "externalIds",
      "url",
      "venue",
      "publicationVenue",
      "publicationDate",
      "journal",
    ];

    let paperID: string;
    if (identifiers.arXiv)
      paperID = `ARXIV:${identifiers.arXiv}`;
    else if (identifiers.DOI)
      paperID = `DOI:${identifiers.DOI}`;
    else if (identifiers.PMID)
      paperID = `PMCID:${identifiers.PMID}`;
    else if (identifiers.SemanticScholarID)
      paperID = identifiers.SemanticScholarID;
    else if (identifiers.URL)
      paperID = `URL:${identifiers.URL}`;
    else
      throw new Error("No valid paper ID found.");

    const endpoint = getEndpoint(getPref("semanticScholarEndpoint"));
    const url = `${endpoint}/paper/${encodeURIComponent(paperID.trim())}?fields=${fields.join(",")}`;
    const res = await Zotero.HTTP.request("GET", url, {
      headers: {
        "x-api-key": getPref("semanticScholarToken"),
      },
    });

    if (res.status !== 200) {
      throw new Error(`Request from Semantic Scholar failed, status code ${res.status}`);
    }

    const result = JSON.parse(res.response) as Result;
    return result;
  },

  transform(res) {
    return {
      itemType: res.publicationTypes?.includes("Conference")
        ? "conferencePaper"
        : res.publicationTypes?.includes("JournalArticle") || res.publicationTypes?.includes("Review")
          ? "journalArticle"
          : undefined,
      creators: [],
      title: res.title,
      abstractNote: res.abstract,
      DOI: res.externalIds?.DOI,
      publicationTitle: res.venue,
      conferenceName: res.publicationVenue?.name,
      proceedingsTitle: res.publicationVenue?.name,
      ISSN: res.publicationVenue?.issn,
      date: res.publicationDate,
      volume: res.journal?.volume,
      pages: res.journal?.pages,
      libraryCatalog: "Semantic Scholar",
    };
  },
});

const DEFAULT_ENDPOINT = "https://api.semanticscholar.org/graph/v1";

function getEndpoint(customEndpoint?: string): string {
  if (!customEndpoint)
    return DEFAULT_ENDPOINT;

  try {
    const endpointUrl = new URL(customEndpoint);
    if (!endpointUrl.protocol.startsWith("http"))
      throw new Error(`Invalid protocol: ${endpointUrl.protocol}. Must be 'http' or 'https'.`);
    return endpointUrl.href;
  }
  catch {
    logger.error(`Invalid custom endpoint: "${customEndpoint}". Falling back to default: ${DEFAULT_ENDPOINT}`);
    return DEFAULT_ENDPOINT;
  }
}

interface Result {
  paperId?: string;
  abstract?: string;
  authors?: {
    name: string;
    authorId: string;
  }[];
  externalIds?: {
    [key: string]: string;
  };
  journal?: {
    name?: string;
    volume?: string;
    pages?: string;
  };
  openAccessPdf?: {
    url?: string;
    status?: string;
  };
  publicationDate?: string;
  publicationTypes?: string[];
  publicationVenue?: {
    name?: string;
    issn?: string;
  };
  title?: string;
  url?: string;
  venue?: string;
}
