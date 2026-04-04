import { defineConfig } from "vitepress";
import generateRulesSidebar from "./plugins/auto-sidebar";
import { sidebar_en, sidebar_zh } from "./sidebar";

export default defineConfig({
  title: "Linter for Zotero",
  titleTemplate: ":title - Linter for Zotero",
  description: "一个 Zotero 插件，用于自动格式化和清理参考文献元数据",
  head: [
    ["meta", { name: "theme-color", content: "#1f4788" }],
    ["link", { rel: "icon", href: "/icons/icon.png", type: "image/png" }],
  ],

  locales: {
    "root": {
      label: "简体中文",
      lang: "zh-CN",
      link: "/",
      themeConfig: {
        nav: [
          { text: "首页", link: "/" },
          { text: "文档", link: "/getting-started" },
          {
            text: "其他",
            items: [
              { text: "GitHub", link: "https://github.com/northword/zotero-format-metadata" },
              { text: "贡献指南", link: "/CONTRIBUTING" },
              { text: "更新日志", link: "/CHANGELOG" },
            ],
          },
        ],

        sidebar: sidebar_zh,
      },
    },
    "en-US": {
      label: "English",
      lang: "en-US",
      link: "/en-US/",
      description: "Automatically format and clean up metadata for Zotero bibliography entries",
      themeConfig: {
        nav: [
          { text: "首页", link: "/" },
          { text: "文档", link: "/getting-started" },
          {
            text: "其他",
            items: [
              { text: "GitHub", link: "https://github.com/northword/zotero-format-metadata" },
              { text: "贡献指南", link: "/CONTRIBUTING" },
              { text: "更新日志", link: "/CHANGELOG" },
            ],
          },
        ],

        sidebar: sidebar_en,
      },
    },
  },

  themeConfig: {
    logo: "/icons/icon.png",

    socialLinks: [
      { icon: "github", link: "https://github.com/northword/zotero-format-metadata" },
    ],

    search: {
      provider: "local",
    },

    footer: {
      message: "License AGPL-3.0-or-later",
      copyright: "Copyright © 2024 northword",
    },
  },

  ignoreDeadLinks: true,
  cleanUrls: true,

  vite: {
    plugins: [generateRulesSidebar()],
    server: {
      middlewareMode: false,
      fs: {
        allow: [".."],
      },
    },
  },
});
