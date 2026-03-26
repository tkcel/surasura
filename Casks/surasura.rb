cask "surasura" do
  version "0.5.2"

  sha256 arm:   "662d634b9287977e01ff1fe3b95860396c20814a70fc6f7081f58a542b58ab6c",
         intel: "eecad35f6347ba9f1b7bff35cc6ac42a454c243dad5be35a0e552d308ce7a5f2"

  arch arm: "arm64", intel: "eecad35f6347ba9f1b7bff35cc6ac42a454c243dad5be35a0e552d308ce7a5f2"

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
