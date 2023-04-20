# Zotero Format Metadata

[![zotero target version](https://img.shields.io/badge/Zotero-6.x-critical?style=flat-square&logo=zotero&logoColor=CC2936)](https://www.zotero.org)
[![version](https://img.shields.io/github/package-json/v/northword/zotero-format-metadata?style=flat-square)](https://github.com/northword/zotero-format-metadata/releases/)
[![download number](https://img.shields.io/github/downloads/northword/zotero-format-metadata/latest/zotero-format-metadata.xpi?style=flat-square)](https://github.com/northword/zotero-format-metadata/releases/)  
![code size](https://img.shields.io/github/languages/code-size/northword/zotero-format-metadata?style=flat-square)
[![license](https://img.shields.io/github/license/northword/zotero-format-metadata?style=flat-square)](#licence)
[![Using Zotero Plugin Template](https://img.shields.io/badge/Using-Zotero%20Plugin%20Template-blue?style=flat-square&logo=github)](https://github.com/windingwind/zotero-plugin-template)

An addon for [Zotero](https://www.zotero.org/) to format item metadata.

[简体中文](./docs/README-zh.md)

## Features

### Shortcut to set subscripts, bold and italic, etc

The rich text content in Zotero's reference list requires manual insertion of HTML tags (See [^rich_text_bibliography]), which is difficult for the common user. Although Zotero's documentation mentions that visual editing of rich text will be supported in future versions, years have passed without any progress on this issue, so this plugin provides a quick way to insert these HTML tags.

[^rich_text_bibliography]: https://www.zotero.org/support/kb/rich_text_bibliography

#### Shortcuts

- Supscript: `Ctrl` + `Shift` + `+`
- Subscript: `Ctrl` + `=`
- Bold: `Ctrl` + `B`
- Italic: `Ctrl` + `I`

![Set subscript via shoutcut](./docs/assets/set-sub-via-shoutcut.gif)

#### Toolbar

![Set subscript via toolbar](./docs/assets/set-sub-via-toolbar.gif)

### Look up the journal abbreviation according to the journal full name

The plugin has a built-in dataset of about 96,000 journal abbreviations, and the plugin will first look up the journal abbreviations in the local dataset;

If none are available, the abbreviations are inferred from the [ISSN List of Title Word Abbreviations](https://www.issn.org/services/online-services/access-to-the-ltwa/) (optional);

If still no abbreviations are found, the full name of the journal is substituted (optional).

### Look up the place of the university according to its name

The plugin has a built-in list of universities in mainland China and their locations. For the thesis items, the location is filled in according to the university of the thesis, which is helpful to meet the requirement of GB/T 7714-2015 for the thesis to show the location [^gb7714].

[^gb7714]: Chinese GB/T 7714-2015: http://www.cessp.org.cn/a258.html

### Lookup the date, volume, issue, pages, etc according to DOI

Some items in the Zotero library may be added with incomplete information such as issue volume pages because the converter is not available, or the official publication is not in the journal at the time of record, etc. The plugin provides the ability to complete these fields based on the DOI.

### Fill in the language of the item according to its title

The plugin determines the language of an item based on its title. Mixing "et al" and "等" in CSL by setting the Language field [^csl-etal] .

[^csl-etal]: https://github.com/redleafnew/Chinese-STD-GB-T-7714-related-csl#%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8

## Todo

- [ ] 标题 HTML 标签
  - [x] 快捷键应用上下标、粗体斜体等
  - [x] 选中文本后弹出迷你菜单提供上下标按钮
    - [x] 记忆工具条位置
    - [ ] 工具条按钮描述改为图形
    - [ ] 提供选项：修改后的标题实时可视化
  - [ ] 建立常见化学式的映射或化学式正则模式匹配以批量自动替换
- [ ] 期刊：刊名与缩写
  - [ ] 期刊全称消歧：例如 `Applied Catalysis B-environmental` 与 `Applied Catalysis B: environmental` 为相同期刊
  - [ ] 根据期刊名填充期刊缩写
    - [x] 本地术语表
    - [ ] ~~API，~~ 用户自定义术语表
    - [x] 提供 ISO 4 with dot, ISO 4 without dot, 和 JCR 缩写的偏好选项
    - [x] 无缩写时通过 ISSN LTWA 推断缩写
    - [ ] 无缩写时分别是否以全称填充（英文已可以设置，中文缩写是什么？）
- [ ] 期刊：DOI 格式化
- [x] 期刊：期卷页
  - [x] 如果没有期卷页，根据 DOI 获取补全
- [x] 学位论文：地点
  - [x] 根据学校名填充地点
- [ ] 日期格式化为 ISO 格式
- [ ] 语言
  - [x] 通过语言识别库识别（通过 franc 识别标题的语言，转为 ISO 639-1 语言代码）
  - [x] 设置常用语言偏好
  - [ ] ~~期刊与语言的映射（似乎识别标题已经满足需求，无需建立该映射）~~
  - [ ] ~~常见错误语言值直接映射为 ISO 值 （总之都要识别，不做了）~~
  - [x] ~~ISO 639 语言代码 转 ISO 3166 国家区域代码（已添加 `zh-CN` 和 `en-US` 的映射，其他语言待办）（咨询后决定不做 <https://github.com/redleafnew/Chinese-STD-GB-T-7714-related-csl/issues/160> ）~~
  - [ ] 手动设置条目语言，选择后弹窗， `zh-CN` 和 `en-US` 单选框和 1 个输入框，常用的中英文也可以放进子菜单
- [x] 添加时自动应用
- [ ] 添加时自动检测是否存在重复条目

## Install

1. Go to the [release page](https://github.com/northword/zotero-format-metadata/releases/) to download [the latest `.xpi` file](https://github.com/northword/zotero-format-metadata/releases/latest/download/zotero-format-metadata.xpi).  
If you are in mainland China or cannot access GitHub easily, please download the plugin via the following mirror sites.
    - [GitHub Proxy](https://ghproxy.com/?q=https%3A%2F%2Fgithub.com%2Fnorthword%2Fzotero-format-metadata%2Freleases%2Flatest%2Fdownload%2Fzotero-format-metadata.xpi)
    - [Gitee](https://zotero-chinese.gitee.io/zotero-plugins/#/)
2. Then, in Zotero, click `Tools` -> `Add-ons` and drag the `.xpi` onto the Add-ons window. See [how to install a Zotero addon](https://zotero.yuque.com/staff-gkhviy/zotero/addons#B2kU3).

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).

## Licence

GNU Affero General Public License v3.0

Permissions of this strongest copyleft license are conditioned on making available complete source code of licensed works and modifications, which include larger works using a licensed work, under the same license. Copyright and license notices must be preserved. Contributors provide an express grant of patent rights. When a modified version is used to provide a service over a network, the complete source code of the modified version must be made available.

## Alternatives

### Rich Text HTML Tags

Some quicker actions are available:

- [Supscript](https://getquicker.net/Sharedaction?code=dee60abc-d1f5-40ad-99c3-08d9c6b06ad1)
- [Subscript](https://getquicker.net/Sharedaction?code=b44c0592-89fa-41c2-99c4-08d9c6b06ad1)
- [Bold](https://getquicker.net/Sharedaction?code=dc815b9a-f463-4233-99c5-08d9c6b06ad1)
- [Italic](https://getquicker.net/Sharedaction?code=98c3d460-22b5-49ab-99c2-08d9c6b06ad1)

### Journal abbreviation

Both [zotero-journalabbr] and [zotero-updateifsE] plugins provide similar function.

where zotero-journalabbr's local dataset is essentially the same as this plugin, both being JabRef abbreviated data, while zotero-journalabbr uses [journal abbreviated data provided by Columbia University Library](https://woodward.library.ubc.ca/woodward/research-help/journal-abbreviations/), so if you only need journal abbreviation functionality, then this plugin is a good choice!

zotero-updateifsE is a plugin to update data such as impact factor, partition rank, etc. for journals. For journal abbreviations, its readme file mentions that it contains only about 5000 journal abbreviations and does not support Columbia University Library data and ISSN LTWA inferences. Its journal abbreviation function is more suitable for light use.

This plug-in adds the ability to infer abbreviations from ISSN LTWA to JabRef data, which basically covers most journals.

[zotero-journalabbr]: https://github.com/zoushucai/zotero-journalabbr
[zotero-updateifsE]: https://github.com/redleafnew/zotero-updateifsE

### Place

A quicker action is available: [填充城市](https://getquicker.net/Sharedaction?code=b5506c59-6116-4111-a65e-08db363ab19b)

### Language

The [Jasminum](https://gitee.com/l0o0/jasminum) and [Delitem](https://github.com/redleafnew/delitemwithatt) plugins provide similar functionality, but the language recognition provided by Jasminum is based on `nlp.js` and seems is not pre-processed and does not work well for text with HTML tags or chemical formulas in the title, Delitem only provides direct specification of the two languages.

This plugin based `franc` and has been processed for HTML tags to improve the recognition accuracy. However, if you have no demand for the other features provided by this plugin and are a Jasminum user, then using the Jasminum plugin is already fully satisfying and there is no need to load tens of extra megabytes of plugins for this slight increase in accuracy.

## Acknowledgements

[![Using Zotero Plugin Template](https://img.shields.io/badge/Using-Zotero%20Plugin%20Template-blue?style=flat-square&logo=github)](https://github.com/windingwind/zotero-plugin-template)

The code of the following plug-ins was referenced during the development of this plug-in:  

- [redleafnew/zotero-updateifsE](https://github.com/redleafnew/zotero-updateifsE)
- [zoushucai/zotero-journalabbr](https://github.com/zoushucai/zotero-journalabbr)
- [windingwind/zotero-pdf-translate](https://github.com/windingwind/zotero-pdf-translate)
- [windingwind/zotero-pdf-preview](https://github.com/windingwind/zotero-pdf-preview)

The following data sets were used:

- [ISO 639-3](https://github.com/wooorm/iso-639-3)
  - [Map of ISO 639-3 to ISO 639-1](https://github.com/amitbend/iso-639-3-to-1/blob/master/6393-6391.json)
- [JabRef/abbr.jabref.org](https://github.com/JabRef/abbrv.jabref.org)
- [中华人民共和国教育部：全国高等学校名单](http://www.moe.gov.cn/jyb_xxgk/s5743/s5744/A03/202110/t20211025_574874.html)
