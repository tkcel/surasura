import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ChevronLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { getAllReleases, getReleaseByVersion } from "../../../lib/releases";
import { Footer } from "../../../components/Footer";
import { notFound } from "next/navigation";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://sura2.net";

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ version: string }>;
}): Promise<Metadata> {
  const { version } = await params;
  const release = getReleaseByVersion(version);

  if (!release) return {};

  const title = `v${release.version} リリースノート - surasura`;
  const description = release.summary || `surasura v${release.version} の変更内容`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `${baseUrl}/releases/${version}`,
      siteName: "surasura",
      images: [{ url: `${baseUrl}/ogp.png`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${baseUrl}/ogp.png`],
    },
  };
}

export function generateStaticParams() {
  const releases = getAllReleases();
  return releases.map((r) => ({ version: r.version }));
}

export default async function ReleaseDetailPage({
  params,
}: {
  params: Promise<{ version: string }>;
}) {
  const { version } = await params;
  const release = getReleaseByVersion(version);

  if (!release) {
    notFound();
  }

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
        <Link
          href="/releases"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-6"
        >
          <ChevronLeft size={16} />
          <span>リリースノート一覧</span>
        </Link>

        <div className="bg-white rounded-xl shadow-nm-raised-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h1 className="text-2xl font-bold text-gray-900 font-mono">
              v{release.version}
            </h1>
            <div className="mt-1 flex items-center gap-3">
              <span className="text-sm text-gray-500">
                {formatDate(release.date)}
              </span>
              {release.summary && (
                <span className="text-sm text-gray-600">
                  — {release.summary}
                </span>
              )}
            </div>
          </div>

          <div className="px-6 py-6">
            <div className="prose prose-sm prose-gray max-w-none [&>h2]:text-base [&>h2]:font-semibold [&>h2]:mt-4 [&>h2]:mb-2 [&>ul]:mt-1 [&>ul]:mb-3 [&>ul]:list-disc [&>ul]:pl-5 [&>ul>li]:text-sm [&>ul>li]:leading-relaxed">
              <ReactMarkdown>{release.content}</ReactMarkdown>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
