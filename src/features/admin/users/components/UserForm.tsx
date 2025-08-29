import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, UseFormReturn, DefaultValues, Path } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, CheckCircle2, AlertCircle, User as UserIcon, UserPlus, Settings } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { userEditSchema, userCreateSchema, type UserCreateValues, type UserFormValues } from "./userFormSchema";
import type { User } from "@/types/admin/user";
import { EnvironmentField, ProjectField, RolesField } from "./FormFields";
import type { RoleMatrixEntry } from "@/types/admin/roles";

// Base fields present in both create and edit forms
interface BaseUserFields {
  first_name?: string;
  last_name?: string;
  email?: string;
  is_tenant_admin?: boolean;
}

// Generic form props that work with both create and update
// Ensure that T always contains the base required fields so FormField names compile
type UserFormProps<T extends BaseUserFields = AnyUserFormValues> = {
  initialData?: Partial<T>;
  onSubmit: (data: T) => Promise<void>;
  mode: "create" | "edit";
  isSubmitting: boolean;
  error: string | null;
  user?: User;
  roles?: RoleMatrixEntry[];
  rolesLoading?: boolean;
  rolesError?: boolean;
};

// Create a union of all possible form values
type AnyUserFormValues = UserCreateValues | UserFormValues;

// Type guard to narrow down form values
export function isEditFormValues(values: AnyUserFormValues): values is UserFormValues {
  return 'enabled' in values;
}

export function UserForm<T extends BaseUserFields = AnyUserFormValues>({
  initialData = {},
  onSubmit,
  mode,
  isSubmitting,
  error,
  user,
  roles,
  rolesLoading,
  rolesError,
}: UserFormProps<T>) {
  const isEdit = mode === "edit";
  const schema = isEdit ? userEditSchema : userCreateSchema;

  // Helper function to get default values with proper typing
  const getDefaultValues = <T extends AnyUserFormValues>(_: boolean, initialData: Partial<T>): T => {
    // Just use provided initial data; leave other fields undefined so they show up empty in the form.
    // Zod will handle required-field validation on submit.
    return { ...initialData } as T;
  };

  const defaultValues = getDefaultValues(isEdit, initialData);

  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as DefaultValues<T>,
  });

  const [formState, setFormState] = useState<"idle" | "submitting" | "success" | "error">("idle");

  // Watch tenant admin status to conditionally fetch all roles
  const isTenantAdmin = Boolean(form.watch('is_tenant_admin' as Path<T>));

  const handleSubmit = async (data: T) => {
    try {
      setFormState("submitting");

      // Pass the complete form data to onSubmit
      // The AddUser/EditUser components will handle the transformation
      await onSubmit(data);
      setFormState("success");
    } catch (err) {
      setFormState("error");
    }
  };

  useEffect(() => {
    if (error) {
      setFormState("error");
    }
  }, [error]);

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">

          {/* User Information Section */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                User Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name={"first_name" as Path<T>}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter first name..."
                          {...field}
                          value={field.value as string}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={"last_name" as Path<T>}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter last name..."
                          {...field}
                          value={field.value as string}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name={"email" as Path<T>}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter email address..."
                        {...field}
                        value={field.value as string}
                        disabled={isSubmitting || isEdit}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Role Assignment Section */}
          <RolesField 
            form={form} 
            isTenantAdmin={isTenantAdmin} 
            searchTerm={""} 
            roles={roles}
            isLoading={rolesLoading}
            isError={rolesError}
          />

          {/* Resource Section */}
          {!isTenantAdmin && (
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="resource-assignments" className="border rounded-lg border-l-4 border-l-green-500">
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-green-500" />
                    <div className="text-left">
                      <h3 className="font-semibold">Resource Assignments</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Assign user access to specific projects and environments
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <div className="space-y-6">

                    {/* Project-Level Access */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📁</span>
                        <h4 className="font-medium">Project Access</h4>
                        <Badge variant="secondary" className="text-xs">
                          Full project access
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Grant access to entire projects (includes all environments)
                      </p>
                      <ProjectField form={form as unknown as UseFormReturn<UserFormValues>} user={user} />
                    </div>
                    <Separator />
                    {/* Environment-Specific Access */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🌍</span>
                        <h4 className="font-medium">Environment-Specific Access</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Assign roles for specific environments
                      </p>
                      <div className="border rounded-lg p-4">
                        <EnvironmentField form={form as unknown as UseFormReturn<UserFormValues>} user={user} />
                      </div>
                    </div>

                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}

          <Separator />

          {/* Submit Section */}
          <div className="flex flex-col items-center pt-6 space-y-4">
            <Button
              type="submit"
              className={`px-8 w-48 ${formState === "submitting" ? "bg-blue-500 hover:bg-blue-600" : formState === "success" ? "bg-green-500 hover:bg-green-600" : formState === "error" ? "bg-red-500 hover:bg-red-600" : "bg-primary hover:bg-primary/90"}`}
              disabled={formState === "submitting"}
            >
              {formState === "submitting" ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {isEdit ? "Updating..." : "Creating..."}
                </>
              ) : formState === "success" ? (
                <>
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  {isEdit ? "Updated!" : "Created!"}
                </>
              ) : (
                <>
                  {isEdit ? (
                    <>
                      <Settings className="mr-2 h-4 w-4" />
                      Update User
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Create User
                    </>
                  )}
                </>
              )}
            </Button>

            {error && (
              <Alert variant="destructive" className="max-w-md">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
