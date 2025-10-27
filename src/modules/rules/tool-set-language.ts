import { langName, toISO3 } from "tinyld";
import { useDialog } from "../../utils/dialog";
import { getPref } from "../../utils/prefs";
import { defineRule } from "./rule-base";

interface Options {
  language?: string;
}

export const ToolSetLanguage = defineRule<Options>({
  id: "tool-set-language",
  scope: "field",
  category: "tool",
  targetItemField: "language",
  apply({ item, options }) {
    if (options.language)
      item.setField("language", options.language);
  },

  async prepare() {
    const allowLangs = ["zh", "en"];
    if (getPref("rule.require-language.only")) {
      const otherLang = getPref("rule.require-language.only.other");
      if (otherLang !== "" && otherLang !== undefined) {
        allowLangs.push.apply(otherLang.replace(/ /g, "").split(","));
      }
    }

    const { dialog, open } = useDialog<{ option: string; input: string }>();
    dialog.addSetting("Select a Language:", "option", {
      tag: "select",
      children: allowLangs.map(lang => ({
        tag: "option",
        properties: {
          innerHTML: `${langName(toISO3(lang))} (${lang})`,
          value: lang,
        },
        styles: {
          minWidth: "400px",
          // auto resize to window width
          width: "-moz-available",
        },
      })),
    })
      .addSetting("Or Input a Language:", "input", {
        tag: "input",
      });

    const result = await open("Select Language");

    let language: string;
    if (!result) {
      return false;
    }
    else if (result.input) {
      language = result.input;
    }
    else {
      language = result.option;
    }

    return {
      language,
    };
  },
});
