import { useCallback, useEffect, useState } from 'react';
import { DataTable } from '@/components/bh-table/data-table';
import { Row } from '@tanstack/react-table';
import { useNavigation } from '@/hooks/useNavigation';
import { ROUTES } from '@/config/routes';
import { columns, getToolbarConfig } from './config/Columns.Config';
import { Connection } from '@/types/admin/connection';
import { useConnectionManagementService } from './services/connMgtSrv';
import { DeleteConnectionDialog } from './components/DeleteConnectionDialog';
import { useConnections } from './hooks/useConnection';

export function ListConnection({ connections }: { connections: Connection[] }) {
  const { handleNavigation } = useNavigation()
  const connMgtSrv = useConnectionManagementService();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const  connectionResponse  = useConnections();
  const { refetch: refetchConnections } = connectionResponse;

  const onRowClickHandler = useCallback((row: Row<Connection>) => {
    connMgtSrv.selectatedConnection(row.original);
    handleNavigation(ROUTES.ADMIN.CONNECTION.EDIT(row.original.id.toString()));
  }, [connMgtSrv, handleNavigation]);

  useEffect(() => {
    const handleOpenDelete = (event: Event) => {
      const customEvent = event as CustomEvent<Connection>;
      connMgtSrv.selectatedConnection(customEvent.detail);
      setDeleteDialogOpen(true);
    };
    window.addEventListener("openConnectionDeleteDialog", handleOpenDelete);

    return() => {
      window.removeEventListener("openConnectionDeleteDialog", handleOpenDelete);
    }
  }, []);

  return (
    <>
    <DataTable<Connection>
      columns={columns}
      data={connections || []}
      topVariant="simple"
      pagination={true}
      onRowClick={onRowClickHandler}
      toolbarConfig={getToolbarConfig()}
    />
    <DeleteConnectionDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onSuccess={refetchConnections}/>
    </>
  );
}
