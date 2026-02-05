import { Link, useParams, Navigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { docsSections, type DocsSectionId } from "./docs/config";
import { DocsSidebar } from "../components/docs/DocsSidebar";
import { DocsMobileNav } from "../components/docs/DocsMobileNav";
import { Footer } from "../components/Footer";
import { GettingStarted } from "./docs/GettingStarted";

import { Presets } from "./docs/Presets";
import { Dictionary } from "./docs/Dictionary";
import { History } from "./docs/History";
import { Settings } from "./docs/Settings";
import { FAQ } from "./docs/FAQ";
import { Troubleshooting } from "./docs/Troubleshooting";

const sectionComponents: Record<DocsSectionId, React.ComponentType> = {
  "getting-started": GettingStarted,
  presets: Presets,
  dictionary: Dictionary,
  history: History,
  settings: Settings,
  faq: FAQ,
  troubleshooting: Troubleshooting,
};

function isValidSectionId(id: string): id is DocsSectionId {
  return docsSections.some((s) => s.id === id);
}

export function DocsPage() {
  const { section } = useParams<{ section?: string }>();

  // セクションIDを決定
  const sectionId = section || "getting-started";

  // 無効なセクションIDの場合はデフォルトにリダイレクト
  if (!isValidSectionId(sectionId)) {
    return <Navigate to="/docs" replace />;
  }

  const SectionComponent = sectionComponents[sectionId];

  return (
    <div className="min-h-screen bg-nm-surface">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-nm-surface/95 backdrop-blur-sm border-b border-gray-200/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>トップページに戻る</span>
            </Link>
            <Link to="/" className="flex items-center gap-2">
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
              <SectionComponent />
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
