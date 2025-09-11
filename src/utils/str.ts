import { detect } from "tinyld";
import contryJson from "./country-by-capital-city.json";
import { getPref } from "./prefs";

// prettier-ignore
export const functionWords = ["but", "or", "yet", "so", "for", "and", "nor", "a", "an", "the", "at", "by", "from", "in", "into", "of", "on", "to", "with", "up", "down", "as"];
// prettier-ignore
const chemElements = ["H", "He", "Li", "Be", "B", "C", "N", "O", "F", "Ne", "Na", "Mg", "Al", "Si", "P", "S", "Cl", "Ar", "K", "Ca", "Sc", "Ti", "V", "Cr", "Mn", "Fe", "Co", "Ni", "Cu", "Zn", "Ga", "Ge", "As", "Se", "Br", "Kr", "Rb", "Sr", "Y", "Zr", "Nb", "Mo", "Tc", "Ru", "Rh", "Pb", "Ag", "Cd", "In", "Sn", "Sb", "Te", "I", "Xe", "Cs", "Ba", "La", "Hf", "Ta", "W", "Re", "Os", "Ir", "Pt", "Au", "Hg", "Tl", "Pb", "Bi", "Po", "At", "Rn", "Fr", "Ra", "Ac", "Rf", "Db", "Sg", "Bh", "Hs", "Mt", "Ds", "Rg", "Cn", "Nh", "Fl", "Mc", "Lv", "Ts", "Og", "La", "Ce", "Pr", "Nd", "Pm", "Sm", "Eu", "Gd", "Tb", "Dy", "Ho", "Er", "Tm", "Yb", "Lu", "Ac", "Th", "Pa", "U", "Np", "Pu", "Am", "Cm", "Bk", "Cf", "Es", "Fm", "Md", "No", "Lr"];
// prettier-ignore
const geographyWords = ["Asia", "Europe", "Africa", "North America", "South America", "Oceania", "Antarctica", "Pacific Ocean", "Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Mediterranean", "Tibetan Plateau", "Yangtze River", "Yangtze", "Beijing–Tianjin–Hebei", "Yellow River", "Huang He",
];
// prettier-ignore
const dateWords = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December",
];
const contriesAndCities = contryJson.flatMap(c => Object.values(c)).filter(v => v !== null) as string[];
// prettier-ignore
const plantWords = ["Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"];
const specialWords = ["Microsoft", "Google", "Amazon", "Inc", "Ltd"]
  .concat(geographyWords)
  .concat(dateWords)
  .concat(contriesAndCities)
  .concat(plantWords)
  .map(v => escapeRegex(v));
// const specialWordsPattern = specialWords.map((word) => word.replace(/\s+/g, "\\s+")).join("|");
const specialWordsPattern = specialWords.join("|");
// prettier-ignore
export const localityWords = ["north", "south", "east", "west", "northern", "southern", "eastern", "western", "southeast", "southwest", "northwest", "northeast"];

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
 * To sentence case
 * The code is modified from Zotero.Utilities.sentenceCase.
 * AGPL v3.0 license.
 * @see https://github.com/zotero/utilities/pull/26
 * @see https://github.com/zotero/utilities/pull/27
 */
export function toSentenceCase(text: string, locale: string = "en-US") {
  const preserve = [] as any[]; // northword: add for tsc
  const allcaps = text === text.toLocaleUpperCase(locale);

  // sub-sentence start
  text.replace(/([.?!]\s+)(<[^>]+>)?(\p{Lu})/gu, (match, end, markup, char, i) => {
    markup = markup || "";
    if (!text.substring(0, i + 1).match(/(\p{Lu}\.){2,}$/u)) {
      // prevent "U.S. Taxes" from starting a new sub-sentence
      preserve.push({ start: i + end.length + markup.length, end: i + end.length + markup.length + char.length });
    }
    return match; // northword patch: add for ts lint, 避免类型检查报错
  });

  // protect leading capital
  text.replace(/^(<[^>]+>)?(\p{Lu})/u, (match, markup, char) => {
    markup = markup || "";
    preserve.push({ start: markup.length, end: markup.length + char.length });
    return match; // northword patch: add for ts lint, 避免类型检查报错
  });

  // protect nocase
  text.replace(/<span class="nocase">.*?<\/span>|<nc>.*?<\/nc>/gi, (match, i) => {
    preserve.push({ start: i, end: i + match.length, description: "nocase" });
    return match; // northword patch: add for ts lint, 避免类型检查报错
  });

  // mask html tags with characters so the sentence-casing can deal with them as simple words
  let masked = text.replace(/<[^>]+>/g, (match, i) => {
    preserve.push({ start: i, end: i + match.length, description: "markup" });
    return "\uFFFD".repeat(match.length);
  });

  masked = masked
    .replace(/[;:]\uFFFD*\s+\uFFFD*A\s/g, match => match.toLocaleLowerCase(locale))
    .replace(/[–—]\uFFFD*(?:\s+\uFFFD*)?A\s/g, match => match.toLocaleLowerCase(locale))
    // words, compound words, and acronyms (latter also catches U.S.A.)
    .replace(/([\u{FFFD}\p{L}\p{N}]+([\u{FFFD}\p{L}\p{N}\p{Pc}]*))|(\s(\p{Lu}+\.){2,})?/gu, (word) => {
      if (allcaps)
        return word.toLocaleLowerCase(locale);

      const unmasked = word.replace(/\uFFFD/g, "");

      if (unmasked.length === 1) {
        return unmasked === "A" ? word.toLocaleLowerCase(locale) : word;
      }

      // inner capital somewhere
      if (unmasked.match(/.\p{Lu}/u)) {
        return word;
      }

      // identifiers or allcaps
      if (unmasked.match(/^\p{L}+\p{N}[\p{L}\p{N}]*$/u) || unmasked.match(/^[\p{Lu}\p{N}]+$/u)) {
        return word;
      }

      // northword patch: 支持化学元素识别
      if (chemElements.includes(word)) {
        return word;
      }

      return word.toLocaleLowerCase(locale);
    })

    // northword patch: 支持月、周、国家城市、大洲大洋等专有名词
    .replace(
      new RegExp(
        `\\b(?:${functionWords.join("|")}|${localityWords.join("|")})\\s+(${specialWordsPattern})\\b`,
        "gi",
      ),
      (match, specialWord) => {
        return match.replace(
          specialWord,
          specialWords.find(word => word.toLocaleLowerCase(locale) === specialWord.toLocaleLowerCase(locale)) ?? specialWord,
        );
      },
    );

  for (const { start, end } of preserve) {
    masked = masked.substring(0, start) + text.substring(start, end) + masked.substring(end);
  }

  return masked;
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
function escapeRegex(str: string) {
  if (typeof str === "string") {
    return str.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
  }
  return str;
}

/**
 * 将给定字符串转为 HTML
 */
// function parseHTML(html: string) {
//   // 此方法不可用，Zotero 在应用 innerHTML 时过滤掉了 HTML 标签
//   // const t = document.createElement("template");
//   // t.innerHTML = html;
//   // return t.content;
//   const doc = new DOMParser().parseFromString(html, "text/html");
//   // const doc = ztoolkit.getDOMParser().parseFromString(html, "text/html");
//   // if (isZotero) {
//   //     // Zotero 插件中用：适配 Zotero 6
//   //     doc = ztoolkit.getDOMParser().parseFromString(html, "text/html");
//   // } else {
//   //     // 调试用
//   //     doc = new DOMParser().parseFromString(html, "text/html");
//   // }
//   return doc.body;
// }

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
  if (getPref("lang.only")) {
    if (getPref("lang.only.cmn"))
      options.only.push("zh");
    if (getPref("lang.only.eng"))
      options.only.push("en");
    const otherLang = getPref("lang.only.other") as string;
    if (otherLang !== "" && otherLang !== undefined)
      options.only.push(...otherLang.replace(/ /g, "").split(","));
  }
  ztoolkit.log("[lang] Selected ISO 639-1 code is: ", options.only);

  const langGetByTinyLd = detect(text, options) || null;
  ztoolkit.log(`[lang] Returned from TinyLd: ${langGetByTinyLd}`);
  if (langGetByTinyLd) {
    return langGetByTinyLd;
  }
  else {
    return text.match(/[\u4E00-\u9FA5]/) ? "zh" : "en";
  }
}

export * as StringUtil from "./str";
