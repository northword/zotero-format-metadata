import type { Arrayable } from "../utils/types";
import type { ReportInfo } from "./reporter";
import type { ApplyContext, PrepareContext, Rule } from "./rules/rule-base";
import { withTimeout } from "es-toolkit";
import { DataLoader } from "../utils/data-loader";
import { toArray } from "../utils/general";
import { createLogger } from "../utils/logger";
import { getPref } from "../utils/prefs";
import { isFieldValidForItemType } from "../utils/zotero";
import { createReporter, ProgressUI } from "./reporter";
import { Rules } from "./rules";

const logger = createLogger("Runner");
/**
 * ConcurrentCaller
 * @see https://github.com/zotero/zotero/blob/main/resource/concurrentCaller.mjs
 */
const { ConcurrentCaller } = Zotero.version.startsWith("8")
  ? ChromeUtils.importESModule("resource://zotero/concurrentCaller.mjs")
  : Components.utils.import("resource://zotero/concurrentCaller.js");

interface RunnerStats {
  total: number;
  current: number;
  pass: number;
  error: number;
  startTime: number;
  records: ReportInfo[];
}

function shouldApplyRule(rule: Rule<any>, item: Zotero.Item): boolean {
  // tag and attachment rules are not implemented
  if (rule.scope !== "item" && rule.scope !== "field") {
    return false;
  }
  if (!item.isRegularItem()) {
    return false;
  }

  /*  For regular item and rule  */
  if (rule.targetItemTypes && rule.ignoreItemTypes) {
    logger.warn(`Rule ${rule.id} has both targetItemTypes and ignoreItemTypes.`);
  }

  // Check item type
  if (rule.targetItemTypes && !rule.targetItemTypes.includes(item.itemType)) {
    logger.debug(`Skip ${rule.id}: ${item.itemType} not supported by this rule`);
    return false;
  }
  if (rule.ignoreItemTypes?.includes(item.itemType)) {
    logger.debug(`Skip ${rule.id}: ${item.itemType} is ignored by this rule`);
    return false;
  }

  if (rule.scope === "field") {
    // if targetField of this rule is primary field, always apply
    if (rule.targetItemField === "creators")
      return true;

    // Check this target field is included in this item type
    if (!isFieldValidForItemType(rule.targetItemField, item.itemType)) {
      if (!rule.includeMappedFields) {
        logger.debug(`Skip ${rule.id}: ${rule.targetItemField} not valid for ${item.itemType}`);
        return false;
      }
      else {
        const mappedFields = Zotero.ItemFields.getTypeFieldsFromBase(rule.targetItemField, true) as _ZoteroTypes.Item.ItemField[];
        mappedFields.filter(field => isFieldValidForItemType(field, item.itemType));
        if (!mappedFields.length) {
          logger.debug(`Skip ${rule.id}: no mapped fields ${mappedFields.join(", ")} for ${rule.targetItemField} are valid for ${item.itemType}`);
          return false;
        }
      }
    }
  }

  return true;
}

export class LintRunner {
  private stats: RunnerStats = this.emptyStats();
  private readonly ui = new ProgressUI({
    // caller.stop() throws an CanceledException but we cannot catch it
    onCancel: () => this.caller.stop(),
  });

  private readonly caller = new ConcurrentCaller({
    numConcurrent: getPref("lint.numConcurrent") || 1,
    stopOnError: false,
    logger: logger.debug,
    onError: (err: any) => logger.error(err),
  });

  public async add(params: {
    items: Arrayable<Zotero.Item>;
    rules: Arrayable<Rule<any>>;
    silent?: boolean;
  }): Promise<void> {
    const { items: _items, rules: _rules, silent = false } = params;

    this.initStats();
    await this.ui.init(silent);

    const items = toArray(_items);
    const rules = toArray(_rules);

    const optionsMap = await this.prepareRules(rules, items);

    if (
      items.length === 0 // No items
      || ![...optionsMap.values()][0] // Main rule is skiped, e.g. tool-update-metadata dialog is closed without click ok
      || ![...optionsMap.values()].filter(Boolean).length // All rules are skiped
    ) {
      this.finish();
      return;
    }

    this.stats.total += items.length;
    this.ui.updateProgress(this.stats.current, this.stats.total);

    for (const item of items) {
      this.enqueueItem(item, rules, optionsMap);
    }

    this.caller.wait().then(() => this.finish());
  }

  // ----------------------------
  // Preparation
  // ----------------------------

  private async prepareRules(rules: Rule<any>[], items: Zotero.Item[]) {
    const optionsMap = new Map<ID, any>();

    for (const rule of rules) {
      try {
        const ctx: PrepareContext = {
          items,
          debug: (...a) => logger.debug(`[prepare] [${rule.id}]`, ...a),
        };
        optionsMap.set(rule.id, await rule.prepare?.(ctx) ?? {});
      }
      catch (err) {
        this.stats.records.push({
          message: err instanceof Error ? err.message : String(err),
          level: "error",
          itemID: 0,
          title: "Prepare failed",
          ruleID: rule.id,
        });
        logger.error(`Failed to prepare rule ${rule.id}:`, err);

        this.finish();
        throw err;
      }
    }

    logger.debug("Options map:", optionsMap);
    return optionsMap;
  }

  // ----------------------------
  // Queue
  // ----------------------------

  private enqueueItem(
    item: Zotero.Item,
    rules: Rule<any>[],
    optionsMap: Map<string, any>,
  ) {
    this.caller.start(async () => {
      try {
        // logger.debug(`start ${item.id}`);
        // await Zotero.Promise.delay(100);
        await this.lintItem(item, rules, optionsMap);
        this.updateStats("pass");
      }
      catch (err) {
        this.updateStats("error");
        throw err;
      }
    });
  }

  // ----------------------------
  // Lint item
  // ----------------------------

  public async lintItem(
    item: Zotero.Item,
    rules: Rule<any>[],
    optionsMap: Map<string, any>,
  ) {
    logger.debug(`Linting item ${item.id}`);
    const errors: any[] = [];

    for (const rule of rules) {
      if (!shouldApplyRule(rule, item))
        continue;

      const options = optionsMap.get(rule.id) ?? {};
      if (options === false) {
        logger.debug(`Skip ${rule.id}: options is false`);
        continue;
      }

      // await withTimeout(() => Zotero.Promise.delay(100), 10)
      await withTimeout(
        () => this.applyRule(item, rule, options),
        15_000,
      )
        // We expect one rule's error does not affect next rule apply,
        // so we eat any error here and throw them after all rules applied.
        .catch((error) => {
          let message: string = "";
          // Zotero.HTTP.request error, the message is too long, here we just show the status
          if ("xmlhttp" in error && "message" in error)
            message += `HTTP request error: status ${error.status}, ${message.slice(0, 250)}`;
          // For regular error, we just show the message in the reporter window
          else if (error instanceof Error || "message" in error)
            message += `${error.name}: ${error.message}`;
          // If error not have message, we show the error string
          else
            message += String(error);

          this.stats.records.push({
            message,
            level: "error",
            itemID: item.id,
            title: item.getDisplayTitle(),
            ruleID: rule.id,
          });

          logger.error(`[${rule.id}]`, error);

          errors.push(error);
        });
    }

    // Save item, after all rules are applied
    await item.saveTx();

    // If there are errors, throw a error so queue can catch
    if (errors.length)
      throw new Error(`Item ${item.id} failed ${errors.length} rules`, { cause: errors });
  }

  public async applyRule(item: Zotero.Item, rule: Rule<any>, options: any) {
    logger.debug(`Applying ${rule.id}`);

    const ctx: ApplyContext = {
      item,
      options,
      debug: (...a) => createLogger(rule.id).debug(...a),
      report: (info) => {
        this.stats.records.push({
          ...info,
          itemID: item.id,
          title: item.getDisplayTitle(),
          ruleID: rule.id,
        });
      },
    };

    await rule.apply(ctx);
  }

  public async applyRuleByID(item: Zotero.Item, ruleID: ID, options: any) {
    return await this.applyRule(item, Rules.getByID(ruleID)!, options);
  }

  // ----------------------------
  // Stats / UI / Finalization
  // ----------------------------

  private updateStats(type: "pass" | "error") {
    this.stats[type]++;
    this.stats.current++;
    this.ui.updateProgress(this.stats.current, this.stats.total);
  }

  private initStats() {
    if (!this.stats.startTime)
      this.stats.startTime = Date.now();
    logger.debug(`Add tasks at ${new Date().toLocaleTimeString()}`);
  }

  private finish() {
    if (this.stats.startTime === this.emptyStats().startTime)
      return;

    const duration = (Date.now() - this.stats.startTime) / 1000;
    this.ui.showFinished(this.stats.pass, this.stats.error, duration);

    if (this.stats.records.length)
      createReporter(this.stats.records);

    DataLoader.clearCache();
    this.stats = this.emptyStats();
    logger.debug(`Batch tasks completed in ${duration}s`);
  }

  private emptyStats(): RunnerStats {
    return {
      total: 0,
      current: 0,
      pass: 0,
      error: 0,
      startTime: 0,
      records: [],
    };
  }
}
