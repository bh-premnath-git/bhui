import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { useAppSelector } from "@/hooks/uaeRedux";
import { RootState } from "@/store"
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader, Trash2 } from "lucide-react";


type DeleteFlowDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function DeleteFlowDialog({ open, onOpenChange }: DeleteFlowDialogProps) {
    const flowName = useAppSelector((state: RootState) => state.flow.selectedFlow?.flow_name)
    const [confirmationInput, setConfirmationInput] = useState("")

    const handleDelete = () => {

    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Confirm Delete</DialogTitle>
                </DialogHeader>
                <p>This action cannot be undone. This will permanently delete the <span className="font-semibold"> {flowName} </span> flow and all of its data.</p>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="confirm" className="text-sm font-medium">
                            Please type <span className="font-semibold">{flowName}</span> to confirm.
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
                    <Button variant="destructive" onClick={handleDelete} disabled={confirmationInput !== flowName}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
