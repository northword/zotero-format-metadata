import type { RuleBaseOptions } from "./rule-base";
import { duplicationDialog } from "../views/duplicationDialog";
import { RuleBase } from "./rule-base";

class NoDuplicatItemOptions implements RuleBaseOptions {}

export class NoDuplicatItem extends RuleBase<NoDuplicatItemOptions> {
  constructor(options: NoDuplicatItemOptions) {
    super(options);
  }

  async apply(item: Zotero.Item): Promise<Zotero.Item> {
    // const item = Zotero.getActiveZoteroPane().getSelectedItems()[0];
    const itemID = item.id;
    const libraryID = item.libraryID;

    // @ts-expect-error miss types for `Zotero.Duplicates`
    const duplicates = new Zotero.Duplicates(libraryID);
    // ztoolkit.log("Zotero.Duplicates", duplicates);

    const search = (await duplicates.getSearchObject()) as Zotero.Search;
    // ztoolkit.log("d.getSearchObject", search);

    const searchResult = await search.search();
    // ztoolkit.log(searchResult);

    if (searchResult.includes(itemID)) {
      ztoolkit.log("当前条目存在重复条目", item);
      await duplicationDialog.showDialog(item);
    }
    else {
      ztoolkit.log("当前条目未发现重复条目");
    }

    return item;
  }
}
