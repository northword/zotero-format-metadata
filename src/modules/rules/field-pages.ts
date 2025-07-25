import type { RuleBaseOptions } from "./rule-base";
import { RuleBase } from "./rule-base";

class PagesConnectorOptions implements RuleBaseOptions {}

export class PagesConnector extends RuleBase<RuleBaseOptions> {
  constructor(options: PagesConnectorOptions) {
    super(options);
  }

  async apply(item: Zotero.Item): Promise<Zotero.Item> {
    if (item.itemType !== "journalArticle")
      return item;

    const pages = item.getField("pages");
    const newPages = this.normizePages(pages);

    // if (!this.isPagesRange(newPages)) {
    //   const numberOfPages = await this.getPDFPages(item);
    //   if (numberOfPages) {
    //     newPages = `${pages}-${Number(pages) + numberOfPages}`;
    //   }
    // }

    item.setField("pages", newPages);
    return item;
  }

  isPagesRange(pages: string): boolean {
    return pages.includes("-") || pages.includes(",");
  }

  normizePages(pages: string): string {
    return pages.replace(/~/g, "-").replace(/\+/g, ", ");
  }

  async getPDFPages(item: Zotero.Item): Promise<number | void> {
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
}
