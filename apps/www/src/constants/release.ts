// This file is auto-updated by the bump script
// Do not edit manually

export const RELEASE_VERSION = "0.4.8";

const RELEASE_REPO = "tkcel/surasura";
const BASE_URL = `https://github.com/${RELEASE_REPO}/releases/download/v${RELEASE_VERSION}`;

export const DOWNLOAD_URLS = {
  macArm64: `${BASE_URL}/surasura-${RELEASE_VERSION}-arm64.dmg`,
  macX64: `${BASE_URL}/surasura-${RELEASE_VERSION}-x64.dmg`,
  windows: `${BASE_URL}/surasura-${RELEASE_VERSION}.Setup.exe`,
} as const;
