## no-item-duplication
rule-no-item-duplication =
  .label = 不应添加重复条目
rule-no-item-duplication-report-message = 该条目与已有条目重复
rule-no-item-duplication-report-action = 前往合并条目窗格


## no-article-webpage
rule-no-article-webpage =
  .label = 网页条目不应连接到学术出版社（应为期刊文章或其他类型）
rule-no-article-webpage-report-message = 该网页条目 URL 中包含了主要学术出版商的域名，请确认条目类型！


## no-journal-preprint
rule-no-journal-preprint =
  .label = 预印本不应保存为期刊文章
rule-no-journal-preprint-report-message = 该期刊文章条目 URL 中包含了预印本服务器的域名，请确认条目类型！


## no-value-nullish
rule-no-value-nullish = 
  .label = 字段值不应为无效值（无、N/A 等）


## require-language
rule-require-language =
  .label = 语言字段应填写 ISO 639-1 语言代码
rule-require-language-menu-item = 自动识别条目语言
rule-require-language-menu-field = 自动识别（Linter）

rule-require-language-option-only = 
    .label = 限制识别的语言以提高准确度：
rule-require-language-option-only-cmn = 
    .label = 简体中文 (zh)
rule-require-language-option-only-eng = 
    .label = 英文 (en)
rule-require-language-option-only-other = 和
rule-require-language-option-only-other-desc = 如需添加其他语言，请在空白处输入 ISO 693-1 语言代码，英文逗号','分隔。
rule-require-language-option-only-other-doc = ISO 639-1 代码
    .href = https://github.com/northword/zotero-format-metadata#readme


## require-short-title
rule-require-short-title = 
    .label = 主标题应填入短标题


## correct-title-sentence-case
rule-correct-title-sentence-case =
  .label = 标题标题应以句子式大写存储
rule-correct-title-sentence-case-menu-item = 将标题改为句首大写
rule-correct-title-sentence-case-menu-field = 句首大写（Linter）

rule-correct-title-sentence-option-custom-term = 自定义术语：
    .label = 自定义术语
    .placeholder = 自定义术语文件的路径
rule-correct-title-sentence-option-custom-term-button = 
    .label = 选择
rule-correct-title-sentence-option-custom-term-desc =  自定义术语文件使用 CSV 文件格式，第一列为搜索词，第二列为替换词，不需要标题，搜索词支持正则表达式。分隔符可以为逗号或分号，但须统一，不得为制表符。


## correct-shortTitle-sentence-case
rule-correct-shortTitle-sentence-case =
  .label = ShortTitle 也以句子式大写存储
rule-correct-shortTitle-sentence-case-description = 此规则与「{ rule-correct-title-sentence-case.label }」共享配置


## no-title-trailing-dot
rule-no-title-trailing-dot =
  .label = 标题不应以句号结尾


## correct-creators-case
rule-correct-creators-case =
  .label = 作者应以首字母大写方式存储
rule-correct-creators-case-menu-item = 修正作者的大小写


## correct-creators-pinyin
rule-correct-creators-pinyin =
  .label = 作者中的中文拼音应被拆分（即 Zhang Sanfeng → Zhang San Feng）
rule-correct-creators-pinyin-menu-item = 拆分作者拼音


## correct-date-format
rule-correct-date-format =
  .label = 日期应为 ISO YYYY-MM-DD 格式
rule-correct-date-format-menu-item = 统一日期格式为 ISO 格式


## correct-publication-title
rule-correct-publication-title =
  .label = 期刊标题应去除别称并词首大写
rule-correct-publication-title-menu-item = 修正期刊标题的别称和大小写
rule-correct-publication-title-menu-field = 修正别称（Linter）


## require-journal-abbr
rule-require-journal-abbr =
  .label = 期刊缩写应不为空且为 ISO 4 格式
rule-require-journal-abbr-menu-item = 自动填充期刊缩写
rule-require-journal-abbr-menu-field = 查找缩写（Linter）

rule-require-journal-abbr-option-infer = 
    .label = 本地数据集没有期刊缩写时自动根据 ISO 4 规则推断缩写
rule-require-journal-abbr-option-usefull = 仍没有期刊缩写时使用全称代替：
rule-require-journal-abbr-option-usefull-en = 
    .label = 英文期刊
rule-require-journal-abbr-option-usefull-zh = 
    .label = 中文
rule-require-journal-abbr-option-custom-data-label = 自定义数据文件：
rule-require-journal-abbr-option-choose-custom-abbr-data-button = 
    .label = 选择
rule-require-journal-abbr-option-choose-custom-abbr-data-input = 
    .placeholder = 期刊缩写文件的路径
rule-require-journal-abbr-option-custom-data-desc = 自定义缩写文件支持 JSON 格式和 CSV 格式。JSON 文件的格式为："publicationTitle": "abbreviation"。CSV 格式第一列填全称，第二列填简写，分隔符可以为逗号或分号，但须统一，不得为制表符。


## require-doi
rule-require-doi =
  .label = DOI 应填写完整
rule-require-doi-menu-item = 获取 DOI


## no-doi-prefix
rule-no-doi-prefix =
  .label = DOI 无须保留网址前缀
rule-no-doi-prefix-menu-item = 去除 DOI 网址前缀
rule-no-doi-prefix-menu-field = 去除网址前缀


## correct-doi-long
rule-correct-doi-long =
  .label = DOI 应为长格式而非短格式


## correct-pages-connector
rule-correct-pages-connector =
  .label = 页码连接符应为 `-` 或 `,`


## correct-pages-range
rule-correct-pages-range =
  .label = Pages 应为范围


## no-issue-extra-zeros
rule-no-issue-extra-zeros =
  .label = 期「issue」不应以 0 起始


## no-pages-extra-zeros
rule-no-pages-extra-zeros =
  .label = 页码不应以 0 起始


## no-volume-extra-zeros
rule-no-volume-extra-zeros =
  .label = 卷「volume」不应以 0 起始


## correct-conference-abbr
rule-correct-conference-abbr =
  .label = 会议名的缩写填入 extra.shortConferenceName 字段
rule-correct-conference-abbr-description = 此规则与「{ rule-require-journal-abbr.label }」共享配置 


## correct-thesis-type
rule-correct-thesis-type =
  .label = 学位论文类别不可省略「学位论文」字样


## correct-university-punctuation
rule-correct-university-punctuation =
  .label = 中文大学中的括号应使用中文括号，反之应使用西文括号


## require-university-place
rule-require-university-place =
  .label = 高校所在地不可为空
rule-require-university-place-menu-item = 填写高校所在地
rule-require-university-place-menu-field = 查找（Linter）


## correct-edition-numeral
rule-correct-edition-numeral =
  .label =  edition 应为纯数字


## correct-volume-numeral
rule-correct-volume-numeral =
  .label =  volume 应为纯数字


## tool-title-guillemet
rule-tool-title-guillemet =
  .label = 转换标题中的尖括号「〈〉与《》」
rule-tool-title-guillemet-menu-item = { rule-tool-title-guillemet.label  }


## tool-creators-ext
rule-tool-creators-ext =
  .label = 应用作者扩展信息
rule-tool-creators-ext-menu-item = { rule-tool-creators-ext.label  }


## tool-set-language
rule-tool-set-language =
  .label = 手动设置条目语言
rule-tool-set-language-menu-item = { rule-tool-set-language.label }


## tool-update-metadata
tool-update-metadata =
  .label = 通过标识符更新元数据
tool-update-metadata-menu-item = 通过标识符更新元数据并 Lint

tool-update-metadata-option-confirm-when-itemtype-change = 
    .label = 当条目类型变更时要求确认
tool-update-metadata-option-semanticScholarToken = Semantic Scholar API Key: 
    .label = Semantic Scholar Token
    .placeholder = Semantic Scholar Token
tool-update-metadata-option-semanticScholarToken-desc =  当更新预印本的字段数据时，插件会从 Semantic Scholar 查询该预印本是否已正式发表。默认的，此 API 限制请求 1 次/秒，你可以通过免费申请 API Key 来增加速率限制。
tool-update-metadata-option-semanticScholarToken-link = 申请


## tool-get-short-doi
rule-tool-get-short-doi-menu-item = Retrieve short DOI
