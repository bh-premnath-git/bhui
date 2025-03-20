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
import { usePipelineContext } from '@/context/designers/DataPipelineContext';
// import { useToast } from '@/hooks/useToast';

export function PipelineList({ pipeline }: { pipeline: any[] }) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  
  const {setPipeline_id} = usePipelineContext()
  const { handleNavigation } = useNavigation();
  const pipelineSrv = usePipelineManagementService();

  const paginatedData = pipeline?.slice(
    pageIndex * pageSize,
    (pageIndex + 1) * pageSize
  );

  const onRowClickHandler = (row: Row<Pipeline>) => {
    pipelineSrv.selectedPipeline(row.original)
    setPipeline_id(row.original.pipeline_id)
    localStorage.setItem("pipeline_id",row.original.pipeline_id.toString())
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
        data={paginatedData || []}
        topVariant="simple"
        pagination={true}
        toolbarConfig={getToolbarConfig()}
        onRowClick={onRowClickHandler}
        pageIndex={pageIndex}
        pageSize={pageSize}
        pageCount={Math.ceil((pipeline?.length || 0) / pageSize)}
        onPageChange={(page) => setPageIndex(page - 1)}
        onPageSizeChange={setPageSize}
      />
      <CreatePipelineDialog open={createDialogOpen} handleClose={() => setCreateDialogOpen(false)} />
      <DeletePipelineDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} />
    </>
  );
}
