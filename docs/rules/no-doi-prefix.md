# DOI URL 前缀移除

## 描述

Removes URL prefixes like `https://doi.org/` and stores only the DOI string.

## 示例

```diff json
{
  "DOI": "https://doi.org/10.1016/j.example"
}
{
  "DOI": "10.1016/j.example"
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
