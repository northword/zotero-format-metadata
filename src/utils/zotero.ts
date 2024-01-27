export function isRegularItem() {
    const items = ZoteroPane.getSelectedItems(),
        isRegularItem = items.some((item) => item.isRegularItem());
    return isRegularItem;
}
