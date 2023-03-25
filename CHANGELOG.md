# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- 允许选择期刊缩写的类型。  
    Choose which journal abbreviation to use: ISO4 with dot (default), ISO without dot, JCR.
- 允许用户设置常用语言，以提高识别的准确度。  
    Allowing restrictions on commonly used languages when recognising languages to improve recognition accuracy.

## [0.0.5] - 2023-03-23

### Added

- 自动识别条目语言（根据标题，通过 franc 库，返回 ISO 639-3 语言代码，映射为 ISO 639-1 语言代码） [`d0f2a90`](https://github.com/northword/zotero-format-metadata/commit/d0f2a90b70becb0fa686887ef1f1b67d96c4555f)

## [0.0.4] - 2023-03-23

## Added

- 使用新的 LOGO [`a7d736e`](https://github.com/northword/zotero-format-metadata/commit/a7d736ef6afd4c20e32cd84afce796737324a1c2)

## Fixed

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

[unreleased]: https://github.com/northword/zotero-format-metadata/compare/0.0.5...HEAD
[0.0.5]: https://github.com/northword/zotero-format-metadata/compare/0.0.4...0.0.5
[0.0.4]: https://github.com/northword/zotero-format-metadata/compare/0.0.3...0.0.4
[0.0.3]: https://github.com/northword/zotero-format-metadata/compare/0.0.2...0.0.3
[0.0.2]: https://github.com/northword/zotero-format-metadata/commits/0.0.2
