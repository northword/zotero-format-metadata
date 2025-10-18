## no-item-duplication
rule-no-item-duplication =
  .label = No duplicate items added
rule-no-item-duplication-report-message = This item is a duplicate of an existing one.
rule-no-item-duplication-report-action = Go to merge


## no-article-webpage
rule-no-article-webpage =
  .label = No WebPage items linked to academic publishers
rule-no-article-webpage-report-message = The URL contains a major publisher domain, please confirm item type!


## no-journal-preprint
rule-no-journal-preprint =
  .label = No JournalArticle items with preprint URLs
rule-no-journal-preprint-report-message = The URL contains a preprint server domain, please confirm item type!


## no-value-nullish
rule-no-value-nullish = 
  .label = No nullish field values


## require-language
rule-require-language =
  .label = Language should be ISO 639-1 code
rule-require-language-menu-item = Auto detect item language
rule-require-language-menu-field = Auto detect (Linter)

rule-require-language-option-only = 
    .label = Limit recognized languages to improve accuracy
rule-require-language-option-only-cmn = 
    .label = Chinese (zh)
rule-require-language-option-only-eng = 
    .label = English (en)
rule-require-language-option-only-other = and
rule-require-language-option-only-other-desc = Enter a comma-separated list of additional ISO 639-1 codes.
rule-require-language-option-only-other-doc = ISO 639-1 codes
    .href = https://github.com/northword/zotero-format-metadata#readme


## require-short-title
rule-require-short-title = 
    .label = Require short title


## correct-title-sentence-case
rule-correct-title-sentence-case =
  .label = Title should be sentence case
rule-correct-title-sentence-case-menu-item = Convert title to sentence case
rule-correct-title-sentence-case-menu-field = Sentence case (Linter)

rule-correct-title-sentence-option-custom-term = Custom term: 
    .label = Custom terms
    .placeholder = Path of custom terms file
rule-correct-title-sentence-option-custom-term-button = 
    .label = Choose
rule-correct-title-sentence-option-custom-term-desc = Custom terms file should be CSV: first column search term, second column replacement, no headers. Regex supported. Separator must be comma or semicolon (no tabs).


## correct-shortTitle-sentence-case
rule-correct-shortTitle-sentence-case =
  .label = ShortTitle should be sentence case
rule-correct-shortTitle-sentence-case-description = Shares config with '{ rule-correct-title-sentence-case.label }'


## no-title-trailing-dot
rule-no-title-trailing-dot =
  .label = No title ending with dot


## correct-title-chemical-formula
rule-correct-title-chemical-formula =
  .label =  Chemical formula should have correct subscripts and superscripts
rule-correct-title-chemical-formula-menu-item = Correct subscript in chemical formula (experimental)
rule-correct-title-chemical-formula-menu-field = Chemical formula subscripts (Linter)


## require-creators
rule-require-creators =
  .label = Creators should be non-empty


## correct-creators-case
rule-correct-creators-case =
  .label = Creators should be capitalized
rule-correct-creators-case-menu-item = Fix case of creators


## correct-creators-pinyin
rule-correct-creators-pinyin =
  .label = Chinese creators' Pinyin should be splitted (i.e. Zhang Sanfeng → Zhang San Feng)
rule-correct-creators-pinyin-menu-item = Split creator Pinyin


## correct-date-format
rule-correct-date-format =
  .label = Date should be ISO YYYY-MM-DD format
rule-correct-date-format-menu-item = Normalize date format to ISO


## correct-publication-title
rule-correct-publication-title =
  .label = Publication title should remove alias and be capitalized
rule-correct-publication-title-menu-item = Fix alias and capitalization of publicationTitle
rule-correct-publication-title-menu-field = Fix alias (Linter)


## require-journal-abbr
rule-require-journal-abbr =
  .label = Journal abbreviations should be non-empty and ISO 4 format
rule-require-journal-abbr-menu-item = Look up journal abbreviations
rule-require-journal-abbr-menu-field = Lookup (Linter)

rule-require-journal-abbr-option-infer = 
    .label = Auto infer abbreviation via ISO 4 if missing
rule-require-journal-abbr-option-usefull = Use full name if abbreviation unavailable:
rule-require-journal-abbr-option-usefull-en = 
    .label = English journal
rule-require-journal-abbr-option-usefull-zh = 
    .label = Chinese journal
rule-require-journal-abbr-option-custom-data-label = Custom abbreviations file:
rule-require-journal-abbr-option-choose-custom-abbr-data-button = 
    .label = Choose
rule-require-journal-abbr-option-choose-custom-abbr-data-input = 
    .placeholder = Path of custom abbreviation file
rule-require-journal-abbr-option-custom-data-desc = 
    Supports JSON or CSV. 
    JSON: `"publicationTitle": "abbreviation"`. 
    CSV: first col = full title, second col = abbreviation. Separator must be comma or semicolon (no tabs).


## require-doi
rule-require-doi =
  .label = DOI should be non-empty
rule-require-doi-menu-item = Retrieve DOI


## no-doi-prefix
rule-no-doi-prefix =
  .label = No URL prefix for DOI
rule-no-doi-prefix-menu-item = Remove DOI prefix
rule-no-doi-prefix-menu-field = Remove URL prefix


## correct-doi-long
rule-correct-doi-long =
  .label = Correct DOI to long format


## correct-pages-connector
rule-correct-pages-connector =
  .label = Pages connector should be `-` or `,`


## correct-pages-range
rule-correct-pages-range =
  .label = Pages should be a range


## no-issue-extra-zeros
rule-no-issue-extra-zeros =
  .label = No issue numbers starting with 0


## no-pages-extra-zeros
rule-no-pages-extra-zeros =
  .label = No page numbers starting with 0


## no-volume-extra-zeros
rule-no-volume-extra-zeros =
  .label = No volume numbers starting with 0


## correct-conference-abbr
rule-correct-conference-abbr =
  .label = Conference abbreviation should be in extra.shortConferenceName
rule-correct-conference-abbr-description = Shares config with '{ rule-require-journal-abbr.label }'


## correct-thesis-type
rule-correct-thesis-type =
  .label = Thesis type should include the word "thesis/dissertation"


## correct-university-punctuation
rule-correct-university-punctuation =
  .label = Brackets in university names should match language style


## require-university-place
rule-require-university-place =
  .label = University place should not be empty
rule-require-university-place-menu-item = Fill university place
rule-require-university-place-menu-field = Lookup (Linter)


## correct-edition-numeral
rule-correct-edition-numeral =
  .label =  Edition should be numeral


## correct-volume-numeral
rule-correct-volume-numeral =
  .label =  Volume should be numeral


## correct-bookTitle-sentence-case
rule-correct-bookTitle-sentence-case =
  .label = Book title should be sentence case


## correct-proceedingsTitle-sentence-case
rule-correct-proceedingsTitle-sentence-case =
  .label = Proceedings title should be sentence case


## tool-title-guillemet
rule-tool-title-guillemet =
  .label = Convert 〈〉 and 《》 in title
rule-tool-title-guillemet-menu-item = { rule-tool-title-guillemet.label  }


## tool-creators-ext
rule-tool-creators-ext =
  .label = Apply creators extended
rule-tool-creators-ext-menu-item = { rule-tool-creators-ext.label  }


## tool-set-language
rule-tool-set-language =
  .label = Manually set item language
rule-tool-set-language-menu-item = { rule-tool-set-language.label }


## tool-update-metadata
rule-tool-update-metadata =
  .label = Retrieve item metadata via identifier
rule-tool-update-metadata-menu-item = Retrieve metadata via identifier and lint

rule-tool-update-metadata-option-confirm-when-itemtype-change = 
    .label = Request confirmation when item type changes
rule-tool-update-metadata-option-semanticScholarToken = Semantic Scholar API Key: 
    .label = Semantic Scholar Token
    .placeholder = Semantic Scholar Token
rule-tool-update-metadata-option-semanticScholarToken-desc = When updating preprint fields, the plugin queries Semantic Scholar to check if it has been published. Default API rate is 1 req/s. Apply for free API Key to increase rate limit.
rule-tool-update-metadata-option-semanticScholarToken-link = Request API key


## tool-get-short-doi
rule-tool-get-short-doi-menu-item = Retrieve short DOI
