"use client";

import { useRef, useState, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  type MotionValue,
} from "framer-motion";
import {
  Mail,
  MessageCircle,
  FileText,
  PenTool,
  Code,
  Mic,
  ArrowDown,
  ClipboardList,
  Sparkles,
  Wand2,
  type LucideIcon,
} from "lucide-react";

interface CardData {
  icon: LucideIcon;
  title: string;
  description: string;
  mode: "format" | "answer";
  input: string;
  output: string;
  clipboardHint?: string;
  iconColor: string;
}

const cards: CardData[] = [
  {
    icon: Mail,
    title: "ビジネスメール",
    description: "伝えたい内容を話すだけで、丁寧な敬語メールに自動整形",
    mode: "answer",
    input: "田中さんに明日の打ち合わせ14時でお願いしたいって連絡して",
    output:
      "田中様\n\nお世話になっております。\n明日の打ち合わせにつきまして、14時からでお願いできますでしょうか。\nご確認のほど、よろしくお願いいたします。",
    iconColor: "text-primary-600",
  },
  {
    icon: MessageCircle,
    title: "チャット返信",
    description: "Slack・Teamsへの返信を声だけでサッと入力",
    mode: "format",
    input: "了解、明日の朝イチで対応するね、ありがとう",
    output: "了解です！明日の朝イチで対応しますね。ありがとうございます！",
    iconColor: "text-accent-500",
  },
  {
    icon: FileText,
    title: "資料・レポート作成",
    description: "コピーした情報を元に、構成された文章を生成",
    mode: "answer",
    input: "このデータを月次レポートにまとめて",
    output:
      "【月次売上報告】\n今月の売上は前月比120%となりました。\n特にA商品の販売が好調で、全体の成長を牽引しています。",
    clipboardHint: "売上データ（スプレッドシートからコピー）",
    iconColor: "text-primary-600",
  },
  {
    icon: PenTool,
    title: "SNS・ブログ投稿",
    description: "思いついたことを話してそのまま投稿文に",
    mode: "format",
    input: "新しいプロジェクト始まった、めっちゃワクワクしてる",
    output:
      "新しいプロジェクトがスタートしました！\nワクワクが止まりません。これからの進捗もシェアしていきます。",
    iconColor: "text-accent-500",
  },
  {
    icon: Code,
    title: "コードコメント",
    description: "コピーしたコードに適切なドキュメントを生成",
    mode: "answer",
    input: "この関数にJSDocコメントをつけて",
    output:
      "/**\n * 配列を昇順にソートして返す\n * @param arr - ソート対象の配列\n * @returns ソート済みの新しい配列\n */",
    clipboardHint: "function sortArray(arr) { ... }",
    iconColor: "text-primary-600",
  },
];

const TOTAL_CARDS = cards.length;
const BUFFER_START = 0.05;
const BUFFER_END = 0.95;
const SEGMENT_SIZE = (BUFFER_END - BUFFER_START) / TOTAL_CARDS;

/* ------------------------------------------------------------------ */
/*  TransformCard — カード本体 + 時間ベースタイピングアニメーション      */
/* ------------------------------------------------------------------ */
function TransformCard({
  card,
  fixedHeight = false,
  animated = false,
  isActive = false,
}: {
  card: CardData;
  fixedHeight?: boolean;
  animated?: boolean;
  isActive?: boolean;
}) {
  const Icon = card.icon;
  const [charIndex, setCharIndex] = useState(0);
  const [typingDone, setTypingDone] = useState(!animated);
  const [showOutput, setShowOutput] = useState(!animated);

  // タイピングアニメーション（isActive になったら自動開始）
  useEffect(() => {
    if (!animated || !isActive) return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setCharIndex(i);
      if (i >= card.input.length) {
        clearInterval(interval);
        setTypingDone(true);
      }
    }, 40);
    return () => clearInterval(interval);
  }, [animated, isActive, card.input.length]);

  // タイピング完了 → Output 表示
  useEffect(() => {
    if (!animated || !typingDone) return;
    const timer = setTimeout(() => setShowOutput(true), 300);
    return () => clearTimeout(timer);
  }, [animated, typingDone]);

  const displayedInput = animated ? card.input.slice(0, charIndex) : card.input;
  const showCursor = animated && isActive && !typingDone;

  const outputContent = (
    <>
      <div className="flex items-center gap-2 mb-1.5 sm:mb-3">
        <Icon size={14} className={`${card.iconColor} sm:hidden`} />
        <Icon size={16} className={`${card.iconColor} hidden sm:block`} />
        <span className="text-[11px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Output
        </span>
      </div>
      <p className="text-sm sm:text-base text-gray-800 leading-relaxed whitespace-pre-line font-medium">
        {card.output}
      </p>
    </>
  );

  return (
    <div
      className={`bg-nm-surface rounded-2xl shadow-nm-raised-md ${fixedHeight ? "h-[min(600px,calc(100vh-280px))] flex flex-col px-6 py-6 sm:px-10 sm:py-8" : "p-8"}`}
    >
      {/* ヘッダー */}
      <div className="flex items-center gap-3 sm:gap-5 mb-3 sm:mb-6">
        <div className="w-10 h-10 sm:w-14 sm:h-14 bg-nm-surface shadow-nm-raised-sm rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
          <Icon size={20} className={`${card.iconColor} sm:hidden`} />
          <Icon size={26} className={`${card.iconColor} hidden sm:block`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 mb-0.5">
            <h3 className="font-bold text-gray-900 text-lg sm:text-2xl tracking-tight">
              {card.title}
            </h3>
            <span
              className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold ${
                card.mode === "answer"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-primary-100 text-primary-700"
              }`}
            >
              {card.mode === "answer" ? (
                <Sparkles size={10} />
              ) : (
                <Wand2 size={10} />
              )}
              {card.mode === "answer" ? "回答モード" : "整形モード"}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500">{card.description}</p>
        </div>
      </div>

      {/* 入力 → 出力 の変換表示（常に縦並び） */}
      <div className="flex flex-col gap-2 sm:gap-4 my-auto">
        {/* クリップボード情報 */}
        {card.clipboardHint && (
          <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2.5 bg-gray-50 rounded-lg border border-gray-200 border-dashed">
            <ClipboardList size={14} className="text-gray-400 flex-shrink-0" />
            <span className="text-[11px] sm:text-xs text-gray-500">
              <span className="font-semibold text-gray-600">クリップボード:</span>{" "}
              {card.clipboardHint}
            </span>
          </div>
        )}

        {/* 入力（音声） */}
        <div className="bg-nm-surface rounded-xl p-3 sm:p-5 shadow-nm-inset-sm">
          <div className="flex items-center gap-2 mb-1.5 sm:mb-3">
            <Mic size={14} className="text-gray-400 sm:hidden" />
            <Mic size={16} className="text-gray-400 hidden sm:block" />
            <span className="text-[11px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Voice Input
            </span>
          </div>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            {displayedInput.length > 0 && "「"}
            {displayedInput}
            {showCursor && (
              <span className="inline-block w-0.5 h-4 sm:h-5 bg-primary-600 animate-pulse ml-0.5 align-middle" />
            )}
            {!showCursor && displayedInput.length > 0 && "」"}
          </p>
        </div>

        {/* 矢印 */}
        <div className="flex items-center justify-center">
          <div className="w-7 h-7 sm:w-9 sm:h-9 bg-primary-600 rounded-full flex items-center justify-center shadow-lg">
            <ArrowDown size={14} className="text-white sm:hidden" />
            <ArrowDown size={18} className="text-white hidden sm:block" />
          </div>
        </div>

        {/* 出力（整形後） */}
        <div
          className={`bg-primary-50/60 rounded-xl p-3 sm:p-5 shadow-nm-raised-sm transition-opacity duration-500 ${
            showOutput ? "opacity-100" : "opacity-0"
          }`}
        >
          {outputContent}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  AnimatedCard — スクロール連動の出現 + 出現完了でアクティブ化         */
/* ------------------------------------------------------------------ */
function AnimatedCard({
  card,
  index,
  scrollProgress,
}: {
  card: CardData;
  index: number;
  scrollProgress: MotionValue<number>;
}) {
  const reverseIndex = TOTAL_CARDS - 1 - index;
  const isFirst = index === 0;
  const [isActive, setIsActive] = useState(false);
  const hasActivated = useRef(false);

  const segStart = BUFFER_START + index * SEGMENT_SIZE;

  // カード出現（カード0は最初から表示）
  // セグメント先頭15%で出現完了、残り85%はバッファー（アニメーションを見せる時間）
  const y = useTransform(
    scrollProgress,
    isFirst ? [0, 0] : [segStart, segStart + SEGMENT_SIZE * 0.15],
    isFirst ? [0, 0] : [400, 0]
  );

  const cardOpacity = useTransform(
    scrollProgress,
    isFirst ? [0, 0] : [segStart, segStart + SEGMENT_SIZE * 0.1],
    isFirst ? [1, 1] : [0, 1]
  );

  // 出現完了を検知 → タイピングアニメーション開始
  // カード0は cardOpacity が常に1で change が発火しないため scrollProgress を監視
  useMotionValueEvent(
    isFirst ? scrollProgress : cardOpacity,
    "change",
    (v) => {
      if (hasActivated.current) return;
      const threshold = isFirst ? 0.01 : 0.99;
      if (v >= threshold) {
        hasActivated.current = true;
        setIsActive(true);
      }
    }
  );

  const stackOffset = reverseIndex * 8;
  const scale = 1 - reverseIndex * 0.02;

  return (
    <motion.div
      style={{
        y,
        opacity: cardOpacity,
        zIndex: index,
        translateY: stackOffset,
        scale,
      }}
      className="absolute inset-x-0 top-0"
    >
      <TransformCard card={card} fixedHeight animated isActive={isActive} />
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  ProgressDots                                                       */
/* ------------------------------------------------------------------ */
function ProgressDots({
  scrollProgress,
}: {
  scrollProgress: MotionValue<number>;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      {cards.map((_, index) => (
        <ProgressDot
          key={index}
          index={index}
          scrollProgress={scrollProgress}
        />
      ))}
    </div>
  );
}

function ProgressDot({
  index,
  scrollProgress,
}: {
  index: number;
  scrollProgress: MotionValue<number>;
}) {
  const segStart = BUFFER_START + index * SEGMENT_SIZE;
  const appearEnd = segStart + SEGMENT_SIZE * 0.15;

  const dotOpacity = useTransform(
    scrollProgress,
    index === 0 ? [0, 0.01] : [segStart, appearEnd],
    index === 0 ? [1, 1] : [0.3, 1]
  );

  const dotScale = useTransform(
    scrollProgress,
    index === 0 ? [0, 0.01] : [segStart, appearEnd],
    index === 0 ? [1, 1] : [0.8, 1]
  );

  return (
    <motion.div
      style={{ opacity: dotOpacity, scale: dotScale }}
      className="w-2.5 h-2.5 rounded-full bg-primary-600"
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Desktop / Mobile レイアウト                                        */
/* ------------------------------------------------------------------ */
function DesktopCardStack() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  return (
    <div ref={containerRef} className="h-[1200vh] relative">
      <div className="sticky top-16 h-[calc(100vh-4rem)] flex items-center">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-6 sm:mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
              こんな場面で使えます
            </h2>
            <p className="text-gray-500 text-lg mt-1">
              話すだけで、あらゆるテキスト入力を効率化
            </p>
          </div>

          <div className="relative h-[min(600px,calc(100vh-280px))]">
            {cards.map((card, index) => (
              <AnimatedCard
                key={index}
                card={card}
                index={index}
                scrollProgress={scrollYProgress}
              />
            ))}
          </div>

          <div className="mt-6 sm:mt-10 flex justify-center">
            <ProgressDots scrollProgress={scrollYProgress} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ScrollCardStack() {
  // リロード時にブラウザのスクロール位置復元を無効化
  // 1200vh のstickyコンテナ途中から始まるのを防止
  useEffect(() => {
    window.history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
  }, []);

  return (
    <section className="bg-nm-surface">
      <DesktopCardStack />
    </section>
  );
}
