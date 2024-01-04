import { config } from "../../package.json";
import { getString } from "../utils/locale";
import { logError } from "../utils/logger";
import { RuleBase } from "../utils/rule-base";
import { waitUtilAsync } from "../utils/wait";

export class LintRunner {
    items: Zotero.Item[];
    rules: RuleBase<any>[];
    popWin: any;
    constructor(items: Zotero.Item[], rules: RuleBase<any> | RuleBase<any>[]) {
        this.items = items;
        this.rules = Array.isArray(rules) ? rules : [rules];
    }

    async run(item: Zotero.Item) {
        for (const rule of this.rules) {
            ztoolkit.log(`[Runner] Applying ${rule.constructor.name}`);
            item = await rule.apply(item);
        }
        await item.saveTx();
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
            await this.run(item)
                .then(() => {
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
                    errNum++;
                });
        }

        progress.changeLine({
            // type: "default",
            text: `[✔️${current} ${errNum ? ", ❌" + errNum : ""}] ${getString("info-batch-finish")}`,
            progress: 100,
            idx: 0,
        });
        progress.startCloseTimer(5000);
        const endTime = new Date();
        ztoolkit.log(`[Runner] The batch tasks done in ${(endTime.getTime() - startTime.getTime()) / 1000}s`);
    }
}
