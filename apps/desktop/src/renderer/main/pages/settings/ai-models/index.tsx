"use client";

import LanguageTab from "./tabs/LanguageTab";

export default function AIModelsSettingsPage() {
  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <h1 className="text-xl font-bold mb-6">AIモデル設定</h1>
      <LanguageTab />
    </div>
  );
}
