// autocorrect-disable -- autocorrect mismark of `《》`
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
    return await createDialog();
  },
});

async function createDialog(): Promise<TitleGuillemetOptions> {
  const dialog = new ztoolkit.Dialog(2, 2);

  dialog
    .addCell(0, 0, {
      tag: "label",
      properties: { innerHTML: "Select your guillemet:" },
    })
    .addCell(0, 1, {
      tag: "select",
      attributes: {
        "data-bind": "target",
      },
      children: [
        {
          tag: "option",
          properties: {
            value: "single",
            innerHTML: "Single 〈〉 to Double 《》",
          },
        },
        {
          tag: "option",
          properties: {
            value: "double",
            innerHTML: "Double 《》 to Single 〈〉",
          },
        },
      ],
    })
    .addButton("OK", "ok")
    .open("Select Guillemet", {
      height: 100,
      width: 400,
      centerscreen: true,
    });

  await dialog.dialogData.unloadLock?.promise;

  if (dialog.dialogData._lastButtonId === "ok") {
    return { target: dialog.dialogData.target };
  }

  return {};
}
