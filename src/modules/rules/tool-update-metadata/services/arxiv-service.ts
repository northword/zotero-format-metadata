import { defineService } from "./base-service";

export const ArxivService = defineService({
  id: "arxiv-service",
  name: "ArXiv Service",
  supportedItemTypes: ["preprint"],
  cooldown: 3_000,
  shouldApply: ({ identifiers }) => {
    return !!identifiers.arXiv;
  },
  async updateIdentifiers({ identifiers, debug }) {
    if (!identifiers.arXiv) {
      return;
    }

    const url = `https://export.arxiv.org/api/query?id_list=${encodeURIComponent(identifiers.arXiv)}`;

    const res = await Zotero.HTTP.request("GET", url);
    const result = res.response as string;
    if (!result) {
      debug("Failed to get DOI from arXiv");
      return;
    }

    const doc = new DOMParser().parseFromString(result, "text/xml");
    const refDoi = doc.querySelector("doi");
    if (!refDoi) {
      debug("ArXiv did not return DOI");
      return;
    }

    debug("Got DOI from Arxiv", refDoi);
    identifiers.DOI = refDoi.innerHTML as string;
  },
});
