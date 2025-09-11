import type { Rule } from "./rule-base";
import { ConferenceAbbr, JornalAbbrShouldCorrect } from "./field-abbr";
import { CreatorsCase } from "./field-creators-case";
import { CreatorsExt } from "./field-creators-ext";
import { CreatorsPinyin } from "./field-creators-pinyin";
import { DataShouldInISOFormat } from "./field-date-iso";
import { NoDOIPrefix } from "./field-doi-no-prefix";
import { LanguageShouldValid } from "./field-language";
import { LanguageManual } from "./field-language-manual";
import { PagesConnectorShouldValid } from "./field-pages";
import { UniversityPlaceShouldValid } from "./field-place";
import { PublicationTitleShouldValid } from "./field-publication";
import { ThesisTypeShouldValid } from "./field-thesisType";
import { TitleGuillemet } from "./field-title-guillemet";
import { NoDotEndTitle } from "./field-title-no-dot-end";
import { TitleShouldSentenceCase } from "./field-title-sentence-case";
import { UniversityShouldValid } from "./field-university";
import { NoDuplicatItem } from "./no-duplicate-item";
import { NoExtraZerosInIssue, NoExtraZerosInPages, NoExtraZerosInVolume } from "./no-extra-zeros";
import { NoPreprintJournalArticle } from "./no-journalArticle-preprint";
import { NoWebPageItem } from "./no-webpage-item";
import { UpdateMetadata } from "./retrive-metadata";

const StandardRules: Rule<any>[] = [
  // Item rules first
  NoDuplicatItem,
  NoWebPageItem,
  NoPreprintJournalArticle,

  // Language
  LanguageShouldValid,

  // Title
  TitleShouldSentenceCase,
  NoDotEndTitle,

  // Creators
  CreatorsCase,
  CreatorsPinyin,

  // Other general fields
  DataShouldInISOFormat,

  // Article specific fields
  PublicationTitleShouldValid,
  JornalAbbrShouldCorrect,
  NoDOIPrefix,
  PagesConnectorShouldValid,
  NoExtraZerosInIssue,
  NoExtraZerosInPages,
  NoExtraZerosInVolume,

  // Conference specific fields
  ConferenceAbbr,

  // Thesis specific fields
  ThesisTypeShouldValid,
  UniversityShouldValid,
  UniversityPlaceShouldValid,
];

const ToolRules: Rule<any>[] = [
  TitleGuillemet,
  CreatorsExt,
  LanguageManual,
  UpdateMetadata,
];

export class Rules {
  private static readonly StandardRules = Object.freeze(StandardRules);
  private static readonly ToolRules = Object.freeze(ToolRules);
  private static readonly rules = Object.freeze([
    ...StandardRules,
    ...ToolRules,
  ]);

  static getAll() {
    return [...this.rules];
  }

  static getStandard() {
    return [...this.StandardRules];
  }

  static getTool() {
    return [...this.ToolRules];
  }

  static getByType(type: "item" | "field") {
    return this.rules.filter(rule => rule.type === type);
  }

  static getByID(id: ID) {
    return this.rules.find(rule => rule.id === id);
  }
}
