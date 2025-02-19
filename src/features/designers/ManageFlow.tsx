import { useEffect, useState } from 'react';
import { DataTable } from '@/components/bh-table/data-table';
import { columns, getToolbarConfig } from './flow/config/columns.config';
import { Row } from '@tanstack/react-table';
import { useNavigation } from '@/hooks/useNavigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ROUTES } from '@/config/routes';
import { Flow } from '@/types/designer/flow';
import { useFlowManagementService } from './flow/services/flowMgtSrv';

export function FlowList({ flows }: { flows: Flow[] }) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { handleNavigation } = useNavigation();
  const flowSrv = useFlowManagementService();

  const onRowClickHandler = (row: Row<Flow>) => {
    flowSrv.selectedFlow(row.original)
    handleNavigation(ROUTES.DESIGNERS.FLOW_PLAYGROUND(row.original.flow_id.toString()))
  }

  useEffect(() => {
    const handleOpenCreate = () => setCreateDialogOpen(true);
    const handleOpenDelete = (event: Event) => {
      const customEvent = event as CustomEvent<Flow>;
      setDeleteDialogOpen(true);
    };
    window.addEventListener("openCreateFlowDialog", handleOpenCreate);
    window.addEventListener("openFlowDeleteDialog", handleOpenDelete);

    return () => {
      window.removeEventListener("openCreateFlowDialog", handleOpenCreate);
      window.removeEventListener("openFlowDeleteDialog", handleOpenDelete);
    };
  }, []);

  return (
    <>
      <DataTable<Flow>
        columns={columns}
        data={flows || []}
        topVariant="simple"
        pagination={true}
        toolbarConfig={getToolbarConfig()}
        onRowClick={onRowClickHandler}
      />
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          create
        </DialogContent>
      </Dialog>
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          delete
        </DialogContent>
      </Dialog>
    </>);
}
