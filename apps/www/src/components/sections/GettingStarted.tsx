import { Download, Key, Mic } from "lucide-react";

const steps = [
  {
    icon: Download,
    step: "1",
    title: "ダウンロード",
    description:
      "macOS / Windows 対応。インストーラーをダウンロードして実行するだけ。",
  },
  {
    icon: Key,
    step: "2",
    title: "OpenAI APIキーを設定",
    description:
      "お持ちのOpenAI APIキーを入力。高精度な音声認識とAI整形が有効に。",
  },
  {
    icon: Mic,
    step: "3",
    title: "話すだけ",
    description:
      "ショートカットを押して話すだけ。文章が自動でペーストされます。",
  },
];

export function GettingStarted() {
  return (
    <section id="getting-started" className="py-20 md:py-32 bg-nm-surface">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            3ステップで今すぐ始められる
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            難しい設定は不要。すぐに使い始めることができます
          </p>
        </div>

        <div className="relative">
          <div className="hidden md:block absolute top-24 left-1/2 -translate-x-1/2 w-2/3 h-1 bg-nm-surface shadow-nm-inset-sm rounded-full" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative text-center">
                <div className="relative z-10 w-16 h-16 mx-auto mb-6 bg-nm-surface shadow-nm-raised-lg rounded-2xl flex items-center justify-center">
                  <step.icon size={28} className="text-primary-600" />
                </div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-8 h-8 bg-nm-surface rounded-full flex items-center justify-center shadow-nm-raised-sm text-sm font-bold text-primary-600">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            APIキーの取得方法もガイド付きでサポート
          </p>
        </div>
      </div>
    </section>
  );
}
