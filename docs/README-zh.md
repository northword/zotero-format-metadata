<div align="center">

![Linter for Zotero](./assets/slogan-for-readme.jpg)

[![zotero target version](https://img.shields.io/badge/Zotero-7.*-green?&logo=zotero&logoColor=CC2936)](https://www.zotero.org)
[![version](https://img.shields.io/github/package-json/v/northword/zotero-format-metadata)](https://github.com/northword/zotero-format-metadata/releases/)
[![download number](https://img.shields.io/github/downloads/northword/zotero-format-metadata/latest/total)](https://github.com/northword/zotero-format-metadata/releases/)
[![license](https://img.shields.io/github/license/northword/zotero-format-metadata)](#开源协议)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/b851796e53724d7aa7c00923955e0f56)](https://app.codacy.com/gh/northword/zotero-format-metadata/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)
[![Using Zotero Plugin Template](https://img.shields.io/badge/Using-Zotero%20Plugin%20Template-blue?&logo=github)](https://github.com/windingwind/zotero-plugin-template)

本 README 还适用于以下语言：:cn: 简体中文 | [:gb: English](../README.md)

我是一个 [Zotero](https://www.zotero.org/) 插件，可以规范化/格式化条目的元数据（字段数据）。

</div></br>

## 特性

- 提供标题富文本编辑功能（上下标、斜体、粗体等）及对应快捷键
- 导入时检测并提示重复条目
- 校验条目类型是否正确
  - 在抓取失败时发出警告
- 校验并修复条目字段
  - 自动识别和补全条目语言
  - 将标题转换为句子式大写
  - 自动查找并补全期刊缩写
  - 自动查找并补全高校所在地
  - 统一日期、DOI、页码、卷号等字段格式
- 支持基于标识符（DOI、ArXiv ID 等）更新条目元数据

详细说明请参阅 [features](./features.md)。

## 安装

1. 前往 [发布页](https://github.com/northword/zotero-format-metadata/releases/) 或 [Zotero 中文社区](https://zotero-chinese.com/plugins/#search=linter) 下载 [最新的 `.xpi` 文件](https://github.com/northword/zotero-format-metadata/releases/latest/download/zotero-format-metadata.xpi).
2. 在 Zotero 中，点击菜单 `工具` -> `插件`，将下载的 `.xpi` 文件拖入 Zotero 插件管理器页面。参阅 [如何安装 Zotero 插件](https://zotero-chinese.com/user-guide/plugins/about-plugin.html)。

## Todo

参阅 [Project #1](https://github.com/users/northword/projects/1)。

## Contribution

参阅 [贡献指南](./CONTRIBUTING.md).

## 开源协议

GNU Affero General Public License v3.0

> Permissions of this strongest copyleft license are conditioned on making available complete source code of licensed works and modifications, which include larger works using a licensed work, under the same license. Copyright and license notices must be preserved. Contributors provide an express grant of patent rights. When a modified version is used to provide a service over a network, the complete source code of the modified version must be made available.

本插件继承 Zotero 插件开发模板的 AGPL v3.0 协议，为传染性开源协议。简单的说，你可以商用、修改、分发、专利使用及个人使用本插件。但当修改版本重新分发或用于提供网络服务时，必须注明协议，声明所做出的修改，保持开源且使用相同的协议。

## 致谢

[![使用 Zotero 插件开发模板](https://img.shields.io/badge/Using-Zotero%20Plugin%20Template-blue?style=flat-square&logo=github)](https://github.com/windingwind/zotero-plugin-template)

开发过程中使用了如下项目的数据：

- [ISO 639-3](https://github.com/wooorm/iso-639-3)
  - [Map of ISO 639-3 to ISO 639-1](https://github.com/amitbend/iso-639-3-to-1/blob/master/6393-6391.json)
- [JabRef/abbr.jabref.org](https://github.com/JabRef/abbrv.jabref.org)
- [中华人民共和国教育部：全国高等学校名单](http://www.moe.gov.cn/jyb_xxgk/s5743/s5744/A03/202110/t20211025_574874.html)
