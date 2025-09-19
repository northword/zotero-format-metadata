import { defineRule } from "./rule-base";

export const RequireDOI = defineRule({
  id: "require-doi",
  scope: "field",
  targetItemField: "DOI",
  targetItemTypes: ["journalArticle", "conferencePaper"],

  async apply({ item, report, debug }) {
    if (item.getField("language").startsWith("zh")) {
      debug("Skipping for Chinese language");
      return;
    }

    const doi = item.getField("DOI");
    if (doi)
      return;

    debug("DOI is empty, trying CrossRef lookup");

    // @ts-expect-error miss types
    const ctx = Zotero.OpenURL.createContextObject(item, "1.0");
    if (!ctx) {
      throw new Error("Could not build OpenURL context");
    }

    const url = `https://www.crossref.org/openurl?pid=${addon.data.config.addonID}&${ctx}&multihit=true`;
    const req = await Zotero.HTTP.request("GET", url, {
      responseType: "xml",
    })
      // We catch here and re-throw because this error message is too long
      .catch((error) => {
        throw new Error(`CrossRef request error, ${error.status}`);
      });

    if (req.status !== 200) {
      throw new Error(`CrossRef request error: ${req.status}`);
    }

    const response = req.responseXML?.getElementsByTagName("query")[0];
    if (!response) {
      throw new Error("CrossRef response XML parse error");
    }

    const status = response.getAttribute("status");
    if (status === "resolved") {
      const newDOI = response.getElementsByTagName("doi")[0]?.textContent;
      if (newDOI) {
        debug("CrossRef resolved DOI:", newDOI);
        item.setField("DOI", newDOI);
      }
    }
    else if (status === "unresolved") {
      report({ level: "warning", message: "No DOI found on CrossRef" });
    }
    else if (status === "multiresolved") {
      report({ level: "warning", message: "Multiple possible DOIs found on CrossRef" });
    }
    else {
      throw new Error(`CrossRef unknown status: ${status}`);
    }
  },
});
