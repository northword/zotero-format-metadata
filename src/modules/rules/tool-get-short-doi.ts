import { defineRule } from "./rule-base";

/**
 *
 * @example
 *
 * GET https://shortdoi.org/10.1021/jacs.5c01100?format=json
 * {
 *   "DOI":"10.1021/jacs.5c01100",
 *   "ShortDOI":"10/p54k",
 *   "IsNew":false
 * }
 */
interface Result {
  DOI: string;
  ShortDOI: string;
  IsNew: boolean;
}

export const ToolGetShortDOI = defineRule({
  id: "tool-get-short-doi",
  scope: "field",
  targetItemField: "DOI",
  category: "tool",
  targetItemTypes: ["journalArticle", "conferencePaper"],

  async apply({ item, report, debug }) {
    const doi = item.getField("DOI");
    if (!doi || typeof doi !== "string") {
      report({ level: "warning", message: "Item has no DOI" });
      return;
    }

    const cleanDOI = Zotero.Utilities.cleanDOI(doi);
    if (!cleanDOI) {
      report({ level: "warning", message: "DOI is invalid" });
      return;
    }

    try {
      const url = `https://shortdoi.org/${encodeURIComponent(cleanDOI)}?format=json`;
      const req = await Zotero.HTTP.request("GET", url);

      if (req.status !== 200) {
        report({ level: "warning", message: `ShortDOI request failed: ${req.status}` });
        return;
      }

      if (!req.responseText) {
        return;
      }

      const json: Result = JSON.parse(req.responseText);
      if (json.ShortDOI) {
        const shortDOI: string = json.ShortDOI.toLowerCase();
        debug("ShortDOI obtained:", shortDOI);

        const extra = item.getField("extra") || "";
        const newExtra = extra.includes("ShortDOI:")
          ? extra.replace(/ShortDOI:.*$/m, `ShortDOI: ${shortDOI}`)
          : `${extra}\nShortDOI: ${shortDOI}`;
        item.setField("extra", newExtra.trim());
      }
      else {
        report({ level: "warning", message: "ShortDOI not found in response" });
      }
    }
    catch (e) {
      report({ level: "error", message: `ShortDOI error: ${String(e)}` });
    }
  },

  // getItemMenu() {
  //   return {
  //     i10nID: "rule-tool-get-short-doi-menu-item",
  //     icon: "chrome://zotero/skin/doi.png",
  //     mutiltipleItems: true,
  //   };
  // },
});
