import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const contentDir = path.join(__dirname, "../content");
const outputFile = path.join(__dirname, "../src/content.generated.ts");

function escapeString(str: string): string {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\$/g, "\\$");
}

function main() {
  const privacyPolicy = fs.readFileSync(
    path.join(contentDir, "privacy-policy.md"),
    "utf-8"
  );
  const disclaimer = fs.readFileSync(
    path.join(contentDir, "disclaimer.md"),
    "utf-8"
  );
  const externalServices = fs.readFileSync(
    path.join(contentDir, "external-services.md"),
    "utf-8"
  );
  const config = JSON.parse(
    fs.readFileSync(path.join(contentDir, "config.json"), "utf-8")
  );

  const output = `// This file is auto-generated. Do not edit manually.
// Run 'pnpm build:content' to regenerate.

export const privacyPolicyRaw = \`${escapeString(privacyPolicy)}\`;

export const disclaimerRaw = \`${escapeString(disclaimer)}\`;

export const externalServicesRaw = \`${escapeString(externalServices)}\`;

export const config = ${JSON.stringify(config, null, 2)} as const;
`;

  fs.writeFileSync(outputFile, output, "utf-8");
  console.log(`Generated: ${outputFile}`);
}

main();
