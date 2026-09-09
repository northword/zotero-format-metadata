import type { DialogHelper, ProgressWindowHelper, TagElementProps } from "zotero-plugin-toolkit";
import { groupBy } from "es-toolkit";
import { useDialog } from "../utils/dialog";
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

const REPORTER_CONTAINER_ID = "reporter-container";
const NEAR_BOTTOM_THRESHOLD = 80;

class Reporter {
  private dialog: DialogHelper | null = null;
  private container?: HTMLElement;
  private readyPromise: Promise<void> | null = null;
  private reportedItemIDs = new Set<number>();

  public report(infos: ReportInfo[]): void {
    if (!this.dialog) {
      this.openWindow(infos);
      return;
    }
    this.readyPromise?.then(() => this.renderBatch(infos));
  }

  private openWindow(infos: ReportInfo[]): void {
    const { dialog, openAndWaitClose } = useDialog(new ztoolkit.Dialog(1, 1));
    dialog.addCell(0, 0, {
      tag: "div",
      id: REPORTER_CONTAINER_ID,
      styles: {
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        fontFamily: "Segoe UI, sans-serif",
        fontSize: "14px",
      },
      children: [buildBatchProps(infos, () => this.closeIfSingle())],
    });

    this.dialog = dialog;
    openAndWaitClose("Linter for Zotero").finally(() => this.dispose());
    this.readyPromise = dialog.dialogData.loadLock!.promise;
    this.addReportedItems(infos);
  }

  private renderBatch(infos: ReportInfo[]): void {
    if (!this.dialog || this.dialog.window.closed)
      return;

    this.addReportedItems(infos);

    const container = this.container ??= this.dialog.window.document.getElementById(REPORTER_CONTAINER_ID) as HTMLElement;
    const batch = this.dialog.appendElement(
      buildBatchProps(infos, () => this.closeIfSingle()),
      container,
    );

    this.scrollToBatch(batch as HTMLElement);
    this.dialog.window.focus();
  }

  private addReportedItems(infos: ReportInfo[]): void {
    for (const info of infos)
      this.reportedItemIDs.add(info.itemID);
  }

  private scrollToBatch(batch: HTMLElement): void {
    const doc = this.dialog!.window.document;
    const scroller = doc.scrollingElement ?? doc.body;
    if (!scroller)
      return;
    if (scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < NEAR_BOTTOM_THRESHOLD) {
      batch.scrollIntoView({ block: "start" });
    }
  }

  private closeIfSingle(): void {
    if (this.reportedItemIDs.size === 1 && this.dialog) {
      this.dialog.window.close();
    }
  }

  private dispose(): void {
    this.dialog = null;
    this.container = undefined;
    this.readyPromise = null;
    this.reportedItemIDs.clear();
  }
}

const reporter = new Reporter();

export function createReporter(infos: ReportInfo[]): void {
  reporter.report(infos);
}

function buildBatchProps(infos: ReportInfo[], onActionClick: () => void): TagElementProps {
  const grouped = groupBy(infos, info => info.itemID);

  return {
    tag: "div",
    styles: {
      display: "flex",
      flexDirection: "column",
      gap: "16px",
    },
    children: [
      {
        tag: "div",
        styles: {
          display: "flex",
          alignItems: "center",
          gap: "8px",
          paddingBottom: "8px",
          borderBottom: "1px solid var(--material-border)",
          color: "var(--fill-secondary)",
          fontSize: "13px",
          fontWeight: "500",
        },
        properties: {
          textContent: getString("reporter-batch-header", {
            args: {
              time: new Date().toLocaleTimeString(),
              count: infos.length,
            },
          }),
        },
      },
      ...Object.values(grouped).map(itemInfos => createItemCard(itemInfos, onActionClick)),
    ],
  };
}

function createItemCard(itemInfos: ReportInfo[], onActionClick: () => void): TagElementProps {
  return {
    tag: "div",
    styles: {
      border: "var(--material-border)",
      borderRadius: "8px",
      padding: "10px",
      backgroundColor: "var(--material-background)",
    },
    children: [
      {
        tag: "a",
        classList: ["zotero-text-link"],
        properties: {
          innerHTML: `${itemInfos[0].itemID} - ${itemInfos[0].title}`,
        },
        styles: {
          fontWeight: "bold",
          marginBottom: "8px",
          display: "block",
          fontSize: "15px",
          color: "var(--fill-primary)",
          textDecoration: "none",
        },
        listeners: [
          {
            type: "click",
            listener: () => {
              Zotero.getActiveZoteroPane()?.selectItem(itemInfos[0].itemID);
            },
          },
        ],
      },
      ...itemInfos.map(info => createRuleResultRow(info, onActionClick)),
    ],
  };
}

function createRuleResultRow(info: ReportInfo, onActionClick: () => void): TagElementProps {
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
        tag: "a",
        classList: ["zotero-text-link"],
        properties: {
          innerHTML: info.ruleID,
        },
        styles: {
          fontWeight: "bold",
          color: info.level === "error" ? "var(--accent-red)" : "var(--accent-orange)",
          minWidth: "80px",
          textDecoration: "none",
        },
      },
      {
        tag: "label",
        properties: {
          textContent: info.message,
        },
        styles: {
          flex: "1",
          color: "var(--fill-primary)",
          fontSize: "13px",
          lineHeight: "1.4",
          whiteSpace: "pre-line",
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
          onclick: () => {
            info.action?.callback();
            onActionClick();
          },
        },
      },
    ],
  };
}

const PROGRESS_WINDOW_CLOSE_DELAY = 5000;

export class ProgressUI {
  private progressWindow?: ProgressWindowHelper;
  private _onCancel?: () => void;

  constructor(options?: { onCancel?: () => void }) {
    this._onCancel = options?.onCancel;
  }

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
        type: "default",
        text: getString("info-batch-pending-save"),
        progress: 0,
        idx: 1,
      })
      .createLine({
        text: getString("info-batch-break"),
        idx: 2,
      })
      .show();

    // @ts-expect-error miss types
    await waitUtilAsync(() => Boolean(this.progressWindow?.lines?.[2]?._itemText));
    // @ts-expect-error miss types
    const stopLine = this.progressWindow?.lines?.[2];
    if (stopLine?._hbox) {
      stopLine._hbox.addEventListener("click", this.handleStopRequest);
    }
  }

  public updateProgress(current: number, total: number, phase?: "idle" | "linting" | "saving"): void {
    if (!this.progressWindow)
      return;

    const progress = total > 0 ? (current / total) * 100 : 100;

    if (phase === "saving") {
      this.progressWindow.changeLine({
        text: `[${current}/${total}] ${getString("info-batch-saving")}`,
        progress,
        idx: 1,
      });
    }
    else {
      const label = phase === "idle"
        ? getString("info-batch-init")
        : getString("info-batch-running");
      const text = phase === "idle" ? label : `[${current}/${total}] ${label}`;
      this.progressWindow.changeLine({ text, progress, idx: 0 });
    }
  }

  public showError(): void {
    this.progressWindow?.createLine({
      type: "fail",
      text: getString("info-batch-has-error"),
    });
  }

  public showFinished(successCount: number, errorCount: number, duration: number): void {
    if (!this.progressWindow)
      return;

    const text = successCount + errorCount
      ? [
          "[",
          `✔️${successCount}`,
          errorCount ? ` ❌${errorCount}` : "",
          "] ",
          getString("info-batch-finish"),
        ].join("")
      : getString("info-batch-no-selected");

    this.progressWindow
      .changeLine({ text, progress: 100, idx: 0 })
      .changeLine({ text: `Finished in ${duration}s`, idx: 2 })
      .startCloseTimer(PROGRESS_WINDOW_CLOSE_DELAY);
  }

  private handleStopRequest = (ev: MouseEvent): void => {
    ev.stopPropagation();
    ev.preventDefault();
    this.progressWindow?.changeLine({
      text: getString("info-batch-stop-next"),
      idx: 2,
    });
    this._onCancel?.();
  };
}
