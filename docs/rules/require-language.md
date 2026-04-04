# 语言字段检查

## 描述

CSL styles rely on the language field for localization (e.g., mixing _et al._ with“等”).
This rule infers language from the title and fills in the `language` field automatically.

By default, only **Simplified Chinese** and **English** are detected. You can disable the restriction or add other [ISO 639-1 codes].

[ISO 639-1 codes]: https://github.com/komodojp/tinyld/blob/develop/docs/langs.md

## 示例

```diff json
{
  "title": "中文标题",
  "language": ""
}
{
  "title": "中文标题",
  "language": "zh-CN"
}
```

## 配置选项

无

## 使用方式

| 方式         | 支持？| 备注 |
| ------------ | ----- | ---- |
| Lint and Fix | ✅    |      |
| 菜单         | ✅    |      |

## 相关链接

无

## 常见问题

无
