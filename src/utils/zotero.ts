export function isRegularItem() {
    const items = Zotero.getActiveZoteroPane().getSelectedItems(),
        isRegularItem = items.some((item) => item.isRegularItem());
    return isRegularItem;
}
