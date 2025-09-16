# Contribution Guide

## Directory Structure

```bash
.
|-- addon
|   |-- content
|   |-- lib
|   `-- locale                 # Localization files
|       |-- en-US
|       `-- zh-CN
|-- data                       # Built-in data directory
|   |-- journal-abbr
|   |   |-- abbrv.jabref.org
|   |   |-- endnote
|   |   `-- issn-ltwa
|   `-- university-list
|-- docs                       # Documentation
|-- src                        # Source code
|   |-- modules
|   |   `-- rules              ## Rules directory
|   `-- utils
|-- test                       # End-to-end test code
`-- typings                    # Global type declarations
```

## Development and Build Guide

Before you start, make sure [Node.js](https://nodejs.org/) v22 or later is installed.
You also need [Git](https://git-scm.com/).

```bash
# Clone this repository locally
# If you plan to contribute, fork the repository and clone your fork instead.
git clone https://github.com/northword/zotero-format-metadata.git
cd zotero-format-metadata/

# Install dependencies
npm install -g pnpm
pnpm install

# Configure Zotero binary and profile paths
cp .env.example .env
vi .env
```

```ini
# The path of the Zotero binary file.
# On Windows, escape path delimiters with `\\`.
# On MacOS, the path is `*/Zotero.app/Contents/MacOS/zotero`.
ZOTERO_PLUGIN_ZOTERO_BIN_PATH = /path/to/zotero.exe

# The path of the profile used for development.
# Launch the profile manager with `/path/to/zotero.exe -p`
# to create a profile for development.
# @see https://www.zotero.org/support/kb/profile_directory
ZOTERO_PLUGIN_PROFILE_PATH = /path/to/profile
```

At this point, the development environment is set up. You can start development with:

```bash
# Start the development server
pnpm start

# Build
# The built plugin will be located in the .scaffold/build/ directory
pnpm run build
```

This plugin is based on [windingwind/zotero-plugin-template](https://github.com/windingwind/zotero-plugin-template) and uses [zotero-plugin-toolkit](https://github.com/windingwind/zotero-plugin-toolkit) for many features. Check their repositories for more documentation.

We recommend using [VS Code](https://code.visualstudio.com/) as your editor, and installing the extensions listed in [.vscode/extensions.json](../.vscode/extensions.json).

## Updating Built-in Data

Built-in data is located in the `data` directory. Please update it according to the respective formats.

## Adding a New Rule

### Steps

1. Copy `src/modules/rules/_template.ts` to `${id}.ts`.
2. Implement the rule in `${id}.ts`.
3. Add `${id}.ts` to `src/modules/rules/index.ts`.
   Note: the order in `register` determines execution order.
4. Add default preference values in `addon/prefs.js` if needed.
5. Add i10n text in `addon/locale/**/rules.ftl` if needed.

### Rule Naming

All rule IDs must use **kebab-case**, following this convention:

```plain
<category>-<target>-<attribute>
```

- `category` describes the rule behavior:
  - `no`: prohibition rules – check and forbid invalid content
  - `require`: requirement rules – enforce values to exist or match conditions
  - `correct`: correction rules – fix field values or formats
  - `tool`: tool rules – provide user utilities, beyond validation or correction

- `target` describes the object of the rule:
  - `item`: the item itself (e.g., duplicates)
  - `itemType`: a specific item type (e.g., wrong type)
  - `itemField`: a specific field
  - `value`: multiple fields

- `attribute` describes the constraint:
  - an error type (e.g., duplicate)
  - a format or condition (e.g., sentence case)
  - a syntax or object (e.g., quotation marks)

Distinguishing `require` vs `correct`:

- `require` → checks **existence** and validity; may fetch a value if missing.
- `correct` → only ensures **validity**, not existence; typically formatting or punctuation fixes.

### Preference Key Naming

Preference keys must follow this pattern:

```plain
rule.${id}.option-name
```

### i10n

Fluent message IDs must follow these rules:

- Rule name: `rule-${id}`.
  Put the text in `.label` since only `preference.xhtml` uses rule names.
- Rule option: `rule-${id}-option-${option-name}`.
  Provide content according to the option’s UI element.
- Context menu item (library item): `rule-${id}-menu-item`.
  Keep it short and descriptive.
- Context menu item (sidebar field): `rule-${id}-menu-field`.
  Keep it concise and append `(Linter)`.
