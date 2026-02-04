import { Link } from "react-router-dom";
import { ReactNode } from "react";

// ドキュメントのセクション見出し
export function DocsH1({ children }: { children: ReactNode }) {
  return (
    <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-gray-900">
      {children}
    </h1>
  );
}

export function DocsH2({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <>
      <hr className="mt-12 mb-8 border-gray-200" />
      <h2
        id={id}
        className="text-xl sm:text-2xl font-bold mb-4 text-gray-900 border-l-4 border-primary-500 pl-4"
      >
        {children}
      </h2>
    </>
  );
}

export function DocsH3({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-lg font-semibold mt-8 mb-3 text-gray-800 px-5 py-1.5 rounded-full inline-block border border-primary-500">
      {children}
    </h3>
  );
}

// 段落
export function DocsP({ children }: { children: ReactNode }) {
  return (
    <p className="my-3 leading-relaxed text-gray-700">
      {children}
    </p>
  );
}

// 強調テキスト
export function Strong({ children }: { children: ReactNode }) {
  return (
    <strong className="font-semibold text-gray-900">{children}</strong>
  );
}

// インラインコード
export function Code({ children }: { children: ReactNode }) {
  return (
    <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-gray-800">
      {children}
    </code>
  );
}

// コードブロック
export function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="my-4 overflow-hidden rounded-xl">
      <code className="block bg-gray-900 text-gray-100 p-4 rounded-xl text-sm font-mono overflow-x-auto">
        {children}
      </code>
    </pre>
  );
}

// リスト
export function DocsList({ children }: { children: ReactNode }) {
  return (
    <ul className="my-3 ml-4 list-disc text-gray-700 space-y-1">
      {children}
    </ul>
  );
}

export function DocsOrderedList({ children }: { children: ReactNode }) {
  return (
    <ol className="my-3 ml-4 list-decimal text-gray-700 space-y-1">
      {children}
    </ol>
  );
}

export function DocsListItem({ children }: { children: ReactNode }) {
  return <li>{children}</li>;
}

// 注意書き（ブロッククォート）
export function DocsNote({ children }: { children: ReactNode }) {
  return (
    <div className="border-l-4 border-primary-400 pl-4 my-4 text-gray-600 bg-primary-50/50 py-3 rounded-r-lg">
      {children}
    </div>
  );
}

// テーブル
export function DocsTable({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto my-4">
      <table className="w-full border-collapse text-sm">
        {children}
      </table>
    </div>
  );
}

export function DocsTh({ children }: { children: ReactNode }) {
  return (
    <th className="border border-gray-300 bg-gray-100 px-3 py-2 text-left font-medium">
      {children}
    </th>
  );
}

export function DocsTd({ children }: { children: ReactNode }) {
  return (
    <td className="border border-gray-300 px-3 py-2">{children}</td>
  );
}

// 内部リンク
export function DocsLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="text-primary-600 hover:underline">
      {children}
    </Link>
  );
}

// 外部リンク
export function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:underline"
    >
      {children}
    </a>
  );
}

// 画像プレースホルダー
export function DocsImage({ alt: _alt }: { alt: string }) {
  return (
    <div className="my-6 bg-gray-100 rounded-xl p-8 flex items-center justify-center min-h-[200px]">
      <span className="text-gray-400 text-sm">No Image</span>
    </div>
  );
}

// 実際の画像
export function DocsRealImage({ src, alt }: { src: string; alt: string }) {
  return (
    <figure className="my-6">
      <img
        src={src}
        alt={alt}
        className="rounded-xl shadow-nm-raised-sm max-w-full h-auto"
        loading="lazy"
      />
      <figcaption className="text-sm text-gray-500 text-center mt-2">
        {alt}
      </figcaption>
    </figure>
  );
}

// ステップ表示
export function Steps({ children }: { children: ReactNode }) {
  return (
    <div className="my-6 space-y-4">
      {children}
    </div>
  );
}

export function Step({ number, title, children }: { number: number; title: string; children?: ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-semibold text-sm">
        {number}
      </div>
      <div className="flex-1 pt-1">
        <div className="font-medium text-gray-900">{title}</div>
        {children && <div className="mt-1 text-gray-600 text-sm">{children}</div>}
      </div>
    </div>
  );
}

// カード（機能紹介など）
export function FeatureCard({ icon: Icon, title, children }: { icon: React.ComponentType<{ size?: number; className?: string }>; title: string; children: ReactNode }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
          <Icon size={18} className="text-primary-600" />
        </div>
        <h4 className="font-medium text-gray-900">{title}</h4>
      </div>
      <div className="text-sm text-gray-600">{children}</div>
    </div>
  );
}

// グリッド
export function DocsGrid({ children, cols = 2 }: { children: ReactNode; cols?: 2 | 3 }) {
  const colsClass = cols === 3 ? "md:grid-cols-3" : "md:grid-cols-2";
  return (
    <div className={`grid grid-cols-1 ${colsClass} gap-4 my-6`}>
      {children}
    </div>
  );
}

// キーボードショートカット表示
export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="px-2.5 py-1 bg-gray-700 text-white rounded-md text-sm font-mono">
      {children}
    </kbd>
  );
}

// 次へナビゲーション
import { ChevronRight } from "lucide-react";
import { docsSections, type DocsSectionId } from "./config";

export function NextPage({ current }: { current: DocsSectionId }) {
  const currentIndex = docsSections.findIndex((s) => s.id === current);
  const nextSection = docsSections[currentIndex + 1];

  if (!nextSection) return null;

  const href = `/docs/${nextSection.id}`;

  return (
    <div className="mt-10 pt-6 border-t border-gray-200">
      <Link
        to={href}
        className="group flex items-center justify-between p-4 rounded-xl bg-primary-50 hover:bg-primary-100 transition-colors"
      >
        <div>
          <div className="text-sm text-primary-600 font-medium mb-1">次へ</div>
          <div className="text-lg font-semibold text-gray-900">{nextSection.title}</div>
        </div>
        <ChevronRight size={24} className="text-primary-600 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
}

// 関連ページリンク
export function RelatedPages({ links }: { links: { to: string; title: string; description: string }[] }) {
  return (
    <div className="mt-8">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
        関連ページ
      </h3>
      <div className="space-y-2">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="font-medium text-gray-900">{link.title}</div>
            <div className="text-sm text-gray-500">{link.description}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
