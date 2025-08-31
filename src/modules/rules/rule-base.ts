import type { FluentMessageId } from "../../../typings/i10n";
import { getString } from "../../utils/locale";
import { getPref } from "../../utils/prefs";

export interface RuleBaseOptions {
  [optionName: string]: any;
}

type RuleType = "field" | "item";

export interface RuleMetaData<K> {
  nameKey: K;
  descriptionKey?: FluentMessageId;
  type: RuleType[];
  targetItemTypes: _ZoteroTypes.Item.ItemType[];
  targetItemFields?: _ZoteroTypes.Item.ItemField[];
  hasSpecialExecutionOrder?: boolean;
}

// type RulesPrefsOnly = {
//   [K in keyof _ZoteroTypes.Prefs["PluginPrefsMap"] as K extends `rules.${string}` ? K : never]:
//   _ZoteroTypes.Prefs["PluginPrefsMap"][K];
// };

// type StripRulesPrefix<T> = {
//   [K in keyof T as K extends `rules.${infer Rest}` ? Rest : never]: T[K];
// };

// type RulesPrefsOnly = StripRulesPrefix<_ZoteroTypes.Prefs["PluginPrefsMap"]>;

type PluginPrefsMap = _ZoteroTypes.Prefs["PluginPrefsMap"];
type RulePrefs<R extends string> = {
  [K in keyof PluginPrefsMap as K extends `rules.${R}.${infer Rest}` ? Rest : never]: PluginPrefsMap[K];
};
type RulePrefs2 = {
  [K in keyof PluginPrefsMap as K extends `rules.${infer Rest}` ? Rest : never]: PluginPrefsMap[K];
};

export abstract class RuleBase<K, TOptions extends RuleBaseOptions> {
  readonly #options?: TOptions;
  readonly meta: RuleMetaData<K>;

  constructor(meta: RuleMetaData<K>, options?: TOptions) {
    this.meta = meta;
    this.#options = options;
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

  protected abstract apply(item: Zotero.Item): Zotero.Item | Promise<Zotero.Item>;

  public debug(...arg: any[]) {
    ztoolkit.log(`[${this.name}] `, ...arg);
  }

  public log(...arg: any[]) {
    ztoolkit.log(`[${this.name}] `, ...arg);
  }

  public error(..._arg: any[]) {
    //
  }

  public getPref(key: keyof RulePrefs2 | keyof TOptions): any {
    // this._getPref<this.meta.nameKey>
  }

  _getPref(key: keyof RulePrefs<K>): any {
    //
  }

  // public getPref<K extends keyof RulePrefs<this["meta"]["nameKey"]>>(
  //   key: K,
  // ): RulePrefs<this["meta"]["nameKey"]>[K] {
  //   const fullKey = `rules.${this.meta.nameKey}.${key}` as keyof _ZoteroTypes.Prefs["PluginPrefsMap"];
  //   return Zotero.Prefs.get(fullKey) as PluginPrefsMap[fullKey];
  // }
}

// export function RegisterRule<TMeta extends RuleMetaData>(meta: TMeta) {
//   return function <
//     T extends new (...args: any[]) => RuleBase<any, TMeta>, // 强约束：子类必须与 meta 匹配
//   >(constructor: T) {
//     const expectedNameKey = toKebabCase(constructor.name);

//     if (!meta.nameKey) {
//       meta.nameKey = expectedNameKey as TMeta["nameKey"];
//     }
//     else if (meta.nameKey !== expectedNameKey) {
//       console.warn(`[RegisterRule] nameKey "${meta.nameKey}" != "${expectedNameKey}"`);
//     }

//     (constructor as any).meta = meta;
//     registerRule(constructor, meta);
//   };
// }

// function toKebabCase(str: string): string {
//   return str
//     .replace(/([a-z])([A-Z])/g, "$1-$2")
//     .replace(/[\s_]+/g, "-")
//     .toLowerCase();
// }
