// Regression tests for the CLI. These lock in that the validator flags the two
// community-plugin review findings that slipped through a manifest-only check
// (iOS-unsupported regex lookbehinds and direct element.style assignments), and
// that a clean plugin passes. Run: npm test (node --test).
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..");
const cli = join(repoRoot, "bin", "cli.mjs");

// Run the CLI against a fixture. Returns { code, output }; execFileSync throws
// on a non-zero exit, so capture that and read the combined stdio off the error.
function runValidator(fixture, ...args) {
  const fixtureDir = join(here, "fixtures", fixture);
  try {
    const stdout = execFileSync(process.execPath, [cli, fixtureDir, ...args], {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return { code: 0, output: stdout };
  } catch (e) {
    return { code: e.status ?? 1, output: `${e.stdout ?? ""}${e.stderr ?? ""}` };
  }
}

test("flags the two review findings on a bad plugin", () => {
  const { code, output } = runValidator("bad");
  assert.equal(code, 1, "validator should exit non-zero on findings");
  assert.match(
    output,
    /obsidianmd\/regex-lookbehind/,
    "should catch the iOS-unsupported regex lookbehind"
  );
  assert.match(
    output,
    /obsidianmd\/no-static-styles-assignment/,
    "should catch the direct element.style assignment"
  );
  assert.match(output, /Checks failed/);
});

test("passes a clean plugin with no findings", () => {
  const { code, output } = runValidator("clean");
  assert.equal(code, 0, `validator should exit zero on a clean plugin\n${output}`);
  assert.match(output, /All checks passed/);
  assert.doesNotMatch(output, /Checks failed/);
});

test("syntax-only linting passes a clean plugin without type information", () => {
  const { code, output } = runValidator("clean", "--no-typed");
  assert.equal(code, 0, output);
  assert.match(output, /syntax-only/);
  assert.match(output, /All checks passed/);
});

test("syntax-only linting still catches both review findings", () => {
  const { code, output } = runValidator("bad", "--no-typed");
  assert.equal(code, 1, output);
  assert.doesNotMatch(output, /ESLint failed to run/);
  assert.match(output, /obsidianmd\/regex-lookbehind/);
  assert.match(output, /obsidianmd\/no-static-styles-assignment/);
});
