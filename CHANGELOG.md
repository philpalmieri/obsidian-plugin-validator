# Changelog

## 1.0.1

- First release published to npm with build provenance (signed on GitHub Actions).
- Run it with no install: `npx obsidian-plugin-validator <path-to-plugin>`.
- Packaging: added repository/homepage/bugs metadata, a `files` allowlist, and
  `publishConfig` for public access + provenance.
- CI: publish workflow using npm trusted publishing (OIDC), triggered on GitHub
  releases, with a tag/version guard.

## 1.0.0

- Initial release: local Obsidian community-plugin review checks.
- Manifest and submission checks: validates `manifest.json` against the submission
  requirements, confirms `versions.json` has the current version, checks for
  `README.md` and `LICENSE`.
- ESLint using the official `eslint-plugin-obsidianmd` recommended (type-aware) ruleset.
- CLI flags: `--src`, `--no-lint`, `--fix`, `--no-typed`, `--tsconfig`, `--help`.
