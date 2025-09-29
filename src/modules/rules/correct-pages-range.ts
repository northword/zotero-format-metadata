import { defineRule } from "./rule-base";

export const CorrectPagesRange = defineRule({
  id: "correct-pages-range",
  scope: "field",
  targetItemTypes: ["journalArticle"],
  targetItemField: "pages",
  async apply({ item, debug }) {
    const pages = item.getField("pages").trim();

    if (!shouldApply(pages)) {
      debug(`Skip process pages ${pages}, it may be alrady a range, or a paper id`);
      return;
    }

    const numberOfPages = await getPDFPages(item);
    if (!numberOfPages) {
      debug(`Can not get number of pages from PDF`);
      return;
    }

    const newPages = generateRange(pages, numberOfPages);
    item.setField("pages", newPages);
  },
});

export function shouldApply(pages: string) {
  if (
    isPagesRange(pages)
    || isNumberLike(pages)
    || pages.length > 3
  ) {
    return false;
  }

  return true;
}

function isPagesRange(pages: string): boolean {
  return pages.includes("-") || pages.includes(",");
}

function isNumberLike(pages: string): boolean {
  return Number.isNaN(Number(pages));
}

async function getPDFPages(item: Zotero.Item): Promise<number | void> {
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

export function generateRange(first: string, total: number): string {
  return `${Number(first)}-${Number(first) + total}`;
}
