export async function updateDOI(item: Zotero.Item) {
    const doi = item.getField("DOI");
    if (doi && typeof doi == "string") {
        const doiCleand = Zotero.Utilities.cleanDOI(doi);
        doiCleand ? item.setField("DOI", doiCleand) : "pass";
    }
    await item.saveTx();
}
