// Flat ESLint config factory used by the checker to lint a plugin's source with
// the official eslint-plugin-obsidianmd recommended ruleset. Exported so authors
// can also drop it straight into their own eslint.config.mjs if they prefer.
//
//   import { obsidianConfig } from "../lib/eslint-config.mjs";
//   export default obsidianConfig();
//
// Pass { typed: true, tsconfig: "./tsconfig.json" } to enable type-aware linting
// (needed only by a handful of rules; off by default so it runs on any repo).
import tsparser from "@typescript-eslint/parser";
import obsidianmd from "eslint-plugin-obsidianmd";

export function obsidianConfig({ typed = false, tsconfig = "./tsconfig.json", ignores } = {}) {
  const parserOptions = { sourceType: "module", ecmaVersion: "latest" };
  if (typed) parserOptions.project = tsconfig;

  return [
    ...obsidianmd.configs.recommended,
    {
      files: ["**/*.ts"],
      languageOptions: { parser: tsparser, parserOptions },
    },
    { ignores: ignores ?? ["main.js", "node_modules/", "esbuild.config.mjs", "**/*.d.ts"] },
  ];
}

export default obsidianConfig;
