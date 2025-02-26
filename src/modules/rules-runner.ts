import type { ProgressWindowHelper } from "zotero-plugin-toolkit";
import type { RuleBase } from "./rules/rule-base";
import PQueue from "p-queue";
import { getString } from "../utils/locale";
import { logError } from "../utils/logger";
import { waitUtilAsync } from "../utils/wait";

type QueueTask = () => Promise<void>;

export interface Task {
  item: Zotero.Item;
  rules: RuleBase<any> | RuleBase<any>[];
}

interface TaskInternal extends Task {
  rules: RuleBase<any>[];
}

const PROGRESS_WINDOW_CLOSE_DELAY = 5000;
const TASK_TIMEOUT = 60000;

export class LintRunner {
  private current: number = 0;
  private error: number = 0;
  private isStopped: boolean = false;
  private progressWindow?: ProgressWindowHelper;
  private queue: PQueue;
  private startTime: number = 0;

  constructor() {
    this.queue = this.setupQueue();
  }

  get total() {
    return this.queue.size + this.queue.pending;
  }

  get isRunning() {
    return !this.queue.isPaused && this.queue.pending > 0;
  }

  private setupQueue() {
    return new PQueue({
      concurrency: 1,
      autoStart: false,
      timeout: TASK_TIMEOUT,
      throwOnTimeout: true,
    })
      .on("active", () => this.updateMainProgress())
      .on("error", error => this.handleQueueError(error))
      .on("idle", () => this.finalizeProcessing());
  }

  public async add(tasks: Task[]): Promise<void> {
    if (this.isRunning) {
      throw new Error("Runner is already processing tasks");
    }

    const preparedTasks = this.prepareTasks(tasks);
    if (preparedTasks.length === 0) {
      this.showNoTasksMessage();
      return;
    }

    this.resetState();
    await this.initializeProgressWindow();
    this.queue.addAll(preparedTasks);
    this.queue.start();
  }

  private prepareTasks(tasks: Task[]): QueueTask[] {
    return tasks
      .map(task => ({
        ...task,
        rules: Array.isArray(task.rules) ? task.rules.flat() : [task.rules],
      }))
      .map(task => async () => {
        if (this.isStopped)
          return;
        await this.processSingleTask(task);
      });
  }

  private async processSingleTask(task: TaskInternal) {
    try {
      let currentItem = task.item;
      for (const rule of task.rules) {
        currentItem = await this.applyRule(rule, currentItem);
      }
      await this.finalizeItem(currentItem);
    }
    catch (error) {
      await this.handleTaskError(error, task.item);
    }
  }

  private async applyRule(rule: RuleBase<any>, item: Zotero.Item) {
    ztoolkit.log(`[Runner] Applying ${rule.constructor.name}`);
    const result = await rule.apply(item);
    ztoolkit.log("[Runner] Rule applied:", result.toJSON());
    return result;
  }

  private async finalizeItem(item: Zotero.Item) {
    if (item.hasTag("linter/error")) {
      item.removeTag("linter/error");
    }
    await item.saveTx();
  }

  private async handleTaskError(error: unknown, item: Zotero.Item) {
    this.error++;
    logError(error, item);

    try {
      item.addTag("linter/error", 1);
      await item.saveTx();
    }
    catch (saveError) {
      logError(saveError, item);
    }

    this.updateProgressLine(
      `${getString("info-batch-has-error")}: ${error instanceof Error ? error.message : error}`,
      "fail",
    );
  }

  private async initializeProgressWindow() {
    this.progressWindow?.close();

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

    await this.waitForProgressWindowReady();
    this.attachStopHandler();
  }

  private async waitForProgressWindowReady() {
    await waitUtilAsync(() =>
      Boolean(this.progressWindow?.lines?.[1]?._itemText),
    );
  }

  private attachStopHandler() {
    const stopLine = this.progressWindow?.lines?.[1];
    if (stopLine?._hbox) {
      stopLine._hbox.addEventListener("click", this.handleStopRequest);
    }
  }

  private handleStopRequest = (ev: MouseEvent) => {
    ev.stopPropagation();
    ev.preventDefault();
    this.isStopped = true;
    this.queue.pause();
    this.queue.clear();
    this.updateProgressLine(getString("info-batch-stop-next"), "default", 1);
  };

  private updateMainProgress() {
    this.current = this.total - this.queue.size;
    const progress = this.total > 0
      ? (this.current / this.total) * 100
      : 0;

    this.updateProgressLine(
      `[${this.current}/${this.total}] ${getString("info-batch-running")}`,
      "default",
      0,
      progress,
    );
  }

  private finalizeProcessing() {
    const duration = (Date.now() - this.startTime) / 1000;
    ztoolkit.log(`[Runner] Batch tasks completed in ${duration}s`);

    this.updateProgressLine(
      `[✔️${this.current}${this.error ? ` ❌${this.error}` : ""}] ${getString("info-batch-finish")}`,
      "default",
      0,
      100,
    );

    this.updateProgressLine("Finished", "default", 1);
    this.progressWindow?.startCloseTimer(PROGRESS_WINDOW_CLOSE_DELAY);
  }

  private updateProgressLine(
    text: string,
    type: "default" | "success" | "fail" = "default",
    idx: number = 0,
    progress?: number,
  ) {
    this.progressWindow?.changeLine({
      type,
      text,
      progress,
      idx,
    });
  }

  private resetState() {
    this.current = 0;
    this.error = 0;
    this.isStopped = false;
    this.startTime = Date.now();
    this.queue.clear();
  }

  private showNoTasksMessage() {
    this.updateProgressLine(getString("info-batch-no-selected"), "fail");
    this.progressWindow?.startCloseTimer(PROGRESS_WINDOW_CLOSE_DELAY);
  }

  private handleQueueError(error: unknown) {
    this.error++;
    const errorMessage = error instanceof Error ? error.message : String(error);
    this.updateProgressLine(
      `${getString("info-batch-has-error")}: ${errorMessage}`,
      "fail",
    );
  }
}
