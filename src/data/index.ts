import contry from "./country-by-capital-city.json";
import iso6393To6391 from "./iso-693-3-to-1";
// import journalAbbr from "./journal-abbr/journal-abbr.json";
import universityPlace from "./university-list/university-place";

export interface dict {
  [key: string]: string;
}

/**
 * 高校所在地数据
 *
 * Key: 高校名称
 * Value: 所在地
 */
export const universityPlaceLocalData: dict = universityPlace;

/**
 * ISO 639-3 code to ISO 639-1 code
 *
 * Key: ISO 639-3 code
 * Value: ISO 639-1 code
 */
export const iso6393To6391Data: dict = iso6393To6391;

export { default as contryJson } from "./country-by-capital-city.json";
export const contries = contry.map(c => c.country);
export const cities = contry.map(c => c.city).filter(v => v !== null);
