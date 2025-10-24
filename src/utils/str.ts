import { detect } from "tinyld";
import { logger } from "./logger";
import { getPref } from "./prefs";

// prettier-ignore
export const functionWords = ["but", "or", "yet", "so", "for", "and", "nor", "a", "an", "the", "at", "by", "from", "in", "into", "of", "on", "to", "with", "up", "down", "as"];

/**
 * 统计给定字符串中大写字母的数量
 */
export function countUpperCaseLetter(text: string) {
  const regexpVowels = /[A-Z]/g;
  return text.match(regexpVowels)?.length ?? 0;
}

export function countLowerCaseLetter(text: string) {
  const regexpVowels = /[a-z]/g;
  return text.match(regexpVowels)?.length ?? 0;
}

export function isFullUpperCase(text: string) {
  return text === text.toUpperCase();
}

export function isFullLowerCase(text: string) {
  return text === text.toLowerCase();
}

/**
 * 判断给定字符串是否包含给定数组中的字符串
 */
export function isStringMatchStringInArray(string: string, array: string[]) {
  const pattern = new RegExp(`(${array.join("|")})`);
  return pattern.test(string);
}

export function removeDot(text: string) {
  return text.replace(/\./g, "");
}

export function removeHtmlTag(str: string) {
  return str.replace(/<[^>]+>/g, "");
}

/**
 * 统一 Key
 * 用于期刊缩写数据中，期刊全称消岐
 * @param key
 * @returns key
 */
export function normalizeKey(key: string): string {
  return key
    .toLowerCase()
    .trim()
    .replace(/the |[&\-:, ()]|and/g, "");
}

export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * 将字符串转换为正则表达式
 * @author GPT
 * @param str
 * @returns RegExp
 */
export function convertToRegex(str: string) {
  // 匹配正则表达式和标志
  const regexPattern = str.match(/^\/(.*?)\/([gimy]*)$/);

  if (regexPattern) {
    const pattern = regexPattern[1];
    const flags = regexPattern[2];
    return new RegExp(pattern, flags);
  }
  else {
    return new RegExp(escapeRegex(str));
  }
}

/**
 * Escape string to make it safe for use in a regex
 *
 * @see https://github.com/adamreisnz/replace-in-file/blob/e90c51fdb2e5104ffcd3bd889cdbf820c7865ef5/lib/helpers/make-replacements.js#L15C1-L23C2
 */
export function escapeRegex(str: string) {
  if (typeof str === "string") {
    return str.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
  }
  return str;
}

export function parseXML(xml: string) {
  const doc = new DOMParser().parseFromString(xml, "text/xml");
  return doc.body;
}

/**
 * Gets text language
 * @param text
 * @returns  ISO 639-1 code
 */
export function getTextLanguage(text: string) {
  // 替换 title 中的 HTML 标签以降低 franc 识别错误
  text = removeHtmlTag(text);

  const options = {
    only: [] as string[],
    // minLength: 10,
  };

  // 文本是否少于 10 字符
  // if (text.length < 10) {
  //     options.minLength = 2;
  //     // 对于短字符串内容，如果不全为英文，则替换掉英文字母以提高识别准确度
  //     const textReplaceEN = text.replace(/[a-z]*[A-Z]*/g, "");
  //     if (textReplaceEN.length > 1) {
  //         text = textReplaceEN;
  //     }
  // }

  // 限制常用语言
  if (getPref("rule.require-language.only")) {
    if (getPref("rule.require-language.only.cmn"))
      options.only.push("zh");
    if (getPref("rule.require-language.only.eng"))
      options.only.push("en");
    const otherLang = getPref("rule.require-language.only.other") as string;
    if (otherLang !== "" && otherLang !== undefined)
      options.only.push(...otherLang.replace(/ /g, "").split(","));
  }
  logger.debug("[getTextLanguage] Selected ISO 639-1 code is: ", options.only);

  const langGetByTinyLd = detect(text, options) || null;
  logger.debug(`[getTextLanguage] Returned from TinyLd: ${langGetByTinyLd}`);
  if (langGetByTinyLd) {
    return langGetByTinyLd;
  }
  else {
    return text.match(/[\u4E00-\u9FA5]/) ? "zh" : "en";
  }
}

export * as StringUtil from "./str";
