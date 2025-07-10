import { useCallback } from 'react';
import { DataTable } from '@/components/bh-table/data-table';
import { columns, getToolbarConfig } from './config/columns.config';
import { User } from '@/types/admin/user';
import { Row } from '@tanstack/react-table';
import { useNavigation } from '@/hooks/useNavigation';
import { ROUTES } from '@/config/routes';
import { useUserManagementService } from '@/features/admin/users/services/userMgtSrv';

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

  const onRowClickHandler = useCallback((row: Row<User>) => {
    usrMgntSrv.selectedUser(row.original);
    handleNavigation(ROUTES.ADMIN.USERS.EDIT(row.original.username));
  }, [usrMgntSrv, handleNavigation]);

  return (
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
  );
}
