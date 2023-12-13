export async function updateDOI(item: Zotero.Item) {
    const doi = item.getField("DOI");
    if (doi && typeof doi == "string") {
        const cleandDOI = Zotero.Utilities.cleanDOI(doi);
        cleandDOI ? item.setField("DOI", cleandDOI) : "pass";
    }
    return item;
    // await item.saveTx();
}
