pref-title-label = 格式化条目元数据

## 常规设置
pref-general-settings-label = 常规设置
pref-general-add-update =
    .label = 添加条目时自动运行标准格式化流程
pref-general-add-update-for-group = 
    .label = 添加群组条目时自动运行标准格式化流程
pref-general-isEnableToolbar = 
    .label = 启用富文本工具条
pref-general-isEnableRichTextHotKey = 
    .label = 启用富文本编辑快捷键
pref-wip = 
    .label = 开发中...

## 标准格式化流程
pref-std-label = 标准格式化流程
pref-std-clean-fileld = 
    .label = 清理被不合理占用的字段
pref-std-update-field-by-doi = 
    .label = 根据 DOI 更新空白字段
pref-std-lang = 
    .label = 根据条目标题自动更新语言字段
pref-std-creators = 
    .label = 修正作者的大小写
pref-std-abbr = 
    .label = 查找期刊缩写
pref-std-date = 
    .label = 将日期格式化为 ISO YYYY-MM-DD 格式
pref-std-doi = 
    .label = 清除 DOI 的网址前缀
pref-std-place = 
    .label = 更新条目的地点字段

## 期刊缩写
pref-abbr-label = 期刊缩写
pref-abbr-type-label = 期刊缩写的类型：
pref-abbr-type-iso4 = 
    .label = ISO 4 带点
pref-abbr-type-iso4dotless = 
    .label = ISO 4 不带点
pref-abbr-type-jcr = 
    .label = JCR
pref-abbr-infer = 
    .label = 本地数据集没有期刊缩写时自动根据 ISO 4 规则推断缩写
pref-abbr-usefull = 
    .label = 对于英文期刊，仍没有期刊缩写时使用全称代替
pref-abbr-usefullZh = 
    .label = 对于中文期刊，仍没有期刊缩写时使用全称代替
pref-abbr-custom-data-label = 自定义数据文件：
pref-choose-custom-abbr-data-button = 
    .label = 选择
pref-choose-custom-abbr-data-input = 
    .placeholder = `"publicationTitle": "ISO 4 缩写"` 格式的 JSON 文件

## 语言
pref-lang-label = 语言
pref-lang-allow = 
    .label = 限制识别的语言为
pref-lang-cmn = 
    .label = 简体中文(cmn)
pref-lang-eng = 
    .label = 英文(eng)
pref-lang-other = 和
pref-lang-other-desc = 如需添加其他语言，请在空白处输入 ISO 693-3 语言代码，英文逗号','分隔。
pref-lang-other-doc = ISO 639-3 代码
    .href = https://github.com/northword/zotero-format-metadata#readme

## 关于
help-version = { $name }, Build { $version }, { $time }
