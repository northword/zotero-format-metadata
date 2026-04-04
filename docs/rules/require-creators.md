# 作者信息检查

## 描述

For `journalArticle`, authors must exist.
If missing, they are retrieved via DOI or title; otherwise, an error is shown.

## 示例

```diff json
{
  "itemType": "journalArticle",
  "creators": []
}
{
  "itemType": "journalArticle",
  "creators": [
    {
      "firstName": "John",
      "lastName": "Doe"
    }
  ]
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
