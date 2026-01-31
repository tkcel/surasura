import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  LanguageSettings,
  MicrophoneSettings,
  TranscriptionModelSettings,
  FormattingSettings,
} from "./components";
import { ProcessFlowHelpDialog } from "./components/ProcessFlowHelpDialog";

export default function DictationSettingsPage() {
  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">音声入力</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              音声入力、言語、マイク、AIモデルの設定を行います
            </p>
          </div>
          <ProcessFlowHelpDialog />
        </div>
      </div>

      <div className="space-y-6">
        {/* 言語・マイク設定 */}
        <Card>
          <CardContent className="space-y-4">
            <LanguageSettings />
            <Separator />
            <MicrophoneSettings />
          </CardContent>
        </Card>

        {/* 文字起こし設定 */}
        <Card>
          <CardContent>
            <TranscriptionModelSettings />
          </CardContent>
        </Card>

        {/* AIフォーマット設定 */}
        <Card>
          <CardContent>
            <FormattingSettings />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
