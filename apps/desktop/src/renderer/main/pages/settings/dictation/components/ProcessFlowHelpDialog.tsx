import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { HelpCircle } from "lucide-react";
import { ProcessFlowDiagram } from "./ProcessFlowDiagram";

interface ProcessFlowHelpDialogProps {
  children?: React.ReactNode;
}

export function ProcessFlowHelpDialog({ children }: ProcessFlowHelpDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <button
            type="button"
            className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground"
          >
            <HelpCircle className="w-3.5 h-3.5 mr-1" />
            処理フローを見る
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>音声処理フロー</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <ProcessFlowDiagram />

          <div className="space-y-3 text-sm">
            <div className="p-3 bg-muted rounded-lg">
              <h4 className="font-medium mb-1">1. 話す</h4>
              <p className="text-muted-foreground text-xs">
                マイクに向かって話すと、音声が録音されます。
              </p>
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <h4 className="font-medium mb-1">2. 文字起こし</h4>
              <p className="text-muted-foreground text-xs">
                Speech-to-Text AIが音声をテキストに変換します。
              </p>
            </div>

            <div className="p-3 bg-muted rounded-lg border-2 border-dashed border-muted-foreground/30">
              <h4 className="font-medium mb-1">3. AI加工（オプション）</h4>
              <p className="text-muted-foreground text-xs">
                カスタム指示でAIの出力を自由にカスタマイズできます。
              </p>
              <div className="mt-3 p-2.5 bg-blue-500/10 border border-blue-500/30 rounded-md">
                <p className="text-blue-600 dark:text-blue-400 text-xs font-medium">
                  💡 設定をおすすめ
                </p>
                <p className="text-blue-600/80 dark:text-blue-400/80 text-xs mt-1.5 leading-relaxed">
                  繰り返し発言やフィラーの除去、ビジネスメール調への変換、箇条書き形式での整理、音声で質問してAIに即時回答させるなど、アイデア次第で使い方は無限大。あなただけの音声入力体験を作れます。
                </p>
              </div>
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <h4 className="font-medium mb-1">4. ペースト</h4>
              <p className="text-muted-foreground text-xs">
                整形されたテキストがクリップボードにコピーされ、アクティブなアプリにペーストされます。
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
