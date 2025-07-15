import { z } from "zod";
import type { Project } from "@/types/admin/project";
import type { Environment } from "@/types/admin/environment";

// Create mode schema - minimal fields only
export const userCreateSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
});

// Edit mode schema - all fields
export const userEditSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  enabled: z.boolean(),
  projects: z.array(z.string()).optional(),
  environments: z.array(z.string()).optional(),
  roles: z.array(z.string()).optional(),
  is_tenant_admin: z.boolean().optional(),
  username: z.string().optional(),
});

// Combined schema for backward compatibility
export const userFormSchema = userEditSchema;

export type UserFormValues = z.infer<typeof userFormSchema>
export type UserCreateValues = z.infer<typeof userCreateSchema>

export interface SelectOption {
  label: string
  value: string
}

export const getProjectOptions = (projects: Project[]) => {
  if (!projects || !Array.isArray(projects)) {
    return [];
  }
  return projects.map(project => ({
    label: project.bh_project_name,
    value: project.bh_project_id.toString()
  }));
};

export const getEnvironmentOptions = (environments: Environment[]) => {
  if (!environments || !Array.isArray(environments)) {
    return [];
  }
  return environments.map(environment => ({
    label: environment.bh_env_name,
    value: environment.bh_env_id?.toString()
  }));
};