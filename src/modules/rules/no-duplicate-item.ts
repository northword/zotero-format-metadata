import { getString } from "../../utils/locale";
import { defineRule } from "./rule-base";

export const NoDuplicatItem = defineRule({
  id: "no-duplicate-item",
  type: "item",

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
        message: "当前条目存在重复条目",
        action: {
          label: getString("dialog-dup-button-merge"),
          callback: () => {
            const mainWindow = Zotero.getMainWindow();
            if (mainWindow) {
            // Un-minimize if minimized
              if (mainWindow.windowState === mainWindow.STATE_MINIMIZED) {
                mainWindow.restore();
              }
              // Focus the main window
              mainWindow.focus();
              Zotero.getActiveZoteroPane().setVirtual(item.libraryID, "duplicates", true, true);
            }
          },
        },
      });
      // await duplicationDialog.showDialog(item);
    }
    else {
      debug("当前条目未发现重复条目");
    }
  },
});
