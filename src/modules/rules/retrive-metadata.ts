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

        const newItem = await this.translateByItem(item);
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
                    if (this.options.mode !== "all") break;
                    if (newItem["DOI"]?.match(/arxiv/gi)) break;
                    const newItemTypeID = Zotero.ItemTypes.getID(newItem["itemType"]);
                    if (newItemTypeID && newItem["itemType"] !== item.itemType) {
                        ztoolkit.log(`Update ItemType from ${item.itemType} to ${newItem["itemType"]}`);
                        item.setType(newItemTypeID);
                    }
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
                        oldFieldValue = item.getField(field);

                    if (this.options.mode !== "all" && oldFieldValue !== "") break;
                    // 当新条目该字段未空时，结束本次循环
                    // 存疑：当新条目该字段为空时，可能是该字段确实为空，用户已有条目字段可能是假值。
                    // if (!newFieldValue) continue;
                    ztoolkit.log(`Update ${field} from ${oldFieldValue} to ${newFieldValue}`);
                    // @ts-ignore field 已为 Zotero.Item.ItemField
                    item.setField(field, newFieldValue);
                    break;
                }
            }
        }

        // this.options.lint ? await addon.hooks.onUpdateInBatch("std", [item]) : "skip";
        return item;
    }

    async translateByItem(item: Zotero.Item): Promise<{ [key: string]: any }> {
        const itemTemp = Zotero.Utilities.Internal.itemToExportFormat(item, false);
        const translate = new Zotero.Translate.Search();
        translate.setSearch(itemTemp);
        const translators = await translate.getTranslators();
        translate.setTranslator(translators);

        // {libraryID: options} 避免条目保存
        // https://github.com/zotero/translate/blob/05755f5051a77737c56458440c79964c7a8874cf/src/translation/translate.js#L1208-L1210
        // 配置这一项后返回的不再是 Zotero.Item[]，而是一个包含字段信息的 Object[]
        const newItems = await translate.translate({ libraryID: false });
        const newItem = newItems[0];
        return newItem;
    }

    /**
     * Updates metadata by identifier
     * 根据 DOI 更新年期卷页链接等字段
     * @param item
     * @returns
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

    async getDOIFromArxiv(arxivID: string) {
        const id = arxivID.replace(/arxiv:/gi, arxivID).trim();
        const url = `https://export.arxiv.org/api/query?id_list=${id}`;

        // @ts-ignore 第三个参数是可选的
        const res = await Zotero.HTTP.request("GET", url);
        const result = res.response as string;
        if (result == "" || result == null || result == undefined) {
            ztoolkit.log("从 Arxiv API 请求失败");
            return undefined;
        }
        const doc = new DOMParser().parseFromString(result, "text/xml");
        const refDoi = doc.querySelector("doi");
        if (refDoi) {
            return refDoi.innerHTML;
        } else {
            return undefined;
        }
    }
}
