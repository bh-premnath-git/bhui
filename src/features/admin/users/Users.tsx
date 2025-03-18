import { DataTable } from '@/components/bh-table/data-table';
import { columns, getToolbarConfig } from './config/columns.config';
import { User } from '@/types/admin/user';
import { Row } from '@tanstack/react-table';
import { useNavigation } from '@/hooks/useNavigation';
import { ROUTES } from '@/config/routes';
import { useUserManagementService } from '@/features/admin/users/services/userMgtSrv';

interface UsersListProps {
  users: User[];
  currentPage?: number;
  pageSize?: number;
  totalCount?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export function UsersList({ 
  users, 
  currentPage = 1, 
  pageSize = 10, 
  totalCount = 0,
  onPageChange,
  onPageSizeChange
}: UsersListProps) {
  const { handleNavigation } = useNavigation();
  const usrMgntSrv = useUserManagementService();

  const onRowClickHandler = (row: Row<User>) => {
    usrMgntSrv.selectedUser(row.original);
    handleNavigation(ROUTES.ADMIN.USERS.EDIT(row.original.username));
  };

  const handlePageChange = (page: number) => {
    if (onPageChange) {
      onPageChange(page);
    }
  };

  const handlePageSizeChange = (size: number) => {
    if (onPageSizeChange) {
      onPageSizeChange(size);
    }
  };

  return (
    <DataTable<User>
      columns={columns}
      data={users || []}
      topVariant="simple"
      pagination={true}
      pageCount={Math.ceil(totalCount / pageSize)}
      pageIndex={currentPage - 1} // Convert 1-based to 0-based for table component
      pageSize={pageSize}
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
      toolbarConfig={getToolbarConfig()}
      onRowClick={onRowClickHandler}
    />
  );
}
