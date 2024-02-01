import { RuleBase, RuleBaseOptions } from "./rule-base";

class DataISOOptions implements RuleBaseOptions {}

export default class DataISO extends RuleBase<DataISOOptions> {
    constructor(options: DataISOOptions) {
        super(options);
    }

    apply(item: Zotero.Item): Zotero.Item {
        const oldDate = item.getField("date") as string,
            newDate = Zotero.Date.strToISO(oldDate);
        newDate ? item.setField("date", newDate) : "";
        return item;
    }
}
