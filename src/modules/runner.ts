import type { Arrayable } from "../utils/types";
import type { ReportInfo } from "./reporter";
import type { Context, Rule } from "./rules/rule-base";
import PQueue from "p-queue";
import { DataLoader } from "../utils/data-loader";
import { createReporter, ProgressUI } from "./reporter";

const debug = (...args: any[]) => ztoolkit.log("[Runner]", ...args);

const TASK_TIMEOUT = 60000;

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
    debug(`[Warn] Rule ${rule.id} has both targetItemTypes and ignoreItemTypes.`);
  }

  // Check item type
  if (rule.targetItemTypes && !rule.targetItemTypes.includes(item.itemType)) {
    debug(`Skip ${rule.id}: ${item.itemType} not supported by this rule`);
    return false;
  }
  if (rule.ignoreItemTypes?.includes(item.itemType)) {
    debug(`Skip ${rule.id}: ${item.itemType} is ignored by this rule`);
    return false;
  }

  if (rule.scope === "field") {
    // if targetField of this rule is primary field, always apply
    if (rule.targetItemField === "creators")
      return true;

    // Check this target field is included in this item type
    if (!Zotero.ItemFields.isValidForType(Zotero.ItemFields.getID(rule.targetItemField), item.itemTypeID)) {
      debug(`Skip ${rule.id}: ${rule.targetItemField} not valid for ${item.itemType}`);
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
    timeout: TASK_TIMEOUT,
    throwOnTimeout: true,
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

    debug(`Add tasks at ${new Date(this.stats.startTime).toLocaleTimeString()}`);
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
      if (rule.getOptions) {
        try {
          optionsMap.set(rule.id, await rule.getOptions({ items }));
        }
        catch (error) {
          this.stats.records.push({
            level: "error",
            message: error instanceof Error ? error.message : String(error),
            itemID: 0,
            title: "Error: Failed to get options",
            ruleID: rule.id,
          });
          debug(`Failed to get options for ${rule.id}:`, error);
          this.onError(error);
          this.onIdle();
          throw error;
        }
      }
    }
    debug("Options:", optionsMap);

    return items.map(item => ({ item, rules, optionsMap }));
  }

  private wrapTask(resolvedTask: ResolvedTask): () => Promise<void> {
    return async () => {
      await this.runTask(resolvedTask);
    };
  }

  private async runTask({ item, rules, optionsMap }: ResolvedTask) {
    const errors = [];

    for (const rule of rules) {
      if (!shouldApplyRule(rule, item)) {
        continue;
      }

      const options = optionsMap.get(rule.id) ?? {};
      if (options === false) {
        debug(`Skip ${rule.id}: options is false`);
        continue;
      }

      debug(`Applying ${rule.id}`);

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
    const ctx: Context = {
      item,
      options,
      debug: (...args: any[]) => ztoolkit.log(`[${rule.id}]`, ...args),
      report: (info) => {
        this.stats.records.push({
          ...info,
          itemID: item.id,
          title: item.getDisplayTitle(),
          ruleID: rule.id,
        });
        ztoolkit.log(`[${rule.id}] Report ${info.level} for item ${item.id}:`, info.message);
      },
    };

    try {
      await rule.apply(ctx);
    }

    catch (error: any) {
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

      console.error(`[Linter for Zotero] ${message}`, error, item);
      Zotero.debug(`[Linter for Zotero] ${message}`);

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
    debug(`Batch tasks completed in ${duration}s`);
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
