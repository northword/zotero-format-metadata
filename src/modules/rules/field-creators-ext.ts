// todo: 期刊文章必须含有作者
interface CreatorExt extends Zotero.Item.CreatorJSON {
    country: string;
    fieldMode: number;
    original: string;
}
// 交换作者拓展信息
function creatorExt(
    item: Zotero.Item,
    options: { markOpen: string; markClose: string } = { markOpen: "[", markClose: "]" },
) {
    // const creatorsExt = item.getExtraField("creatorsExt");
    const creatorsExtRaw = ztoolkit.ExtraField.getExtraField(item, "creatorsExt");
    if (!creatorsExtRaw) return item;

    const creatorsExt = JSON.parse(creatorsExtRaw) as CreatorExt[];
    if (!creatorsExt) return item;

    creatorsExt.forEach((creatorExt, index) => {
        let newCreator: Zotero.Item.Creator;
        if (creatorExt.country) {
            creatorExt.lastName = `${options?.markOpen + creatorExt.country + options?.markClose} ${
                creatorExt.lastName
            }`;
        }
        item.setCreator(index, creatorExt);
    });
    return item;
}
