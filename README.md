# obsidian-plugin-validator

[![npm](https://img.shields.io/npm/v/obsidian-plugin-validator)](https://www.npmjs.com/package/obsidian-plugin-validator)

Run Obsidian's community-plugin review checks on your own machine, before you open a submission PR. It replicates the mechanical parts of the review so you can fix problems in seconds instead of waiting on a reviewer round-trip.

It does two things:

1. **Manifest & submission checks** (in Node, no plugin execution): validates `manifest.json` against the [submission requirements](https://docs.obsidian.md/Plugins/Releasing/Submission+requirements+for+plugins) (required/allowed keys, forbidden words, id/version/description format), confirms `versions.json` has an entry for the current version, and checks for `README.md` and `LICENSE`.
2. **ESLint** with the official [`eslint-plugin-obsidianmd`](https://github.com/obsidianmd/eslint-plugin-obsidianmd) recommended ruleset (no `innerHTML`, detach leaves on unload, `Platform` guards for Node APIs, sentence-case UI text, no `console.log`, restricted globals, and more).

## Usage

The fastest way, no install, run it straight from npm against any plugin folder:

```bash
npx obsidian-plugin-validator ~/dev/my-plugin
```

Or from inside your plugin's folder (defaults to the current directory):

```bash
cd ~/dev/my-plugin
npx obsidian-plugin-validator
```

Install it globally if you run it often:

```bash
npm install -g obsidian-plugin-validator
obsidian-plugin-validator ~/dev/my-plugin
```

### From source

```bash
git clone https://github.com/philpalmieri/obsidian-plugin-validator.git
cd obsidian-plugin-validator
npm install
node bin/cli.mjs ~/dev/my-plugin
```

### Options

| Flag | Description |
| --- | --- |
| `--src <dir>` | Source folder to lint (default: `src`) |
| `--no-lint` | Run manifest/file checks only, skip ESLint |
| `--fix` | Apply ESLint autofixes where possible |
| `--no-typed` | Disable type-aware linting (some obsidianmd rules get skipped) |
| `--tsconfig <p>` | tsconfig path for type-aware linting (default: `./tsconfig.json`) |
| `-h`, `--help` | Show help |

The obsidianmd recommended set includes type-aware rules, so linting runs type-aware by default. It uses the plugin's own `tsconfig.json`; if the plugin doesn't have one, a temporary tsconfig is generated for the run and removed afterward.

## Exit codes

- `0` - all checks passed (warnings allowed)
- `1` - one or more errors; fix before submitting
- `2` - bad usage (unknown flag)

Wire it into CI or a pre-release script by relying on the exit code.

## Using the ESLint config directly

If you'd rather run ESLint yourself, reuse the same flat config from your plugin's `eslint.config.mjs`:

```js
// eslint.config.mjs
import { obsidianConfig } from "obsidian-plugin-validator/lib/eslint-config.mjs";

export default obsidianConfig();
// or type-aware: obsidianConfig({ typed: true, tsconfig: "./tsconfig.json" })
```

## What it does not do

This covers the mechanical checks only. A human reviewer still looks at design, security, and whether your plugin does what it claims. Passing locally makes that review faster; it isn't a guarantee of acceptance. See the [full plugin guidelines](https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines).

## License

MIT
