import type { RuleBase } from "./rules/rule-base";
import { config } from "../../package.json";
import { getString } from "../utils/locale";
import { logError } from "../utils/logger";
import { timeoutPromise, waitUtilAsync } from "../utils/wait";

export interface Task {
  item: Zotero.Item;
  rules: RuleBase<any> | RuleBase<any>[];
}

interface TaskInternal extends Task {
  rules: RuleBase<any>[];
}

export class LintRunner {
  tasks: TaskInternal[];
  current: number;
  total: number;
  error: number;
  state: boolean;
  popWin: any;
  // queue;

  constructor(tasks: Task[]) {
    this.tasks = tasks.map(task => ({
      ...task,
      rules: Array.isArray(task.rules) ? task.rules.flat() : [task.rules],
    }));
    this.current = 0;
    this.total = tasks.length;
    this.error = 0;
    this.state = true;
    this.popWin = new ztoolkit.ProgressWindow(config.addonName, {
      closeOnClick: false,
      closeTime: -1,
    });
    // this.queue = new PQueue({ concurrency: 10, autoStart: false, timeout: 9000, throwOnTimeout: true });
  }

  async run(task: TaskInternal) {
    let item: Zotero.Item = task.item;
    for (const rule of task.rules) {
      ztoolkit.log(`[Runner] Applying ${rule.constructor.name}`);
      try {
        item = await rule.apply(item);
      }
      catch (err) {
        logError(err, item);
        item.addTag("linter/error", 1);
        await item.saveTx();
        throw err;
      }
    }
    ztoolkit.log("[Runner] Item returned: ", item);
    if (item.hasTag("linter/error")) {
      item.removeTag("linter/error");
    }
    await item.saveTx();
    // await Zotero.Promise.delay(1000);
  }

  async runInBatch(): Promise<void> {
    const startTime = new Date();
    ztoolkit.log("[Runner] The batch task begin", startTime.toLocaleString());
    this.popWin
      .createLine({
        type: "default",
        text: getString("info-batch-init"),
        progress: 0,
        idx: 0,
      })
      .createLine({ text: getString("info-batch-break"), idx: 1 })
      .show();

    await waitUtilAsync(() => Boolean(this.popWin.lines && this.popWin.lines[1]._itemText));
    this.popWin.lines[1]._hbox.addEventListener("click", async (ev: MouseEvent) => {
      ev.stopPropagation();
      ev.preventDefault();
      this.state = false;
      this.popWin.changeLine({ text: getString("info-batch-stop-next"), idx: 1 });
    });

    if (this.tasks.length === 0) {
      this.popWin.createLine({
        type: "fail",
        text: getString("info-batch-no-selected"),
      });
      return;
    }

    this.popWin.changeLine({
      type: "default",
      text: `[${this.current}/${this.total}] ${getString("info-batch-running")}`,
      progress: 0,
      idx: 0,
    });

    for (const task of this.tasks) {
      if (!this.state)
        break;
      await timeoutPromise(this.run(task), 60000)
        .then(() => {
          this.current++;
          this.popWin.changeLine({
            text: `[${this.current}/${this.total}] ${getString("info-batch-running")}`,
            progress: (this.current / this.total) * 100,
            idx: 0,
          });
        })
        .catch((err) => {
          this.popWin.createLine({
            type: "fail",
            text: `${getString("info-batch-has-error")}, ${err}`,
          });
          this.error++;
        });
    }

    this.popWin
      .changeLine({
        // type: "default",
        text: `[✔️${this.current} ${this.error ? `, ❌${this.error}` : ""}] ${getString("info-batch-finish")}`,
        progress: 100,
        idx: 0,
      })
      .changeLine({ text: "Finished", idx: 1 })
      .startCloseTimer(5000);
    const endTime = new Date();
    ztoolkit.log(`[Runner] The batch tasks done in ${(endTime.getTime() - startTime.getTime()) / 1000}s`);

    // const tasks = this.items.map((item) => {
    //     return async () => {
    //         if (!state) {
    //             this.queue.clear();
    //         }
    //         await this.run(item);
    //     };
    // });

    // this.queue.addAll(tasks);

    // this.queue
    //     .on("completed", (result) => {
    //         current++;
    //         progress.changeLine({
    //             text: `[${current}/${total}] ${getString("info-batch-running")}`,
    //             progress: (current / total) * 100,
    //             idx: 0,
    //         });
    //     })
    //     .on("error", (error) => {
    //         progress.createLine({
    //             type: "fail",
    //             text: `${getString("info-batch-has-error")}, ${error}`,
    //         });
    //         logError(error);
    //         errNum++;
    //     })
    //     .on("idle", () => {
    //         progress
    //             .changeLine({
    //                 // type: "default",
    //                 text: `[✔️${current} ${errNum ? ", ❌" + errNum : ""}] ${getString("info-batch-finish")}`,
    //                 progress: 100,
    //                 idx: 0,
    //             })
    //             .changeLine({ text: "Finished", idx: 1 });
    //         progress.startCloseTimer(5000);
    //         const endTime = new Date();
    //         ztoolkit.log(`[Runner] The batch tasks done in ${(endTime.getTime() - startTime.getTime()) / 1000}s`);
    //     });
    // this.queue.start();
  }
}
