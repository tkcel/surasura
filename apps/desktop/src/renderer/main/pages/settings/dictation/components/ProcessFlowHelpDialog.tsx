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
      <DialogContent className="max-w-md">
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

            <div className="p-3 bg-muted rounded-lg">
              <h4 className="font-medium mb-1">3. フォーマット</h4>
              <p className="text-muted-foreground text-xs">
                AIが句読点の追加、段落分け、誤字修正などを行います。カスタム指示を設定すると、より細かい制御が可能です。
              </p>
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
