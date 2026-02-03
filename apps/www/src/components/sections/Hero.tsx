import { useState } from "react";
import { Apple, Monitor, X, Cpu, Check, Loader2 } from "lucide-react";
import { RELEASE_VERSION, DOWNLOAD_URLS } from "../../constants/release";
import { useReleaseAvailability } from "../../hooks/useReleaseAvailability";

export function Hero() {
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
    <section className="relative pt-40 pb-32 md:pt-52 md:pb-44 min-h-screen flex items-center bg-nm-surface overflow-hidden">
      {/* ドットパターン背景 */}
      <div
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: `radial-gradient(circle, #94a3b8 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />
      {/* 下部のグラデーションフェード */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: "linear-gradient(to top, var(--color-nm-surface) 0%, transparent 100%)",
        }}
      />

      {/* nyoro装飾 */}
      <img
        src="/nyoro.svg"
        alt=""
        className="absolute top-10 -left-32 w-[800px] opacity-25"
      />
      <img
        src="/nyoro.svg"
        alt=""
        className="absolute bottom-10 -right-32 w-[800px] opacity-20 scale-x-[-1]"
      />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-nm-surface text-primary-700 rounded-full text-sm font-medium shadow-nm-raised-sm border-0">
            基本使用料無料・月額課金なし
          </span>
          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-nm-surface text-amber-700 rounded-full text-xs font-semibold shadow-nm-raised-sm border-0">
            Beta v{RELEASE_VERSION}
          </span>
        </div>

        <p className="text-lg text-gray-500 mb-4 tracking-wide">AI音声入力アプリ</p>

        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 tracking-tight font-brand">
          surasura
        </h1>

        <p className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed font-medium">
          キーボードを手放そう。
          <br />
          あなたは「<span className="font-brand">surasura</span>」話すだけ。
        </p>

        <div
          id="download"
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6"
        >
          {isLoading ? (
            <div className="inline-flex items-center gap-3 px-8 py-4 bg-nm-surface text-gray-400 font-medium rounded-2xl shadow-nm-inset-sm">
              <Loader2 size={22} className="animate-spin" />
              確認中...
            </div>
          ) : isAvailable ? (
            <button
              onClick={() => setShowMacModal(true)}
              className="group inline-flex items-center gap-3 px-8 py-4 bg-primary-600 text-white font-semibold rounded-2xl hover:bg-primary-700 active:bg-primary-800 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Apple size={22} className="group-hover:scale-110 transition-transform" />
              macOS版ダウンロード
            </button>
          ) : (
            <div className="inline-flex items-center gap-3 px-8 py-4 bg-nm-surface text-gray-400 font-medium rounded-2xl cursor-not-allowed shadow-nm-inset-sm">
              <Apple size={22} />
              macOS版 準備中
            </div>
          )}
          <div className="inline-flex items-center gap-3 px-8 py-4 bg-nm-surface text-gray-400 font-medium rounded-2xl cursor-not-allowed shadow-nm-inset-sm">
            <Monitor size={22} />
            Windows版 近日公開
          </div>
        </div>

        <p className="text-sm text-gray-400">macOS 12+ 対応（Windows版は近日公開）</p>
      </div>

      {/* macOS選択モーダル */}
      {showMacModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowMacModal(false)}
        >
          <div
            className="bg-nm-surface rounded-3xl p-8 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Macの種類を選択</h3>
              <button
                onClick={() => setShowMacModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-6">
              お使いのMacに合ったバージョンをダウンロードしてください。
            </p>

            <div className="space-y-3">
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
                    {downloadingMac === "arm" ? "ダウンロード開始!" : "Apple シリコン"}
                  </p>
                  <p className="text-sm text-gray-500">M1 / M2 / M3 / M4 搭載Mac</p>
                </div>
              </button>

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
                    {downloadingMac === "intel" ? "ダウンロード開始!" : "Intel"}
                  </p>
                  <p className="text-sm text-gray-500">2020年以前のMac</p>
                </div>
              </button>
            </div>

            <p className="mt-6 text-xs text-gray-400 text-center">
              わからない場合は「Apple シリコン」をお試しください
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
