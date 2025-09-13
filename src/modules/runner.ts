import type { ProgressWindowHelper } from "zotero-plugin-toolkit";
import type { Arrayable } from "../utils/types";
import type { ReportInfo } from "./report";
import type { Context, Rule } from "./rules/rule-base";
import PQueue from "p-queue";
import { getString } from "../utils/locale";
import { getPref } from "../utils/prefs";
import { waitUtilAsync } from "../utils/wait";
import { createReporter } from "./report";

const PROGRESS_WINDOW_CLOSE_DELAY = 5000;
const TASK_TIMEOUT = 60000;

export interface Task {
  items: Arrayable<Zotero.Item>;
  rules: Arrayable<Rule<any>>;
}

interface ResolvedTask {
  item: Zotero.Item;
  rules: Rule<any>[];
  options: Map<string, object>;
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
  if (rule.targetItemTypes && !rule.targetItemTypes.includes(item.itemType)) {
    ztoolkit.log(`[Rule ${rule.id}] Skip rule for item ${item.id} type ${item.itemType}`);
    return false;
  }

  if (rule.type === "field") {
    const allFieldForThisItemType = Zotero.ItemFields.getItemTypeFields(item.itemTypeID)
      .map(Zotero.ItemFields.getName);

    if (rule.targetItemFields.length !== 0) {
      for (const field of rule.targetItemFields) {
        if (!allFieldForThisItemType.includes(field)) {
          ztoolkit.log(`[Rule ${rule.id}] Skip rule for item ${item.id} field ${field}`);
          return false;
        }
      }
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

    ztoolkit.log(`[Runner] Add tasks at ${new Date(this.stats.startTime).toLocaleTimeString()}`);
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

    const options = new Map<string, any>();
    for (const rule of rules) {
      if (rule.getOptions) {
        try {
          options.set(rule.id, await rule.getOptions());
        }
        catch (error) {
          this.stats.records.push({
            level: "error",
            message: error instanceof Error ? error.message : String(error),
            itemID: 0,
            title: "Error: Failed to get options",
            ruleID: rule.id,
          });
          ztoolkit.log(`[Rule ${rule.id}] Failed to get options:`, error);
          this.onError(error);
          this.onIdle();
          throw error;
        }
      }
    }
    ztoolkit.log("[Runner] Options:", options);

    return items.map(item => ({ item, rules, options }));
  }

  private wrapTask(resolvedTask: ResolvedTask): () => Promise<void> {
    return async () => {
      await this.runTask(resolvedTask);
    };
  }

  private async runTask({ item, rules, options }: ResolvedTask) {
    try {
      for (const rule of rules) {
        if (!shouldApplyRule(rule, item)) {
          continue;
        }

        const ctx: Context = {
          item,
          options: options.get(rule.id) ?? {},
          debug: (...args: any[]) => ztoolkit.log(`[${rule.id}] Debug: `, ...args),
          report: (info) => {
            this.stats.records.push({
              ...info,
              itemID: item.id,
              title: item.getDisplayTitle(),
              ruleID: rule.id,
            });
            ztoolkit.log(`[Report ${info.level}] rule ${rule.id} for item ${item.id}:`, info.message);
          },
        };

        ztoolkit.log(`[Runner] Applying ${rule.id}`);
        await rule.apply(ctx);
        // ztoolkit.log("[Runner] Rule applied:", item.toJSON());
      }

      if (item.hasTag("linter/error")) {
        item.removeTag("linter/error");
      }

      await item.saveTx();
    }
    catch (error) {
      this.stats.records.push({
        message: error instanceof Error ? error.message : String(error),
        level: "error",
        itemID: item.id,
        title: item.getDisplayTitle(),
        ruleID: "Error",
      });
      const message = `[Linter for Zotero] An error occurred when lint item ${item.id}: ${
        error instanceof Error ? error.message : error
      }\n`;
      console.error(message, error, item);
      Zotero.debug(message);
      item.addTag("linter/error", 1);
      await item.saveTx();
      throw error;
    }
  }

  private onAdd(): void {
    this.stats.total++;
  }

  private onComplated(): void {
    this.stats.pass++;
    this.stats.current++;
    this.ui.updateProgress(this.stats.current, this.stats.total);
  }

  private onError(error: unknown): void {
    this.stats.error++;
    this.stats.current++;
    this.ui.updateProgress(this.stats.current, this.stats.total);
    this.ui.showError(error);
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

    ztoolkit.log(`[Runner] Batch tasks completed in ${duration}s`);
    this.stats = this.createEmptyStats();
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

class ProgressUI {
  private progressWindow?: ProgressWindowHelper;
  private _onCancel?: () => void;

  public async init(slient?: boolean): Promise<void> {
    this.progressWindow?.close();

    if (slient || !getPref("lint.notify"))
      return;

    this.progressWindow = new ztoolkit.ProgressWindow(addon.data.config.addonName, {
      closeOnClick: false,
      closeTime: -1,
    })
      .createLine({
        type: "default",
        text: getString("info-batch-init"),
        progress: 0,
        idx: 0,
      })
      .createLine({
        text: getString("info-batch-break"),
        idx: 1,
      })
      .show();

    // @ts-expect-error miss types
    await waitUtilAsync(() => Boolean(this.progressWindow?.lines?.[1]?._itemText));
    // @ts-expect-error miss types
    const stopLine = this.progressWindow?.lines?.[1];
    if (stopLine?._hbox) {
      stopLine._hbox.addEventListener("click", this.handleStopRequest);
    }
  }

  public onCancel(fn: () => void): void {
    this._onCancel = fn;
  }

  public updateProgress(current: number, total: number): void {
    if (!this.progressWindow)
      return;
    const text = `[${current}/${total}] ${getString("info-batch-running")}`;
    const progress = (current / total) * 100;

    this.progressWindow.changeLine({ text, progress, idx: 0 });
  }

  public showError(error: unknown): void {
    this.progressWindow?.createLine({
      type: "fail",
      text: `${getString("info-batch-has-error")}: ${
        error instanceof Error ? error.message : error
      }`,
    });
  }

  public showFinished(successCount: number, errorCount: number, duration: number): void {
    if (!this.progressWindow)
      return;

    const text = [
      "[",
      `✔️${successCount}`,
      errorCount ? ` ❌${errorCount}` : "",
      "] ",
      getString("info-batch-finish"),
    ].join("");

    this.progressWindow
      .changeLine({ text, progress: 100, idx: 0 })
      .changeLine({ text: `Finished in ${duration}s`, idx: 1 })
      .startCloseTimer(PROGRESS_WINDOW_CLOSE_DELAY);
  }

  public showNoTasks(): void {
    this.progressWindow?.changeLine({
      text: getString("info-batch-no-selected"),
      idx: 0,
    });
    this.progressWindow?.startCloseTimer(PROGRESS_WINDOW_CLOSE_DELAY);
  }

  private handleStopRequest = (ev: MouseEvent): void => {
    ev.stopPropagation();
    ev.preventDefault();
    this.progressWindow?.changeLine({
      text: getString("info-batch-stop-next"),
      idx: 1,
    });
    this._onCancel?.();
  };
}
