import { useDialog } from "../../utils/dialog";
import { defineRule } from "./rule-base";

interface Options {
  fieldsToClean?: string[];
}

export const ToolCleanExtra = defineRule<Options>({
  id: "tool-clean-extra",
  scope: "field",
  targetItemField: "extra",
  async apply({ item, options, debug }) {
    const extras = ztoolkit.ExtraField.getExtraFields(item);

    for (const fieldToClean of options.fieldsToClean ?? []) {
      if (extras.has(fieldToClean)) {
        extras.delete(fieldToClean);
      }
    }
    debug("Cleaned extra fields:", extras);

    await ztoolkit.ExtraField.replaceExtraFields(item, extras);
  },

  async prepare({ items }) {
    const fields = new Set<string>();

    for (const item of items) {
      const extras = ztoolkit.ExtraField.getExtraFields(item);
      for (const [field, _value] of extras) {
        fields.add(field);
      }
    }

    const fieldPrefix = "field--" as const;
    const { dialog, open } = useDialog<{
      [key: `${typeof fieldPrefix}${string}`]: boolean;
    }>();

    dialog
      .addStaticRow("Select Fields to Clean", {
        tag: "label",
      });

    fields.forEach((extra) => {
      dialog.addSetting(`${extra}`, `${fieldPrefix}${CSS.escape(extra)}`, {
        tag: "input",
        attributes: {
          type: "checkbox",
        },
        properties: {
          label: extra,
        },
      }, {
        valueType: "boolean",
      });
    });

    const data = await open("Clean Extra Field");

    if (!data)
      return false;

    const fieldsToClean = Object.entries(data)
      .filter(([key]) => key.startsWith(fieldPrefix))
      .filter(([_key, value]) => value)
      .map(([key]) => key.replace(fieldPrefix, ""));

    return {
      fieldsToClean,
    };
  },
});
