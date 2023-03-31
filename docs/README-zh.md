# Zotero Format Metadada

我是一个 [Zotero](https://www.zotero.org/) 插件，可以规范化/格式化条目的元数据。

## 特性

1. 快速设置上下标、粗体和斜体。

    ![Set subscript via shoutcut](./assets/set-sub-via-shoutcut.gif)

2. 根据期刊全称填充期刊缩写。
3. 根据高校名称填写高校所在地。
4. 自动填写条目语言。

## 安装

1. 前往 [发布页](https://github.com/northword/zotero-format-metadata/releases/) 下载 [最新的 .xpi 文件](https://github.com/northword/zotero-format-metadata/releases/latest/download/zotero-format-metadata.xpi).  
如果你无法顺利的访问 GitHub，可以前往以下几个镜像站下载本插件。
    - [GitHub Proxy](https://ghproxy.com/?q=https%3A%2F%2Fgithub.com%2Fnorthword%2Fzotero-format-metadata%2Freleases%2Flatest%2Fdownload%2Fzotero-format-metadata.xpi)
    - JsDeliver
    - Gitee
2. 将下载的 xpi 文件拖入 Zotero 插件管理器页面。参阅 [如何安装 Zotero 插件](https://zotero.yuque.com/staff-gkhviy/zotero/addons#B2kU3).

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

开发过程中使用了如下项目的数据：

- [ISO 639-3](https://github.com/wooorm/iso-639-3)
  - [Map of ISO 639-3 to ISO 639-1](https://github.com/amitbend/iso-639-3-to-1/blob/master/6393-6391.json)
- [JabRef/abbr.jabref.org](https://github.com/JabRef/abbrv.jabref.org)
- [中华人民共和国教育部：全国高等学校名单](http://www.moe.gov.cn/jyb_xxgk/s5743/s5744/A03/202110/t20211025_574874.html)
