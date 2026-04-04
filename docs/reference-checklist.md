# 参考文献检查清单

这份检查清单帮助你系统地检查 Zotero 参考文献库中的元数据质量。你可以使用本插件的规则来自动检查和修复这些问题。

:::tip
使用快捷键 Ctrl+Shift+X（建议自定义）或从菜单触发规则，逐项应用相应的规则，快速完成检查。
:::

## 条目基本信息

- [ ] **条目类型正确**
  - 书籍应标注为 `Book`，期刊论文应为 `Journal Article` 等
  - 推荐规则：[no-article-webpage](./rules/no-article-webpage)、[no-journal-preprint](./rules/no-journal-preprint)

- [ ] **无重复条目**
  - 检查库中是否存在重复的参考文献
  - 推荐规则：[no-item-duplication](./rules/no-item-duplication)

- [ ] **标题不为空**
  - 所有条目都应该有标题
  - 推荐规则：[require-title](./rules/require-title) _（计划功能）_

## 标题和名称

### 标题格式

- [ ] **标题采用 Sentence Case（句子式大小写）**
  - 仅首字母和专有名词大写，提高 CSL 处理质量
  - 推荐规则：[correct-title-sentence-case](./rules/correct-title-sentence-case)

- [ ] **标题中无末尾句号**
  - Zotero 在引文输出时会自动添加句号，避免重复
  - 推荐规则：[no-title-trailing-dot](./rules/no-title-trailing-dot)

- [ ] **特殊格式正确处理**
  - 化学公式中的上下标：`H2O` 应为 `H<sub>2</sub>O`，`Co2+` 应为 `Co<sup>2+</sup>`
  - 外文引用/专有名词用 `<nocase>` 标签保护
  - 推荐规则：[correct-title-chemical-formula](./rules/correct-title-chemical-formula)、[correct-title-guillemet](./rules/correct-title-guillemet)

- [ ] **短标题格式**
  - 如果有短标题，也应采用 Sentence Case
  - 推荐规则：[require-short-title](./rules/require-short-title)

### 作者信息

- [ ] **作者名称格式规范**
  - 作者名字采用"名 姓"或"姓"的格式，避免全大写
  - 推荐规则：[correct-creators-case](./rules/correct-creators-case)

- [ ] **中文作者拼音分割**
  - 中文作者名应按音节分割，如 `Zhang Jianbei` 应为 `Zhang Jian Bei`
  - 推荐规则：[correct-creators-pinyin](./rules/correct-creators-pinyin)

- [ ] **作者信息不为空（重要条目）**
  - 期刊论文应至少有一位作者
  - 推荐规则：[require-creators](./rules/require-creators) _（计划功能）_

- [ ] **作者信息完整**
  - 避免使用缩写如 "J. Smith"，应为 "John Smith"
  - 推荐规则：[correct-creators-full](./rules/correct-creators-full) _（计划功能）_

## 出版物信息

### 期刊论文

- [ ] **期刊名称规范**
  - 使用期刊的正式全名或通用缩写（如 "Nature" 而非 "Nat"）
  - 推荐规则：[correct-publication-title](./rules/correct-publication-title)、[correct-publication-title-alias](./rules/correct-publication-title-alias)

- [ ] **期刊缩写准确**
  - 如果提供了期刊缩写字段，应为标准缩写（LTWA 标准）
  - 推荐规则：[require-abbr](./rules/require-abbr)

- [ ] **格式规范**
  - 期刊标题采用相应的大小写规则
  - 推荐规则：[correct-publication-title-case](./rules/correct-publication-title-case)

### 会议论文

- [ ] **会议缩写规范**
  - 如果有会议缩写字段，应使用标准缩写
  - 推荐规则：[require-abbr](./rules/require-abbr)

### 学位论文

- [ ] **学位类型标注准确**
  - 博士论文、硕士论文应有明确标注
  - 推荐规则：[correct-thesis-type](./rules/correct-thesis-type)

- [ ] **大学名称和地点规范**
  - 包含完整的大学名称和所在地
  - 推荐规则：[correct-university-punctuation](./rules/correct-university-punctuation)、[require-university-place](./rules/require-university-place)

### 书籍

- [ ] **版次信息准确**
  - 版次应使用罗马数字（如 "2nd edition"）或中文（如"第 2 版"）
  - 推荐规则：[correct-edition-numeral](./rules/correct-edition-numeral)

- [ ] **出版地和出版社**
  - 书籍应包含出版地和出版社信息
  - 推荐规则：[require-university-place](./rules/require-university-place) _（可扩展）_

## 专利和专有内容

- [ ] **申请日期格式**
  - 专利的申请日期应为标准格式（YYYY-MM-DD）
  - 推荐规则：[correct-filing-date-format](./rules/correct-filing-date-format)

- [ ] **必要字段完整**
  - 国家、申请号、发明人等必要信息不缺失
  - 推荐规则：相关字段规则

## 标识符和链接

- [ ] **DOI 格式正确**
  - DOI 不应包含协议前缀（如 `https://doi.org/`），仅保留 DOI 号
  - 推荐规则：[no-doi-prefix](./rules/no-doi-prefix)、[require-doi](./rules/require-doi)

- [ ] **DOI 完整**
  - 重要条目应包含 DOI 以便长期引用
  - 推荐规则：[require-doi](./rules/require-doi)

- [ ] **URL 有效**
  - Web 条目应包含有效的 URL
  - URL 应以 `http://` 或 `https://` 开头

- [ ] **ISBN 格式**
  - ISBN 应为正确的格式（13 位或 10 位数字，带或不带破折号）

## 内容和语言

- [ ] **语言字段准确**
  - 参考文献的语言应正确标注（如 "zh-CN" 表示简体中文）
  - 推荐规则：[require-language](./rules/require-language)

- [ ] **摘要质量**
  - 如果包含摘要，应完整且准确
  - 避免空摘要或从其他字段误复制

- [ ] **关键词规范**
  - 关键词应用分号或逗号分隔
  - 避免空关键词字段

## 额外字段和特殊内容

- [ ] **无多余的自定义字段**
  - 清理不必要的"额外"字段，保持条目整洁
  - 推荐规则：[tool-clean-extra](./rules/tool-clean-extra)

- [ ] **附注信息规范**
  - 如果使用"附注"字段，应仅包含必要的补充信息
  - 避免将重要信息放在附注中

- [ ] **标签使用一致**
  - 同类参考文献应使用相同的标签
  - 避免拼写错误（如 "Paper" 和 "papers" 混用）

## 页码和范围

- [ ] **页码范围格式正确**
  - 页码应为 "1-10" 或 "pp. 1-10" 的格式
  - 避免 "1-10 pages" 或其他混乱格式
  - 推荐规则：[correct-pages-range](./rules/correct-pages-range)

- [ ] **单页条目处理**
  - 单页条目应仅填写一个页码
  - 推荐规则：相关页码规则

## 特殊规则和高级功能

- [ ] **应用"正确"规则集**
  - 使用插件提供的规则集快速修复常见问题
  - 推荐操作：运行 `Linter > 应用全部规则` 或类似批量操作

- [ ] **审查修复日志**
  - 查看插件输出的修复日志，了解做了哪些更改
  - 位置：Zotero 的浏览器控制台（**工具** > **浏览器控制台**）

## 使用此清单的建议

### 快速检查流程

1. **选择条目范围** — 选中要检查的条目（全库或特定分类）
2. **批量应用规则** — 从工具菜单运行合适的规则集
3. **逐项审查** — 按照本清单逐项检查，确保重要字段已处理
4. **人工校对** — 针对关键条目（如重点引用）进行人工审查

### 优先级建议

**高优先级** — 影响引文输出质量的字段：

- 标题、作者、出版物、年份
- 标识符（DOI、ISBN、URL）

**中优先级** — 提高元数据规范性的字段：

- 语言、格式、大小写
- 页码范围、版次

**低优先级** — 辅助信息字段：

- 摘要、关键词、附注
- 自定义字段清理

## 相关资源

- 📖 [详细规则说明](/rules/) — 了解每条规则的具体功能
- 🔧 [首选项配置](/getting-started#首选项配置详解) — 自定义规则行为
- 🤝 [贡献指南](/CONTRIBUTING) — 提出改进建议

:::info
这份清单基于 Zotero 的最佳实践编制。如果你对某条规则有疑问，欢迎查阅对应规则的详细说明或提出 issue。
:::
