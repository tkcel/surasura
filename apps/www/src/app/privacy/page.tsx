import type { Metadata } from "next";
import { LegalPage } from "../../content/LegalPage";

export const metadata: Metadata = {
  title: "プライバシーポリシー - surasura",
  description: "surasuraのプライバシーポリシーについて。個人情報の取り扱いに関するご案内です。",
};

export default function PrivacyPage() {
  return <LegalPage type="privacy-policy" />;
}
