## General settings
section-general = General Settings
lint-on-item-added = 
    .label = Lint when item added to library 
lint-on-groupItem-added = 
    .label = Lint when item added to group

enable-richtext-toolbar = 
    .label = Enable rich text toolbar
enable-richtext-hotkey = 
    .label = Enable hotkey for rich text
wip = 
    .label = Work in progress...

## 详细设置

## 条目
section-item = Item
item-noDuplication = 
    .label = No duplicate items added
item-checkWebpage = 
    .label = No webpage items linked to academic publishers
item-NoPreprintJournalArticle =
    .label = No journalArticle items have preprint url

## 标题
section-title = Title
title-sentenceCase = 
    .label = Title should be "Sentence case"
title-shortTitle = 
    .label = ShortTitle should also be "Sentence case"
title-custom-term = Custom term: 
    .label = title-custom-term
    .placeholder = The path of custom terms file
title-custom-term-button = 
    .label = Choose
title-custom-term-desc = The custom terms file uses the CSV file format, with the first column being search terms and the second column being replacement terms, no headers are required, and regular expressions are supported for search terms. The delimiter can be a comma or a semicolon, but it must be uniform and not a tab.
 
## 作者
section-creators = Creators
creators-case = 
    .label = Creators should be capitalized
creators-country = 
    .label = No country included in the creators

## 语言
section-language = Language
language-fill = 
    .label = Language should be ISO 639-1 code
language-fill-option-only = 
    .label = Limit common languages to improve recognition accuracy
language-fill-option-only-cmn = 
    .label = Chinese (zh)
language-fill-option-only-eng = 
    .label = English (en)
language-fill-option-only-other = and:
language-fill-option-only-other-desc = Enter a comma-separated list of additional ISO 639-1 language codes.
language-fill-option-only-other-doc = ISO 639-1 code
    .href = https://github.com/northword/zotero-format-metadata#readme

## 期刊名
section-publicationTitle = Publication Title
publicationTitle-case = 
    .label = Publication title should be capitalized

## 期刊缩写
section-abbr = Journal Abbreviation
abbr-iso = 
    .label = Journal abbreviations should be non-empty and in ISO 4 format
abbr-type-label = Types of abbreviations: 
abbr-infer = 
    .label = Automatically infer abbreviations from LTWA when no journal abbreviation is available
abbr-usefull = 
    .label = Use full name instead when journal abbreviation is still not available for English journal
abbr-usefullZh = 
    .label = Use full name instead when journal abbreviation is still not available for Chinese journal
abbr-custom-data-label = Custom abbreviations data file:
choose-custom-abbr-data-button = 
    .label = Choose
choose-custom-abbr-data-input = 
    .placeholder = The path of custom abbreviations data file
abbr-custom-data-desc =  The custom journal abbreviation file supports both JSON and CSV formats. The JSON file is structured as "publicationTitle": "ISO 4 abbreviation". The CSV files have a full publication title in the first column and its abbreviation in the second column, the delimiter can be a comma or a semicolon, but it must be uniform and not a tab.
 
## 日期
section-date = Date
date-iso = 
    .label = Date should be ISO YYYY-MM-DD format

## 期卷页
section-pages = Issue, volume, and pages
pages-remove-zeros = 
    .label = No digits starting with 0
pages-connector = 
    .label = Pages connector should be `-` or `,`

## 标识符
section-identifier = Identifier
doi-noPrefix = 
    .label = No URL prefix for DOI

## 学位论文相关
section-thesis = Thesis
university-type = 
    .label = Thesis type should include the word "dissertation / thesis"
university-brackets = 
    .label = Brackets in university should be in their language
university-place = 
    .label = No empty university place

## 其他
section-others = Others
std-clean-fileld = 
    .label = Clean up the fields that are unreasonably used

# 更新元数据
section-updateMetadata = Retrive Item Metadata
others-semanticScholarToken = Semantic Scholar Token: 
    .label = Semantic Scholar Token
    .placeholder = Semantic Scholar Token
other-semanticScholarToken-desc =  When retrieving field data for preprint, the plugin will query Semantic Scholar to see if this preprint has been accepted for publication. By default, this API is limited to 1 request/s. You can increase the rate limit by requesting a free API Key.
other-semanticScholarToken-link = Request an API key
## 关于
help-version = { $name }, Build { $version }, { $time }
