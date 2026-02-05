import type { Metadata } from "next";
import { GettingStarted } from "../../content/docs/GettingStarted";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://sura2.net";

export const metadata: Metadata = {
  title: "はじめに",
  description:
    "surasuraの基本的な使い方と初期設定について解説します。",
  openGraph: {
    title: "はじめに - surasura ドキュメント",
    description:
      "surasuraの基本的な使い方と初期設定について解説します。",
    type: "website",
    url: `${baseUrl}/docs`,
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
    title: "はじめに - surasura ドキュメント",
    description:
      "surasuraの基本的な使い方と初期設定について解説します。",
    images: [`${baseUrl}/ogp.png`],
  },
};

export default function DocsPage() {
  return <GettingStarted />;
}
