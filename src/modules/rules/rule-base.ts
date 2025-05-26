import type { FluentMessageId } from "../../../typings/i10n";
import { getString } from "../../utils/locale";

export interface RuleBaseOptions {
  [optionName: string]: any;
}

type RuleType = "field" | "item";

export interface RuleMetaData {
  nameKey: FluentMessageId;
  descriptionKey?: FluentMessageId;
  type: RuleType[];
  targetItemTypes: _ZoteroTypes.Item.ItemType[];
  targetItemFields?: _ZoteroTypes.Item.ItemField[];
  hasSpecialExecutionOrder?: boolean;
}

export abstract class RuleBase<TOptions extends RuleBaseOptions> {
  options?: TOptions;
  meta: RuleMetaData;

  constructor(meta: RuleMetaData, options?: TOptions) {
    this.meta = meta;
    this.options = options;
  }

  get name(): string {
    return getString(this.meta.nameKey);
  }

  get description(): string {
    return getString(this.meta.descriptionKey || this.meta.nameKey);
  }

  protected shouldApply(item: Zotero.Item): boolean {
    if (this.meta.targetItemTypes
      && !this.meta.targetItemTypes.includes(item.itemType)) {
      return false;
    }

    // if (this.meta.targetItemFields) {
    //   return this.meta.targetItemFields.every(field =>
    //     item.getField(field) !== undefined,
    //   );
    // }

    return true;
  }

  public async execute(item: Zotero.Item): Promise<Zotero.Item> {
    if (!this.shouldApply(item)) {
      return item;
    }
    return this.apply(item);
  }

  public debug(...arg: any[]) {
    ztoolkit.log(`[${this.name}] `, ...arg);
  }

  public log(...arg: any[]) {
    ztoolkit.log(`[${this.name}] `, ...arg);
  }

  public error(...arg: any[]) {
    //
  }

  protected abstract apply(item: Zotero.Item): Zotero.Item | Promise<Zotero.Item>;
}
