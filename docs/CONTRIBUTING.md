# 贡献指南

## 开发和构建指南

在开始前，请确认 [Node.js](https://nodejs.org/) v18 及以上版本已安装。同时，你还需要安装 [Git](https://git-scm.com/) 程序。

```bash
# Clone 本仓库到本地
# 若希望向本仓库提交代码，请 fork 本仓库，并将 forked repo clone 到本地。
git clone https://github.com/northword/zotero-format-metadata.git
cd zotero-format-metadata/

# 安装依赖
npm install -g pnpm
pnpm install

# 配置 Zotero 路径和 Profile 路径
cp .env.example .env
vi .env
```

```ini
# The path of the Zotero binary file.
# The path delimiter should be escaped as `\\` for win32.
# The path is `*/Zotero.app/Contents/MacOS/zotero` for MacOS.
ZOTERO_PLUGIN_ZOTERO_BIN_PATH = /path/to/zotero.exe

# The path of the profile used for development.
# Start the profile manager by `/path/to/zotero.exe -p` to create a profile for development.
# @see https://www.zotero.org/support/kb/profile_directory
ZOTERO_PLUGIN_PROFILE_PATH = /path/to/profile
```

至此，开发环境配置完毕，你可以通过以下脚本开始开发：

```bash
# 启动开发服务器
pnpm start

# 构建
# 构建后的插件位于 build/ 目录
pnpm run build
```

本插件以 [windingwind/zotero-plugin-template](https://github.com/windingwind/zotero-plugin-template) 为模板，使用了 [zotero-plugin-toolkit](https://github.com/windingwind/zotero-plugin-toolkit) 封装的诸多功能，更多信息请前往对应仓库查阅文档。

推荐使用 [VS Code](https://code.visualstudio.com/) 作为代码编辑器，并安装 [.vscode/extensions.json](../.vscode/extensions.json) 中推荐的插件。
