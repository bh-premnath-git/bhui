import * as React from "react"
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
  isOpen: boolean
  onClose: () => void
  pipelineName: string
  onDelete: (withCommit: boolean) => Promise<void>
}

export default function DeletePipelineDialog({
  isOpen,
  onClose,
  pipelineName,
  onDelete
}: DeletePipelineDialogProps) {
  const [confirmText, setConfirmText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isConfirmValid = confirmText === pipelineName

  const handleDelete = async (withCommit: boolean) => {
    if (!isConfirmValid) return
    setIsLoading(true)
    setError(null)
    try {
      await onDelete(withCommit)
      onClose()
    } catch (err) {
      setError("An error occurred while deleting the pipeline. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Delete Pipeline
          </DialogTitle>
          <DialogDescription className="space-y-3 pt-3">
            <p>Are you sure you want to delete {pipelineName}?</p>
            <p className="text-muted-foreground">
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
                placeholder="Enter pipeline name"
                className="font-mono"
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
            variant="outline"
            onClick={() => handleDelete(true)}
            disabled={!isConfirmValid || isLoading}
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Commit & Save
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleDelete(false)}
            disabled={!isConfirmValid || isLoading}
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Delete without commit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}