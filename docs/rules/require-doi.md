# DOI 字段检查

## 描述

For `journalArticle`, DOI must exist.

If missing, attempt to retrieve it.

## 示例

```diff json
{
  "itemType": "journalArticle",
  "DOI": ""
}
{
  "itemType": "journalArticle",
  "DOI": "10.1016/j.example"
}
```

## 配置选项

无

## 使用方式

| 方式         | 支持？| 备注 |
| ------------ | ----- | ---- |
| Lint and Fix | ✅    |      |
| 菜单         | ❌    | 无   |

## 相关链接

无

## 常见问题

无
