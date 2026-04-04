# 作者名拼音音节分割

## 描述

Converts names such as `Zhang Jianbei` → `Zhang Jian Bei`. This helps generate correct CSL abbreviations (`Zhang J. B.`).

## 示例

```diff json
{
  "creators": [
    {
---   "firstName": "Jianbei",
+++   "firstName": "Jian Bei",
      "lastName": "Zhang"
    }
  ]
}
```

## 配置选项

无

## 使用方式

| 方式         | 支持？ | 备注 |
| ------------ | ------ | ---- |
| Lint and Fix | ✅     |      |
| 菜单         | ❌     | 无   |

## 相关链接

无

## 常见问题

无
