import type { RuleBaseOptions } from "./rule-base";
import { RuleBase } from "./rule-base";

class PagesConnectorOptions implements RuleBaseOptions {}

export class PagesConnector extends RuleBase<RuleBaseOptions> {
  constructor(options: PagesConnectorOptions) {
    super(options);
  }

  async apply(item: Zotero.Item): Promise<Zotero.Item> {
    const pages = item.getField("pages");
    let newPages = this.normizePages(pages);

    if (!this.isPagesRange(pages)) {
      const numberOfPages = await this.getPDFPages(item);
      if (numberOfPages) {
        newPages = `${pages}-${Number(pages) + numberOfPages}`;
      }
    }

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

    // @ts-expect-error Fulltext is not in the types
    const pages = await Zotero.Fulltext.getPages(attachment.id);
    if (!pages)
      return;

    return pages.total;
  }
}
