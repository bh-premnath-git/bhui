
import { DataTable } from '@/components/bh-table/data-table';
import { columns, getToolbarConfig } from './config/columns.config';
import { User } from '@/types/admin/user';
import { Row } from '@tanstack/react-table';
import { useNavigation } from '@/hooks/useNavigation';
import { ROUTES } from '@/config/routes';
import { useUserManagementService } from '@/features/admin/users/services/userMgtSrv';

export function UsersList({ users }: { users: User[] }) {
  const { handleNavigation } = useNavigation()
  const usrMgntSrv = useUserManagementService();

  const onRowClickHandler = (row: Row<User>) => {
    usrMgntSrv.selectedUser(row.original)
    handleNavigation(ROUTES.ADMIN.USERS.EDIT(row.original.id))
  }
  return (
    <DataTable<User>
      columns={columns}
      data={users || []}
      topVariant="simple"
      pagination={true}
      toolbarConfig={getToolbarConfig()}
      onRowClick={onRowClickHandler}
    />
  );
}

