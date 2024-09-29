import type { RuleBaseOptions } from "./rule-base";
import { RuleBase } from "./rule-base";

class TitleGuillemetOptions implements RuleBaseOptions {
  target: "single" | "double" = "double";
}

/**
 * Replaces `《》` to `〈〉`
 * @see https://github.com/redleafnew/Chinese-STD-GB-T-7714-related-csl/issues/204
 */
export class TitleGuillemet extends RuleBase<TitleGuillemetOptions> {
  constructor(options: TitleGuillemetOptions) {
    super(options);
  }

  apply(item: Zotero.Item): Zotero.Item | Promise<Zotero.Item> {
    const title = item.getField("title", false, true) as string;
    let newTitle: string;
    if (this.options.target === "single") {
      newTitle = title.replace(/《/g, "〈").replace(/》/g, "〉");
    }
    else if (this.options.target === "double") {
      newTitle = title.replace(/〈/g, "《").replace(/〉/g, "》");
    }
    else {
      newTitle = title;
    }
    item.setField("title", newTitle);
    return item;
  }
}
