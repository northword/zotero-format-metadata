/**
 * AbbrevIso v1.2 JS lib for publication title abbreviation per ISO-4 standard.
 * Copyright (C) 2023 by Marcin Wrochna. MIT License, see file: LICENSE.
 * @fileoverview Utils for handling different ways of writing equivalent
 * characters.
 */

/**
 * A replacement for the /\b/ regex, which wrongly matches foreign characters;
 * Do not add global matching //g, since this RegExp object is used and reused!
 * Instead, use new RegExp(boundariesRegex, "g").
 * Avoid using \W and \w, they match a nonsense range.
 * @type {RegExp}
 */
export const boundariesRegex = /[-\s\u2013\u2014_.,:;!|=+*\\/"()&#%@$?]/;
/**
 * A regex for matching line breaks, as per Unicode standards:
 * {@link http://www.unicode.org/reports/tr18/#Line_Boundaries}.
 * @type {RegExp}
 */
export const newlineRegex = /\r\n|[\n\v\f\r\x85\u2028\u2029]/;

/**
 * Remove diacritics and try to replace foreign letters with `[a-zA-Z].
 * After this function, LTWA patterns only match `[a-zA-Z\ \-.'(),]*`,
 * but this is not always true for strings outside the LTWA.
 * @param {string} s
 * @return {string}
 */
export function normalize(s) {
  return s
      .replace(/\u00DF/g, 'ss').replace(/\u1E9E/g, 'SS') // scharfes S
      .replace(/\u0111/g, 'd').replace(/\u0110/g, 'D') // crossed D
      .replace(/\u00F0/g, 'd').replace(/\u00D0/g, 'D') // eth
      .replace(/\u00FE/g, 'th').replace(/\u00DE/g, 'TH') // thorn
      .replace(/\u0127/g, 'h').replace(/\u0126/g, 'H') // H-bar
      .replace(/\u0142/g, 'l').replace(/\u0141/g, 'L') // L with stroke
      .replace(/\u0153/g, 'oe').replace(/\u0152/g, 'Oe') // oe ligature
      .replace(/\u00E6/g, 'ae').replace(/\u00C6/g, 'Ae') // ae ligature
      .replace(/\u0131/g, 'i') // dotless i
      .replace(/\u00F8/g, 'o').replace(/\u00D8/g, 'O') // o with stroke
  // Catalan middle dot, double prime (weirdly used for slavic langs),
  // unicode replacement character (for some mis-utf'd Turkish).
      .replace(/[\u00B7\u02BA\uFFFD]/g, '')
  // Most diacritics are handled by this standard unicode normalization:
  // it decomposes characters into simpler characters plus modifiers,
  // and throws out the modifiers.
      .normalize('NFKD').replace(/[\u0300-\u036f]/gu, '');
}

/**
 * Normalize more promiscuously, always returning a string in `[a-z\ ]*`.
 * It is used only for bucketing patterns in prefix trees, not for actual
 * matching, so it may merge many strings just in case (e.g. remove all 'h').
 * @param {string} s
 * @return {string}
 */
export function promiscuouslyNormalize(s) {
  return normalize(s)
      .toLowerCase()
      .replace(new RegExp(boundariesRegex, 'g'), ' ')
      .replace(/\s+/gu, ' ').replace(/^\s/gu, '').replace(/\s$/gu, '')
      .replace(/[^a-z\ ]/g, ' ')
      .replace(/kh/g, '').replace(/h/g, '');
}

/**
 * Returns whether the two strings represent the same character.
 * Some characters may be equivalent to the empty string, e.g. the 'flown dot'.
 * Others (like ligatures 'ae') can be equivalent to a string of two characters.
 * @param {string} s
 * @param {string} t
 * @return {boolean}
 */
export function cEquiv(s, t) {
  // TODO perhaps we could use instead the following more standard collator?
  //    c = new Intl.Collator('en-u', {usage:'search', sensitivity:'base'});
  //    return c.compare(s,t);
  if (typeof s !== 'string' || typeof t !== 'string') {
    throw new Error('cEquiv expects two strings, got: ' + s + ' and ' + t);
  }
  if (s === t) return true; // Fast path.
  return (normalize(s).toLowerCase() == normalize(t).toLowerCase());
}

/**
 * Attempts to match `t` to a prefix of `s`.
 * E.g., for `s='dæl·lete'`, `t='daell'` the output should be
 * `[['d','æ','l','·','l'] , ['d','ae','l','','l']]`.
 * @param {string} s
 * @param {string} t
 * @return {Array<Array<string>>} Pair of equal-length Arrays of consecutive
 *  characters in `s` and `t` that were found to be equivalent.
 */
export function getCollatingMatch(s, t) {
  const ss = Array.from(s);
  const tt = Array.from(t);
  let i = 0;
  let j = 0;
  const result = [[], []];

  while (j < tt.length) {
    if (i >= ss.length) {
      if (cEquiv('', tt[j])) {
        result[0].push('');
        result[1].push(tt[j]);
        j++;
      } else {
        return false; // `ss` is too short to match `tt`.
      }
    } else if (i + 1 < ss.length && j + 1 < tt.length
               && cEquiv(ss[i]+ss[i+1], tt[j]+tt[j+1])) {
      result[0].push(ss[i]);
      result[1].push(tt[j]);
      i++;
      j++;
    } else if (j + 1 < tt.length
               && cEquiv(ss[i], tt[j]+tt[j+1]) && !cEquiv(tt[j+1], '')) {
      if (cEquiv('', tt[j])) {
        result[0].push('');
        result[1].push(tt[j]);
        j++;
      } else {
        result[0].push(ss[i]);
        result[1].push(tt[j]+tt[j+1]);
        i++;
        j += 2;
      }
    } else if (i + 1 < ss.length
               && cEquiv(ss[i] + ss[i+1], tt[j]) && !cEquiv(ss[i+1], '')) {
      if (cEquiv(ss[i], '')) {
        result[0].push(ss[i]);
        result[1].push('');
        i++;
      } else {
        result[0].push(ss[i]+ss[i+1]);
        result[1].push(tt[j]);
        i += 2;
        j++;
      }
    } else if (cEquiv(ss[i], tt[j])) {
      result[0].push(ss[i]);
      result[1].push(tt[j]);
      i++;
      j++;
    } else if (cEquiv(ss[i], '')) {
      result[0].push(ss[i]);
      result[1].push('');
      i++;
    } else {
      return false; // Characters don't match.
    }
  }
  if (result[0].length !== result[1].length) {
    throw new Error('getCollatingMatch: result arrays have different lengths: ' +
                    result[0].length + ' and ' + result[1].length);
  }
  for (i = 0; i < result[1].length; i++) {
   if (typeof result[0][i] !== 'string' ||
       typeof result[1][i] !== 'string') {
      throw new Error('getCollatingMatch: expected strings, got: ' +
                      result[0][i] + ' and ' + result[1][i]);
    }
  }
  return result;
}

/**
 * Print all consecutive unicode code points of a string.
 * @param {string} s
 * @return {Array<string>}
 */
export function debugUTF(s) {
  const result = [];
  for (let i = 0; i < s.length; i++)
    result.push(s.codePointAt(i).toString(16));
  return result;
}
