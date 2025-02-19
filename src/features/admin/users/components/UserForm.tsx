import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Form } from "@/components/ui/form"
import { Loader2 } from "lucide-react"
import { userFormSchema } from "./userFormSchema"
import { NameFields, EmailField, StatusField, ProjectsAndRolesFields } from "./FormFields"
import type { UserMutationData } from "@/types/admin/user"

interface UserFormProps {
  initialData?: Partial<UserMutationData> | any
  onSubmit: (data: UserMutationData) => Promise<void>
  mode: "create" | "edit"
  isSubmitting: boolean
  error: string | null
}

export function UserForm({ initialData, onSubmit, mode, isSubmitting, error }: UserFormProps) {
  const [formState, setFormState] = useState<"idle" | "submitting" | "success" | "error">("idle")

  const form = useForm<UserMutationData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: initialData || {
      first_name: "",
      last_name: "",
      email: "",
      enabled: true,
      projects: [],
      realm_roles: [],
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

  const handleSubmit = async (data: UserMutationData) => {
    try {
      // Generate username from first_name and last_name
      const username = `${data.first_name.toLowerCase()}${data.last_name.toLowerCase()}`
      await onSubmit({ ...data, username })
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
    <Card className="w-full max-w-6xl mx-auto border-none shadow-none">
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <NameFields form={form} />
            <EmailField form={form} />
            <StatusField form={form} />
            <ProjectsAndRolesFields form={form} />
            <div className="flex flex-col items-center space-y-2">
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
                  "Update User"
                ) : (
                  "Create User"
                )}
              </Button>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
