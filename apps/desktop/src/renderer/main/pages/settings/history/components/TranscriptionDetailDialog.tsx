import { useState, useRef, useEffect } from "react";
import { Copy, Play, Pause, Download, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/trpc/react";
import { toast } from "sonner";

type TranscriptionItem = {
  id: number;
  text: string;
  timestamp: Date;
  language: string | null;
  audioFile: string | null;
  speechModel: string | null;
  formattingModel: string | null;
  createdAt: Date;
  updatedAt: Date;
};

interface TranscriptionDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transcription: TranscriptionItem | null;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(date));
}

function formatLanguage(code: string | null): string {
  if (!code) return "不明";
  const languageNames: Record<string, string> = {
    ja: "日本語",
    en: "英語",
    zh: "中国語",
    ko: "韓国語",
    es: "スペイン語",
    fr: "フランス語",
    de: "ドイツ語",
  };
  return languageNames[code] || code;
}

export function TranscriptionDetailDialog({
  open,
  onOpenChange,
  transcription,
}: TranscriptionDetailDialogProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const getAudioMutation = api.transcriptions.getAudioFile.useMutation({
    onSuccess: (data) => {
      const blob = new Blob(
        [Uint8Array.from(atob(data.data), (c) => c.charCodeAt(0))],
        { type: data.mimeType }
      );
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      setIsLoadingAudio(false);
    },
    onError: (error) => {
      toast.error(`音声の読み込みに失敗しました: ${error.message}`);
      setIsLoadingAudio(false);
    },
  });

  const downloadAudioMutation = api.transcriptions.downloadAudioFile.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        toast.success("音声ファイルを保存しました");
      }
    },
    onError: (error) => {
      toast.error(`ダウンロードに失敗しました: ${error.message}`);
    },
  });

  // Load audio when dialog opens and transcription has audio file
  useEffect(() => {
    if (open && transcription?.audioFile && !audioUrl) {
      setIsLoadingAudio(true);
      getAudioMutation.mutate({ transcriptionId: transcription.id });
    }
  }, [open, transcription?.id, transcription?.audioFile]);

  // Cleanup audio URL on dialog close
  useEffect(() => {
    if (!open) {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }
      setIsPlaying(false);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  }, [open]);

  const handleCopyText = async () => {
    if (!transcription) return;
    try {
      await navigator.clipboard.writeText(transcription.text);
      toast.success("クリップボードにコピーしました");
    } catch {
      toast.error("コピーに失敗しました");
    }
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleDownload = () => {
    if (!transcription) return;
    downloadAudioMutation.mutate({ transcriptionId: transcription.id });
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  if (!transcription) return null;

  const hasAudio = !!transcription.audioFile;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>履歴の詳細</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Text Content */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">テキスト</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyText}
                className="h-8"
              >
                <Copy className="w-4 h-4 mr-2" />
                コピー
              </Button>
            </div>
            <div className="bg-muted/50 rounded-md p-4">
              <p className="text-sm whitespace-pre-wrap break-words">
                {transcription.text}
              </p>
            </div>
          </div>

          {/* Audio Player */}
          {hasAudio && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                音声
              </h3>
              <div className="bg-muted/50 rounded-md p-4">
                {isLoadingAudio ? (
                  <p className="text-sm text-muted-foreground">
                    音声を読み込み中...
                  </p>
                ) : audioUrl ? (
                  <div className="flex items-center gap-4">
                    <audio
                      ref={audioRef}
                      src={audioUrl}
                      onEnded={handleAudioEnded}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePlayPause}
                      className="w-24"
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          停止
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          再生
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownload}
                      disabled={downloadAudioMutation.isPending}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {downloadAudioMutation.isPending ? "保存中..." : "保存"}
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    音声ファイルを読み込めませんでした
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">メタデータ</h3>
            <div className="bg-muted/50 rounded-md p-4 space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">日時</p>
                  <p>{formatDate(transcription.timestamp)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">言語</p>
                  <p>{formatLanguage(transcription.language)}</p>
                </div>
                {transcription.speechModel && (
                  <div>
                    <p className="text-muted-foreground">音声認識モデル</p>
                    <p>{transcription.speechModel}</p>
                  </div>
                )}
                {transcription.formattingModel && (
                  <div>
                    <p className="text-muted-foreground">整形モデル</p>
                    <p>{transcription.formattingModel}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>閉じる</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
