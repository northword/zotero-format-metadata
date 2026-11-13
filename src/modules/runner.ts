import type { Logger } from "../utils/logger";
import type { Arrayable } from "../utils/types";
import type { ReportDetail, ReportInfo } from "./reporter";
import type { ApplyContext, PrepareContext, Rule } from "./rules/rule-base";
import { limitAsync } from "es-toolkit";
import { DataLoader } from "../utils/data-loader";
import { toArray } from "../utils/general";
import { createLogger } from "../utils/logger";
import { getPref } from "../utils/prefs";
import { timeoutPromise } from "../utils/wait";
import { isFieldValidForItemType } from "../utils/zotero";
import { ProgressUI } from "./progress";
import { createReporter } from "./reporter";
import { Rules } from "./rules";

const logger = createLogger("Runner");

/** How long a rule may take on one item before it is reported as failed. */
const RULE_TIMEOUT = 60_000;

interface AddParams {
  items: Arrayable<Zotero.Item>;
  rules: Arrayable<Rule<any>>;
  /** Do not show the notification and the results window. */
  silent?: boolean;
}

/** What `add()` captured for the batch it accepted. */
interface Accepted {
  /** The stop generation the batch belongs to, see `LintRunner.stop()`. */
  generation: number;
  silent: boolean;
}

const ruleLoggers = new Map<string, Logger>();

/** Logger of one rule, created once instead of once per item. */
function loggerFor(ruleID: string): Logger {
  let ruleLogger = ruleLoggers.get(ruleID);
  if (!ruleLogger) {
    ruleLogger = createLogger(ruleID);
    ruleLoggers.set(ruleID, ruleLogger);
  }
  return ruleLogger;
}

/**
 * `limitAsync` waits for a permit forever when its capacity is below 1, so the
 * pref must never reach it as such.
 */
function getConcurrency(): number {
  return Math.max(1, getPref("lint.numConcurrent") || 1);
}

/**
 * A short message for the results window. A `Zotero.HTTP` error carries the
 * whole response body, of which only the status is worth showing.
 */
function messageOf(error: any): string {
  if (error?.xmlhttp)
    return `HTTP request error: status ${error.status ?? error.xmlhttp.status}`;
  if (error?.message)
    return `${error.name ?? "Error"}: ${error.message}`;
  return String(error);
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

/**
 * How far the notification has got. A run spans every batch accepted while the
 * notification is open: batches run one at a time and share the window, so
 * their numbers add up instead of describing a single batch.
 */
class RunProgress {
  readonly startedAt = Date.now();
  /** Items accepted so far, including those of the batches still queued. */
  total = 0;
  pass = 0;
  error = 0;
  saved = 0;
  /** The user asked to stop the run. */
  stopped = false;

  /** Items done, i.e. what the notification reports as `done`. */
  get done(): number {
    return this.pass + this.error;
  }

  get duration(): number {
    return (Date.now() - this.startedAt) / 1000;
  }

  /** A run only counts as stopped when it left items unlinted. */
  get aborted(): boolean {
    return this.stopped && this.done < this.total;
  }
}

/** What must not leak between the batches of a run. */
class Batch {
  /** Findings to show in the results window of this batch. */
  readonly records: ReportInfo[] = [];
  /** Items changed by the rules, saved when the batch ends. */
  readonly changed = new Set<Zotero.Item>();

  /** Add a finding reported by a rule for an item. */
  report(item: Zotero.Item, ruleID: string, detail: ReportDetail): void {
    this.records.push({
      ...detail,
      itemID: item.id,
      title: item.getDisplayTitle(),
      ruleID,
    });
  }

  /** Add a failure of the batch itself, which belongs to no single item. */
  fail(title: string, error: unknown, ruleID = "batch"): void {
    this.records.push({
      level: "error",
      message: messageOf(error),
      itemID: 0,
      title,
      ruleID,
    });
  }
}

export class LintRunner {
  /**
   * The one notification of the plugin. Batches are serialized and share it, so
   * a batch accepted while another one runs shows up in that window at once
   * instead of opening a second one.
   */
  private readonly ui = new ProgressUI({
    onCancel: () => this.stop(),
  });

  private progress = new RunProgress();

  /**
   * Batches run one at a time. Two at once would mix their progress, and one
   * could drop the changes of the other: whatever the second collects while the
   * first saves is never saved.
   */
  private tail: Promise<unknown> = Promise.resolve();
  /** Batches accepted but not finished yet, i.e. the length of the queue. */
  private pending = 0;
  /**
   * Bumped on every stop request. A batch remembers the generation it was
   * accepted in, so the batches queued before a stop are dropped, while the ones
   * accepted afterwards run normally.
   */
  private generation = 0;

  public add(params: AddParams): Promise<ReportInfo[]> {
    const accepted: Accepted = { generation: this.generation, silent: params.silent ?? false };

    this.progress.total += toArray(params.items).length;
    // A batch accepted while a run is going must be visible in the notification
    // right away, otherwise the user cannot tell that adding it worked.
    if (this.pending > 0)
      this.ui.linting(this.progress.done, this.progress.total);

    this.pending += 1;

    const run = this.tail.then(() => this.run(params, accepted));
    // Keep the chain alive even when this batch fails.
    this.tail = run.then(
      () => {},
      () => {},
    );
    return run;
  }

  private stop(): void {
    this.generation += 1;
    this.progress.stopped = true;
  }

  private async run({ items: _items, rules: _rules }: AddParams, accepted: Accepted): Promise<ReportInfo[]> {
    const items = toArray(_items);
    const rules = toArray(_rules);
    const batch = new Batch();

    try {
      // A batch queued before a stop request is dropped, dialogs included.
      if (accepted.generation === this.generation) {
        const options = await this.prepare(rules, items, batch);
        // The batch was cancelled by a rule's `prepare` or could not be
        // prepared: there is nothing to lint.
        if (options) {
          await this.ui.init(accepted.silent);
          await this.lint(items, rules, options, batch, accepted.generation);
          await this.save(batch);
        }
      }
    }
    finally {
      this.pending -= 1;
      // The notification describes the whole run, so it reports only when the
      // last batch of the run is done.
      if (this.pending === 0)
        this.finish();
      if (batch.records.length && !accepted.silent)
        createReporter(batch.records);
    }

    return batch.records;
  }

  /**
   * Run the `prepare` of every rule once, before the batch.
   * @returns The options of each rule, or `undefined` when the batch must not run.
   */
  private async prepare(
    rules: Rule<any>[],
    items: Zotero.Item[],
    batch: Batch,
  ): Promise<Map<ID, any> | undefined> {
    const options = new Map<ID, any>();

    for (const rule of rules) {
      const ctx: PrepareContext = {
        items,
        debug: (...args) => logger.debug(`[prepare] [${rule.id}]`, ...args),
      };

      try {
        const option = await rule.prepare?.(ctx) ?? {};
        // `prepare` returns `false` to cancel the whole batch, e.g. when the
        // user closes the dialog of a tool rule without confirming it.
        if (option === false) {
          logger.debug(`Batch cancelled by ${rule.id}`);
          return undefined;
        }
        options.set(rule.id, option);
      }
      catch (error) {
        batch.fail("Prepare failed", error, rule.id);
        logger.error(`Failed to prepare rule ${rule.id}:`, error);
        return undefined;
      }
    }

    logger.debug("Options map:", options);
    return options;
  }

  /** Apply the rules to the items, at most `lint.numConcurrent` items at a time. */
  private async lint(
    items: Zotero.Item[],
    rules: Rule<any>[],
    options: Map<ID, any>,
    batch: Batch,
    generation: number,
  ): Promise<void> {
    this.ui.linting(this.progress.done, this.progress.total);

    const lintItem = async (item: Zotero.Item) => {
      // Items that have not started yet are dropped once the user stops.
      if (generation !== this.generation)
        return;
      await this.lintItem(item, rules, options, batch);
    };

    const limit = limitAsync(lintItem, getConcurrency());
    const results = await Promise.allSettled(items.map(item => limit(item)));

    // Linting records rule failures instead of throwing, so a rejection here
    // is a bug in the runner rather than a failure of a rule.
    for (const result of results) {
      if (result.status === "rejected")
        logger.error("Unexpected failure while linting:", result.reason);
    }
  }

  /**
   * Apply every applicable rule to one item and count it for the progress.
   * A failing rule is recorded and does not stop the next rule on the item.
   */
  private async lintItem(
    item: Zotero.Item,
    rules: Rule<any>[],
    options: Map<ID, any>,
    batch: Batch,
  ): Promise<void> {
    let failed = false;

    for (const rule of rules) {
      if (!shouldApplyRule(rule, item))
        continue;

      // Not `withTimeout` from es-toolkit: it requires `AbortController`,
      // which is not defined in the plugin sandbox.
      await timeoutPromise(
        this.applyRule(item, rule, options.get(rule.id) ?? {}, batch),
        RULE_TIMEOUT,
      )
        .catch((error) => {
          batch.report(item, rule.id, { level: "error", message: messageOf(error) });
          logger.error(`[${rule.id}]`, error);
          failed = true;
        });
    }

    if (item.hasChanged())
      batch.changed.add(item);

    if (failed)
      this.progress.error += 1;
    else
      this.progress.pass += 1;

    this.ui.linting(this.progress.done, this.progress.total);
  }

  /**
   * Save the changed items of a batch in a single transaction, so that one undo
   * reverts the whole batch.
   */
  private async save(batch: Batch): Promise<void> {
    const items = [...batch.changed];
    batch.changed.clear();
    if (items.length === 0)
      return;

    this.ui.saving(0, items.length);

    let done = 0;
    let saved = 0;
    try {
      await Zotero.DB.executeTransaction(async () => {
        for (const item of items) {
          if (item.hasChanged()) {
            await item.save({ skipSelect: true });
            saved += 1;
          }
          this.ui.saving(++done, items.length);
        }

        if (saved > 0) {
          // @ts-expect-error - Zotero.UndoHistory not yet typed in zotero-types
          Zotero.UndoHistory.stageAction(
            "linter-undo-action-lint-metadata",
            { count: saved },
          );
        }
      });
      this.progress.saved += saved;
    }
    catch (error) {
      // The transaction was rolled back, so nothing was saved.
      batch.fail("Batch save failed", error);
      logger.error("Batch save failed:", error);
    }
  }

  /** Report the run in the notification, and start the next one from scratch. */
  private finish(): void {
    const progress = this.progress;

    this.ui.finish({
      pass: progress.pass,
      error: progress.error,
      saved: progress.saved,
      duration: progress.duration,
      stopped: progress.aborted,
    });

    DataLoader.clearCache();
    this.progress = new RunProgress();
  }

  /**
   * Apply one rule to one item.
   *
   * `batch` is where the findings go. A throwaway one is used when a rule
   * applies another rule, outside of a batch of its own.
   */
  public async applyRule(
    item: Zotero.Item,
    rule: Rule<any>,
    options: any,
    batch: Batch = new Batch(),
  ): Promise<void> {
    logger.debug(`Applying ${rule.id}`);

    const ctx: ApplyContext = {
      item,
      options,
      debug: loggerFor(rule.id).debug,
      report: detail => batch.report(item, rule.id, detail),
    };

    await rule.apply(ctx);
  }

  /** Apply one rule to one item outside of a batch. The findings are discarded. */
  public async applyRuleByID(item: Zotero.Item, ruleID: ID, options: any): Promise<void> {
    return this.applyRule(item, Rules.getByID(ruleID)!, options);
  }
}
