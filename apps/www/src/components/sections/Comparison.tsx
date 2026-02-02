import { Check, X } from "lucide-react";

const comparisonItems = [
  {
    feature: "音声認識",
    surasura: "OpenAI Whisper（高精度）",
    others: "OS標準または独自エンジン",
    surasuraHas: true,
    othersHas: true,
  },
  {
    feature: "AI整形",
    surasura: "あり（GPT-4等対応）",
    others: "なし",
    surasuraHas: true,
    othersHas: false,
  },
  {
    feature: "カスタムプリセット",
    surasura: "5つまで作成可能",
    others: "なし",
    surasuraHas: true,
    othersHas: false,
  },
  {
    feature: "辞書・専門用語対応",
    surasura: "認識ヒント + 自動置換",
    others: "限定的",
    surasuraHas: true,
    othersHas: false,
  },
  {
    feature: "日本語対応",
    surasura: "ネイティブ対応",
    others: "英語優先が多い",
    surasuraHas: true,
    othersHas: false,
  },
  {
    feature: "価格モデル",
    surasura: "使った分だけ（従量課金）",
    others: "月額固定課金が多い",
    surasuraHas: true,
    othersHas: true,
  },
];

export function Comparison() {
  return (
    <section className="py-20 md:py-32 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            他の音声入力ツールとの違い
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            surasuraは「使える文章」を出力することに特化しています
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-2xl overflow-hidden shadow-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                  機能
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-primary-600">
                  surasura
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                  一般的な音声入力
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonItems.map((item, index) => (
                <tr
                  key={index}
                  className={index !== comparisonItems.length - 1 ? "border-b border-gray-50" : ""}
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {item.feature}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {item.surasuraHas && (
                        <div className="w-5 h-5 bg-accent-500/10 rounded-full flex items-center justify-center">
                          <Check size={12} className="text-accent-600" />
                        </div>
                      )}
                      <span className="text-sm text-gray-700">{item.surasura}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {!item.othersHas && (
                        <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
                          <X size={12} className="text-gray-400" />
                        </div>
                      )}
                      <span className="text-sm text-gray-500">{item.others}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
