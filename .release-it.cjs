module.exports = {
  git: {
    /* eslint-disable no-template-curly-in-string */
    commitMessage: "chore(publish): release v${version}",
    tagName: "v${version}",
  },
  npm: {
    publish: false,
  },
  github: {
    release: false,
    assets: ["build/*.xpi", "build/update.json"],
    releaseNotes(context) {
      // console.log(context);
      let notes = `## What's changed  \n\n`;
      notes += `${context.changelog}  \n\n`;
      notes += `## Notes  \n\n`;
      notes += `Full Changelog: [${context.secondLatestTag}...${context.latestTag}](https://github.com/northword/zotero-format-metadata/compare/${context.secondLatestTag}...${context.latestTag}).  \n\n`;
      notes += `Historical Changelog: [CHANGELOG.md](https://github.com/northword/zotero-format-metadata/blob/main/CHANGELOG.md).  \n\n`;
      notes += `![GitHub release (by tag)](https://img.shields.io/github/downloads/${context.repo.repository}/${context.tagName}/total)  \n\n`;
      return notes;
    },
  },
  hooks: {
    "bfore:init": "pnpm lint",
    "after:bump": "pnpm build",
  },
  plugins: {
    "@release-it/keep-a-changelog": {
      filename: "CHANGELOG.md",
      addUnreleased: true,
      addVersionUrl: true,
    },
  },
};
