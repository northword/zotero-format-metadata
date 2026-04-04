import type { DefaultTheme } from "vitepress";
import rules from "./sidebar.json";

export const sidebar_zh: DefaultTheme.Sidebar = [
  {
    text: "文档",
    items: [
      { text: "快速开始", link: "/getting-started" },
      { text: "参考文献检查清单", link: "/reference-checklist" },
    ],
  },
  {
    text: "参考",
    items: [
      {
        text: "标题富文本",
        link: "/rich-text",
      },
      {
        text: "规则列表",
        link: "/rules/",
        items: rules,
        collapsed: true,
      },
      {
        text: "更新题录信息",
        link: "/tools/update-metadata",
      },
    ],
  },
  {
    text: "其他",
    items: [
      { text: "贡献指南", link: "/CONTRIBUTING" },
      { text: "更新日志", link: "/CHANGELOG" },
    ],
  },
];

export const sidebar_en: DefaultTheme.Sidebar = [
  {
    text: "文档",
    items: [
      { text: "快速开始", link: "/getting-started" },
      { text: "参考文献检查清单", link: "/reference-checklist" },
    ],
  },
  {
    text: "参考",
    items: [
      {
        text: "标题富文本",
        link: "/rich-text",
      },
      {
        text: "规则列表",
        link: "/rules/",
        items: rules,
        collapsed: true,
      },
      {
        text: "更新题录信息",
        link: "/tools/update-metadata",
      },
    ],
  },
  {
    text: "其他",
    items: [
      { text: "贡献指南", link: "/CONTRIBUTING" },
      { text: "更新日志", link: "/CHANGELOG" },
    ],
  },
];
