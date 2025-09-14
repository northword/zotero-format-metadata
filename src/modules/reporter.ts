import type { ProgressWindowHelper } from "zotero-plugin-toolkit";
import { groupBy } from "es-toolkit";
import { getString } from "../utils/locale";
import { getPref } from "../utils/prefs";
import { waitUtilAsync } from "../utils/wait";

export interface ReportInfo {
  level?: "warning" | "error";
  message: string;
  action?: {
    label: string;
    callback: () => void;
  };
  itemID: number;
  title: string;
  ruleID: string;
}

export function createReporter(infos: ReportInfo[]) {
  const resolvedInfos: Record<number, ReportInfo[]> = groupBy(
    infos,
    info => info.itemID,
  );

  const dialog = new ztoolkit.Dialog(1, 1).addCell(0, 0, {
    tag: "div",
    styles: {
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      maxWidth: "1000px",
      minWidth: "300px",
      fontFamily: "Segoe UI, sans-serif",
      fontSize: "14px",
    },
    children: Object.values(resolvedInfos).flatMap(infos => [
      {
        tag: "div",
        styles: {
          border: "var(--material-border)",
          borderRadius: "8px",
          padding: "10px",
          backgroundColor: "var(--material-background)",
        },
        children: [
          {
            tag: "label",
            properties: {
              innerHTML: `${infos[0].itemID} - ${infos[0].title}`,
            },
            styles: {
              fontWeight: "bold",
              marginBottom: "8px",
              display: "block",
              fontSize: "15px",
              color: "var(--fill-primary)",
            },
          },
          ...infos.map(createRuleResultRows),
        ],
      },
    ]),
  });

  dialog.open("Linter for Zotero");
}

function createRuleResultRows(info: ReportInfo) {
  return {
    tag: "div",
    styles: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "6px 8px",
      borderRadius: "6px",
      minHeight: "2rem",
      backgroundColor:
          info.level === "error"
            ? "rgba(255, 0, 0, 0.08)"
            : "rgba(255, 165, 0, 0.08)",
      marginBottom: "6px",
    },
    children: [
      {
        tag: "label",
        properties: {
          innerHTML: info.ruleID,
        },
        styles: {
          fontWeight: "bold",
          color: info.level === "error" ? "var(--accent-red)" : "var(--accent-orange)",
          minWidth: "80px",
        },
      },
      {
        tag: "label",
        properties: {
          innerHTML: info.message,
        },
        styles: {
          flex: "1",
          color: "var(--fill-primary)",
          fontSize: "13px",
          lineHeight: "1.4",
        },
      },
      {
        tag: "button",
        styles: {
          display: info.action ? "inline-block" : "none",
          padding: "4px 10px",
          border: "none",
          cursor: "pointer",
          fontSize: "12px",
        },
        properties: {
          innerHTML: info.action?.label,
          onclick: () => info.action?.callback(),
        },
      },
    ],
  };
}

const PROGRESS_WINDOW_CLOSE_DELAY = 5000;

export class ProgressUI {
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
