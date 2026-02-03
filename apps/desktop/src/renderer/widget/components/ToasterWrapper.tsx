import React, { useRef, useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { useMouseEventCapture } from "../contexts/MouseEventContext";

const DEBOUNCE_DELAY = 100;

/**
 * Wrapper for Toaster that handles mouse events to enable/disable
 * pass-through on the widget window, making toasts clickable.
 */
export const ToasterWrapper: React.FC = () => {
  const { requestMouseCapture } = useMouseEventCapture();
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const releaseRef = useRef<(() => void) | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (leaveTimeoutRef.current) {
        clearTimeout(leaveTimeoutRef.current);
      }
      if (releaseRef.current) {
        releaseRef.current();
      }
    };
  }, []);

  const handleMouseEnter = () => {
    console.log("ToasterWrapper: mouse enter");
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    // Request mouse capture if we don't already have it
    if (!releaseRef.current) {
      releaseRef.current = requestMouseCapture();
      console.log("ToasterWrapper: requested mouse capture");
    }
  };

  const handleMouseLeave = () => {
    console.log("ToasterWrapper: mouse leave");
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
    }
    leaveTimeoutRef.current = setTimeout(() => {
      // Release mouse capture
      if (releaseRef.current) {
        releaseRef.current();
        releaseRef.current = null;
        console.log("ToasterWrapper: released mouse capture");
      }
    }, DEBOUNCE_DELAY);
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        // Don't capture mouse events on the container
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
