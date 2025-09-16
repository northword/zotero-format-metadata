<div align="center">

![Linter for Zotero](./docs/assets/slogan-for-readme.jpg)

[![zotero target version](https://img.shields.io/badge/Zotero-7.*-green?&logo=zotero&logoColor=CC2936)](https://www.zotero.org)
[![version](https://img.shields.io/github/package-json/v/northword/zotero-format-metadata)](https://github.com/northword/zotero-format-metadata/releases/)
[![download number](https://img.shields.io/github/downloads/northword/zotero-format-metadata/latest/total)](https://github.com/northword/zotero-format-metadata/releases/)
[![license](https://img.shields.io/github/license/northword/zotero-format-metadata)](#licence)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/b851796e53724d7aa7c00923955e0f56)](https://app.codacy.com/gh/northword/zotero-format-metadata/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)
[![Using Zotero Plugin Template](https://img.shields.io/badge/Using-Zotero%20Plugin%20Template-blue?&logo=github)](https://github.com/windingwind/zotero-plugin-template)

This README is also available in: [:cn: 简体中文](./docs/README-zh.md) | :gb: English

An addon for [Zotero](https://www.zotero.org/) to format item metadata.

Keep your Zotero library clean and consistent with automatic validation, corrections, and metadata updates.

</div></br>

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

[![Using Zotero Plugin Template](https://img.shields.io/badge/Using-Zotero%20Plugin%20Template-blue?style=flat-square&logo=github)](https://github.com/windingwind/zotero-plugin-template)

The following data sets were used:

- [ISO 639-3](https://github.com/wooorm/iso-639-3)
  - [Map of ISO 639-3 to ISO 639-1](https://github.com/amitbend/iso-639-3-to-1/blob/master/6393-6391.json)
- [JabRef/abbr.jabref.org](https://github.com/JabRef/abbrv.jabref.org)
- [中华人民共和国教育部：全国高等学校名单](http://www.moe.gov.cn/jyb_xxgk/s5743/s5744/A03/202110/t20211025_574874.html)
