// Flat ESLint config factory used by the checker to lint a plugin's source with
// the official eslint-plugin-obsidianmd recommended ruleset. Exported so authors
// can also drop it straight into their own eslint.config.mjs if they prefer.
//
//   import { obsidianConfig } from "../lib/eslint-config.mjs";
//   export default obsidianConfig();
//
// Pass { typed: true, tsconfig: "./tsconfig.json" } to enable type-aware linting.
// The obsidianmd recommended set includes a few type-aware rules, so the CLI turns
// this on automatically when the plugin has a tsconfig.
import tsparser from "@typescript-eslint/parser";
import obsidianmd from "eslint-plugin-obsidianmd";
import tseslint from "typescript-eslint";

export function obsidianConfig({ typed = false, tsconfig = "./tsconfig.json", ignores } = {}) {
  const parserOptions = { sourceType: "module", ecmaVersion: "latest" };
  if (typed) {
    parserOptions.project = tsconfig;
    parserOptions.tsconfigRootDir = process.cwd();
  }

  // The obsidianmd recommended set pulls in some type-aware rules. Without a
  // tsconfig those rules crash, so turn them off when running syntax-only.
  const disableTyped = typed ? [] : [tseslint.configs.disableTypeChecked].flat();

  return [
    ...obsidianmd.configs.recommended,
    {
      files: ["**/*.ts"],
      languageOptions: { parser: tsparser, parserOptions },
    },
    ...disableTyped,
    { ignores: ignores ?? ["main.js", "node_modules/", "esbuild.config.mjs", "**/*.d.ts"] },
  ];
}

export default obsidianConfig;
