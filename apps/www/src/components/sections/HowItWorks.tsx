import { Mic, Wand2, FileText, Settings, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Mic,
    title: "音声入力",
    description: "Whisper APIで高精度にテキスト化",
    color: "bg-primary-100 text-primary-600",
  },
  {
    icon: Wand2,
    title: "AI整形",
    description: "GPTが文脈を理解して整形",
    color: "bg-accent-500/10 text-accent-600",
  },
  {
    icon: FileText,
    title: "出力",
    description: "クリップボードにコピー",
    color: "bg-primary-100 text-primary-600",
  },
];

export function HowItWorks() {
  return (
    <section className="relative py-24 md:py-32 bg-nm-surface overflow-hidden">
      {/* ドットパターン背景 */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle, #cbd5e1 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        }}
      />
      {/* 上下のグラデーションフェード */}
      <div
        className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, var(--color-nm-surface) 0%, transparent 100%)",
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: "linear-gradient(to top, var(--color-nm-surface) 0%, transparent 100%)",
        }}
      />

      {/* nyoro装飾 */}
      <img
        src="/nyoro.svg"
        alt=""
        className="absolute top-1/2 -right-60 w-[400px] opacity-10 -translate-y-1/2 rotate-45"
      />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            シンプルな処理フロー
          </h2>
          <p className="text-gray-500 text-lg">
            音声からテキストへ、3ステップで完了
          </p>
        </div>

        {/* 処理フロー */}
        <div className="flex flex-col md:flex-row items-stretch justify-center gap-4 md:gap-6 mb-20">
          {steps.map((item, index) => (
            <div key={index} className="flex items-center gap-4 md:gap-6 flex-1">
              <div className="flex-1 bg-nm-surface rounded-2xl p-8 shadow-nm-raised-md hover:shadow-nm-raised-lg transition-all duration-200 text-center">
                <div
                  className="w-16 h-16 bg-nm-surface shadow-nm-raised-sm rounded-2xl flex items-center justify-center mx-auto mb-5"
                >
                  <item.icon size={30} className={item.color.includes('primary') ? 'text-primary-600' : 'text-accent-500'} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden md:flex w-10 h-10 bg-nm-surface shadow-nm-raised-sm rounded-full items-center justify-center flex-shrink-0">
                  <ArrowRight size={20} className="text-gray-400" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* カスタマイズ強調 */}
        <div className="bg-nm-surface rounded-3xl p-8 md:p-12 shadow-nm-raised-lg">
          <div className="flex flex-col md:flex-row md:items-center gap-8">
            <div className="w-16 h-16 bg-nm-surface shadow-nm-raised-md rounded-2xl flex items-center justify-center flex-shrink-0">
              <Settings size={32} className="text-primary-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">
                すべてカスタマイズ可能
              </h3>
              <p className="text-gray-500 leading-relaxed text-[15px]">
                AIへの指示（プロンプト）を自由に編集できます。
                ビジネスメール、議事録、カジュアルな文章など、用途に合わせたプリセットを無制限に作成可能。
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-nm-shadow/20 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 bg-primary-500 rounded-full shadow-nm-raised-sm" />
              <span className="text-gray-600">プロンプトを自由に編集</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 bg-accent-500 rounded-full shadow-nm-raised-sm" />
              <span className="text-gray-600">オリジナルプリセット作成</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 bg-primary-500 rounded-full shadow-nm-raised-sm" />
              <span className="text-gray-600">辞書で認識精度を向上</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
