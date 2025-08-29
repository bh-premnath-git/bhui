import React from "react"
import { z } from "zod"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

// shadcn/ui imports:
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

import { CustomField } from "./CustomField"

// Types
interface Tag {
  tagKey: string
  tagValue: string
}

interface TagDialogProps {
  isOpen: boolean
  closeDialog: () => void
  tags: Tag[]
  setTags: (tags: Tag[]) => void
}

// Zod schema for validation
const schema = z.object({
  tagKey: z.string().nonempty("Tag Key is required"),
  tagValue: z.string().nonempty("Tag Value is required"),
})

// Our component
const TagDialog: React.FC<TagDialogProps> = ({
  isOpen,
  closeDialog,
  tags,
  setTags,
}) => {
  // Setup react-hook-form with zod
  const methods = useForm<Tag>({
    resolver: zodResolver(schema),
    defaultValues: {
      tagKey: "",
      tagValue: "",
    },
  })

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods

  // Called on valid submit
  const onSubmit = (values: Tag) => {
    // Add the new tag to the existing list
    setTags([...tags, values])
    closeDialog()
  }

  return (
    <Dialog
      open={isOpen}
      // If the user clicks outside or presses Escape, 
      // the `onOpenChange` callback will be triggered with `open=false`
      onOpenChange={(open) => {
        if (!open) {
          closeDialog()
        }
      }}
    >
      <DialogContent className="max-w-sm"> 
        {/* You can adjust width or styling via Tailwind classes */}
        <DialogHeader>
          <DialogTitle>Add Tags</DialogTitle>
        </DialogHeader>

        {/* Form */}
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CustomField
              name="tagKey"
              label="Tag Key"
              control={methods.control}
              required
            />
            <CustomField
              name="tagValue"
              label="Tag Value"
              control={methods.control}
              required
            />

            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={closeDialog}
                disabled={isSubmitting}
              >
                Close
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                Add
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}

export default TagDialog
