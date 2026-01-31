import { app } from "electron";
import { getPlatformDisplayName } from "./platform";

/**
 * Get the User-Agent string for HTTP requests
 * Format: surasura-desktop/{version} ({platform})
 * Example: surasura-desktop/0.1.3 (macOS)
 */
export function getUserAgent(): string {
  const version = app.getVersion();
  const platform = getPlatformDisplayName();
  return `surasura-desktop/${version} (${platform})`;
}
