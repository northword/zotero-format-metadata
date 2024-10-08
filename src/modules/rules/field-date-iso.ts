import type { RuleBaseOptions } from "./rule-base";
import { RuleBase } from "./rule-base";

class DateISOOptions implements RuleBaseOptions {}

export class DateISO extends RuleBase<DateISOOptions> {
  constructor(options: DateISOOptions) {
    super(options);
  }

  apply(item: Zotero.Item): Zotero.Item {
    const oldDate = item.getField("date") as string;
    const newDate = Zotero.Date.strToISO(oldDate);
    if (newDate)
      item.setField("date", newDate);
    return item;
  }
}
