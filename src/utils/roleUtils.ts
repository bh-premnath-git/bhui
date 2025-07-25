// Interface for role checking commands
interface RoleCommand {
  hasRole: (role: string) => boolean;
  execute: (callback: () => void) => void;
  or: (nextCommand: RoleCommand) => RoleCommand;
}

/**
 * Creates a role checking command using the commander pattern
 * @param roles Array of user roles
 * @returns A command object with methods to check roles
 */
export const createRoleCommand = (roles: string[]): RoleCommand => {
  const hasRole = (role: string): boolean => {
    return Array.isArray(roles) && roles.includes(role);
  };

  const execute = (callback: () => void): void => {
    callback();
  };

  const or = (nextCommand: RoleCommand): RoleCommand => {
    return {
      hasRole: (role: string) => hasRole(role) || nextCommand.hasRole(role),
      execute: (callback: () => void) => {
        if (hasRole("tenent_admin_role")) {
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
    execute,
    or
  };
};

/**
 * Check if the user has admin role privileges
 * @param roles Array of user roles
 * @returns boolean indicating if user has admin role
 */
export const hasAdminRole = (roles: string[] = []): boolean => {
  return roles.includes("tenent_admin_role");
};

/**
 * Check if admin navigation items should be shown to the user
 * Uses commander pattern to check roles
 * @param roles Array of user roles
 * @returns boolean indicating if admin items should be shown
 */
export const shouldShowAdminNavItems = (roles: string[] = []): boolean => {
  // Create role command
  const roleCommand = createRoleCommand(roles);
  
  // Check if user has tenent_admin_role
  return roleCommand.hasRole("tenent_admin_role");
};
