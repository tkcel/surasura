import { Apple, Monitor, Github, MessageCircle } from "lucide-react";

export function CTA() {
  return (
    <section className="py-20 md:py-32 bg-nm-surface">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="relative overflow-hidden bg-nm-surface rounded-3xl p-8 md:p-16 text-center shadow-nm-raised-lg">
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              さあ、声で書く体験を始めよう
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto mb-8">
              今すぐダウンロードして、音声入力の新しい可能性を体験してください
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <a
                href="https://github.com/tkcel/surasura/releases/latest"
                className="inline-flex items-center gap-2 px-8 py-4 bg-nm-surface text-primary-600 font-medium rounded-xl shadow-nm-raised-md hover:shadow-nm-raised-sm active:shadow-nm-inset-sm transition-all duration-200"
              >
                <Apple size={20} />
                macOS版をダウンロード
              </a>
              <a
                href="https://github.com/tkcel/surasura/releases/latest"
                className="inline-flex items-center gap-2 px-8 py-4 bg-nm-surface text-gray-600 font-medium rounded-xl shadow-nm-inset-sm hover:shadow-nm-flat transition-all duration-200"
              >
                <Monitor size={20} />
                Windows版をダウンロード
              </a>
            </div>

            <div className="flex items-center justify-center gap-6">
              <a
                href="https://github.com/tkcel/surasura"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <Github size={18} />
                GitHub
              </a>
              <a
                href="https://discord.gg/ffpmWv5d"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <MessageCircle size={18} />
                Discord
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
