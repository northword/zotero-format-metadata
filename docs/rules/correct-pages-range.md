# 页码范围补全

## 描述

Pages should include both starting and ending page numbers, not just the starting page number.

This rule retrieves the total number of pages from the PDF of this item and automatically fills the field.

## 示例

```diff json
{
  "pages": "123"
}
{
  "pages": "123-145"
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
