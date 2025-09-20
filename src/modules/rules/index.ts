import type { Rule, RuleForRegularItemScopeItem, RuleForRegularScopeField } from "./rule-base";
import { getPref } from "../../utils/prefs";
import { CorrectCreatorsCase } from "./correct-creators-case";
import { CorrectCreatorsPinyin } from "./correct-creators-pinyin";
import { CorrectDateFormat } from "./correct-date-format";
import { CorrectDOILong } from "./correct-doi-long";
import { CorrectEditionNumeral, CorrectVolumeNumeral } from "./correct-edition-numeral";
import { CorrectPagesConnector } from "./correct-pages-connector";
import { CorrectPublicationTitle } from "./correct-publication-title";
import { CorrectThesisType } from "./correct-thesis-type";
import { CorrectShortTitleSentenceCase, CorrectTitleSentenceCase } from "./correct-title-sentence-case";
import { CorrectUniversityPunctuation } from "./correct-university-punctuation";
import { NoArticleWebPage } from "./no-article-webpage";
import { NoDOIPrefix } from "./no-doi-prefix";
import { NoIssueExtraZeros, NoPagesExtraZeros, NoVolumeExtraZeros } from "./no-extra-zeros";
import { NoItemDuplication } from "./no-item-duplication";
import { NoJournalPreprint } from "./no-journal-preprint";
import { NoTitleTrailingDot } from "./no-title-trailing-dot";
import { NoValueNullish } from "./no-value-nullish";
import { CorrectConferenceAbbr, RequireJournalAbbr } from "./require-abbr";
import { RequireDOI } from "./require-doi";
import { RequireLanguage } from "./require-language";
import { RequireShortTitle } from "./require-short-title";
import { RequireUniversityPlace } from "./require-university-place";
import { ToolCreatorsExt } from "./tool-creators-ext";
import { ToolGetShortDOI } from "./tool-get-short-doi";
import { ToolUpdateMetadata } from "./tool-retrive-metadata";
import { ToolSetLanguage } from "./tool-set-language";
import { ToolTitleGuillemet } from "./tool-title-guillemet";

const register: Rule<any>[] = [
  // Item rules first
  NoItemDuplication,
  NoArticleWebPage,
  NoJournalPreprint,
  NoValueNullish,

  // Language
  RequireLanguage,

  // Title
  NoTitleTrailingDot,
  CorrectTitleSentenceCase,
  RequireShortTitle,
  CorrectShortTitleSentenceCase,

  // Creators
  CorrectCreatorsCase,
  CorrectCreatorsPinyin,

  // Other general fields
  CorrectDateFormat,

  // Identifiers
  RequireDOI,
  NoDOIPrefix,
  CorrectDOILong,

  // Article specific fields
  CorrectPublicationTitle,
  RequireJournalAbbr,
  CorrectPagesConnector,
  NoIssueExtraZeros,
  NoPagesExtraZeros,
  NoVolumeExtraZeros,

  // Conference specific fields
  CorrectConferenceAbbr,

  // Thesis specific fields
  CorrectThesisType,
  CorrectUniversityPunctuation,
  RequireUniversityPlace,

  // Book
  CorrectEditionNumeral,
  CorrectVolumeNumeral,

  // Tools
  ToolTitleGuillemet,
  ToolCreatorsExt,
  ToolSetLanguage,
  ToolUpdateMetadata,
  ToolGetShortDOI,
];

export class Rules {
  private static readonly register = Object.freeze(register);

  static getAll() {
    return [...this.register];
  }

  static getStandard() {
    return this.getAll().filter(rule => rule.category !== "tool");
  }

  static getEnabledStandard() {
    return this.getStandard()
      .filter(rule => getPref(`rule.${rule.id}`));
  }

  static getTool() {
    return this.getAll().filter(rule => rule.category === "tool");
  }

  static getByType(scope: "item"): RuleForRegularItemScopeItem[];
  static getByType(scope: "field"): RuleForRegularScopeField[];
  static getByType(type: Rule["scope"]) {
    return this.getStandard().filter(rule => rule.scope === type);
  }

  static getByID(id: ID) {
    return this.getAll().find(rule => rule.id === id);
  }
}
