# Zotero Format Metadada

An addon for [Zotero](https://www.zotero.org/) to format item metadata.

## Todo

- [ ] 标题 HTML 标签
  - [ ] 快捷键应用上下标
  - [ ] 选中文本后弹出迷你菜单提供上下标按钮
  - [ ] 建立常见化学式的映射以批量自动替换
  - [ ] 斜体、粗体等
- [ ] 期刊：刊名与缩写
  - [ ] 期刊全称消歧：例如 `Applied Catalysis B-environmental` 与 `Applied Catalysis B: environmental` 为相同期刊
  - [ ] 根据期刊名填充期刊缩写
    - [x] 本地术语表
    - [ ] API，用户自定义术语表
    - [ ] 提供 ISO 4 with dot, ISO 4 without dot, 和 JCR 缩写的偏好选项
  - [ ] 中英文无缩写时分别是否以全称填充
- [ ] 期刊：DOI 格式化
- [ ] 期刊：期卷页
  - [ ] 如果没有期卷页，根据 DOI 获取补全
- [ ] 学位论文：地点
  - [x] 根据学校名填充地点
- [ ] 日期格式化为 ISO 格式
- [ ] 语言
  - [ ] 通过语言识别库识别
  - [ ] 期刊与语言的映射
  - [ ] 常见错误语言值直接映射为 ISO 值
- [ ] 添加时自动应用

## Licence

GNU Affero General Public License v3.0

## Acknowledgements

[![Using Zotero Plugin Template](https://img.shields.io/badge/Using-Zotero%20Plugin%20Template-blue?style=flat-square&logo=github)](https://github.com/windingwind/zotero-plugin-template)

The code of the following plug-ins was referenced during the development of this plug-in:  

- [redleafnew/zotero-updateifsE](https://github.com/redleafnew/zotero-updateifsE)
- [zoushucai/zotero-journalabbr](https://github.com/zoushucai/zotero-journalabbr)
