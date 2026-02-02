import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "無料で使えますか？",
    answer:
      "非商用目的（個人利用、教育、研究）であれば無料です。別途OpenAI APIの利用料金がかかります。",
  },
  {
    question: "インターネット接続は必要ですか？",
    answer:
      "はい。音声認識とAI整形にOpenAI APIを使用するため、インターネット接続が必要です。",
  },
  {
    question: "どのAIモデルに対応していますか？",
    answer:
      "OpenAI（GPT-4, GPT-3.5等）に加え、OpenRouter経由で様々なモデルに対応しています。",
  },
  {
    question: "音声データはどこに保存されますか？",
    answer:
      "音声データはローカルに保存されます。OpenAI APIへの送信は文字起こし処理時のみです。",
  },
  {
    question: "macOS / Windows 以外に対応予定はありますか？",
    answer:
      "現在はmacOSとWindowsのみ対応しています。Linux対応は検討中です。",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 md:py-32 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            よくある質問
          </h2>
          <p className="text-gray-600">
            ご不明な点がございましたらお気軽にお問い合わせください
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-100 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left"
              >
                <span className="font-medium text-gray-900">{faq.question}</span>
                <ChevronDown
                  size={20}
                  className={`text-gray-400 transition-transform ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-5">
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
