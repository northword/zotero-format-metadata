import type { ProgressWindowHelper } from "zotero-plugin-toolkit";
import type { RuleBase } from "./rules/rule-base";
import PQueue from "p-queue";
import { getString } from "../utils/locale";
import { logError } from "../utils/logger";
import { waitUtilAsync } from "../utils/wait";

export interface Task {
  item: Zotero.Item;
  rules: RuleBase<any> | RuleBase<any>[];
}

interface TaskInternal extends Task {
  rules: RuleBase<any>[];
}

export class LintRunner {
  private tasks?: TaskInternal[];
  private current: number;
  private total: number;
  private error: number;
  private isStopped: boolean;
  private popWin?: ProgressWindowHelper;
  private queue: PQueue;

  constructor() {
    this.current = 0;
    this.error = 0;
    this.isStopped = false;
    this.queue = new PQueue({
      concurrency: 1,
      autoStart: false,
      timeout: 60000,
      throwOnTimeout: true,
    });
    this.total = this.queue.size;
  }

  public async add(tasks: Task[]): Promise<void> {
    this.tasks = tasks.map(task => ({
      ...task,
      rules: Array.isArray(task.rules) ? task.rules.flat() : [task.rules],
    }));

    const startTime = Date.now();
    ztoolkit.log(`[Runner] Batch task started at ${new Date(startTime).toLocaleString()}`);

    await this.initializeProgressWindow();

    if (this.tasks.length === 0) {
      this.updateProgressLine(getString("info-batch-no-selected"), "fail");
      return;
    }

    this.queue.addAll(this.createQueueTasks());

    this.setupQueueEvents(startTime);
    this.queue.start();
  }

  private async initializeProgressWindow() {
    this.createProgressWindow();
    // @ts-expect-error can
    await waitUtilAsync(() => Boolean(this.popWin?.lines?.[1]?._itemText));
    this.setupStopButtonHandler();
  }

  private createProgressWindow() {
    this.popWin?.close();
    this.popWin = new ztoolkit.ProgressWindow(addon.data.config.addonName, {
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
  }

  private setupStopButtonHandler() {
    // @ts-expect-error can
    this.popWin!.lines[1]._hbox.addEventListener("click", (ev: MouseEvent) => {
      ev.stopPropagation();
      ev.preventDefault();
      this.handleStopRequest();
    });
  }

  private handleStopRequest() {
    this.isStopped = true;
    this.queue.pause();
    this.queue.clear();
    this.updateProgressLine(getString("info-batch-stop-next"), "default", 1);
  }

  private createQueueTasks(): (() => Promise<void>)[] {
    return this.tasks.map(task => async () => {
      if (this.isStopped)
        return;

      try {
        await this.processTask(task);
        this.current++;
        this.updateMainProgress();
      }
      catch (error) {
        this.handleTaskError(error, task.item);
      }
    });
  }

  private async processTask(task: TaskInternal) {
    let currentItem = task.item;
    for (const rule of task.rules) {
      ztoolkit.log(`[Runner] Applying ${rule.constructor.name}`);
      currentItem = await rule.apply(currentItem);
      ztoolkit.log("[Runner] Rule applied:", currentItem.toJSON());
    }
    await this.finalizeItemProcessing(currentItem);
  }

  private async finalizeItemProcessing(item: Zotero.Item) {
    if (item.hasTag("linter/error")) {
      item.removeTag("linter/error");
    }
    await item.saveTx();
  }

  private handleTaskError(error: unknown, item: Zotero.Item) {
    this.error++;
    logError(error, item);
    item.addTag("linter/error", 1);
    item.saveTx();
    this.updateProgressLine(`${getString("info-batch-has-error")}: ${error}`, "fail");
  }

  private setupQueueEvents(startTime: number) {
    this.queue
      .on("error", (error) => {
        this.error++;
        this.updateProgressLine(`${getString("info-batch-has-error")}: ${error}`, "fail");
      })
      .on("idle", () => {
        this.finalizeProcessing(startTime);
      });
  }

  private updateMainProgress() {
    this.updateProgressLine(
      `[${this.current}/${this.total}] ${getString("info-batch-running")}`,
      "default",
      0,
      (this.current / this.total) * 100,
    );
  }

  private finalizeProcessing(startTime: number) {
    const duration = (Date.now() - startTime) / 1000;
    ztoolkit.log(`[Runner] Batch tasks completed in ${duration}s`);

    this.updateProgressLine(
      `[✔️${this.current}${this.error ? ` ❌${this.error}` : ""}] ${getString("info-batch-finish")}`,
      "default",
      0,
      100,
    );

    this.updateProgressLine("Finished", "default", 1);
    this.popWin?.startCloseTimer(5000);
  }

  private updateProgressLine(
    text: string,
    type: "default" | "success" | "fail" = "default",
    idx: number = 0,
    progress?: number,
  ) {
    if (!this.popWin)
      this.createProgressWindow();

    this.popWin?.changeLine({
      type,
      text,
      progress,
      idx,
    });
  }
}
