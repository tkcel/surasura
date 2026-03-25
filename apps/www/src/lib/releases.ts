import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface ReleaseNote {
  version: string;
  date: string;
  summary: string;
  content: string; // frontmatter以降のMarkdown本文
}

const releasesDir = path.join(process.cwd(), "src/content/releases");

/**
 * 全リリースノートを取得（バージョン降順）
 */
export function getAllReleases(): ReleaseNote[] {
  const files = fs
    .readdirSync(releasesDir)
    .filter((f) => f.endsWith(".md"));

  const releases = files.map((file) => {
    const filePath = path.join(releasesDir, file);
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);

    return {
      version: data.version as string,
      date: data.date as string,
      summary: (data.summary as string) || "",
      content: content.trim(),
    };
  });

  // バージョン降順ソート (semver比較)
  releases.sort((a, b) => {
    const aParts = a.version.split(".").map(Number);
    const bParts = b.version.split(".").map(Number);
    for (let i = 0; i < 3; i++) {
      if ((bParts[i] ?? 0) !== (aParts[i] ?? 0)) return (bParts[i] ?? 0) - (aParts[i] ?? 0);
    }
    return 0;
  });

  return releases;
}

/**
 * 特定バージョンのリリースノートを取得
 */
export function getReleaseByVersion(version: string): ReleaseNote | null {
  const filePath = path.join(releasesDir, `v${version}.md`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  return {
    version: data.version as string,
    date: data.date as string,
    summary: (data.summary as string) || "",
    content: content.trim(),
  };
}
