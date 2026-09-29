rule-no-item-duplication =
    .label = Ne dodaj duplirane stavke
rule-no-item-duplication-report-message = Ova stavka je duplikat postojeće.
rule-no-item-duplication-report-action = Idi na spajanje

rule-no-article-webpage =
    .label = Veb-stranice akademskih izdavača ne treba da budu stavke tipa „Veb-stranica“
rule-no-article-webpage-report-message = URL sadrži domen velikog izdavača. Proveri vrstu stavke.

rule-no-journal-preprint =
    .label = Članci u časopisu ne treba da imaju URL predobjave
rule-no-journal-preprint-report-message = URL vodi na server predobjava. Proveri vrstu stavke.

rule-no-value-nullish =
    .label = Bez nevažećih vrednosti u poljima

rule-no-field-misuse =
    .label = Ispravi pogrešnu upotrebu standardnih polja

rule-require-language =
    .label = Jezik treba da bude označen kodom ISO 639-1
rule-require-language-menu-item =
    .label = Automatski prepoznaj jezik stavke
rule-require-language-menu-field =
    .label = Automatski prepoznaj jezik (Linter)
rule-require-language-option-only =
    .label = Ograniči prepoznavanje jezika radi veće tačnosti
rule-require-language-option-only-cmn =
    .label = Kineski (zh)
rule-require-language-option-only-eng =
    .label = Engleski (en)
rule-require-language-option-only-other = i
rule-require-language-option-only-other-desc = Unesi dodatne kodove ISO 639-1, odvojene zarezima.
rule-require-language-option-only-other-doc = Kodovi ISO 639-1
    .href = https://github.com/northword/zotero-format-metadata/blob/main/docs/features.md#require-language-require-language
rule-require-language-option-verify-before =
    .label = Preskoči ako polje jezika već sadrži važeći kod ISO 639-1

rule-require-short-title =
    .label = Potreban je skraćeni naslov

rule-correct-title-sentence-case =
    .label = Naslov treba da bude pisan rečeničnim stilom
rule-correct-title-sentence-case-menu-item =
    .label = Pretvori naslov u rečenični stil
rule-correct-title-sentence-case-menu-field =
    .label = Rečenični stil (Linter)
rule-correct-title-sentence-option-custom-term = Poseban izraz:
    .label = Posebni izrazi
    .placeholder = Putanja do datoteke s posebnim izrazima
rule-correct-title-sentence-option-custom-term-button =
    .label = Izaberi
rule-correct-title-sentence-option-custom-term-desc = Datoteka s posebnim izrazima treba da bude CSV: u prvoj koloni izraz za pretragu, u drugoj zamena, bez zaglavlja. Podržani su regularni izrazi. Razdvajaj zarezom ili tačkom i zarezom, ne tabulatorom.
rule-correct-title-sentence-option-disabled-languages = Isključi automatsku promenu naslova za ove jezike:
    .label = Jezici za koje se naslov ne menja automatski
    .placeholder = zh,ja,ko
rule-correct-title-sentence-option-disabled-languages-doc = Dvoslovni kodovi ISO 639-1
rule-correct-title-sentence-option-disabled-languages-desc = Unesi dvoslovne kodove jezika ISO 639-1, odvojene zarezima.

rule-correct-title-punctuation =
    .label = Ujednači interpunkciju u naslovu
rule-correct-title-punctuation-menu-field =
    .label = Ujednači interpunkciju (Linter)
rule-correct-title-punctuation-quotes =
    .label = Pretvori navodnike u tipografske

rule-correct-creators-punctuation =
    .label = Ujednači interpunkciju u imenima autora i saradnika
rule-correct-creators-punctuation-menu-field =
    .label = Ujednači crtice (Linter)

rule-correct-shortTitle-sentence-case =
    .label = Skraćeni naslov treba da bude pisan rečeničnim stilom
rule-correct-shortTitle-sentence-case-description = Koristi ista podešavanja kao „{ linter-rule-correct-title-sentence-case.label }“

rule-no-title-trailing-dot =
    .label = Naslov ne treba da se završava tačkom

rule-correct-title-chemical-formula =
    .label = Hemijske formule treba da imaju pravilne donje i gornje indekse
rule-correct-title-chemical-formula-menu-item =
    .label = Ispravi donje indekse u hemijskim formulama (eksperimentalno)
rule-correct-title-chemical-formula-menu-field =
    .label = Donji indeksi hemijskih formula (Linter)

rule-require-creators =
    .label = Polje autora i saradnika ne treba da bude prazno

rule-correct-creators-case =
    .label = Imena autora i saradnika treba pravilno pisati velikim slovima
rule-correct-creators-case-menu-item =
    .label = Ispravi velika i mala slova u imenima

rule-correct-creators-pinyin =
    .label = Razdvoji slogove u pinjinu kineskih imena (npr. Zhang Sanfeng → Zhang San Feng)
rule-correct-creators-pinyin-menu-item =
    .label = Razdvoji slogove pinjina u imenima

rule-correct-date-format =
    .label = Datum treba da bude u formatu ISO GGGG-MM-DD
rule-correct-date-format-menu-item =
    .label = Ujednači datum prema ISO formatu
rule-correct-date-format-menu-field =
    .label = ISO format (Linter)
rule-correct-filing-date-format =
    .label = Datum podnošenja treba da bude u formatu ISO GGGG-MM-DD
rule-correct-issue-date-format =
    .label = Datum izdavanja treba da bude u formatu ISO GGGG-MM-DD
rule-correct-priority-date-format =
    .label = Datum prioriteta treba da bude u formatu ISO GGGG-MM-DD

rule-correct-extra-order =
    .label = Dodatna polja treba pravilno poređati
rule-correct-extra-order-menu-item =
    .label = Sredi redosled dodatnih polja
rule-correct-extra-order-menu-field =
    .label = Sredi redosled (Linter)

rule-correct-publication-title-alias =
    .label = Naziv publikacije treba da bude zvaničan
rule-correct-publication-title-alias-menu-item =
    .label = Ispravi alternativni naziv publikacije
rule-correct-publication-title-alias-menu-field =
    .label = Ispravi alternativni naziv (Linter)

rule-correct-publication-title-case =
    .label = Naziv publikacije treba pravilno pisati velikim slovima
rule-correct-publication-title-case-menu-item =
    .label = Ispravi velika i mala slova u nazivu publikacije
rule-correct-publication-title-case-menu-field =
    .label = Ispravi velika i mala slova (Linter)

rule-require-journal-abbr =
    .label = Skraćenica časopisa ne treba da bude prazna i treba da prati ISO 4
rule-require-journal-abbr-menu-item =
    .label = Pronađi skraćenicu časopisa
rule-require-journal-abbr-menu-field =
    .label = Pronađi skraćenicu (Linter)
rule-require-journal-abbr-option-infer =
    .label = Automatski izvedi skraćenicu prema ISO 4 ako nedostaje
rule-require-journal-abbr-option-usefull = Koristi puni naziv ako skraćenica nije dostupna:
rule-require-journal-abbr-option-usefull-en =
    .label = Engleski časopis
rule-require-journal-abbr-option-usefull-zh =
    .label = Kineski časopis
rule-require-journal-abbr-option-custom-data-label = Datoteka s prilagođenim skraćenicama:
rule-require-journal-abbr-option-choose-custom-abbr-data-button =
    .label = Izaberi
rule-require-journal-abbr-option-choose-custom-abbr-data-input =
    .placeholder = Putanja do datoteke sa skraćenicama
rule-require-journal-abbr-option-custom-data-desc =
    Podržani su JSON i CSV.
    JSON: `"publicationTitle": "abbreviation"`.
    CSV: u prvoj koloni puni naziv, u drugoj skraćenica. Razdvajaj zarezom ili tačkom i zarezom, ne tabulatorom.

rule-require-doi =
    .label = DOI ne treba da bude prazan
rule-require-doi-menu-item =
    .label = Pronađi DOI prema naslovu
rule-require-doi-menu-field =
    .label = Pronađi DOI (Linter)

rule-no-doi-prefix =
    .label = DOI ne treba da ima URL prefiks
rule-no-doi-prefix-menu-item =
    .label = Ukloni prefiks DOI-ja
rule-no-doi-prefix-menu-field =
    .label = Ukloni URL prefiks (Linter)

rule-correct-doi-long =
    .label = Koristi puni oblik DOI-ja

rule-correct-pages-connector =
    .label = Razdvajaj stranice znakom `-` ili `,`

rule-correct-pages-range =
    .label = Stranice treba da budu navedene kao opseg

rule-no-issue-extra-zeros =
    .label = Broj izdanja ne treba da počinje nulom

rule-no-pages-extra-zeros =
    .label = Broj stranice ne treba da počinje nulom

rule-no-volume-extra-zeros =
    .label = Broj toma ne treba da počinje nulom

rule-correct-conference-abbr =
    .label = Skraćenica konferencije treba da bude u extra.shortConferenceName
rule-correct-conference-abbr-menu-item =
    .label = Pronađi skraćenicu konferencije
rule-correct-conference-abbr-description = Koristi ista podešavanja kao „{ linter-rule-require-journal-abbr.label }“

rule-correct-thesis-type =
    .label = Vrsta rada treba da sadrži reč „teza“ ili „disertacija“

rule-correct-university-punctuation =
    .label = Zagrade u nazivima univerziteta treba da odgovaraju jeziku

rule-require-university-place =
    .label = Mesto univerziteta ne treba da bude prazno
rule-require-university-place-menu-item =
    .label = Popuni mesto univerziteta
rule-require-university-place-menu-field =
    .label = Pronađi mesto (Linter)

rule-correct-edition-numeral =
    .label = Izdanje treba navesti brojem

rule-correct-volume-numeral =
    .label = Tom treba navesti brojem

rule-correct-bookTitle-sentence-case =
    .label = Naslov knjige treba da bude pisan rečeničnim stilom

rule-correct-proceedingsTitle-sentence-case =
    .label = Naslov zbornika treba da bude pisan rečeničnim stilom

rule-tool-title-guillemet =
    .label = Pretvori znakove 〈〉 i 《》 u naslovu
rule-tool-title-guillemet-menu-item =
    .label = { linter-rule-tool-title-guillemet.label }

rule-tool-creators-ext =
    .label = Primeni proširene podatke o autorima i saradnicima
rule-tool-creators-ext-menu-item =
    .label = { linter-rule-tool-creators-ext.label }

rule-tool-set-language =
    .label = Ručno postavi jezik stavke
rule-tool-set-language-menu-item =
    .label = { linter-rule-tool-set-language.label }

rule-tool-update-metadata =
    .label = Preuzmi metapodatke stavke prema identifikatoru
rule-tool-update-metadata-menu-item =
    .label = Preuzmi metapodatke prema identifikatoru i proveri ih
rule-tool-update-metadata-option-semanticScholarToken = API ključ za Semantic Scholar:
    .label = Token za Semantic Scholar
    .placeholder = Token za Semantic Scholar
rule-tool-update-metadata-option-semanticScholarToken-desc =
    Pri ažuriranju polja dodatak preuzima bibliografske podatke sa servisa Semantic Scholar.
    Korisnici bez prijave dele ograničenje broja zahteva. Besplatan API ključ može da poveća dozvoljeni broj zahteva.
rule-tool-update-metadata-option-semanticScholarToken-link = Zatraži API ključ
rule-tool-update-metadata-option-slient =
    .label = Svaki put koristi podrazumevana podešavanja bez potvrde
rule-tool-update-metadata-dialog-title = Ažuriranje metapodataka stavke
rule-tool-update-metadata-dialog-mode = Način ažuriranja
rule-tool-update-metadata-dialog-mode-all =
    .label = Sva polja
rule-tool-update-metadata-dialog-mode-blank =
    .label = Samo prazna polja
rule-tool-update-metadata-dialog-allow-type-changed =
    .label = Dozvoli promenu vrste stavke
rule-tool-update-metadata-dialog-notes = Napomene
rule-tool-update-metadata-dialog-note-rate-limit = Neki servisi ograničavaju broj zahteva; izbegavaj masovnu obradu.
rule-tool-update-metadata-dialog-note-chinese-limit = Ova funkcija nije dostupna za kineske publikacije zbog ograničenja izvora podataka.

rule-tool-get-short-doi-menu-item =
    .label = Pronađi skraćeni DOI

rule-tool-csl-helper =
    .label = Pomoćnik za polja CSL-M
rule-tool-csl-helper-menu-item =
    .label = { linter-rule-tool-csl-helper.label }
rule-tool-csl-helper-menu-field =
    .label = { linter-rule-tool-csl-helper.label } (Linter)

rule-tool-clean-extra =
    .label = Očisti dodatna polja
rule-tool-clean-extra-menu-item =
    .label = { linter-rule-tool-clean-extra.label }

