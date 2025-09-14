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
  id: string;
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
  getItemMenu?: () => any;

  /**
   * Field menus
   *
   * @todo not implemented
   */
  getFieldMenu?: () => any;
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

interface RuleForRegularItemScopeItem<Option = object> extends RuleForRegularItem<Option> {
  scope: "item";
}

interface RuleForRegularScopeField<Option = object> extends RuleForRegularItem<Option> {
  scope: "field";
  targetItemField: _ZoteroTypes.Item.ItemField | "creators";
}

/**
 * @todo unimplemented
 */
interface RuleForTag<Option = object> extends RuleBase<Option> {
  scope: "tag";
}

/**
 * @todo unimplemented
 */
interface RuleForAttachment<Option = object> extends RuleBase<Option> {
  scope: "attachment";
}

export type Rule<Option = object>
  = | RuleForRegularItemScopeItem<Option>
    | RuleForRegularScopeField<Option>
    | RuleForTag<Option>
    | RuleForAttachment<Option>;

export function defineRule<Options = unknown>(rule: Rule<Options>) {
  return rule;
}
