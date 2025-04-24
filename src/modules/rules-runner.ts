import type { ProgressWindowHelper } from "zotero-plugin-toolkit";
import type { RuleBase } from "./rules/rule-base";
import PQueue from "p-queue";
import { getString } from "../utils/locale";
import { logError } from "../utils/logger";
import { getPref } from "../utils/prefs";
import { waitUtilAsync } from "../utils/wait";

type QueueTask = () => Promise<void>;

export interface Task {
  item: Zotero.Item;
  rules: RuleBase<any> | RuleBase<any>[];
}

const PROGRESS_WINDOW_CLOSE_DELAY = 5000;
const TASK_TIMEOUT = 60000;

export class LintRunner {
  private total: number = 0;
  private current: number = 0;
  private error: number = 0;
  private startTime: number = 0;

  private progressWindow?: ProgressWindowHelper;
  private queue: PQueue;

  constructor() {
    this.queue = new PQueue({
      concurrency: 1,
      autoStart: false,
      timeout: TASK_TIMEOUT,
      throwOnTimeout: true,
    });
  }

  public async add(tasks: Task[]): Promise<void> {
    this.startTime = Date.now();
    ztoolkit.log(`[Runner] Add tasks at ${new Date(this.startTime).toLocaleTimeString()}`);

    const preparedTasks = this.prepareTasks(tasks);

    // Ensure progress window is initialized and only one instance is open
    await this.initializeProgressWindow();
    if (preparedTasks.length === 0) {
      this.showNoTasksMessage();
      return;
    }

    this.queue.addAll(preparedTasks);
    this.queue.start();
    this.queue.onIdle().then(this.onIdle.bind(this));
  }

  private prepareTasks(tasks: Task[]): QueueTask[] {
    this.total += tasks.length;
    return tasks
      .map(task => async () => {
        await this.runTask(task)
          .catch(this.onTaskError.bind(this))
          .then(this.onTaskComplete.bind(this));
        ztoolkit.log("[Runner] Task completed");
      });
  }

  private async runTask(task: Task) {
    let { item, rules } = task;
    rules = Array.isArray(task.rules) ? task.rules.flat() : [task.rules];
    try {
      for (const rule of rules) {
        ztoolkit.log(`[Runner] Applying ${rule.constructor.name}`);
        item = await rule.apply(item);
        ztoolkit.log("[Runner] Rule applied:", item.toJSON());
      }
      if (item.hasTag("linter/error")) {
        item.removeTag("linter/error");
      }
      await item.saveTx();
    }
    catch (error) {
      logError(error, item);
      item.addTag("linter/error", 1);
      await item.saveTx();
      throw error;
    }
  }

  private onTaskComplete() {
    this.current++;
    this.updateProgress();
  }

  private async onTaskError(error: unknown) {
    this.error++;
    this.progressWindow?.createLine({
      type: "fail",
      text: `${getString("info-batch-has-error")}: ${error instanceof Error ? error.message : error}`,
    });
  }

  private onIdle() {
    const text = [
      "[",
      `✔️${this.current - this.error}`,
      this.error ? ` ❌${this.error}` : "",
      "] ",
      getString("info-batch-finish"),
    ].join("");

    const progress = 100;
    const duration = (Date.now() - this.startTime) / 1000;

    this.progressWindow
      ?.changeLine({
        text,
        progress,
        idx: 0,
      })
      .changeLine({
        text: `Finished in ${duration}s`,
        idx: 1,
      })
      .startCloseTimer(PROGRESS_WINDOW_CLOSE_DELAY);

    this.resetState();
    ztoolkit.log(`[Runner] Batch tasks completed in ${duration}s`);
  }

  private async initializeProgressWindow() {
    this.progressWindow?.close();

    if (!getPref("lint.notify"))
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

    // @ts-expect-error can
    await waitUtilAsync(() => Boolean(this.progressWindow?.lines?.[1]?._itemText));
    // @ts-expect-error can
    const stopLine = this.progressWindow?.lines?.[1];
    if (stopLine?._hbox) {
      stopLine._hbox.addEventListener("click", this.handleStopRequest);
    }

    this.updateProgress();
  }

  private handleStopRequest = (ev: MouseEvent) => {
    ev.stopPropagation();
    ev.preventDefault();
    this.progressWindow?.changeLine({
      text: getString("info-batch-stop-next"),
      idx: 1,
    });
    // this.queue.pause();
    this.queue.clear();
  };

  private updateProgress() {
    const text = `[${this.current}/${this.total}] ${getString("info-batch-running")}`;
    const progress = (this.current / this.total) * 100;

    this.progressWindow?.changeLine({
      text,
      progress,
      idx: 0,
    });
  }

  private resetState() {
    this.total = 0;
    this.current = 0;
    this.error = 0;
    this.startTime = Date.now();
  }

  private showNoTasksMessage() {
    this.progressWindow?.changeLine({
      text: getString("info-batch-no-selected"),
      idx: 0,
    });
    this.progressWindow?.startCloseTimer(PROGRESS_WINDOW_CLOSE_DELAY);
  }
}
