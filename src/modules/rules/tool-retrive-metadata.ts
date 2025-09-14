import { getString } from "../../utils/locale";
import { progressWindow } from "../../utils/logger";
import { getPref } from "../../utils/prefs";
import { defineRule } from "./rule-base";

interface UpdateMetadataOption {
  mode: "selected" | "blank" | "all";
  // lint: boolean = false;
}

export const ToolUpdateMetadata = defineRule<UpdateMetadataOption> ({

  id: "tool-update-metadata",
  scope: "item",
  targetItemTypes: ["journalArticle", "preprint"],
  category: "tool",
  async apply({ item, options }) {
    if (item.itemType === "journalArticle") {
      const doi = item.getField("DOI") as string;
      // 不存在 DOI 直接结束
      // todo: 若有附件，尝试从附件获取?
      // todo: 弹出 DOI 输入对话框?
      if (!doi) {
        progressWindow(getString("info-noDOI"), "fail");
        return;
      }

      if (doi.match(/arxiv/gi)) {
        item.setType(30); // 30: preprint
      }
    }

    if (item.itemType === "preprint") {
      // for arxiv, try to get new DOI from arxiv, then translate by DOI
      let arxivID = "";
      if (item.getField("DOI").match(/10.48550\/arXiv\./gi))
        arxivID = item.getField("DOI").replace(/10.48550\/arXiv\./gi, "");
      else if (item.getField("archiveID").match(/arxiv/gi))
        arxivID = item.getField("archiveID").replace("arxiv:", "");
      else if (item.getField("url").match(/arxiv/gi))
        arxivID = item.getField("url").replace(/https?:\/\/arxiv\.org\/abs\//, "");

      if (arxivID) {
        const tmpDOI = await getDOIFromArxiv(arxivID);
        if (tmpDOI) {
          item.setField("DOI", tmpDOI);
          await translateByItem(item, options);
          return;
        }
      }

      // else, try to get metadata from SemanticScholar
      item = (await getMetadataFromSemanticScholar(item, options)) ?? item;
      return;
    }

    const newItem = (await translateByItem(item, options)) ?? (await getMetadataFromSemanticScholar(item, options));
    if (newItem)
      item = newItem;
  },

});

async function translateByItem(item: Zotero.Item, options: UpdateMetadataOption): Promise<Zotero.Item | undefined> {
  const itemTemp = Zotero.Utilities.Internal.itemToExportFormat(item, false);
  // ztoolkit.log("itemToExportFormat (original): ", { ...itemTemp });
  // 如果 Item 包含多个标识符，优先使用 DOI
  // 因为部分会议论文包含 ISBN 会导致调用优先级更高的 K10plus ISBN 转换器，导致更新为论文集（书籍）
  // ref: https://github.com/northword/zotero-format-metadata/issues/216
  // 部分图书章节条目将 DOI 存入 extra，因此应优先使用 DOI 而不是 ISBN，以保留图书章节的信息
  // ref: https://github.com/northword/zotero-format-metadata/issues/240
  if (item.getField("ISBN")) {
    const doi = item.getField("DOI") || ztoolkit.ExtraField.getExtraField(item, "DOI");
    if (doi) {
      itemTemp.DOI ??= doi;
      delete itemTemp.ISBN;
    }
  }
  // ztoolkit.log("itemToExportFormat (modified): ", { ...itemTemp });

  const translate = new Zotero.Translate.Search();
  translate.setSearch(itemTemp);
  const translators = await translate.getTranslators();
  // ztoolkit.log("translators:", translators);
  if (translators.length === 0)
    return undefined;
  translate.setTranslator(translators);

  // {libraryID: options} 避免条目保存
  // https://github.com/zotero/translate/blob/05755f5051a77737c56458440c79964c7a8874cf/src/translation/translate.js#L1208-L1210
  // 配置这一项后返回的不再是 Zotero.Item[]，而是一个包含字段信息的 Object[]
  const newItems = await translate.translate({ libraryID: false });

  if (newItems.length === 0)
    return undefined;

  const newItem = newItems[0];
  // ztoolkit.log("Item retrieved from translate: ", newItem);

  // ztoolkit.log(newItem.itemType, item.itemType, getPref("updateMetadate.confirmWhenItemTypeChange"));
  if (newItem.itemType !== item.itemType && getPref("rule.tool-update-metadata.confirm-when-item-type-change")) {
    const isUpdate = Zotero.getMainWindow().confirm(`The itemType of "${item.getField("title")}" will be changed from ${item.itemType} to ${newItem.itemType}. \n\nAccept the changes?`);
    if (!isUpdate) {
      // ztoolkit.log("User cancel update because itemtype changes.");
      return;
    }
  }

  // @ts-expect-error no types
  const fieldsIds = Zotero.ItemFields.getItemTypeFields(item.itemTypeID).map(id => Zotero.ItemFields.getName(id)) as string[];

  // mode === all: 强制更新，无论原值是否为空：mode === "all" ||
  // 对于一个字段，若 mode === "all"，更新
  //              若 mode === "blank"，且 旧值为空，更新
  //              若 mode === "blank"，且 旧值非空，保持
  //              若 mode === "blank"，且 新值为空，？？

  for (const field of Object.keys(newItem)) {
    switch (field) {
      case "notes":
      case "tags":
      case "seeAlso":
      case "attachments":
        break;

      case "itemType": {
        const newItemTypeID = Zotero.ItemTypes.getID(newItem.itemType);
        const isNeed = newItemTypeID && newItem.itemType !== item.itemType;
        if (!isNeed)
          break;

        if (options.mode !== "all") {
          ztoolkit.log("itemType need to update but mode is not 'all'.");
          break;
        }

        if (newItem.DOI?.match(/arxiv/gi)) {
          ztoolkit.log("DOI has 'arxiv', skip to change itemType.");
          break;
        }

        ztoolkit.log(`Update ItemType from ${item.itemType} to ${newItem.itemType}`);
        item.setType(newItemTypeID);
        break;
      }

      case "creators":
        if (options.mode === "all" || item.getCreators().length === 0) {
          ztoolkit.log("Update creators");
          item.setCreators(newItem.creators);
        }
        break;

      case "accessDate": {
        const newFieldValue = Zotero.Date.dateToSQL(new Date(newItem[field] ?? ""), true);
        if (newFieldValue) {
          ztoolkit.log(`Update "accessDate" to ${newFieldValue}`);
          item.setField("accessDate", newFieldValue);
        }
        break;
      }

      default: {
        let newFieldValue = newItem[field] ?? "";
        const oldFieldValue = item.getField(field, false, true);

        if (options.mode !== "all" && oldFieldValue !== "")
          break;
          // 当新条目该字段未空时，结束本次循环
          // 存疑：当新条目该字段为空时，可能是该字段确实为空，用户已有条目字段可能是假值。
          // if (!newFieldValue) continue;

        // This is a Zotero translator bug, temporarily fixed here
        // see https://github.com/northword/zotero-format-metadata/issues/237
        if (field === "title")
          newFieldValue = newFieldValue.replace(/\s+<(sub|sup)>/g, "<$1>");

        if (fieldsIds.includes(field)) {
          ztoolkit.log(`Update "${field}" from "${oldFieldValue}" to "${newFieldValue}"`);
          item.setField(field, newFieldValue);
        }
        else {
          // ztoolkit.log(`Update "extra.${field}" from "${oldFieldValue}" to "${newFieldValue}"`);
          // ztoolkit.ExtraField.setExtraField(item, field, newFieldValue);
          ztoolkit.log(`Skip updating "${field}=${newFieldValue}" because it is not in the itemType fields.`);
        }

        break;
      }
    }
  }
}

/**
 * Updates metadata by identifier
 * 根据 DOI 更新年期卷页链接等字段
 * @deprecated
 */
async function _translateByDOI(doi: string) {
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

async function getDOIFromArxiv(arxivID: string): Promise<string | undefined> {
  const id = arxivID.replace(/arxiv:/gi, "").trim();
  const url = `https://export.arxiv.org/api/query?id_list=${id}`;

  const res = await Zotero.HTTP.request("GET", url);
  const result = res.response as string;
  if (result === "" || result === null || result === undefined) {
    ztoolkit.log("从 Arxiv API 请求失败");
    return undefined;
  }
  const doc = new DOMParser().parseFromString(result, "text/xml");
  const refDoi = doc.querySelector("doi");
  if (refDoi) {
    ztoolkit.log("Got DOI from Arxiv", refDoi);
    return refDoi.innerHTML as string;
  }
  else {
    ztoolkit.log("ArXiv did not return DOI");
    return undefined;
  }
}

async function getMetadataFromSemanticScholar(item: Zotero.Item, options: UpdateMetadataOption): Promise<Zotero.Item | undefined> {
  const fields: (keyof Result)[] = [
    "publicationTypes", // keep this first
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

  interface Result {
    paperId?: string;
    abstract?: string;
    authors?: {
      name: string;
      authorId: string;
    }[];
    externalIds?: {
      [key: string]: string;
    };
    journal?: {
      name?: string;
      volume?: string;
      pages?: string;
    };
    openAccessPdf?: {
      url?: string;
      status?: string;
    };
    publicationDate?: string;
    publicationTypes?: string[];
    publicationVenue?: {
      name?: string;
      issn?: string;
    };
    title?: string;
    url?: string;
    venue?: {
      name?: string;
    };
  }

  const fieldHandlers: {
    [K in keyof Result]?: (value: NonNullable<Result[K]>) => void;
  } = {
    publicationTypes: (value) => {
      if (value.includes("Conference")) {
        item.setType(Zotero.ItemTypes.getID("conferencePaper") || 11);
      }
      else if (value.includes("JournalArticle") || value.includes("Review")) {
        item.setType(Zotero.ItemTypes.getID("journalArticle") || 21);
      }
    },

    title: (value) => {
      item.setField("title", value);
    },

    abstract: (value) => {
      item.setField("abstractNote", value);
    },

    authors: (_value) => {
      // skip
    },

    externalIds: (value) => {
      if (value?.DOI) {
        item.setField("DOI", value.DOI);
      }
    },

    url: (value) => {
      item.setField("url", value);
    },

    venue: (value) => {
      if (item.itemType === "conferencePaper" && value.name) {
        item.setField("conferenceName", value.name);
      }
      if (item.itemType === "journalArticle" && value.name) {
        item.setField("publicationTitle", value.name);
      }
    },

    publicationVenue: (value) => {
      if (item.itemType === "conferencePaper" && value.name) {
        item.setField("proceedingsTitle", value.name);
      }
      if (item.itemType === "journalArticle" && value.name) {
        item.setField("publicationTitle", value.name);
      }
      if (value.issn) {
        item.setField("ISSN", value.issn);
      }
    },

    publicationDate: (value) => {
      item.setField("date", value);
    },

    journal: (value) => {
      if (value.volume) {
        item.setField("volume", value.volume);
      }
      if (value.pages) {
        item.setField("pages", value.pages);
      }
    },
  };

  // Get Identifiers
  let paperID: string;

  if (item.getField("archiveID").match(/arxiv/i)) {
    paperID = `ARXIV:${item.getField("archiveID").replace(/arxiv:/gi, "")}`;
  }
  else if (item.getField("DOI") !== "") {
    paperID = `DOI:${item.getField("DOI")}`;
  }
  else if (ztoolkit.ExtraField.getExtraField(item, "PMCID")) {
    paperID = `PMCID:${ztoolkit.ExtraField.getExtraField(item, "PMCID")}`;
  }
  else if (ztoolkit.ExtraField.getExtraField(item, "SemanticScholar")) {
    paperID = ztoolkit.ExtraField.getExtraField(item, "SemanticScholar") || "";
  }
  else if (item.getField("url") !== "") {
    paperID = `URL:${item.getField("url")}`;
  }
  else {
    ztoolkit.log("没有有效的 paper ID 用以向 Semantic Scholar 请求");
    return undefined;
  }

  // Do request
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

  const result = JSON.parse(res.response) as Result;
  ztoolkit.log(`Data get from Semantic Scholar: `, result);

  // Proformence change
  for (const field of fields) {
    const value = result[field] || "";
    if (!!value && options.mode === "blank")
      continue;

    const handler = fieldHandlers[field];
    if (handler) {
      handler(value as any);
    }
    else {
      // fallback
      if (typeof value === "string") {
        item.setField(field as _ZoteroTypes.Item.ItemField, value);
      }
    }
  }

  if (item.getField("publisher").match(/arxiv/gi))
    item.setField("publisher", "");
  item.setField("libraryCatalog", "Semantic Scholar");
  ztoolkit.log(item);
}
