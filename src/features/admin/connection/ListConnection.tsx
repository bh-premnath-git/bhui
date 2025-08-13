import { useCallback, useEffect, useState } from 'react';
import { DataTable } from '@/components/bh-table/data-table';
import { Row } from '@tanstack/react-table';
import { useNavigation } from '@/hooks/useNavigation';
import { ROUTES } from '@/config/routes';
import { createColumns, getToolbarConfig } from './config/Columns.Config';
import { Connection } from '@/types/admin/connection';
import { useConnectionManagementService } from './services/connMgtSrv';
import { DeleteConnectionDialog } from './components/DeleteConnectionDialog';
import { useConnections } from './hooks/useConnection';

interface ListConnectionProps {
  connections: Connection[];
  pageCount: number;
  pageIndex: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

export function ListConnection({ connections, pageCount, pageIndex, pageSize, onPageChange, onPageSizeChange, hasNextPage, hasPreviousPage }: ListConnectionProps) {
  const { handleNavigation } = useNavigation()
  const connMgtSrv = useConnectionManagementService();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { refetch: refetchConnections } = useConnections();

  const onRowClickHandler = useCallback((row: Row<Connection>) => {
    connMgtSrv.selectatedConnection(row.original);
    handleNavigation(ROUTES.ADMIN.CONNECTION.EDIT(row.original.id.toString()));
  }, [connMgtSrv, handleNavigation]);

  const handleDeleteClick = useCallback((connection: Connection) => {
    connMgtSrv.selectatedConnection(connection);
    setDeleteDialogOpen(true);
  }, [connMgtSrv]);

   const tableColumns = createColumns({ onDelete: handleDeleteClick });

  return (
    <>
    <DataTable<Connection>
      columns={tableColumns}
      data={connections || []}
      topVariant="simple"
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
    <DeleteConnectionDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onSuccess={refetchConnections}/>
    </>
  );
}
