import { defineRule } from "./rule-base";

export const CorrectPagesConnector = defineRule({
  id: "correct-pages-connector",
  scope: "field",
  targetItemTypes: ["journalArticle"],
  targetItemField: "pages",
  apply({ item }) {
    const pages = item.getField("pages");
    const newPages = normizePages(pages);

    // if (!this.isPagesRange(newPages)) {
    //   const numberOfPages = await this.getPDFPages(item);
    //   if (numberOfPages) {
    //     newPages = `${pages}-${Number(pages) + numberOfPages}`;
    //   }
    // }

    item.setField("pages", newPages);
  },

});

function _isPagesRange(pages: string): boolean {
  return pages.includes("-") || pages.includes(",");
}

function normizePages(pages: string): string {
  return pages.replace(/~/g, "-").replace(/\+/g, ", ");
}

async function _getPDFPages(item: Zotero.Item): Promise<number | void> {
  const attachment = await item.getBestAttachment();
  if (!attachment)
    return;

  if (attachment.attachmentContentType !== "application/pdf")
    return;

  const pages = await Zotero.Fulltext.getPages(attachment.id);
  if (!pages)
    return;

  return pages.total;
}
