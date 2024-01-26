# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- 修复 Zotero 7 beta 55 UI 更新导致富文本工具条失效的问题。/ fix: [#133](https://github.com/northword/zotero-format-metadata/issues/133)
- 移除首选项窗格中的一级标题，因为 Zotero 7 beta 55 起自动为插件生成一级标题。/ fix: [#133](https://github.com/northword/zotero-format-metadata/issues/133)

## [1.9.1] - 2024-01-24

### Fixed

- 尝试修复富文本标题框部分情况下无法正确新建的问题。/ Fix the rich text toolbar not being properly opened in some cases. fix: [#130](https://github.com/northword/zotero-format-metadata/issues/130), ref:[#78](https://github.com/northword/zotero-format-metadata/issues/78)

## [1.9.0] - 2024-01-14

### Added

- 适配 `extra.creatorsExt` 创作者拓展信息。目前仅适配国籍，暂未适配交换中英文名。/ Support `extra.creatorsExt` ref: [#106](https://github.com/northword/zotero-format-metadata/issues/106)

### Fixed

- 更新依赖，修复生产模式下 dialogHelper 打印日志的 bug。/ Update deps, fix useless console log in prod mode. close: [#56](https://github.com/northword/zotero-format-metadata/issues/56)

## [1.8.4] - 2024-01-12

### Fixed

- 兼容性优化：清除无用的首选项。/ Clear unused prefs.
- 禁用生产模式 `enableElementRecord`。/ Disable element record in prod mode. close: [#56](https://github.com/northword/zotero-format-metadata/issues/56)
- 清理代码，减少依赖项打包内容。

## [1.8.3] - 2024-01-12

### Fixed

- 修复新增条目字段格式化失效的问题。/ Fix bug in lint new item.

## [1.8.2] - 2024-01-03

### Fixed

- 修复首选项中的部分错别字。/ Fix typo in preference.
- 添加首选项：去除期卷页。/ Add option in preference for removing leading 0 in issue, volumn, pages.

## [1.8.1] - 2024-01-02

### Fixed

- 修复 1.7.0 重构导致的手动设置条目语言弹窗返回的为 ISO 639-3 而不是 ISO 639-1 的问题。/ Fix manually set language dialog returns ISO 639-3 instead of ISO 639-1.

## [1.8.0] - 2024-01-02

### Breaking Changes

- 现在不再提供期刊缩写类型（ISO 4 with dot，ISO 4 without dot，JCR）的选项，默认使用 ISO 4 with dot。/ The option for the type of journal abbreviation (ISO 4 with dot, ISO 4 without dot, JCR) is no longer available, and ISO 4 with dot is used by default. close: [#110](https://github.com/northword/zotero-format-metadata/issues/110)

### Fixed

- 仅当作者姓或名全大写或全小写时才转换作者大小写。/ Capitalize author only if the author's last name or first name is in all caps or all lower case. close: [#111](https://github.com/northword/zotero-format-metadata/issues/111)

## [1.7.0] - 2024-01-01

### Breaking Changes

- 语言识别限制现在使用 ISO 639-1 代码而不是 ISO 639-3 代码。/ Language recognition restrictions now use ISO 639-1 codes instead of ISO 639-3 codes. ref: [#99](https://github.com/northword/zotero-format-metadata/issues/99)

### Added

- 通过 DOI 更新字段数据后执行 Lint。/ Lint after retrive fields via doi. close: [#104](https://github.com/northword/zotero-format-metadata/issues/104)
- 去掉期卷页中多余的 `0`。/ Remove leading `0` in volume, issue, pages. close: [#20](https://github.com/northword/zotero-format-metadata/issues/20)

### Refactor

- 语言识别库切换至 TinyLD。close: [#99](https://github.com/northword/zotero-format-metadata/issues/99)
- 重构代码。close: [#107](https://github.com/northword/zotero-format-metadata/issues/107)

## [1.6.18] - 2023-12-26

### Fixed

- 更新期刊缩写。/ Update journal abbrev. close: #105

## [1.6.17] - 2023-12-21

- 管道测试，仅更新自述文档，无修复和更新。

## [1.6.16] - 2023-12-21

### Added

- 允许用户选择是否启用 `检测新增的网页条目是否正确`。/ Allows the user to enable or disable `Detecting the mistakes of added web page items`. [#102](https://github.com/northword/zotero-format-metadata/issues/102)

### Performance

- 对一个条目执行更新时，一次性保存所有字段，而不是每个字段分别保存一次。/ When updating an item, save all fields at once instead of saving each field separately.

## [1.6.15] - 2023-12-13

### Fixed

- 修复会议论文执行更新期刊名错误导致其 `proceedingsTitle` 被清空的问题。/ Fix an issue that causes `proceedingsTitle` are cleared when updating `publicationTitle`. [#94](https://github.com/northword/zotero-format-metadata/issues/94)

## [1.6.14] - 2023-12-12

管道测试，无内容更新和修复。/ Pipeline testing, no updates or fixes.

## [1.6.13] - 2023-12-12

管道测试，无内容更新和修复。/ Pipeline testing, no updates or fixes.

## [1.6.12] - 2023-12-12

管道测试，无内容更新和修复。/ Pipeline testing, no updates or fixes.

## [1.6.11] - 2023-11-16

### Fixed

- 更新期刊缩写数据集，修复 <https://github.com/northword/zotero-format-metadata/issues/5#issuecomment-1814430857>。

## [1.6.10] - 2023-11-03

### Fixed

- 修复文本拼写错误。[#87](https://github.com/northword/zotero-format-metadata/issues/87)

## [1.6.9] - 2023-11-03

### Fixed

- 修复上一版本引入 JabRef 数据导致期刊全称修正失效的问题。

## [1.6.8] - 2023-11-03

### Fixed

- 重新添加 JabRef 期刊缩写数据，数据会首选 library.ubc.ca ，次选 JabRef。[#5](https://github.com/northword/zotero-format-metadata/issues/5#issuecomment-1790844575)

## [1.6.7] - 2023-10-27

### Added

- 为部分已有功能添加选项：重复条目检测、修正期刊标题大小写。/ Add options to some existing features: duplicate item detection, fix case of journal titles. [#84](https://github.com/northword/zotero-format-metadata/issues/84)
- 将`标题转为句子式大写`加入标准格式化流程。/ Add `Convert Title to Sentence Capitalization` to the standard formatting flow. [#86](https://github.com/northword/zotero-format-metadata/issues/86)

## [1.6.6] - 2023-09-11

### Fixed

- 修复法律（立法和案例）条目处理时标题消失的 bug。/ Fixed an issue where processing legal items (Legislation and Cases) caused their titles to disappear. [#75](https://github.com/northword/zotero-format-metadata/issues/75), [#77](https://github.com/northword/zotero-format-metadata/issues/77)

## [1.6.5] - 2023-09-11

### Fixed

- `《》` 与 `〈〉`转换问题。/ Bug of `《》` <-> `〈〉`. [#76](https://github.com/northword/zotero-format-metadata/issues/76)

## [1.6.4] - 2023-09-09

### Added

- 允许在首选项中配置添加条目时自动处理排除群组文库。/ Allows to avoid automatic processing of items added to group libraries. [#24](https://github.com/northword/zotero-format-metadata/issues/24)

### Fixed

- 隐藏未实现功能的菜单。/ Hidden menu which unimplemented.
- 修改“格式化期刊标题”为“修正期刊标题的别称和大小写”

## [1.6.3] - 2023-09-09

### Added

- 转换标题中的书名号 `《》` 与 `〈〉`。/ Convert Chinese guillemet `《》` 与 `〈〉`. [#72](https://github.com/northword/zotero-format-metadata/issues/72), ref [redleafnew/Chinese-STD-GB-T-7714-related-csl#204](https://github.com/redleafnew/Chinese-STD-GB-T-7714-related-csl/issues/204)

### Fixed

- 将报错信息同步显示到进度提示框（控制台仍然输出）。/ Show error info to progress window.

## [1.6.2] - 2023-08-30

### Added

- 将全大写的期刊标题转为词首大写。/ Convert all-caps publicationTitle to word uppercase. [#66](https://github.com/northword/zotero-format-metadata/issues/66)

### Fixed

- 自定义期刊缩写文件内容为空时直接跳过。/ Custom journal abbreviations are skipped directly when the contents of the file are empty. [#52](https://github.com/northword/zotero-format-metadata/issues/52)

## [1.6.1] - 2023-08-23

### Fixed

- 添加菜单：更新期刊标题（当前仅支持消岐）。/ Add menu for setPublicationTitle.

## [1.6.0] - 2023-08-22

### Added

- 支持期刊全称消岐。/ fix publicationTitle disambiguation. [#11](https://github.com/northword/zotero-format-metadata/issues/11)
- 支持将 Arxiv 预印本的元数据更新到正式发表的版本。/ Support for updating metadata from Arxiv preprints to official publications. [#57](https://github.com/northword/zotero-format-metadata/issues/57)

## [1.5.0] - 2023-08-20

### Fixed

- 更换期刊缩写数据库，当前数据库来自 University of British Columbia，包含理工类英文期刊，其他领域待数据库整理好后再加。

## [1.4.6] - 2023-08-18

### Fixed

- 新增条目时出现三个提示的问题。/ Three prompts appear when adding an item.
- 标准格式化流程未修改 DOI 的问题。/ The standard formatting process did not modify the DOI issue.

## [1.4.5] - 2023-08-15

### Fixed

- 更新内置期刊缩写数据的获取规则，现与 JabRef 仓库脚本保持一致，使用最后匹配到的。已发现了一些错误，正在向上游仓库反馈。see: feb3402f1fe1abc326c1c64d346ee26ca77b2d22
  后续拟通过其他方式获取缩写，不再将 JabRef 作为首选。

## [1.4.4] - 2023-08-14

### Fixed

- 捕获自定义期刊缩写文件的语法错误。/ Catch custom abbr data json syntax error.

## [1.4.3] - 2023-08-14

### Added

- 使用新的插件图标。/ New icon for addon.

## [1.4.2] - 2023-08-14

### Fixed

- 允许在生产环境打印错误。

## [1.4.1] - 2023-08-14

### Fixed

- 修复查询期刊缩写不生效（不论有无缩写，都以全称或空白填充）的问题。
- 更新依赖，避免与其他插件的冲突。

## [1.4.0] - 2023-08-13

### Added

- 查询期刊缩写时允许使用本地自定义期刊缩写数据文件。/ Custom abbr. data

## [1.3.0] - 2023-08-11

### Added

- 首选项窗格增加“帮助”按钮，目前指向仓库主页 README 文档。
- 新增条目时，如果是网页条目，且其网址包含主要学术出版商的域名，则提示用户是否导入了错误的条目类型。/ When adding an item, if its item type is a web page and its URL contains the domain of the major scholarly publisher, prompt the user to ask if they have imported the wrong type of item.

## [1.2.0] - 2023-08-11

### Added

- 变更插件名为 `Linter for Zotero`。/ Change addon name to `Linter for Zotero`.
- 新增条目时检查其是否存在重复条目。/ Check for duplicate items when new items are added.

### Fixed

- 修复由于之前重构导致的手动设置条目语言失效的问题。

## [1.1.1] - 2023-08-09

### Fixed

- 修复部分标题句子式大写转换问题。Zotero 更新了其内置的转换方法，在其基础上扩展支持化学元素。/ fix: to sentence case
  close #35, #27, #18
  related: <https://github.com/zotero/utilities/pull/26>

## [1.1.0] - 2023-08-09

### Added

- 依照 Zotero 官方团队建议，修改插件名为 `Format Metadata for Zotero`。/ Change addon name to `Format Metadata for Zotero`.
- 修复作者的大小写。 / Fix case of creators.

### Fixed

- 菜单中的大小写。/ Fix typo.
- 继续尝试修复 [1.0.6 尝试修复的 main window load 问题](#106---2023-08-04)。

## [1.0.7] - 2023-08-07

### Added

- 批量处理允许在进度框中结束处理。/ Batch processing allows to end processing in the progress window.

### Fixed

- 将更新清单文件链接从 JsDelivr 变更回 GitHub，不再掩耳盗铃，毕竟访问不了 `raw.githubusercontent.com` 的用户八成也访问不了 release page。

## [1.0.6] - 2023-08-04

### Fixed

- 尝试修复 MAC 上关闭主界面不退出进程重新打开后插件部分功能失效的问题。/ Try to fix the issue that some functions of the plugin do not work after reopening the main window on MAC.
  - <https://github.com/windingwind/zotero-plugin-template/pull/67>
  - <https://groups.google.com/g/zotero-dev/c/zVn4k9dLoak>
- 更新依赖，避免插件间冲突。/ Update dependencies to avoid conflicts between plugins.  
   <https://github.com/windingwind/zotero-pdf-translate/issues/526>

## [1.0.5] - 2023-07-19

### Added

- 允许从 DOI 更新字段时仅更新为空的字段。/ Allows only empty fields to be updated when retrieving fields from the DOI.
- 重新组织首选项页面。/ Redesign of the preferences.

## [1.0.4] - 2023-07-13

### Chore

- 变更插件更新清单文件路径。/ Change URI of `update.json`.

## [1.0.3] - 2023-07-11

### Fixed

- 更新期刊缩写数据。/ Update journal abbr data.

## [1.0.2] - 2023-07-11

### Fixed

- 修复本地化文本与其他插件的冲突。/ Fix localized text conflicts with other plugins.

## [1.0.1] - 2023-06-17

### Fixed

- 修复手动选择语言对话框不可用的问题。/ Fix the problem that the manual language selection dialog is not available.
- 当禁用插件时，关闭所有本插件的对话框。/ Close all dialogs for this plugin when the plugin is disabled.

## [1.0.0] - 2023-06-16

### Breaking Changes

- 不再支持 Zotero 6。由于本地化系统迁移至 fluent，同时兼容 Zotero 6 可能较大增加维护负担，故提前结束 Zotero 6 支持，最高兼容 Zotero 6 的插件版本为 0.4.4，当前版本（1.0.0）起仅支持 Zotero 7。 / Drop support for Zotero 6.

### Added

- 在标题、期刊字段右击的菜单里添加“句首大写（扩展）”。 / Add "Sentence case (Extended)" to the right-click menu in the Title and Journal fields.

### Fixed

- 提高菜单图标的清晰度。 / Improve the resolution of menu icons.

## [0.4.4] - 2023-06-11

### Fixed

- 更新 zotero-plugin-toolkit ，修复菜单没有 icon 的问题。[windingwind/zotero-plugin-toolkit#24](https://github.com/windingwind/zotero-plugin-toolkit/pull/24) / fix: menu icon do not show.

## [0.4.3] - 2023-06-10

### Fixed

- 临时禁止通过 DOI 更新字段时更改期刊类型。 / Temporarily disables change of item type by doi.
- 临时恢复使用 ztoolkit.getDOMParser() 以适配 Zotero 6。 / Revert to use ztoolkit.getDOMParser().

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

- 将标题从“标题式大写”转为“句子式大写” / Convert title from "headline capitalization" to "sentence capitalization"
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

[unreleased]: https://github.com/northword/zotero-format-metadata/compare/v1.9.1...HEAD
[1.6.11]: https://github.com/northword/zotero-format-metadata/compare/1.6.10...1.6.11
[1.6.10]: https://github.com/northword/zotero-format-metadata/compare/1.6.9...1.6.10
[1.6.9]: https://github.com/northword/zotero-format-metadata/compare/1.6.8...1.6.9
[1.6.8]: https://github.com/northword/zotero-format-metadata/compare/1.6.7...1.6.8
[1.6.7]: https://github.com/northword/zotero-format-metadata/compare/1.6.6...1.6.7
[1.6.6]: https://github.com/northword/zotero-format-metadata/compare/1.6.5...1.6.6
[1.6.5]: https://github.com/northword/zotero-format-metadata/compare/1.6.4...1.6.5
[1.6.4]: https://github.com/northword/zotero-format-metadata/compare/1.6.3...1.6.4
[1.6.3]: https://github.com/northword/zotero-format-metadata/compare/1.6.2...1.6.3
[1.6.2]: https://github.com/northword/zotero-format-metadata/compare/1.6.1...1.6.2
[1.6.1]: https://github.com/northword/zotero-format-metadata/compare/1.6.0...1.6.1
[1.6.0]: https://github.com/northword/zotero-format-metadata/compare/1.5.0...1.6.0
[1.5.0]: https://github.com/northword/zotero-format-metadata/compare/1.4.6...1.5.0
[1.4.6]: https://github.com/northword/zotero-format-metadata/compare/1.4.5...1.4.6
[1.4.5]: https://github.com/northword/zotero-format-metadata/compare/1.4.4...1.4.5
[1.4.4]: https://github.com/northword/zotero-format-metadata/compare/1.4.3...1.4.4
[1.4.3]: https://github.com/northword/zotero-format-metadata/compare/1.4.2...1.4.3
[1.4.2]: https://github.com/northword/zotero-format-metadata/compare/1.4.1...1.4.2
[1.4.1]: https://github.com/northword/zotero-format-metadata/compare/1.4.0...1.4.1
[1.4.0]: https://github.com/northword/zotero-format-metadata/compare/1.3.0...1.4.0
[1.3.0]: https://github.com/northword/zotero-format-metadata/compare/1.2.0...1.3.0
[1.2.0]: https://github.com/northword/zotero-format-metadata/compare/1.1.1...1.2.0
[1.1.1]: https://github.com/northword/zotero-format-metadata/compare/1.1.0...1.1.1
[1.1.0]: https://github.com/northword/zotero-format-metadata/compare/1.0.7...1.1.0
[1.0.7]: https://github.com/northword/zotero-format-metadata/compare/1.0.6...1.0.7
[1.0.6]: https://github.com/northword/zotero-format-metadata/compare/1.0.5...1.0.6
[1.0.5]: https://github.com/northword/zotero-format-metadata/compare/1.0.4...1.0.5
[1.0.4]: https://github.com/northword/zotero-format-metadata/compare/1.0.3...1.0.4
[1.0.3]: https://github.com/northword/zotero-format-metadata/compare/1.0.2...1.0.3
[1.0.2]: https://github.com/northword/zotero-format-metadata/compare/1.0.1...1.0.2
[1.0.1]: https://github.com/northword/zotero-format-metadata/compare/1.0.0...1.0.1
[1.0.0]: https://github.com/northword/zotero-format-metadata/compare/0.4.4...1.0.0
[0.4.4]: https://github.com/northword/zotero-format-metadata/compare/0.4.3...0.4.4
[0.4.3]: https://github.com/northword/zotero-format-metadata/compare/0.5.0-0...0.4.3
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
[1.9.1]: https://github.com/northword/zotero-format-metadata/compare/v1.9.0...v1.9.1
[1.9.0]: https://github.com/northword/zotero-format-metadata/compare/v1.8.4...v1.9.0
[1.8.4]: https://github.com/northword/zotero-format-metadata/compare/v1.8.3...v1.8.4
[1.8.3]: https://github.com/northword/zotero-format-metadata/compare/v1.8.2...v1.8.3
[1.8.2]: https://github.com/northword/zotero-format-metadata/compare/v1.8.1...v1.8.2
[1.8.1]: https://github.com/northword/zotero-format-metadata/compare/v1.8.0...v1.8.1
[1.8.0]: https://github.com/northword/zotero-format-metadata/compare/v1.7.0...v1.8.0
[1.7.0]: https://github.com/northword/zotero-format-metadata/compare/v1.6.18...v1.7.0
[1.6.18]: https://github.com/northword/zotero-format-metadata/compare/v1.6.17...v1.6.18
[1.6.17]: https://github.com/northword/zotero-format-metadata/compare/v1.6.16...v1.6.17
[1.6.16]: https://github.com/northword/zotero-format-metadata/compare/v1.6.15...v1.6.16
[1.6.15]: https://github.com/northword/zotero-format-metadata/compare/v1.6.14...v1.6.15
[1.6.14]: https://github.com/northword/zotero-format-metadata/compare/v1.6.13...v1.6.14
[1.6.13]: https://github.com/northword/zotero-format-metadata/compare/v1.6.12...v1.6.13
[1.6.12]: https://github.com/northword/zotero-format-metadata/releases/tag/v1.6.12
