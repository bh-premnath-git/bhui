import { useEffect, useState } from 'react';
import { DataTable } from '@/components/bh-table/data-table';
import { columns, getToolbarConfig } from './pipeline/config/columns.config';
import { Row } from '@tanstack/react-table';
import { useNavigation } from '@/hooks/useNavigation';
import { ROUTES } from '@/config/routes';
import { Pipeline } from '@/types/designer/pipeline';
import { usePipelineManagementService } from './pipeline/services/pipelineMgtSrv';
// import { CreatePipelineDialog } from './pipeline/components/CreatePipelineDialog';
import { DeletePipelineDialog } from './pipeline/components/DeletePipelineDialog';
import CreatePipelineDialog from './pipeline/components/CreatePipelineDialog';
// import { useToast } from '@/hooks/useToast';

export function PipelineList({ pipeline }: { pipeline: any[] }) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { handleNavigation } = useNavigation();
  const pipelineSrv = usePipelineManagementService();

  const onRowClickHandler = (row: Row<Pipeline>) => {
    pipelineSrv.selectedPipeline(row.original)
    handleNavigation(ROUTES.DESIGNERS.BUILD_PLAYGROUND(row.original.pipeline_id.toString()))
  }

  useEffect(() => {
    const handleOpenCreate = () => setCreateDialogOpen(true);
    const handleOpenDelete = (event: Event) => {
      const customEvent = event as CustomEvent<Pipeline>;
      pipelineSrv.selectedPipeline(customEvent.detail);
      setDeleteDialogOpen(true);
    };
    window.addEventListener("openCreatePipelineDialog", handleOpenCreate);
    window.addEventListener("openPipelineDeleteDialog", handleOpenDelete);

    return () => {
      window.removeEventListener("openCreatePipelineDialog", handleOpenCreate);
      window.removeEventListener("openPipelineDeleteDialog", handleOpenDelete);
    };
  }, []);

  return (
    <>
      <DataTable<Pipeline>
        columns={columns}
        data={pipeline || []}
        topVariant="simple"
        pagination={true}
        toolbarConfig={getToolbarConfig()}
        onRowClick={onRowClickHandler}
      />
      <CreatePipelineDialog open={createDialogOpen} handleClose={() => setCreateDialogOpen(false)} />
      <DeletePipelineDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} />
    </>);
}
