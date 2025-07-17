export const AVAILABLE_ROLES = ["designer", "ops_user", "viewer", "qa"] as const;
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
