# Zotero Format Metadada

An addon for [Zotero](https://www.zotero.org/) to format item metadata.

## Todo

- [ ] 标题 HTML 标签
  - [ ] 快捷键应用上下标
  - [ ] 选中文本后弹出迷你菜单提供上下标按钮
  - [ ] 建立常见化学式的映射以批量自动替换
  - [ ] 斜体、粗体等
- [ ] 期刊：刊名与缩写
  - [ ] 期刊全称消歧：例如 `Applied Catalysis B-environmental` 与 `Applied Catalysis B: environmental` 为相同期刊
  - [ ] 根据期刊名填充期刊缩写
    - [x] 本地术语表
    - [ ] ~~API，~~ 用户自定义术语表
    - [x] 提供 ISO 4 with dot, ISO 4 without dot, 和 JCR 缩写的偏好选项
    - [x] 无缩写时通过 ISSN LTWA 推断缩写
    - [ ] 无缩写时分别是否以全称填充（英文已可以设置，中文缩写是什么？）
- [ ] 期刊：DOI 格式化
- [ ] 期刊：期卷页
  - [ ] 如果没有期卷页，根据 DOI 获取补全
- [x] 学位论文：地点
  - [x] 根据学校名填充地点
- [ ] 日期格式化为 ISO 格式
- [ ] 语言
  - [x] 通过语言识别库识别（通过 franc 识别标题的语言，转为 ISO 639-1 语言代码）
  - [x] 设置常用语言偏好
  - [ ] ~~期刊与语言的映射（似乎识别标题已经满足需求，无需建立该映射）~~
  - [ ] ~~常见错误语言值直接映射为 ISO 值 （总之都要识别，不做了）~~
  - [x] ISO 639 语言代码 转 ISO 3166 国家区域代码（已添加 `zh-CN` 和 `en-US` 的映射，其他语言待办）
  - [ ] 手动设置条目语言，选择后弹窗， `zh-CN` 和 `en-US` 单选框和 1 个输入框，常用的中英文也可以放进子菜单
- [ ] 添加时自动应用

## Install

1. Go to the [release page](https://github.com/northword/zotero-format-metadata/releases/) to download [the latest .xpi file](https://github.com/northword/zotero-format-metadata/releases/latest/download/zotero-format-metadata.xpi).  
If you are in mainland China or cannot access GitHub easily, you can go to the following mirror site to download.
    - [GitHub Proxy](https://ghproxy.com/?q=https%3A%2F%2Fgithub.com%2Fnorthword%2Fzotero-format-metadata%2Freleases%2Flatest%2Fdownload%2Fzotero-format-metadata.xpi)
    - JsDeliver
    - Gitee
2. Drag it into the Zotero add-on manager. See [How to install a Zotero addon](https://zotero.yuque.com/staff-gkhviy/zotero/addons#B2kU3).

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).

## Licence

GNU Affero General Public License v3.0

## Acknowledgements

[![Using Zotero Plugin Template](https://img.shields.io/badge/Using-Zotero%20Plugin%20Template-blue?style=flat-square&logo=github)](https://github.com/windingwind/zotero-plugin-template)

The code of the following plug-ins was referenced during the development of this plug-in:  

- [redleafnew/zotero-updateifsE](https://github.com/redleafnew/zotero-updateifsE)
- [zoushucai/zotero-journalabbr](https://github.com/zoushucai/zotero-journalabbr)

The following data sets were used:

- [ISO 639-3](https://github.com/wooorm/iso-639-3)
  - [Map of ISO 639-3 to ISO 639-1](https://github.com/amitbend/iso-639-3-to-1/blob/master/6393-6391.json)
- [JabRef/abbr.jabref.org](https://github.com/JabRef/abbrv.jabref.org)
- [中华人民共和国教育部：全国高等学校名单](http://www.moe.gov.cn/jyb_xxgk/s5743/s5744/A03/202110/t20211025_574874.html)
