import { useState } from "react";
import { Apple, X, Cpu, Check, Loader2 } from "lucide-react";
import { DOWNLOAD_URLS } from "../constants/release";
import { useReleaseAvailability } from "../hooks/useReleaseAvailability";

export function Header() {
  const [showMacModal, setShowMacModal] = useState(false);
  const [downloadingMac, setDownloadingMac] = useState<string | null>(null);
  const { isAvailable, isLoading } = useReleaseAvailability();

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
      <header className="fixed top-0 left-0 right-0 z-50 bg-nm-surface/90 backdrop-blur-md shadow-nm-raised-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <a href="#" className="flex items-center gap-2.5">
              <img src="/logo.svg" alt="surasura" className="h-8 w-8" />
              <span className="text-xl font-bold text-gray-900 tracking-tight font-brand">surasura</span>
            </a>

            <div className="flex items-center gap-3">
              <a
                href="https://github.com/tkcel/surasura"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </a>
              {isLoading ? (
                <div className="px-5 py-2.5 text-sm font-semibold text-gray-400 bg-nm-surface rounded-xl shadow-nm-inset-sm flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  確認中
                </div>
              ) : isAvailable ? (
                <button
                  onClick={() => setShowMacModal(true)}
                  className="px-5 py-2.5 text-sm font-semibold text-primary-600 bg-nm-surface rounded-xl hover:shadow-nm-raised-sm active:shadow-nm-inset-sm transition-all duration-200 shadow-nm-raised-md"
                >
                  ダウンロード
                </button>
              ) : (
                <div className="px-5 py-2.5 text-sm font-semibold text-gray-400 bg-nm-surface rounded-xl shadow-nm-inset-sm cursor-not-allowed">
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

              {/* Windows - Coming Soon */}
              <div className="w-full flex items-center gap-4 p-4 rounded-2xl bg-nm-surface shadow-nm-inset-sm opacity-60 cursor-not-allowed">
                <div className="w-12 h-12 bg-nm-surface shadow-nm-inset-sm rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-500">Windows</p>
                  <p className="text-sm text-gray-400">Coming Soon</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
