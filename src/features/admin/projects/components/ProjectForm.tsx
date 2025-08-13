import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, FormProvider } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {Project } from '@/types/admin/project';
import { Card, CardContent } from "@/components/ui/card"
import { Form } from "@/components/ui/form"
import { ProjectNameField, GithubFields, TagsField } from "./FormFields"
import { Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { projectFormSchema, ProjectFormData } from "./projectFormSchema"

interface ProjectFormProps {
  initialData?: ProjectFormData | any
  onSubmit: (data: ProjectFormData) => Promise<void>
  onValidateToken: (data: ProjectFormData) => Promise<void>
  mode: "create" | "edit"
  isSubmitting: boolean
  isValidating: boolean
  isTokenValidated: boolean
  error: string | null
  searchedProject?: Project | null
  searchLoading?: boolean
  projectNotFound?: boolean
  onNameChange?: (name: string) => void
}

export function ProjectForm({ 
  initialData, 
  onSubmit, 
  onValidateToken,
  mode, 
  isSubmitting,
  isValidating,
  isTokenValidated,
  error,
  searchedProject,
  searchLoading,
  projectNotFound,
  onNameChange
}: ProjectFormProps) {
  const [formState, setFormState] = useState<"idle" | "submitting" | "success" | "error">("idle")
  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    mode: "onChange", // Show validation errors instantly on change
    defaultValues: initialData || {
      bh_project_name: "",
      bh_github_provider: "",
      bh_github_username: "",
      bh_github_email: "",
      bh_default_branch: "main",
      bh_github_url: "",
      bh_github_token_url: "",
      tags: [],
      status: "active"
    },
  })

  const isEditMode = mode === "edit"

  useEffect(() => {
    if (!isEditMode) {
      form.reset({
        bh_project_name: "",
        bh_github_provider: "",
        bh_github_username: "",
        bh_github_email: "",
        bh_default_branch: "main",
        bh_github_url: "",
        bh_github_token_url: "",
        tags: [],
        status: "active"
      })
    }
  }, [isEditMode, form])

  const handleSubmit = async (data: ProjectFormData) => {
    try {
      setFormState("submitting")
      await onSubmit(data)
      setFormState("success")
    } catch (error) {
      setFormState("error")
    }
  }

  // Watch provider selection to enable/disable submit button
  const selectedProvider = form.watch("bh_github_provider")
  const isProviderSelected = selectedProvider && selectedProvider.trim() !== ""

  // Button should be disabled if:
  // 1. No provider is selected, OR
  // 2. Token is not validated (for both create and edit modes), OR  
  // 3. Form is currently submitting
  const isSubmitDisabled = !isProviderSelected || !isTokenValidated || isSubmitting

  return (
    <Card className="w-full max-w-6xl mx-auto border-none shadow-none">
      <CardContent>
        <FormProvider {...form}>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
              <ProjectNameField control={form.control}
              searchedProject={searchedProject}
              searchLoading={searchLoading}
              projectNotFound={projectNotFound}
              onNameChange={onNameChange}
              isEditMode={isEditMode}
              />
              <GithubFields 
                control={form.control} 
                onValidateToken={onValidateToken} 
                isEditMode={isEditMode}
                isValidating={isValidating}
                isTokenValidated={isTokenValidated}
              />
              <TagsField control={form.control} />
              <div className="flex justify-center">
                <Button
                  type="submit"
                  disabled={isSubmitDisabled}
                  className={isSubmitting ? "bg-blue-500 hover:bg-blue-600" : "bg-primary hover:bg-primary/90"}
                  size="lg"
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {mode === "create" ? "Create Project" : "Update Project"}
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