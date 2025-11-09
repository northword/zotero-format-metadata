import { createLogger } from "../../../../utils/logger";
import { defineService } from "./base-service";

const { debug } = createLogger("arxiv-service");

export const ArxivService = defineService({
  id: "arxiv-service",
  name: "ArXiv Service",
  supportedItemTypes: ["preprint"],
  shouldProcess: ({ identifiers }) => {
    return !!identifiers.arXiv;
  },
  async refreshIdentifiers({ identifiers }) {
    if (!identifiers.arXiv) {
      return;
    }

    const tmpDOI = await getDOIFromArxiv(identifiers.arXiv);
    if (tmpDOI)
      identifiers.DOI = tmpDOI;
  },
});

async function getDOIFromArxiv(arxivID: string): Promise<string | undefined> {
  const url = `https://export.arxiv.org/api/query?id_list=${encodeURIComponent(arxivID)}`;

  const res = await Zotero.HTTP.request("GET", url);
  const result = res.response as string;
  if (!result) {
    debug("从 Arxiv API 请求失败");
    return undefined;
  }
  const doc = new DOMParser().parseFromString(result, "text/xml");
  const refDoi = doc.querySelector("doi");
  if (refDoi) {
    debug("Got DOI from Arxiv", refDoi);
    return refDoi.innerHTML as string;
  }
  debug("ArXiv did not return DOI");
  return undefined;
}
