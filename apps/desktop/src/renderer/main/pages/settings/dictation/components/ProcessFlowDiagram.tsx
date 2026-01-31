import { Mic, FileText, Sparkles, ClipboardPaste, ArrowRight } from "lucide-react";

interface ProcessFlowDiagramProps {
  compact?: boolean;
}

export function ProcessFlowDiagram({ compact = false }: ProcessFlowDiagramProps) {
  const steps = [
    { icon: Mic, label: "話す", description: "音声入力" },
    { icon: FileText, label: "文字起こし", description: "Speech-to-Text" },
    { icon: Sparkles, label: "フォーマット", description: "AI整形" },
    { icon: ClipboardPaste, label: "ペースト", description: "クリップボード" },
  ];

  if (compact) {
    return (
      <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
        {steps.map((step, index) => (
          <span key={step.label} className="flex items-center gap-1">
            <step.icon className="w-3 h-3" />
            <span>{step.label}</span>
            {index < steps.length - 1 && <ArrowRight className="w-3 h-3 mx-0.5" />}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-2 py-4">
      {steps.map((step, index) => (
        <div key={step.label} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-muted border border-border">
              <step.icon className="w-5 h-5 text-muted-foreground" />
            </div>
            <span className="mt-2 text-sm font-medium text-foreground">
              {step.label}
            </span>
            <span className="text-xs text-muted-foreground">{step.description}</span>
          </div>
          {index < steps.length - 1 && (
            <ArrowRight className="w-5 h-5 text-muted-foreground mx-2" />
          )}
        </div>
      ))}
    </div>
  );
}
