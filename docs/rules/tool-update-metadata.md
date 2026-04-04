# 更新元数据

## 描述

Allows filling in missing fields (date, volume, issue, pages, etc.) from identifiers such as DOI or ISBN.

For preprints, updates item type to `journalArticle` when possible.

## 示例

```diff json
{
  "itemType": "preprint",
  "DOI": "10.1016/j.example",
  "date": "",
  "volume": "",
  "issue": "",
  "pages": ""
}
{
  "itemType": "journalArticle",
  "DOI": "10.1016/j.example",
  "date": "2023-01-01",
  "volume": "10",
  "issue": "1",
  "pages": "123-145"
}
```

## 配置选项

- **数据源**：CrossRef（默认）、OCLC、其他服务
- **覆盖已有信息**：可选
- **自动更新预印本为期刊论文**：启用（默认）

## 使用方式

| 方式         | 支持？| 备注                                |
| ------------ | ----- | ----------------------------------- |
| Lint and Fix | ❌    | 工具类，不在自动流程中              |
| 菜单         | ✅    | 右键菜单 > Linter > Update Metadata |

## 使用步骤

1. 在 Zotero 中选中一个或多个条目
2. 右键菜单 > Linter > Update Metadata
3. 在对话框中配置更新选项
4. 点击确认开始更新

## 相关链接

- [CrossRef API](https://www.crossref.org/services/metadata-retrieval/)
- [OCLC WorldCat](https://www.oclc.org/worldcat.en.html)

## 常见问题

**Q: 更新可能出现错误吗？**

A: 可能。网络查询结果有时不准确。建议更新后人工核实重要字段。

**Q: 如何处理查询失败的情况？**

A: 本工具会提示失败的条目。可手动从数据源网站查询并更新。
