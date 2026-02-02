import { Wand2, Layout, BookCheck } from "lucide-react";

const solutions = [
  {
    icon: Wand2,
    title: "AIが自動で文章を整形",
    description:
      "音声認識 + AI整形の2段階処理。話した内容がそのまま「使える文章」に変換されます。句読点、改行、文体まで自動調整。",
    color: "primary",
  },
  {
    icon: Layout,
    title: "用途に合わせた5つのプリセット",
    description:
      "ビジネスメール、議事録、カジュアル文章など、ワンクリックで最適な文体に切り替え。さらにカスタムプリセットも作成可能。",
    color: "accent",
  },
  {
    icon: BookCheck,
    title: "辞書機能で専門用語も完璧",
    description:
      "認識ヒントで固有名詞・専門用語の精度アップ。自動置換機能で「すらすら」→「surasura」も思いのまま。",
    color: "primary",
  },
];

export function Solution() {
  return (
    <section className="py-20 md:py-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            <span className="font-brand">surasura</span>なら、すべて解決
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            音声入力の課題を根本から解決する、3つの強力な機能
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {solutions.map((solution, index) => (
            <div
              key={index}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-accent-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative bg-white rounded-2xl p-8 border border-gray-100 hover:border-primary-200 transition-colors h-full">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${
                    solution.color === "primary"
                      ? "bg-primary-100"
                      : "bg-accent-500/10"
                  }`}
                >
                  <solution.icon
                    size={28}
                    className={
                      solution.color === "primary"
                        ? "text-primary-600"
                        : "text-accent-600"
                    }
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {solution.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {solution.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
