module.exports = {
    git: {
        commitMessage: "chore(publish): release v${version}",
        tagName: "v${version}",
    },
    npm: {
        publish: false,
    },
    github: {
        release: true,
        assets: ["build/*.xpi", "update.json"],
        releaseNotes(context) {
            // console.log(context);
            let notes = `${context.changelog}  \n\n`;
            notes += `### Notes  \n\n`;
            notes += `The current version is only compatible with Zotero 7. If your are using Zotero 6, please download the [version 0.4.4](https://github.com/northword/zotero-format-metadata/releases/tag/0.4.4)  \n\n`;
            notes += `Full Changelog: [${context.secondLatestTag}...${context.latestTag}](https://github.com/northword/zotero-format-metadata/compare/${context.secondLatestTag}...${context.latestTag})  \n\n`;
            notes += `Historical Changelog: [CHANGELOG.md](https://github.com/northword/zotero-format-metadata/blob/main/CHANGELOG.md)  \n\n`;
            notes += `![GitHub release (by tag)](https://img.shields.io/github/downloads/${context.repo.repository}/${context.tagName}/total)  \n\n`;
            return notes;
        },
    },
    hooks: {
        "bfore:init": "npm run lint",
        "after:bump": "npm run build",
    },
    plugins: {
        "@release-it/keep-a-changelog": {
            filename: "CHANGELOG.md",
            addUnreleased: true,
            addVersionUrl: true,
        },
    },
};
