# 期刊预印本误分类检测

## 描述

If the item type is `journalArticle` but the `url` contains `arxiv`, the item is probably a preprint and should be changed to `preprint`.

## 示例

```diff json
{
  "itemType": "journalArticle",
  "url": "https://arxiv.org/abs/1234.5678"
}
{
  "itemType": "preprint",
  "url": "https://arxiv.org/abs/1234.5678"
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
