import { z } from "zod";
import type { Project } from "@/types/admin/project";
import type { Environment } from "@/types/admin/environment";
import { AVAILABLE_ROLES } from "@/types/admin/roles";

// Shared schema for role assignments
const roleAssignmentSchema = z.object({
  project: z.union([z.literal('*'), z.string().min(1, 'Project is required')]),
  environment: z.union([z.literal('*'), z.string().min(1, 'Environment is required')]),
  role: z.enum(AVAILABLE_ROLES, { invalid_type_error: 'Role is required' }),
});

// Base schema with common fields
const baseUserSchema = {
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  is_tenant_admin: z.boolean().optional(),
  assignments: z.array(roleAssignmentSchema).optional(),
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

export interface SelectOption {
  label: string;
  value: string;
}

// Re-export RoleAssignment from types to avoid duplication
export type { RoleAssignment } from "@/types/admin/user";

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
