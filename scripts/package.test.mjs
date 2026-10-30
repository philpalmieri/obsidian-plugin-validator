import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

test("packed CLI installs without vulnerabilities and validates plugins", () => {
  const tempDir = mkdtempSync(join(tmpdir(), "opv-package-"));
  const consumerDir = join(tempDir, "consumer");
  const npm = (args) => {
    const result = spawnSync("npm", args, {
      cwd: repoRoot,
      encoding: "utf8",
      timeout: 120_000,
      maxBuffer: 16 * 1024 * 1024,
    });
    if (result.error) throw result.error;
    assert.equal(result.status, 0, `npm ${args.join(" ")}\n${result.stdout}${result.stderr}`);
    return result.stdout;
  };

  try {
    const [packed] = Object.values(JSON.parse(npm(["pack", "--json", "--pack-destination", tempDir])));
    assert.ok(
      packed.bundled.includes("eslint-plugin-obsidianmd"),
      "the published package must bundle the patched Obsidian ESLint dependency tree"
    );
    npm([
      "install", "--prefix", consumerDir, "--no-fund", "--no-audit",
      join(tempDir, packed.filename),
    ]);
    npm(["audit", "--prefix", consumerDir, "--audit-level=low"]);

    const cli = join(consumerDir, "node_modules", "obsidian-plugin-validator", "bin", "cli.mjs");
    for (const [fixture, expectedCode] of [["clean", 0], ["bad", 1]]) {
      const result = spawnSync(process.execPath, [cli, join(repoRoot, "test", "fixtures", fixture)], {
        cwd: consumerDir,
        encoding: "utf8",
        timeout: 30_000,
      });
      if (result.error) throw result.error;
      const output = `${result.stdout}${result.stderr}`;
      assert.equal(result.status, expectedCode, output);
      if (fixture === "clean") {
        assert.match(output, /All checks passed/);
      } else {
        assert.match(output, /obsidianmd\/regex-lookbehind/);
        assert.match(output, /obsidianmd\/no-static-styles-assignment/);
      }
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});
