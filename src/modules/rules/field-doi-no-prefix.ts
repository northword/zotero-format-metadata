import type { RuleBaseOptions } from "./rule-base";
import { RuleBase } from "./rule-base";

class RemoveDOIPrefixOptions implements RuleBaseOptions {}

export class RemoveDOIPrefix extends RuleBase<RemoveDOIPrefixOptions> {
  constructor(options: RemoveDOIPrefixOptions) {
    super(options);
  }

  apply(item: Zotero.Item): Zotero.Item {
    const doi = item.getField("DOI");
    if (doi && typeof doi === "string") {
      const cleandDOI = Zotero.Utilities.cleanDOI(doi);
      if (cleandDOI)
        item.setField("DOI", cleandDOI);
    }
    return item;
  }
}
