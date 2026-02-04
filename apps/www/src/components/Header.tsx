import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Apple, X, Cpu, Check, Loader2, Monitor, BookOpen } from "lucide-react";
import { DOWNLOAD_URLS } from "../constants/release";
import { useReleaseAvailability } from "../hooks/useReleaseAvailability";

export function Header() {
  const [showMacModal, setShowMacModal] = useState(false);
  const [downloadingMac, setDownloadingMac] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAvailable, isLoading } = useReleaseAvailability();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMacDownload = (type: "arm" | "intel", url: string) => {
    setDownloadingMac(type);
    window.location.href = url;
    setTimeout(() => {
      setDownloadingMac(null);
      setShowMacModal(false);
    }, 3000);
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-nm-surface/90 backdrop-blur-md shadow-nm-raised-sm" : "bg-transparent"}`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <a href="#" className="flex items-center gap-2.5">
              <img src="/logo.svg" alt="surasura" className="h-8 w-8" />
              <span className="text-xl font-bold text-gray-900 tracking-tight font-brand">surasura</span>
            </a>

            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/docs"
                className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                title="使い方ガイド"
              >
                <BookOpen size={18} />
                <span className="hidden sm:inline">使い方ガイド</span>
              </Link>
              <a
                href="https://github.com/tkcel/surasura"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                title="GitHub"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span className="hidden sm:inline">GitHub</span>
              </a>
              <a
                href="https://discord.gg/ffpmWv5d"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 text-sm font-medium text-[#5865F2] hover:text-[#4752C4] transition-colors"
                title="Discord"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                <span className="hidden sm:inline">Discord</span>
              </a>
              {isLoading ? (
                <div className="hidden sm:flex px-5 py-2.5 text-sm font-semibold text-gray-400 bg-nm-surface rounded-xl shadow-nm-inset-sm items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  確認中
                </div>
              ) : isAvailable ? (
                <button
                  onClick={() => setShowMacModal(true)}
                  className="hidden sm:block px-5 py-2.5 text-sm font-semibold text-primary-600 bg-nm-surface rounded-xl hover:shadow-nm-raised-sm active:shadow-nm-inset-sm transition-all duration-200 shadow-nm-raised-md"
                >
                  ダウンロード
                </button>
              ) : (
                <div className="hidden sm:block px-5 py-2.5 text-sm font-semibold text-gray-400 bg-nm-surface rounded-xl shadow-nm-inset-sm cursor-not-allowed">
                  準備中
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ダウンロード選択モーダル */}
      {showMacModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowMacModal(false)}
        >
          <div
            className="bg-nm-surface rounded-3xl p-8 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">ダウンロード</h3>
              <button
                onClick={() => setShowMacModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              {/* macOS Apple Silicon */}
              <button
                onClick={() =>
                  handleMacDownload(
                    "arm",
                    DOWNLOAD_URLS.macArm64
                  )
                }
                disabled={downloadingMac === "arm"}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-nm-surface shadow-nm-raised-sm hover:shadow-nm-raised-md active:shadow-nm-inset-sm transition-all duration-200 group text-left disabled:shadow-nm-inset-sm"
              >
                <div className="w-12 h-12 bg-nm-surface shadow-nm-raised-sm rounded-xl flex items-center justify-center group-hover:shadow-nm-raised-md transition-all duration-200">
                  {downloadingMac === "arm" ? (
                    <Check size={24} className="text-primary-600" />
                  ) : (
                    <Apple size={24} className="text-primary-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    {downloadingMac === "arm" ? "ダウンロード開始!" : "macOS (Apple シリコン)"}
                  </p>
                  <p className="text-sm text-gray-500">M1 / M2 / M3 / M4 搭載Mac</p>
                </div>
              </button>

              {/* macOS Intel */}
              <button
                onClick={() =>
                  handleMacDownload(
                    "intel",
                    DOWNLOAD_URLS.macX64
                  )
                }
                disabled={downloadingMac === "intel"}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-nm-surface shadow-nm-raised-sm hover:shadow-nm-raised-md active:shadow-nm-inset-sm transition-all duration-200 group text-left disabled:shadow-nm-inset-sm"
              >
                <div className="w-12 h-12 bg-nm-surface shadow-nm-raised-sm rounded-xl flex items-center justify-center group-hover:shadow-nm-raised-md transition-all duration-200">
                  {downloadingMac === "intel" ? (
                    <Check size={24} className="text-primary-600" />
                  ) : (
                    <Cpu size={24} className="text-gray-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    {downloadingMac === "intel" ? "ダウンロード開始!" : "macOS (Intel)"}
                  </p>
                  <p className="text-sm text-gray-500">2020年以前のMac</p>
                </div>
              </button>

              {/* Windows */}
              <a
                href={DOWNLOAD_URLS.windows}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-nm-surface shadow-nm-raised-sm hover:shadow-nm-raised-md active:shadow-nm-inset-sm transition-all duration-200 group text-left"
              >
                <div className="w-12 h-12 bg-nm-surface shadow-nm-raised-sm rounded-xl flex items-center justify-center group-hover:shadow-nm-raised-md transition-all duration-200">
                  <Monitor size={24} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Windows</p>
                  <p className="text-sm text-gray-500">Windows 10以降</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
