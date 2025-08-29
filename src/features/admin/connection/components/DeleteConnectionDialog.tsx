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
import { useConnections } from '@/features/admin/connection/hooks/useConnection';
import type { Connection } from "@/types/admin/connection";

type DeleteConnectionDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
};

export function DeleteConnectionDialog({ open, onOpenChange, onSuccess }: DeleteConnectionDialogProps) {
    const selectedConnection = useAppSelector((state: RootState) => state.connections.selectedconnection as Connection | null);
    const [confirmationInput, setConfirmationInput] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const { handleDeleteConnection } = useConnections();
    

    const handleDelete = async () => {
        if (!selectedConnection) return;
        setIsDeleting(true);
        try {
            await handleDeleteConnection(selectedConnection.id.toString());
            onOpenChange(false);
            onSuccess?.();
        } finally {
            setIsDeleting(false);
        } 
    }

    if (!selectedConnection) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Confirm Delete</DialogTitle>
                </DialogHeader>
                <p>This action cannot be undone. This will permanently delete the <span className="font-semibold">{selectedConnection.connection_config_name}</span> connection and all of its data.</p>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="confirm" className="text-sm font-medium">
                            Please type <span className="font-semibold">{selectedConnection.connection_config_name}</span> to confirm.
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
                        disabled={confirmationInput !== selectedConnection.connection_config_name || isDeleting}
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
