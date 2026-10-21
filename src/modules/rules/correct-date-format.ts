import type { ApplyContext } from "./rule-base";
import { getString } from "../../utils/locale";
import { defineRule } from "./rule-base";

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/**
 * Zotero's `Zotero.Date.strToISO()` only recognizes `-`, `/` and `.` as date
 * separators. A date whose parts are separated by whitespace (e.g. `2026 01 01`)
 * is parsed as year only, and the month and day are silently dropped.
 *
 * Normalize the separators of big-endian numeric dates (`YYYY MM DD`) so that all
 * parts are kept. Other orders (e.g. `01 02 2026`) are left untouched: which part
 * is the month depends on the user's locale, and guessing could corrupt the date.
 *
 * @see https://github.com/northword/zotero-format-metadata/issues/452
 */
export function normalizeDateSeparators(date: string): string {
  const trimmed = date.trim();
  const match = /^(\d{3,4})[\s\-/.]+(\d{1,2})(?:[\s\-/.]+(\d{1,2}))?$/.exec(trimmed);
  if (!match)
    return trimmed;

  const [, year, month, day] = match;
  const monthNum = Number(month);

  if (monthNum < 1 || monthNum > 12)
    return trimmed;

  if (day !== undefined) {
    const dayNum = Number(day);
    const daysInMonth = monthNum === 2 && isLeapYear(Number(year))
      ? 29
      : DAYS_IN_MONTH[monthNum - 1];
    if (dayNum < 1 || dayNum > daysInMonth)
      return trimmed;
  }

  return day === undefined ? `${year}-${month}` : `${year}-${month}-${day}`;
}

function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function updateDateFormatToISO(
  item: Zotero.Item,
  field: _ZoteroTypes.Item.ItemField,
  report: ApplyContext["report"],
) {
  const oldDate = item.getField(field);
  if (!oldDate)
    return;

  const newDate = Zotero.Date.strToISO(normalizeDateSeparators(oldDate));
  if (!newDate)
    return;

  // Avoid discarding the month or day when Zotero cannot parse the whole date,
  // e.g. `2026 01 01 (Spring)` is parsed as year only.
  const parsedOldDate = Zotero.Date.strToDate(oldDate);
  if (
    !newDate.includes("-")
    && (parsedOldDate.month !== undefined || parsedOldDate.day !== undefined)
  ) {
    report({
      level: "warning",
      message: getString("rule-correct-date-format-report-lost-precision", {
        args: { date: oldDate },
      }),
    });
    return;
  }

  if (newDate !== oldDate)
    item.setField(field, newDate);
}

export const CorrectDateFormat = defineRule({
  id: "correct-date-format",
  scope: "field",
  targetItemField: "date",

  apply({ item, report }) {
    updateDateFormatToISO(item, "date", report);
  },

  fieldMenu: {
    l10nID: "rule-correct-date-format-menu-field",
  },
});

export const CorrectFilingDateFormat = defineRule({
  id: "correct-filing-date-format",
  scope: "field",
  targetItemField: "filingDate",
  targetItemTypes: ["patent"],

  apply({ item, report }) {
    updateDateFormatToISO(item, "filingDate", report);
  },
});

export const CorrectIssueDateFormat = defineRule({
  id: "correct-issue-date-format",
  scope: "field",
  targetItemField: "issueDate",
  targetItemTypes: ["patent"],

  apply({ item, report }) {
    updateDateFormatToISO(item, "issueDate", report);
  },
});

export const CorrectPriorityDateFormat = defineRule({
  id: "correct-priority-date-format",
  scope: "field",
  // @ts-expect-error This field was introduced in Zotero 8, and types have not been updated yet.
  targetItemField: "priorityDate",
  targetItemTypes: ["patent"],

  apply({ item, report }) {
    // @ts-expect-error This field was introduced in Zotero 8, and types have not been updated yet.
    updateDateFormatToISO(item, "priorityDate", report);
  },
});
