export function isRegularItem() {
  const items = Zotero.getActiveZoteroPane().getSelectedItems();
  const isRegularItem = items.some(item => item.isRegularItem());
  return isRegularItem;
}
