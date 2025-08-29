"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { FormProvider, useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
  onValidate?: (data: EnvironmentFormValues) => Promise<void>
  mode: "create" | "edit"
  isSubmitting: boolean
  isValidating: boolean
  isTokenValidated: boolean
  error: string | null
  existingEnvironments?: Array<{ bh_env_name: string }>
}

export function EnvironmentForm({ initialData, onSubmit, ...props }: EnvironmentFormProps) {
  const form = useForm<EnvironmentFormValues>({
    resolver: zodResolver(environmentFormSchema),
    mode: "onChange", // Validate on each field change
    reValidateMode: "onChange", // Revalidate on subsequent changes
    defaultValues: initialData || {
      environmentName: '',
      environment: '',
      platform: {
        type: '',
        region: '',
        zone: '',
      },
      credentials: {
        publicId: '',
        accessKey: '',
        secretKey: '',
        pvtKey: '',
      },
      advancedSettings: {
        airflowName: '',
        airflowBucketName: '',
        airflowBucketUrl: '',
      },
      tags: [],
    }
  });

  const [formState, setFormState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const isEditMode = props.mode === "edit";
  
  // Watch platform type to conditionally show fields
  const platformType = form.watch("platform.type");
  const isAwsSelected = platformType === "AWS"; // AWS platform value
  
  // Watch all form values to check if required fields are filled
  const formValues = form.watch();
  
  // Check if all required fields are filled when AWS is selected
  const isFormComplete = !isAwsSelected || (
    formValues.environmentName &&
    formValues.environment &&
    formValues.platform?.type &&
    formValues.platform?.region &&
    formValues.credentials?.publicId &&
    formValues.credentials?.accessKey &&
    formValues.credentials?.secretKey &&
    formValues.advancedSettings?.airflowName &&
    formValues.advancedSettings?.airflowBucketName &&
    formValues.advancedSettings?.airflowBucketUrl
  );
  
  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    }
  }, [initialData, form]);

  // Clear AWS-specific fields when switching away from AWS
  useEffect(() => {
    if (platformType && platformType !== "101") {
      form.setValue("platform.region", "");
      form.setValue("credentials.publicId", "");
      form.setValue("credentials.accessKey", "");
      form.setValue("credentials.secretKey", "");
      form.setValue("advancedSettings.airflowName", "");
      form.setValue("advancedSettings.airflowBucketName", "");
      form.setValue("advancedSettings.airflowBucketUrl", "");
    }
  }, [platformType, form]);

  const handleSubmit = async (data: EnvironmentFormValues) => {
    const isFormValid = await form.trigger(); // Force validation
    if (!isFormValid) return; // Exit if form is still invalid
    await onSubmit(data);
  };

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
      <CardContent className="p-4">
        <FormProvider {...form}>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <EnvironmentDetailsFields 
                control={form.control} 
                existingEnvironments={props.existingEnvironments}
              />
              <PlatformFields control={form.control} />
              
              {/* Show message when AWS is not selected */}
              {platformType && !isAwsSelected && (
                <div className="text-center py-4">
                  <p className="text-muted-foreground text-sm">
                    Please select AWS to continue with environment configuration.
                  </p>
                </div>
              )}
              
              {/* Show remaining fields only when AWS is selected */}
              {isAwsSelected && (
                <>
                  <CredentialsFields 
                    control={form.control}
                    onValidateToken={props.onValidate || (() => Promise.resolve())}
                    isEditMode={isEditMode}
                    isValidating={props.isValidating}
                    isTokenValidated={props.isTokenValidated}
                  />
                  <AdvancedSettingsFields 
                    control={form.control}
                    isTokenValidated={props.isTokenValidated} 
                  />
                  <TagsField control={form.control} />
                </>
              )}

              {/* Show submit button only when AWS is selected */}
              {isAwsSelected && (
                <div className="flex justify-center pt-4">
                  <Button 
                    type="submit" 
                    className={`px-8 w-40 ${getButtonStyles()}`} 
                    disabled={formState === "submitting" || !isFormComplete}
                  >
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
              )}
              {props.error && <p className="text-sm text-red-500 text-center">{props.error}</p>}
            </form>
          </Form>
        </FormProvider>
      </CardContent>
    </Card>
  )
}