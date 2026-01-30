"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import SpeechTab from "./tabs/SpeechTab";
import LanguageTab from "./tabs/LanguageTab";
import { useNavigate, getRouteApi } from "@tanstack/react-router";

const routeApi = getRouteApi("/settings/ai-models");

export default function AIModelsSettingsPage() {
  const navigate = useNavigate();
  const { tab } = routeApi.useSearch();

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <h1 className="text-xl font-bold mb-6">AIモデル</h1>
      <Tabs
        value={tab}
        onValueChange={(newTab) => {
          navigate({
            to: "/settings/ai-models",
            search: { tab: newTab as "speech" | "language" },
          });
        }}
        className="w-full"
      >
        <TabsList className="mb-6">
          <TabsTrigger value="speech" className="text-base">
            音声認識
          </TabsTrigger>
          <TabsTrigger value="language" className="text-base">
            言語モデル
          </TabsTrigger>
        </TabsList>
        <TabsContent value="speech">
          <SpeechTab />
        </TabsContent>
        <TabsContent value="language">
          <LanguageTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
