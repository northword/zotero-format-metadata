import type { RuleBaseOptions } from "./rule-base";
import { getString } from "../../utils/locale";
import { progressWindow } from "../../utils/logger";
import { isStringMatchStringInArray } from "../../utils/str";
import { RuleBase } from "./rule-base";

// 当条目为 webpage ，且 url 为各期刊出版社时，警告

const publisherUrlKeyWords = ["arxiv.org", "biorxiv.org", "medrxiv.org", "chinaxiv.org"];

class NoPreprintJournalArticleOptions implements RuleBaseOptions {}

export class NoPreprintJournalArticle extends RuleBase<NoPreprintJournalArticleOptions> {
  constructor(options: NoPreprintJournalArticleOptions) {
    super(options);
  }

  apply(item: Zotero.Item): Zotero.Item | Promise<Zotero.Item> {
    if (item.itemType !== "journalArticle")
      return item;
    const url = item.getField("url");
    if (typeof url === "string" && url !== "" && isStringMatchStringInArray(url, publisherUrlKeyWords)) {
      ztoolkit.log("The url of this journalArticle item is match with domin of preprint publisher.");
      // show alart todo: 对话框完善，通过 URL 获取 DOI 并通过 DOI 强制更新条目类别
      progressWindow(getString("NoPreprintJournalArticle-warning"), "fail").startCloseTimer(100000);
    }
    return item;
  }
}
