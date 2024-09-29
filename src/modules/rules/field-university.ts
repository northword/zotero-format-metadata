import type { RuleBaseOptions } from "./rule-base";
import { RuleBase } from "./rule-base";

class UiversityOptions implements RuleBaseOptions {}

export class University extends RuleBase<UiversityOptions> {
  constructor(options: UiversityOptions) {
    super(options);
  }

  apply(item: Zotero.Item): Zotero.Item {
    if (item.itemType !== "thesis")
      return item;

    const language = item.getField("language");
    let university = item.getField("university");

    university = language.includes("zh") ? university.replace("(", "（").replace(")", "）") : university;

    item.setField("university", university);
    return item;
  }
}
