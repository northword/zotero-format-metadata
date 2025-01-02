import type { RuleBaseOptions } from "./rule-base";
import { RuleBase } from "./rule-base";

class SetFieldValueOptions implements RuleBaseOptions {
  field: _ZoteroTypes.Item.ItemField = "language";
  value: string | number | undefined = undefined;
}

export class SetFieldValue extends RuleBase<SetFieldValueOptions> {
  constructor(options: SetFieldValueOptions) {
    super(options);
  }

  apply(item: Zotero.Item): Zotero.Item | Promise<Zotero.Item> {
    if (this.options.value === undefined) {
      return item;
    }
    else {
      item.setField(this.options.field, this.options.value);
      // await item.saveTx();
    }
    return item;
  }
}
