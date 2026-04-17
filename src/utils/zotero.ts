export function isRegularItem() {
  const items = Zotero.getActiveZoteroPane().getSelectedItems();
  const isRegularItem = items.some(item => item.isRegularItem());
  return isRegularItem;
}

export function isFieldValidForItemType(field: _ZoteroTypes.Item.ItemField, itemTypeID: number): boolean;
export function isFieldValidForItemType(field: _ZoteroTypes.Item.ItemField, itemType: _ZoteroTypes.Item.ItemType): boolean;
export function isFieldValidForItemType(field: _ZoteroTypes.Item.ItemField, itemType: _ZoteroTypes.Item.ItemType | number) {
  return Zotero.ItemFields.isValidForType(
    Zotero.ItemFields.getID(field),
    typeof itemType === "number" ? itemType : Zotero.ItemTypes.getID(itemType),
  );
}
