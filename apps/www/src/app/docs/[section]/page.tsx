import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { docsSections, type DocsSectionId } from "../../../content/docs/config";
import { GettingStarted } from "../../../content/docs/GettingStarted";
import { Presets } from "../../../content/docs/Presets";
import { Dictionary } from "../../../content/docs/Dictionary";
import { History } from "../../../content/docs/History";
import { Settings } from "../../../content/docs/Settings";
import { Tips } from "../../../content/docs/Tips";
import { FAQ } from "../../../content/docs/FAQ";
import { Troubleshooting } from "../../../content/docs/Troubleshooting";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://sura2.net";

const sectionMeta: Record<DocsSectionId, { title: string; description: string }> = {
  "getting-started": {
    title: "はじめに",
    description: "surasuraの基本的な使い方と初期設定について解説します。",
  },
  presets: {
    title: "AIフォーマット（プリセット）",
    description: "AIフォーマット（プリセット）の設定方法と活用方法を解説します。",
  },
  dictionary: {
    title: "辞書機能",
    description: "辞書機能の使い方と設定方法を解説します。",
  },
  history: {
    title: "履歴機能",
    description: "履歴機能の使い方を解説します。",
  },
  settings: {
    title: "設定",
    description: "surasuraの各種設定項目について解説します。",
  },
  tips: {
    title: "Tips",
    description: "プリセットの仕組みやカスタマイズのコツなど、surasuraを使いこなすためのヒントを紹介します。",
  },
  faq: {
    title: "FAQ",
    description: "surasuraに関するよくある質問と回答をまとめています。",
  },
  troubleshooting: {
    title: "トラブルシューティング",
    description: "surasuraで問題が発生した場合の対処法を解説します。",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>;
}): Promise<Metadata> {
  const { section } = await params;

  if (!isValidSectionId(section)) {
    return {};
  }

  const meta = sectionMeta[section];
  const ogTitle = `${meta.title} - surasura ドキュメント`;

  return {
    title: meta.title,
    description: meta.description,
    openGraph: {
      title: ogTitle,
      description: meta.description,
      type: "website",
      url: `${baseUrl}/docs/${section}`,
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
      title: ogTitle,
      description: meta.description,
      images: [`${baseUrl}/ogp.png`],
    },
  };
}

const sectionComponents: Record<DocsSectionId, React.ComponentType> = {
  "getting-started": GettingStarted,
  presets: Presets,
  dictionary: Dictionary,
  history: History,
  settings: Settings,
  tips: Tips,
  faq: FAQ,
  troubleshooting: Troubleshooting,
};

function isValidSectionId(id: string): id is DocsSectionId {
  return docsSections.some((s) => s.id === id);
}

export function generateStaticParams() {
  return docsSections
    .filter((s) => s.id !== "getting-started")
    .map((s) => ({ section: s.id }));
}

export default async function DocsSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;

  if (!isValidSectionId(section)) {
    notFound();
  }

  const SectionComponent = sectionComponents[section];
  return <SectionComponent />;
}
