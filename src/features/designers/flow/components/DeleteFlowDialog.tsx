import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { useAppSelector } from "@/hooks/useRedux";
import { RootState } from "@/store"
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader, Trash2 } from "lucide-react";
import { useFlow } from '@/features/designers/flow/hooks/useFlow';
import type { Flow } from "@/types/designer/flow";

type DeleteFlowDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
};

export function DeleteFlowDialog({ open, onOpenChange, onSuccess }: DeleteFlowDialogProps) {
    const selectedFlow = useAppSelector((state: RootState) => state.flow.selectedFlow) as Flow | null;
    const [confirmationInput, setConfirmationInput] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const { handleDeleteFlow } = useFlow();

    const handleDelete = async () => {
        if (!selectedFlow) return;
        setIsDeleting(true);
        try {
            await handleDeleteFlow(selectedFlow.flow_id.toString());
            onOpenChange(false);
            onSuccess?.();
        } finally {
            setIsDeleting(false);
        }
    }

    if (!selectedFlow) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Confirm Delete</DialogTitle>
                </DialogHeader>
                <p>This action cannot be undone. This will permanently delete the <span className="font-semibold">{selectedFlow.flow_name}</span> flow and all of its data.</p>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="confirm" className="text-sm font-medium">
                            Please type <span className="font-semibold">{selectedFlow.flow_name}</span> to confirm.
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
                        disabled={confirmationInput !== selectedFlow.flow_name || isDeleting}
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
