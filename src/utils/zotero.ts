export function isRegularItem() {
    const items = ZoteroPane.getSelectedItems(),
        isRegularItem = items.some((item) => item.isRegularItem());
    return isRegularItem;
}

export function filterRegularItem(items: Array<Zotero.Item>) {
    return items.filter(
        (item) =>
            item.isRegularItem() &&
            // @ts-ignore item has no isFeedItem
            !item.isFeedItem &&
            // @ts-ignore libraryID is got from item, so get() will never return false
            (getPref("updateOnAddedForGroup") ? true : Zotero.Libraries.get(item.libraryID)._libraryType == "user"),
    );
}
