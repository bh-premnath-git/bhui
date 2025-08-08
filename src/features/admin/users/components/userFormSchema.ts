import { z } from "zod";
import type { Project } from "@/types/admin/project";
import type { Environment } from "@/types/admin/environment";

// Project role assignment schema
const projectRoleAssignmentSchema = z.object({
  project: z.string().min(1, 'Project is required'),
  roles: z.array(z.string()).optional(),
});

// Environment role assignment schema
const environmentRoleAssignmentSchema = z.object({
  environment: z.string().min(1, 'Environment is required'),
  roles: z.array(z.string()).optional(),
});

// Base schema with common fields
const baseUserSchema = {
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  is_tenant_admin: z.boolean().optional(),
  // New assignment fields used by the form
  project_assignments: z.array(projectRoleAssignmentSchema).optional(),
  environment_assignments: z.array(environmentRoleAssignmentSchema).optional(),
} as const;

// Create mode schema - minimal fields only
export const userCreateSchema = z.object({
  ...baseUserSchema,
});

// Edit mode schema - includes additional fields
export const userEditSchema = z.object({
  ...baseUserSchema,
  username: z.string().optional(),
  enabled: z.boolean().optional(),
  emailVerified: z.boolean().optional(),
});

// Export types
export type UserFormValues = z.infer<typeof userEditSchema>;
export type UserCreateValues = z.infer<typeof userCreateSchema>;

// Type for project role assignment
export interface ProjectRoleAssignment {
  project: string;
  roles?: string[];
}

// Type for environment role assignment
export interface EnvironmentRoleAssignment {
  environment: string;
  roles?: string[];
}

export interface SelectOption {
  label: string;
  value: string;
}

export const getProjectOptions = (projects: Project[]): SelectOption[] => {
  if (!Array.isArray(projects)) return [];
  return projects.map(project => ({
    label: project.bh_project_name,
    value: String(project.bh_project_id),
  }));
};

export const getEnvironmentOptions = (environments: Environment[]): SelectOption[] => {
  if (!Array.isArray(environments)) return [];
  return environments.map(env => ({
    label: env.bh_env_name,
    value: String(env.bh_env_id),
  }));
};
