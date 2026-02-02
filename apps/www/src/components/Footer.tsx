import { MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col items-center gap-6">
          {/* Discord誘導 */}
          <div className="text-center">
            <p className="text-gray-600 mb-3">
              ご質問・ご要望・バグ報告などお気軽にどうぞ
            </p>
            <a
              href="https://discord.gg/ffpmWv5d"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#5865F2] text-white font-medium rounded-xl hover:bg-[#4752C4] transition-colors"
            >
              <MessageCircle size={18} />
              Discordで相談する
            </a>
          </div>

          {/* 作者情報とコピーライト */}
          <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} <span className="font-brand">surasura</span></p>
            <span className="hidden sm:inline">·</span>
            <a
              href="https://x.com/tkcel9"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-600 transition-colors"
            >
              作者: @tkcel9
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
