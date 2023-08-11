export { capitalizeName };
/**
 * 将作者转为首字母大写
 * rule: 作者应以首字母大写方式存储
 * @param item
 */
async function capitalizeName(item: Zotero.Item) {
    const creators = item.getCreators();

    const newCreators = [];
    for (const creator of creators) {
        creator.firstName = Zotero.Utilities.capitalizeName(creator.firstName!.trim());
        creator.lastName = Zotero.Utilities.capitalizeName(creator.lastName!.trim());
        newCreators.push(creator);
    }
    item.setCreators(newCreators);
    await item.saveTx();
}

// todo: 期刊文章必须含有作者
