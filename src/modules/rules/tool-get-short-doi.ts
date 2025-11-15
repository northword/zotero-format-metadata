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
  cooldown: 20, //  The rate limit is 50 requests per second.

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

    const exists = ztoolkit.ExtraField.getExtraField(item, "short-doi");
    if (exists) {
      return;
    }

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
      debug("ShortDOI obtained:", json.ShortDOI);
      ztoolkit.ExtraField.setExtraField(item, "short-doi", json.ShortDOI);
    }
    else {
      report({ level: "warning", message: "ShortDOI not found in response" });
    }
  },
});
