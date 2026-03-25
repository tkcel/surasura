#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

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

const tag = `v${version}`;

// Check if tag already exists
try {
  execSync(`git rev-parse ${tag}`, { cwd: rootDir, stdio: "pipe" });
  console.error(`\n❌ Error: Tag ${tag} already exists.`);
  console.error(`   Use a different version number.`);
  process.exit(1);
} catch {
  // Tag doesn't exist, continue
}

// Check release notes exist
const releaseNotePath = join(rootDir, `apps/www/src/content/releases/v${version}.md`);
if (!existsSync(releaseNotePath)) {
  console.error(`\n❌ Error: Release notes not found: v${version}.md`);
  console.error(`   Run "/generate-release-notes ${version}" skill first.`);
  process.exit(1);
}

// Read release notes summary from frontmatter
const releaseNoteContent = readFileSync(releaseNotePath, "utf-8");
const summaryMatch = releaseNoteContent.match(/^summary:\s*"(.+)"$/m);
const releaseSummary = summaryMatch ? summaryMatch[1] : "";

console.log(`\n📦 Bumping version to ${version}...\n`);
if (releaseSummary) {
  console.log(`  📝 Release summary: ${releaseSummary}\n`);
}

let hasChanges = false;

// 1. Update apps/desktop/package.json
const desktopPackagePath = join(rootDir, "apps/desktop/package.json");
const desktopPackage = JSON.parse(readFileSync(desktopPackagePath, "utf-8"));
const oldDesktopVersion = desktopPackage.version;
if (oldDesktopVersion !== version) {
  desktopPackage.version = version;
  writeFileSync(desktopPackagePath, JSON.stringify(desktopPackage, null, 2) + "\n");
  console.log(`  ✓ apps/desktop/package.json: ${oldDesktopVersion} → ${version}`);
  hasChanges = true;
} else {
  console.log(`  - apps/desktop/package.json: already ${version}`);
}

// 2. Update apps/www/src/constants/release.ts
const releaseTsPath = join(rootDir, "apps/www/src/constants/release.ts");
let releaseTs = readFileSync(releaseTsPath, "utf-8");
const oldVersionMatch = releaseTs.match(/RELEASE_VERSION = "([^"]+)"/);
const oldReleaseVersion = oldVersionMatch ? oldVersionMatch[1] : "unknown";
if (oldReleaseVersion !== version) {
  releaseTs = releaseTs.replace(
    /RELEASE_VERSION = "[^"]+"/,
    `RELEASE_VERSION = "${version}"`
  );
  writeFileSync(releaseTsPath, releaseTs);
  console.log(`  ✓ apps/www/src/constants/release.ts: ${oldReleaseVersion} → ${version}`);
  hasChanges = true;
} else {
  console.log(`  - apps/www/src/constants/release.ts: already ${version}`);
}

// Check for any uncommitted changes (including unrelated changes)
const status = execSync("git status --porcelain", { cwd: rootDir, encoding: "utf-8" });
if (!status.trim() && !hasChanges) {
  console.log(`\n⚠️  No changes to commit. Version is already ${version}.`);
  console.log(`   Use a different version number or make other changes first.`);
  process.exit(1);
}

// 3. Git operations
console.log(`\n📝 Creating commit and tag...\n`);

try {
  // Stage changes
  execSync("git add -A", { cwd: rootDir, stdio: "inherit" });

  // Commit
  const commitMessage = releaseSummary
    ? `chore: release v${version} — ${releaseSummary}`
    : `chore: release v${version}`;
  execSync(`git commit -m "${commitMessage}"`, { cwd: rootDir, stdio: "inherit" });
  console.log(`\n  ✓ Committed: ${commitMessage}`);

  // Create tag
  execSync(`git tag ${tag}`, { cwd: rootDir, stdio: "inherit" });
  console.log(`  ✓ Tagged: ${tag}`);

  // Push commit and tag
  console.log(`\n🚀 Pushing to remote...\n`);
  execSync("git push", { cwd: rootDir, stdio: "inherit" });
  execSync("git push --tags", { cwd: rootDir, stdio: "inherit" });
  console.log(`\n  ✓ Pushed commit and tag to remote`);

  console.log(`\n✅ Release v${version} complete!`);
  console.log(`\n📋 GitHub Actions will now:`);
  console.log(`   - Build for macOS (arm64/x64) and Windows`);
  console.log(`   - Create a draft release in this repository`);
  console.log(`\n🔗 Check progress: https://github.com/tkcel/surasura/actions`);
} catch (error) {
  console.error("\n❌ Git operation failed:", error.message);
  process.exit(1);
}
