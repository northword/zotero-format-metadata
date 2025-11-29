import type { Rule, RuleForRegularItemScopeItem, RuleForRegularScopeField } from "./rule-base";
import { getPref } from "../../utils/prefs";
import { CorrectCreatorsCase } from "./correct-creators-case";
import { CorrectCreatorsPinyin } from "./correct-creators-pinyin";
import { CorrectDateFormat } from "./correct-date-format";
import { CorrectDOILong } from "./correct-doi-long";
import { CorrectEditionNumeral, CorrectVolumeNumeral } from "./correct-edition-numeral";
import { CorrectExtraOrder } from "./correct-extra-order";
import { CorrectPagesConnector } from "./correct-pages-connector";
import { CorrectPagesRange } from "./correct-pages-range";
import { CorrectPublicationTitleAlias } from "./correct-publication-title-alias";
import { CorrectPublicationTitleCase } from "./correct-publication-title-case";
import { CorrectCreatorsPunctuation, CorrectTitlePunctuation } from "./correct-punctuation";
import { CorrectThesisType } from "./correct-thesis-type";
import { CorrectTitleChemicalFormula } from "./correct-title-chemical-formula";
import { CorrectBookTitleSentenceCase, CorrectProceedingsTitleSentenceCase, CorrectShortTitleSentenceCase, CorrectTitleSentenceCase } from "./correct-title-sentence-case";
import { CorrectUniversityPunctuation } from "./correct-university-punctuation";
import { NoArticleWebPage } from "./no-article-webpage";
import { NoDOIPrefix } from "./no-doi-prefix";
import { NoIssueExtraZeros, NoPagesExtraZeros, NoVolumeExtraZeros } from "./no-extra-zeros";
import { NoItemDuplication } from "./no-item-duplication";
import { NoJournalPreprint } from "./no-journal-preprint";
import { NoTitleTrailingDot } from "./no-title-trailing-dot";
import { NoValueNullish } from "./no-value-nullish";
import { CorrectConferenceAbbr, RequireJournalAbbr } from "./require-abbr";
import { RequireCreators } from "./require-creators";
import { RequireDOI } from "./require-doi";
import { RequireLanguage } from "./require-language";
import { RequireShortTitle } from "./require-short-title";
import { RequireUniversityPlace } from "./require-university-place";
import { ToolCleanExtra } from "./tool-clean-extra";
import { ToolCreatorsExt } from "./tool-creators-ext";
import { ToolCSLHelper } from "./tool-csl-extra-helper";
import { ToolGetShortDOI } from "./tool-get-short-doi";
import { ToolSetLanguage } from "./tool-set-language";
import { ToolTitleGuillemet } from "./tool-title-guillemet";
import { ToolUpdateMetadata } from "./tool-update-metadata";

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
  CorrectTitlePunctuation,
  RequireShortTitle,
  CorrectShortTitleSentenceCase,
  CorrectTitleChemicalFormula,

  // Creators
  RequireCreators,
  CorrectCreatorsCase,
  CorrectCreatorsPinyin,
  CorrectCreatorsPunctuation,

  // Other general fields
  CorrectDateFormat,
  CorrectExtraOrder,

  // Identifiers
  RequireDOI,
  NoDOIPrefix,
  CorrectDOILong,

  // Article specific fields
  CorrectPublicationTitleAlias,
  CorrectPublicationTitleCase,
  RequireJournalAbbr,
  CorrectPagesConnector,
  CorrectPagesRange,
  NoIssueExtraZeros,
  NoPagesExtraZeros,
  NoVolumeExtraZeros,

  // Conference specific fields
  CorrectConferenceAbbr,
  CorrectProceedingsTitleSentenceCase,

  // Thesis specific fields
  CorrectThesisType,
  CorrectUniversityPunctuation,
  RequireUniversityPlace,

  // Book
  CorrectEditionNumeral,
  CorrectVolumeNumeral,
  CorrectBookTitleSentenceCase,

  // Tools
  ToolTitleGuillemet,
  ToolCreatorsExt,
  ToolSetLanguage,
  ToolUpdateMetadata,
  ToolGetShortDOI,
  ToolCSLHelper,
  ToolCleanExtra,
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
      .filter(rule => this.isRuleEnabled(rule.id));
  }

  private static isRuleEnabled(id: ID) {
    // For tools, we always disable them,
    // we can use getByID to call them.
    if (id.startsWith("tool-"))
      return false;
    // then, we can narrow the type of rule.id to StandardRuleID.
    return getPref(`rule.${id as StandardRuleID}`);
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

// The tool's settings option is compatibility,
// which suppresses typing error.
type StandardRuleID = Exclude<ID, `tool-${string}`>;
