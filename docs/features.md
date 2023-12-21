# 特性与规则

本页规划了本插件可以涉及或计划涉及的规则，旨在规范 Zotero 文献库中所有条目、字段的存在性、正确性、准确性。

与传统 Lint 工具不同的是，本插件旨在直接修复，并未为所有规则提供仅警告不修复的方式。

限于技术水平，插件程序终不如人工识别，使用本插件修改后仍需仔细检查各字段数据的准确性。

> [!tip]
> The following functions involving item field processing provide both an option to run them automatically and an item context menu for manual (and batch) triggering by the user.

## 条目

### 条目不应有重复

当导入的条目与库中已有条目重复时，弹窗警告。

### 条目类型应正确

当前规则目前主要针对 `journalArtical`。

当导入的条目类型为 `Webpage` 且 `url` 字段包含几家主要学术期刊出版时的网址时，极有可能时 Connector 未就绪时进行了抓取，导致识别的条目类型错误，此时，弹窗警告。

todo: 根据网址得到条目标识符并强制更新。

## 标题

### 标题应存在

> Todo

若不存在，通过 DOI 获取；否则警告。

### 标题应为句子式大写

Zotero 文档建议将标题存储为“句子式大写”的格式，这将有利于 CSL 对其执行“title case”变换 [^sentenceCase]。Zotero 7 内置了将标题转为“句子式大写”的功能，预置了一些特例识别，本插件在其基础上，增加了针对化学式等的专有名词识别。

[^sentenceCase]: <https://www.zotero.org/support/kb/sentence_casing>

不得为全大写或词首大写。

### 标题中的富文本设置应正确

无法自动识别，插件提供了“工具条”和“快捷键”两种方式设置 CSL 支持的富文本类别。

## 作者

### 作者应存在

主要针对`期刊文章`。

期刊文章应存在作者，若不存在，通过 DOI / 标题 自动匹配作者。否则警告。

### 作者应词首大写

作者的大小写应保持词首大写。

### 作者应是全称

> Todo

不是全称的向数据库检索全称。

含有`-`的中文拼音名应是正确的，但可以提供去除`-`的选项。

含有`.`的缩写应尽可能取回全称。

## 语言

CSL 根据条目的国家区域来完成本地化，Zotero 通过语言字段向 CSL 提供该值。

插件根据条目的标题判断其语言，并将识别结果填入“语言字段”，这对于 CSL 完成参考文献表双语排版（如 et al 与 等 混排）非常重要。[^csl-etal]。

默认的，插件被限制仅识别简体中文和英文，你可以在首选项中关闭语言限制或添加其他常用语言的 [ISO 639-3 代码]。

[^csl-etal]: <https://github.com/redleafnew/Chinese-STD-GB-T-7714-related-csl#%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8>

[ISO 639-3 代码]: https://iso639-3.sil.org/code_tables/639/data

## 期刊

### 期刊名应以期刊官方名为准

如 `Applied Catalysis B-environmental` 与 `Applied Catalysis B: Environmental` 是同一本期刊，后者为官方名称，前者为 Web of Science 收录名称。

内置一些常见的期刊名，进行校正。

### 期刊名应是词首大写

针对部分来源导入的全大写出版物标题，将其转为词首大写。加入了部分恒为大写的词，见 [src\modules\rules\field-publication.ts](../src/modules/rules/field-publication.ts)。

## 期刊缩写

### 期刊缩写应为 ISO 4 带点格式

插件内置了一个包含约 10 万条期刊缩写的数据集（来自 JabRef 和 Woodward Library ），插件将首先在本地数据集里查询期刊缩写；

若无则根据 [ISSN List of Title Word Abbreviations](https://www.issn.org/services/online-services/access-to-the-ltwa/) 推断其缩写（可在首选项中关闭此行为）；

若仍没有找到缩写，则以期刊全称代替（可在首选项中关闭此行为）。

## 所在地

### 学位论文：高校所在地应正确

插件内置了国内高校的名单及其所在地，对于学位论文条目，根据论文的高校填写其所在地，这有利于满足 GB/T 7714-2015 中需要显示出版地的要求 [^gb7714]。

[^gb7714]: <http://www.cessp.org.cn/a258.html>

## 日期

### 日期应为 ISO 格式

日期应为 `YYYY-MM-DD` 格式，例如`2023-01-01`。

## 标识符

### DOI 不应为空

对于期刊文章，应存在 DOI。

### DOI 应有效

> todo

DOI 应是真实存在的

### DOI 不需要前缀

DOI 之需要保留机构编码和资源编码即可，doi.org 等网址前缀无需添加。

## todo

还没写完...
