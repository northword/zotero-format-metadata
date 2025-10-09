import contryJson from "../../utils/country-by-capital-city.json";
import { useData } from "../../utils/data-loader";
import { getPref } from "../../utils/prefs";
import { convertToRegex, escapeRegex, functionWords } from "../../utils/str";
import { defineRule } from "./rule-base";

/** =============================  Special Words Begin  ============================= */

/* eslint-disable antfu/consistent-list-newline  -- We expect to customize the line breaks of these arrays. */
const chemElements = [
  "H", "He",
  "Li", "Be", "B", "C", "N", "O", "F", "Ne",
  "Na", "Mg", "Al", "Si", "P", "S", "Cl", "Ar",
  "K", "Ca", "Sc", "Ti", "V", "Cr", "Mn", "Fe", "Co", "Ni", "Cu", "Zn", "Ga", "Ge", "As", "Se", "Br", "Kr",
  "Rb", "Sr", "Y", "Zr", "Nb", "Mo", "Tc", "Ru", "Rh", "Pb", "Ag", "Cd", "In", "Sn", "Sb", "Te", "I", "Xe",
  "Cs", "Ba", "La", "Hf", "Ta", "W", "Re", "Os", "Ir", "Pt", "Au", "Hg", "Tl", "Pb", "Bi", "Po", "At", "Rn",
  "Fr", "Ra", "Ac", "Rf", "Db", "Sg", "Bh", "Hs", "Mt", "Ds", "Rg", "Cn", "Nh", "Fl", "Mc", "Lv", "Ts", "Og",
  "La", "Ce", "Pr", "Nd", "Pm", "Sm", "Eu", "Gd", "Tb", "Dy", "Ho", "Er", "Tm", "Yb", "Lu",
  "Ac", "Th", "Pa", "U", "Np", "Pu", "Am", "Cm", "Bk", "Cf", "Es", "Fm", "Md", "No", "Lr",
];

const geographyWords = [
  "Asia", "Europe", "Africa", "North America", "South America",
  "Oceania", "Antarctica", "Pacific Ocean", "Atlantic Ocean", "Indian Ocean", "Arctic Ocean",
  "Mediterranean", "Tibetan Plateau",
  "Yangtze River", "Yangtze", "Beijing–Tianjin–Hebei", "Yellow River", "Huang He",
];

const dateWords = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
  "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December",
];

const plantWords = ["Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"];

const brands = [
  "Apple", "Microsoft", "Google", "Amazon", "Alibaba", "Tencent", "Facebook", "Twitter", "Instagram",
  "YouTube", "Netflix", "Spotify", "Tidal",
  "Inc", "Ltd",
];

const localityWords = [
  "north", "south", "east", "west",
  "northern", "southern", "eastern", "western",
  "southeast", "southwest", "northwest", "northeast",
];

const chinaCapitals = [
  "Beijing", "Tianjin", "Shijiazhuang", "Taiyuan", "Hohhot", "Shenyang",
  "Changchun", "Harbin", "Shanghai", "Nanjing", "Hangzhou", "Hefei",
  "Fuzhou", "Nanchang", "Jinan", "Zhengzhou", "Wuhan", "Changsha",
  "Guangzhou", "Nanning", "Haikou", "Chongqing", "Chengdu", "Guiyang",
  "Kunming", "Lhasa", "Xi’an", "Lanzhou", "Xining", "Yinchuan",
  "Urumqi", "Hong Kong", "Macao",
];

const worldCities = [
  "New York", "Los Angeles", "San Francisco", "Chicago", "Miami", // United States
  "London", // United Kingdom
  "Paris", // France
  "Berlin", "Munich", // Germany
  "Rome", "Milan", // Italy
  "Madrid", "Barcelona", // Spain
  "Amsterdam", // Netherlands
  "Brussels", // Belgium
  "Vienna", // Austria
  "Zurich", // Switzerland
  "Moscow", "Saint Petersburg", // Russia
  "Istanbul", // Turkey
  "Dubai", "Abu Dhabi", // United Arab Emirates
  "Doha", // Qatar
  "Riyadh", // Saudi Arabia
  "Tel Aviv", // Israel
  "Singapore", // Singapore
  "Tokyo", "Osaka", "Kyoto", // Japan
  "Seoul", "Busan", // South Korea
  "Bangkok", // Thailand
  "Jakarta", // Indonesia
  "Kuala Lumpur", // Malaysia
  "Manila", // Philippines
  "Hanoi", "Ho Chi Minh City", // Vietnam
  "Sydney", "Melbourne", // Australia
  "Auckland", // New Zealand
  "Toronto", "Vancouver", "Montreal", // Canada
  "Mexico City", // Mexico
  "São Paulo", "Rio de Janeiro", // Brazil
  "Buenos Aires", // Argentina
  "Lima", // Peru
  "Cape Town", "Johannesburg", // South Africa
];

/* eslint-enable antfu/consistent-list-newline */

const contriesAndCities = [
  ...contryJson.flatMap(c => Object.values(c)).filter(v => v !== null) as string[],
  ...chinaCapitals,
  ...worldCities,
];

const specialWords = [
  ...brands,
  ...geographyWords,
  ...dateWords,
  ...contriesAndCities,
  ...plantWords,
]
  .map(v => escapeRegex(v));

const specialWordsPattern = specialWords.join("|");

/** =============================  Special Words End  ============================= */

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

interface Options {
  data?: any[];
}

function createCorrectTitleSentenceCaseRule(targetItemField: "title" | "shortTitle" | "bookTitle" | "proceedingsTitle") {
  return defineRule<Options>({
    id: `correct-${targetItemField}-sentence-case`,
    scope: "field",
    targetItemField,

    async apply({ item, options, debug }) {
      const lang = item.getField("language");
      let title = item.getField(targetItemField, false, true);
      title = lang.match("zh") ? title : toSentenceCase(title, lang);

      const data = options.data;
      if (data) {
        data.forEach((term) => {
          const search = convertToRegex(term.search);
          if (search.test(title)) {
            title = title.replace(search, term.replace);
            debug(`[title] Hit custom term: `, search);
          }
        });
      }

      item.setField(targetItemField, title);
    },

    async getOptions() {
      const customTermFilePath = getPref("rule.correct-title-sentence-case.custom-term-path");
      if (customTermFilePath) {
        return {
          data: await useData("csv", customTermFilePath, {
            headers: ["search", "replace"],
          }),
        };
      }
      else {
        return {};
      }
    },
  });
}

export const CorrectTitleSentenceCase = createCorrectTitleSentenceCaseRule("title");
export const CorrectShortTitleSentenceCase = createCorrectTitleSentenceCaseRule("shortTitle");
export const CorrectBookTitleSentenceCase = createCorrectTitleSentenceCaseRule("bookTitle");
export const CorrectProceedingsTitleSentenceCase = createCorrectTitleSentenceCaseRule("proceedingsTitle");
