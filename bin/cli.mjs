#!/usr/bin/env node
// obsidian-plugin-validater: run Obsidian's community-plugin review checks locally.
//
// Usage:
//   node bin/cli.mjs [path-to-plugin]   (defaults to current directory)
//
// Options:
//   --src <dir>     source folder to lint (default: src)
//   --no-lint       skip the ESLint pass, run manifest/file checks only
//   --fix           apply ESLint autofixes where possible
//   --typed         enable type-aware linting (uses <plugin>/tsconfig.json)
//   --tsconfig <p>  tsconfig path for --typed (default: ./tsconfig.json)
//   -h, --help      show this help
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { checkManifest } from "../lib/check-manifest.mjs";
import { obsidianConfig } from "../lib/eslint-config.mjs";

const RESET = "\x1b[0m";
const RED = (s) => `\x1b[31m${s}${RESET}`;
const GREEN = (s) => `\x1b[32m${s}${RESET}`;
const YELLOW = (s) => `\x1b[33m${s}${RESET}`;
const DIM = (s) => `\x1b[2m${s}${RESET}`;

function parseArgs(argv) {
  const opts = { dir: ".", src: "src", lint: true, fix: false, typed: false, tsconfig: "./tsconfig.json" };
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "-h" || a === "--help") opts.help = true;
    else if (a === "--no-lint") opts.lint = false;
    else if (a === "--fix") opts.fix = true;
    else if (a === "--typed") opts.typed = true;
    else if (a === "--src") opts.src = argv[++i];
    else if (a === "--tsconfig") opts.tsconfig = argv[++i];
    else if (a.startsWith("--")) {
      console.error(RED(`Unknown option: ${a}`));
      process.exit(2);
    } else positional.push(a);
  }
  if (positional[0]) opts.dir = positional[0];
  return opts;
}

const HELP = `obsidian-plugin-validater - run Obsidian community-plugin review checks locally

Usage:
  node bin/cli.mjs [path-to-plugin] [options]

Options:
  --src <dir>     source folder to lint (default: src)
  --no-lint       skip the ESLint pass, run manifest/file checks only
  --fix           apply ESLint autofixes where possible
  --typed         enable type-aware linting (uses <plugin>/tsconfig.json)
  --tsconfig <p>  tsconfig path for --typed (default: ./tsconfig.json)
  -h, --help      show this help
`;

async function runLint(dir, srcDir, { fix, typed, tsconfig }) {
  const { ESLint } = await import("eslint");
  const eslint = new ESLint({
    cwd: resolve(dir),
    overrideConfigFile: true,
    baseConfig: obsidianConfig({ typed, tsconfig }),
    fix,
  });

  const results = await eslint.lintFiles([`${srcDir}/**/*.ts`]);
  if (fix) await ESLint.outputFixes(results);

  const formatter = await eslint.loadFormatter("stylish");
  const output = await formatter.format(results);

  let errorCount = 0;
  let warningCount = 0;
  for (const r of results) {
    errorCount += r.errorCount;
    warningCount += r.warningCount;
  }
  return { output, errorCount, warningCount, fileCount: results.length };
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    console.log(HELP);
    return 0;
  }

  const dir = resolve(opts.dir);
  console.log(`\nChecking Obsidian plugin at ${DIM(dir)}\n`);

  // --- Section 1: manifest / versions / required files ---
  console.log("Manifest & submission checks");
  const { ok, warns, errors, version } = checkManifest(dir);
  for (const m of ok) console.log(`  ${GREEN("ok")}    ${m}`);
  for (const m of warns) console.log(`  ${YELLOW("warn")}  ${m}`);
  for (const m of errors) console.log(`  ${RED("ERROR")} ${m}`);
  if (version)
    console.log(DIM(`\n  Manifest version: ${version} (release tag must equal this exactly, no "v" prefix).`));

  let lintErrors = 0;
  let lintWarnings = 0;

  // --- Section 2: ESLint (eslint-plugin-obsidianmd recommended) ---
  if (opts.lint) {
    const srcPath = join(dir, opts.src);
    if (!existsSync(srcPath)) {
      console.log(`\nESLint (obsidianmd recommended)`);
      console.log(`  ${YELLOW("warn")}  source folder "${opts.src}" not found; skipping lint (use --src)`);
    } else {
      console.log(`\nESLint (obsidianmd recommended) - ${DIM(opts.src + "/**/*.ts")}`);
      try {
        const res = await runLint(dir, opts.src, opts);
        lintErrors = res.errorCount;
        lintWarnings = res.warningCount;
        if (res.output.trim()) console.log(res.output.trimEnd());
        if (lintErrors === 0 && lintWarnings === 0)
          console.log(`  ${GREEN("ok")}    ${res.fileCount} file(s) linted, 0 problems`);
      } catch (e) {
        console.error(`  ${RED("ERROR")} ESLint failed to run: ${e.message}`);
        lintErrors++;
      }
    }
  }

  // --- Summary ---
  const totalErrors = errors.length + lintErrors;
  console.log("\n" + "-".repeat(48));
  const parts = [
    `${totalErrors} error(s)`,
    `${warns.length + lintWarnings} warning(s)`,
  ];
  if (totalErrors === 0) {
    console.log(GREEN(`All checks passed. ${parts.join(", ")}.`));
    return 0;
  }
  console.log(RED(`Checks failed: ${parts.join(", ")}. Fix errors before submitting.`));
  return 1;
}

main().then((code) => process.exit(code)).catch((e) => {
  console.error(e);
  process.exit(1);
});
