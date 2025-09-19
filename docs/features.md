# Features and Rules

This page outlines the rules supported (or planned) by this plugin. The purpose is to ensure the **existence, correctness, and accuracy** of all items and fields in a Zotero library.

Unlike traditional linting tools, this plugin focuses on **direct fixes**. There is no "warn-only" mode for most rules.

⚠️ Please note: due to technical limitations, the plugin can never fully replace human review. After automatic corrections, you should still carefully check each field for accuracy.

## Item-Level Rules

### No Duplicate Items (`no-item-duplication`)

Warns with a popup when an imported item duplicates an existing one in the library.

### Correct Item Type (`no-article-webpage`, `no-journal-preprint`)

- If an item is imported as `Webpage` but the URL points to a major journal publisher, it is likely that the Zotero Connector was not ready and misclassified the item. A warning popup is shown.
- If the item type is `journalArticle` but the `url` contains `arxiv`, the item is probably a preprint and should be changed to `preprint`.

_Todo:_ Automatically resolve identifiers from URLs and enforce metadata updates.

## Title Rules

### Require Title (`require-title`) _(planned)_

If the title is missing, try to retrieve it via DOI. Otherwise, show an error.

### Require Sentence Case (`require-title-sentence-case`, `require-shortTitle-sentence-case`)

Zotero recommends storing titles in **Sentence case**, which makes it easier for CSL styles to apply “Title Case” transformations [^sentenceCase].

Zotero 7 has built-in sentence casing with exceptions, but this plugin extends it with better handling for chemical formulas, country names, and proper nouns.

[^sentenceCase]: <https://www.zotero.org/support/kb/sentence_casing>

### Rich Text in Titles

Zotero’s bibliography rich text requires raw HTML tags (see [^rich_text_bibliography]), which is not user-friendly. While Zotero has promised visual rich text editing, it has not materialized after years.

This plugin provides a toolbar and shortcuts to insert tags for **superscript, subscript, bold, italics, and nocase** formatting.

[^rich_text_bibliography]: <https://www.zotero.org/support/kb/rich_text_bibliography>

- **Shortcuts**
  - Superscript: `Ctrl` + `Shift` + `+`
  - Subscript: `Ctrl` + `=`
  - Bold: `Ctrl` + `B`
  - Italic: `Ctrl` + `I`
  - Nocase: `Ctrl` + `N`

- **Toolbar**
  A floating toolbar appears when editing the title field. It can be disabled in preferences.

- **Preview**
  A preview of the title rich text is available when editing the title field.

## Author Rules

### Require Authors (`require-creators`) _(planned)_

For `journalArticle`, authors must exist.
If missing, they are retrieved via DOI or title; otherwise, an error is shown.

### Correct Author Case (`correct-creators-case`)

Ensures that author names use **capitalized words**.

### Correct Full Author Names (`correct-creators-full`) _(planned)_

- If initials or abbreviations are found, query full names.
- For Chinese names, hyphenated pinyin (e.g., `Zhang Jian-Bei`) is supported, but an option can remove hyphens.
- For abbreviated names with `.` (e.g., `J.`), attempt to expand to full names.

### Correct Chinese Name Pinyin (`correct-creators-pinyin`)

Converts names such as `Zhang Jianbei` → `Zhang Jian Bei`.

This helps generate correct CSL abbreviations (`Zhang J. B.`).

## Language Rules

### Require Language (`require-language`)

CSL styles rely on the language field for localization (e.g., mixing _et al._ with “等”).
This rule infers language from the title and fills in the `language` field automatically.

By default, only **Simplified Chinese** and **English** are detected. You can disable the restriction or add other [ISO 639-1 codes].

[ISO 639-1 codes]: https://github.com/komodojp/tinyld/blob/develop/docs/langs.md

## Journal Rules

### Correct Journal Title (`correct-publication-title`)

1. Unifies journal names to their official form.

   For example, `Applied Catalysis B-environmental` → `Applied Catalysis B: Environmental`.

2. Converts all-uppercase journal names to **capitalized words**, while keeping special words (e.g., acronyms) uppercase.

## Journal Abbreviation Rules

### Require ISO4 Abbreviation (`require-journal-abbr`)

Uses a built-in dataset (JabRef + Woodward Library) to look up journal abbreviations.

- If missing, infers abbreviation from the [ISSN LTWA list](https://www.issn.org/services/online-services/access-to-the-ltwa/).
- If still missing, defaults to full journal title (can be disabled).

## Thesis Rules

### Require University Place (`require-university-place`)

For `thesis` items, fills in the university’s location automatically (based on built-in data).

This is GB/T 7714-2015 formatting requirements [^gb7714].

[^gb7714]: <http://www.cessp.org.cn/a258.html>

### Correct Thesis Type (`correct-thesis-type`)

Ensures full dissertation type names are set: `硕士学位论文`, `博士学位论文`, `Master thesis`, or `Doctoral dissertation`.

### Correct University Pronunciation (`correct-university-pronunciation`)

Normalizes university names.

For example, in Chinese entries, replaces half-width parentheses `()` with full-width ones `（）`.

## Date Rules

### Correct Date Format (`correct-date-format`)

Ensures ISO format: `YYYY-MM-DD`.

Example: `2023-01-01`.

## Volume, Issue, and Page Rules

### No Leading Zeros (`no-issue-extra-zeros`, `no-pages-extra-zeros`, `no-volume-extra-zeros`)

Removes leading zeros from issue, pages, and volume fields.

Example: `02-10` → `2-10`.

### Correct Page Connector (`correct-pages-connector`)

Replaces invalid connectors like `~` or `+` with `-` or `,`.

## Identifier Rules

### Require DOI (`require-doi`)

For `journalArticle`, DOI must exist.

If missing, attempt to retrieve it.

### No DOI Prefix (`no-doi-prefix`)

Removes URL prefixes like `https://doi.org/` and stores only the DOI string.

### Correct DOI to long form (`correct-doi-long`)

If DOI is short form (e.g. `10/p6kd`), converts it to long form (e.g. `10.1016/j.fuel.2022.126104`).

### Tool: Get Short DOI (`tool-get-short-doi`)

Retrieves short DOI from the DOI, and stores it in the `extra.short-doi` field.

## Metadata Update Tool (`tool-update-metadata`)

Allows filling in missing fields (date, volume, issue, pages, etc.) from identifiers such as DOI or ISBN.

For preprints, updates item type to `journalArticle` when possible.
