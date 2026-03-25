"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Apple, Monitor, X, Cpu, Check, Loader2, BookOpen, Copy, Terminal } from "lucide-react";
import { RELEASE_VERSION, DOWNLOAD_URLS } from "../../constants/release";
// XXX: スポンサーが集まり次第解放
// import { SPONSORS, PLACEHOLDER_SPONSORS } from "../../constants/sponsors";
import { useReleaseAvailability } from "../../hooks/useReleaseAvailability";

export function Hero() {
  const [showMacModal, setShowMacModal] = useState(false);
  const [downloadingMac, setDownloadingMac] = useState<string | null>(null);
  const [copiedBrew, setCopiedBrew] = useState(false);
  const [isMac, setIsMac] = useState(true);
  const { isAvailable, isLoading } = useReleaseAvailability();

  useEffect(() => {
    setIsMac(/mac|iphone|ipad/i.test(navigator.userAgent));
  }, []);

  const handleCopyBrew = () => {
    navigator.clipboard.writeText(
      "brew tap tkcel/surasura https://github.com/tkcel/surasura && brew install --cask surasura"
    );
    setCopiedBrew(true);
    setTimeout(() => setCopiedBrew(false), 2000);
  };

  const handleMacDownload = (type: "arm" | "intel", url: string) => {
    setDownloadingMac(type);
    // Create a temporary link with download attribute to prompt save dialog
    const link = document.createElement("a");
    link.href = url;
    link.download = ""; // Triggers "Save As" dialog
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => {
      setDownloadingMac(null);
      setShowMacModal(false);
    }, 3000);
  };

  return (
    <section className="relative pt-40 pb-48 md:pt-52 md:pb-56 min-h-screen flex items-center bg-nm-surface overflow-hidden">
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
          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-nm-surface text-gray-600 rounded-full text-xs font-semibold shadow-nm-raised-sm border-0">
            v{RELEASE_VERSION}
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
              className={`group inline-flex items-center gap-3 px-8 py-4 font-semibold rounded-2xl transition-all duration-200 ${
                isMac
                  ? "bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-lg hover:shadow-xl"
                  : "bg-nm-surface text-gray-700 hover:shadow-nm-raised-md active:shadow-nm-inset-sm shadow-nm-raised-sm"
              }`}
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
          {isLoading ? (
            <div className="inline-flex items-center gap-3 px-8 py-4 bg-nm-surface text-gray-400 font-medium rounded-2xl shadow-nm-inset-sm">
              <Loader2 size={22} className="animate-spin" />
              確認中...
            </div>
          ) : isAvailable ? (
            <button
              onClick={() => {
                const link = document.createElement("a");
                link.href = DOWNLOAD_URLS.windows;
                link.download = "";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className={`group inline-flex items-center gap-3 px-8 py-4 font-semibold rounded-2xl transition-all duration-200 ${
                isMac
                  ? "bg-nm-surface text-gray-700 hover:shadow-nm-raised-md active:shadow-nm-inset-sm shadow-nm-raised-sm"
                  : "bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-lg hover:shadow-xl"
              }`}
            >
              <Monitor size={22} className="group-hover:scale-110 transition-transform" />
              Windows版ダウンロード
            </button>
          ) : (
            <div className="inline-flex items-center gap-3 px-8 py-4 bg-nm-surface text-gray-400 font-medium rounded-2xl cursor-not-allowed shadow-nm-inset-sm">
              <Monitor size={22} />
              Windows版 準備中
            </div>
          )}
        </div>

        <p className="text-sm text-gray-400 mb-4">macOS 12+ / Windows 10+ 対応</p>

        <div className="inline-flex flex-col items-stretch bg-gray-900 rounded-xl mb-4 max-w-full overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 border-b border-gray-700">
            <Apple size={14} className="text-gray-400" />
            <span className="text-xs text-gray-400 font-medium">Homebrew でインストール</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-3">
            <code className="text-sm text-gray-300 font-mono text-left leading-relaxed flex-1">
              <span className="text-gray-500 select-none">$ </span>brew tap tkcel/surasura https://github.com/tkcel/surasura
              <br />
              <span className="text-gray-500 select-none">$ </span>brew install --cask surasura
            </code>
            <button
              onClick={handleCopyBrew}
              className="flex-shrink-0 p-1.5 rounded-lg hover:bg-gray-700 transition-colors self-start"
              title="コマンドをコピー"
            >
              {copiedBrew ? (
                <Check size={14} className="text-green-400" />
              ) : (
                <Copy size={14} className="text-gray-400" />
              )}
            </button>
          </div>
        </div>

        <div className="mb-6">
          <Link
            href="/docs"
            className="group inline-flex items-center gap-2 px-6 py-3 bg-nm-surface text-gray-700 font-semibold rounded-2xl hover:shadow-nm-raised-md active:shadow-nm-inset-sm transition-all duration-200 shadow-nm-raised-sm"
          >
            <BookOpen size={20} className="text-primary-600 group-hover:scale-110 transition-transform" />
            使い方ガイドを見る
          </Link>
        </div>
      </div>

      {/* XXX: スポンサーが集まり次第解放 */}
      {/* <div className="absolute bottom-24 left-0 right-0">
        <p className="text-xs text-gray-400 text-center mb-4">
          ご支援いただいている企業様・個人様
        </p>
        <div className="relative overflow-x-clip overflow-y-visible pb-2 mx-auto max-w-2xl">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-nm-surface via-nm-surface/80 to-transparent z-10 pointer-events-none backdrop-blur-sm" style={{ maskImage: 'linear-gradient(to right, black, transparent)' }} />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-nm-surface via-nm-surface/80 to-transparent z-10 pointer-events-none backdrop-blur-sm" style={{ maskImage: 'linear-gradient(to left, black, transparent)' }} />
          <div className="flex w-max animate-marquee">
            {[...Array(2)].map((_, setIndex) => (
              <div key={setIndex} className="flex">
                {SPONSORS.map((sponsor, i) => (
                  <a
                    key={`sponsor-${i}`}
                    href={sponsor.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 mx-4 px-4 py-2 bg-nm-surface rounded-xl shadow-nm-raised-sm hover:shadow-nm-raised-md transition-shadow"
                  >
                    {sponsor.logo ? (
                      <img
                        src={sponsor.logo}
                        alt={sponsor.name}
                        className="h-8 w-auto"
                      />
                    ) : (
                      <span className="text-sm text-gray-600 whitespace-nowrap">
                        {sponsor.name}
                      </span>
                    )}
                  </a>
                ))}
                {SPONSORS.length < 5 &&
                  PLACEHOLDER_SPONSORS.slice(0, 5 - SPONSORS.length).map((text, i) => (
                    <div
                      key={`placeholder-${i}`}
                      className="flex-shrink-0 mx-4 px-6 py-2 bg-nm-surface rounded-xl shadow-nm-raised-sm"
                    >
                      <span className="text-sm text-gray-400 whitespace-nowrap">
                        {text}
                      </span>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </div>
      </div> */}

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
