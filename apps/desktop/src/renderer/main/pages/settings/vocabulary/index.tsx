import { useState } from "react";
import { Plus, Edit, Trash2, HelpCircle, CheckSquare, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  reading1?: string | null;
  reading2?: string | null;
  reading3?: string | null;
  replacementWord?: string | null;
  isReplacement: boolean | null;
  dateAdded: Date;
  usageCount: number | null;
  createdAt: Date;
  updatedAt: Date;
};

type FormData = {
  word: string;
  reading1: string;
  reading2: string;
  reading3: string;
};

// Add/Edit Dialog Component
interface VocabularyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  formData: FormData;
  onFormDataChange: (data: FormData) => void;
  onSubmit: () => void;
  isLoading?: boolean;
}

// Help Dialog Component
function VocabularyHelpDialog({
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
          <div className="space-y-2">
            <h3 className="font-semibold">単語の登録</h3>
            <p className="text-muted-foreground">
              正しい表記の単語を登録します。音声認識のヒントとして使用され、
              専門用語や固有名詞の認識精度が向上します。
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">読み方パターン（任意）</h3>
            <p className="text-muted-foreground">
              音声認識で誤認識されやすい読み方を最大3つまで登録できます。
              登録した読み方で認識された場合、正しい単語に自動的に修正されます。
            </p>
            <div className="bg-muted/50 rounded-md p-3 space-y-1">
              <p className="text-xs text-muted-foreground">例:</p>
              <p>
                <span className="font-medium">単語:</span> Surasura
              </p>
              <p>
                <span className="font-medium">読み方:</span> スラスラ, すらすら
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                → 音声で「スラスラ」と認識されても「Surasura」に修正
              </p>
            </div>
          </div>

          <div className="bg-muted/50 rounded-md p-3 space-y-1">
            <p className="text-xs text-muted-foreground">もう1つの例:</p>
            <p>
              <span className="font-medium">単語:</span> Kubernetes
            </p>
            <p>
              <span className="font-medium">読み方:</span> クバネティス, クーベネティス
            </p>
          </div>

          {/* 処理の流れ */}
          <div className="border-t pt-4 space-y-2">
            <h3 className="font-semibold text-xs text-muted-foreground">処理の流れ</h3>
            <div className="flex items-center gap-2 text-xs flex-wrap">
              <span className="bg-muted px-2 py-1 rounded">音声入力</span>
              <span>→</span>
              <span className="bg-muted px-2 py-1 rounded">
                Whisper認識
                <span className="text-muted-foreground ml-1">(語彙ヒント)</span>
              </span>
              <span>→</span>
              <span className="bg-muted px-2 py-1 rounded">
                テキスト整形
                <span className="text-muted-foreground ml-1">(辞書で修正)</span>
              </span>
              <span>→</span>
              <span className="bg-primary/10 text-primary px-2 py-1 rounded">読み方置換</span>
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
  const readingCount = [formData.reading1, formData.reading2, formData.reading3].filter(
    (r) => r.trim(),
  ).length;
  const canAddReading = readingCount < 3;

  // Show reading fields based on how many are filled (always show at least the first)
  const showReading2 = formData.reading1.trim() !== "" || formData.reading2.trim() !== "";
  const showReading3 =
    (formData.reading1.trim() !== "" && formData.reading2.trim() !== "") ||
    formData.reading3.trim() !== "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "辞書に追加" : "辞書を編集"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="word-input">単語（正しい表記）</Label>
            <Input
              id="word-input"
              placeholder="例: Surasura"
              value={formData.word}
              onChange={(e) =>
                onFormDataChange({ ...formData, word: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">読み方パターン（任意、最大3つ）</Label>
            <Input
              placeholder="読み方 1（例: スラスラ）"
              value={formData.reading1}
              onChange={(e) =>
                onFormDataChange({ ...formData, reading1: e.target.value })
              }
            />
            {showReading2 && (
              <Input
                placeholder="読み方 2"
                value={formData.reading2}
                onChange={(e) =>
                  onFormDataChange({ ...formData, reading2: e.target.value })
                }
              />
            )}
            {showReading3 && (
              <Input
                placeholder="読み方 3"
                value={formData.reading3}
                onChange={(e) =>
                  onFormDataChange({ ...formData, reading3: e.target.value })
                }
              />
            )}
            {!showReading2 && canAddReading && (
              <button
                type="button"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                onClick={() =>
                  onFormDataChange({ ...formData, reading1: formData.reading1 || " " })
                }
              >
                + 読み方を追加
              </button>
            )}
          </div>

          <DialogFooter className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              キャンセル
            </Button>
            <Button
              onClick={onSubmit}
              disabled={!formData.word.trim() || isLoading}
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
  title: string;
  message: string;
  onConfirm: () => void;
  isLoading?: boolean;
}

function DeleteDialog({
  open,
  onOpenChange,
  title,
  message,
  onConfirm,
  isLoading = false,
}: DeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{message}</p>
          <p className="text-sm text-muted-foreground">
            この操作は取り消せません。
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

function getReadings(item: VocabularyItem): string[] {
  const readings: string[] = [];
  if (item.reading1) readings.push(item.reading1);
  if (item.reading2) readings.push(item.reading2);
  if (item.reading3) readings.push(item.reading3);
  return readings;
}

export default function VocabularySettingsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<VocabularyItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<VocabularyItem | null>(null);

  // Bulk delete
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    word: "",
    reading1: "",
    reading2: "",
    reading3: "",
  });

  const vocabularyQuery = api.vocabulary.getVocabulary.useQuery({
    limit: 100,
    offset: 0,
    sortBy: "dateAdded",
    sortOrder: "desc",
  });

  const statsQuery = api.vocabulary.getVocabularyStats.useQuery();

  const vocabularyItems = vocabularyQuery.data || [];
  const vocabularyLoading = vocabularyQuery.isLoading;
  const stats = statsQuery.data;

  // tRPC mutations
  const utils = api.useUtils();
  const createVocabularyMutation =
    api.vocabulary.createVocabularyWord.useMutation({
      onSuccess: () => {
        utils.vocabulary.getVocabulary.invalidate();
        utils.vocabulary.getVocabularyStats.invalidate();
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
      utils.vocabulary.getVocabularyStats.invalidate();
      toast.success("単語を削除しました");
    },
    onError: (error) => {
      toast.error(`削除に失敗しました: ${error.message}`);
    },
  });

  const deleteManyMutation = api.vocabulary.deleteMany.useMutation({
    onSuccess: (result) => {
      utils.vocabulary.getVocabulary.invalidate();
      utils.vocabulary.getVocabularyStats.invalidate();
      setSelectedIds(new Set());
      toast.success(`${result.deleted}件の単語を削除しました`);
    },
    onError: (error) => {
      toast.error(`削除に失敗しました: ${error.message}`);
    },
  });

  const handleAddWord = async () => {
    try {
      await createVocabularyMutation.mutateAsync({
        word: formData.word,
        reading1: formData.reading1.trim() || undefined,
        reading2: formData.reading2.trim() || undefined,
        reading3: formData.reading3.trim() || undefined,
      });
      setFormData({ word: "", reading1: "", reading2: "", reading3: "" });
      setIsAddDialogOpen(false);
    } catch {
      // Error is handled by the mutation's onError callback
    }
  };

  const handleEditWord = async () => {
    if (!editingItem) return;

    try {
      await updateVocabularyMutation.mutateAsync({
        id: editingItem.id,
        data: {
          word: formData.word,
          reading1: formData.reading1.trim() || null,
          reading2: formData.reading2.trim() || null,
          reading3: formData.reading3.trim() || null,
        },
      });
      setFormData({ word: "", reading1: "", reading2: "", reading3: "" });
      setEditingItem(null);
      setIsEditDialogOpen(false);
    } catch {
      // Error is handled by the mutation's onError callback
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
    }
  };

  const openEditDialog = (item: VocabularyItem) => {
    setEditingItem(item);
    setFormData({
      word: item.word,
      reading1: item.reading1 || "",
      reading2: item.reading2 || "",
      reading3: item.reading3 || "",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (item: VocabularyItem) => {
    setDeletingItem(item);
    setIsDeleteDialogOpen(true);
  };

  // Selection handling
  const handleSelectItem = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === vocabularyItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(vocabularyItems.map((item) => item.id)));
    }
  };

  const isAllSelected =
    vocabularyItems.length > 0 &&
    selectedIds.size === vocabularyItems.length;
  const hasSelection = selectedIds.size > 0;

  // Bulk delete
  const handleBulkDeleteClick = () => {
    if (selectedIds.size === 0) return;
    setIsBulkDeleteDialogOpen(true);
  };

  const handleBulkDeleteConfirm = async () => {
    try {
      await deleteManyMutation.mutateAsync({
        ids: Array.from(selectedIds),
      });
      setIsBulkDeleteDialogOpen(false);
    } catch {
      // Error handled by mutation
    }
  };

  const resetForm = () => {
    setFormData({ word: "", reading1: "", reading2: "", reading3: "" });
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
            音声入力で使用する単語と読み方パターンを管理します。
          </p>
          {stats && (
            <p className="text-muted-foreground mt-1 text-sm">
              登録数: <span className="font-medium text-foreground">{stats.count}</span> / {stats.maxCount} 件
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {hasSelection && (
            <Button
              variant="destructive"
              onClick={handleBulkDeleteClick}
              disabled={deleteManyMutation.isPending}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {selectedIds.size}件を削除
            </Button>
          )}
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
              {/* Select All Header */}
              <div className="flex items-center gap-3 py-2 px-4 border-b border-border bg-muted/30">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  title={isAllSelected ? "選択を解除" : "すべて選択"}
                >
                  {isAllSelected ? (
                    <CheckSquare className="w-5 h-5" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                </button>
                <span className="text-sm text-muted-foreground">
                  {hasSelection ? `${selectedIds.size}件選択中` : ""}
                </span>
              </div>

              {vocabularyItems.map((item, index) => {
                const readings = getReadings(item);
                return (
                  <div
                    className={`hover:bg-muted/50 transition-colors ${
                      selectedIds.has(item.id) ? "bg-muted/30" : ""
                    }`}
                    key={item.id}
                  >
                    <div className="flex items-center py-3 px-4 group gap-3">
                      {/* Checkbox */}
                      <button
                        type="button"
                        onClick={() => handleSelectItem(item.id)}
                        className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                      >
                        {selectedIds.has(item.id) ? (
                          <CheckSquare className="w-5 h-5 text-primary" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>

                      {/* Content */}
                      <div className="flex-1 min-w-0 flex items-center gap-2 text-sm">
                        <span>{item.word}</span>
                        {readings.length > 0 && (
                          <span className="text-xs text-muted-foreground">
                            読み: {readings.join(", ")}
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
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
                );
              })}
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

      {/* Single Delete Confirmation Dialog */}
      <DeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="単語を削除"
        message={deletingItem ? `「${deletingItem.word}」を削除しますか？` : ""}
        onConfirm={handleDeleteWord}
        isLoading={deleteVocabularyMutation.isPending}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <DeleteDialog
        open={isBulkDeleteDialogOpen}
        onOpenChange={setIsBulkDeleteDialogOpen}
        title="選択した単語を削除"
        message={`選択した ${selectedIds.size} 件の単語を削除しますか？`}
        onConfirm={handleBulkDeleteConfirm}
        isLoading={deleteManyMutation.isPending}
      />

      <VocabularyHelpDialog
        open={isHelpDialogOpen}
        onOpenChange={setIsHelpDialogOpen}
      />
    </div>
  );
}
