import { useCallback } from 'react';
import { DataTable } from '@/components/bh-table/data-table';
import { Row } from '@tanstack/react-table';
import { useNavigation } from '@/hooks/useNavigation';
import { ROUTES } from '@/config/routes';
import { columns, getToolbarConfig } from './config/Columns.Config';
import { Connection } from '@/types/admin/connection';
import { useConnectionManagementService } from './services/connMgtSrv';

export function ListConnection({ connections }: { connections: Connection[] }) {
  const { handleNavigation } = useNavigation()
  const connMgtSrv = useConnectionManagementService();

  const onRowClickHandler = useCallback((row: Row<Connection>) => {
    connMgtSrv.selectatedConnection(row.original);
    handleNavigation(ROUTES.ADMIN.CONNECTION.EDIT(row.original.id.toString()));
  }, [connMgtSrv, handleNavigation]);

  return (
    <DataTable<Connection>
      columns={columns}
      data={connections || []}
      topVariant="simple"
      pagination={true}
      onRowClick={onRowClickHandler}
      toolbarConfig={getToolbarConfig()}
    />
  );
}
