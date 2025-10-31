import type { Arrayable } from "../utils/types";
import type { ReportInfo } from "./reporter";
import type { ApplyContext, PrepareContext, Rule } from "./rules/rule-base";
import PQueue from "p-queue";
import { DataLoader } from "../utils/data-loader";
import { createLogger } from "../utils/logger";
import { createReporter, ProgressUI } from "./reporter";

const logger = createLogger("Runner");

export interface Task {
  items: Arrayable<Zotero.Item>;
  rules: Arrayable<Rule<any>>;
}

interface ResolvedTask {
  item: Zotero.Item;
  rules: Rule<any>[];
  optionsMap: Map<string, object | false>;
}

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
    if (!Zotero.ItemFields.isValidForType(Zotero.ItemFields.getID(rule.targetItemField), item.itemTypeID)) {
      logger.debug(`Skip ${rule.id}: ${rule.targetItemField} not valid for ${item.itemType}`);
      return false;
    }
  }

  return true;
}

export class LintRunner {
  private stats: RunnerStats = this.createEmptyStats();

  private readonly queue: PQueue = new PQueue({
    concurrency: 1,
    autoStart: true,
    timeout: 60000,
  })
    .on("add", this.onAdd.bind(this))
    .on("completed", this.onComplated.bind(this))
    .on("error", this.onError.bind(this))
    .on("idle", this.onIdle.bind(this));

  private readonly ui: ProgressUI = new ProgressUI();

  constructor() {
    this.ui.onCancel(() => this.queue.clear());
  }

  public async add(task: Task, slient = false): Promise<void> {
    this.stats = this.createEmptyStats();
    this.stats.startTime = Date.now();

    logger.debug(`Add tasks at ${new Date(this.stats.startTime).toLocaleTimeString()}`);
    await this.ui.init(slient);

    const resolvedTasks = await this.resolveTasks(task);

    if (resolvedTasks.length === 0) {
      this.ui.showNoTasks();
      return;
    }

    const queueTasks = resolvedTasks.map(rt => this.wrapTask(rt));
    this.queue.addAll(queueTasks);
  }

  private async resolveTasks(task: Task): Promise<ResolvedTask[]> {
    const items = Array.isArray(task.items) ? task.items : [task.items];
    const rules = Array.isArray(task.rules) ? task.rules.flat() : [task.rules];

    const optionsMap = new Map<string, any>();
    for (const rule of rules) {
      if (rule.prepare) {
        const ctx: PrepareContext = {
          items,
          debug: (...args: any[]) => logger.debug(`[prepare] [${rule.id}]`, ...args),
        };

        try {
          optionsMap.set(rule.id, await rule.prepare(ctx));
        }
        catch (error) {
          this.stats.records.push({
            level: "error",
            message: error instanceof Error ? error.message : String(error),
            itemID: 0,
            title: "Error: Failed to prepare",
            ruleID: rule.id,
          });
          logger.error(`Failed to prepare rule ${rule.id}:`, error);
          this.onError(error);
          this.onIdle();
          throw error;
        }
      }
    }
    logger.debug("Options:", optionsMap);

    return items.map(item => ({ item, rules, optionsMap }));
  }

  private wrapTask(resolvedTask: ResolvedTask): () => Promise<void> {
    return async () => {
      await this.runTask(resolvedTask);
    };
  }

  private async runTask({ item, rules, optionsMap }: ResolvedTask) {
    logger.debug(`Linting item ${item.id}`);

    const errors = [];

    for (const rule of rules) {
      if (!shouldApplyRule(rule, item)) {
        continue;
      }

      const options = optionsMap.get(rule.id) ?? {};
      if (options === false) {
        logger.debug(`Skip ${rule.id}: options is false`);
        continue;
      }

      logger.debug(`Applying ${rule.id}`);

      await this.runRule({
        item,
        rule,
        options,
      })
        .catch(e => errors.push(e));
    }

    // Add tags to indicate whether there are errors
    // TODO: remove this feature? because we alrady have reports
    if (!errors.length) {
      if (item.hasTag("linter/error"))
        item.removeTag("linter/error");
    }
    else {
      item.addTag("linter/error", 1);
    }

    // Save item, after all rules are applied
    await item.saveTx();

    // If there are errors, throw a error so queue can catch
    if (errors.length) {
      throw new Error(`Item ${item.id} failed ${errors.length} rules`);
    }
  }

  private async runRule({ item, rule, options }: { item: Zotero.Item; rule: Rule<any>; options: object }): Promise<void> {
    const ctx: ApplyContext = {
      item,
      options,
      debug: (...arg) => createLogger(rule.id).debug(...arg),
      report: (info) => {
        this.stats.records.push({
          ...info,
          itemID: item.id,
          title: item.getDisplayTitle(),
          ruleID: rule.id,
        });
        logger.log(`[${rule.id}] Report ${info.level} for item ${item.id}:`, info.message);
      },
    };

    try {
      await rule.apply(ctx);
    }

    catch (error: any) {
      logger.error(error, item);

      // We just show the message in the reporter window
      let message: string = "Error: ";
      if (error instanceof Error) {
        message += error.message;
      }
      // Zotero.HTTP.request error, the message is too long, here we just show the status
      else if ("xmlhttp" in error && "message" in error) {
        message += `HTTP request error, status ${error.status}`;
      }
      else if ("message" in error) {
        message += `${error.message}`;
      }
      else {
        message += String(error);
      }

      this.stats.records.push({
        message,
        level: "error",
        itemID: item.id,
        title: item.getDisplayTitle(),
        ruleID: rule.id,
      });

      throw error;
    }
  }

  private onAdd(): void {
    this.stats.total++;
    this.ui.updateProgress(this.stats.current, this.stats.total);
  }

  private onComplated(): void {
    this.stats.pass++;
    this.stats.current++;
    this.ui.updateProgress(this.stats.current, this.stats.total);
  }

  private onError(_error: unknown): void {
    this.stats.error++;
    this.stats.current++;
    this.ui.updateProgress(this.stats.current, this.stats.total);
    this.ui.showError();
  }

  private onIdle(): void {
    const duration = (Date.now() - this.stats.startTime) / 1000;
    this.ui.showFinished(
      this.stats.pass,
      this.stats.error,
      duration,
    );

    if (this.stats.records.length !== 0)
      createReporter(this.stats.records);

    this.stats = this.createEmptyStats();
    DataLoader.clearCache();
    logger.debug(`Batch tasks completed in ${duration}s`);
  }

  private createEmptyStats(): RunnerStats {
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
