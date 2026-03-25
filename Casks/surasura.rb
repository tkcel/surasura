cask "surasura" do
  version "0.5.0"

  sha256 arm:   "678a27c7784a0ee3423761e509b41e084926900a4712dd739401e28579ba4a5c",
         intel: "3b8ae783290744645c73330993c09aa5f33d4f4a79f290418a5f30b9c7d4c20e"

  arch arm: "arm64", intel: "3b8ae783290744645c73330993c09aa5f33d4f4a79f290418a5f30b9c7d4c20e"

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
