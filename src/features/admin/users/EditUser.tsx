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
  const { isUpdating, updateError } = useUserUpdateMutation();
  const [error, setError] = useState<string | null>(null);
  
  console.log('User data:', user);
  
  const onSubmit = async (data: UserFormValues) => {
    if (!id) return;

    try {
      setError(null);
      const payload = { ...data } as UserUpdateData;
      if (payload.is_tenant_admin) {
        delete (payload as any).assignments;
      }
      //await handleUpdateUser(id, payload);
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
  // Parse role information from attributes
  let parsedRoles: any[] = [];
  let parsedResources: any[] = [];
  
  try {
    // Parse bh_roles from attributes
    if (user.attributes?.bh_roles?.[0]) {
      const rolesData = JSON.parse(user.attributes.bh_roles[0]);
      parsedRoles = rolesData.roles || [];
    }
    
    // Parse bh_resources from attributes
    if (user.attributes?.bh_resources?.[0]) {
      const resourcesData = JSON.parse(user.attributes.bh_resources[0]);
      parsedResources = resourcesData.resources || [];
    }
  } catch (error) {
    console.error('Error parsing role/resource data:', error);
  }

  // Check if user is tenant admin based on parsed roles
  const isTenantAdmin = parsedRoles.some(
    (r) => r.role === 'admin_role' || r.role === 'tenant_admin'
  ) ?? false

  // Map roles to project and environment assignments
  const projectAssignments: { project: string, roles: string[] }[] = [];
  const environmentAssignments: { environment: string, roles: string[] }[] = [];

  // Note: The current attributes structure doesn't include project/environment information
  // The roles are just: {role: "admin_role", permissions: ["edit", "view", "delete"]}
  // So we'll initialize empty assignments for now

  const formInitialData: UserFormValues = {
    first_name: user.firstName,
    last_name: user.lastName,
    email: user.email,
    username: user.username,
    enabled: user.enabled,
    emailVerified: user.emailVerified,
    is_tenant_admin: isTenantAdmin,
    project_assignments: projectAssignments,
    environment_assignments: environmentAssignments,
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
