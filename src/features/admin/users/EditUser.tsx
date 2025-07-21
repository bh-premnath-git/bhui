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

  const formInitialData: UserFormValues = {
    first_name: user.firstName,
    last_name: user.lastName,
    email: user.email,
    username: user.username,
    enabled: user.enabled,
    emailVerified: user.emailVerified,
    is_tenant_admin: isTenantAdmin,
    // Add any role assignments if available
    assignments: [], // Populate from user.assignments if available
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
