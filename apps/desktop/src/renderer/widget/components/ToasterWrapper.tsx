import React, { useRef, useEffect, useCallback } from "react";
import { Toaster } from "@/components/ui/sonner";
import { useMouseEventCapture } from "../contexts/MouseEventContext";

const HOVER_DEBOUNCE_MS = 100;

/**
 * Wrapper for Toaster that handles mouse events.
 * When mouse enters the toast area, capture is enabled so toasts are clickable.
 * When mouse leaves, capture is released after a short delay.
 */
export const ToasterWrapper: React.FC = () => {
  const { enableCapture, disableCapture, forceDisable } = useMouseEventCapture();
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isHoveredRef = useRef(false);

  const clearLeaveTimeout = useCallback(() => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearLeaveTimeout();
      if (isHoveredRef.current) {
        forceDisable();
      }
    };
  }, [clearLeaveTimeout, forceDisable]);

  const handleMouseEnter = useCallback(() => {
    clearLeaveTimeout();
    if (!isHoveredRef.current) {
      isHoveredRef.current = true;
      enableCapture();
    }
  }, [clearLeaveTimeout, enableCapture]);

  const handleMouseLeave = useCallback(() => {
    clearLeaveTimeout();
    leaveTimeoutRef.current = setTimeout(() => {
      if (isHoveredRef.current) {
        isHoveredRef.current = false;
        disableCapture();
      }
    }, HOVER_DEBOUNCE_MS);
  }, [clearLeaveTimeout, disableCapture]);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        pointerEvents: "none",
        zIndex: 9999,
      }}
    >
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ pointerEvents: "auto" }}
      >
        <Toaster position="bottom-center" />
      </div>
    </div>
  );
};
