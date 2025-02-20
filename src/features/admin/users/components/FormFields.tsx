import type React from "react"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { MultiSelect } from "./MultiSelect"
import { projects } from "./userFormSchema"

// Add role mapping configuration
const ROLE_MAPPINGS = {
  'admin-user': 'Admin',
  'designer-user': 'Designer',
  'ops-user': 'Ops'
} as const;

// Reverse mapping for form submission
const UI_TO_API_ROLES = {
  'Admin': 'admin-user',
  'Designer': 'designer-user',
  'Ops': 'ops-user'
} as const;

// Update the roles array to match UI display names
export const roles = [
  { label: 'Admin', value: 'Admin' },
  { label: 'Designer', value: 'Designer' },
  { label: 'Ops', value: 'Ops' }
];

// Helper function to convert API roles to UI roles
export const apiToUiRoles = (apiRoles: string[]): string[] => {
  return apiRoles
    .filter(role => role !== 'default-roles-bighammer-realm')
    .map(role => ROLE_MAPPINGS[role as keyof typeof ROLE_MAPPINGS] || role);
};

// Helper function to convert UI roles back to API roles
export const uiToApiRoles = (uiRoles: string[]): string[] => {
  return uiRoles.map(role => UI_TO_API_ROLES[role as keyof typeof UI_TO_API_ROLES]);
};

export const RequiredFormLabel = ({ children }: { children: React.ReactNode }) => (
  <FormLabel>
    {children}
    <span className="text-red-500 ml-1">*</span>
  </FormLabel>
)

export const NameFields = ({ form }: { form: any }) => (
  <div className="grid grid-cols-2 gap-6">
    <FormField
      control={form.control}
      name="first_name"
      render={({ field }) => (
        <FormItem>
          <RequiredFormLabel>First Name</RequiredFormLabel>
          <FormControl>
            <Input placeholder="Enter first name" {...field} />
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
          <RequiredFormLabel>Last Name</RequiredFormLabel>
          <FormControl>
            <Input placeholder="Enter last name" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </div>
)

export const EmailField = ({ form }: { form: any }) => (
    <div className="grid grid-cols-3 gap-4">
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <RequiredFormLabel>Email</RequiredFormLabel>
          <FormControl>
            <Input type="email" placeholder="Enter email address" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </div>
)

export const StatusField = ({ form }: { form: any }) => (
  <div>
    <FormField
      control={form.control}
      name="enabled"
      render={({ field }) => (
        <FormItem className="flex flex-row items-center gap-2">
          <FormLabel>Status</FormLabel>
          <FormControl>
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          </FormControl>
          <span className="text-sm text-muted-foreground">{field.value ? "Active" : "Inactive"}</span>
        </FormItem>
      )}
    />
  </div>
)

export const ProjectsAndRolesFields = ({ form }: { form: any }) => (
  <div className="grid grid-cols-2 gap-6">
    <MultiSelect 
      form={form} 
      name="projects" 
      label="Projects" 
      placeholder="Select projects" 
      options={projects} 
    />
    <MultiSelect 
      form={form} 
      name="realm_roles" 
      label="Roles" 
      placeholder="Select roles" 
      options={roles} 
    />
  </div>
)
