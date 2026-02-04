import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-nm-surface shadow-nm-inset-sm py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col items-center gap-6">
          {/* Discord誘導 */}
          <a
            href="https://discord.gg/ffpmWv5d"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-nm-surface text-[#5865F2] font-medium rounded-xl shadow-nm-raised-md hover:shadow-nm-raised-sm active:shadow-nm-inset-sm transition-all duration-200"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            Discordに参加
          </a>

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
