# abbrevIso

Vendored copy of [marcinwrochna/abbrevIso](https://github.com/marcinwrochna/abbrevIso),
a JavaScript library for abbreviating publication titles per the [ISO 4](https://en.wikipedia.org/wiki/ISO_4) standard.

Upstream commit: `52b8309cccddda2204202265c601b0920ac103ce` (2025-07-14, v1.2).
Files `AbbrevIso.js`, `collation.js`, `PrefixTree.js` and `LICENSE` are copied verbatim.
They are bundled by esbuild, so no runtime script loading is needed.

The LTWA data (`ltwa_2024-modified.csv`, `shortwords.txt`) lives in
`data/journal-abbr/issn-ltwa/` and is refreshed by `pnpm update-data`.

## Updating

Copy the upstream `AbbrevIso.js`, `collation.js`, `PrefixTree.js` and `LICENSE`
into this directory, then update the commit hash above. Type declarations for the
public API are in `typings/abbrev-iso.d.ts`.

Upstream is MIT licensed, see [LICENSE](./LICENSE).
