export interface RuleBaseOptions {
  [optionName: string]: any;
}

export abstract class RuleBase<TOptions extends RuleBaseOptions> {
  options: TOptions;
  constructor(options: TOptions) {
    this.options = options;
    // ztoolkit.log(`Init Rule ${this.constructor.name}`);
  }

  // abstract apply(item: Zotero.Item): Zotero."";
  abstract apply(item: Zotero.Item): Zotero.Item | Promise<Zotero.Item>;
}
