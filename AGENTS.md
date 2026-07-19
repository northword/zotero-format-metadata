# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

## Overview

"Linter for Zotero" (package name `zotero-format-metadata`) is a Zotero plugin that validates and formats item metadata. It is built on the [zotero-plugin-template](https://github.com/windingwind/zotero-plugin-template) and [zotero-plugin-scaffold](https://github.com/northword/zotero-plugin-scaffold) toolchain, and bundled with esbuild into an ESM script loaded by Zotero (a Firefox/Gecko `firefox115` runtime — not Node).

Target: Zotero 8 & 9. Package manager: **pnpm** (v11). Node v22+ required for development.

## Commands

```bash
pnpm install              # install deps (also installs husky via prepare)
cp .env.example .env      # then set ZOTERO_PLUGIN_ZOTERO_BIN_PATH / ZOTERO_PLUGIN_PROFILE_PATH

pnpm start                # zotero-plugin serve — build + launch Zotero with hot reload
pnpm build                # zotero-plugin build + tsc --noEmit; output in .scaffold/build/
pnpm lint:check           # eslint . && autocorrect --lint
pnpm lint:fix            # eslint . --fix && autocorrect --fix

pnpm test                 # unit (vitest) then e2e (zotero-plugin test)
pnpm test:unit            # Run vitest unit tests (files matching **/*.test.ts)
pnpm test:e2e             # Run e2e tests inside a real Zotero instance (test/tests/*.spec.ts)
pnpm coverage             # vitest run --coverage (covers src/modules/rules/*.ts)

pnpm update-data          # refresh built-in journal-abbr / related data (git submodule + Python)
pnpm release              # zotero-plugin release (version bump + GitHub release in CI)
```

Run a single unit test: `pnpm exec vitest run src/modules/rules/no-extra-zeros.test.ts` (or `vitest -t "<test name>"`).

Before running `pnpm start`, copy `.env.example` to `.env` and set `ZOTERO_PLUGIN_ZOTERO_BIN_PATH` and `ZOTERO_PLUGIN_PROFILE_PATH`. On Windows escape path separators with `\\`.

Two test tiers exist because plugin code depends on the Zotero global runtime:

- **Unit tests** (`*.test.ts`, vitest) — for pure logic that does not touch the `Zotero` global (e.g. string/pinyin/numeral helpers).
- **E2E tests** (`test/tests/*.spec.ts`, mocha+chai driven by `zotero-plugin test`) — run inside a live Zotero.

## Architecture

### Lifecycle: Bootstrap → sandbox globals → hooks

1. `addon/bootstrap.js` is the XPCOM bootstrap. On startup it loads the bundled script `content/scripts/linter.js` (from `src/index.ts` via esbuild) into a sandbox `ctx` that also acts as `_globalThis`.
2. `src/index.ts` bootstraps globals (`Zotero`, `ztoolkit`, `addon`) and instantiates the `Addon` class (`src/addon.ts`), which holds shared `data` and the singleton `LintRunner`.
3. `src/hooks.ts` implements Zotero lifecycle hooks (`onStartup`, `onMainWindowLoad`, `onNotify`, `onShortcuts`, `onLintInBatch`, etc.). `onNotify` auto-lints newly added items when pref `lint.onAdded` is set.
4. `src/addon.ts` holds shared `data` (config, env, ztoolkit, locale, prefs window, dialogs), lifecycle `hooks`, small public `api`, and the `LintRunner`.
5. UI registration is split across `src/modules/`: `menu.ts` (context menus), `item-tree.ts` (extra columns), `rich-text.ts` (title rich-text toolbar), `preference.ts`, `shortcuts.ts`, `notifier.ts`.
6. Reused browser/Zotero globals (`Zotero`, `ztoolkit`, `rootURI`, `__env__`, `_globalThis`) are ambient — see `typings/`.

Prefer changing behavior through rules/runner/hooks rather than bootstrap.

### Rule system (the core abstraction)

Everything the plugin does is expressed as a **Rule**. Rules live in `src/modules/rules/` and are defined with `defineRule()` from `rule-base.ts`. A rule declares:

- `id` — kebab-case, following `<category>-<target>-<attribute>` (see CONTRIBUTING.md for the naming taxonomy). `category` ∈ `no` | `require` | `correct` | `tool`.
- `scope` — `"item"` (operates on whole item) or `"field"` (operates on one field; requires `targetItemField`). `"tag"`/`"attachment"` are declared but unimplemented.
- `category`: `"rule"` (default) or `"tool"`. `category: "tool"` rules are user-invoked utilities (never auto-run); standard rules are toggleable via preferences and can run automatically.
- `targetItemTypes` / `ignoreItemTypes` — restrict which Zotero item types the rule applies to.
- `apply({ item, options, debug, report })` — the handler. Mutate the item with `item.setField(...)`; the runner calls `item.saveTx()` once after all rules run. Call `report({ level, message, action })` to surface a finding in the results dialog.
- `prepare({ items, debug })` — optional; runs once before the batch, returns `options` passed to every `apply` call. Returning `false` skips the rule entirely (used e.g. to abort when a dialog is cancelled).
- `cooldown` — min ms between executions; `defineRule` wraps `apply` in `withThrottle` to rate-limit external API calls.

### Rule registration

`src/modules/rules/index.ts` holds the `register` array — **order in this array is execution order**. The `Rules` class exposes `getAll()`, `getStandard()` (non-tool), `getEnabledStandard()` (filtered by `getPref('rule.${id}')`), `getTool()`, `getByID()`, `getByType()`. To add a rule: copy `_template.ts`, implement it, import + add it to `register` at the correct position, then add prefs in `addon/prefs.js` and l10n in `addon/locale/**/rules.ftl` as needed.

Rule IDs are the source of truth for the `ID` type: `zotero-plugin.config.ts`'s `build:bundle` hook imports the registered rules and generates `typings/rules.d.ts` (an `ID` union of all rule ids) at build time. New rules won't be in the `ID` type until a build regenerates that file (`defineRule` accepts a `string` id to suppress the type error meanwhile).

### Runner

`src/modules/runner.ts` (`LintRunner`) orchestrates a batch. It:

1. Calls each rule's `prepare` to build an `optionsMap`.
2. Enqueues items into Zotero's `ConcurrentCaller` (concurrency from pref `lint.numConcurrent`).
3. For each item, iterates rules, skipping via `shouldApplyRule` (item-type + field-validity checks), wraps each `apply` in a 60s timeout, collects errors without aborting sibling rules, then `saveTx()`.
4. Aggregates results into a report shown via `reporter.ts` (`ProgressUI` + results dialog).

Entry points into a batch run go through `addon.hooks.onLintInBatch(ruleIDs, items)` in `hooks.ts`.

### Metadata update services

`src/modules/rules/tool-update-metadata/` implements metadata fetching from external APIs (CrossRef via translate, Semantic Scholar, arXiv). Each API is a `MetadataService` (`services/base-service.ts`, defined with `defineService`) with `shouldApply` / `updateIdentifiers` / `fetch` / `transform` methods. This is a mini-plugin architecture nested inside the rule system.

### Built-in data

Large reference datasets (journal abbreviations, conference abbreviations, university→place map, ISO language maps) live in `data/` and are bundled as assets (see `zotero-plugin.config.ts` `build.assets`). At runtime they are loaded lazily and cached via `src/utils/data-loader.ts` (`DataLoader.load(key, ...)`), resolving paths under `${rootURI}data/...`. The cache is cleared after each batch run. Regenerate these files with `pnpm update-data`, not by hand.

## Conventions

- ESLint config is `@antfu/eslint-config` + `@zotero-plugin/eslint-config` (double quotes, semicolons — see `eslint.config.mjs`). `autocorrect` fixes CJK/Latin spacing in text. Both run on staged files via husky + lint-staged.
- Preference keys follow `rule.${id}.option-name`; read with `getPref` from `src/utils/prefs.ts`.
- Fluent (l10n) message IDs: rule name `rule-${id}`, option `rule-${id}-option-${name}`, menu items `rule-${id}-menu-item` / `rule-${id}-menu-field`. Files in `addon/locale/{en-US,zh-CN}/`.
- Commits: Conventional Commits (e.g. `feat:`, `fix:`, `chore(deps):`,
  `refactor:`, `ci:`). Scopes are used (e.g. `fix(notify):`).
- Some source comments and commit history are in Chinese; keep new user-facing strings in the l10n files rather than hardcoding.
- Try not to remove the existing comments; only add comments that you truly believe are necessary for clarification.
- Reduce the use of defensive code, and only use `try` blocks when absolutely necessary.
