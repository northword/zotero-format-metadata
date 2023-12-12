# 贡献指南

## 开发和构建指南

在开始前，请确认 [Node.js](https://nodejs.org/) v18 及以上版本已安装。同时，你还需要安装 [Git](https://git-scm.com/) 程序。

```bash
# Clone 本仓库到本地
# 若希望向本仓库提交代码，请 fork 本仓库，并将 forked repo clone 到本地。
git clone https://github.com/northword/zotero-format-metadata.git
cd zotero-format-metadata/

# 安装依赖
npm install

# 配置 Zotero 路径和 Profile 路径
cd scripts/
cp zotero-cmd-default.json zotero-cmd.json
vi zotero-cmd.json
```

```json5
{
  usage: "Copy and rename this file to zotero-cmd.json. Edit the cmd.",
  killZoteroWindows: "taskkill /f /im zotero.exe",
  killZoteroUnix: "kill -9 $(ps -x | grep zotero)",
  exec: {
    // 在这里输入 Zotero 可执行文件的路径。对于 Windows 用户，`\` 需要转义为 `\\`。
    zoteroBinPath: "/path/to/zotero.exe",

    // 在这里输入用于开发的 Profile 的路径。
    // `/path/to/zotero.exe -p` 可以启动 Profile 管理器，以创建新的 Profile。
    profilePath: "/path/to/profile",

    // 可选的修改项，请跟随 zotero-cmd-default.json 中的注释修改。
    dataDir: "",
  },
}
```

至此，开发环境配置完毕，你可以通过以下脚本开始开发：

```bash
# 启动开发服务器
npm start

# 构建
# 构建后的插件位于 build/ 目录
npm run build
```

本插件以 [windingwind/zotero-plugin-template](https://github.com/windingwind/zotero-plugin-template) 为模板，使用了 [zotero-plugin-toolkit](https://github.com/windingwind/zotero-plugin-toolkit) 封装的诸多功能，更多信息请前往对应仓库查阅文档。

推荐使用 [VS Code](https://code.visualstudio.com/) 作为代码编辑器，并安装 [.vscode/extensions.json](../.vscode/extensions.json) 中推荐的插件。
