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

</div></br>

## Features

### Shortcut to set subscripts, bold and italic, etc

The rich text content in Zotero's reference list requires manual insertion of HTML tags (See [^rich_text_bibliography]), which is difficult for the common user. Although Zotero's documentation mentions that visual editing of rich text will be supported in future versions, years have passed without any progress on this issue, so this plugin provides a quick way to insert these HTML tags.

[^rich_text_bibliography]: <https://www.zotero.org/support/kb/rich_text_bibliography>

#### Shortcuts

Once the text is selected, press the following shortcut keys to quickly apply the corresponding style:

- Supscript: `Ctrl` + `Shift` + `+`
- Subscript: `Ctrl` + `=`
- Bold: `Ctrl` + `B`
- Italic: `Ctrl` + `I`
- No case: `Ctrl` + `N` (Setting `class="nocase"` to prevent certain special names from being capitalized in CSL title cases mode, #17 )

BTW: These shortcuts are the same as the ones in Microsoft Word.

![Set subscript via shoutcut](./docs/assets/set-sub-via-shoutcut.gif)

#### Toolbar

When editing the "Title" field, a toolbar pops up and can be closed automatically by clicking on the blank space when editing is complete. The toolbar can be closed completely in the preferences.

![Set subscript via toolbar](./docs/assets/set-sub-via-toolbar.gif)

### Duplication check

Check for duplicate items when new items are added.

### Item type check

When adding an item, if its item type is a web page and its URL contains the domain of the major scholarly publisher, prompt the user to ask if they have imported the wrong type of item.

### Convert title from "heading Case" to "Sentence case"

The Zotero's documentation recommends storing titles in "sentence case" format, which will allow CSL to perform a "title case" transformation on them [^sentenceCase]. Zotero 7 has a built-in function to convert titles to "sentence capitalization", and some special case detection is preset, and this plugin expands on that by adding recognition of proper nouns, such as chemical formulas.

Detailed test results are available at [test/toSentenceCase.test.ts](./test/toSentenseCase.test.ts).

[^sentenceCase]: <https://www.zotero.org/support/kb/sentence_casing>

### Look up the journal abbreviation according to the journal full name

The plugin has a built-in dataset of about 96,000 journal abbreviations (from JabRef), and the plugin will first look up the journal abbreviations in the local dataset;

If none are available, the abbreviations are inferred from the [ISSN List of Title Word Abbreviations](https://www.issn.org/services/online-services/access-to-the-ltwa/) (optional);

If still no abbreviations are found, the full name of the journal is substituted (optional).

### Look up the place of the university according to its name

The plugin has a built-in list of universities in mainland China and their locations. For the thesis items, the location is filled in according to the university of the thesis, which is helpful to meet the requirement of GB/T 7714-2015 for the thesis to show the location [^gb7714].

[^gb7714]: Chinese GB/T 7714-2015: <http://www.cessp.org.cn/a258.html>

### Lookup the date, volume, issue, pages, etc according to identifier

Some items in the Zotero library may be added with incomplete information such as issue volume pages because the translator is not available, or the official publication is not in the journal at the time of record, etc. The plugin provides the ability to complete these fields based on the DOI.

For book, ISBN was use. Preprint will be revised to journal article.

### Fill in the language of the item according to its title

The plugin determines the language of an item based on its title and fills in the "Language" field, which is important for CSL to perform bilingual layout of the bibliography (e.g., et al and 等 mixed). [^csl-etal] .

By default, the plugin is restricted to recognize only Simplified Chinese and English. You can turn off the language restriction in the preferences or add [ISO 639-1 codes] for other common languages.

[^csl-etal]: <https://github.com/redleafnew/Chinese-STD-GB-T-7714-related-csl#%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8>

[ISO 639-1 codes]: https://github.com/komodojp/tinyld/blob/develop/docs/langs.md

### Others

- Remove the URL prefix of DOI
- Convert Date to ISO format
- etc...

> [!tip]
> The above functions involving item field processing provide both an option to run them automatically and an item context menu for manual (and batch) triggering by the user.

See [Features (in Chinese)](./docs/features.md).

## Install

1. Go to the [release page](https://github.com/northword/zotero-format-metadata/releases/) to download [the latest `.xpi` file](https://github.com/northword/zotero-format-metadata/releases/latest/download/zotero-format-metadata.xpi).
   - If you are in mainland China or cannot access GitHub easily, please download the plugin from [Zotero Chinese](https://plugins.zotero-chinese.com/).
   - If you are using FireFox, right click on the link of the XPI file and select "Save As...".
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
