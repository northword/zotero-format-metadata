import { afterEach, describe, expect, it, vi } from "vitest";
import { CorrectDateFormat, isISOTruncated } from "./correct-date-format";

describe("isISOTruncated", () => {
  it("should detect a day dropped by a bare-year conversion", () => {
    // "2026 01 01", "2026 1 1", "01 01 2026"
    expect(isISOTruncated({ order: "yd", year: "2026", day: 1, part: "01" }, "2026")).toBe(true);
    expect(isISOTruncated({ order: "dy", year: "1999", day: 12, part: "31" }, "1999")).toBe(true);
  });

  it("should detect a day dropped from a year-month conversion", () => {
    // "0 January 2026" — day is 0, which is falsy but was parsed
    expect(isISOTruncated({ order: "dmy", year: "2026", month: 0, day: 0 }, "2026-01")).toBe(true);
  });

  it("should not flag a conversion that keeps every parsed part", () => {
    // "2026-01-01", "2026/01/01", "1 January 2026"
    expect(isISOTruncated({ order: "ymd", year: "2026", month: 0, day: 1 }, "2026-01-01")).toBe(false);
    // "2026-01", "January 2026" — January is month 0, which is falsy but present
    expect(isISOTruncated({ order: "ym", year: "2026", month: 0 }, "2026-01")).toBe(false);
    // "2026", "Summer 2026" — no month or day was ever parsed
    expect(isISOTruncated({ order: "y", year: "2026" }, "2026")).toBe(false);
    expect(isISOTruncated({ order: "y", year: "2026", part: "Summer" }, "2026")).toBe(false);
  });

  it("should not flag a year the parser reported with an era", () => {
    // "100 B.C." — lpad leaves the era in place, and no month or day was parsed
    expect(isISOTruncated({ order: "y", year: "100 B.C" }, "100 B.C")).toBe(false);
  });
});

/**
 * The parses below are what Zotero's own `Zotero.Date` returns for these strings
 * (zotero/utilities date.js, `strToDate` / `strToISO`), so the rule is driven over
 * the same values it sees in Zotero.
 */
const ZOTERO_DATES: Record<string, { parsed: _ZoteroTypes.Utilities_Date.Date; iso: string | false }> = {
  "2026 01 01": { parsed: { order: "yd", year: "2026", day: 1, part: "01" }, iso: "2026" },
  "01 01 2026": { parsed: { order: "dy", year: "2026", day: 1, part: "01" }, iso: "2026" },
  "2026/01/01": { parsed: { order: "ymd", year: "2026", month: 0, day: 1 }, iso: "2026-01-01" },
  "January 2026": { parsed: { order: "my", year: "2026", month: 0 }, iso: "2026-01" },
  "Summer 2026": { parsed: { order: "y", year: "2026", part: "Summer" }, iso: "2026" },
  "forthcoming": { parsed: { order: "", part: "forthcoming" }, iso: false },
};

function applyDateRule(date: string) {
  vi.stubGlobal("Zotero", {
    Date: {
      strToDate: (str: string) => ZOTERO_DATES[str].parsed,
      strToISO: (str: string) => ZOTERO_DATES[str].iso,
    },
  });

  const setField = vi.fn();
  const report = vi.fn();
  const item = { getField: () => date, setField } as unknown as Zotero.Item;

  CorrectDateFormat.apply({ item, options: {}, debug: () => {}, report });

  return { setField, report };
}

/**
 * The three conversions marked `(control)` are green on both arms by design: they
 * enter `isISOTruncated`, come out `false`, and must still be written. They pin the
 * fix to dates that really lose data, rather than to every conversion.
 */
describe("correct-date-format", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should not overwrite a date whose day would be discarded", () => {
    // https://github.com/northword/zotero-format-metadata/issues/452
    const { setField, report } = applyDateRule("2026 01 01");
    expect(setField).not.toHaveBeenCalled();
    expect(report).toHaveBeenCalledWith(
      expect.objectContaining({ level: "warning", message: expect.stringContaining("2026 01 01") }),
    );
  });

  it("should not overwrite a little-endian date whose day would be discarded", () => {
    const { setField, report } = applyDateRule("01 01 2026");
    expect(setField).not.toHaveBeenCalled();
    expect(report).toHaveBeenCalledTimes(1);
  });

  it("should convert a date that survives the conversion intact (control)", () => {
    const { setField, report } = applyDateRule("2026/01/01");
    expect(setField).toHaveBeenCalledWith("date", "2026-01-01");
    expect(report).not.toHaveBeenCalled();
  });

  it("should convert a date that has no day to begin with (control)", () => {
    const { setField, report } = applyDateRule("January 2026");
    expect(setField).toHaveBeenCalledWith("date", "2026-01");
    expect(report).not.toHaveBeenCalled();
  });

  it("should convert a season to the year the parser found (control)", () => {
    const { setField, report } = applyDateRule("Summer 2026");
    expect(setField).toHaveBeenCalledWith("date", "2026");
    expect(report).not.toHaveBeenCalled();
  });

  it("should leave an unparseable date alone (control)", () => {
    // Guards the early return on a falsy `strToISO`: unchanged by this fix,
    // so it must stay silent rather than warn.
    const { setField, report } = applyDateRule("forthcoming");
    expect(setField).not.toHaveBeenCalled();
    expect(report).not.toHaveBeenCalled();
  });
});
