import { Clock, BookX, FileEdit, Languages } from "lucide-react";

const problems = [
  {
    icon: Clock,
    title: "結局、手直しで時間がかかる",
    description:
      "音声入力の文字起こしはできても、句読点や改行がめちゃくちゃ。結局、タイピングした方が早いと感じてしまう。",
  },
  {
    icon: BookX,
    title: "専門用語が全然認識されない",
    description:
      "社名、製品名、技術用語が毎回誤変換される。「すらすら」が「素良々」になってしまう。",
  },
  {
    icon: FileEdit,
    title: "文体の調整が面倒",
    description:
      "カジュアルに話した内容をビジネスメール調に直す手間。議事録をまとめ直すのに時間がかかる。",
  },
  {
    icon: Languages,
    title: "日本語対応が弱い",
    description:
      "英語向けツールが多く、日本語の精度がいまいち。漢字変換やひらがな・カタカナの使い分けが雑。",
  },
];

export function Problem() {
  return (
    <section className="py-20 md:py-32 bg-nm-surface">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            音声入力、こんな悩みありませんか？
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            便利なはずの音声入力。でも実際に使ってみると...
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {problems.map((problem, index) => (
            <div
              key={index}
              className="bg-nm-surface rounded-2xl p-6 md:p-8 shadow-nm-raised-md hover:shadow-nm-raised-lg transition-all duration-200"
            >
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-12 h-12 bg-nm-surface shadow-nm-inset-sm rounded-xl flex items-center justify-center">
                  <problem.icon size={24} className="text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {problem.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {problem.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
