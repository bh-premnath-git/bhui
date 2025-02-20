import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Save, Loader } from "lucide-react"
import { UseFormReturn } from "react-hook-form"
import { FormValues } from "./schema"
import { BasicInformation } from "./form-sections/basic-information"
import { AdditionalNotes } from "./form-sections/additional-notes"
import { DialogFooter } from "@/components/ui/dialog"

interface PipelineFormProps {
    form: UseFormReturn<FormValues>
    onSubmit: (values: FormValues) => Promise<void>
    isSubmitting?: boolean
}

export function PipelineForm({ form, onSubmit, isSubmitting = false }: PipelineFormProps) {
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
                <BasicInformation form={form} />
                <AdditionalNotes form={form} />
                <DialogFooter>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                        <Save className="mr-2" />
                    </Button>
                </DialogFooter>
            </form>
        </Form>
    )
}
