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
  error: number;
  startTime: number;
  records: ReportInfo[];
}

function shouldApplyRule(rule: Rule<any>, item: Zotero.Item): boolean {
  if (rule.targetItemTypes
    && !rule.targetItemTypes.includes(item.itemType)) {
    return false;
  }

  // if (rule.targetItemFields) {
  //   return rule.targetItemFields.every(field =>
  //     item.getField(field) !== undefined,
  //   );
  // }

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
    .on("add", () => this.stats.total += 1)
    // .on("next", this.onTaskComplete.bind(this))
    .on("error", this.onTaskError.bind(this))
    .on("idle", this.onIdle.bind(this));

  private readonly ui: ProgressUI = new ProgressUI();

  constructor() {
    this.ui.onCancel(() => this.queue.clear());
  }

  public async add(task: Task, slient = false): Promise<void> {
    this.stats = this.createEmptyStats();
    this.stats.startTime = Date.now();

    ztoolkit.log(`[Runner] Add tasks at ${new Date(this.stats.startTime).toLocaleTimeString()}`);

    const resolvedTasks = await this.resolveTasks(task);

    await this.ui.init(slient);
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
          ztoolkit.log(`[Rule ${rule.id}] Failed to get options:`, error);
        }
      }
    }

    return items.map(item => ({ item, rules, options }));
  }

  private wrapTask(resolvedTask: ResolvedTask): () => Promise<void> {
    return async () => {
      await this.runTask(resolvedTask);
      this.onTaskComplete();
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
            this.stats.records.push({ ...info, item, ruleID: rule.id });
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

  private onTaskComplete(): void {
    this.stats.current++;
    this.ui.updateProgress(this.stats.current, this.stats.total);
  }

  private onTaskError(error: unknown): void {
    this.stats.error++;
    this.ui.showError(error);
  }

  private onIdle(): void {
    const duration = (Date.now() - this.stats.startTime) / 1000;
    this.ui.showFinished(
      this.stats.current - this.stats.error,
      this.stats.error,
      duration,
    );

    createReporter(this.stats.records);
    ztoolkit.log(`[Runner] Batch tasks completed in ${duration}s`);
    this.stats = this.createEmptyStats();
  }

  private createEmptyStats(): RunnerStats {
    return {
      total: 0,
      current: 0,
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
