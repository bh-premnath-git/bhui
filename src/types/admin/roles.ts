export const AVAILABLE_ROLES = ["designer", "ops_user", "viewer", "qa", "tenant_admin"] as const;
export type AppRoles = (typeof AVAILABLE_ROLES)[number];

export type RoleType<T extends string = AppRoles> = {
  [K in T]?: boolean;
};

export type ScopedRoles<T extends string = AppRoles> = {
  [name: string]: RoleType<T>;
};

export interface UserRole<T extends string = AppRoles> {
  tenant_admin: boolean;
  projects: ScopedRoles<T>;
  environments: ScopedRoles<T>;
}

export interface Role {
  tenant_key: string;
  id: number;
  bh_role_matrix_id: number;
  module_type: string;
  module_name: string;
  role_name: string;
  project_id: string | "*";
  environment_id: string | "*";
  bh_view: boolean;
  bh_edit: boolean;
  bh_delete: boolean;
}