import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-nm-surface shadow-nm-inset-sm py-12">
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
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-nm-surface text-[#5865F2] font-medium rounded-xl shadow-nm-raised-md hover:shadow-nm-raised-sm active:shadow-nm-inset-sm transition-all duration-200"
            >
              <MessageCircle size={18} />
              Discordで相談する
            </a>
          </div>

          {/* リンク */}
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
            <Link to="/" className="hover:text-gray-700 transition-colors">
              ダウンロード
            </Link>
            <span className="text-gray-300">|</span>
            <Link to="/docs" className="hover:text-gray-700 transition-colors">
              使い方ガイド
            </Link>
            <span className="text-gray-300">|</span>
            <Link to="/privacy" className="hover:text-gray-700 transition-colors">
              プライバシーポリシー
            </Link>
            <span className="text-gray-300">|</span>
            <Link to="/disclaimer" className="hover:text-gray-700 transition-colors">
              免責事項
            </Link>
            <span className="text-gray-300">|</span>
            <Link to="/external-services" className="hover:text-gray-700 transition-colors">
              外部サービス一覧
            </Link>
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
              Made with ♥ by @tkcel9
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
