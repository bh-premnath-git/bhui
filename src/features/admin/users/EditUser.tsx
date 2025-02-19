import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { RootState } from "@/store";
import { useAppSelector } from "@/hooks/uaeRedux"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { UserForm } from "./components/UserForm"
import { useUsers } from "./hooks/useUsers"
import type { UserMutationData } from "@/types/admin/user"

export function EditUser() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { handleUpdateUser } = useUsers();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const user = useAppSelector((state: RootState) => state.users.selectedUser);
  const onSubmit = async (data: UserMutationData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      if (id) {
        await handleUpdateUser(id, data);
        navigate("/admin/users");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Edit User</h1>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => navigate("/admin/users")}
        >
          <ArrowLeft className="h-4 w-4" />
          View All Users
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <UserForm
          initialData={user}
          onSubmit={onSubmit}
          mode="edit"
          isSubmitting={isSubmitting}
          error={error}
        />
      </div>
    </div>
  );
}