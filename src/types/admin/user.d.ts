export interface Pagination {
  first: number;
  max_results: number;
  has_next: boolean;
  has_previous: boolean;
}

// Update BaseUser to match API requirements
export interface BaseUser {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  enabled: boolean;
  emailVerified: boolean;
  realm_roles: string[];
  projects: string[];

  // Add optional fields for user creation/update
  credentials?: Array<{
    type: string;
    value: string;
    temporary: boolean;
  }>;
}

// Complete User type with all API properties
export interface User extends BaseUser {
  id: string;
  createdTimestamp: number;
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

  // Add missing API fields
  attributes?: Record<string, any>;
  groups?: string[];
  clientRoles?: Record<string, string[]>;
}

// Add proper response types
export interface UsersPaginatedResponse {
  users: User[];
  total: number;
  pagination: Pagination;
}

export interface UserResponse {
  user: User;
  message?: string;
}

// Update mutation type to handle different operations
export type UserMutationData = Omit<BaseUser, 'firstName' | 'lastName'> & {
  firstName?: string;
  lastName?: string;
  first_name?: string;  // Form field name
  last_name?: string;   // Form field name
  credentials?: Array<{
    type: string;
    value: string;
    temporary: boolean;
  }>;
};