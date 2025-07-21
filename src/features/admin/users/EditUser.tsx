import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LoadingState } from '@/components/shared/LoadingState';
import { ROUTES } from "@/config/routes";
import { UserForm } from "./components/UserForm";
import { useUsersQuery } from "./hooks/useUsersQuery";
import { useUserUpdateMutation } from "./hooks/useUserUpdateMutation";
import { UserPageLayout } from "./components/UserPageLayout";
import type { UserUpdateData } from "@/types/admin/user";

export function EditUser() {
  const navigate = useNavigate();
  const { id } = useParams(); // id is actually the email from the URL
  const { user, isUserLoading } = useUsersQuery({ shouldFetch: true, email: id });
  const { handleUpdateUser, isUpdating, updateError } = useUserUpdateMutation();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: UserUpdateData) => {
    if (!id) return;

    try {
      setError(null);
      await handleUpdateUser(id, data);
      navigate(ROUTES.ADMIN.USERS.INDEX);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    }
  };

  if (isUserLoading) {
    return <LoadingState className="h-40 w-40" />;
  }

  if (!user) {
    return <div className="p-4 mt-6">User not found</div>;
  }

  // Transform user data for form initialization
  const formInitialData: Partial<UserUpdateData> = {
    first_name: user.firstName,
    last_name: user.lastName,
    email: user.email,
    enabled: user.enabled,
    assignments: [],
    is_tenant_admin: user.access?.manage && user.access?.manageGroupMembership && user.access?.view && user.access?.mapRoles && user.access?.impersonate
  };

  return (
    <UserPageLayout
      description="Update user information and permissions"
    >
      <div className="p-1 mt-6">
        <div className="max-w-5xl mx-auto">
          <UserForm
            mode="edit"
            initialData={formInitialData}
            onSubmit={onSubmit}
            isSubmitting={isUpdating}
            error={error || (updateError ? String(updateError) : null)}
            user={user}
          />
        </div>
      </div>
    </UserPageLayout>
  );
}
