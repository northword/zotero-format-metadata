# 版次数字规范化

## 描述

Automatically normalizes the `edition` and `volume` field for books:

- Converts English ordinal words, numeric ordinals, Roman numerals, and Chinese ordinals to numbers.
- Converts incomplete names to full forms (`修订` → `修订版`, `Revised` → `Revised Edition`).
- Removes trailing `"ed."` or `"edition"`.

## 示例

```diff json
{
  "edition": "first edition"
}
{
  "edition": "1"
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
