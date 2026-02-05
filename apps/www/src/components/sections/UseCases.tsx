"use client";

import { useState } from "react";
import { Mail, ClipboardList, FileText, Code } from "lucide-react";

const useCases = [
  {
    icon: Mail,
    title: "ビジネスメール作成",
    input: "「○○さんに明日の会議の件で連絡して、14時から16時で調整したい」",
    output: "丁寧なビジネスメールとして自動整形",
    color: "primary",
  },
  {
    icon: ClipboardList,
    title: "議事録作成",
    input: "会議中に話しながら要点を口述",
    output: "箇条書き形式の議事録として整形",
    color: "accent",
  },
  {
    icon: FileText,
    title: "ブログ・記事執筆",
    input: "思いついたアイデアを音声で吹き込む",
    output: "読みやすい文章構成に自動変換",
    color: "primary",
  },
  {
    icon: Code,
    title: "コードのコメント・ドキュメント",
    input: "「この関数は配列を受け取ってソートして返す」",
    output: "適切な技術文書として整形",
    color: "accent",
  },
];

export function UseCases() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeCase = useCases[activeIndex]!;

  return (
    <section className="py-20 md:py-32 bg-nm-surface">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            こんな場面で活躍します
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            様々なシーンで、あなたの作業を効率化
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            {useCases.map((useCase, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${
                  activeIndex === index
                    ? "bg-nm-surface shadow-nm-inset-sm"
                    : "bg-nm-surface shadow-nm-raised-sm hover:shadow-nm-raised-md"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${
                      activeIndex === index
                        ? "bg-nm-surface shadow-nm-raised-sm"
                        : "bg-nm-surface shadow-nm-inset-sm"
                    }`}
                  >
                    <useCase.icon
                      size={20}
                      className={
                        activeIndex === index
                          ? "text-primary-600"
                          : "text-gray-500"
                      }
                    />
                  </div>
                  <span
                    className={`font-medium ${
                      activeIndex === index ? "text-primary-700" : "text-gray-700"
                    }`}
                  >
                    {useCase.title}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="bg-nm-surface rounded-2xl p-8 shadow-nm-raised-lg">
            <div className="space-y-6">
              <div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  入力（音声）
                </div>
                <div className="bg-nm-surface rounded-xl p-4 shadow-nm-inset-sm">
                  <p className="text-gray-700">{activeCase.input}</p>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="w-8 h-8 bg-nm-surface shadow-nm-raised-sm rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-primary-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  出力（整形後）
                </div>
                <div className="bg-nm-surface rounded-xl p-4 shadow-nm-raised-sm">
                  <p className="text-gray-700">{activeCase.output}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
