// Interface for user role object
interface UserRole {
  role: string;
  permissions: string[];
}

// Interface for role checking commands
interface RoleCommand {
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
  execute: (callback: () => void) => void;
  or: (nextCommand: RoleCommand) => RoleCommand;
}

/**
 * Creates a role checking command using the commander pattern
 * @param roles Array of user role objects
 * @returns A command object with methods to check roles and permissions
 */
export const createRoleCommand = (roles: UserRole[]): RoleCommand => {
  const hasRole = (role: string): boolean => {
    return Array.isArray(roles) && roles.some(userRole => userRole.role === role);
  };

  const hasPermission = (permission: string): boolean => {
    return Array.isArray(roles) && roles.some(userRole => 
      Array.isArray(userRole.permissions) && userRole.permissions.includes(permission)
    );
  };

  const execute = (callback: () => void): void => {
    callback();
  };

  const or = (nextCommand: RoleCommand): RoleCommand => {
    return {
      hasRole: (role: string) => hasRole(role) || nextCommand.hasRole(role),
      hasPermission: (permission: string) => hasPermission(permission) || nextCommand.hasPermission(permission),
      execute: (callback: () => void) => {
        if (hasRole("admin_role")) {
          callback();
        } else {
          nextCommand.execute(callback);
        }
      },
      or: (next: RoleCommand) => or(next),
    };
  };

  return {
    hasRole,
    hasPermission,
    execute,
    or
  };
};

/**
 * Check if the user has admin role privileges
 * @param roles Array of user role objects
 * @returns boolean indicating if user has admin role
 */
export const hasAdminRole = (roles: UserRole[] = []): boolean => {
  return roles.some(userRole => userRole.role === "admin_role");
};

/**
 * Check if admin navigation items should be shown to the user
 * Uses commander pattern to check roles
 * @param roles Array of user role objects
 * @returns boolean indicating if admin items should be shown
 */
export const shouldShowAdminNavItems = (roles: UserRole[] = []): boolean => {
  // Create role command
  const roleCommand = createRoleCommand(roles);
  
  // Check if user has admin_role
  return roleCommand.hasRole("admin_role");
};

/**
 * Check if user has a specific permission
 * @param roles Array of user role objects
 * @param permission Permission to check for
 * @returns boolean indicating if user has the permission
 */
export const hasPermission = (roles: UserRole[] = [], permission: string): boolean => {
  const roleCommand = createRoleCommand(roles);
  return roleCommand.hasPermission(permission);
};
