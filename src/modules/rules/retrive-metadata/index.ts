// rules/update-metadata.ts
import { getString } from "../../../utils/locale";
import { progressWindow } from "../../../utils/logger";
import { defineRule } from "../rule-base";
import { SemanticScholarService } from "../services/semantic-scholar-service";
import { ArxivService } from "./services/arxiv-service";
import { DoiService } from "./services/doi-service";
import { serviceManager } from "./services/service-manager";

// 注册服务（可以在应用初始化时执行）
serviceManager.registerService(new DoiService());
serviceManager.registerService(new ArxivService());
serviceManager.registerService(new SemanticScholarService());

interface UpdateMetadataOption {
  mode: "selected" | "blank" | "all";
}

export const UpdateMetadata = defineRule<UpdateMetadataOption>({
  id: "update-metadata",
  type: "item",
  targetItemTypes: ["journalArticle", "preprint"],

  async apply({ item, options }) {
    // 特殊处理：期刊文章转换为预印本
    if (item.itemType === "journalArticle") {
      const doi = item.getField("DOI") as string;
      if (!doi) {
        progressWindow(getString("info-noDOI"), "fail");
        return;
      }

      if (doi.match(/arxiv/gi)) {
        item.setType(30); // 30: preprint
      }
    }

    // 使用服务管理器获取元数据
    const result = await serviceManager.getMetadata(item, options);

    if (result.success) {
      serviceManager.applyMetadata(item, result.data, options);
    }
    else {
      progressWindow(getString("info-noMetadata"), "fail");
    }
  },
});
