import type { RuleBaseOptions } from "./rule-base";
import { RuleBase } from "./rule-base";

class Options implements RuleBaseOptions {}

/**
 * Replaces dot in title end
 * @see https://github.com/northword/zotero-format-metadata/issues/213
 */
export class TitleNoDotEnd extends RuleBase<Options> {
  constructor(options: Options) {
    super(options);
  }

  apply(item: Zotero.Item): Zotero.Item | Promise<Zotero.Item> {
    const title = item.getField("title", false, true) as string;
    const newTitle = title.replace(/(.*)\.$/g, "$1");
    item.setField("title", newTitle);
    return item;
  }
}
