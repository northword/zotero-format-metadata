import type { FluentMessageId } from "../../../typings/i10n";
import type { Awaitable } from "../../utils/types";
import type { ReportInfo } from "../reporter";

export interface Context<Option = object> {
  item: Zotero.Item;
  options: Option;
  debug: (...args: any) => void;
  report: (info: Omit<ReportInfo, "itemID" | "title" | "ruleID">) => void;
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
   * @returns T
   */
  getOptions?: () => Awaitable<Option>;

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
    i10nID?: FluentMessageId;

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
   * @todo not implemented
   */
  getFieldMenu?: () => {
    /**
     * The i18n ID of the menu item.
     *
     * @default `rule-${rule.id}-menu-field`
     */
    i10nID?: FluentMessageId;

    icon?: string;

    onCommand?: () => void;
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
