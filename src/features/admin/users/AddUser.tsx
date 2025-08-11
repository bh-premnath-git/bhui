import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/config/routes";
import { UserForm } from "./components/UserForm";
import { useUserCreateMutation } from "./hooks/useUserCreateMutation";
import { UserPageLayout } from "./components/UserPageLayout";
import type { UserCreateData } from "@/types/admin/user";
import type { UserCreateValues } from "./components/userFormSchema";
import { transformToBhRoles, transformToBhResources } from "./components/userFormSchema";
import { useAppSelector } from "@/hooks/useRedux";
import { useRoleMatrixQuery } from "./hooks/useRoleMatrixQuery";

export function AddUser() {
  const navigate = useNavigate();
  const { handleCreateUser, isCreating, createError } = useUserCreateMutation();
  const [error, setError] = useState<string | null>(null);
  
  // Get projects and environments from Redux store
  const projects = useAppSelector((state) => state.users.projects);
  const environments = useAppSelector((state) => state.users.environments);
  
  // Get all roles for transformation
  const { roles, isLoading: rolesLoading, isError: rolesError } = useRoleMatrixQuery({
    fetchAll: true,
    enabled: true,
  });
  
  const onSubmit = async (data: UserCreateValues) => {
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
      
      const payload: UserCreateData = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        bh_roles: bhRoles,
        bh_resources: bhResources,
      };
      await handleCreateUser(payload);
      navigate(ROUTES.ADMIN.USERS.INDEX);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    }
  };

  return (
    <UserPageLayout description="Create a new user and assign their permissions">
      <div className="p-6">
        <div className="max-w-5xl mx-auto">
          <UserForm<UserCreateValues>
            onSubmit={onSubmit}
            mode="create"
            isSubmitting={isCreating}
            error={error || (createError ? String(createError) : null)}
            roles={roles}
            rolesLoading={rolesLoading}
            rolesError={rolesError}
          />
        </div>
      </div>
    </UserPageLayout>
  );
}
