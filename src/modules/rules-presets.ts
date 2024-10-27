import { getPref } from "../utils/prefs";
import * as Rules from "./rules";

export function getStdLintRules() {
  // 作者、期刊、年、期、卷、页 -> 判断语言 -> 作者大小写 -> 匹配缩写 -> 匹配地点 -> 格式化日期 -> 格式化DOI
  const rules = [];
  if (getPref("noDuplicationItems"))
    rules.push(new Rules.NoDuplicatItem({}));
  if (getPref("checkWebpage"))
    rules.push(new Rules.NoWebPageItem({}));
  if (getPref("noPreprintJournalArticle"))
    rules.push(new Rules.NoPreprintJournalArticle({}));
  if (getPref("lang"))
    rules.push(new Rules.UpdateItemLanguage({}));
  if (getPref("creatorsCase"))
    rules.push(new Rules.CapitalizeCreators({}));
  if (getPref("titleSentenceCase"))
    rules.push(new Rules.TitleSentenceCase({}));
  if (getPref("titleDotEnd"))
    rules.push(new Rules.TitleNoDotEnd({}));
  if (getPref("publicationTitleCase"))
    rules.push(new Rules.UpdatePublicationTitle({}));
  if (getPref("abbr"))
    rules.push(new Rules.UpdateAbbr({}));
  if (getPref("universityPlace"))
    rules.push(new Rules.UpdateUniversityPlace({}));
  if (getPref("dateISO"))
    rules.push(new Rules.DateISO({}));
  if (getPref("noDOIPrefix"))
    rules.push(new Rules.RemoveDOIPrefix({}));
  if (getPref("noExtraZeros"))
    rules.push(new Rules.NoExtraZeros({}));
  if (getPref("pagesConnector"))
    rules.push(new Rules.PagesConnector({}));
  if (getPref("thesisType"))
    rules.push(new Rules.ThesisType({}));
  if (getPref("university"))
    rules.push(new Rules.University({}));
  return rules;
}

export function getNewItemLintRules() {
  const rules = [];
  if (getPref("lint.onAdded"))
    rules.push(getStdLintRules());
  return rules.flat();
}
