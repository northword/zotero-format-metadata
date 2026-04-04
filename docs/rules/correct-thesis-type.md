# 学位类型规范化

## 描述

Ensures full dissertation type names are set: `硕士学位论文`, `博士学位论文`, `Master thesis`, or `Doctoral dissertation`.

## 示例

```diff json
{
  "itemType": "thesis",
  "thesisType": "硕士"
}
{
  "itemType": "thesis",
  "thesisType": "硕士学位论文"
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
