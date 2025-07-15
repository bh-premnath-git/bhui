import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/config/routes";
import { UserForm } from "./components/UserForm";
import { useUsers } from "./hooks/useUsers";
import { UserPageLayout } from "./components/UserPageLayout";
import type { UserMutationData } from "@/types/admin/user";

export function AddUser() {
  const navigate = useNavigate();
  const { handleCreateUser } = useUsers();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const onSubmit = async (data: UserMutationData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await handleCreateUser(data);
      navigate(ROUTES.ADMIN.USERS.INDEX);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <UserPageLayout description="Create a new user and assign their permissions">
      <div className="p-6">
        <div className="max-w-5xl mx-auto">
          <UserForm
            onSubmit={onSubmit}
            mode="create"
            isSubmitting={isSubmitting}
            error={error}
          />
        </div>
      </div>
    </UserPageLayout>
  );
}