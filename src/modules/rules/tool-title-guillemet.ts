// autocorrect-disable -- autocorrect mismark of `《》`
import { useDialog } from "../../utils/dialog";
import { defineRule } from "./rule-base";

interface TitleGuillemetOptions {
  target?: "single" | "double";
}

/**
 * Replaces `《》` to `〈〉`
 * @see https://github.com/redleafnew/Chinese-STD-GB-T-7714-related-csl/issues/204
 */
export const ToolTitleGuillemet = defineRule<TitleGuillemetOptions> ({
  id: "tool-title-guillemet",
  nameKey: "title-guillemet",
  scope: "field",
  category: "tool",
  // targetItemTypes: ["journalArticle", "conferencePaper"],
  targetItemField: "title",
  async apply({ item, options }) {
    if (!options.target)
      return;

    const title = item.getField("title", false, true);
    let newTitle: string;
    if (options.target === "single") {
      newTitle = title.replace(/《/g, "〈").replace(/》/g, "〉");
    }
    else if (options.target === "double") {
      newTitle = title.replace(/〈/g, "《").replace(/〉/g, "》");
    }
    else {
      newTitle = title;
    }

    item.setField("title", newTitle);
  },

  async getOptions() {
    const { dialog, open } = useDialog<TitleGuillemetOptions>();

    dialog.addSetting("Select your guillemet:", "target", {
      tag: "select",
      children: [
        {
          tag: "option",
          properties: {
            value: "double",
            innerHTML: "Single 〈〉 to Double 《》",
          },
        },
        {
          tag: "option",
          properties: {
            value: "single",
            innerHTML: "Double 《》 to Single 〈〉",
          },
        },
      ],
    });

    const result = await open("Select Guillemet");
    if (result) {
      return { target: result.target };
    }
    else {
      return false;
    }
  },
});
