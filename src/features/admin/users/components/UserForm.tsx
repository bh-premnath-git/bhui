import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, CheckCircle2, AlertCircle, Shield, User, UserPlus, Settings } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { userFormSchema, userCreateSchema, type UserCreateValues, type UserFormValues } from "./userFormSchema";
import { RoleAssignmentsField, ProjectRolesField, EnvironmentRolesField } from "./FormFields";
import type { UserCreateData, UserUpdateData, User as UserType } from "@/types/admin/user";

interface UserFormProps {
  initialData?: Partial<UserCreateData | UserUpdateData>;
  onSubmit: (data: UserCreateData | UserUpdateData) => Promise<void>;
  mode: "create" | "edit";
  isSubmitting: boolean;
  error: string | null;
  user?: UserType;
}

export function UserForm({
  initialData,
  onSubmit,
  mode,
  isSubmitting,
  error,
  user,
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
      assignments: [],
      is_tenant_admin: false,
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
      assignments: [],
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

  const handleSubmit = async (data: UserCreateData | UserUpdateData) => {
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
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          
          {/* User Information Section */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                User Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter first name..." 
                          {...field} 
                          disabled={isEditMode}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter last name..." 
                          {...field} 
                          disabled={isEditMode}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input 
                        type="email"
                        placeholder="Enter email address..." 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isEditMode && (
                <FormField
                  control={editForm.control}
                  name="enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">User Status</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Enable or disable user account access
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={Boolean((field as any).value)}
                          onCheckedChange={(field as any).onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          {/* Admin Role Section */}
          <Card className="border-l-4 border-l-orange-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-orange-500" />
                Admin Role
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="is_tenant_admin"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <FormLabel className="text-sm font-medium">
                        Tenant Admin
                      </FormLabel>
                      <p className="text-xs text-muted-foreground">
                        Full administrative access across all projects and environments
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                        className={field.value ? "data-[state=checked]:bg-orange-600" : ""}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              {(isEditMode ? editForm.watch("is_tenant_admin") : createForm.watch("is_tenant_admin")) && (
                <Badge variant="destructive" className="w-fit mt-2">
                  Admin Access Enabled
                </Badge>
              )}
            </CardContent>
          </Card>

          {/* Role Assignments Section */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="role-assignments" className="border rounded-lg border-l-4 border-l-green-500">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-green-500" />
                  <div className="text-left">
                    <h3 className="font-semibold">Role Assignments</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Assign user roles for projects and environments
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
                    <ProjectRolesField form={form} user={user} />
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
                      <EnvironmentRolesField form={form} user={user} />
                    </div>
                  </div>

                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Separator />

          {/* Submit Section */}
          <div className="flex flex-col items-center pt-6 space-y-4">
            <Button
              type="submit"
              className={`px-8 w-48 ${getButtonStyles()}`}
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
                <>
                  {isEditMode ? (
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
