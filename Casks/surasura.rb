cask "surasura" do
  version "0.4.11"

  sha256 arm:   "642b9f3d62fbbaea641176baa13f58e3a0a37af301a094a8b38ad9fdccc9c020",
         intel: "e25a55b1bdb9546a8380ab8dbcdcd81950134c87e2589f14fb1010b8b1d31b9c"

  arch arm: "arm64", intel: "x64"

  url "https://github.com/tkcel/surasura/releases/download/v#{version}/surasura-#{version}-#{arch}.dmg"
  name "surasura"
  desc "AI-powered voice input desktop app using OpenAI Whisper and GPT"
  homepage "https://www.sura2.net"

  depends_on macos: ">= :catalina"

  app "surasura.app"

  zap trash: [
    "~/Library/Application Support/surasura",
    "~/Library/Preferences/com.surasura.desktop.plist",
  ]
end
