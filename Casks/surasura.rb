cask "surasura" do
  version "0.5.1"

  sha256 arm:   "ea4bcad9daac317127e2f6149c3b6ff339e11977bf90d9cd1a86f665f452f845",
         intel: "a175ff110c5845e3fd73eebb8a261cf1de9af249f79e86f2718158fb7b011e4c"

  arch arm: "arm64", intel: "a175ff110c5845e3fd73eebb8a261cf1de9af249f79e86f2718158fb7b011e4c"

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
