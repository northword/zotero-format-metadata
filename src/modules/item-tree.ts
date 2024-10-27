import { config } from "../../package.json";
import { getString } from "../utils/locale";

export async function registerExtraColumns() {
  await Zotero.ItemTreeManager.registerColumns({
    dataKey: "abbr",
    label: getString("field-abbr"),
    dataProvider: (item, _dataKey) => {
      if (item.itemType === "journalArticle")
        return item.getField("journalAbbreviation");
      else if (item.itemType === "thesis")
        return item.getField("university");
      else if (item.itemType === "patent")
        return item.getField("country");
      else if (item.itemType === "conferencePaper")
        return ztoolkit.ExtraField.getExtraField(item, "shortConferenceName") || "";
      else
        return ztoolkit.ExtraField.getExtraField(item, "abbr") || "";
    },
    pluginID: config.addonID,
    zoteroPersist: ["width", "hidden", "sortDirection"],
  });
}
