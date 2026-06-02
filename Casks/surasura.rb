cask "surasura" do
  version "0.6.0"

  sha256 arm:   "bcd443be7acd96cdca3323d76437ec611c5c5d033ef4d950f99f8008c7fc93a9",
         intel: "2b312cdb1f5bfb5947598cf4ef8873b35a197908611aa11867248374ba46eb89"

  arch arm: "arm64", intel: "2b312cdb1f5bfb5947598cf4ef8873b35a197908611aa11867248374ba46eb89"

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
