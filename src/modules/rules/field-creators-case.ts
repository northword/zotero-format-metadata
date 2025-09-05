import type { RuleBaseOptions } from "./rule-base";
import { isFullLowerCase, isFullUpperCase } from "../../utils/str";
import { RuleBase } from "./rule-base";

class CapitalizeCreatorsOptions implements RuleBaseOptions {}

/**
 * 将作者转为首字母大写
 * rule: 作者应以首字母大写方式存储
 * @param item
 */
export class CapitalizeCreators extends RuleBase<CapitalizeCreatorsOptions> {
  constructor(options: CapitalizeCreatorsOptions) {
    super(options);
  }

  apply(item: Zotero.Item): Zotero.Item | Promise<Zotero.Item> {
    const creators = item.getCreators();

    for (const creator of creators) {
      creator.firstName
        = isFullUpperCase(creator.firstName!) || isFullLowerCase(creator.firstName!)
          ? Zotero.Utilities.capitalizeName(creator.firstName!.trim())
          : creator.firstName;
      creator.lastName
        = isFullUpperCase(creator.lastName!) || isFullLowerCase(creator.lastName!)
          ? Zotero.Utilities.capitalizeName(creator.lastName!.trim())
          : creator.lastName;
    }
    item.setCreators(creators);
    return item;
  }
}

// todo: 期刊文章必须含有作者
