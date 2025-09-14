import type { Rule } from "./rule-base";
import { CorrectConferenceAbbr, RequireJournalAbbr } from "./field-abbr";
import { CorrectCreatorsCase } from "./field-creators-case";
import { ToolCreatorsExt } from "./field-creators-ext";
import { CorrectCreatorsPinyin } from "./field-creators-pinyin";
import { CorrectDataFormat } from "./field-date-iso";
import { NoDOIPrefix } from "./field-doi-no-prefix";
import { RequireLanguage } from "./field-language";
import { ToolSetLanguage } from "./field-language-manual";
import { CorrectPagesConnector } from "./field-pages";
import { RequireUniversityPlace } from "./field-place";
import { CorrectPublicationTitle } from "./field-publication";
import { CorrectThesisType } from "./field-thesisType";
import { ToolTitleGuillemet } from "./field-title-guillemet";
import { NoTitleTrailingDot } from "./field-title-no-dot-end";
import { RequireTitleSentenceCase } from "./field-title-sentence-case";
import { CorrectUniversity } from "./field-university";
import { NoItemDuplication } from "./no-duplicate-item";
import { NoIssueExtraZeros, NoPagesExtraZeros, NoVolumeExtraZeros } from "./no-extra-zeros";
import { NoJournalPreprint } from "./no-journalArticle-preprint";
import { NoArticleWebPage } from "./no-webpage-item";
import { ToolUpdateMetadata } from "./retrive-metadata";

const StandardRules: Rule<any>[] = [
  // Item rules first
  NoItemDuplication,
  NoArticleWebPage,
  NoJournalPreprint,

  // Language
  RequireLanguage,

  // Title
  RequireTitleSentenceCase,
  NoTitleTrailingDot,

  // Creators
  CorrectCreatorsCase,
  CorrectCreatorsPinyin,

  // Other general fields
  CorrectDataFormat,

  // Article specific fields
  CorrectPublicationTitle,
  RequireJournalAbbr,
  NoDOIPrefix,
  CorrectPagesConnector,
  NoIssueExtraZeros,
  NoPagesExtraZeros,
  NoVolumeExtraZeros,

  // Conference specific fields
  CorrectConferenceAbbr,

  // Thesis specific fields
  CorrectThesisType,
  CorrectUniversity,
  RequireUniversityPlace,
];

const ToolRules: Rule<any>[] = [
  ToolTitleGuillemet,
  ToolCreatorsExt,
  ToolSetLanguage,
  ToolUpdateMetadata,
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
    return this.rules.filter(rule => rule.scope === type);
  }

  static getByID(id: ID) {
    return this.rules.find(rule => rule.id === id);
  }
}
