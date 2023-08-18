import { duplicationDialog } from "../views/duplicationDialog";

export async function isDuplicate(item: Zotero.Item) {
    // const item = Zotero.getActiveZoteroPane().getSelectedItems()[0];
    const itemID = item.id;

    const duplicates = new Zotero.Duplicates("1");
    // console.log("Zotero.Duplicates", duplicates);

    const search = (await duplicates.getSearchObject()) as Zotero.Search;
    // console.log("d.getSearchObject", search);

    const searchResult = await search.search();
    // console.log(searchResult);

    if (searchResult.includes(itemID)) {
        ztoolkit.log("当前条目存在重复条目", item);
        await duplicationDialog.showDialog(item);
    } else {
        ztoolkit.log("当前条目未发现重复条目");
    }
}
