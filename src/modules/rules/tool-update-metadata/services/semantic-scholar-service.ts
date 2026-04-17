import type { Identifiers } from "../identifiers";
import { getPref } from "../../../../utils/prefs";
import { defineService } from "./base-service";

async function request(paperID: string, fields: (keyof Result)[]): Promise<RequestResult> {
  const url = `https://api.semanticscholar.org/graph/v1/paper/${encodeURIComponent(paperID.trim())}?fields=${fields.join(",")}`;
  const res = await Zotero.HTTP.request("GET", url, {
    headers: {
      ...getPref("semanticScholarToken") && { "x-api-key": getPref("semanticScholarToken") },
      "User-Agent": "Linter for Zotero",
    },
  });

  return { _status: res.status, ...JSON.parse(res.response) };
}

function parsePaperID(type: keyof Identifiers, value: string): string {
  switch (type) {
    case "arXiv":
      return `ARXIV:${value}`;

    case "DOI":
      return `DOI:${value}`;

    case "SemanticScholarID":
      return value;

    case "PMID":
      return `PMCID:${value}`;

    case "URL":
      return `URL:${value}`;

    default:
      throw new Error("No valid paper ID found.");
  }
}

export const SemanticScholarService = defineService<Result>({
  id: "semantic-scholar-service",
  name: "Semantic Scholar Service",
  // set cooldown to 1_000 when token is set,
  get cooldown() { return getPref("semanticScholarToken") ? 1_000 : 3_000; },
  shouldApply: () => true,

  async updateIdentifiers({ item, identifiers, isPreprint }) {
    // only update preprints and conference papers;
    // journal articles and other types are not updated.
    if (!isPreprint && item.itemType !== "conferencePaper")
      return false;

    const identifiersToCheck: (keyof Identifiers)[] = ["arXiv", "DOI", "URL"];
    for (const idType of identifiersToCheck) {
      if (identifiers[idType]) {
        const paperID = parsePaperID(idType, identifiers[idType]!);
        const res = await request(paperID, ["paperId", "title", "externalIds"]);

        if (res._status === 200) {
          identifiers.SemanticScholarID = res.paperId;
          identifiers.DOI = res.externalIds?.DOI;
          return true;
        }
      }
    }

    return false;
  },

  async fetch({ identifiers, debug }) {
    const paperID = identifiers.SemanticScholarID
      ? parsePaperID("SemanticScholarID", identifiers.SemanticScholarID)
      : identifiers.DOI
        ? parsePaperID("DOI", identifiers.DOI)
        : undefined;

    if (!paperID)
      return;

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

    const res = await request(paperID, fields);

    if (res._status !== 200) {
      debug(`Request from Semantic Scholar failed, status code ${res._status}, ${res.error}`);
      return;
    }

    return res;
  },

  transform(res) {
    return {
      itemType: res.publicationTypes?.includes("Conference")
        ? "conferencePaper"
        : res.publicationTypes?.includes("Journal Article") || res.publicationTypes?.includes("Review")
          ? "journalArticle"
          : undefined,
      creators: undefined,
      title: res.title,
      abstractNote: res.abstract,
      DOI: res.externalIds?.DOI,
      publicationTitle: res.venue || res.journal?.name,
      conferenceName: res.publicationVenue?.name,
      proceedingsTitle: res.journal?.name || res.publicationVenue?.name,
      ISSN: res.publicationVenue?.issn,
      date: res.publicationDate,
      volume: res.journal?.volume,
      pages: res.journal?.pages,
      libraryCatalog: "Semantic Scholar",
    };
  },
});

/**
 * Details about a paper
 * @see https://api.semanticscholar.org/api-docs/#tag/Paper-Data/operation/get_graph_get_paper
 */
type RequestResult = ({ _status: 200 } & Result) | ({ _status: 400 | 404 } & Error);

interface Result {
  paperId: string;
  abstract?: string;
  authors?: {
    name: string;
    authorId: string;
    externalIds?: {
      DBLP?: number[];
    };
  }[];
  externalIds?: {
    [key: string]: string | number | undefined;
    DOI?: string;
    CorpusId?: number;
  };
  journal?: {
    name?: string;
    volume?: string;
    pages?: string;
  };
  openAccessPdf?: {
    url?: string;
    status?: string;
    license?: string;
    disclaimer?: string;
  };
  publicationDate?: string;
  publicationTypes?: Array<"Journal Article" | "Review" | "Conference" | string>;
  publicationVenue?: {
    id?: string;
    name?: string;
    type?: string;
    alternate_names?: string[];
    issn?: string;
    url?: string;
  };
  title?: string;
  url?: string;
  venue?: string;
}

interface Error {
  error: string;
}

const _exampleResult = {
  paperId: "5c5751d45e298cea054f32b392c12c61027d2fe7",
  // corpusId: 215416146,
  externalIds: {
    MAG: "3015453090",
    DBLP: "conf/acl/LoWNKW20",
    ACL: "2020.acl-main.447",
    DOI: "10.18653/V1/2020.ACL-MAIN.447",
    CorpusId: 215416146,
  },
  url: "https://www.semanticscholar.org/paper/5c5751d45e298cea054f32b392c12c61027d2fe7",
  title: "Construction of the Literature Graph in Semantic Scholar",
  abstract: "We describe a deployed scalable system for organizing published scientific literature into a heterogeneous graph to facilitate algorithmic manipulation and discovery.",
  venue: "Annual Meeting of the Association for Computational Linguistics",
  publicationVenue: {
    id: "1e33b3be-b2ab-46e9-96e8-d4eb4bad6e44",
    name: "Annual Meeting of the Association for Computational Linguistics",
    type: "conference",
    alternate_names: [
      "Annu Meet Assoc Comput Linguistics",
      "Meeting of the Association for Computational Linguistics",
      "ACL",
      "Meet Assoc Comput Linguistics",
    ],
    url: "https://www.aclweb.org/anthology/venues/acl/",
  },
  year: 1997,
  referenceCount: 59,
  citationCount: 453,
  influentialCitationCount: 90,
  isOpenAccess: true,
  openAccessPdf: {
    url: "https://www.aclweb.org/anthology/2020.acl-main.447.pdf",
    status: "HYBRID",
    license: "CCBY",
    disclaimer: "Notice: This snippet is extracted from the open access paper or abstract available at https://aclanthology.org/2020.acl-main.447, which is subject to the license by the author or copyright owner provided with this content. Please go to the source to verify the license and copyright information for your use.",
  },
  fieldsOfStudy: [
    "Computer Science",
  ],
  s2FieldsOfStudy: [
    {
      category: "Computer Science",
      source: "external",
    },
    {
      category: "Computer Science",
      source: "s2-fos-model",
    },
    {
      category: "Mathematics",
      source: "s2-fos-model",
    },
  ],
  publicationTypes: [
    "Journal Article",
    "Review",
  ],
  publicationDate: "2024-04-29",
  journal: {
    volume: "40",
    pages: "116 - 135",
    name: "IETE Technical Review",
  },
  citationStyles: {
    bibtex: "@['JournalArticle', 'Conference']{Ammar2018ConstructionOT,\n author = {Waleed Ammar and Dirk Groeneveld and Chandra Bhagavatula and Iz Beltagy and Miles Crawford and Doug Downey and Jason Dunkelberger and Ahmed Elgohary and Sergey Feldman and Vu A. Ha and Rodney Michael Kinney and Sebastian Kohlmeier and Kyle Lo and Tyler C. Murray and Hsu-Han Ooi and Matthew E. Peters and Joanna L. Power and Sam Skjonsberg and Lucy Lu Wang and Christopher Wilhelm and Zheng Yuan and Madeleine van Zuylen and Oren Etzioni},\n booktitle = {NAACL},\n pages = {84-91},\n title = {Construction of the Literature Graph in Semantic Scholar},\n year = {2018}\n}\n",
  },
  authors: [
    {
      authorId: "1741101",
      // externalIds: {
      //   DBLP: [
      //     123,
      //   ],
      // },
      // url: "https://www.semanticscholar.org/author/1741101",
      name: "Oren Etzioni",
      // affiliations: [
      //   "Allen Institute for AI",
      // ],
      // homepage: "https://allenai.org/",
      // paperCount: 10,
      // citationCount: 50,
      // hIndex: 5,
    },
  ],
  citations: [
    {
      paperId: "5c5751d45e298cea054f32b392c12c61027d2fe7",
      corpusId: 215416146,
      externalIds: {
        MAG: "3015453090",
        DBLP: "conf/acl/LoWNKW20",
        ACL: "2020.acl-main.447",
        DOI: "10.18653/V1/2020.ACL-MAIN.447",
        CorpusId: 215416146,
      },
      url: "https://www.semanticscholar.org/paper/5c5751d45e298cea054f32b392c12c61027d2fe7",
      title: "Construction of the Literature Graph in Semantic Scholar",
      abstract: "We describe a deployed scalable system for organizing published scientific literature into a heterogeneous graph to facilitate algorithmic manipulation and discovery.",
      venue: "Annual Meeting of the Association for Computational Linguistics",
      publicationVenue: {
        id: "1e33b3be-b2ab-46e9-96e8-d4eb4bad6e44",
        name: "Annual Meeting of the Association for Computational Linguistics",
        type: "conference",
        alternate_names: [
          "Annu Meet Assoc Comput Linguistics",
          "Meeting of the Association for Computational Linguistics",
          "ACL",
          "Meet Assoc Comput Linguistics",
        ],
        url: "https://www.aclweb.org/anthology/venues/acl/",
      },
      year: 1997,
      referenceCount: 59,
      citationCount: 453,
      influentialCitationCount: 90,
      isOpenAccess: true,
      openAccessPdf: {
        url: "https://www.aclweb.org/anthology/2020.acl-main.447.pdf",
        status: "HYBRID",
        license: "CCBY",
        disclaimer: "Notice: This snippet is extracted from the open access paper or abstract available at https://aclanthology.org/2020.acl-main.447, which is subject to the license by the author or copyright owner provided with this content. Please go to the source to verify the license and copyright information for your use.",
      },
      fieldsOfStudy: [
        "Computer Science",
      ],
      s2FieldsOfStudy: [
        {
          category: "Computer Science",
          source: "external",
        },
        {
          category: "Computer Science",
          source: "s2-fos-model",
        },
        {
          category: "Mathematics",
          source: "s2-fos-model",
        },
      ],
      publicationTypes: [
        "Journal Article",
        "Review",
      ],
      publicationDate: "2024-04-29",
      journal: {
        volume: "40",
        pages: "116 - 135",
        name: "IETE Technical Review",
      },
      citationStyles: {
        bibtex: "@['JournalArticle', 'Conference']{Ammar2018ConstructionOT,\n author = {Waleed Ammar and Dirk Groeneveld and Chandra Bhagavatula and Iz Beltagy and Miles Crawford and Doug Downey and Jason Dunkelberger and Ahmed Elgohary and Sergey Feldman and Vu A. Ha and Rodney Michael Kinney and Sebastian Kohlmeier and Kyle Lo and Tyler C. Murray and Hsu-Han Ooi and Matthew E. Peters and Joanna L. Power and Sam Skjonsberg and Lucy Lu Wang and Christopher Wilhelm and Zheng Yuan and Madeleine van Zuylen and Oren Etzioni},\n booktitle = {NAACL},\n pages = {84-91},\n title = {Construction of the Literature Graph in Semantic Scholar},\n year = {2018}\n}\n",
      },
      authors: [
        {
          authorId: "1741101",
          name: "Oren Etzioni",
        },
      ],
    },
  ],
  references: [
    {
      paperId: "5c5751d45e298cea054f32b392c12c61027d2fe7",
      corpusId: 215416146,
      externalIds: {
        MAG: "3015453090",
        DBLP: "conf/acl/LoWNKW20",
        ACL: "2020.acl-main.447",
        DOI: "10.18653/V1/2020.ACL-MAIN.447",
        CorpusId: 215416146,
      },
      url: "https://www.semanticscholar.org/paper/5c5751d45e298cea054f32b392c12c61027d2fe7",
      title: "Construction of the Literature Graph in Semantic Scholar",
      abstract: "We describe a deployed scalable system for organizing published scientific literature into a heterogeneous graph to facilitate algorithmic manipulation and discovery.",
      venue: "Annual Meeting of the Association for Computational Linguistics",
      publicationVenue: {
        id: "1e33b3be-b2ab-46e9-96e8-d4eb4bad6e44",
        name: "Annual Meeting of the Association for Computational Linguistics",
        type: "conference",
        alternate_names: [
          "Annu Meet Assoc Comput Linguistics",
          "Meeting of the Association for Computational Linguistics",
          "ACL",
          "Meet Assoc Comput Linguistics",
        ],
        url: "https://www.aclweb.org/anthology/venues/acl/",
      },
      year: 1997,
      referenceCount: 59,
      citationCount: 453,
      influentialCitationCount: 90,
      isOpenAccess: true,
      openAccessPdf: {
        url: "https://www.aclweb.org/anthology/2020.acl-main.447.pdf",
        status: "HYBRID",
        license: "CCBY",
        disclaimer: "Notice: This snippet is extracted from the open access paper or abstract available at https://aclanthology.org/2020.acl-main.447, which is subject to the license by the author or copyright owner provided with this content. Please go to the source to verify the license and copyright information for your use.",
      },
      fieldsOfStudy: [
        "Computer Science",
      ],
      s2FieldsOfStudy: [
        {
          category: "Computer Science",
          source: "external",
        },
        {
          category: "Computer Science",
          source: "s2-fos-model",
        },
        {
          category: "Mathematics",
          source: "s2-fos-model",
        },
      ],
      publicationTypes: [
        "Journal Article",
        "Review",
      ],
      publicationDate: "2024-04-29",
      journal: {
        volume: "40",
        pages: "116 - 135",
        name: "IETE Technical Review",
      },
      citationStyles: {
        bibtex: "@['JournalArticle', 'Conference']{Ammar2018ConstructionOT,\n author = {Waleed Ammar and Dirk Groeneveld and Chandra Bhagavatula and Iz Beltagy and Miles Crawford and Doug Downey and Jason Dunkelberger and Ahmed Elgohary and Sergey Feldman and Vu A. Ha and Rodney Michael Kinney and Sebastian Kohlmeier and Kyle Lo and Tyler C. Murray and Hsu-Han Ooi and Matthew E. Peters and Joanna L. Power and Sam Skjonsberg and Lucy Lu Wang and Christopher Wilhelm and Zheng Yuan and Madeleine van Zuylen and Oren Etzioni},\n booktitle = {NAACL},\n pages = {84-91},\n title = {Construction of the Literature Graph in Semantic Scholar},\n year = {2018}\n}\n",
      },
      authors: [
        {
          authorId: "1741101",
          name: "Oren Etzioni",
        },
      ],
    },
  ],
  embedding: {
    model: "specter@v0.1.1",
    vector: [
      -8.82082748413086,
      -2.6610865592956543,
    ],
  },
  tldr: {
    model: "tldr@v2.0.0",
    text: "This paper reduces literature graph construction into familiar NLP tasks, point out research challenges due to differences from standard formulations of these tasks, and report empirical results for each task.",
  },
  textAvailability: "string",
};
