import { RuleBase, RuleBaseOptions } from "../../utils/rule-base";

class CapitalizeCreatorsOptions implements RuleBaseOptions {}

/**
 * 将作者转为首字母大写
 * rule: 作者应以首字母大写方式存储
 * @param item
 */
export default class CapitalizeCreators extends RuleBase<CapitalizeCreatorsOptions> {
    constructor(options: CapitalizeCreatorsOptions) {
        super(options);
    }

    apply(item: Zotero.Item): Zotero.Item | Promise<Zotero.Item> {
        const creators = item.getCreators();

        const newCreators = [];
        for (const creator of creators) {
            creator.firstName = Zotero.Utilities.capitalizeName(creator.firstName!.trim());
            creator.lastName = Zotero.Utilities.capitalizeName(creator.lastName!.trim());
            newCreators.push(creator);
        }
        item.setCreators(newCreators);
        return item;
    }
}
