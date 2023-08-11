async function isDuplicate(item: Zotero.Item) {
    // const item = Zotero.getActiveZoteroPane().getSelectedItems()[0];
    const itemID = item.id;

    const duplicates = new Zotero.Duplicates("1");
    // console.log("Zotero.Duplicates", duplicates);

    const search = (await duplicates.getSearchObject()) as Zotero.Search;
    // console.log("d.getSearchObject", search);

    const searchResult = await search.search();
    // console.log(searchResult);

    if (searchResult.includes(itemID)) {
        console.log("有重复条目");
        return true;
    } else {
        console.log("未发现重复条目");
        return false;
    }
}

export async function duplication(item: Zotero.Item) {
    if (await isDuplicate(item)) {
        // show duplication dialog
    } else {
        // skip
    }
}
