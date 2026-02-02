import { useState } from "react";
import { Apple, Monitor, X, Cpu, Download, Check } from "lucide-react";
import { RELEASE_VERSION, DOWNLOAD_URLS } from "../../constants/release";

export function Hero() {
  const [showMacModal, setShowMacModal] = useState(false);
  const [downloadingMac, setDownloadingMac] = useState<string | null>(null);
  const [downloadingWin, setDownloadingWin] = useState(false);

  const handleMacDownload = (type: "arm" | "intel", url: string) => {
    setDownloadingMac(type);
    window.location.href = url;
    setTimeout(() => {
      setDownloadingMac(null);
      setShowMacModal(false);
    }, 3000);
  };

  const handleWinDownload = () => {
    setDownloadingWin(true);
    window.location.href = DOWNLOAD_URLS.windows;
    setTimeout(() => setDownloadingWin(false), 3000);
  };

  return (
    <section className="relative pt-40 pb-32 md:pt-52 md:pb-44 min-h-screen flex items-center bg-gray-50 overflow-hidden">
      {/* ドットパターン背景 */}
      <div
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: `radial-gradient(circle, #94a3b8 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
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
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-white text-primary-700 rounded-full text-sm font-medium shadow-sm border border-primary-100">
            基本使用料無料・月額課金なし
          </span>
          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
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
          <button
            onClick={() => setShowMacModal(true)}
            className="group inline-flex items-center gap-3 px-8 py-4 bg-primary-600 text-white font-medium rounded-2xl hover:bg-primary-700 transition-all hover:scale-[1.02] shadow-xl shadow-primary-600/20"
          >
            <Apple size={22} className="group-hover:scale-110 transition-transform" />
            macOS版ダウンロード
          </button>
          <button
            onClick={handleWinDownload}
            disabled={downloadingWin}
            className="group inline-flex items-center gap-3 px-8 py-4 bg-gray-900 text-white font-medium rounded-2xl hover:bg-gray-800 transition-all hover:scale-[1.02] shadow-xl shadow-gray-900/20 disabled:opacity-80"
          >
            {downloadingWin ? (
              <>
                <Download size={22} className="animate-bounce" />
                ダウンロード中...
              </>
            ) : (
              <>
                <Monitor size={22} className="group-hover:scale-110 transition-transform" />
                Windows版ダウンロード
              </>
            )}
          </button>
        </div>

        <p className="text-sm text-gray-400">macOS 12+ / Windows 10+ 対応</p>
      </div>

      {/* macOS選択モーダル */}
      {showMacModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowMacModal(false)}
        >
          <div
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
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
                className="w-full flex items-center gap-4 p-4 rounded-2xl border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all group text-left disabled:bg-primary-50 disabled:border-primary-300"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center group-hover:bg-primary-200 transition-colors">
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
                className="w-full flex items-center gap-4 p-4 rounded-2xl border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all group text-left disabled:bg-primary-50 disabled:border-primary-300"
              >
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-gray-200 transition-colors">
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
