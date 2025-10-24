import type { FluentMessageId } from "../../../typings/i10n";
import type { Awaitable } from "../../utils/types";
import type { ReportInfo } from "../reporter";

export interface Context<Option = object> {
  item: Zotero.Item;
  /**
   * @default {}
   */
  options: Option;
  debug: (...args: any) => void;
  report: (info: Pick<ReportInfo, "level" | "message" | "action">) => void;
}

interface RuleBase<Option = object> {
  /**
   * The unique ID of the rule.
   *
   * Should be kebab-case.
   */
  id: ID;
  /**
   * The name of the rule.
   *
   * @default `rule-${rule.id}`
   */
  nameKey?: FluentMessageId | string;
  /**
   * The description of the rule.
   *
   * @default `rule-${rule.id}-description`
   */
  descriptionKey?: FluentMessageId;
  /**
   * The type of the rule.
   *
   * @todo tag and attachment are not implemented
   */
  scope: "field" | "item" | "tag" | "attachment";
  /**
   * Whether the rule is a tool.
   *
   * @default "rule"
   */
  category?: "rule" | "tool";

  /**
   * The documentation link of the rule.
   *
   * Prefix is `https://github.com/northword/zotero-format-metadata/blob/main/docs/rules/`,
   * prefix are not required.
   *
   * @default "id.md"
   * @todo not implemented
   */
  documentation?: string;

  /**
   * Handler of the rule.
   *
   * @example
   * async apply({ item, report }) {
   *   // Modify item
   *   item.setField("title", "New Title");
   *
   *   // Report error
   *   report({
   *     level: "error",
   *     message: "Title is too long"
   *   })
   * }
   */
  apply: (ctx: Context<Option>) => Awaitable<void>;

  /**
   * Get options of the rule.
   *
   * If returns false, the rule will be skipped.
   */
  getOptions?: (ctx: { items: Zotero.Item[] }) => Awaitable<Option | false>;

  /**
   * Item menus
   *
   * @todo not implemented
   */
  getItemMenu?: () => {
    /**
     * The i18n ID of the menu item.
     *
     * @default `rule-${rule.id}-menu-item`
     */
    l10nID?: FluentMessageId;

    icon?: string;

    /**
     * Whether the menu item can be applied to multiple items.
     *
     * @default true
     */
    mutiltipleItems?: boolean;

    onCommand?: () => void;
  };
}

interface RuleForRegularItem<Option = object> extends RuleBase<Option> {
  scope: "item" | "field";
  /**
   * The target item types of the rule.
   */
  targetItemTypes?: _ZoteroTypes.Item.ItemType[];
  /**
   * The ignore item types of the rule.
   */
  ignoreItemTypes?: _ZoteroTypes.Item.ItemType[];
}

export interface RuleForRegularItemScopeItem<Option = object> extends RuleForRegularItem<Option> {
  scope: "item";
}

export interface RuleForRegularScopeField<Option = object> extends RuleForRegularItem<Option> {
  scope: "field";
  targetItemField: _ZoteroTypes.Item.ItemField | "creators";

  /**
   * Field menus
   *
   * `undefined` means no itempane info row menu
   */
  fieldMenu?: {
    /**
     * The i18n ID of the menu item.
     *
     * @example `rule-${rule.id}-menu-field`
     */
    l10nID: Extract<FluentMessageId, `rule-${string}-menu-field`>;

    icon?: string;

    onCommand?: (ctx: _ZoteroTypes.MenuManager.ItemPaneMenuContext) => void;

    setDisabled?: (ctx: _ZoteroTypes.MenuManager.ItemPaneMenuContext) => boolean;
  };
}

/**
 * @todo unimplemented
 */
export interface RuleForTag<Option = object> extends RuleBase<Option> {
  scope: "tag";
}

/**
 * @todo unimplemented
 */
export interface RuleForAttachment<Option = object> extends RuleBase<Option> {
  scope: "attachment";
}

export type Rule<Option = object>
  = | RuleForRegularItemScopeItem<Option>
    | RuleForRegularScopeField<Option>
    | RuleForTag<Option>
    | RuleForAttachment<Option>;

// We overide id's type to string, so that
// we can supress type error when add new rule.
type WithStringID<R> = R extends any ? Omit<R, "id"> & { id: string } : never;

export function defineRule<Options = unknown>(
  rule: WithStringID<Rule<Options>>,
): Rule<Options> {
  return rule as Rule<Options>;
}
