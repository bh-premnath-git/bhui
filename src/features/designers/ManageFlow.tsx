import { useEffect, useState } from 'react';
import { DataTable } from '@/components/bh-table/data-table';
import { columns, getToolbarConfig } from './flow/config/columns.config';
import { Row } from '@tanstack/react-table';
import { useNavigation } from '@/hooks/useNavigation';
import { ROUTES } from '@/config/routes';
import { Flow } from '@/types/designer/flow';
import { useFlowManagementService } from './flow/services/flowMgtSrv';
import { CreateFlowDialog } from './flow/components/CreateFlowDialog';
import { DeleteFlowDialog } from './flow/components/DeleteFlowDialog';
import { useFlow } from './flow/hooks/useFlow';
import { useFlow as useFlowCtx } from '@/context/designers/FlowContext'

export function FlowList({ flows }: { flows: Flow[] }) {
  const { setSelectedFlowId } = useFlowCtx();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { handleNavigation } = useNavigation();
  const flowSrv = useFlowManagementService();
  const { fetchFlowsList } = useFlow();
  const { refetch: refetchFlows } = fetchFlowsList(true);

  const onRowClickHandler = (row: Row<Flow>) => {
    flowSrv.selectedFlow(row.original)
    setSelectedFlowId(row.original.flow_id.toString())
    handleNavigation(ROUTES.DESIGNERS.FLOW_PLAYGROUND(row.original.flow_id.toString()))
  }

  useEffect(() => {
    const handleOpenCreate = () => setCreateDialogOpen(true);
    const handleOpenDelete = (event: Event) => {
      const customEvent = event as CustomEvent<Flow>;
      flowSrv.selectedFlow(customEvent.detail);
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
      <CreateFlowDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
      <DeleteFlowDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onSuccess={refetchFlows}
      />
    </>);
}
