import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LoadingState } from '@/components/shared/LoadingState';
import { ROUTES } from "@/config/routes";
import { UserForm } from "./components/UserForm";
import { useUsersQuery } from "./hooks/useUsersQuery";
import { useUserUpdateMutation } from "./hooks/useUserUpdateMutation";
import { UserPageLayout } from "./components/UserPageLayout";
import type { UserFormValues } from "./components/userFormSchema";
import type { UserUpdateData } from "@/types/admin/user";
import type { Role } from "@/types/admin/roles";

export function EditUser() {
  const navigate = useNavigate();
  const { id } = useParams(); // id is actually the email from the URL
  const { user, isUserLoading, isUserFetching } = useUsersQuery({ shouldFetch: true, email: id });
  const { handleUpdateUser, isUpdating, updateError } = useUserUpdateMutation();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: UserFormValues) => {
    if (!id) return;

    try {
      setError(null);
      const payload = { ...data } as UserUpdateData;
      if (payload.is_tenant_admin) {
        delete (payload as any).assignments;
      }
      await handleUpdateUser(id, payload);
      navigate(ROUTES.ADMIN.USERS.INDEX);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    }
  };

  if (isUserLoading || (isUserFetching && (!user || user.email !== id))) {
    return <LoadingState className="h-40 w-40" />;
  }

  if (!user) {
    return <div className="p-4 mt-6">User not found</div>;
  }

  // Transform user data for form initialization
  const isTenantAdmin = (user.roles as Role[] | undefined)?.some(
    (r) => r.module_name === 'tenant_admin' && r.module_type === 'admin'
  ) ?? false

  // Map roles to project and environment assignments
  const projectAssignments: { project: string, roles: string[] }[] = [];
  const environmentAssignments: { environment: string, roles: string[] }[] = [];

  // Group roles by project_id and environment_id
  const roles = user.roles || [];
  const projectRoles = new Map<string, string[]>();
  const environmentRoles = new Map<string, string[]>();

  // Process roles and organize by project/environment
  roles.forEach(role => {
    // Skip tenant_admin roles, they're handled separately
    if (role.module_name === 'tenant_admin' && role.module_type === 'admin') {
      return;
    }

    // For project-specific roles
    if (role.project_id && role.project_id !== '*') {
      if (!projectRoles.has(role.project_id)) {
        projectRoles.set(role.project_id, []);
      }
      // Use role.id as the role identifier for consistency
      projectRoles.get(role.project_id)?.push(String(role.id));
    }
    
    // For environment-specific roles
    if (role.environment_id && role.environment_id !== '*') {
      if (!environmentRoles.has(role.environment_id)) {
        environmentRoles.set(role.environment_id, []);
      }
      // Use role.id as the role identifier for consistency
      environmentRoles.get(role.environment_id)?.push(String(role.id));
    }
  });

  // Convert maps to arrays for form data
  projectRoles.forEach((roles, projectId) => {
    projectAssignments.push({
      project: projectId,
      roles: roles
    });
  });

  environmentRoles.forEach((roles, environmentId) => {
    environmentAssignments.push({
      environment: environmentId,
      roles: roles
    });
  });

  console.log('Mapped project assignments:', projectAssignments);
  console.log('Mapped environment assignments:', environmentAssignments);

  const formInitialData: UserFormValues = {
    first_name: user.firstName,
    last_name: user.lastName,
    email: user.email,
    username: user.username,
    enabled: user.enabled,
    emailVerified: user.emailVerified,
    is_tenant_admin: isTenantAdmin,
    // Add role assignments mapped from user.roles
    project_assignments: projectAssignments,
    environment_assignments: environmentAssignments,
    // Keeping legacy assignments field for backward compatibility
    assignments: [],
  };

  return (
    <UserPageLayout description="Update user information and permissions">
      <div className="p-6">
        <div className="max-w-5xl mx-auto">
          <UserForm<UserFormValues>
            initialData={formInitialData}
            onSubmit={onSubmit}
            mode="edit"
            isSubmitting={isUpdating}
            error={error || (updateError ? String(updateError) : null)}
            user={user}
          />
        </div>
      </div>
    </UserPageLayout>
  );
}
