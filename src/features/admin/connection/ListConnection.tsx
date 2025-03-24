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
  const connectionResponse = useConnections();
  const { refetch: refetchConnections } = connectionResponse;
  
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

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

  // Calculate paginated data
  const paginatedData = connections?.slice(
    pageIndex * pageSize,
    (pageIndex + 1) * pageSize
  ) || [];

  return (
    <>
    <DataTable<Connection>
      columns={columns}
      data={paginatedData}
      fullData={connections}  // Pass full data for total count
      topVariant="simple"
      pagination={true}
      onRowClick={onRowClickHandler}
      toolbarConfig={getToolbarConfig()}
      pageIndex={pageIndex}
      pageSize={pageSize}
      onPageChange={(page) => setPageIndex(page - 1)}
      onPageSizeChange={setPageSize}
      pageCount={Math.ceil((connections?.length || 0) / pageSize)}
    />
    <DeleteConnectionDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onSuccess={refetchConnections}/>
    </>
  );
}
