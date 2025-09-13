import { getString } from "../../utils/locale";
import { progressWindow } from "../../utils/logger";
import { getPref } from "../../utils/prefs";
import { defineRule } from "./rule-base";

// 常量定义
const ITEM_TYPE_JOURNAL_ARTICLE = "journalArticle";
const ITEM_TYPE_PREPRINT = "preprint";
const ITEM_TYPE_CONFERENCE_PAPER = "conferencePaper";
const ARXIV_DOI_PREFIX = "10.48550/arXiv.";
const ARXIV_URL_PATTERN = /https?:\/\/arxiv\.org\/abs\//;

interface UpdateMetadataOption {
  mode: "selected" | "blank" | "all";
}

export const UpdateMetadata = defineRule<UpdateMetadataOption>({
  id: "update-metadata",
  type: "item",
  targetItemTypes: [ITEM_TYPE_JOURNAL_ARTICLE, ITEM_TYPE_PREPRINT],

  async apply({ item, options }) {
    if (item.itemType === ITEM_TYPE_JOURNAL_ARTICLE) {
      await handleJournalArticle(item);
      return;
    }

    if (item.itemType === ITEM_TYPE_PREPRINT) {
      await handlePreprint(item, options);
      return;
    }

    await handleOtherItemTypes(item, options);
  },
});

async function handleJournalArticle(item: Zotero.Item) {
  const doi = item.getField("DOI") as string;
  if (!doi) {
    progressWindow(getString("info-noDOI"), "fail");
    return;
  }

  if (doi.match(/arxiv/gi)) {
    item.setType(Zotero.ItemTypes.getID(ITEM_TYPE_PREPRINT) || item.itemTypeID);
  }
}

async function handlePreprint(item: Zotero.Item, options: UpdateMetadataOption) {
  const arxivID = extractArxivId(item);
  if (arxivID) {
    const tmpDOI = await getDOIFromArxiv(arxivID);
    if (tmpDOI) {
      item.setField("DOI", tmpDOI);
      await translateByItem(item, options);
      return;
    }
  }

  const updatedItem = await getMetadataFromSemanticScholar(item, options);
  if (updatedItem) {
    Object.assign(item, updatedItem);
  }
}

async function handleOtherItemTypes(item: Zotero.Item, options: UpdateMetadataOption) {
  const newItem = (await translateByItem(item, options)) || (await getMetadataFromSemanticScholar(item, options));
  if (newItem) {
    Object.assign(item, newItem);
  }
}

function extractArxivId(item: Zotero.Item): string {
  const doi = item.getField("DOI");
  const archiveID = item.getField("archiveID");
  const url = item.getField("url");

  if (doi?.match(new RegExp(ARXIV_DOI_PREFIX, "gi"))) {
    return doi.replace(new RegExp(ARXIV_DOI_PREFIX, "gi"), "");
  }
  if (archiveID?.match(/arxiv/gi)) {
    return archiveID.replace("arxiv:", "");
  }
  if (url?.match(/arxiv/gi)) {
    return url.replace(ARXIV_URL_PATTERN, "");
  }
  return "";
}

async function translateByItem(item: Zotero.Item, options: UpdateMetadataOption): Promise<Zotero.Item | undefined> {
  const itemTemp = Zotero.Utilities.Internal.itemToExportFormat(item, false);

  // 优先使用DOI而不是ISBN
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

  const translate = new Zotero.Translate.Search();
  translate.setSearch(itemTemp);

  const translators = await translate.getTranslators();
  if (translators.length === 0)
    return undefined;
  translate.setTranslator(translators);

  // {libraryID: options} 避免条目保存
  // https://github.com/zotero/translate/blob/05755f5051a77737c56458440c79964c7a8874cf/src/translation/translate.js#L1208-L1210
  // 配置这一项后返回的不再是 Zotero.Item[]，而是一个包含字段信息的 Object[]
  const newItems = await translate.translate({ libraryID: false });
  if (newItems.length === 0)
    return undefined;

  return processTranslatedItem(item, newItems[0], options);
}

function processTranslatedItem(item: Zotero.Item, newItem: any, options: UpdateMetadataOption): Zotero.Item | undefined {
  if (!confirmItemTypeChange(item, newItem))
    return undefined;

  updateItemFields(item, newItem, options);
  return item;
}

function confirmItemTypeChange(item: Zotero.Item, newItem: any): boolean {
  if (newItem.itemType !== item.itemType && getPref("updateMetadate.confirmWhenItemTypeChange")) {
    return Zotero.getMainWindow().confirm(
      `The itemType of "${item.getField("title")}" will be changed from ${item.itemType} to ${newItem.itemType}. \n\nAccept the changes?`,
    );
  }
  return true;
}

function updateItemFields(item: Zotero.Item, newItem: any, options: UpdateMetadataOption) {
  const fieldsIds = Zotero.ItemFields.getItemTypeFields(item.itemTypeID).map((id: number) =>
    Zotero.ItemFields.getName(id),
  ) as string[];

  for (const field of Object.keys(newItem)) {
    if (shouldSkipField(field))
      continue;

    switch (field) {
      case "itemType":
        updateItemType(item, newItem, options);
        break;
      case "creators":
        updateCreators(item, newItem, options);
        break;
      case "accessDate":
        updateAccessDate(item, newItem);
        break;
      default:
        updateStandardField(item, field, newItem[field], options, fieldsIds);
        break;
    }
  }
}

function shouldSkipField(field: string): boolean {
  return ["notes", "tags", "seeAlso", "attachments"].includes(field);
}

function updateItemType(item: Zotero.Item, newItem: any, options: UpdateMetadataOption) {
  const newItemTypeID = Zotero.ItemTypes.getID(newItem.itemType);
  if (!newItemTypeID || newItem.itemType === item.itemType)
    return;

  if (options.mode !== "all") {
    ztoolkit.log("itemType need to update but mode is not 'all'.");
    return;
  }

  if (newItem.DOI?.match(/arxiv/gi)) {
    ztoolkit.log("DOI has 'arxiv', skip to change itemType.");
    return;
  }

  ztoolkit.log(`Update ItemType from ${item.itemType} to ${newItem.itemType}`);
  item.setType(newItemTypeID);
}

function updateCreators(item: Zotero.Item, newItem: any, options: UpdateMetadataOption) {
  if (options.mode === "all" || item.getCreators().length === 0) {
    ztoolkit.log("Update creators");
    item.setCreators(newItem.creators);
  }
}

function updateAccessDate(item: Zotero.Item, newItem: any) {
  const newFieldValue = Zotero.Date.dateToSQL(new Date(newItem.accessDate ?? ""), true);
  if (newFieldValue) {
    ztoolkit.log(`Update "accessDate" to ${newFieldValue}`);
    item.setField("accessDate", newFieldValue);
  }
}

function updateStandardField(item: Zotero.Item, field: string, newValue: any, options: UpdateMetadataOption, validFields: string[]) {
  const oldValue = item.getField(field, false, true);
  if (options.mode !== "all" && oldValue !== "")
    return;

  // 处理Zotero翻译器bug
  if (field === "title") {
    newValue = newValue.replace(/\s+<(sub|sup)>/g, "<$1>");
  }

  if (validFields.includes(field)) {
    ztoolkit.log(`Update "${field}" from "${oldValue}" to "${newValue}"`);
    item.setField(field, newValue);
  }
  else {
    ztoolkit.log(`Skip updating "${field}=${newValue}" because it is not in the itemType fields.`);
  }
}

async function getDOIFromArxiv(arxivID: string): Promise<string | undefined> {
  const id = arxivID.replace(/arxiv:/gi, "").trim();
  const url = `https://export.arxiv.org/api/query?id_list=${id}`;

  try {
    const res = await Zotero.HTTP.request("GET", url);
    const result = res.response as string;
    if (!result) {
      ztoolkit.log("从 Arxiv API 请求失败");
      return undefined;
    }

    const doc = new DOMParser().parseFromString(result, "text/xml");
    const refDoi = doc.querySelector("doi");
    return refDoi?.textContent || undefined;
  }
  catch (error) {
    ztoolkit.log("ArXiv API请求错误:", error);
    return undefined;
  }
}

async function getMetadataFromSemanticScholar(item: Zotero.Item, options: UpdateMetadataOption): Promise<Zotero.Item | undefined> {
  const paperID = getPaperId(item);
  if (!paperID) {
    ztoolkit.log("没有有效的 paper ID 用以向 Semantic Scholar 请求");
    return undefined;
  }

  const result = await fetchSemanticScholarData(paperID);
  if (!result)
    return undefined;

  return processSemanticScholarData(item, result, options);
}

function getPaperId(item: Zotero.Item): string | undefined {
  if (item.getField("archiveID").match(/arxiv/i)) {
    return `ARXIV:${item.getField("archiveID").replace(/arxiv:/gi, "")}`;
  }
  if (item.getField("DOI") !== "") {
    return `DOI:${item.getField("DOI")}`;
  }
  if (ztoolkit.ExtraField.getExtraField(item, "PMCID")) {
    return `PMCID:${ztoolkit.ExtraField.getExtraField(item, "PMCID")}`;
  }
  if (ztoolkit.ExtraField.getExtraField(item, "SemanticScholar")) {
    return ztoolkit.ExtraField.getExtraField(item, "SemanticScholar") || undefined;
  }
  if (item.getField("url") !== "") {
    return `URL:${item.getField("url")}`;
  }
  return undefined;
}

async function fetchSemanticScholarData(paperID: string): Promise<any> {
  const fields = [
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

  const url = `https://api.semanticscholar.org/graph/v1/paper/${paperID.trim()}?fields=${fields.join(",")}`;

  try {
    const res = await Zotero.HTTP.request("GET", url, {
      headers: {
        "x-api-key": getPref("semanticScholarToken"),
      },
    });

    if (res.status !== 200) {
      ztoolkit.log(`Request from Semantic Scholar failed, status code ${res.status}`);
      return undefined;
    }

    return JSON.parse(res.response);
  }
  catch (error) {
    ztoolkit.log("Semantic Scholar请求错误:", error);
    return undefined;
  }
}

function processSemanticScholarData(item: Zotero.Item, result: any, options: UpdateMetadataOption): Zotero.Item {
  const fieldHandlers = {
    publicationTypes: (value: string[]) => {
      if (value.includes("Conference")) {
        item.setType(Zotero.ItemTypes.getID(ITEM_TYPE_CONFERENCE_PAPER) || item.itemTypeID);
      }
      else if (value.includes("JournalArticle") || value.includes("Review")) {
        item.setType(Zotero.ItemTypes.getID(ITEM_TYPE_JOURNAL_ARTICLE) || item.itemTypeID);
      }
    },
    title: (value: string) => item.setField("title", value),
    abstract: (value: string) => item.setField("abstractNote", value),
    externalIds: (value: any) => {
      if (value?.DOI)
        item.setField("DOI", value.DOI);
    },
    url: (value: string) => item.setField("url", value),
    venue: (value: any) => {
      if (item.itemType === ITEM_TYPE_CONFERENCE_PAPER && value.name) {
        item.setField("conferenceName", value.name);
      }
      if (item.itemType === ITEM_TYPE_JOURNAL_ARTICLE && value.name) {
        item.setField("publicationTitle", value.name);
      }
    },
    publicationVenue: (value: any) => {
      if (item.itemType === ITEM_TYPE_CONFERENCE_PAPER && value.name) {
        item.setField("proceedingsTitle", value.name);
      }
      if (item.itemType === ITEM_TYPE_JOURNAL_ARTICLE && value.name) {
        item.setField("publicationTitle", value.name);
      }
      if (value.issn)
        item.setField("ISSN", value.issn);
    },
    publicationDate: (value: string) => item.setField("date", value),
    journal: (value: any) => {
      if (value.volume)
        item.setField("volume", value.volume);
      if (value.pages)
        item.setField("pages", value.pages);
    },
  };

  for (const [field, handler] of Object.entries(fieldHandlers)) {
    const value = result[field];
    if (value !== undefined && value !== null && value !== ""
      && (options.mode === "all" || !item.getField(field))) {
      handler(value);
    }
  }

  if (item.getField("publisher").match(/arxiv/gi)) {
    item.setField("publisher", "");
  }
  item.setField("libraryCatalog", "Semantic Scholar");

  return item;
}
