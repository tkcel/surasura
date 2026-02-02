import { Apple, Monitor, Github, MessageCircle } from "lucide-react";

export function CTA() {
  return (
    <section className="py-20 md:py-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 to-primary-700 rounded-3xl p-8 md:p-16 text-white text-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              さあ、声で書く体験を始めよう
            </h2>
            <p className="text-primary-100 max-w-xl mx-auto mb-8">
              今すぐダウンロードして、音声入力の新しい可能性を体験してください
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <a
                href="https://github.com/tkcel/surasura/releases/latest"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-600 font-medium rounded-xl hover:bg-primary-50 transition-colors shadow-lg"
              >
                <Apple size={20} />
                macOS版をダウンロード
              </a>
              <a
                href="https://github.com/tkcel/surasura/releases/latest"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors border border-white/20"
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
                className="inline-flex items-center gap-2 text-sm text-primary-100 hover:text-white transition-colors"
              >
                <Github size={18} />
                GitHub
              </a>
              <a
                href="https://discord.gg/ffpmWv5d"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary-100 hover:text-white transition-colors"
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
