import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { formSchema, type FormValues } from "./schema"
import { PipelineForm } from "./pipeline-form"

interface CreatePipelineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatePipelineDialog({ open, onOpenChange }: CreatePipelineDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      project: "",
      name: "",
      notes: "",
    },
  })

  const handleSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true)
      // Add your submission logic here
      form.reset()
      onOpenChange(false)
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Pipeline</DialogTitle>
        </DialogHeader>
        <PipelineForm 
          form={form} 
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
