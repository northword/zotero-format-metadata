# 大学所在地补全

## 描述

For `thesis` items, fills in the university’s location automatically (based on built-in data).

This is GB/T 7714-2015 formatting requirements [^gb7714].

[^gb7714]: <http://www.cessp.org.cn/a258.html>

## 示例

```diff json
{
  "itemType": "thesis",
  "university": "Peking University",
  "place": ""
}
{
  "itemType": "thesis",
  "university": "Peking University",
  "place": "Beijing"
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
