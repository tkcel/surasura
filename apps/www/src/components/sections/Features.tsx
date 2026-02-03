import {
  Mic,
  Hand,
  Move,
  Keyboard,
  ClipboardPaste,
  Moon,
  History,
} from "lucide-react";

const features = [
  {
    icon: Mic,
    title: "Push to Talk",
    description: "キーを押している間だけ録音。直感的な操作感",
    color: "bg-primary-600 text-white",
  },
  {
    icon: Hand,
    title: "ハンズフリーモード",
    description: "1回押すと開始、もう1回で停止。長文入力に最適",
    color: "bg-accent-500 text-white",
  },
  {
    icon: Move,
    title: "フローティングウィジェット",
    description: "画面の邪魔にならない小さなウィジェットで素早く録音",
    color: "bg-primary-600 text-white",
  },
  {
    icon: Keyboard,
    title: "カスタムショートカット",
    description: "すべてのショートカットを自分好みにカスタマイズ",
    color: "bg-accent-500 text-white",
  },
  {
    icon: ClipboardPaste,
    title: "履歴ペースト",
    description: "直前の文字起こし結果をワンタッチで再ペースト",
    color: "bg-primary-600 text-white",
  },
  {
    icon: History,
    title: "履歴管理",
    description: "過去の文字起こし結果を検索・閲覧・コピー",
    color: "bg-accent-500 text-white",
  },
  {
    icon: Moon,
    title: "ダーク/ライトテーマ",
    description: "作業環境に合わせてテーマを選択",
    color: "bg-primary-600 text-white",
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-24 md:py-32 overflow-hidden bg-nm-surface">
      {/* nyoro装飾 */}
      <img
        src="/nyoro.svg"
        alt=""
        className="absolute -bottom-32 -left-40 w-[500px] opacity-10 rotate-[-20deg]"
      />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            便利な機能
          </h2>
          <p className="text-gray-500 text-lg">
            使いやすさを追求したシンプルな設計
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-nm-surface rounded-2xl p-7 shadow-nm-raised-md hover:shadow-nm-raised-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div
                className={`w-12 h-12 bg-nm-surface shadow-nm-raised-sm rounded-xl flex items-center justify-center mb-5 group-hover:shadow-nm-raised-md transition-all duration-200`}
              >
                <feature.icon size={22} className={feature.color.includes('primary') ? 'text-primary-600' : 'text-accent-500'} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
