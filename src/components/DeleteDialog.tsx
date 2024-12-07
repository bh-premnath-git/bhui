import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertTriangle, Loader2 } from 'lucide-react'
import { useState } from "react"

interface DeletePipelineDialogProps {
  title: string;
  placeholder: string;
  isOpen: boolean
  onClose: () => void
  pipelineName: string
  onDelete: () => Promise<void>
}

export function DeleteDialog({
  title,
  placeholder,
  isOpen,
  onClose,
  pipelineName,
  onDelete
}: DeletePipelineDialogProps) {
  const [confirmText, setConfirmText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isConfirmValid = confirmText === pipelineName

  const handleDelete = async () => {
    if (!isConfirmValid) return
    setIsLoading(true)
    setError(null)
    try {
      await onDelete()
      onClose()
    } catch (err) {
      setError("An error occurred while deleting the pipeline. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="
          sm:max-w-md 
          bg-white/10 
          backdrop-blur-sm 
          border border-white/20 
          shadow-lg
          text-white
        "
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            {title}
          </DialogTitle>
          <DialogDescription className="space-y-3 pt-3 text-white">
            <p>Are you sure you want to delete {pipelineName}?</p>
            <p className="opacity-80">
              This action cannot be undone. This will permanently delete the {pipelineName}.
            </p>
            <div className="space-y-2">
              <Label htmlFor="confirm">
                Please type <span className="font-mono">{pipelineName}</span> to confirm.
              </Label>
              <Input
                id="confirm"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={placeholder}
                className="font-mono text-white"
                disabled={isLoading}
              />
            </div>
          </DialogDescription>
        </DialogHeader>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!isConfirmValid || isLoading}
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Delete 
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
