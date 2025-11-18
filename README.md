<div align="center">

![Linter for Zotero](./docs/assets/slogan-for-readme.jpg)

[![zotero target version](https://img.shields.io/badge/Zotero-^7_||_^8-green?&logo=zotero&logoColor=CC2936)](https://www.zotero.org)
[![version](https://img.shields.io/github/package-json/v/northword/zotero-format-metadata)](https://github.com/northword/zotero-format-metadata/releases/)
[![download number](https://img.shields.io/github/downloads/northword/zotero-format-metadata/latest/total)](https://github.com/northword/zotero-format-metadata/releases/)
[![license](https://img.shields.io/github/license/northword/zotero-format-metadata)](#licence)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/b851796e53724d7aa7c00923955e0f56)](https://app.codacy.com/gh/northword/zotero-format-metadata/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)
[![Using Zotero Plugin Template](https://img.shields.io/badge/Using-Zotero%20Plugin%20Template-blue?&logo=github)](https://github.com/windingwind/zotero-plugin-template)

This README is also available in: [:cn: 简体中文](./docs/README-zh.md) | [:fr: French](https://docs.zotero-fr.org/kbfr/kbfr_linter)

An addon for [Zotero](https://www.zotero.org/) to format item metadata.

Keep your Zotero library clean and consistent with automatic validation, corrections, and metadata updates.

</div>

## Features

- 🎨 Rich text editing for titles (superscript, subscript, italics, bold, etc.)
- 🔍 Automatic duplicate detection on import
- 🧾 Smarter item type validation with import failure warnings
- ✨ Field optimization: language detection, sentence case titles, journal abbreviations, university locations, normalized dates/DOIs/pages/volumes
- 📥 One-click metadata updates via DOI, ArXiv ID, and more

For more details, see [features](./docs/features.md).

## Install

1. Go to the [release page](https://github.com/northword/zotero-format-metadata/releases/) or [Zotero Chinese](https://zotero-chinese.com/plugins/#search=linter) to download [the latest `.xpi` file](https://github.com/northword/zotero-format-metadata/releases/latest/download/zotero-format-metadata.xpi).
2. Then, in Zotero, click `Tools` -> `Plugin` and drag the `.xpi` onto the Plugins Manager window. See [how to install a Zotero addon](https://zotero-chinese.com/user-guide/plugins/about-plugin.html).

## Todo

See [Project #1](https://github.com/users/northword/projects/1) .

## Contribution

See [CONTRIBUTING.md](./docs/CONTRIBUTING.md).

## Licence

GNU Affero General Public License v3.0

Permissions of this strongest copyleft license are conditioned on making available complete source code of licensed works and modifications, which include larger works using a licensed work, under the same license. Copyright and license notices must be preserved. Contributors provide an express grant of patent rights. When a modified version is used to provide a service over a network, the complete source code of the modified version must be made available.

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fnorthword%2Fzotero-format-metadata.svg?type=large&issueType=license)](https://app.fossa.com/projects/git%2Bgithub.com%2Fnorthword%2Fzotero-format-metadata?ref=badge_large&issueType=license)

## Acknowledgements

We would like to express our sincere gratitude to the following:

- This project is built upon the [Zotero Plugin Template](https://github.com/windingwind/zotero-plugin-template) and makes extensive use of outstanding open-source libraries. For a complete list, please refer to the [dependency graph](https://github.com/northword/zotero-format-metadata/network/dependencies).
- We thank the providers of the following data resources:
  - [ISO 639-3](https://github.com/wooorm/iso-639-3) and its associated [mapping table](https://github.com/amitbend/iso-639-3-to-1/blob/master/6393-6391.json)
  - [JabRef journal abbreviation list](https://github.com/JabRef/abbrv.jabref.org)
  - [List of National Higher Education Institutions](http://www.moe.gov.cn/jyb_xxgk/s5743/s5744/A03/202110/t20211025_574874.html), published by the Ministry of Education of the People’s Republic of China
- We gratefully acknowledge the data support provided by the following API services:
  - [CrossRef API](https://api.crossref.org/): for retrieving DOI metadata and bibliographic metadata
  - [Semantic Scholar API](https://api.semanticscholar.org/): for retrieving bibliographic metadata
  - [shortdoi.org](https://shortdoi.org/): for generating short DOIs
  - [doi.org](https://www.doi.org/): for resolving DOIs
  - [abbreviso](https://github.com/marcocorvi/abbreviso): for inferring journal abbreviations
- We are indebted to the [DOI Manager](https://github.com/bwiernik/zotero-shortdoi) (MPL-2.0 License) for inspiring the implementation of the `require-doi`, `correct-doi-long`, and `tool-get-short-doi` rules.
- Special thanks to @zepinglee for curating the [Zotero Field Specification](https://github.com/l0o0/translators_CN/issues/257).
- We would also like to thank the Zotero French translation team for providing a French user guide for this plugin.
- We also acknowledge the valuable coding assistance provided by ChatGPT and DeepSeek during development.
- Finally, thanks to all project contributors:

[![contributors](https://contrib.rocks/image?repo=northword/zotero-format-metadata)](https://github.com/northword/zotero-format-metadata/graphs/contributors)

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=northword/zotero-format-metadata&type=Date)](https://star-history.com/#northword/zotero-format-metadata&Date)
