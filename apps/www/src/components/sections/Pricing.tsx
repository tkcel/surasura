import { Check, Key, Zap } from "lucide-react";

const benefits = [
  "月額サブスクなし",
  "使わない月は0円",
  "料金は自分で管理",
  "いつでも辞められる",
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 md:py-32 bg-nm-surface">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-nm-surface shadow-nm-raised-sm text-accent-600 rounded-full text-sm font-semibold mb-6">
            <Zap size={16} />
            コスパ最強
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            月額料金なし
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-lg">
            アプリは無料。お好きなAIプロバイダーのAPIキーを使うから、使った分だけ。
          </p>
        </div>

        <div className="bg-nm-surface rounded-3xl p-8 md:p-12 shadow-nm-raised-lg">
          <div className="flex flex-col md:flex-row gap-12">
            {/* 左側：APIキーの説明 */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-nm-surface shadow-nm-raised-md rounded-2xl flex items-center justify-center">
                  <Key size={26} className="text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  自分のAPIキーを使用
                </h3>
              </div>
              <p className="text-gray-600 leading-relaxed text-[15px] mb-4">
                surasuraにはサーバーがありません。あなたのAPIキーで直接AIプロバイダーと通信するため、
                <span className="font-semibold text-gray-900">
                  中間マージンもデータの第三者保存もありません。
                </span>
              </p>
              <p className="text-sm text-gray-500">
                対応: OpenAI
              </p>
            </div>

            {/* 右側：メリット一覧 */}
            <div className="flex-1">
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-4">
                    <div className="w-7 h-7 bg-nm-surface shadow-nm-raised-sm rounded-full flex items-center justify-center">
                      <Check size={16} className="text-accent-500" strokeWidth={3} />
                    </div>
                    <span className="text-gray-700 font-medium">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 料金目安 */}
          <div className="mt-10 pt-8 border-t border-nm-shadow/20">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div>
                <p className="text-sm text-gray-400 mb-1 font-medium">料金の目安（OpenAI利用時）</p>
                <p className="text-gray-900 text-lg">
                  毎日30分使っても{" "}
                  <span className="text-primary-600 font-bold text-xl">月額 約$3程度</span>
                </p>
              </div>
              <a
                href="#download"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-600 text-white font-semibold rounded-2xl hover:bg-primary-700 active:bg-primary-800 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                無料で始める
              </a>
            </div>
          </div>

          {/* ライセンス注意事項 */}
          <div className="mt-6 pt-6 border-t border-nm-shadow/20">
            <p className="text-xs text-gray-400 leading-relaxed">
              ※ 本ソフトウェアは個人・教育・研究・非営利目的でのみ無料でご利用いただけます。商用利用をご希望の場合は別途ライセンスが必要です。
              本ソフトウェアは{" "}
              <a
                href="https://github.com/amicalhq/amical"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-gray-600"
              >
                Amical
              </a>
              （MITライセンス）をベースに開発されています。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
