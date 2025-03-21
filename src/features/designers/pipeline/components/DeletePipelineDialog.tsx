import { useState } from "react";
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
import { deletePipelineById } from "@/store/slices/designer/buildPipeLine/BuildPipeLineSlice";

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

  const handleDelete = async () => {
    if (!selectedPipeline?.pipeline_id) return;
    
    setIsDeleting(true);
    try {
      await dispatch(deletePipelineById(selectedPipeline.pipeline_id));
      onOpenChange(false);
    }catch(error){
      console.log(error)
    // Call success callback if you have one
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
