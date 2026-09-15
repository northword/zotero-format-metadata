import type { Rule } from "./rule-base";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  CorrectDateFormat,
  CorrectFilingDateFormat,
  CorrectIssueDateFormat,
  CorrectPriorityDateFormat,
  isISOTruncated,
} from "./correct-date-format";

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
  "12 31 1999": { parsed: { order: "dy", year: "1999", day: 12, part: "31" }, iso: "1999" },
  "500 BCE-01-01": { parsed: { order: "yd", year: "500 BCE", day: 1, part: "01" }, iso: "500 BCE" },
  "1 Jan 500 BCE": { parsed: { order: "dmy", year: "500 BCE", month: 0, day: 1 }, iso: "500 BCE-01-01" },
  "2026-01-01 12:00:00": {
    parsed: { order: "ymd", year: "2026", month: 0, day: 1, part: "12:00:00" },
    iso: "2026-01-01",
  },
  "2026/01/01": { parsed: { order: "ymd", year: "2026", month: 0, day: 1 }, iso: "2026-01-01" },
  "January 2026": { parsed: { order: "my", year: "2026", month: 0 }, iso: "2026-01" },
  "Summer 2026": { parsed: { order: "y", year: "2026", part: "Summer" }, iso: "2026" },
  "forthcoming": { parsed: { order: "", part: "forthcoming" }, iso: false },
};

function applyRule(rule: Rule<unknown>, date: string) {
  vi.stubGlobal("Zotero", {
    Date: {
      strToDate: (str: string) => ZOTERO_DATES[str].parsed,
      strToISO: (str: string) => ZOTERO_DATES[str].iso,
    },
  });

  const setField = vi.fn();
  const report = vi.fn();
  const item = { getField: () => date, setField } as unknown as Zotero.Item;

  rule.apply({ item, options: {}, debug: () => {}, report });

  return { setField, report };
}

function applyDateRule(date: string) {
  return applyRule(CorrectDateFormat, date);
}

/**
 * The conversions marked `(control)` are green on both arms by design: they enter
 * `isISOTruncated`, come out `false`, and must still be written. They pin the fix to
 * dates that really lose data, rather than to every conversion.
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

  it("should not overwrite an ambiguous date whose leading parts would be discarded", () => {
    // "12 31 1999" parses as `{ day: 12, part: "31" }` — the parser's reading of
    // which part is the day is not the user's, so neither may be dropped silently.
    const { setField, report } = applyDateRule("12 31 1999");
    expect(setField).not.toHaveBeenCalled();
    expect(report).toHaveBeenCalledWith(
      expect.objectContaining({ level: "warning", message: expect.stringContaining("12 31 1999") }),
    );
  });

  it("should not overwrite an era date whose day would be discarded", () => {
    // "500 BCE-01-01" yields the bare year "500 BCE" while a day was parsed, so the
    // check must hold for years that are not plain numbers too.
    const { setField, report } = applyDateRule("500 BCE-01-01");
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

  it("should convert an era date that keeps every parsed part (control)", () => {
    // "1 Jan 500 BCE" yields "500 BCE-01-01": the era text carries no hyphen, so the
    // separator count still reads as a full date and the conversion must go through.
    const { setField, report } = applyDateRule("1 Jan 500 BCE");
    expect(setField).toHaveBeenCalledWith("date", "500 BCE-01-01");
    expect(report).not.toHaveBeenCalled();
  });

  it("should convert a date carrying a time, which it drops as before (control)", () => {
    // The check compares date parts only, so a dropped time is not truncation here.
    // Pins that a non-empty `part` does not by itself block the conversion.
    const { setField, report } = applyDateRule("2026-01-01 12:00:00");
    expect(setField).toHaveBeenCalledWith("date", "2026-01-01");
    expect(report).not.toHaveBeenCalled();
  });
});

/**
 * All four rules share `updateDateFormatToISO`, so each entry point must refuse a
 * lossy conversion for its own field — the three patent rules included.
 */
describe.each([
  ["correct-date-format", CorrectDateFormat, "date"],
  ["correct-filing-date-format", CorrectFilingDateFormat, "filingDate"],
  ["correct-issue-date-format", CorrectIssueDateFormat, "issueDate"],
  ["correct-priority-date-format", CorrectPriorityDateFormat, "priorityDate"],
] as const)("%s apply", (_id, rule, field) => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it(`should not overwrite a lossy ${field}`, () => {
    const { setField, report } = applyRule(rule, "2026 01 01");
    expect(setField).not.toHaveBeenCalled();
    expect(report).toHaveBeenCalledWith(
      expect.objectContaining({ level: "warning", message: expect.stringContaining("2026 01 01") }),
    );
  });

  it(`should convert a ${field} that survives the conversion intact (control)`, () => {
    // One control per entry point: the added guard did not stop any of them converting.
    const { setField, report } = applyRule(rule, "2026/01/01");
    expect(setField).toHaveBeenCalledWith(field, "2026-01-01");
    expect(report).not.toHaveBeenCalled();
  });
});
