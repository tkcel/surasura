#!/usr/bin/env node

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");

const version = process.argv[2];

if (!version) {
  console.error("Usage: pnpm bump <version>");
  console.error("Example: pnpm bump 0.2.3");
  process.exit(1);
}

// Validate version format
if (!/^\d+\.\d+\.\d+$/.test(version)) {
  console.error("Error: Version must be in format x.y.z (e.g., 0.2.3)");
  process.exit(1);
}

console.log(`Bumping version to ${version}...\n`);

// 1. Update apps/desktop/package.json
const desktopPackagePath = join(rootDir, "apps/desktop/package.json");
const desktopPackage = JSON.parse(readFileSync(desktopPackagePath, "utf-8"));
const oldDesktopVersion = desktopPackage.version;
desktopPackage.version = version;
writeFileSync(desktopPackagePath, JSON.stringify(desktopPackage, null, 2) + "\n");
console.log(`✓ apps/desktop/package.json: ${oldDesktopVersion} → ${version}`);

// 2. Update apps/www/src/constants/release.ts
const releaseTsPath = join(rootDir, "apps/www/src/constants/release.ts");
let releaseTs = readFileSync(releaseTsPath, "utf-8");
const oldVersionMatch = releaseTs.match(/RELEASE_VERSION = "([^"]+)"/);
const oldReleaseVersion = oldVersionMatch ? oldVersionMatch[1] : "unknown";
releaseTs = releaseTs.replace(
  /RELEASE_VERSION = "[^"]+"/,
  `RELEASE_VERSION = "${version}"`
);
writeFileSync(releaseTsPath, releaseTs);
console.log(`✓ apps/www/src/constants/release.ts: ${oldReleaseVersion} → ${version}`);

console.log(`\nVersion bumped to ${version} successfully!`);
console.log("\nNext steps:");
console.log(`  1. Commit the changes: git add -A && git commit -m "chore: release v${version}"`);
console.log(`  2. Create a tag: git tag v${version}`);
console.log(`  3. Push: git push && git push --tags`);
