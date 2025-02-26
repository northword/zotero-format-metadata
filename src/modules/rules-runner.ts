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
  private current: number = 0;
  private error: number = 0;
  private isStopped: boolean = false;
  private progressWindow?: ProgressWindowHelper;
  private queue: PQueue;
  private startTime: number = Date.now();

  constructor() {
    this.queue = this.setupQueue();
  }

  get total() {
    return this.queue.size + this.queue.pending;
  }

  private setupQueue() {
    return new PQueue({
      concurrency: 1,
      autoStart: true,
      timeout: 60000,
      throwOnTimeout: true,
    })
      .on("next", () => {
        this.updateMainProgress();
      })
      .on("error", (error) => {
        this.error++;
        this.updateProgressLine(`${getString("info-batch-has-error")}: ${error}`, "fail");
      })
      .on("idle", () => {
        this.finalizeProcessing(this.startTime);
      });
  }

  public async add(tasks: Task[]): Promise<void> {
    const _tasks = this.createTasks(tasks);

    this.startTime = Date.now();
    ztoolkit.log(`[Runner] Batch task started at ${new Date(this.startTime).toLocaleString()}`);

    await this.ensureProgressWindow();

    if (_tasks.length === 0) {
      this.updateProgressLine(getString("info-batch-no-selected"), "fail");
      return;
    }

    this.queue.addAll(_tasks);
    // force start the queue
    this.queue.start();
  }

  private createTasks = (tasks: Task[]) => {
    return tasks
      .map(task => ({
        ...task,
        rules: Array.isArray(task.rules) ? task.rules.flat() : [task.rules],
      }))
      .map(() => async () => this.processTask);
  };

  private async ensureProgressWindow() {
    this.progressWindow?.close();
    await this.initializeProgressWindow();
    // if (!this.progressWindow || !this.progressWindow.win)
    //   return await this.initializeProgressWindow();
    // return this.progressWindow;
  }

  private async initializeProgressWindow() {
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
    // @ts-expect-error can
    await waitUtilAsync(() => Boolean(this.progressWindow?.lines?.[1]?._itemText));
    // @ts-expect-error can
    this.progressWindow.lines[1]._hbox.addEventListener("click", (ev: MouseEvent) => {
      ev.stopPropagation();
      ev.preventDefault();
      this.handleStopRequest();
    });

    return this.progressWindow;
  }

  private handleStopRequest() {
    this.isStopped = true;
    this.queue.pause();
    this.updateProgressLine(getString("info-batch-stop-next"), "default", 1);
    this.queue.clear();
  }

  private async processTask(task: TaskInternal) {
    let { item, rules } = task;
    try {
      for (const rule of rules) {
        ztoolkit.log(`[Runner] Applying ${rule.constructor.name}`);
        item = await rule.apply(item);
        ztoolkit.log("[Runner] Rule applied:", item.toJSON());
      }

      if (item.hasTag("linter/error")) {
        item.removeTag("linter/error");
      }
    }
    catch (error) {
      this.error++;
      item.addTag("linter/error", 1);
      this.updateProgressLine(`${getString("info-batch-has-error")}: ${error}`, "fail");
    }

    await item.saveTx();
    // this.updateMainProgress();
  }

  private updateMainProgress() {
    this.current++;
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
    this.progressWindow?.startCloseTimer(5000);
    // this.progressWindow = undefined;
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
}
