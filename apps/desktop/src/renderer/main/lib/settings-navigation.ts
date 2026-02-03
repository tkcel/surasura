import {
  IconSettings,
  IconMicrophone,
  IconBook,
  IconBrain,
  IconInfoCircle,
  IconKeyboard,
  IconHistory,
  type Icon,
} from "@tabler/icons-react";

export interface SettingsNavItem {
  title: string;
  url: string;
  description: string;
  icon: Icon | string;
  type: "settings";
}

export const SETTINGS_NAV_ITEMS: SettingsNavItem[] = [
  {
    title: "音声入力",
    url: "/settings/dictation",
    description: "音声認識と音声入力の設定を行う",
    icon: IconMicrophone,
    type: "settings",
  },
  {
    title: "ショートカット",
    url: "/settings/shortcuts",
    description: "キーボードショートカットをカスタマイズ",
    icon: IconKeyboard,
    type: "settings",
  },
  {
    title: "辞書機能",
    url: "/settings/vocabulary",
    description: "カスタム単語と置換ルールを管理",
    icon: IconBook,
    type: "settings",
  },
  {
    title: "履歴",
    url: "/settings/history",
    description: "音声認識履歴を確認・管理",
    icon: IconHistory,
    type: "settings",
  },
  {
    title: "AIプロバイダー設定",
    url: "/settings/ai-models",
    description: "AIモデルとプロバイダーを設定",
    icon: IconBrain,
    type: "settings",
  },
  {
    title: "環境設定",
    url: "/settings/preferences",
    description: "アプリケーションの一般設定と動作を設定",
    icon: IconSettings,
    type: "settings",
  },
  {
    title: "このアプリについて",
    url: "/settings/about",
    description: "surasuraとバージョン情報",
    icon: IconInfoCircle,
    type: "settings",
  },
];
