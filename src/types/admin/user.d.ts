export interface Pagination {
  total: number;
  next: boolean;
  prev: boolean;
  offset: number;
  limit: number;
}

// Update BaseUser to match API requirements
export interface BaseUser {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  enabled: boolean;
  emailVerified: boolean;
}

// Complete User type with all API properties
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
}

// Add proper response types
export interface UsersPaginatedResponse {
  total: number;
  next: boolean;
  prev: boolean;
  offset: number;
  limit: number;
  data: User[];
}

export interface UserResponse {
  user: User;
  message?: string;
}

// Create separate mutation types for different operations
export type UserCreateData = {
  email: string;
  first_name: string;
  last_name: string;
};

export type UserUpdateData = {
  email?: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  enabled?: boolean;
  emailVerified?: boolean;
  roles?: string[];
  projects?: string[];
  environments?: string[];
  is_tenant_admin?: boolean;
};

// Keep UserMutationData as a union for backward compatibility
export type UserMutationData = UserCreateData | UserUpdateData;