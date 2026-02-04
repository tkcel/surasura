import {
  BookOpen,
  Mic,
  Sparkles,
  Book,
  History,
  Settings,
  HelpCircle,
  AlertTriangle,
} from "lucide-react";

export const docsSections = [
  {
    id: "getting-started",
    title: "はじめに",
    icon: BookOpen,
  },
  {
    id: "recording-modes",
    title: "音声入力モード",
    icon: Mic,
  },
  {
    id: "presets",
    title: "AIフォーマット",
    subtitle: "（プリセット）",
    icon: Sparkles,
  },
  {
    id: "dictionary",
    title: "辞書機能",
    icon: Book,
  },
  {
    id: "history",
    title: "履歴機能",
    icon: History,
  },
  {
    id: "settings",
    title: "設定",
    icon: Settings,
  },
  {
    id: "faq",
    title: "FAQ",
    icon: HelpCircle,
  },
  {
    id: "troubleshooting",
    title: "トラブルシューティング",
    icon: AlertTriangle,
  },
] as const;

export type DocsSectionId = (typeof docsSections)[number]["id"];
