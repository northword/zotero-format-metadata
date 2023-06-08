# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.5.0-0] - 2023-06-08

### Fixed

- 为富文本工具条中按钮的提示文本增加中文翻译。 / Add Chinese translation for the prompt text of the buttons in the rich text toolbar.
- 句首大写转换不再支持 Zotero 6。 / Sentence-style case transformation is no longer supported for Zotero 6.
- 更新期刊缩写数据。 / Update journal abbreviation data.

## [0.4.2] - 2023-05-24

### Fixed

- 修复转为句子式大小写在 Zotero 7 中无法使用的问题。 / Fix conversion to sentence case not working in Zotero 7.

## [0.4.1] - 2023-05-24

### Fixed

- 仅在用户文库新增条目时更新，Group 和 Feed 不更新。/ Updates only when new items are added to the user's library; Groups and Feeds are not updated. Fixed #24.
- 修复富文本工具条在 Zotero 7 上不可用的问题。 / Fix rich text toolbar not working on Zotero 7.
- 修复首选项小标题在 Zotero 7 上不显示的问题。 / Fix preference subheading not showing on Zotero 7.

## [0.4.0] - 2023-05-07

### Added

- 将标题从“标题式大写”转为“句子式大写”  /  Convert title from "headline capitalization" to "sentence capitalization"
- 为富文本工具条“NoCase”按钮添加图标 / Add icon for "No Case" button in rich text tool bar

## [0.3.2] - 2023-05-03

### Added

- 支持设置 `class="nocase"` 阻止某些专有名词在 CSL title case 时被大写 (#17)。  
Support for setting `class="nocase"` to prevent certain special names from being capitalized in CSL title cases (#17).

## [0.3.1] - 2023-05-01

### Fixed

- 行为优化：替换富文本标签后自动选中替换后的文本。原行为为光标置于最后。

## [0.3.0] - 2023-04-30

### Added

- 手动设置条目语言，#13 。
- 富文本工具条，按钮改为图标，#8 。

### Fixed

- 修复设置缩写类别无效的问题。

### Chore

- 项目增加 ESLint，Prettier

## [0.2.1] - 2023-04-26

### Fixed

- 更新依赖：zotero-plugin-toolkit, zotero-types。
- 依赖恢复使用 npm 包，不使用本地 fork。
- 更新批量处理的结果显示：无错误时不显示错误 icon 和数量。

## [0.2.0] - 2023-04-21

### Added

- 将日期格式化为 ISO 格式。
- 清理 DOI 中的域名部分。
- 期刊缩写分中英文，可选中文直接填入全称。

## [0.1.2] - 2023-04-21

### Fixed

- 修复新增条目触发转换器导致递归新增的问题。
- 优化批量处理的进度提示。

## [0.1.1] - 2023-04-20

### Fixed

- 临时关闭添加条目时更新期卷页等，因为添加期卷页会临时创建新条目，这再一次触发添加条目更新，递归无底洞，害怕.jpg。

## [0.1.0] - 2023-04-20

### Added

- 当选中条目不是常规条目时禁用右键菜单。
- 增加 Collection 右键菜单。
- 根据 DOI 更新条目的年、期卷页、链接等字段。

### Fixed

- 修复 feed item 添加时，addOnItemAdd 被触发的问题。
- 更新一些文本翻译。

## [0.0.15] - 2023-04-16

### Fixed

- 重新生成期刊缩写数据，减少部分不必要数据，减小文件体积。
- 修复部分以 `The` 开头的期刊未能成功匹配的问题。
- 修复 `franc` 识别到的 ISO 639-3 code 如 `sco` 在本地 3 to 1 映射里不存在时报错的问题。
- 修复当 feed 和批注添加时标准格式化流程被执行的问题，现在仅当常规条目添加时才会触发标准格式化流程。

## [0.0.14] - 2023-04-11

### Fixed

- 修复上游期刊缩写数据中 Nature 错误的问题，全称“Nature”缩写应为“Nature”。

## [0.0.13] - 2023-04-08

### Added

- 富文本工具框记住位置，自动在上一次关闭的位置显示，便于操作。

## [0.0.12] - 2023-04-08

### Added

- 对于标题字段可以弹出富文本编辑工具框辅助插入上下标等 HTML 标签。暂未实现记忆工具框位置，每次弹出都在屏幕中央。

## [0.0.11] - 2023-04-07

### Fixed

- 去除高校地点的“市”字。
- 更新部分英文翻译文本。

## [0.0.10] - 2023-04-03

### Added

- 添加条目时自动更新

### Fixed

- 修复限制常用语言无效的问题。fix: restricted language function is not available. [`88048e8`](https://github.com/northword/zotero-format-metadata/commit/88048e8bb3a121cfd6f4d9b6ad77d3cbebae6cff)。
- 更新一些措辞。

## [0.0.9] - 2023-03-31

### Added

- 通过快捷键设置上标（`Ctrl` + `Shift` + `+`）、下标（`Ctrl` + `+`）、粗体（`Ctrl` + `B`）、斜体（`Ctrl` + `I`）。

## [0.0.8] - 2023-03-30

### Added

- 将识别到的条目语言按 Zotero 要求保存为 ISO 3166 代码。目前仅实现了简中和英文，其他语言待办。

### Fixed

- 修复条目标题过短时无法识别语言的问题。目前逻辑：当去除 HTML 标签后标题长度小于 10 时，将 franc 最小长度降低为 3 .

近日赶查重盲审，缓更新...

## [0.0.7] - 2023-03-26

### Added

- 当无缩写时，从 ISSN LTWA 推断其缩写
- 重构部分代码，提高代码可读性和可维护性，减少判断次数

## [0.0.6] - 2023-03-25

### Added

- 允许选择期刊缩写的类型。  
    Choose which journal abbreviation to use: ISO4 with dot (default), ISO without dot, JCR.
- 允许用户设置常用语言，以提高识别的准确度。  
    Allowing restrictions on commonly used languages when recognising languages to improve recognition accuracy.

## [0.0.5] - 2023-03-23

### Added

- 自动识别条目语言（根据标题，通过 franc 库，返回 ISO 639-3 语言代码，映射为 ISO 639-1 语言代码） [`d0f2a90`](https://github.com/northword/zotero-format-metadata/commit/d0f2a90b70becb0fa686887ef1f1b67d96c4555f)

## [0.0.4] - 2023-03-23

### Added

- 使用新的 LOGO [`a7d736e`](https://github.com/northword/zotero-format-metadata/commit/a7d736ef6afd4c20e32cd84afce796737324a1c2)

### Fixed

- 修复右键菜单的英文翻译 [`3b919db`](https://github.com/northword/zotero-format-metadata/commit/3b919dbaaf9ee802f32cece80a2b89caf50590f0)

## [0.0.3] - 2023-03-23

No changes, test release only.

## [0.0.2] - 2023-03-23

### Added

- 根据期刊/会议全称补充其缩写（ISO4 带点格式）
- 根据高校名称补全高校所在地

### Commits

- feat: update j-abbr and univ-place data [`04ce40b`](https://github.com/northword/zotero-format-metadata/commit/04ce40ba2765dbe254e290ced4f4fdacdeb4088a)
- feat: add journal abbr data [`336125a`](https://github.com/northword/zotero-format-metadata/commit/336125a1bf4371b1a443f9070ec2c4f50e1377b3)
- feat: add j-abbr and univ-place func [`a8300ac`](https://github.com/northword/zotero-format-metadata/commit/a8300acdaccad78d28cdacbdc17243996c5ed06c)
- chore: mv update.json to builds/ [`6b147de`](https://github.com/northword/zotero-format-metadata/commit/6b147de61464f5aec404daa47a8f8c883b54e2c5)
- chore: config template and dev envir [`63d212d`](https://github.com/northword/zotero-format-metadata/commit/63d212d0ee849aa860cb2615e2c0aff32b346d2c)
- feat: stage func code [`56dd736`](https://github.com/northword/zotero-format-metadata/commit/56dd736005814def49a431fe8a6533f814b0fd81)
- chore: update readme [`6e9e977`](https://github.com/northword/zotero-format-metadata/commit/6e9e97740f1b9b6aa26bab2c8b41024667db5eb4)
- chore: update readme [`5b8920c`](https://github.com/northword/zotero-format-metadata/commit/5b8920ce6d0fe14076581e6a426b3426a2f5cd9b)
- feat: add university list data [`665f57a`](https://github.com/northword/zotero-format-metadata/commit/665f57a0f74222a02987d833ef6fbcbf4943fcec)

[unreleased]: https://github.com/northword/zotero-format-metadata/compare/0.5.0-0...HEAD
[0.5.0-0]: https://github.com/northword/zotero-format-metadata/compare/0.4.2...0.5.0-0
[0.4.2]: https://github.com/northword/zotero-format-metadata/compare/0.4.1...0.4.2
[0.4.1]: https://github.com/northword/zotero-format-metadata/compare/0.4.0...0.4.1
[0.4.0]: https://github.com/northword/zotero-format-metadata/compare/0.3.2...0.4.0
[0.3.2]: https://github.com/northword/zotero-format-metadata/compare/0.3.1...0.3.2
[0.3.1]: https://github.com/northword/zotero-format-metadata/compare/0.3.0...0.3.1
[0.3.0]: https://github.com/northword/zotero-format-metadata/compare/0.2.1...0.3.0
[0.2.1]: https://github.com/northword/zotero-format-metadata/compare/0.2.0...0.2.1
[0.2.0]: https://github.com/northword/zotero-format-metadata/compare/0.1.2...0.2.0
[0.1.2]: https://github.com/northword/zotero-format-metadata/compare/0.1.1...0.1.2
[0.1.1]: https://github.com/northword/zotero-format-metadata/compare/0.1.0...0.1.1
[0.1.0]: https://github.com/northword/zotero-format-metadata/compare/0.0.15...0.1.0
[0.0.15]: https://github.com/northword/zotero-format-metadata/compare/0.0.14...0.0.15
[0.0.14]: https://github.com/northword/zotero-format-metadata/compare/0.0.13...0.0.14
[0.0.13]: https://github.com/northword/zotero-format-metadata/compare/0.0.12...0.0.13
[0.0.12]: https://github.com/northword/zotero-format-metadata/compare/0.0.11...0.0.12
[0.0.11]: https://github.com/northword/zotero-format-metadata/compare/0.0.10...0.0.11
[0.0.10]: https://github.com/northword/zotero-format-metadata/compare/0.0.9...0.0.10
[0.0.9]: https://github.com/northword/zotero-format-metadata/compare/0.0.8...0.0.9
[0.0.8]: https://github.com/northword/zotero-format-metadata/compare/0.0.7...0.0.8
[0.0.7]: https://github.com/northword/zotero-format-metadata/compare/0.0.6...0.0.7
[0.0.6]: https://github.com/northword/zotero-format-metadata/compare/0.0.5...0.0.6
[0.0.5]: https://github.com/northword/zotero-format-metadata/compare/0.0.4...0.0.5
[0.0.4]: https://github.com/northword/zotero-format-metadata/compare/0.0.3...0.0.4
[0.0.3]: https://github.com/northword/zotero-format-metadata/compare/0.0.2...0.0.3
[0.0.2]: https://github.com/northword/zotero-format-metadata/commits/0.0.2
