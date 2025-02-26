import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Loader2, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { userFormSchema } from "./userFormSchema";
import {
  NameFields,
  EmailField,
  StatusField,
  ProjectsAndRolesFields,
} from "./FormFields";
import type { UserMutationData, User } from "@/types/admin/user";

interface UserFormProps {
  initialData?: Partial<UserMutationData>;
  onSubmit: (data: UserMutationData) => Promise<void>;
  onNameChange?: (firstName: string, lastName: string) => void;
  onClearSearch?: () => void;
  mode: "create" | "edit";
  isSubmitting: boolean;
  error: string | null;
  searchedUser?: User | null;
  searchLoading?: boolean;
  userNotFound?: boolean;
}

export function UserForm({
  initialData,
  onSubmit,
  onNameChange,
  onClearSearch,
  mode,
  isSubmitting,
  error,
  searchedUser,
  searchLoading,
  userNotFound,
}: UserFormProps) {
  const [formState, setFormState] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");

  const [dialogOpen, setDialogOpen] = useState(false);

  const form = useForm<UserMutationData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      enabled: true,
      projects: [],
      realm_roles: [],
      ...initialData,
    },
  });

  const isEditMode = mode === "edit";

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

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (onNameChange && (name === 'first_name' || name === 'last_name')) {
        const firstName = value.first_name?.trim() || '';
        const lastName = value.last_name?.trim() || '';
        onNameChange(firstName, lastName);
      }
    });

    return () => subscription.unsubscribe();
  }, [form, onNameChange]);

  useEffect(() => {
    if (searchedUser && searchedUser.username !== form.getValues('username')) {
      setDialogOpen(true);
    }
  }, [searchedUser, form]);

  const handleDialogClose = () => {
    setDialogOpen(false);
    if (onClearSearch) {
      onClearSearch();
    }
  };

  const handleSubmit = async (data: UserMutationData) => {
    const firstName = data.first_name?.trim();
    const lastName = data.last_name?.trim();

    if (!firstName || !lastName) {
      form.setError('first_name', { message: 'First and last name are required' });
      form.setError('last_name', { message: 'First and last name are required' });
      return;
    }

    if (searchedUser && searchedUser.username !== form.getValues('username')) {
      setDialogOpen(true);
      return;
    }

    const username = `${firstName.toLowerCase()}-${lastName.toLowerCase()}`;
    await onSubmit({ ...data, username });
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

  const renderUsernameStatus = () => {
    const firstName = form.getValues('first_name')?.trim() || '';
    const lastName = form.getValues('last_name')?.trim() || '';
    const currentUsername = firstName && lastName ? `${firstName.toLowerCase()}${lastName.toLowerCase()}` : '';
    const originalUsername = initialData?.username;

    if (isEditMode && currentUsername === originalUsername) {
      return null;
    }

    if (!firstName || !lastName) {
      return null;
    }

    if (searchLoading) {
      return (
        <Alert className="mt-4">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <AlertDescription>Checking username format...</AlertDescription>
        </Alert>
      );
    }

    if (searchedUser && searchedUser.username !== originalUsername) {
      return (
        <Alert variant="destructive" className="mt-4">
          <XCircle className="h-4 w-4 mr-2" />
          <AlertDescription>This username is already taken</AlertDescription>
        </Alert>
      );
    }

    if (
      (mode === 'create' && userNotFound && currentUsername) || 
      (mode === 'edit' && userNotFound && currentUsername && currentUsername !== originalUsername)
    ) {
      return (
        <Alert className="mt-4 bg-green-50 text-green-700 border-green-200">
          <CheckCircle2 className="h-4 w-4 mr-2" />
          <AlertDescription>Username Available</AlertDescription>
        </Alert>
      );
    }

    return null;
  };

  return (
    <div className="w-full max-w-8xl mx-auto">
      <div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="space-y-6">
              <NameFields form={form} disabled={isEditMode} />
              {renderUsernameStatus()}
              <EmailField form={form} />
              <StatusField form={form} />
              <ProjectsAndRolesFields form={form} />
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

      {!isEditMode && (
        <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center text-red-500">
                <AlertCircle className="h-5 w-5 mr-2" />
                Username Already Exists
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-gray-600">
                The username "{form.getValues('first_name')?.toLowerCase()}{form.getValues('last_name')?.toLowerCase()}"
                is already taken. Please try a different combination of first and last name.
              </p>
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={handleDialogClose}>
                OK, I'll Change It
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
