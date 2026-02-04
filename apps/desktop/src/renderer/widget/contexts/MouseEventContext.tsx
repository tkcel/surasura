import React, {
  createContext,
  useContext,
  useRef,
  useCallback,
  useEffect,
} from "react";
import { api } from "@/trpc/react";

// Failsafe timeout - force release capture after this duration
const FAILSAFE_TIMEOUT_MS = 3000;

interface MouseEventContextValue {
  /**
   * Enable mouse capture (widget captures clicks).
   * Automatically releases after FAILSAFE_TIMEOUT_MS.
   */
  enableCapture: () => void;

  /**
   * Disable mouse capture (clicks pass through to other apps).
   */
  disableCapture: () => void;

  /**
   * Force disable capture - use when state changes unexpectedly.
   */
  forceDisable: () => void;
}

const MouseEventContext = createContext<MouseEventContextValue | null>(null);

export const MouseEventProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const setIgnoreMouseEvents = api.widget.setIgnoreMouseEvents.useMutation();
  const isCapturingRef = useRef(false);
  const failsafeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Stable reference to mutate function
  const mutateRef = useRef(setIgnoreMouseEvents.mutate);
  mutateRef.current = setIgnoreMouseEvents.mutate;

  const clearFailsafeTimer = useCallback(() => {
    if (failsafeTimerRef.current) {
      clearTimeout(failsafeTimerRef.current);
      failsafeTimerRef.current = null;
    }
  }, []);

  const setIgnore = useCallback(
    (ignore: boolean) => {
      const newCapturing = !ignore;

      // Clear any existing failsafe timer first
      clearFailsafeTimer();

      // Skip API call if already in desired state
      if (isCapturingRef.current !== newCapturing) {
        isCapturingRef.current = newCapturing;
        console.log(`[MouseCapture] setIgnoreMouseEvents: ${ignore}`);
        mutateRef.current({ ignore });
      }

      // Always reset failsafe timer when enabling capture (even if already capturing)
      if (newCapturing) {
        failsafeTimerRef.current = setTimeout(() => {
          console.warn(
            `[MouseCapture] Failsafe triggered - forcing release after ${FAILSAFE_TIMEOUT_MS}ms`
          );
          isCapturingRef.current = false;
          mutateRef.current({ ignore: true });
        }, FAILSAFE_TIMEOUT_MS);
      }
    },
    [clearFailsafeTimer]
  );

  const enableCapture = useCallback(() => {
    setIgnore(false);
  }, [setIgnore]);

  const disableCapture = useCallback(() => {
    setIgnore(true);
  }, [setIgnore]);

  const forceDisable = useCallback(() => {
    clearFailsafeTimer();
    isCapturingRef.current = false;
    console.log("[MouseCapture] Force disable");
    mutateRef.current({ ignore: true });
  }, [clearFailsafeTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearFailsafeTimer();
      // Ensure capture is disabled when context unmounts
      mutateRef.current({ ignore: true });
    };
  }, [clearFailsafeTimer]);

  return (
    <MouseEventContext.Provider
      value={{ enableCapture, disableCapture, forceDisable }}
    >
      {children}
    </MouseEventContext.Provider>
  );
};

export const useMouseEventCapture = () => {
  const context = useContext(MouseEventContext);
  if (!context) {
    throw new Error(
      "useMouseEventCapture must be used within MouseEventProvider"
    );
  }
  return context;
};
