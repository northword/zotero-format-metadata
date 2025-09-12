import { groupBy } from "es-toolkit";

export interface ReportInfo {
  level?: "warning" | "error";
  message: string;
  action?: {
    label: string;
    callback: () => void;
  };
  item: Zotero.Item;
  ruleID: string;
}

export function createReporter(infos: ReportInfo[]) {
  const resolvedInfos: Record<number, ReportInfo[]> = groupBy(
    infos,
    info => info.item.id,
  );

  const dialog = new ztoolkit.Dialog(1, 1).addCell(0, 0, {
    tag: "div",
    styles: {
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      padding: "12px",
      fontFamily: "Segoe UI, sans-serif",
      fontSize: "14px",
      color: "#222",
    },
    children: Object.values(resolvedInfos).flatMap(infos => [
      {
        tag: "div",
        styles: {
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "10px",
          backgroundColor: "#fafafa",
        },
        children: [
          {
            tag: "label",
            properties: {
              innerHTML: `${infos[0].item.id} - ${infos[0].item.getDisplayTitle()}`,
            },
            styles: {
              fontWeight: "bold",
              marginBottom: "8px",
              display: "block",
              fontSize: "15px",
              color: "#2c3e50",
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
          color: info.level === "error" ? "#d93025" : "#e67e22",
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
          color: "#333",
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
