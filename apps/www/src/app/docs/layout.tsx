import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DocsSidebar } from "../../components/docs/DocsSidebar";
import { DocsMobileNav } from "../../components/docs/DocsMobileNav";
import { Footer } from "../../components/Footer";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-nm-surface">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-nm-surface/95 backdrop-blur-sm border-b border-gray-200/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-8">
          {/* Sidebar（デスクトップのみ） */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 px-4">
                使い方ガイド
              </h2>
              <DocsSidebar />
            </div>
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0">
            <article className="prose prose-gray max-w-none">
              {children}
            </article>
          </main>
        </div>
      </div>

      {/* Mobile Navigation */}
      <DocsMobileNav />

      {/* Footer */}
      <Footer />
    </div>
  );
}
