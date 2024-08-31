import { getString } from "../../utils/locale";
import { progressWindow } from "../../utils/logger";
import { getPref } from "../../utils/prefs";
import { RuleBase, RuleBaseOptions } from "./rule-base";

class UpdateMetadataOption implements RuleBaseOptions {
    mode: "selected" | "blank" | "all" = "blank";
    // lint: boolean = false;
}

export default class UpdateMetadata extends RuleBase<UpdateMetadataOption> {
    constructor(options: UpdateMetadataOption) {
        super(options);
    }

    async apply(item: Zotero.Item): Promise<Zotero.Item> {
        if (item.itemType == "journalArticle") {
            const doi = item.getField("DOI") as string;
            // 不存在 DOI 直接结束
            // todo: 若有附件，尝试从附件获取?
            // todo: 弹出 DOI 输入对话框?
            if (!doi) {
                progressWindow(getString("info-noDOI"), "fail");
                return item;
            }

            if (doi.match(/arxiv/gi)) {
                const arxivID = doi.replace(/10.48550\/arXiv\./gi, "");
                const tmpDOI = await this.getDOIFromArxiv(arxivID);
                item.setField("DOI", tmpDOI ?? doi);
            }
        }

        if (item.itemType == "preprint") {
            const arxivID =
                item.getField("archiveID").replace("arxiv:", "") ||
                item.getField("url").replace("http://arxiv.org/abs/", "");
            if (arxivID) {
                const tmpDOI = await this.getDOIFromArxiv(arxivID);
                if (tmpDOI) {
                    item.setField("DOI", tmpDOI);
                    item = (await this.translateByItem(item)) ?? item;
                } else {
                    item = (await this.getMetadataFromSemanticScholar(item)) ?? item;
                }
            }
            return item;
        }

        return (await this.translateByItem(item)) ?? (await this.getMetadataFromSemanticScholar(item)) ?? item;
    }

    async translateByItem(item: Zotero.Item): Promise<Zotero.Item | undefined> {
        const itemTemp = Zotero.Utilities.Internal.itemToExportFormat(item, false);
        ztoolkit.log("itemToExportFormat: ", itemTemp);
        // 如果 Item 包含多个标识符，优先使用 DOI
        // 因为部分会议论文包含 ISBN 会导致调用优先级更高的 K10plus ISBN 转换器，导致更新为论文集（书籍）
        // ref: https://github.com/northword/zotero-format-metadata/issues/216
        if (itemTemp.DOI && itemTemp.ISBN) {
            delete itemTemp.ISBN;
        }

        const translate = new Zotero.Translate.Search();
        translate.setSearch(itemTemp);
        const translators = await translate.getTranslators();
        ztoolkit.log("translators:", translators);
        if (translators.length == 0) return undefined;
        translate.setTranslator(translators);

        // {libraryID: options} 避免条目保存
        // https://github.com/zotero/translate/blob/05755f5051a77737c56458440c79964c7a8874cf/src/translation/translate.js#L1208-L1210
        // 配置这一项后返回的不再是 Zotero.Item[]，而是一个包含字段信息的 Object[]
        const newItems = await translate.translate({ libraryID: false });

        if (newItems.length == 0) return undefined;

        const newItem = newItems[0];
        ztoolkit.log("Item retrieved from translate: ", newItem);

        // mode == all: 强制更新，无论原值是否为空：mode == "all" ||
        // 对于一个字段，若 mode == "all"，更新
        //              若 mode == "blank"，且 旧值为空，更新
        //              若 mode == "blank"，且 旧值非空，保持
        //              若 mode == "blank"，且 新值为空，？？

        for (const field of Object.keys(newItem)) {
            switch (field) {
                case "notes":
                case "tags":
                case "seeAlso":
                case "attachments":
                    break;

                case "itemType": {
                    const newItemTypeID = Zotero.ItemTypes.getID(newItem["itemType"]);
                    const isNeed = newItemTypeID && newItem["itemType"] !== item.itemType;
                    if (!isNeed) break;

                    if (this.options.mode !== "all") {
                        ztoolkit.log("itemType need to update but mode is not 'all'.");
                        break;
                    }

                    if (newItem["DOI"]?.match(/arxiv/gi)) {
                        ztoolkit.log("DOI has 'arxiv', skip to change itemType.");
                        break;
                    }

                    ztoolkit.log(`Update ItemType from ${item.itemType} to ${newItem["itemType"]}`);
                    item.setType(newItemTypeID);
                    break;
                }

                case "creators":
                    if (this.options.mode === "all" || item.getCreators().length == 0) {
                        ztoolkit.log("Update creators");
                        item.setCreators(newItem["creators"]);
                    }
                    break;

                default: {
                    const newFieldValue = newItem[field] ?? "",
                        // @ts-ignore field 已为 Zotero.Item.ItemField
                        oldFieldValue = item.getField(field, false, true);

                    if (this.options.mode !== "all" && oldFieldValue !== "") break;
                    // 当新条目该字段未空时，结束本次循环
                    // 存疑：当新条目该字段为空时，可能是该字段确实为空，用户已有条目字段可能是假值。
                    // if (!newFieldValue) continue;
                    ztoolkit.log(`Update "${field}" from "${oldFieldValue}" to "${newFieldValue}"`);
                    // @ts-ignore field 已为 Zotero.Item.ItemField
                    item.setField(field, newFieldValue, true);
                    break;
                }
            }
        }

        return item;
    }

    /**
     * Updates metadata by identifier
     * 根据 DOI 更新年期卷页链接等字段
     * @param item
     * @returns
     * @deprecated
     */
    async translateByDOI(doi: string) {
        const identifier = {
            itemType: "journalArticle",
            DOI: doi,
        };

        const translate = new Zotero.Translate.Search();
        translate.setIdentifier(identifier);
        const translators = await translate.getTranslators();
        translate.setTranslator(translators);

        // {libraryID: options} 避免条目保存
        // https://github.com/zotero/translate/blob/05755f5051a77737c56458440c79964c7a8874cf/src/translation/translate.js#L1208-L1210
        // 配置这一项后返回的不再是 Zotero.Item[]，而是一个包含字段信息的 Object[]
        const newItems = await translate.translate({ libraryID: false });
        const newItem = newItems[0];
        return newItem;
    }

    async getDOIFromArxiv(arxivID: string): Promise<string | undefined> {
        const id = arxivID.replace(/arxiv:/gi, "").trim();
        const url = `https://export.arxiv.org/api/query?id_list=${id}`;

        const res = await Zotero.HTTP.request("GET", url);
        const result = res.response as string;
        if (result == "" || result == null || result == undefined) {
            ztoolkit.log("从 Arxiv API 请求失败");
            return undefined;
        }
        const doc = new DOMParser().parseFromString(result, "text/xml");
        const refDoi = doc.querySelector("doi");
        if (refDoi) {
            ztoolkit.log("Get DOI from Arxiv");
            return refDoi.innerHTML;
        } else {
            ztoolkit.log("ArXiv did not return DOI");
            return undefined;
        }
    }

    async getMetadataFromSemanticScholar(item: Zotero.Item): Promise<Zotero.Item | undefined> {
        let paperID: string;

        if (item.getField("archiveID").match(/arxiv/i)) {
            paperID = `ARXIV:${item.getField("archiveID").replace(/arxiv:/gi, "")}`;
        } else if (item.getField("DOI") !== "") {
            paperID = `DOI:${item.getField("DOI")}`;
        } else if (ztoolkit.ExtraField.getExtraField(item, "PMCID")) {
            paperID = `PMCID:${ztoolkit.ExtraField.getExtraField(item, "PMCID")}`;
        } else if (ztoolkit.ExtraField.getExtraField(item, "SemanticScholar")) {
            paperID = ztoolkit.ExtraField.getExtraField(item, "SemanticScholar") || "";
        } else if (item.getField("url") !== "") {
            paperID = `URL:${item.getField("url")}`;
        } else {
            ztoolkit.log("没有有效的 paper ID 用以向 Semantic Scholar 请求");
            return undefined;
        }

        const fields = [
            "publicationTypes", // 条目类别必须排在第一首先处理
            "title",
            "authors",
            "abstract",
            "externalIds",
            "url",
            "venue",
            "publicationVenue",
            "publicationDate",
            "journal",
        ];
        const url = `https://api.semanticscholar.org/graph/v1/paper/${paperID.trim()}?fields=${fields.join(",")}`;

        const res = await Zotero.HTTP.request("GET", url, {
            headers: {
                "x-api-key": getPref("semanticScholarToken"),
            },
        });
        if (res.status !== 200) {
            ztoolkit.log(`Request from Semantic Scholar failed, status code ${res.status}`);
            return undefined;
        }
        const result = JSON.parse(res.response);
        ztoolkit.log(`Data get from Semantic Scholar: `, result);

        for (const field of fields) {
            if (!(field in result)) continue;
            const value = result[field];
            ztoolkit.log(`value of field ${field} is `, value);
            if (value !== "" && this.options.mode == "blank") continue;
            switch (field) {
                case "publicationTypes": {
                    // 似乎未发布的预印本会此项为 null
                    if (value.includes("Conference")) {
                        item.setType(Zotero.ItemTypes.getID("conferencePaper") || 11);
                    } else if (value.includes("JournalArticle")) {
                        item.setType(Zotero.ItemTypes.getID("journalArticle") || 21);
                    }
                    break;
                }
                case "authors": {
                    //
                    break;
                }
                case "abstract":
                    item.setField("abstractNote", value);
                    break;
                case "venue":
                    if (item.itemType == "conferencePaper") item.setField("conferenceName", value);
                    if (item.itemType == "journalArticle") item.setField("publicationTitle", value);
                    break;
                case "publicationVenue":
                    if (item.itemType == "conferencePaper") item.setField("proceedingsTitle", value.name);
                    if (item.itemType == "journalArticle") item.setField("publicationTitle", value.name);
                    if ("issn" in value) item.setField("ISSN", value.issn, true);
                    break;
                case "publicationDate": {
                    item.setField("date", value);
                    break;
                }
                case "journal": {
                    if ("pages" in value) item.setField("pages", value.pages);
                    if ("volume" in value) item.setField("volume", value.volume);
                    break;
                }
                case "externalIds": {
                    if ("DOI" in value) item.setField("DOI", value.DOI);
                    // if ("ArXiv" in value) item.
                    break;
                }
                default:
                    item.setField(field as Zotero.Item.ItemField, value);
                    break;
            }
        }
        if (item.getField("publisher").match(/arxiv/gi)) item.setField("publisher", "");
        item.setField("libraryCatalog", "Semantic Scholar");
        ztoolkit.log(item);
        return item;
    }
}
