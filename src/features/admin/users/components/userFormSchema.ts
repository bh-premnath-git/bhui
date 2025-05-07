import { z } from "zod";
import type { Project } from "@/types/admin/project";

export const userFormSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  enabled: z.boolean(),
  projects: z.array(z.string()),
  realm_roles: z.array(z.string()),
  username: z.string().optional(),
});

export type UserFormValues = z.infer<typeof userFormSchema>

export interface SelectOption {
  label: string
  value: string
}

export const getProjectOptions = (projects: Project[]) => {
  return projects.map(project => ({
    label: project.bh_project_name,
    value: project.bh_project_id.toString()
  }));
};

export const realmRoleOptions = [
  { label: 'admin-user', value: 'admin-user' },
  { label: 'ops-user', value: 'ops-user' },
  { label: 'designer-user', value: 'designer-user' },
  // default-roles-bighammer-realm
]