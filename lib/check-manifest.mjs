// Mechanical replica of the Obsidian community-plugin review checks that can be
// verified without running the plugin. Mirrors the eslint-plugin-obsidianmd
// `validate-manifest` rule plus the submission-docs requirements, so authors
// catch problems before opening a submission PR.
//
// Exports checkManifest(dir) -> { ok: string[], warns: string[], errors: string[], version }
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const REQUIRED = [
  "id",
  "name",
  "version",
  "minAppVersion",
  "description",
  "author",
  "isDesktopOnly",
];
const ALLOWED = new Set([...REQUIRED, "authorUrl", "fundingUrl"]);

export function checkManifest(dir = ".") {
  const errors = [];
  const warns = [];
  const ok = [];
  const read = (p) => JSON.parse(readFileSync(join(dir, p), "utf8"));
  const has = (p) => existsSync(join(dir, p));

  if (!has("manifest.json")) {
    errors.push("manifest.json not found (run this from your plugin's root, or pass its path)");
    return { ok, warns, errors, version: undefined };
  }

  let manifest;
  try {
    manifest = read("manifest.json");
  } catch (e) {
    errors.push(`manifest.json is not valid JSON: ${e.message}`);
    return { ok, warns, errors, version: undefined };
  }

  // Required + allowed keys.
  for (const k of REQUIRED) {
    if (!(k in manifest)) errors.push(`manifest: missing required key "${k}"`);
  }
  for (const k of Object.keys(manifest)) {
    if (!ALLOWED.has(k)) errors.push(`manifest: disallowed key "${k}"`);
  }

  // Forbidden words in id / name / description.
  for (const k of ["id", "name", "description"]) {
    const v = String(manifest[k] ?? "");
    if (/obsidian/i.test(v)) errors.push(`manifest.${k} must not contain "obsidian"`);
    if (/plugin/i.test(v)) errors.push(`manifest.${k} must not contain "plugin"`);
  }

  // id: lowercase letters/numbers/hyphens, must not end with "plugin".
  if (manifest.id && !/^[a-z0-9-]+$/.test(manifest.id))
    errors.push(`manifest.id "${manifest.id}" must be lowercase letters/numbers/hyphens only`);
  if (manifest.id && manifest.id.endsWith("plugin"))
    errors.push(`manifest.id must not end with "plugin"`);

  // version: semver x.y.z
  if (manifest.version && !/^\d+\.\d+\.\d+$/.test(manifest.version))
    errors.push(`manifest.version "${manifest.version}" must be x.y.z`);

  // description: 10-250 chars, starts capital, ends ".", limited charset.
  const d = String(manifest.description ?? "");
  if (d.length < 10 || d.length > 250)
    errors.push(`manifest.description length ${d.length} not in 10-250`);
  if (!/^[A-Z]/.test(d)) errors.push(`manifest.description must start with a capital letter`);
  if (!d.endsWith(".")) errors.push(`manifest.description must end with "."`);
  if (/[^A-Za-z0-9\s.,!?'"-]/.test(d))
    errors.push(`manifest.description has disallowed characters (emoji/special)`);

  // isDesktopOnly must be boolean.
  if (typeof manifest.isDesktopOnly !== "boolean")
    errors.push(`manifest.isDesktopOnly must be a boolean`);

  // fundingUrl (optional) must not be empty.
  if ("fundingUrl" in manifest) {
    const f = manifest.fundingUrl;
    if (f === "" || (typeof f === "object" && f && Object.keys(f).length === 0))
      errors.push(`manifest.fundingUrl must not be empty (remove it if unused)`);
  }

  if (errors.length === 0) ok.push("manifest.json fields valid");

  // versions.json contains the current version.
  if (!has("versions.json")) {
    warns.push("versions.json missing (needed so older Obsidian versions resolve a compatible release)");
  } else {
    try {
      const versions = read("versions.json");
      if (manifest.version && !(manifest.version in versions))
        errors.push(`versions.json missing entry for "${manifest.version}" -> minAppVersion`);
      else if (manifest.version)
        ok.push(`versions.json maps ${manifest.version} -> ${versions[manifest.version]}`);
    } catch (e) {
      errors.push(`versions.json is not valid JSON: ${e.message}`);
    }
  }

  // Required repo files.
  for (const f of ["README.md", "LICENSE"]) {
    if (!has(f)) errors.push(`missing required file: ${f}`);
  }
  if (has("README.md") && has("LICENSE")) ok.push("README.md and LICENSE present");

  return { ok, warns, errors, version: manifest.version };
}
