import { useState } from "react";
import { Plus, Edit, Trash2, MoveRight, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { api } from "@/trpc/react";
import { toast } from "sonner";

type VocabularyItem = {
  id: number;
  word: string;
  replacementWord?: string | null;
  isReplacement: boolean | null;
  dateAdded: Date;
  usageCount: number | null;
  createdAt: Date;
  updatedAt: Date;
};

// Add/Edit Dialog Component
interface VocabularyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  formData: {
    word: string;
    replacementWord: string;
    isReplacement: boolean;
  };
  onFormDataChange: (data: {
    word: string;
    replacementWord: string;
    isReplacement: boolean;
  }) => void;
  onSubmit: () => void;
  isLoading?: boolean;
}

// Help Dialog Component for explaining replacement feature
function ReplacementHelpDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>辞書機能について</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          {/* 置換OFF */}
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <span className="bg-muted px-2 py-0.5 rounded text-xs">置換OFF</span>
              カスタム語彙として登録
            </h3>
            <p className="text-muted-foreground">
              登録した単語は、音声認識時のヒントとして使用されます。
              専門用語や固有名詞など、認識されにくい単語の精度が向上します。
            </p>
            <div className="bg-muted/50 rounded-md p-3 space-y-1">
              <p className="text-xs text-muted-foreground">例: 「Surasura」を登録</p>
              <p>
                <span className="text-muted-foreground">音声:</span> 「スラスラを起動して」
              </p>
              <p>
                <span className="text-muted-foreground">結果:</span> 「Surasuraを起動して」
                <span className="text-xs text-green-600 ml-2">← 認識精度UP</span>
              </p>
            </div>
          </div>

          {/* 置換ON */}
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">置換ON</span>
              自動置換ルールとして登録
            </h3>
            <p className="text-muted-foreground">
              音声認識が完了した後、指定した単語を別の単語に自動的に置き換えます。
              表記の統一や、よく誤認識される単語の修正に便利です。
            </p>
            <div className="bg-muted/50 rounded-md p-3 space-y-1">
              <p className="text-xs text-muted-foreground">例: 「すらすら」→「Surasura」を登録</p>
              <p>
                <span className="text-muted-foreground">認識結果:</span> 「すらすらを起動して」
              </p>
              <p>
                <span className="text-muted-foreground">置換後:</span> 「Surasuraを起動して」
                <span className="text-xs text-green-600 ml-2">← 自動変換</span>
              </p>
            </div>
          </div>

          {/* 処理の流れ */}
          <div className="border-t pt-4 space-y-2">
            <h3 className="font-semibold text-xs text-muted-foreground">処理の流れ</h3>
            <div className="flex items-center gap-2 text-xs flex-wrap">
              <span className="bg-muted px-2 py-1 rounded">音声入力</span>
              <span>→</span>
              <span className="bg-muted px-2 py-1 rounded">
                Whisper認識
                <span className="text-muted-foreground ml-1">(語彙ヒント使用)</span>
              </span>
              <span>→</span>
              <span className="bg-muted px-2 py-1 rounded">テキスト整形</span>
              <span>→</span>
              <span className="bg-primary/10 text-primary px-2 py-1 rounded">置換処理</span>
              <span>→</span>
              <span className="bg-muted px-2 py-1 rounded">完了</span>
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

function VocabularyDialog({
  open,
  onOpenChange,
  mode,
  formData,
  onFormDataChange,
  onSubmit,
  isLoading = false,
}: VocabularyDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "辞書に追加" : "辞書を編集"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="replacement-toggle">置換を有効にする</Label>
            <Switch
              id="replacement-toggle"
              checked={formData.isReplacement}
              onCheckedChange={(checked) =>
                onFormDataChange({ ...formData, isReplacement: checked })
              }
            />
          </div>

          {formData.isReplacement ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="置換前"
                  value={formData.word}
                  onChange={(e) =>
                    onFormDataChange({ ...formData, word: e.target.value })
                  }
                />
                <span className="text-muted-foreground">→</span>
                <Input
                  placeholder="置換後"
                  value={formData.replacementWord}
                  onChange={(e) =>
                    onFormDataChange({
                      ...formData,
                      replacementWord: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          ) : (
            <Input
              placeholder="新しい単語を入力"
              value={formData.word}
              onChange={(e) =>
                onFormDataChange({ ...formData, word: e.target.value })
              }
            />
          )}

          <DialogFooter className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              キャンセル
            </Button>
            <Button
              onClick={onSubmit}
              disabled={
                !formData.word.trim() ||
                (formData.isReplacement && !formData.replacementWord.trim()) ||
                isLoading
              }
            >
              {isLoading
                ? "保存中..."
                : mode === "add"
                  ? "追加"
                  : "保存"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Delete Confirmation Dialog Component
interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deletingItem: VocabularyItem | null;
  onConfirm: () => void;
  isLoading?: boolean;
}

function DeleteDialog({
  open,
  onOpenChange,
  deletingItem,
  onConfirm,
  isLoading = false,
}: DeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>単語を削除</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            「
            {deletingItem?.isReplacement
              ? `${deletingItem?.word} → ${deletingItem?.replacementWord}`
              : deletingItem?.word}
            」を削除しますか？この操作は取り消せません。
          </p>
        </div>

        <DialogFooter className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "削除中..." : "削除"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function VocabularySettingsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<VocabularyItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<VocabularyItem | null>(null);
  const [formData, setFormData] = useState({
    word: "",
    replacementWord: "",
    isReplacement: false,
  });

  const vocabularyQuery = api.vocabulary.getVocabulary.useQuery({
    limit: 100,
    offset: 0,
    sortBy: "dateAdded",
    sortOrder: "desc",
  });

  const vocabularyItems = vocabularyQuery.data || [];
  const vocabularyLoading = vocabularyQuery.isLoading;

  // tRPC mutations
  const utils = api.useUtils();
  const createVocabularyMutation =
    api.vocabulary.createVocabularyWord.useMutation({
      onSuccess: () => {
        utils.vocabulary.getVocabulary.invalidate();
        toast.success("単語を追加しました");
      },
      onError: (error) => {
        toast.error(`追加に失敗しました: ${error.message}`);
      },
    });

  const updateVocabularyMutation = api.vocabulary.updateVocabulary.useMutation({
    onSuccess: () => {
      utils.vocabulary.getVocabulary.invalidate();
      toast.success("単語を更新しました");
    },
    onError: (error) => {
      toast.error(`更新に失敗しました: ${error.message}`);
    },
  });

  const deleteVocabularyMutation = api.vocabulary.deleteVocabulary.useMutation({
    onSuccess: () => {
      utils.vocabulary.getVocabulary.invalidate();
      toast.success("単語を削除しました");
    },
    onError: (error) => {
      toast.error(`削除に失敗しました: ${error.message}`);
    },
  });

  const handleAddWord = async () => {
    try {
      await createVocabularyMutation.mutateAsync({
        word: formData.word,
        isReplacement: formData.isReplacement,
        replacementWord: formData.isReplacement
          ? formData.replacementWord
          : undefined,
      });
      setFormData({ word: "", replacementWord: "", isReplacement: false });
      setIsAddDialogOpen(false);
    } catch {
      // Error is handled by the mutation's onError callback
      // Keep dialog open so user can retry
    }
  };

  const handleEditWord = async () => {
    if (!editingItem) return;

    try {
      await updateVocabularyMutation.mutateAsync({
        id: editingItem.id,
        data: {
          word: formData.word,
          isReplacement: formData.isReplacement,
          replacementWord: formData.isReplacement
            ? formData.replacementWord
            : undefined,
        },
      });
      setFormData({ word: "", replacementWord: "", isReplacement: false });
      setEditingItem(null);
      setIsEditDialogOpen(false);
    } catch {
      // Error is handled by the mutation's onError callback
      // Keep dialog open so user can retry
    }
  };

  const handleDeleteWord = async () => {
    if (!deletingItem) return;

    try {
      await deleteVocabularyMutation.mutateAsync({
        id: deletingItem.id,
      });
      setDeletingItem(null);
      setIsDeleteDialogOpen(false);
    } catch {
      // Error is handled by the mutation's onError callback
      // Keep dialog open so user can retry
    }
  };

  const openEditDialog = (item: VocabularyItem) => {
    setEditingItem(item);
    setFormData({
      word: item.word,
      replacementWord: item.replacementWord || "",
      isReplacement: item.isReplacement || false,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (item: VocabularyItem) => {
    setDeletingItem(item);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({ word: "", replacementWord: "", isReplacement: false });
    setEditingItem(null);
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">辞書機能</h1>
            <button
              type="button"
              onClick={() => setIsHelpDialogOpen(true)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            音声入力で使用するカスタム単語と置換ルールを管理します。
          </p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => resetForm()}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              単語を追加
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      {/* Vocabulary List */}
      <Card className="p-0 overflow-clip">
        <CardContent className="p-0">
          {vocabularyLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              読み込み中...
            </div>
          ) : vocabularyItems.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              登録された単語がありません。「単語を追加」から登録を始めましょう。
            </div>
          ) : (
            <div className="space-y-0">
              {vocabularyItems.map((item, index) => (
                <div
                  className="hover:bg-muted/50 transition-colors"
                  key={item.id}
                >
                  <div className="flex items-center justify-between py-3 px-4 group">
                    <span className="text-sm flex items-center gap-1">
                      {item.isReplacement ? (
                        <>
                          <span>{item.word}</span>
                          <MoveRight className="w-4 h-4 mx-2" />
                          <span>{item.replacementWord}</span>
                        </>
                      ) : (
                        item.word
                      )}
                    </span>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(item)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteDialog(item)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  {index < vocabularyItems.length - 1 && (
                    <div className="border-t border-border" />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog Components */}
      <VocabularyDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        mode="add"
        formData={formData}
        onFormDataChange={setFormData}
        onSubmit={handleAddWord}
        isLoading={createVocabularyMutation.isPending}
      />

      <VocabularyDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        mode="edit"
        formData={formData}
        onFormDataChange={setFormData}
        onSubmit={handleEditWord}
        isLoading={updateVocabularyMutation.isPending}
      />

      <DeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        deletingItem={deletingItem}
        onConfirm={handleDeleteWord}
        isLoading={deleteVocabularyMutation.isPending}
      />

      <ReplacementHelpDialog
        open={isHelpDialogOpen}
        onOpenChange={setIsHelpDialogOpen}
      />
    </div>
  );
}
