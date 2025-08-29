import { useEffect, useState, useCallback } from 'react';
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
import { getAllPipeline, setBuildPipeLineDtl, setSelectedEngineType } from '@/store/slices/designer/buildPipeLine/BuildPipeLineSlice';
import { useAppDispatch } from '@/hooks/useRedux';
import { usePipeline } from './pipeline/hooks/usePipeline';
import { useQueryClient } from '@tanstack/react-query';
// import { useToast } from '@/hooks/useToast';

export function PipelineList({ pipeline }: { pipeline: any[] }) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  
  const {setPipeline_id,setDebuggedNodesList,setDebuggedNodes} = usePipelineContext()
  const { handleNavigation } = useNavigation();
  const pipelineSrv = usePipelineManagementService();

  const paginatedData = pipeline?.slice(
    pageIndex * pageSize,
    (pageIndex + 1) * pageSize
  );

  const onRowClickHandler = (row: Row<Pipeline>) => {
    pipelineSrv.selectedPipeline(row.original)
    setDebuggedNodesList([])
    setDebuggedNodes([])
    setPipeline_id(row.original.pipeline_id)
    dispatch(setBuildPipeLineDtl(row.original))
    
    // Update engine type if pipeline has engine_type
    if (row.original.engine_type) {
      dispatch(setSelectedEngineType(row.original.engine_type));
    }
    
    localStorage.setItem("pipeline_id",row.original.pipeline_id.toString())
    handleNavigation(ROUTES.DESIGNERS.BUILD_PLAYGROUND(row.original.pipeline_id.toString()))
  }

  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const { fetchPipelineList } = usePipeline({ shouldFetch: false });
  
  // Function to completely refresh pipeline data
  const refreshPipelineData = useCallback(async () => {
    try {
      // Invalidate React Query cache
      queryClient.invalidateQueries({ queryKey: ['pipelines'] });
      queryClient.invalidateQueries({ queryKey: ['pipelines', 'list'] });

      // Fetch fresh data through Redux
      await dispatch(getAllPipeline());
      
      // Also trigger React Query refetch
      await fetchPipelineList(true);
      
      // Force parent component to refresh its view of the pipelines
      window.dispatchEvent(new Event('pipelineListUpdated'));
    } catch (error) {
      console.error('Failed to refresh pipeline data:', error);
    }
  }, [dispatch, queryClient, fetchPipelineList]);

  useEffect(() => {
    setDebuggedNodesList([])
    setDebuggedNodes([])

    const handleOpenCreate = () => setCreateDialogOpen(true);
    const handleOpenDelete = (event: Event) => {
      const customEvent = event as CustomEvent<Pipeline>;
      pipelineSrv.selectedPipeline(customEvent.detail);
      setDeleteDialogOpen(true);
    };
    
    // Handle pipeline deletion event
    const handlePipelineDeleted = async (event: Event) => {
      const customEvent = event as CustomEvent<{pipelineId: number}>;
      console.log('Pipeline deleted event received:', customEvent.detail);
      
      // Use our comprehensive refresh function
      await refreshPipelineData();
      
      // Ensure the item is removed from the current view
      if (customEvent.detail?.pipelineId) {
        // Create a filtered version of the current pipeline list
        const filteredPipelines = pipeline.filter(p => p.pipeline_id !== customEvent.detail.pipelineId);
        
        // Update the pipeline service with the filtered list
        if (filteredPipelines.length !== pipeline.length) {
          pipelineSrv.setPipelines(filteredPipelines);
        }
      }
    };
    
    window.addEventListener("openCreatePipelineDialog", handleOpenCreate);
    window.addEventListener("openPipelineDeleteDialog", handleOpenDelete);
    window.addEventListener("pipelineDeleted", handlePipelineDeleted);

    return () => {
      window.removeEventListener("openCreatePipelineDialog", handleOpenCreate);
      window.removeEventListener("openPipelineDeleteDialog", handleOpenDelete);
      window.removeEventListener("pipelineDeleted", handlePipelineDeleted);
    };
  }, [dispatch, pipelineSrv, setDebuggedNodesList, setDebuggedNodes, refreshPipelineData, pipeline]);


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
