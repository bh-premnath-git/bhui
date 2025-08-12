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

export function EditUser() {
  const navigate = useNavigate();
  const { id } = useParams(); // id is actually the email from the URL
  const { user, isUserLoading, isUserFetching } = useUsersQuery({ shouldFetch: true, email: id });
  const { handleUpdateUser, isUpdating, updateError } = useUserUpdateMutation();
  const [error, setError] = useState<string | null>(null);
  
  const onSubmit = async (data: UserFormValues) => {
    if (!id || !user) return;

    try {
      setError(null);
      
      // Transform form data using existing user's bh_roles and bh_resources as base
      // Update only the fields that can be modified through the form
      const payload: UserUpdateData = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        is_tenant_admin: data.is_tenant_admin,
        username: data.username,
        enabled: data.enabled,
        emailVerified: data.emailVerified,
        // Preserve existing bh_roles and bh_resources from the user data
        // These should be managed through the role assignment system, not the form
        bh_roles: user.bh_roles || [],
        bh_resources: user.bh_resources || [],
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
            // Pass the roles from user data instead of fetching separately
            roles={user.bh_roles?.map(bhRole => ({
              id: bhRole.bh_role_matrix_id || 0,
              role_name: bhRole.role_name || '',
              created_at: bhRole.created_at || '',
              updated_at: bhRole.updated_at || '',
              created_by: bhRole.created_by || '',
              updated_by: bhRole.updated_by || null,
              is_deleted: bhRole.is_deleted || false,
              deleted_by: bhRole.deleted_by || null,
            })) || []}
            rolesLoading={false}
            rolesError={false}
          />
        </div>
      </div>
    </UserPageLayout>
  );
}
