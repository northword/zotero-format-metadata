import { RuleBase, RuleBaseOptions } from "../../utils/rule-base";
import { isStringMatchStringInArray } from "../../utils/str";

// 当条目为 webpage ，且 url 为各期刊出版社时，警告

const publisherUrlKeyWords = [
    "acm.org",
    "acs.org",
    "aiaa.org",
    "aip.org",
    "ams.org",
    "annualreviews.org",
    "aps.org",
    "ascelibrary.org",
    "asm.org",
    "asme.org",
    "astm.org",
    "blackwell-synergy.com",
    "bmj.com",
    "cabdirect.org",
    "cambridge.org",
    "cas.org",
    "cell.com",
    "clarivate.com",
    "cnki.net",
    "cqvip.com",
    "crossref.org",
    "csiro.au",
    "deepdyve.com",
    "doi.org",
    "ebscohost.com",
    "els-cdn.com",
    "elsevier.com",
    "emerald.com",
    "endnote.com",
    "engineeringvillage.com",
    "icevirtuallibrary.com",
    "ieee.org",
    "imf.org",
    "iop.org",
    "jamanetwork.com",
    "jbc.org",
    "jhu.edu",
    "jstor.org",
    "karger.com",
    "libguides.com",
    "madsrevolution.net",
    "mdpi.com",
    "mpg.de",
    "myilibrary.com",
    "nature.com",
    "ncbi.nlm.nih.gov",
    "oecd-ilibrary.org",
    "osapublishing.org",
    "oup.com",
    "ovid.com",
    "oxfordartonline.com",
    "oxfordbibliographies.com",
    "oxfordmusiconline.com",
    "pkulaw.com",
    "pnas.org",
    "proquest.com",
    "readcube.com",
    "researchgate.net",
    "rsc.org",
    "sagepub.com",
    "sci-hub",
    "science.org",
    "sciencedirect.com",
    "sciencemag.org",
    "scitation.org",
    "scopus.com",
    "semanticscholar.org",
    "siam.org",
    "spiedigitallibrary.org",
    "springer.com",
    "springerlink.com",
    "tandfonline.com",
    "un.org",
    "uni-bielefeld.de",
    "wanfangdata.com",
    "webofknowledge.com",
    "westlaw.com",
    "westlawchina.com",
    "wiley.com",
    "worldbank.org",
    "worldscientific.com",
    "zotero.org",
];

class NoWebPageItemOptions implements RuleBaseOptions {}

export default class NoWebPageItem extends RuleBase<NoWebPageItemOptions> {
    constructor(options: NoWebPageItemOptions) {
        super(options);
    }

    apply(item: Zotero.Item): Zotero.Item | Promise<Zotero.Item> {
        if (item.itemType !== "webpage") return item;
        const url = item.getField("url");
        if (typeof url == "string" && url !== "") {
            if (isStringMatchStringInArray(url, publisherUrlKeyWords)) {
                ztoolkit.log("The url of this webpage item is match with domin of publisher.");
                // show alart todo: 对话框完善，通过 URL 获取 DOI 并通过 DOI 强制更新条目类别
                window.alert(
                    "Linter for Zotero \n监测到您导入了一个 WebPage 条目，其 URL 中包含了主要学术出版商的域名，\n导入可能存在异常，请确认！",
                );
            } else {
                ztoolkit.log(`The url of this webpage item is not belong to publisher, maybe a normal webpage.`);
            }
        }
        return item;
    }
}
