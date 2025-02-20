"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Form } from "@/components/ui/form"
import { environmentFormSchema, type EnvironmentFormValues } from "./environmentFormSchema"
import {
  EnvironmentDetailsFields,
  PlatformFields,
  CredentialsFields,
  AdvancedSettingsFields,
  TagsField,
} from "./FormFields"
import { Loader2 } from "lucide-react"
import { useState, useEffect } from "react"

interface EnvironmentFormProps {
  initialData?: EnvironmentFormValues
  onSubmit: (data: EnvironmentFormValues) => Promise<void>
  mode: "create" | "edit"
  isSubmitting: boolean
  error: string | null
}

export function EnvironmentForm({ initialData, onSubmit, mode, isSubmitting, error }: EnvironmentFormProps) {
  const [formState, setFormState] = useState<"idle" | "submitting" | "success" | "error">("idle")

  const form = useForm<EnvironmentFormValues>({
    resolver: zodResolver(environmentFormSchema),
    defaultValues: initialData || {
      environmentName: "",
      environment: "",
      platform: {
        type: "",
        region: "",
        zone: "",
      },
      credentials: {
        accessKey: "",
        secretKey: "",
        token: "",
      },
      advancedSettings: {
        vpc: "",
        subnet: "",
        securityGroup: "",
      },
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

  const handleSubmit = async (data: EnvironmentFormValues) => {
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
    <Card className="w-full max-w-8xl mx-auto border-none shadow-none">
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <Accordion type="single" collapsible defaultValue="environment-details">
              <AccordionItem value="environment-details">
                <AccordionTrigger className="text-lg font-semibold text-primary">Environment Details</AccordionTrigger>
                <AccordionContent className="pt-4">
                  <EnvironmentDetailsFields form={form} />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="platform">
                <AccordionTrigger className="text-lg font-semibold">Select Platform</AccordionTrigger>
                <AccordionContent className="pt-4">
                  <PlatformFields form={form} />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="credentials">
                <AccordionTrigger className="text-lg font-semibold">Credentials</AccordionTrigger>
                <AccordionContent className="pt-4">
                  <CredentialsFields form={form} />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="advanced-settings">
                <AccordionTrigger className="text-lg font-semibold">Advanced Settings</AccordionTrigger>
                <AccordionContent className="pt-4">
                  <AdvancedSettingsFields form={form} />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="tags">
                <AccordionTrigger className="text-lg font-semibold">Tags</AccordionTrigger>
                <AccordionContent className="pt-4">
                  <TagsField form={form} />
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="flex justify-center pt-6">
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
                  "Update Environment"
                ) : (
                  "Create Environment"
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