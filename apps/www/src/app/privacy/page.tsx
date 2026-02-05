import type { Metadata } from "next";
import { LegalPage } from "../../content/LegalPage";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://sura2.net";

export const metadata: Metadata = {
  title: "プライバシーポリシー - surasura",
  description:
    "surasuraのプライバシーポリシーについて。個人情報の取り扱いに関するご案内です。",
  openGraph: {
    title: "プライバシーポリシー - surasura",
    description:
      "surasuraのプライバシーポリシーについて。個人情報の取り扱いに関するご案内です。",
    type: "website",
    url: `${baseUrl}/privacy`,
    siteName: "surasura",
    images: [
      {
        url: `${baseUrl}/ogp.png`,
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "プライバシーポリシー - surasura",
    description:
      "surasuraのプライバシーポリシーについて。個人情報の取り扱いに関するご案内です。",
    images: [`${baseUrl}/ogp.png`],
  },
};

export default function PrivacyPage() {
  return <LegalPage type="privacy-policy" />;
}
