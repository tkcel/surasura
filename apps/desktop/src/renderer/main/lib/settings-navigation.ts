import {
  IconSettings,
  IconMicrophone,
  IconBook,
  IconBrain,
  IconInfoCircle,
  IconKeyboard,
  IconAdjustments,
  IconNotes,
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
    title: "ノート",
    url: "/settings/notes",
    description: "ノートを管理",
    icon: IconNotes,
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
    title: "語彙",
    url: "/settings/vocabulary",
    description: "カスタム語彙と単語認識を管理",
    icon: IconBook,
    type: "settings",
  },
  {
    title: "AIモデル",
    url: "/settings/ai-models",
    description: "AIモデルとプロバイダーを設定",
    icon: IconBrain,
    type: "settings",
  },
  {
    title: "詳細設定",
    url: "/settings/advanced",
    description: "高度な設定オプション",
    icon: IconAdjustments,
    type: "settings",
  },
  {
    title: "このアプリについて",
    url: "/settings/about",
    description: "Amicalとバージョン情報",
    icon: IconInfoCircle,
    type: "settings",
  },
];
