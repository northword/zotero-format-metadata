## 常规设置
section-general = 常规设置
lint-on-item-added =
    .label = 添加条目时自动执行 Lint
lint-on-groupItem-added = 
    .label = 添加群组条目时自动执行 Lint

enable-richtext-toolbar = 
    .label = 启用富文本工具条
enable-richtext-hotkey = 
    .label = 启用富文本编辑快捷键
wip = 
    .label = 开发中...

## 详细设置

## 条目
section-item = 条目
item-noDuplication = 
    .label = 不应添加重复条目
item-checkWebpage = 
    .label = 网页条目不应连接到学术出版社（应为期刊文章或其他类型）
item-NoPreprintJournalArticle =
    .label = 预印本不应保存为期刊文章

## 标题
section-title = 标题 Title
title-sentenceCase = 
    .label = 标题应以句子式大写存储
title-custom-term = 自定义术语: 
    .label = 自定义术语
    .placeholder = 自定义术语文件的路径
title-custom-term-button = 
    .label = 选择
title-custom-term-desc =  自定义术语文件使用 CSV 文件格式，第一列为搜索词，第二列为替换词，不需要标题，搜索词支持正则表达式。分隔符可以为逗号或分号，但须统一，不得为制表符。

## 作者
section-creators = 创作者 Creators
creators-case = 
    .label = 作者应以首字母大写方式存储
creators-country = 
    .label = 作者姓名中不应存储国籍

## 语言
section-language = 语言 Language
language-fill = 
    .label = 语言字段应填写 ISO 639-1 语言代码
language-fill-option-only = 
    .label = 限制识别的语言为
language-fill-option-only-cmn = 
    .label = 简体中文 (zh)
language-fill-option-only-eng = 
    .label = 英文 (en)
language-fill-option-only-other = 和
language-fill-option-only-other-desc = 如需添加其他语言，请在空白处输入 ISO 693-1 语言代码，英文逗号','分隔。
language-fill-option-only-other-doc = ISO 639-1 代码
    .href = https://github.com/northword/zotero-format-metadata#readme

## 期刊名
section-publicationTitle = 期刊名 publicationTitle
publicationTitle-case = 
    .label = 期刊标题应词首大写

## 期刊缩写
section-abbr = 期刊缩写 journalAbbreviation
abbr-iso = 
    .label = 期刊缩写应不为空且为 ISO 4 格式
abbr-type-label = 期刊缩写的类型：
abbr-infer = 
    .label = 本地数据集没有期刊缩写时自动根据 ISO 4 规则推断缩写
abbr-usefull = 
    .label = 对于英文期刊，仍没有期刊缩写时使用全称代替
abbr-usefullZh = 
    .label = 对于中文期刊，仍没有期刊缩写时使用全称代替
abbr-custom-data-label = 自定义数据文件：
choose-custom-abbr-data-button = 
    .label = 选择
choose-custom-abbr-data-input = 
    .placeholder = 期刊缩写文件的路径
abbr-custom-data-desc = 自定义期刊缩写文件支持 JSON 格式和 CSV 格式。JSON 文件的格式为："publicationTitle": "ISO 4 abbreviation"。CSV 格式第一列填全称，第二列填简写，分隔符可以为逗号或分号，但须统一，不得为制表符。

## 日期
section-date = 日期 Date
date-iso = 
    .label = 日期应为 ISO YYYY-MM-DD 格式

## 期卷页
section-pages = 期卷页 Issue, volume, pages
pages-remove-zeros = 
    .label = 期卷页数字不应以 0 起始
pages-connector = 
    .label = 页码连接符应为 `-` 或 `,`

## 标识符
section-identifier = 标识符
doi-noPrefix = 
    .label = DOI 无须保留网址前缀

## 学位论文相关
section-thesis = 学位论文相关
university-type = 
    .label = 学位论文类别不可省略“学位论文”字样
university-brackets = 
    .label = 中文大学中的括号应使用中文括号，反之应使用西文括号
university-place = 
    .label = 高校所在地不应为空

## 其他
section-others = 其他
std-clean-fileld = 
    .label = 清理被不合理占用的字段

# 更新元数据
section-updateMetadata = 通过标识符更新元数据
others-semanticScholarToken = Semantic Scholar API Key: 
    .label = Semantic Scholar Token
    .placeholder = Semantic Scholar Token
other-semanticScholarToken-desc =  当更新预印本的字段数据时，插件会从 Semantic Scholar 查询该预印本是否已正式发表。默认的，此 API 限制请求 1 次/秒，你可以通过免费申请 API Key 来增加速率限制。
other-semanticScholarToken-link = 申请

## 关于
help-version = { $name }, Build { $version }, { $time }
