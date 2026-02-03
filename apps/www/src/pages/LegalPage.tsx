import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft } from "lucide-react";
import {
  getLegalDocument,
  type LegalDocumentType,
} from "@surasura/legal";

interface LegalPageProps {
  type: LegalDocumentType;
}

export function LegalPage({ type }: LegalPageProps) {
  const document = getLegalDocument(type);

  return (
    <div className="min-h-screen bg-nm-surface">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-nm-surface/95 backdrop-blur-sm border-b border-gray-200/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>トップページに戻る</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <article className="bg-white rounded-2xl shadow-nm-raised-md p-6 sm:p-10">
          <div className="prose prose-gray max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                table: ({ children }) => (
                  <div className="overflow-x-auto my-4">
                    <table className="w-full border-collapse text-sm">
                      {children}
                    </table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="border border-gray-300 bg-gray-100 px-3 py-2 text-left font-medium">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="border border-gray-300 px-3 py-2">
                    {children}
                  </td>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {children}
                  </a>
                ),
                h1: ({ children }) => (
                  <h1 className="text-2xl sm:text-3xl font-bold mt-8 mb-6 first:mt-0 text-gray-900">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-xl sm:text-2xl font-semibold mt-8 mb-4 text-gray-800">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-lg font-semibold mt-6 mb-3 text-gray-800">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="my-3 leading-relaxed text-gray-700">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="my-3 ml-4 list-disc text-gray-700">
                    {children}
                  </ul>
                ),
                li: ({ children }) => (
                  <li className="my-1">{children}</li>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-gray-300 pl-4 my-4 text-gray-600 italic">
                    {children}
                  </blockquote>
                ),
                hr: () => <hr className="my-8 border-gray-200" />,
                code: ({ children }) => (
                  <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-gray-800">
                    {children}
                  </code>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-gray-900">
                    {children}
                  </strong>
                ),
              }}
            >
              {document.content}
            </ReactMarkdown>
          </div>
        </article>

        {/* Navigation */}
        <nav className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
          <Link
            to="/privacy"
            className={`px-4 py-2 rounded-lg transition-all ${
              type === "privacy-policy"
                ? "bg-gray-800 text-white"
                : "bg-white shadow-nm-raised-sm hover:shadow-nm-raised-md text-gray-600"
            }`}
          >
            プライバシーポリシー
          </Link>
          <Link
            to="/disclaimer"
            className={`px-4 py-2 rounded-lg transition-all ${
              type === "disclaimer"
                ? "bg-gray-800 text-white"
                : "bg-white shadow-nm-raised-sm hover:shadow-nm-raised-md text-gray-600"
            }`}
          >
            免責事項
          </Link>
          <Link
            to="/external-services"
            className={`px-4 py-2 rounded-lg transition-all ${
              type === "external-services"
                ? "bg-gray-800 text-white"
                : "bg-white shadow-nm-raised-sm hover:shadow-nm-raised-md text-gray-600"
            }`}
          >
            外部サービス一覧
          </Link>
        </nav>
      </main>

      {/* Footer */}
      <footer className="mt-12 py-8 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} surasura</p>
      </footer>
    </div>
  );
}
