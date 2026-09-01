import type { DialogHelper, TagElementProps } from "zotero-plugin-toolkit";
import { groupBy } from "es-toolkit";
import { useDialog } from "../utils/dialog";
import { getString } from "../utils/locale";
import { createLogger } from "../utils/logger";

const logger = createLogger("Reporter");

/** A finding reported by a rule, without the item it belongs to. */
export interface ReportDetail {
  level?: "warning" | "error";
  message: string;
  action?: {
    label: string;
    callback: () => void;
  };
}

/** A finding as shown in the results window. */
export interface ReportInfo extends ReportDetail {
  itemID: number;
  title: string;
  ruleID: string;
}

const REPORTER_CONTAINER_ID = "reporter-container";
const NEAR_BOTTOM_THRESHOLD = 80;

/** Number of item cards these findings are shown in. */
function countCards(infos: ReportInfo[]): number {
  return new Set(infos.map(info => info.itemID)).size;
}

/**
 * The results window. One instance lives in the runner: batches accepted while
 * the window is open are appended to it instead of opening another window.
 */
export class Reporter {
  private dialog: DialogHelper | null = null;
  private container: HTMLElement | null = null;
  private readyPromise: Promise<void> | null = null;
  /** Item cards in the window, see `closeIfSingle()`. */
  private cardCount = 0;
  /** Grow the window to its content, from `useDialog`. */
  private fitToContent: (() => void) | null = null;

  public report(infos: ReportInfo[]): void {
    // The window can be closed by the user before the dialog's unload lock
    // resolves. Start over rather than dropping these findings on the floor.
    if (!this.dialog || this.dialog.window.closed) {
      this.dispose();
      this.openWindow(infos);
      return;
    }
    this.readyPromise?.then(
      () => this.renderBatch(infos),
      error => logger.error("Failed to append a batch to the results window:", error),
    );
  }

  private openWindow(infos: ReportInfo[]): void {
    const { dialog, openAndWaitClose, fitToContent } = useDialog(new ztoolkit.Dialog(1, 1));
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
    this.fitToContent = fitToContent;
    this.cardCount = countCards(infos);
    openAndWaitClose("Linter for Zotero").finally(() => this.dispose());
    this.readyPromise = dialog.dialogData.loadLock?.promise ?? Promise.resolve();
  }

  private renderBatch(infos: ReportInfo[]): void {
    if (!this.dialog || this.dialog.window.closed)
      return;

    const container = this.getContainer();
    if (!container)
      return;

    // Measured before appending: afterwards the new batch is itself part of
    // the distance to the bottom, which makes a user who follows the window
    // look like one who scrolled up.
    const pinned = this.isNearBottom();

    this.cardCount += countCards(infos);

    const batch = this.dialog.appendElement(
      buildBatchProps(infos, () => this.closeIfSingle()),
      container,
    ) as HTMLElement;

    this.fitToContent?.();

    if (pinned)
      batch.scrollIntoView({ block: "start" });
  }

  private getContainer(): HTMLElement | null {
    if (!this.container && this.dialog)
      this.container = this.dialog.window.document.getElementById(REPORTER_CONTAINER_ID) as HTMLElement | null;

    return this.container;
  }

  /**
   * Whether the window is scrolled to the bottom, i.e. the user is following
   * the results as they come in.
   */
  private isNearBottom(): boolean {
    // `body` is what `useDialog` makes scrollable, so measure it rather than
    // `scrollingElement`, which in a chrome dialog may not be the scroller.
    const scroller = this.dialog?.window.document.body;
    if (!scroller)
      return false;

    return scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < NEAR_BOTTOM_THRESHOLD;
  }

  /**
   * Applying an action leaves nothing to show when the window holds a single
   * item, so close it. Batches appended later keep it open.
   */
  private closeIfSingle(): void {
    if (this.cardCount === 1 && this.dialog)
      this.dialog.window.close();
  }

  private dispose(): void {
    this.dialog = null;
    this.container = null;
    this.readyPromise = null;
    this.fitToContent = null;
    this.cardCount = 0;
  }
}

function buildBatchProps(infos: ReportInfo[], onActionClick: () => void): TagElementProps {
  const byItemID = groupBy(infos, info => info.itemID);

  return {
    tag: "div",
    styles: {
      display: "flex",
      flexDirection: "column",
      gap: "6px",
    },
    children: [
      {
        tag: "div",
        styles: {
          display: "flex",
          alignItems: "center",
          gap: "8px",
          paddingBottom: "6px",
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
      ...Object.values(byItemID).map(itemInfos => createItemCard(itemInfos, {
        // If only one rule reports an issue for an item, applying its action
        // has nothing left to show, so close the window.
        closeOnAction: itemInfos.length === 1,
      }, onActionClick)),
    ],
  };
}

function createItemCard(
  itemInfos: ReportInfo[],
  options: { closeOnAction: boolean },
  onActionClick: () => void,
): TagElementProps {
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
        properties: {
          textContent: `${itemInfos[0].itemID} - ${itemInfos[0].title}`,
        },
        styles: {
          fontWeight: "bold",
          marginBottom: "8px",
          display: "block",
          fontSize: "15px",
          color: "var(--fill-primary)",
          textDecoration: "none",
          // A title is a single run of text for the browser: without this a
          // long one widens the whole window.
          overflowWrap: "anywhere",
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
      ...itemInfos.map(info => createRuleResultRow(info, options, onActionClick)),
    ],
  };
}

function createRuleResultRow(
  info: ReportInfo,
  options: { closeOnAction: boolean },
  onActionClick: () => void,
): TagElementProps {
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
        properties: {
          textContent: info.ruleID,
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
          // Flex items do not shrink below their content unless told to, and
          // an unshrinkable row is what makes the body overflow sideways.
          minWidth: "0",
          color: "var(--fill-primary)",
          fontSize: "13px",
          lineHeight: "1.4",
          whiteSpace: "pre-line",
          overflowWrap: "break-word",
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
          textContent: info.action?.label,
          onclick: () => {
            info.action?.callback();

            if (options.closeOnAction)
              onActionClick();
          },
        },
      },
    ],
  };
}
