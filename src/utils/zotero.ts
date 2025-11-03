export function isRegularItem() {
  const items = Zotero.getActiveZoteroPane().getSelectedItems();
  const isRegularItem = items.some(item => item.isRegularItem());
  return isRegularItem;
}

export function getItemFields(item: Zotero.Item): _ZoteroTypes.Item.ItemField[] {
  return Zotero.ItemFields
    .getItemTypeFields(item.itemTypeID)
    .map((id: number) => Zotero.ItemFields.getName(id));
}

export function getUsedItemFields(item: Zotero.Item): _ZoteroTypes.Item.ItemField[] {
  return item.getUsedFields().map(Zotero.ItemFields.getName);
}
