import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAppSelector } from "@/hooks/useRedux";
import { RootState } from "@/store";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader, Trash2 } from "lucide-react";
import { useLlms } from "@/features/admin/llm/hooks/useLlms";
import type { LLM } from "@/types/admin/llm";

type DeleteLlmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export function DeleteLlmDialog({
  open,
  onOpenChange,
  onSuccess,
}: DeleteLlmDialogProps) {
  const selectedLlm = useAppSelector(
    (state: RootState) => state.llms.selectedLlm as LLM | null
  );
  const [confirmationInput, setConfirmationInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const { handleDeleteLlm } = useLlms();

  const handleDelete = async () => {
    if (!selectedLlm) return;
    setIsDeleting(true);
    try {
      await handleDeleteLlm(selectedLlm.id.toString());
      onOpenChange(false);
      onSuccess?.();
    } finally {
      setIsDeleting(false);
    }
  };

  if (!selectedLlm) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Delete</DialogTitle>
        </DialogHeader>
        <p>
          This action cannot be undone. This will permanently delete the{" "}
          <span className="font-semibold">{selectedLlm.provider}</span> LLM
          configuration.
        </p>
        <div className="space-y-4">
          <div>
            <Label htmlFor="confirm" className="text-sm font-medium">
              Please type{" "}
              <span className="font-semibold">{selectedLlm.provider}</span> to
              confirm.
            </Label>
            <Input
              id="confirm"
              value={confirmationInput}
              onChange={(e) => setConfirmationInput(e.target.value)}
              className="mt-1"
              disabled={isDeleting}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={
              confirmationInput !== selectedLlm.provider || isDeleting
            }
          >
            {isDeleting ? (
              <>
                <Loader className="h-4 w-4 animate-spin mr-2" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
