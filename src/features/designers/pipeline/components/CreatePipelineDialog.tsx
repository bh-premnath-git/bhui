import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CreatePipelineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatePipelineDialog({ open, onOpenChange }: CreatePipelineDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Pipeline</DialogTitle>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
