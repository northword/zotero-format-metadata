# 页码连接符规范化

## 描述

Replaces invalid connectors like `~` or `+` with `-` or `,`.

## 示例

```diff json
{
  "pages": "1~10"
}
{
  "pages": "1-10"
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
