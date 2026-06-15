cask "surasura" do
  version "0.6.1"

  sha256 arm:   "0925af32107ea8e0b72c0fd72acb9ba919474ac7bf73a87e42a0d256e0df685d",
         intel: "252793c4095085f3d4888fc3506a4c30ff296ed16f08df073a04ec654c7be5be"

  arch arm: "arm64", intel: "252793c4095085f3d4888fc3506a4c30ff296ed16f08df073a04ec654c7be5be"

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
