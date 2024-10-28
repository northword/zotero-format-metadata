<div align="center">

![Linter for Zotero](./assets/slogan-for-readme.jpg)

[![zotero target version](https://img.shields.io/badge/Zotero-7.0.*-green?&logo=zotero&logoColor=CC2936)](https://www.zotero.org)
[![version](https://img.shields.io/github/package-json/v/northword/zotero-format-metadata)](https://github.com/northword/zotero-format-metadata/releases/)
[![download number](https://img.shields.io/github/downloads/northword/zotero-format-metadata/latest/total)](https://github.com/northword/zotero-format-metadata/releases/)
[![license](https://img.shields.io/github/license/northword/zotero-format-metadata)](#开源协议)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/b851796e53724d7aa7c00923955e0f56)](https://app.codacy.com/gh/northword/zotero-format-metadata/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)
[![Using Zotero Plugin Template](https://img.shields.io/badge/Using-Zotero%20Plugin%20Template-blue?&logo=github)](https://github.com/windingwind/zotero-plugin-template)

本 README 还适用于以下语言：:cn: 简体中文 | [:gb: English](../README.md)

我是一个 [Zotero](https://www.zotero.org/) 插件，可以规范化/格式化条目的元数据（字段数据）。

</div></br>

## 特性

### 快速设置上下标、粗体和斜体

Zotero 的参考文献表中的富文本内容需要手动插入 HTML 标签来实现 （详见 [^rich_text_bibliography]），这对于不爱折腾的人来说非常麻烦，虽然 Zotero 的文档上提及将在后续版本支持富文本可视化编辑，然而数年过去了，该议题没有任何进展，故本插件提供了快捷插入这些 HTML 标签的途径。

[^rich_text_bibliography]: <https://www.zotero.org/support/kb/rich_text_bibliography>

#### 快捷键

选中文本后，按下以下快捷键快速应用相应样式：

- 上标：`Ctrl` + `Shift` + `+`
- 下标：`Ctrl` + `=`
- 粗体：`Ctrl` + `B`
- 斜体：`Ctrl` + `I`
- 阻止大写：设置 `class="nocase"` 阻止某些专有名词在 CSL title case 时被大写 (#17)

注：这些快捷键与 Word 中相应快捷键一致。

![Set subscript via shoutcut](./assets/set-sub-via-shoutcut.gif)

#### 工具条

编辑“标题”字段时，弹出工具条，编辑完成后单击空白处可以自动关闭工具条。该工具条可以在首选项中彻底关闭。

![Set subscript via toolbar](./assets/set-sub-via-toolbar.gif)

### 重复条目检查

当新增条目时，插件自动检查该条目是否与库中已有条目重复，若有重复，则提示用户确认。

### 条目类型检查

当添加网页类型条目，且其网址包含学术出版商域名时，提示用户。

todo: 根据网址得到条目标识符并强制更新。

### 将标题转为“句首大写”

Zotero 文档建议将标题存储为“句子式大写”的格式，这将有利于 CSL 对其执行“title case”变换 [^sentenceCase]。Zotero 7 内置了将标题转为“句子式大写”的功能，预置了一些特例识别，本插件在其基础上，增加了针对化学式等的专有名词识别。

详细的测试结果可以参考 [test/toSentenceCase.test.ts](../test/toSentenseCase.test.ts)。

[^sentenceCase]: <https://www.zotero.org/support/kb/sentence_casing>

### 期刊及其期刊缩写

对于期刊标题，插件将使相同的期刊统一。

插件内置了一个包含约 10 万条期刊缩写的数据集（来自 JabRef ），插件将首先在本地数据集里查询期刊缩写；

若无则根据 [ISSN List of Title Word Abbreviations](https://www.issn.org/services/online-services/access-to-the-ltwa/) 推断其缩写（可在首选项中关闭此行为）；

若仍没有找到缩写，则以期刊全称代替（可在首选项中关闭此行为）。

### 根据高校名称填写高校所在地

插件内置了国内高校的名单及其所在地，对于学位论文条目，根据论文的高校填写其所在地，这有利于满足 GB/T 7714-2015 中需要显示出版地的要求 [^gb7714]。

[^gb7714]: <http://www.cessp.org.cn/a258.html>

### 根据标识符补全条目的期、卷、页等信息

部分条目在添加时可能因为转换器未获取到、录入时未正式见刊等原因，导致期卷页等信息不完整，插件提供了根据 DOI 补全这些字段的功能。

对于书籍，可通过 ISBN 更新数据。预印本支持转为期刊文章（若有）。

### 自动填写条目语言

插件根据条目的标题判断其语言，并将识别结果填入“语言字段”，这对于 CSL 完成参考文献表双语排版（如 et al 与 等 混排）非常重要。[^csl-etal]。

默认的，插件被限制仅识别简体中文和英文，你可以在首选项中关闭语言限制或添加其他常用语言的 [ISO 639-1 代码]。

[^csl-etal]: <https://github.com/redleafnew/Chinese-STD-GB-T-7714-related-csl#%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8>

[ISO 639-1 代码]: https://github.com/komodojp/tinyld/blob/develop/docs/langs.md

### 更多

DOI 去前缀、日期修改为 ISO 格式等。

> [!tip]
> 以上涉及条目字段处理的功能既提供自动运行的选项，也提供了条目右键菜单供用户手动（和批量）触发。

请阅读 [特性](./features.md)。

## 安装

1. 前往 [发布页](https://github.com/northword/zotero-format-metadata/releases/) 下载 [最新的 `.xpi` 文件](https://github.com/northword/zotero-format-metadata/releases/latest/download/zotero-format-metadata.xpi).
   - 如果你无法顺利的访问 GitHub，可以前往 [Zotero 插件镜像下载 - Zotero 中文社区](https://plugins.zotero-chinese.com/) 下载。
   - 如果你使用 FireFox ，请在 XPI 文件的链接上右击，选择“另存为...”。
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
