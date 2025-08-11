import { z } from "zod";
import type { Project } from "@/types/admin/project";
import type { Environment } from "@/types/admin/environment";

// Type for project role assignment
export interface ProjectRoleAssignment {
  project: string;
}

// Type for environment role assignment
export interface EnvironmentRoleAssignment {
  environment: string;
}

// Role permissions schema
const rolePermissionsSchema = z.object({
  view: z.boolean().default(true),
  edit: z.boolean().default(true),
  delete: z.boolean().default(true),
});

// Base schema with common fields
const baseUserSchema = {
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  is_tenant_admin: z.boolean().optional(),
  selected_roles: z.array(z.string()).optional().default([]),
  role_permissions: z.record(z.string(), rolePermissionsSchema).optional().default({}),
  project_assignments: z.array(z.string()).optional(),
  environment_assignments: z.array(z.string()).optional(),
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

export interface RolePermissions {
  view: boolean;
  edit: boolean;
  delete: boolean;
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

export const getRoleOptions = (roles: any): SelectOption[] => {
  if (!Array.isArray(roles)) return [];
  return roles.map(role => ({
    label: role.role_name,
    value: String(role.id),
  }));
};

// Helper function to transform selected roles and permissions into bh_roles format
export const transformToBhRoles = (
  selectedRoles: string[],
  rolePermissions: Record<string, { view?: boolean; edit?: boolean; delete?: boolean }>,
  allRoles: any[]
): Array<{
  permissions: string[];
  bh_role_matrix_id: number;
  role_name: string;
}> => {
  if (!Array.isArray(selectedRoles) || !Array.isArray(allRoles)) return [];
  
  return selectedRoles.map(roleId => {
    const role = allRoles.find(r => String(r.id) === roleId);
    if (!role) return null;
    
    // Get permissions for this role with defaults
    const permissions = rolePermissions[roleId];
    const permissionsList: string[] = [];
    
    // For admin role (ID: '1'), give all permissions
    if (roleId === '1') {
      permissionsList.push('view', 'edit', 'delete');
    } else if (permissions) {
      // For other roles, use the selected permissions with defaults
      if (permissions.view !== false) permissionsList.push('view'); // default true
      if (permissions.edit !== false) permissionsList.push('edit'); // default true
      if (permissions.delete !== false) permissionsList.push('delete'); // default true
    } else {
      // If no permissions object exists, default to all permissions
      permissionsList.push('view', 'edit', 'delete');
    }
    
    return {
      permissions: permissionsList,
      bh_role_matrix_id: Number(role.id),
      role_name: role.role_name
    };
  }).filter(Boolean) as Array<{
    permissions: string[];
    bh_role_matrix_id: number;
    role_name: string;
  }>;
};

// Helper function to transform project assignments into bh_resources format
export const transformToBhResources = (
  projectAssignments: string[],
  environmentAssignments: string[],
  allProjects: any[],
  allEnvironments: any[]
): Array<{
  resource_type: string;
  resource_id: number;
  resource_name: string;
}> => {
  const resources: Array<{
    resource_type: string;
    resource_id: number;
    resource_name: string;
  }> = [];
  
  // Add project resources (filter out special "no-project" values)
  if (Array.isArray(projectAssignments) && Array.isArray(allProjects)) {
    projectAssignments
      .filter(projectId => projectId && projectId !== 'no-project')
      .forEach(projectId => {
        const project = allProjects.find(p => String(p.bh_project_id) === projectId);
        if (project) {
          resources.push({
            resource_type: 'project',
            resource_id: Number(project.bh_project_id),
            resource_name: project.bh_project_name
          });
        }
      });
  }
  
  // Add environment resources (filter out special "no-environment" values)
  if (Array.isArray(environmentAssignments) && Array.isArray(allEnvironments)) {
    environmentAssignments
      .filter(envId => envId && envId !== 'no-environment')
      .forEach(envId => {
        const environment = allEnvironments.find(e => String(e.bh_env_id) === envId);
        if (environment) {
          resources.push({
            resource_type: 'environment',
            resource_id: Number(environment.bh_env_id),
            resource_name: environment.bh_env_name
          });
        }
      });
  }
  
  return resources;
};
