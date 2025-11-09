import { defineService } from "./base-service";

function cleanTranslatedData(response: any) {
  ["notes", "tags", "seeAlso", "attachments"].forEach((field) => {
    delete response[field];
  });
  return response;
}

async function doTranslate(translate: any) {
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

  return newItems[0];
}

export const ItemTranslateService = defineService({
  id: "item-translate-service",
  name: "Item Translate Service",
  shouldProcess: (): boolean => true,

  request: async ({ item }) => {
    const itemTemp = Zotero.Utilities.Internal.itemToExportFormat(item, false);

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
    return await doTranslate(translate);
  },

  cleanData: cleanTranslatedData,
});

export const IdentifiersTranslateService = defineService({
  id: "identifiers-translate-service",
  name: "Identifiers Translate Service",
  shouldProcess: (): boolean => true,

  request: async ({ identifiers }) => {
    const translate = new Zotero.Translate.Search();
    translate.setIdentifier(identifiers);
    return await doTranslate(translate);
  },

  cleanData: cleanTranslatedData,
});

export const URLTranslateService = defineService({
  id: "url-translate-service",
  name: "Web Translate Service",
  shouldProcess: ({ identifiers }) => !!identifiers.URL,

  request: async ({ identifiers }) => {
    if (!identifiers.URL)
      return;

    const translate = new Zotero.Translate.Web();
    const doc = await Zotero.HTTP.processDocuments(identifiers.URL, doc => doc);
    translate.setDocument(doc[0]);
    return await doTranslate(translate);
  },

  cleanData: cleanTranslatedData,
});
