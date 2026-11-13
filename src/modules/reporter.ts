import type { TagElementProps } from "zotero-plugin-toolkit";
import { groupBy } from "es-toolkit";
import { useDialog } from "../utils/dialog";

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

export function createReporter(infos: ReportInfo[]) {
  const byItemID = groupBy(infos, info => info.itemID);

  const { dialog, openAndWaitClose, close } = useDialog(new ztoolkit.Dialog(1, 1));

  dialog.addCell(0, 0, {
    tag: "div",
    styles: {
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      fontFamily: "Segoe UI, sans-serif",
      fontSize: "14px",
    },
    children: Object.values(byItemID).flatMap(itemInfos => [
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
          ...itemInfos.map(info => createResultRow(info, {
            // If only one rule reports an issue for an item, applying its
            // action has nothing left to show, so close the window.
            closeOnAction: itemInfos.length === 1,
          })),
        ],
      },
    ] satisfies TagElementProps[]),
  });

  function createResultRow(
    info: ReportInfo,
    options: { closeOnAction: boolean },
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
            textContent: info.action?.label,
            onclick: () => {
              info.action?.callback();

              if (options.closeOnAction)
                close();
            },
          },
        },
      ],
    };
  }

  openAndWaitClose("Linter for Zotero");
}
