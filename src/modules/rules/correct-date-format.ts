import { defineRule } from "./rule-base";

function updateDateFormatToISO(item: Zotero.Item, field: _ZoteroTypes.Item.ItemField) {
  const oldDate = item.getField(field);
  if (!oldDate)
    return;

  const newDate = Zotero.Date.strToISO(oldDate);
  if (!newDate)
    return;

  item.setField(field, newDate);
}

export const CorrectDateFormat = defineRule({
  id: "correct-date-format",
  scope: "field",
  targetItemField: "date",

  apply({ item }) {
    updateDateFormatToISO(item, "date");
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

  apply({ item }) {
    updateDateFormatToISO(item, "filingDate");
  },
});

export const CorrectIssueDateFormat = defineRule({
  id: "correct-issue-date-format",
  scope: "field",
  targetItemField: "issueDate",
  targetItemTypes: ["patent"],

  apply({ item }) {
    updateDateFormatToISO(item, "issueDate");
  },
});

export const CorrectPriorityDateFormat = defineRule({
  id: "correct-priority-date-format",
  scope: "field",
  // @ts-expect-error This field was introduced in Zotero 8, and types have not been updated yet.
  targetItemField: "priorityDate",
  targetItemTypes: ["patent"],

  apply({ item }) {
    // @ts-expect-error This field was introduced in Zotero 8, and types have not been updated yet.
    updateDateFormatToISO(item, "priorityDate");
  },
});
