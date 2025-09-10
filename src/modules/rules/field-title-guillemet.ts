import type { Rule } from "./rule-base";

interface TitleGuillemetOptions {
  target: "single" | "double";
}

/**
 * Replaces `《》` to `〈〉`
 * @see https://github.com/redleafnew/Chinese-STD-GB-T-7714-related-csl/issues/204
 */
export const TitleGuillemet: Rule<TitleGuillemetOptions> = {
  id: "title-guillemet",
  nameKey: "title-guillemet",
  type: "field",
  // targetItemTypes: ["journalArticle", "conferencePaper"],
  targetItemFields: ["title"],
  async apply({ item, options }) {
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
    const target = "single";
    createDialog();

    return { target };
  },
};

function createDialog() {
  const dialog = new ztoolkit.Dialog(1, 1);

  dialog
    .addCell(0, 0, {
      tag: "label",
      properties: { innerHTML: "Select your guillemet:" },
    })
    .addCell(0, 1, {
      tag: "select",
      children: [
        {
          tag: "option",
          attributes: {
            value: "",
          },
          properties: {
            innerHTML: "No symbols",
          },
        },
        {
          tag: "option",
          attributes: {
            value: "single",
          },
          properties: {
            innerHTML: "Single guillemet",
          },
        },
      ],
    });
}
