import { useEffect, useState, useMemo } from 'react';
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
import { setCurrentFlow, setSelectedFlow } from '@/store/slices/designer/flowSlice';
import { useDispatch } from 'react-redux';

const isValidFlowId = (flowId: number | string | null | undefined): boolean => {
  if (typeof flowId === 'number') {
    return flowId > 0;
  }
  if (typeof flowId === 'string') {
    const numId = parseInt(flowId, 10);
    return !isNaN(numId) && numId > 0;
  }
  return false;
};

export function FlowList({ flows, onFlowsRefresh }: { flows: Flow[], onFlowsRefresh?: () => void }) {
  const { setSelectedFlowId } = useFlowCtx();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const { handleNavigation } = useNavigation();
  const flowSrv = useFlowManagementService();
  const { fetchFlowsList } = useFlow();
  
  // Keep this active so we can refetch after deleting a flow
  const { refetch: refetchFlows } = fetchFlowsList(1, 1000, true);
  const dispatch = useDispatch();
  // When flows array changes, update total count for pagination
  useEffect(() => {
    if (flows && flows.length > 0) {
      setTotalCount(flows.length);
    }
  }, [flows]);
  
  // Calculate paginated data based on page and pageSize
  const paginatedData = useMemo(() => {
    if (!flows || flows.length === 0) return [];
    
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    
    return flows.slice(start, end);
  }, [flows, page, pageSize]);

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / pageSize);

  const onRowClickHandler = (row: Row<Flow>) => {
    const flow = row.original;
    
    // Validate flow ID before proceeding
    if (!isValidFlowId(flow.flow_id)) {
      console.error('ManageFlow: Cannot navigate to flow with invalid ID', { flowId: flow.flow_id });
      return;
    }

    flowSrv.selectedFlow(flow);
    console.log(row);
    dispatch(setCurrentFlow(flow));

    const flowIdStr = flow.flow_id.toString();
    setSelectedFlowId(flowIdStr);
    handleNavigation(ROUTES.DESIGNERS.Data_FLOW_PLAYGROUND(flowIdStr));
  }
  
  // Handle page change
  const handlePageChange = (newPage: number) => {
    // newPage is already converted from 0-based to 1-based in DataTable.tsx
    setPage(newPage);
  };
  
  // Handle page size change
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // Reset to first page when changing page size
  };
  
  // Handle flow deletion success
  const handleDeleteSuccess = () => {
    // First call refetchFlows to update our internal state
    refetchFlows().then(() => {
      // Then trigger parent component refresh if provided
      if (onFlowsRefresh) {
        onFlowsRefresh();
      }
      
      // If we're on a page that no longer exists after deletion, go back to last page
      if (page > 1 && paginatedData.length === 0) {
        const newLastPage = Math.max(1, Math.ceil((totalCount - 1) / pageSize));
        setPage(newLastPage);
      }
    });
  };

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
        key={`flow-list-${page}-${pageSize}`} // Force re-render when pagination changes
        columns={columns}
        data={paginatedData}
        topVariant="simple"
        pagination={true}
        pageCount={totalPages}
        pageIndex={page - 1} // Convert 1-based page to 0-based pageIndex
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        toolbarConfig={getToolbarConfig()}
        onRowClick={onRowClickHandler}
      />
      <CreateFlowDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
      <DeleteFlowDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onSuccess={handleDeleteSuccess}
      />
    </>);
}