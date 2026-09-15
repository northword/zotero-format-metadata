import type { ApplyContext } from "./rule-base";
import { defineRule } from "./rule-base";

/**
 * Whether `Zotero.Date.strToISO` dropped date parts that `Zotero.Date.strToDate` did recognize.
 *
 * `strToISO` writes its result left to right and stops at the first part it cannot
 * determine, so a string whose month is unparseable yields a bare year even when a
 * day was found: `"2026 01 01"` parses as `{ year: "2026", day: 1, part: "01" }` and
 * returns `"2026"`. Writing that back would discard what the user entered.
 *
 * @param parsed The parse of the field, as returned by `Zotero.Date.strToDate`.
 * @param iso The ISO string for the same field, as returned by `Zotero.Date.strToISO`.
 */
export function isISOTruncated(parsed: _ZoteroTypes.Utilities_Date.Date, iso: string): boolean {
  // `month` is zero-indexed, so January is `0` — compare against undefined, not truthiness.
  const parsedPrecision = parsed.day !== undefined ? 3 : parsed.month !== undefined ? 2 : 1;
  // "2026" | "2026-01" | "2026-01-01"
  const isoPrecision = iso.split("-").length;
  return isoPrecision < parsedPrecision;
}

function updateDateFormatToISO(
  item: Zotero.Item,
  field: _ZoteroTypes.Item.ItemField,
  report: ApplyContext["report"],
) {
  const oldDate = item.getField(field);
  if (!oldDate)
    return;

  const newDate = Zotero.Date.strToISO(oldDate);
  if (!newDate)
    return;

  if (isISOTruncated(Zotero.Date.strToDate(oldDate), newDate)) {
    report({
      level: "warning",
      message: `Date "${oldDate}" cannot be converted to ISO format without discarding part of it, it has been left unchanged.`,
    });
    return;
  }

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
