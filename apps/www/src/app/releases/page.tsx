import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Tag } from "lucide-react";
import { getAllReleases } from "../../lib/releases";
import { Footer } from "../../components/Footer";
import { ReleaseList } from "./ReleaseList";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://sura2.net";

export const metadata: Metadata = {
  title: "リリースノート - surasura",
  description: "surasuraの各バージョンの変更履歴・リリースノートをご覧いただけます。",
  openGraph: {
    title: "リリースノート - surasura",
    description: "surasuraの各バージョンの変更履歴・リリースノートをご覧いただけます。",
    type: "website",
    url: `${baseUrl}/releases`,
    siteName: "surasura",
    images: [{ url: `${baseUrl}/ogp.png`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "リリースノート - surasura",
    description: "surasuraの各バージョンの変更履歴・リリースノートをご覧いただけます。",
    images: [`${baseUrl}/ogp.png`],
  },
};

export default function ReleasesPage() {
  const releases = getAllReleases();

  return (
    <div className="min-h-screen bg-nm-surface">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-nm-surface/95 backdrop-blur-sm border-b border-gray-200/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>トップページに戻る</span>
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.svg" alt="surasura" className="h-6 w-6" />
              <span className="text-lg font-bold text-gray-900 tracking-tight font-brand">
                surasura
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Tag size={28} className="text-gray-700" />
            <h1 className="text-3xl font-bold text-gray-900">リリースノート</h1>
          </div>
          <p className="text-gray-500">
            surasuraの各バージョンの変更履歴です。
          </p>
        </div>

        <ReleaseList releases={releases} />
      </main>

      <Footer />
    </div>
  );
}
