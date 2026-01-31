import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  LanguageSettings,
  MicrophoneSettings,
  TranscriptionModelSettings,
  FormattingSettings,
} from "./components";

export default function DictationSettingsPage() {
  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-xl font-bold">音声入力</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          音声入力、言語、マイク、AIモデルの設定を行います
        </p>
      </div>
      <Card>
        <CardContent className="space-y-4">
          <LanguageSettings />
          <Separator />
          <MicrophoneSettings />
          <Separator />
          <TranscriptionModelSettings />
          <Separator />
          <FormattingSettings />
        </CardContent>
      </Card>
    </div>
  );
}
