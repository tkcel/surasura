import { useState, useEffect } from "react";
import { RELEASE_VERSION } from "../constants/release";

const RELEASE_REPO = "tkcel/surasura";

export function useReleaseAvailability() {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    const checkRelease = async () => {
      try {
        const response = await fetch(
          `https://api.github.com/repos/${RELEASE_REPO}/releases/tags/v${RELEASE_VERSION}`,
          { method: "GET" }
        );
        setIsAvailable(response.ok);
      } catch {
        setIsAvailable(false);
      }
    };

    checkRelease();
  }, []);

  return { isAvailable, isLoading: isAvailable === null };
}
