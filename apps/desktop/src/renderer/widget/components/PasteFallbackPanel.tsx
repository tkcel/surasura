import React, { useState, useRef, useEffect, useCallback } from "react";
import { X, Copy, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useMouseEventCapture } from "../contexts/MouseEventContext";

const AUTO_DISMISS_MS = 10000;
const HOVER_DEBOUNCE_MS = 100;

interface PasteFallbackPanelProps {
  text: string;
  presetName?: string;
  onClose: () => void;
}

export const PasteFallbackPanel: React.FC<PasteFallbackPanelProps> = ({
  text,
  presetName,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const { enableCapture, disableCapture } = useMouseEventCapture();
  const isHoveredRef = useRef(false);
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoDismissRef = useRef<NodeJS.Timeout | null>(null);
  const remainingRef = useRef(AUTO_DISMISS_MS);
  const lastTickRef = useRef(Date.now());

  const clearLeaveTimeout = useCallback(() => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
  }, []);

  const startAutoDismiss = useCallback(() => {
    if (autoDismissRef.current) clearTimeout(autoDismissRef.current);
    lastTickRef.current = Date.now();
    autoDismissRef.current = setTimeout(() => {
      onClose();
    }, remainingRef.current);
  }, [onClose]);

  const pauseAutoDismiss = useCallback(() => {
    if (autoDismissRef.current) {
      clearTimeout(autoDismissRef.current);
      autoDismissRef.current = null;
      const elapsed = Date.now() - lastTickRef.current;
      remainingRef.current = Math.max(0, remainingRef.current - elapsed);
    }
  }, []);

  // Start auto-dismiss timer on mount
  useEffect(() => {
    remainingRef.current = AUTO_DISMISS_MS;
    startAutoDismiss();
    return () => {
      if (autoDismissRef.current) clearTimeout(autoDismissRef.current);
    };
  }, [startAutoDismiss]);

  // Keep resetting failsafe timer while hovered
  useEffect(() => {
    if (!isHoveredRef.current) return;

    const interval = setInterval(() => {
      enableCapture();
    }, 2000);

    return () => clearInterval(interval);
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearLeaveTimeout();
      disableCapture();
    };
  }, [clearLeaveTimeout, disableCapture]);

  const handleMouseEnter = useCallback(() => {
    clearLeaveTimeout();
    if (!isHoveredRef.current) {
      isHoveredRef.current = true;
      enableCapture();
    }
    pauseAutoDismiss();
  }, [clearLeaveTimeout, enableCapture, pauseAutoDismiss]);

  const handleMouseLeave = useCallback(() => {
    clearLeaveTimeout();
    leaveTimeoutRef.current = setTimeout(() => {
      if (isHoveredRef.current) {
        isHoveredRef.current = false;
        disableCapture();
      }
    }, HOVER_DEBOUNCE_MS);
    startAutoDismiss();
  }, [clearLeaveTimeout, disableCapture, startAutoDismiss]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Already copied to clipboard by main process
    }
  }, [text]);

  const handleClose = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      disableCapture();
      onClose();
    },
    [disableCapture, onClose],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="max-w-[480px] w-full mb-2 rounded-xl bg-black/80 backdrop-blur-md ring-[1px] ring-black/60 shadow-[0px_0px_15px_0px_rgba(0,0,0,0.40)] before:content-[''] before:absolute before:inset-[1px] before:rounded-[11px] before:outline before:outline-white/15 before:pointer-events-none relative"
      style={{ pointerEvents: "auto" }}
    >
      <div className="px-3 py-2.5">
        {/* Header with close button */}
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] text-white/50 font-medium">
            {presetName ? `結果（${presetName}）` : "結果"}
          </span>
          <button
            onClick={handleClose}
            className="flex items-center justify-center w-[18px] h-[18px] rounded transition-colors hover:bg-white/10 cursor-pointer"
            aria-label="閉じる"
          >
            <X className="w-3 h-3 text-white/50" />
          </button>
        </div>

        {/* Transcription text */}
        <div className="max-h-[200px] overflow-y-auto mb-2" style={{ scrollbarWidth: "none" }}>
          <p className="text-[13px] text-white/90 leading-tight whitespace-pre-wrap">
            {text}
          </p>
        </div>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 active:bg-white/30 transition-colors text-[11px] text-white/70 cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-green-400" />
              <span className="text-green-400">コピーしました</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>コピー</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
};
