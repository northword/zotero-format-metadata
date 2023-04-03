# Zotero Format Metadada

我是一个 [Zotero](https://www.zotero.org/) 插件，可以规范化/格式化条目的元数据。

## 特性

### 快速设置上下标、粗体和斜体

Zotero 的参考文献表中的富文本内容需要手动插入 HTML 标签来实现 [1]，这对于不爱折腾的人来说非常麻烦，虽然 Zotero 的文档上提及将在后续版本支持富文本可视化编辑，然而数年过去了，该议题没有任何进展，故本插件提供了快捷插入这些 HTML 标签的途径。

[1]: https://www.zotero.org/support/kb/rich_text_bibliography

#### 快捷键

- 上标（`Ctrl` + `Shift` + `+`）
- 下标（`Ctrl` + `+`）
- 粗体（`Ctrl` + `B`）
- 斜体（`Ctrl` + `I`）  

![Set subscript via shoutcut](./assets/set-sub-via-shoutcut.gif)

#### 工具条

WIP

### 根据期刊全称填充期刊缩写

插件内置了一个包含约13万条期刊缩写的数据集，插件将首先在本地数据集里查询期刊缩写；

若无则根据 ISSN List of Title Word Abbreviations 推断其缩写（提供选项）；

若仍没有找到缩写，则以期刊全称代替（提供选项）。

### 根据高校名称填写高校所在地

插件内置了国内高校的名单及其所在地，对于学位论文条目，根据论文的高校填写其所在地，这有利于满足 GB/T 7714-2015 中对于学位论文需要显示所在地的要求。

### 自动填写条目语言

插件根据条目的标题判断其语言。

> [茉莉花](https://gitee.com/l0o0/jasminum) 和 [Delitem](https://github.com/redleafnew/delitemwithatt) 插件也提供了类似的功能，但茉莉花提供的语言识别基于 `nlp.js`，且似是未经预处理的原因，对于标题内含有 HTML 标签或化学式的文本识别效果不佳， Delitem 仅提供了两种语言的直接指定。本插件针对 HTML 标签进行了处理，提高了识别准确率。

## 安装

1. 前往 [发布页](https://github.com/northword/zotero-format-metadata/releases/) 下载 [最新的 .xpi 文件](https://github.com/northword/zotero-format-metadata/releases/latest/download/zotero-format-metadata.xpi).  
如果你无法顺利的访问 GitHub，可以前往以下几个镜像站下载本插件。
    - [GitHub Proxy](https://ghproxy.com/?q=https%3A%2F%2Fgithub.com%2Fnorthword%2Fzotero-format-metadata%2Freleases%2Flatest%2Fdownload%2Fzotero-format-metadata.xpi)
    - [Zotero 插件下载](https://zotero-chinese.gitee.io/zotero-plugins/#/)
1. 将下载的 xpi 文件拖入 Zotero 插件管理器页面。参阅 [如何安装 Zotero 插件](https://zotero.yuque.com/staff-gkhviy/zotero/addons#B2kU3).

## 变更日志

本插件的主要变更历史列于 [CHANGELOG.md](./CHANGELOG.md) 中。

## 开源协议

GNU Affero General Public License v3.0

## 致谢

[![使用 Zotero 插件开发模板](https://img.shields.io/badge/Using-Zotero%20Plugin%20Template-blue?style=flat-square&logo=github)](https://github.com/windingwind/zotero-plugin-template)

插件开发过程中参考了如下项目的代码：

- [redleafnew/zotero-updateifsE](https://github.com/redleafnew/zotero-updateifsE)
- [zoushucai/zotero-journalabbr](https://github.com/zoushucai/zotero-journalabbr)
- [windingwind/zotero-pdf-translate](https://github.com/windingwind/zotero-pdf-translate)
- [windingwind/zotero-pdf-preview/](https://github.com/windingwind/zotero-pdf-preview)

开发过程中使用了如下项目的数据：

- [ISO 639-3](https://github.com/wooorm/iso-639-3)
  - [Map of ISO 639-3 to ISO 639-1](https://github.com/amitbend/iso-639-3-to-1/blob/master/6393-6391.json)
- [JabRef/abbr.jabref.org](https://github.com/JabRef/abbrv.jabref.org)
- [中华人民共和国教育部：全国高等学校名单](http://www.moe.gov.cn/jyb_xxgk/s5743/s5744/A03/202110/t20211025_574874.html)
