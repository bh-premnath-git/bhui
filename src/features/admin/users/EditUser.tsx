import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LoadingState } from '@/components/shared/LoadingState';
import { ROUTES } from "@/config/routes";
import { UserForm } from "./components/UserForm";
import { useUsers } from "./hooks/useUsers";
import { UserPageLayout } from "./components/UserPageLayout";
import type { UserMutationData } from "@/types/admin/user";

export function EditUser() {
  const navigate = useNavigate();
  const { id } = useParams(); // id is actually the email from the URL
  const { handleUpdateUser, user, isUserLoading } = useUsers({ shouldFetch: true, email: id });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: UserMutationData) => {
    if (!id) return;

    try {
      setIsSubmitting(true);
      setError(null);
      navigate(ROUTES.ADMIN.USERS.INDEX);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isUserLoading) {
    return <LoadingState className="h-40 w-40" />;
  }

  if (!user) {
    return <div className="p-4 mt-6">User not found</div>;
  }

  // Transform user data for form initialization
  const formInitialData: Partial<UserMutationData> = {
    first_name: user.firstName,
    last_name: user.lastName,
    email: user.email,
    enabled: user.enabled
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
            isSubmitting={isSubmitting}
            error={error}
          />
        </div>
      </div>
    </UserPageLayout>
  );
}