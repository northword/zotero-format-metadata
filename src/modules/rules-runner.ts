import { config } from "../../package.json";
import { getString } from "../utils/locale";
import { logError } from "../utils/logger";
import { timeoutPromise, waitUtilAsync } from "../utils/wait";
import { RuleBase } from "./rules/rule-base";
import PQueue from "p-queue";

export class LintRunner {
    items: Zotero.Item[];
    rules: RuleBase<any>[];
    popWin: any;
    // queue;
    constructor(items: Zotero.Item[], rules: RuleBase<any> | RuleBase<any>[]) {
        this.items = items;
        this.rules = Array.isArray(rules) ? rules.flat() : [rules];
        // this.queue = new PQueue({ concurrency: 10, autoStart: false, timeout: 9000, throwOnTimeout: true });
    }

    async run(item: Zotero.Item) {
        for (const rule of this.rules) {
            ztoolkit.log(`[Runner] Applying ${rule.constructor.name}`);
            item = await rule.apply(item);
        }
        await item.saveTx();
        // await Zotero.Promise.delay(1000);
    }

    async runInBatch(): Promise<void> {
        const startTime = new Date();
        ztoolkit.log("[Runner] The batch task begin", startTime.toLocaleString());
        const progress = new ztoolkit.ProgressWindow(config.addonName, {
            closeOnClick: false,
            closeTime: -1,
        })
            .createLine({
                type: "default",
                text: getString("info-batch-init"),
                progress: 0,
                idx: 0,
            })
            .createLine({ text: getString("info-batch-break"), idx: 1 })
            .show();

        await waitUtilAsync(() =>
            // @ts-ignore lines可以被访问到
            Boolean(progress.lines && progress.lines[1]._itemText),
        );
        // @ts-ignore lines可以被访问到
        progress.lines[1]._hbox.addEventListener("click", async (ev: MouseEvent) => {
            ev.stopPropagation();
            ev.preventDefault();
            state = false;
            progress.changeLine({ text: getString("info-batch-stop-next"), idx: 1 });
        });

        if (this.items.length == 0) {
            progress.createLine({
                type: "fail",
                text: getString("info-batch-no-selected"),
            });
            return;
        }

        const total = this.items.length;
        let current = 0,
            errNum = 0,
            state = true;
        progress.changeLine({
            type: "default",
            text: `[${current}/${total}] ${getString("info-batch-running")}`,
            progress: 0,
            idx: 0,
        });

        for (const item of this.items) {
            if (!state) break;
            await timeoutPromise(this.run(item), 9000)
                .then(() => {
                    if (item.getTags().includes({ tag: "linter/error", type: 1 })) {
                        item.removeTag("linter/error");
                        item.saveTx();
                    }
                    current++;
                    progress.changeLine({
                        text: `[${current}/${total}] ${getString("info-batch-running")}`,
                        progress: (current / total) * 100,
                        idx: 0,
                    });
                })
                .catch((err) => {
                    progress.createLine({
                        type: "fail",
                        text: `${getString("info-batch-has-error")}, ${err}`,
                    });
                    logError(err, item);
                    item.setTags(["linter/error"]);
                    item.saveTx();
                    errNum++;
                });
        }

        progress
            .changeLine({
                // type: "default",
                text: `[✔️${current} ${errNum ? ", ❌" + errNum : ""}] ${getString("info-batch-finish")}`,
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
