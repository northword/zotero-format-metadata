export async function updateDate(item: Zotero.Item) {
    const oldDate = item.getField("date") as string,
        newDate = Zotero.Date.strToISO(oldDate);
    newDate ? item.setField("date", newDate) : "";
    await item.saveTx();
}
