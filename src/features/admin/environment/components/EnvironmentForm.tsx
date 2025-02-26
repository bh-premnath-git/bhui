"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { FormProvider, useForm } from "react-hook-form"
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
import { encrypt_string } from "@/services/encryption"

interface EnvironmentFormProps {
  initialData?: EnvironmentFormValues
  onSubmit: (data: EnvironmentFormValues) => Promise<void>
  onValidate?: (data: EnvironmentFormValues) => Promise<void>
  mode: "create" | "edit"
  isSubmitting: boolean
  isValidating: boolean
  isTokenValidated: boolean
  error: string | null
}

export function EnvironmentForm({ onSubmit, ...props }: EnvironmentFormProps) {
  const form = useForm<EnvironmentFormValues>({
    resolver: zodResolver(environmentFormSchema)
  });

  const [formState, setFormState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const isEditMode = props.mode === "edit";

  const handleSubmit = async (data: EnvironmentFormValues) => {
    if (!form.formState.isValid) return;
    await onSubmit(data);
  };

  useEffect(() => {
    if (isEditMode) {
      form.reset({

      })
    }
  }, [isEditMode])

  useEffect(() => {
    if (props.isSubmitting) {
      setFormState("submitting")
    } else if (props.error) {
      setFormState("error")
    } else if (!props.isSubmitting && formState === "submitting") {
      setFormState("success")
      const timer = setTimeout(() => setFormState("idle"), 2000)
      return () => clearTimeout(timer)
    }
  }, [props.isSubmitting, props.error, formState])

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
      <FormProvider {...form}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <EnvironmentDetailsFields control={form.control} />
            <PlatformFields control={form.control} />
            <CredentialsFields 
              control={form.control}
              onValidateToken={props.onValidate}
              isEditMode={isEditMode}
              isValidating={props.isValidating}
              isTokenValidated={props.isTokenValidated}
             />
            <AdvancedSettingsFields control={form.control}
            isTokenValidated={props.isTokenValidated} 
            />
            <TagsField form={form} />
            {/* <Accordion type="single" collapsible defaultValue="environment-details">
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
                  <CredentialsFields 
                  form={form} 
                  />
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
            </Accordion> */}

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
            {props.error && <p className="text-sm text-red-500 text-center">{props.error}</p>}
          </form>
        </Form>
        </FormProvider>
      </CardContent>
    </Card>
  )
}