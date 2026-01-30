import { NotebookText, Plus } from "lucide-react";
import { NoteCard } from "./note-card";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

export function NotesList() {
  const navigate = useNavigate();
  const utils = api.useUtils();

  const { data: notes, isLoading } = api.notes.getNotes.useQuery({
    sortBy: "updatedAt",
    sortOrder: "desc",
  });

  // Create note mutation
  const createNoteMutation = api.notes.createNote.useMutation({
    onSuccess: (newNote) => {
      // Invalidate notes list to refetch
      utils.notes.getNotes.invalidate();
      // Navigate to the new note
      navigate({
        to: "/settings/notes/$noteId",
        params: { noteId: String(newNote.id) },
      });
      toast.success("ノートを作成しました");
    },
    onError: (error) => {
      toast.error("ノートの作成に失敗しました: " + error.message);
    },
  });

  const onCreateNote = () => {
    createNoteMutation.mutate({
      title: "無題のノート",
      initialContent: "",
    });
  };

  const onNoteClick = (noteId: number) => {
    navigate({
      to: "/settings/notes/$noteId",
      params: { noteId: String(noteId) },
    });
  };

  // Convert database notes to UI format
  const formattedNotes = notes || [];

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <NotebookText className="w-4 h-4" />
          <h2 className="text-sm font-medium">ノート</h2>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-3 py-2 px-3">
              <Skeleton className="w-5 h-5 mt-0.5" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Create button - always visible */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground">
          <NotebookText className="w-4 h-4" />
          <h2 className="text-sm font-medium">ノート</h2>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={onCreateNote}
          disabled={createNoteMutation.isPending}
        >
          <Plus className="w-4 h-4" />
          ノートを作成
        </Button>
      </div>

      {formattedNotes.length > 0 && (
        <div>
          {formattedNotes.map((note) => (
            <NoteCard key={note.id} note={note} onNoteClick={onNoteClick} />
          ))}
        </div>
      )}

      {formattedNotes.length === 0 && (
        <div className="border border-dashed rounded-lg p-6 text-center space-y-4">
          <NotebookText className="w-8 h-8 text-muted-foreground mx-auto" />
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">まだノートがありません</p>
            <p className="text-xs text-muted-foreground">
              最初のノートを作成して始めましょう
            </p>
            <Button
              className="mt-4"
              size={"sm"}
              variant={"outline"}
              onClick={onCreateNote}
            >
              <Plus className="w-4 h-4" />
              ノートを作成
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
