import { useState, useCallback } from "react";
import { Copy, Trash2, Search, ChevronLeft, ChevronRight, Eye, CheckSquare, Square, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { TranscriptionDetailDialog } from "./components/TranscriptionDetailDialog";

const ITEMS_PER_PAGE = 20;

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
            この操作は取り消せません。関連する音声ファイルも削除されます。
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

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

export default function HistorySettingsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(0);

  // Single item delete
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<TranscriptionItem | null>(null);

  // Bulk delete
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);

  // Delete all
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false);

  // Detail view
  const [selectedItem, setSelectedItem] = useState<TranscriptionItem | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // Debounce search input
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setCurrentPage(0);
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(value);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, []);

  const transcriptionsQuery = api.transcriptions.getTranscriptions.useQuery({
    limit: ITEMS_PER_PAGE,
    offset: currentPage * ITEMS_PER_PAGE,
    sortBy: "timestamp",
    sortOrder: "desc",
    search: debouncedSearch || undefined,
  });

  const countQuery = api.transcriptions.getTranscriptionsCount.useQuery({
    search: debouncedSearch || undefined,
  });

  const limitsQuery = api.transcriptions.getHistoryLimits.useQuery();

  const transcriptionItems = (transcriptionsQuery.data || []) as TranscriptionItem[];
  const totalCount = countQuery.data || 0;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const isLoading = transcriptionsQuery.isLoading || countQuery.isLoading;
  const limits = limitsQuery.data;

  const utils = api.useUtils();

  const deleteTranscriptionMutation = api.transcriptions.deleteTranscription.useMutation({
    onSuccess: () => {
      utils.transcriptions.getTranscriptions.invalidate();
      utils.transcriptions.getTranscriptionsCount.invalidate();
      toast.success("履歴を削除しました");
    },
    onError: (error) => {
      toast.error(`削除に失敗しました: ${error.message}`);
    },
  });

  const deleteManyMutation = api.transcriptions.deleteMany.useMutation({
    onSuccess: (result) => {
      utils.transcriptions.getTranscriptions.invalidate();
      utils.transcriptions.getTranscriptionsCount.invalidate();
      setSelectedIds(new Set());
      toast.success(`${result.deleted}件の履歴を削除しました`);
    },
    onError: (error) => {
      toast.error(`削除に失敗しました: ${error.message}`);
    },
  });

  const deleteAllMutation = api.transcriptions.deleteAll.useMutation({
    onSuccess: (result) => {
      utils.transcriptions.getTranscriptions.invalidate();
      utils.transcriptions.getTranscriptionsCount.invalidate();
      setSelectedIds(new Set());
      setCurrentPage(0);
      toast.success(`${result.deleted}件の履歴をすべて削除しました`);
    },
    onError: (error) => {
      toast.error(`削除に失敗しました: ${error.message}`);
    },
  });

  const handleCopyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("クリップボードにコピーしました");
    } catch {
      toast.error("コピーに失敗しました");
    }
  };

  // Single item delete
  const handleDeleteClick = (item: TranscriptionItem) => {
    setDeletingItem(item);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;

    try {
      await deleteTranscriptionMutation.mutateAsync({
        id: deletingItem.id,
      });
      setDeletingItem(null);
      setIsDeleteDialogOpen(false);
    } catch {
      // Error handled by mutation
    }
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
    if (selectedIds.size === transcriptionItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(transcriptionItems.map((item) => item.id)));
    }
  };

  const isAllSelected = transcriptionItems.length > 0 && selectedIds.size === transcriptionItems.length;
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

  // Delete all
  const handleDeleteAllClick = () => {
    if (totalCount === 0) return;
    setIsDeleteAllDialogOpen(true);
  };

  const handleDeleteAllConfirm = async () => {
    try {
      await deleteAllMutation.mutateAsync();
      setIsDeleteAllDialogOpen(false);
    } catch {
      // Error handled by mutation
    }
  };

  const handleViewDetail = (item: TranscriptionItem) => {
    setSelectedItem(item);
    setIsDetailDialogOpen(true);
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      setSelectedIds(new Set()); // Clear selection on page change
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
      setSelectedIds(new Set()); // Clear selection on page change
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold">履歴</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            音声認識の履歴を確認・管理します。
          </p>
          <p className="text-muted-foreground mt-1 text-sm">
            全 <span className="font-medium text-foreground">{totalCount}</span> 件
            {limits && (
              <span className="ml-2 text-xs">
                (最大 {limits.maxCount}件 / {limits.maxAgeDays}日間保存)
              </span>
            )}
          </p>
        </div>

        {/* Delete All Button */}
        <Button
          variant="outline"
          onClick={handleDeleteAllClick}
          disabled={totalCount === 0 || deleteAllMutation.isPending}
          className="text-destructive hover:text-destructive"
        >
          <Trash className="w-4 h-4 mr-2" />
          すべて削除
        </Button>
      </div>

      {/* Search Bar and Bulk Actions */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="テキストを検索..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Bulk Delete Button */}
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
      </div>

      {/* History List */}
      <Card className="p-0 overflow-clip">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              読み込み中...
            </div>
          ) : transcriptionItems.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {debouncedSearch
                ? "検索結果がありません。"
                : "履歴がありません。音声入力を始めましょう。"}
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
                  {hasSelection
                    ? `${selectedIds.size}件選択中`
                    : "選択してまとめて削除"}
                </span>
              </div>

              {transcriptionItems.map((item, index) => (
                <div
                  className={`hover:bg-muted/50 transition-colors ${
                    selectedIds.has(item.id) ? "bg-muted/30" : ""
                  }`}
                  key={item.id}
                >
                  <div className="flex items-start py-3 px-4 group gap-3">
                    {/* Checkbox */}
                    <button
                      type="button"
                      onClick={() => handleSelectItem(item.id)}
                      className="mt-0.5 text-muted-foreground hover:text-foreground transition-colors shrink-0"
                    >
                      {selectedIds.has(item.id) ? (
                        <CheckSquare className="w-5 h-5 text-primary" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">
                        {truncateText(item.text, 100)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(item.timestamp)}
                        {item.language && (
                          <span className="ml-2">
                            言語: {item.language}
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetail(item)}
                        title="詳細を表示"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyText(item.text)}
                        title="クリップボードにコピー"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(item)}
                        title="削除"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  {index < transcriptionItems.length - 1 && (
                    <div className="border-t border-border" />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            {currentPage * ITEMS_PER_PAGE + 1} - {Math.min((currentPage + 1) * ITEMS_PER_PAGE, totalCount)} / {totalCount} 件
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="w-4 h-4" />
              前へ
            </Button>
            <span className="text-sm text-muted-foreground px-2">
              {currentPage + 1} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage >= totalPages - 1}
            >
              次へ
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Single Delete Confirmation Dialog */}
      <DeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="履歴を削除"
        message={
          deletingItem
            ? `「${truncateText(deletingItem.text, 50)}」を削除しますか？`
            : ""
        }
        onConfirm={handleDeleteConfirm}
        isLoading={deleteTranscriptionMutation.isPending}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <DeleteDialog
        open={isBulkDeleteDialogOpen}
        onOpenChange={setIsBulkDeleteDialogOpen}
        title="選択した履歴を削除"
        message={`選択した ${selectedIds.size} 件の履歴を削除しますか？`}
        onConfirm={handleBulkDeleteConfirm}
        isLoading={deleteManyMutation.isPending}
      />

      {/* Delete All Confirmation Dialog */}
      <DeleteDialog
        open={isDeleteAllDialogOpen}
        onOpenChange={setIsDeleteAllDialogOpen}
        title="すべての履歴を削除"
        message={`すべての履歴 (${totalCount} 件) を削除しますか？`}
        onConfirm={handleDeleteAllConfirm}
        isLoading={deleteAllMutation.isPending}
      />

      {/* Detail Dialog */}
      <TranscriptionDetailDialog
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        transcription={selectedItem}
      />
    </div>
  );
}
