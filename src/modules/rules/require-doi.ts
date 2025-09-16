import { defineRule } from "./rule-base";

export const RequireDOI = defineRule({
  id: "require-doi",
  scope: "field",
  targetItemField: "DOI",
  targetItemTypes: ["journalArticle", "conferencePaper"],

  async apply({ item, report, debug }) {
    const doi = item.getField("DOI");
    if (doi)
      return;

    debug("DOI is empty, trying CrossRef lookup");

    const crossrefOpenURL = "https://www.crossref.org/openurl?pid=zoteroDOI@wiernik.org&";
    // @ts-expect-error miss types
    const ctx = Zotero.OpenURL.createContextObject(item, "1.0");
    if (!ctx) {
      report({ level: "warning", message: "Could not build OpenURL context" });
      return;
    }

    const url = `${crossrefOpenURL + ctx}&multihit=true`;
    const req = await Zotero.HTTP.request("GET", url);

    if (req.status !== 200) {
      throw `CrossRef request error: ${req.status}`;
    }

    const response = req.responseXML?.getElementsByTagName("query")[0];
    if (!response) {
      throw "CrossRef response XML parse error";
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
      throw `CrossRef unknown status: ${status}`;
    }
  },
});
