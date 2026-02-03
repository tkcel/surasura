import React, { createContext, useContext, useRef, useCallback, useEffect } from "react";
import { api } from "@/trpc/react";

interface MouseEventContextValue {
  /**
   * Request that mouse events be captured (ignore=false).
   * Multiple components can request this simultaneously.
   * Returns a release function that should be called when the component
   * no longer needs mouse events.
   */
  requestMouseCapture: () => () => void;
}

const MouseEventContext = createContext<MouseEventContextValue | null>(null);

export const MouseEventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const setIgnoreMouseEvents = api.widget.setIgnoreMouseEvents.useMutation();
  const requestCountRef = useRef(0);
  const mutateRef = useRef(setIgnoreMouseEvents.mutate);

  // Keep mutate ref up to date
  useEffect(() => {
    mutateRef.current = setIgnoreMouseEvents.mutate;
  });

  const updateMouseEvents = useCallback((capture: boolean) => {
    mutateRef.current({ ignore: !capture });
  }, []);

  const requestMouseCapture = useCallback(() => {
    requestCountRef.current++;

    // If this is the first request, enable mouse capture
    if (requestCountRef.current === 1) {
      updateMouseEvents(true);
    }

    // Return release function
    return () => {
      requestCountRef.current--;

      // If no more requests, disable mouse capture
      if (requestCountRef.current === 0) {
        updateMouseEvents(false);
      }
    };
  }, [updateMouseEvents]);

  return (
    <MouseEventContext.Provider value={{ requestMouseCapture }}>
      {children}
    </MouseEventContext.Provider>
  );
};

export const useMouseEventCapture = () => {
  const context = useContext(MouseEventContext);
  if (!context) {
    throw new Error("useMouseEventCapture must be used within MouseEventProvider");
  }
  return context;
};
