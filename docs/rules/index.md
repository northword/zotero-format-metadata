# 规则总览

本页面列出了 Zotero 格式化和清理元数据插件支持的所有规则。

## 📊 统计

- **总规则数**：31
- **活跃规则**：31
- **规则类型**：
  - 🔧 **规则**（自动检查和修复）：27 个
  - 🛠️ **工具**（菜单触发）：4 个

## 🔧 条目级规则

| 规则 ID                                        | 说明                     |
| ---------------------------------------------- | ------------------------ |
| [`no-item-duplication`](./no-item-duplication) | 检测重复条目             |
| [`no-article-webpage`](./no-article-webpage)   | 识别被误分类为网页的文章 |
| [`no-journal-preprint`](./no-journal-preprint) | 识别被误分类的预印本     |

## 📝 标题规则

| 规则 ID                                                              | 说明                       |
| -------------------------------------------------------------------- | -------------------------- |
| [`correct-title-sentence-case`](./correct-title-sentence-case)       | 转换标题为 Sentence case   |
| [`correct-title-chemical-formula`](./correct-title-chemical-formula) | 处理标题中的化学公式上下标 |
| [`require-short-title`](./require-short-title)                       | 添加或确保短标题存在       |

## 👥 作者规则

| 规则 ID                                                          | 说明                           |
| ---------------------------------------------------------------- | ------------------------------ |
| [`require-creators`](./require-creators)                         | 确保期刊论文有作者（⏳计划中） |
| [`correct-creators-case`](./correct-creators-case)               | 规范作者名大小写               |
| [`correct-creators-pinyin`](./correct-creators-pinyin)           | 按音节分割中文作者名           |
| [`correct-creators-punctuation`](./correct-creators-punctuation) | 规范作者名标点                 |

## 🌍 语言规则

| 规则 ID                                    | 说明                   |
| ------------------------------------------ | ---------------------- |
| [`require-language`](./require-language)   | 自动检测并填充语言字段 |
| [`tool-set-language`](./tool-set-language) | 批量设置语言（工具）   |

## 📚 期刊规则

| 规则 ID                                                                | 说明                 |
| ---------------------------------------------------------------------- | -------------------- |
| [`correct-publication-title`](./correct-publication-title)             | 规范期刊名为官方形式 |
| [`correct-publication-title-alias`](./correct-publication-title-alias) | 处理期刊名别称       |
| [`correct-publication-title-case`](./correct-publication-title-case)   | 规范期刊名大小写     |
| [`require-abbr`](./require-abbr)                                       | 自动添加期刊缩写     |
| [`correct-conference-abbr`](./correct-conference-abbr)                 | 规范会议缩写         |

## 🎓 学位论文规则

| 规则 ID                                                              | 说明               |
| -------------------------------------------------------------------- | ------------------ |
| [`correct-thesis-type`](./correct-thesis-type)                       | 规范学位类型标注   |
| [`correct-university-punctuation`](./correct-university-punctuation) | 规范大学名标点     |
| [`require-university-place`](./require-university-place)             | 自动填充大学所在地 |

## 📖 书籍规则

| 规则 ID                                                | 说明         |
| ------------------------------------------------------ | ------------ |
| [`correct-edition-numeral`](./correct-edition-numeral) | 规范版次格式 |

## 🔗 标识符规则

| 规则 ID                                      | 说明                   |
| -------------------------------------------- | ---------------------- |
| [`require-doi`](./require-doi)               | 自动检索并填充 DOI     |
| [`no-doi-prefix`](./no-doi-prefix)           | 移除 DOI 中的 URL 前缀 |
| [`correct-doi-long`](./correct-doi-long)     | 将短 DOI 转为长形式    |
| [`tool-get-short-doi`](./tool-get-short-doi) | 获取短 DOI（工具）     |

## 📄 页码规则

| 规则 ID                                                | 说明               |
| ------------------------------------------------------ | ------------------ |
| [`correct-pages-connector`](./correct-pages-connector) | 规范页码连接符     |
| [`correct-pages-range`](./correct-pages-range)         | 补全页码范围       |
| [`no-extra-zeros`](./no-extra-zeros)                   | 移除页码中的多余零 |

## 🔍 其他字段规则

| 规则 ID                                                          | 说明             |
| ---------------------------------------------------------------- | ---------------- |
| [`correct-priority-date-format`](./correct-priority-date-format) | 规范专利申请日期 |
| [`no-value-nullish`](./no-value-nullish)                         | 检测空值字段     |

## 🛠️ 工具规则

| 规则 ID                                          | 说明               |
| ------------------------------------------------ | ------------------ |
| [`tool-clean-extra`](./tool-clean-extra)         | 批量清理额外字段   |
| [`tool-update-metadata`](./tool-update-metadata) | 从网络源更新元数据 |
| [`tool-creators-ext`](./tool-creators-ext)       | 补全作者信息       |
| [`tool-csl-helper`](./tool-csl-helper)           | CSL 额外字段助手   |

## 使用建议

1. **快速了解** — 浏览上方表格找到需要的规则
2. **深入学习** — 点击规则 ID 查看详细说明和示例
3. **问题排查** — 查看 [参考文献检查清单](/reference-checklist) 对照问题类型

## 图例

- 🔧 — 规则（在标准 Lint 流中自动执行）
- 🛠️ — 工具（通过菜单手动触发）
- ⏳ — 计划功能（尚未实现）

---

**最后更新**：2026-04-04
