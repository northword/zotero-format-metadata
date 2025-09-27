import { defineRule } from "./rule-base";

/** Map of English ordinal words to numbers */
const ORDINAL_WORD_MAP: Record<string, number> = {
  first: 1,
  second: 2,
  third: 3,
  fourth: 4,
  fifth: 5,
  sixth: 6,
  seventh: 7,
  eighth: 8,
  ninth: 9,
  tenth: 10,
  eleventh: 11,
  twelfth: 12,
  thirteenth: 13,
  fourteenth: 14,
  fifteenth: 15,
  sixteenth: 16,
  seventeenth: 17,
  eighteenth: 18,
  nineteenth: 19,
  twentieth: 20,
};

/** Map of Roman numerals to numbers */
const ROMAN_MAP: Record<string, number> = {
  i: 1,
  ii: 2,
  iii: 3,
  iv: 4,
  v: 5,
  vi: 6,
  vii: 7,
  viii: 8,
  ix: 9,
  x: 10,
  xi: 11,
  xii: 12,
  xiii: 13,
  xiv: 14,
  xv: 15,
  xvi: 16,
  xvii: 17,
  xviii: 18,
  xix: 19,
  xx: 20,
};

/** Map of incomplete edition/volume names */
const NAME_MAP: Record<string, string> = {
  修订: "修订版",
  影印: "影印本",
  Revised: "Revised Edition",
  Facsimile: "Facsimile Edition",
};

/** Chinese numerals map */
const CHINESE_NUM_MAP: Record<string, number> = {
  一: 1,
  二: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  七: 7,
  八: 8,
  九: 9,
  十: 10,
  十一: 11,
  十二: 12,
  十三: 13,
  十四: 14,
  十五: 15,
  十六: 16,
  十七: 17,
  十八: 18,
  十九: 19,
  二十: 20,
};

/** Convert English ordinal words to numbers */
function normalizeOrdinalWord(value: string): string {
  return value.replace(/\b([a-z]+)\b/gi, (match) => {
    const num = ORDINAL_WORD_MAP[match.toLowerCase()];
    return num !== undefined ? String(num) : match;
  });
}

/** Convert numeric ordinal suffixes (1st, 2nd, 3rd, 4th) to numbers */
function normalizeOrdinal(value: string): string {
  return value.replace(/\b(\d+)(st|nd|rd|th)\b/gi, (_, num) => num);
}

/** Convert Roman numerals to numbers */
function normalizeRoman(value: string): string {
  return value.replace(/\b([ivxlcdm]+)\b/gi, (match) => {
    const num = ROMAN_MAP[match.toLowerCase()];
    return num !== undefined ? String(num) : match;
  });
}

/** Normalize incomplete Chinese or English names */
function normalizeName(value: string): string {
  const trimmed = value.trim();

  // Exact match for Chinese names
  if (NAME_MAP[trimmed]) {
    return NAME_MAP[trimmed];
  }

  // Case-insensitive exact match for English names
  for (const key of Object.keys(NAME_MAP)) {
    if (/^[A-Z]+$/i.test(key)) {
      if (trimmed.toLowerCase() === key.toLowerCase()) {
        return NAME_MAP[key];
      }
    }
  }

  return trimmed;
}

/** Normalize Chinese ordinals and standalone Chinese numbers */
function normalizeChineseOrdinal(value: string): string {
  let result = value;

  // Convert "第 X 版" / "第 X 册" to numbers
  result = result.replace(/第([一二三四五六七八九十\d]+)[版册]?/g, (_, match) => {
    if (/^\d+$/.test(match))
      return match; // already numeric
    const num = CHINESE_NUM_MAP[match];
    return num !== undefined ? String(num) : match;
  });

  // Convert standalone Chinese numbers
  // Remove \b, since Chinese characters do not respect word boundaries
  result = result.replace(/([一二三四五六七八九十]{1,2})/g, (match) => {
    const num = CHINESE_NUM_MAP[match];
    return num !== undefined ? String(num) : match;
  });

  return result;
}
/** Normalize a field value (edition or volume) */
export function normalizeField(value: string): string {
  let result = value.trim();

  result = normalizeOrdinalWord(result);
  result = normalizeOrdinal(result);
  result = normalizeRoman(result);
  result = normalizeChineseOrdinal(result);

  // Remove trailing "ed." or "edition" for edition field
  result = result.replace(/\s+(ed\.?|edition)$/i, "");

  result = normalizeName(result);

  return result.trim();
}

/** Create a rule for edition or volume normalization */
function createRule(field: "edition" | "volume") {
  const id = `correct-${field}-numeral`;

  return defineRule({
    id,
    scope: "field",
    targetItemTypes: ["book"],
    targetItemField: field,

    async apply({ item, debug }) {
      const value = item.getField(field);
      if (!value)
        return;

      const normalized = normalizeField(value);
      if (normalized !== value) {
        debug(`Normalized ${field}: "${value}" → "${normalized}"`);
        item.setField(field, normalized);
      }
    },
  });
}

export const CorrectEditionNumeral = createRule("edition");
export const CorrectVolumeNumeral = createRule("volume");
