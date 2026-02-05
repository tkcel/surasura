import type { Metadata } from "next";
import "./globals.css";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://sura2.net";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "surasura - AI音声入力アプリ",
  description:
    "surasura - キーボードを手放そう。AIが音声を認識し、用途に合わせて自動整形。プロンプトも自由にカスタマイズできる、次世代AI音声入力アプリ。お好きなAIプロバイダーに対応。基本使用料無料。",
  keywords:
    "音声入力,AI,文字起こし,ディクテーション,Whisper,GPT,Claude,Gemini,macOS,Windows,月額無料",
  openGraph: {
    title: "surasura - AI音声入力アプリ",
    description:
      "キーボードを手放そう。あなたはsurasura話すだけ。基本使用料無料・月額課金なし。",
    type: "website",
    url: baseUrl,
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
    title: "surasura - AI音声入力アプリ",
    description:
      "キーボードを手放そう。あなたはsurasura話すだけ。基本使用料無料・月額課金なし。",
    images: [`${baseUrl}/ogp.png`],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" type="image/svg+xml" href="/logo.svg" />
      </head>
      <body>{children}</body>
    </html>
  );
}
