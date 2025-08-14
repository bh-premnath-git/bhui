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
import { transformToBhRoles, transformToBhResources } from "./components/userFormSchema";
import { useAppSelector } from "@/hooks/useRedux";
import { useRoleMatrixQuery } from "./hooks/useRoleMatrixQuery";

export function EditUser() {
  const navigate = useNavigate();
  const { id } = useParams(); // id is actually the email from the URL
  const { user, isUserLoading, isUserFetching } = useUsersQuery({ shouldFetch: true, email: id });
  const { handleUpdateUser, isUpdating, updateError } = useUserUpdateMutation();
  const [error, setError] = useState<string | null>(null);
  
  // Get projects and environments from Redux store
  const projects = useAppSelector((state) => state.users.projects);
  const environments = useAppSelector((state) => state.users.environments);
  
  // Get all roles for proper role selection (like AddUser)
  const { roles, isLoading: rolesLoading, isError: rolesError } = useRoleMatrixQuery({
    fetchAll: true,
    enabled: true,
  });
  
  const onSubmit = async (data: UserFormValues) => {
    if (!id || !user) return;

    try {
      setError(null);
      
      // Transform form data into required format
      const bhRoles = transformToBhRoles(
        data.selected_roles || [],
        data.role_permissions || {},
        roles || []
      );
      
      const bhResources = transformToBhResources(
        data.project_assignments || [],
        data.environment_assignments || [],
        projects || [],
        environments || []
      );
      
      const payload: UserUpdateData = {
        bh_roles: bhRoles,
        bh_resources: bhResources,
      };
      
      console.log('User update payload:', payload);
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

  // Transform existing bh_roles data for form initialization
  const selectedRoles: string[] = [];
  const rolePermissions: Record<string, { view: boolean; edit: boolean; delete: boolean }> = {};
  
  // Extract role information from bh_roles
  if (user.bh_roles && Array.isArray(user.bh_roles)) {
    user.bh_roles.forEach((bhRole) => {
      if (bhRole.bh_role_matrix_id) {
        selectedRoles.push(bhRole.bh_role_matrix_id.toString());
        
        // Map permissions from the API format to form format
        if (bhRole.permissions && Array.isArray(bhRole.permissions)) {
          rolePermissions[bhRole.bh_role_matrix_id.toString()] = {
            view: bhRole.permissions.includes('view'),
            edit: bhRole.permissions.includes('edit'), 
            delete: bhRole.permissions.includes('delete'),
          };
        }
      }
    });
  }

  // Transform existing bh_resources data for form initialization
  const projectAssignments: string[] = [];
  const environmentAssignments: string[] = [];
  
  if (user.bh_resources && Array.isArray(user.bh_resources)) {
    user.bh_resources.forEach((resource) => {
      if (resource.resource_type === 'project' && resource.resource_id) {
        projectAssignments.push(resource.resource_id.toString());
      } else if (resource.resource_type === 'environment' && resource.resource_id) {
        environmentAssignments.push(resource.resource_id.toString());
      }
    });
  }

  // Check if user has admin role
  const isTenantAdmin = user.bh_roles?.some(
    (role) => role.role_name === 'admin_role' || role.role_name === 'tenant_admin'
  ) ?? false;

  const initialData: UserFormValues = {
    first_name: user.firstName,
    last_name: user.lastName,
    email: user.email,
    username: user.username,
    enabled: user.enabled,
    emailVerified: user.emailVerified,
    is_tenant_admin: isTenantAdmin,
    selected_roles: selectedRoles,
    role_permissions: rolePermissions,
    project_assignments: projectAssignments,
    environment_assignments: environmentAssignments,
  };

  return (
    <UserPageLayout description="Update user information and permissions">
      <div className="p-6">
        <div className="max-w-5xl mx-auto">
          <UserForm<UserFormValues>
            initialData={initialData}
            onSubmit={onSubmit}
            mode="edit"
            isSubmitting={isUpdating}
            error={error || (updateError ? String(updateError) : null)}
            user={user}
            roles={roles}
            rolesLoading={rolesLoading}
            rolesError={rolesError}
          />
        </div>
      </div>
    </UserPageLayout>
  );
}
