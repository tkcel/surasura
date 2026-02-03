import {
  privacyPolicyRaw,
  disclaimerRaw,
  externalServicesRaw,
  config,
} from "./content.generated";

export type LegalDocumentType =
  | "privacy-policy"
  | "disclaimer"
  | "external-services";

export interface LegalConfig {
  lastUpdated: string;
  contactInfo: string;
  appName: string;
}

export interface LegalDocument {
  id: LegalDocumentType;
  title: string;
  content: string;
}

/**
 * プレースホルダーを実際の値に置換
 */
function replacePlaceholders(content: string, cfg: LegalConfig): string {
  return content
    .replace(/\{\{LAST_UPDATED\}\}/g, cfg.lastUpdated)
    .replace(/\{\{CONTACT_INFO\}\}/g, cfg.contactInfo)
    .replace(/\{\{APP_NAME\}\}/g, cfg.appName);
}

/**
 * Markdownからタイトル（最初の# 行）を抽出
 */
function extractTitle(content: string): string {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1] : "";
}

/**
 * 設定情報を取得
 */
export function getLegalConfig(): LegalConfig {
  return config as LegalConfig;
}

/**
 * 指定されたドキュメントを取得（プレースホルダー置換済み）
 */
export function getLegalDocument(type: LegalDocumentType): LegalDocument {
  const cfg = getLegalConfig();

  const rawContent = {
    "privacy-policy": privacyPolicyRaw,
    disclaimer: disclaimerRaw,
    "external-services": externalServicesRaw,
  }[type];

  const content = replacePlaceholders(rawContent, cfg);

  return {
    id: type,
    title: extractTitle(content),
    content,
  };
}

/**
 * すべてのドキュメントを取得
 */
export function getAllLegalDocuments(): LegalDocument[] {
  const types: LegalDocumentType[] = [
    "privacy-policy",
    "disclaimer",
    "external-services",
  ];
  return types.map(getLegalDocument);
}

/**
 * プライバシーポリシーを取得（ショートカット）
 */
export function getPrivacyPolicy(): LegalDocument {
  return getLegalDocument("privacy-policy");
}

/**
 * 免責事項を取得（ショートカット）
 */
export function getDisclaimer(): LegalDocument {
  return getLegalDocument("disclaimer");
}

/**
 * 外部サービス一覧を取得（ショートカット）
 */
export function getExternalServices(): LegalDocument {
  return getLegalDocument("external-services");
}

// 生のMarkdownコンテンツもエクスポート（必要な場合用）
export const rawContent = {
  privacyPolicy: privacyPolicyRaw,
  disclaimer: disclaimerRaw,
  externalServices: externalServicesRaw,
};
