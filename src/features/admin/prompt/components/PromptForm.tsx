import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, FormProvider } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Form } from "@/components/ui/form"
import { PromptDetailsFields, PromptInputFields } from "./FormFields"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { promptFormSchema, PromptFormValues } from "./promptFromSchema";

interface PromptFormProps {
  initialData?: PromptFormValues
  onSubmit: (data: PromptFormValues) => Promise<void>
  mode: "create" | "edit"
  isSubmitting: boolean
  error: string | null
}

export function PromptForm({ 
  initialData, 
  onSubmit, 
  mode, 
  isSubmitting,
  error,
}: PromptFormProps) {
  const [formState, setFormState] = useState<"idle" | "submitting" | "success" | "error">("idle")

  const form = useForm<PromptFormValues>({
    resolver: zodResolver(promptFormSchema),
    defaultValues: initialData || {
      prompt_name: "",
      module_id: "",
      prompt: "",
    },
  })

  const handleSubmit = async (data: PromptFormValues) => {
    try {
      setFormState("submitting")
      await onSubmit(data)
      setFormState("success")
    } catch (error) {
      setFormState("error")
    }
  }

  return (
    <Card className="w-full max-w-6xl mx-auto border-none shadow-none">
      <CardContent>
        <FormProvider {...form}>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
              <PromptDetailsFields 
                control={form.control}
               />
              <PromptInputFields control={form.control} />
              <div className="flex justify-center">
                <Button
                  type="submit"
                  className={isSubmitting ? "bg-blue-500 hover:bg-blue-600" : "bg-primary hover:bg-primary/90"}
                  size="lg"
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {mode === "create" ? "Create Prompt" : "Update Prompt"}
                </Button>
              </div>

              {error && (
                <div className="text-sm text-red-500 text-center mt-2">
                  {error}
                </div>
              )}
            </form>
          </Form>
        </FormProvider>
      </CardContent>
    </Card>
  )
}