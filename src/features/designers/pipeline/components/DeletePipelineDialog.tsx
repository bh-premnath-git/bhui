import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAppSelector, useAppDispatch } from "@/hooks/useRedux";
import { RootState } from "@/store"
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader, Trash2 } from "lucide-react";
import { deletePipelineById, getAllPipeline } from "@/store/slices/designer/buildPipeLine/BuildPipeLineSlice";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

type DeletePipelineDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeletePipelineDialog({ open, onOpenChange }: DeletePipelineDialogProps) {
  const selectedPipeline = useAppSelector((state: RootState) => state.pipeline.selectedPipeline);
  const pipelineName = selectedPipeline?.pipeline_name;
  const [confirmationInput, setConfirmationInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  
  // Reset confirmation input when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setConfirmationInput("");
    }
  }, [open]);

  const handleDelete = async () => {
    if (!selectedPipeline?.pipeline_id) return;
    
    setIsDeleting(true);
    try {
      // Delete pipeline
      await dispatch(deletePipelineById(selectedPipeline.pipeline_id));
      
      // Force refresh the pipeline list in Redux
      await dispatch(getAllPipeline());
      
      // Invalidate React Query cache for pipelines - using the new syntax
      queryClient.invalidateQueries({ queryKey: ['pipelines'] });
      queryClient.invalidateQueries({ queryKey: ['pipelines', 'list'] });
      
      // Show success toast
      toast.success(`Pipeline "${pipelineName}" successfully deleted`);
      
      // Close the dialog - explicitly set to false
      onOpenChange(false);

      // Dispatch a custom event to notify parent components about the deletion
      window.dispatchEvent(new CustomEvent('pipelineDeleted', { 
        detail: { pipelineId: selectedPipeline.pipeline_id } 
      }));
    } catch(error) {
      console.error("Failed to delete pipeline:", error);
      toast.error(`Failed to delete pipeline: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(value) => {
      // Only allow closing if not in the middle of deletion
      if (!isDeleting || !value) {
        onOpenChange(value);
      }
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Delete</DialogTitle>
        </DialogHeader>
        <p>This action cannot be undone. This will permanently delete the <span className="font-semibold"> {pipelineName} </span> pipeline and all of its data.</p>
        <div className="space-y-4">
          <div>
            <Label htmlFor="confirm" className="text-sm font-medium">
              Please type <span className="font-semibold">{pipelineName}</span> to confirm.
            </Label>
            <Input
              id="confirm"
              value={confirmationInput}
              onChange={(e) => setConfirmationInput(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={confirmationInput !== pipelineName || isDeleting}>
            {isDeleting ? (
              <Loader className="h-4 w-4 animate-spin" />
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
