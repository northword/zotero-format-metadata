import { getString } from "../../utils/locale";
import { defineRule } from "./rule-base";

export const NoItemDuplication = defineRule({
  id: "no-item-duplication",
  scope: "item",

  async apply({ item, report, debug }) {
    // const item = Zotero.getActiveZoteroPane().getSelectedItems()[0];
    const itemID = item.id;
    const libraryID = item.libraryID;

    // @ts-expect-error miss types for `Zotero.Duplicates`
    const duplicates = new Zotero.Duplicates(libraryID);
    // debug("Zotero.Duplicates", duplicates);

    const search = (await duplicates.getSearchObject()) as Zotero.Search;
    // debug("d.getSearchObject", search);

    const searchResult = await search.search();
    // debug(searchResult);

    if (searchResult.includes(itemID)) {
      report({
        level: "error",
        message: getString("rule-no-item-duplication-report-message"),
        action: {
          label: getString("rule-no-item-duplication-report-action"),
          callback: () => {
            const mainWindow = Zotero.getMainWindow();
            if (!mainWindow)
              return;

            // Un-minimize if minimized
            if (mainWindow.windowState === mainWindow.STATE_MINIMIZED)
              mainWindow.restore();

            // Focus the main window
            mainWindow.focus();

            // Focus to item tree view
            mainWindow.Zotero_Tabs.select("zotero-pane");

            // Focus to 'duplicates' collection
            mainWindow.ZoteroPane.setVirtual(item.libraryID, "duplicates", true, true);
          },
        },
      });
      // await duplicationDialog.showDialog(item);
    }
    else {
      debug("No duplicates found");
    }
  },
});
