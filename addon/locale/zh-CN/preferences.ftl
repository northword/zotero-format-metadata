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

## 标题
section-title = 标题 Title
title-sentenceCase = 
    .label = 标题应以句子式大写存储

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
abbr-custom-data-label = 自定义数据文件：
abbr-infer = 
    .label = 本地数据集没有期刊缩写时自动根据 ISO 4 规则推断缩写
abbr-usefull = 
    .label = 对于英文期刊，仍没有期刊缩写时使用全称代替
abbr-usefullZh = 
    .label = 对于中文期刊，仍没有期刊缩写时使用全称代替
choose-custom-abbr-data-button = 
    .label = 选择
choose-custom-abbr-data-input = 
    .placeholder = `"publicationTitle": "ISO 4 缩写"` 格式的 JSON 文件

## 日期
section-date = 日期 Date
date-iso = 
    .label = 日期应为 ISO YYYY-MM-DD 格式

## 期卷页
section-pages = 期卷页 Issue, volume, pages
pages-remove-zeros = 
    .label = 期卷页数字不应以 0 起始

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

## 关于
help-version = { $name }, Build { $version }, { $time }
