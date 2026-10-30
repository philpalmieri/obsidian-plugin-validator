# Changelog

## 1.0.7

- Update ESLint, TypeScript ESLint, and the Obsidian ESLint plugin.
- Fix vulnerable brace-expansion, fast-uri, and Moment dependencies. Bundle the
  patched Obsidian ESLint plugin dependency tree so the fix reaches CLI consumers.
- Fix syntax-only linting to disable Obsidian rules requiring type information,
  while retaining the regex-lookbehind and static-styles checks.
- Correct the Node.js engine range to match ESLint's existing requirements:
  `^20.19.0 || ^22.13.0 || >=24`.
- Add CI tests across supported Node.js runtimes, dependency auditing, a packed
  installation smoke test, and scheduled Dependabot updates.
- Update and pin GitHub Actions. Audit and test the packed CLI before publishing;
  publish prereleases to `next` instead of `latest`.

## 1.0.2

- First release published to npm (bootstrap publish, unsigned). Publishing the
  package under this name is what lets npm trusted publishing be configured for
  all later releases.
- Run it with no install: `npx obsidian-plugin-validator <path-to-plugin>`.
- Packaging: added repository/homepage/bugs metadata, a `files` allowlist, and
  `publishConfig` for public access + provenance.
- CI: publish workflow using npm trusted publishing (OIDC), triggered on GitHub
  releases, with a tag/version guard. Releases from 1.0.3 onward are signed with
  build provenance on GitHub Actions.

## 1.0.0

- Initial release: local Obsidian community-plugin review checks.
- Manifest and submission checks: validates `manifest.json` against the submission
  requirements, confirms `versions.json` has the current version, checks for
  `README.md` and `LICENSE`.
- ESLint using the official `eslint-plugin-obsidianmd` recommended (type-aware) ruleset.
- CLI flags: `--src`, `--no-lint`, `--fix`, `--no-typed`, `--tsconfig`, `--help`.
