import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface IExistingProjectModalProps {
  open: boolean;
  onClose: () => void;
}

export function ExistingProjectModal({ open, onClose }: IExistingProjectModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="rounded-md bg-white text-black border border-gray-300 p-3">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-red-600 flex items-center">
            <AlertTriangle className="mr-1 h-4 w-4 text-red-600" />
            Project Already Exists
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center gap-1 py-2 text-center">
          <p className="text-sm text-gray-700">
            A project with this name already exists. Please choose a different name.
          </p>
          <Button
            onClick={onClose}
            className="bg-black text-white hover:bg-gray-800 mt-2 h-8 text-sm"
          >
            OK
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}