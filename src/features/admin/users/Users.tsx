import { useCallback, useState } from 'react';
import { DataTable } from '@/components/bh-table/data-table';
import { createColumns, getToolbarConfig } from './config/columns.config';
import { User } from '@/types/admin/user';
import { Row } from '@tanstack/react-table';
import { useNavigation } from '@/hooks/useNavigation';
import { ROUTES } from '@/config/routes';
import { useUserManagementService } from '@/features/admin/users/services/userMgtSrv';
import { useUserUpdateMutation } from './hooks/useUserUpdateMutation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UsersListProps {
  users: User[];
  pageCount: number;
  pageIndex: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

export function UsersList({ 
  users, 
  pageCount, 
  pageIndex, 
  pageSize, 
  onPageChange, 
  onPageSizeChange, 
  hasNextPage, 
  hasPreviousPage 
}: UsersListProps) {
  const { handleNavigation } = useNavigation();
  const usrMgntSrv = useUserManagementService();
  const { handleDeleteUser, isDeleting } = useUserUpdateMutation();
  
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const onRowClickHandler = useCallback((row: Row<User>) => {
    usrMgntSrv.selectedUser(row.original);
    handleNavigation(ROUTES.ADMIN.USERS.EDIT(row.original.email));
  }, [usrMgntSrv, handleNavigation]);

  const handleDeleteClick = useCallback((user: User) => {
    setUserToDelete(user);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!userToDelete) return;
    
    try {
      await handleDeleteUser(userToDelete.email);
      setUserToDelete(null);
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  }, [userToDelete, handleDeleteUser]);

  const cancelDelete = useCallback(() => {
    setUserToDelete(null);
  }, []);

  const columns = createColumns({ onDelete: handleDeleteClick });

  return (
    <>
      <DataTable<User>
        columns={columns}
        data={users || []}
        topVariant="simple"
        pagination={true}
        onRowClick={onRowClickHandler}
        toolbarConfig={getToolbarConfig()}
        pageCount={pageCount}
        pageIndex={pageIndex}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
      />

      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && cancelDelete()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete user "{userToDelete?.username}" ({userToDelete?.email})? 
              This action cannot be undone and will permanently remove the user and all their associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? 'Deleting...' : 'Delete User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
