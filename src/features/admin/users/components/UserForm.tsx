import { useEffect, useState } from 'react';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDebounce } from "use-debounce";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const userSchema = z.object({
  firstName: z.string().min(1, "First Name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last Name is required"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  projects: z.array(z.string()).min(1, "At least one project is required"),
  roles: z.array(z.string()).min(1, "At least one role is required"),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
  initialData?: Partial<UserFormData>;
  onSubmit: (data: UserFormData) => void;
  onCancel?: () => void;
  mode?: 'create' | 'edit';
  availableProjects?: Array<{ label: string; value: string }>;
  checkUserExists?: (firstName: string) => Promise<boolean>;
}

export default function UserForm({
  initialData,
  onSubmit,
  onCancel,
  mode = 'create',
  availableProjects = [],
  checkUserExists
}: UserFormProps) {
  const [userExistModalOpen, setUserExistModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: initialData?.firstName || "",
      middleName: initialData?.middleName || "",
      lastName: initialData?.lastName || "",
      email: initialData?.email || "",
      projects: initialData?.projects || [],
      roles: initialData?.roles || [],
    },
    mode: "onChange"
  });

  const watchFirstName = form.watch("firstName");
  const [debouncedFirstName] = useDebounce(watchFirstName, 500);

  const availableRoles = ["admin-user", "ops-user", "designer-user"];

  useEffect(() => {
    const checkName = async () => {
      if (mode === 'create' && debouncedFirstName?.length >= 3 && checkUserExists) {
        const exists = await checkUserExists(debouncedFirstName);
        setUserExistModalOpen(exists);
      }
    };
    checkName();
  }, [debouncedFirstName, mode, checkUserExists]);

  // Utility functions for managing arrays
  const addToArray = (field: "projects" | "roles", value: string) => {
    const current = form.getValues(field);
    if (!current.includes(value)) {
      form.setValue(field, [...current, value], {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  const removeFromArray = (field: "projects" | "roles", value: string) => {
    const current = form.getValues(field);
    form.setValue(
      field,
      current.filter((item) => item !== value),
      { shouldValidate: true, shouldDirty: true }
    );
  };

  const handleSubmit = async (data: UserFormData) => {
    try {
      setIsLoading(true);
      await onSubmit(data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-md">
          {mode === 'create' ? 'Create New User' : 'Edit User'}
        </CardTitle>
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">User Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Enter first name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="middleName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Middle Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter middle name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Enter last name" {...field} />
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
                    <FormLabel>Email Address <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        className="w-1/2" 
                        placeholder="Enter email address" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Project Access</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <FormLabel>Projects <span className="text-destructive">*</span></FormLabel>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {form.watch("projects").map((project) => (
                      <Badge
                        key={project}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {project}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeFromArray("projects", project)}
                        />
                      </Badge>
                    ))}
                  </div>
                  <Select
                    onValueChange={(value) => addToArray("projects", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProjects.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.projects && (
                    <p className="text-red-500 text-sm">
                      {form.formState.errors.projects.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <FormLabel>Roles <span className="text-destructive">*</span></FormLabel>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {form.watch("roles").map((role) => (
                      <Badge
                        key={role}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {role}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeFromArray("roles", role)}
                        />
                      </Badge>
                    ))}
                  </div>
                  <Select
                    onValueChange={(value) => addToArray("roles", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRoles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.roles && (
                    <p className="text-red-500 text-sm">
                      {form.formState.errors.roles.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                type="submit"
                className="w-full max-w-xs"
                disabled={isLoading || !form.formState.isValid}
              >
                {isLoading ? 'Processing...' : mode === 'create' ? 'Create User' : 'Update User'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>

      <Dialog open={userExistModalOpen} onOpenChange={setUserExistModalOpen}>
        <DialogContent className="sm:max-w-[300px]">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-red-600">
              User Already Exists
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center gap-1 py-2 text-center">
            <p className="text-sm text-gray-700">
              A user with this first name already exists. Please choose a different name.
            </p>
            <Button
              onClick={() => setUserExistModalOpen(false)}
              className="mt-2"
            >
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}