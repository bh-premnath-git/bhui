import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Form } from "@/components/ui/form"
import { projectFormSchema, type ProjectFormValues } from "./projectFormSchema"
import { ProjectNameField, GithubFields, TagsField } from "./FormFields"
import { Loader2 } from "lucide-react"
import { useState, useEffect } from "react"

interface ProjectFormProps {
  initialData?: ProjectFormValues
  onSubmit: (data: ProjectFormValues) => Promise<void>
  mode: "create" | "edit"
  isSubmitting: boolean
  error: string | null
}

export function ProjectForm({ initialData, onSubmit, mode, isSubmitting, error }: ProjectFormProps) {
  const [formState, setFormState] = useState<"idle" | "submitting" | "success" | "error">("idle")

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: initialData || {
      projectName: "",
      githubProvider: "",
      githubUsername: "",
      githubEmail: "",
      defaultBranch: "main",
      githubRepositoryUrl: "",
      githubToken: "",
      tags: [],
    },
  })

  const isEditMode = mode === "edit"

  useEffect(() => {
    if (isSubmitting) {
      setFormState("submitting")
    } else if (error) {
      setFormState("error")
    } else if (!isSubmitting && formState === "submitting") {
      setFormState("success")
      const timer = setTimeout(() => setFormState("idle"), 2000)
      return () => clearTimeout(timer)
    }
  }, [isSubmitting, error, formState])

  const handleSubmit = async (data: ProjectFormValues) => {
    try {
      await onSubmit(data)
    } catch (error) {
      console.error("Form submission error:", error)
    }
  }

  const getButtonStyles = () => {
    switch (formState) {
      case "submitting":
        return "bg-blue-500 hover:bg-blue-600"
      case "success":
        return "bg-green-500 hover:bg-green-600"
      case "error":
        return "bg-red-500 hover:bg-red-600"
      default:
        return "bg-primary hover:bg-primary/90"
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto border-none shadow-none">
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
            <ProjectNameField form={form} />
            <GithubFields form={form} />
            <TagsField form={form} />
            <div className="flex justify-center">
              <Button type="submit" className={`px-8 w-40 ${getButtonStyles()}`} disabled={formState === "submitting"}>
                {formState === "submitting" ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {isEditMode ? "Updating..." : "Creating..."}
                  </>
                ) : formState === "success" ? (
                  "Success!"
                ) : formState === "error" ? (
                  "Error"
                ) : isEditMode ? (
                  "Update Project"
                ) : (
                  "Create Project"
                )}
              </Button>
            </div>
            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}