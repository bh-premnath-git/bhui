import type { Role } from "./roles";

export interface Pagination {
  total: number;
  next: boolean;
  prev: boolean;
  offset: number;
  limit: number;
}

export interface BaseUser {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  enabled: boolean;
  emailVerified: boolean;
}

export interface User extends BaseUser {
  id: string;
  totp: boolean;
  disableableCredentialTypes: string[];
  requiredActions: string[];
  notBefore: number;
  access: {
    manageGroupMembership: boolean;
    view: boolean;
    mapRoles: boolean;
    impersonate: boolean;
    manage: boolean;
  };
  attributes: Record<string, any>;
  bh_roles: Role[];
  bh_resources: Record<string, any>[]
}

export interface UsersPaginatedResponse extends Pagination {
  data: User[];
}

export interface UserResponse {
  user: User;
  message?: string;
}

// Base form data type with common fields
interface BaseUserFormData {
  first_name: string;
  last_name: string;
  email: string;
  is_tenant_admin?: boolean;
}

// Create-specific form data
export interface UserCreateData extends Omit<BaseUserFormData, 'is_tenant_admin'> {
  bh_roles: Array<Record<string, any>>;
  bh_resources: Array<Record<string, any>>;
  
}

// Update-specific form data
export interface UserUpdateData {
  bh_roles: Array<Record<string, any>>;
  bh_resources: Array<Record<string, any>>;
}

// Type guard to check if form data is for update
export function isUpdateData(data: UserCreateData | UserUpdateData): data is UserUpdateData {
  return 'enabled' in data || 'emailVerified' in data;
}

// Legacy type for backward compatibility (mark as deprecated)
/** @deprecated Use UserCreateData or UserUpdateData instead */
export type UserMutationData = UserCreateData | UserUpdateData;
