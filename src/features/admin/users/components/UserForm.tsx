import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { userFormSchema, userCreateSchema, type UserCreateValues, type UserFormValues } from "./userFormSchema";
import {
  NameFields,
  EmailField,
  StatusField,
  ProjectsAndEnvironmentsFields,
  TenantAdminField,
  RolesField,
} from "./FormFields";
import type { UserMutationData } from "@/types/admin/user";

interface UserFormProps {
  initialData?: Partial<UserMutationData>;
  onSubmit: (data: UserMutationData) => Promise<void>;
  mode: "create" | "edit";
  isSubmitting: boolean;
  error: string | null;
}

export function UserForm({
  initialData,
  onSubmit,
  mode,
  isSubmitting,
  error,
}: UserFormProps) {
  const [formState, setFormState] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");

  const isEditMode = mode === "edit";

  // Create mode form
  const createForm = useForm<UserCreateValues>({
    resolver: zodResolver(userCreateSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      ...initialData,
    },
  });

  // Edit mode form  
  const editForm = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      enabled: true,
      projects: [],
      environments: [],
      roles: [],
      is_tenant_admin: false,
      ...initialData,
    },
  });

  // Use the appropriate form based on mode
  const form = isEditMode ? editForm : createForm;

  useEffect(() => {
    if (isSubmitting) {
      setFormState("submitting");
    } else if (error) {
      setFormState("error");
    } else if (!isSubmitting && formState === "submitting") {
      setFormState("success");
      const timer = setTimeout(() => setFormState("idle"), 2000);
      return () => clearTimeout(timer);
    }
  }, [isSubmitting, error, formState]);

  const handleSubmit = async (data: UserMutationData) => {
    const firstName = data.first_name?.trim();
    const lastName = data.last_name?.trim();

    if (!firstName || !lastName) {
      form.setError('first_name', { message: 'First and last name are required' });
      form.setError('last_name', { message: 'First and last name are required' });
      return;
    }

    await onSubmit(data);
  };

  const getButtonStyles = () => {
    switch (formState) {
      case "submitting":
        return "bg-blue-500 hover:bg-blue-600";
      case "success":
        return "bg-green-500 hover:bg-green-600";
      case "error":
        return "bg-red-500 hover:bg-red-600";
      default:
        return "bg-primary hover:bg-primary/90";
    }
  };

  return (
    <div className="w-full max-w-8xl mx-auto">
      <div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="space-y-6">
              <NameFields form={form} disabled={isEditMode} />
              <EmailField form={form} />
              {isEditMode && (
                <>
                  <StatusField form={form} />
                  <TenantAdminField form={form} />
                  <RolesField form={form} />
                  <ProjectsAndEnvironmentsFields form={form} />
                </>
              )}
            </div>

            <div className="flex flex-col items-center pt-6 border-t">
              <Button
                type="submit"
                className={`px-8 w-40 ${getButtonStyles()}`}
                disabled={formState === "submitting"}
              >
                {formState === "submitting" ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {isEditMode ? "Updating..." : "Creating..."}
                  </>
                ) : formState === "success" ? (
                  <>
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    {isEditMode ? "Updated!" : "Created!"}
                  </>
                ) : (
                  isEditMode ? "Update User" : "Create User"
                )}
              </Button>
              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
