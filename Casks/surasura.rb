cask "surasura" do
  version "0.6.2"

  sha256 arm:   "0c93eb0cf4c8488433ebf47be098107c660a16a5c21e259dbaacb95f13305e3b",
         intel: "ea3415ecb0b1780d64972cea7c28e10c67f73c0eb3eda810bf6a15fc3a7bae6f"

  arch arm: "arm64", intel: "ea3415ecb0b1780d64972cea7c28e10c67f73c0eb3eda810bf6a15fc3a7bae6f"

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
