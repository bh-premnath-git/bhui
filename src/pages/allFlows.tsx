import React, { useCallback, useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { RootState } from "@/store/store";
import { FlexibleTable } from "@/components/Tabel";
import Modal from "@/portal/ModalPortal"
import CreateFlowForm from "@/components/CreateFlowForm/CreateFlowForm";
import { useNavigate } from "react-router-dom";
import {
  listFlows,
  getFlowProjectList,
  getEnvironmentList,
  createFlow,
  setSelectedFlowFromList,
  deleteFlowbyId,
  setDagRunId,
} from '@/redux/FlowSlice';
import { Spinner } from "@/components/ui/spinner";
import { ErrorDisplay } from "@/components/ui/error-display";
import { formatedDate } from "@/Utils/dateFormatter";
import { FolderPlus, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useFlow } from "@/contexts/FlowContext";
import { DeleteDialog } from "@/components/DeleteDialog";
import { LocalStorageService } from "@/services/localStorageServices";

interface Flow {
  id: number;
  schedule_intervals: {
    schedule_type: string;
  };
  Name: string;
  Environment: string;
  bh_project_name: string;
  CreatedBy: string;
  LastUpdatedOn: string | null;
  LastExecutedOn: string | null;
}

type ColumnConfig = {
  key: keyof Flow;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  type?: 'text' | 'number' | 'date' | 'badge';
  render?: (value: any, rowData: Flow) => React.ReactNode;
};

const columns: ColumnConfig[] = [
  {
    key: 'Name',
    header: 'Name',
    sortable: true,
    filterable: true,
    type: 'text',
    render: (value: string, rowData: Flow) => (
      <div className="flex items-center gap-3">
        <span>
          {value}
        </span>
      </div>
    ),
  },
  {
    key: 'bh_project_name',
    header: 'Project',
    sortable: true,
    filterable: true,
    type: 'text',
  },
  {
    key: 'CreatedBy',
    header: 'Created By',
    sortable: false,
    type: 'text',
  },
  {
    key: 'LastUpdatedOn',
    header: 'Last Updated',
    sortable: true,
    filterable: true,
    type: 'date',
    render: (value: string | null) => formatedDate(value) || 'Never',
  },
  {
    key: 'LastExecutedOn',
    header: 'Last Executed',
    sortable: true,
    filterable: true,
    type: 'date',
    render: (value: string | null) => formatedDate(value) || 'Never',
  },
];

const EmptyComponent: React.FC<{ onAddFlow: () => void }> = React.memo(({ onAddFlow }) => {
  return (
    <Card className="relative overflow-hidden w-full max-w-2xl mx-auto mt-20">
      <div className="absolute inset-0 bg-gradient-to-br from-gradient/5 via-primary/2 to-background" />
      <div className="relative p-8 sm:p-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="absolute top-0 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

          <div className="relative inline-flex mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/0 blur-2xl" />
            <div className="relative bg-gradient-to-br from-background to-muted p-4 rounded-2xl border border-gradient/10">
              <Workflow className="w-12 h-12 text-gradient" />
            </div>
          </div>

          <h2 className="text-3xl font-bold tracking-tight mb-4 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            Welcome to Your Flow Creation!
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
            Ready to streamline your processes? Kickstart your new flow.
          </p>

          <Button
            size="lg"
            onClick={onAddFlow}
            className="relative group bg-foreground hover:bg-foreground/90 text-background rounded-md px-6 py-3 font-medium"
          >
            <span className="absolute inset-0 transform transition-transform group-hover:scale-105 bg-gradient-to-r from-primary to-primary/90 rounded-md blur opacity-0 group-hover:opacity-30" />
            <FolderPlus className="mr-2 h-5 w-5" />
            <span className="relative">Create New Flow</span>
          </Button>
        </div>
      </div>
    </Card>
  );
});

const AllFlows: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { setSelectedFlowId, setNodes, setEdges } = useFlow();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreatingFlow, setIsCreatingFlow] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteFlowName, setDeleteFlowName] = useState<string>("");
  const [deleteFlowId, setDeleteFlowId] = useState<number | null>(null);

  const { flows, loading, error } = useAppSelector(
    (state: RootState) => state.flowApi
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          dispatch(listFlows({ offset: 0, limit: 1000 })),
          dispatch(getFlowProjectList({})),
          dispatch(getEnvironmentList())
        ]);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setInitialLoadComplete(true);
      }
    };
    fetchData();
  }, [dispatch]);

  const funcCreateFlow = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setIsCreatingFlow(false);
  }, []);

  const handleCreateFlow = useCallback(async (payload: any) => {
    setIsCreatingFlow(true);
    try {
      const result = await dispatch(createFlow(payload));
      await dispatch(listFlows({ offset: 0, limit: 1000 }));
      setNodes([])
      setEdges([])
      if (createFlow.fulfilled.match(result)) {
        dispatch(setSelectedFlowFromList(null));
        dispatch(setSelectedFlowFromList(result.payload));
        dispatch(setDagRunId(null));
        setSelectedFlowId(result.payload.flow_id);
        closeModal();
        // Only navigate if flow_id exists
        if (result.payload.flow_id) {
          navigate('/designers/manage-flow/' + result.payload.flow_id);
        }
        return result.payload;
      } else {
        return result.payload ?? new Error('Flow creation failed');
      }
    } catch (err) {
      console.error("Error creating flow:", err);
      return new Error('Flow creation failed');
      // You might want to show an error notification here
    } finally {
      setIsCreatingFlow(false);
    }
  }, [dispatch, navigate, closeModal]);

  const playground = useCallback((data: any) => {
    LocalStorageService.getItem(`flow-${data.flow_id}`)
    setSelectedFlowId(data.flow_id);
    dispatch(setSelectedFlowFromList(null));
    dispatch(setSelectedFlowFromList(data));
    dispatch(setDagRunId(null));
    navigate("/designers/manage-flow/" + data.flow_id);
  }, [navigate, setSelectedFlowId, dispatch]);


  const actionFn = (rowData: any, action: string) => {
    console.log(rowData, action);
    if (action === "delete") {
      setDeleteFlowName(rowData.flow_name);
      setDeleteFlowId(rowData.flow_id);
      setDeleteDialogOpen(true);
    }
  }

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDeleteFlowName("");
    setDeleteFlowId(null);
  };

  const handleDeleteFlow = async () => {
    if (!deleteFlowId) return;
    try {
      await dispatch(deleteFlowbyId({ flow_id: deleteFlowId }));
      closeDeleteDialog();
    } catch (error) {
      console.error("Error deleting flow:", error);
    }
  }

  if (!initialLoadComplete || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container p-0">
        <ErrorDisplay message={error} />
      </div>
    );
  }

  return (
    <div className="container p-0">
      {(!flows || flows.length === 0) ? (
        <EmptyComponent onAddFlow={funcCreateFlow} />
      ) : (
        <FlexibleTable
          data={flows}
          columns={columns}
          itemsPerPageOptions={[5, 10, 20]}
          defaultItemsPerPage={10}
          tableName="Create New Flow"
          createNewFn={funcCreateFlow}
          playRow={true}
          playRowFn={playground}
          actionFn={actionFn}
        />
      )}
      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={closeModal}>
          <CreateFlowForm
            onClose={closeModal}
            onCreateFlow={handleCreateFlow}
            isLoading={isCreatingFlow}
          />
        </Modal>
      )}
      <DeleteDialog
        title="Delete Flow"
        placeholder="Enter flow name"
        isOpen={deleteDialogOpen}
        onClose={closeDeleteDialog}
        pipelineName={deleteFlowName}
        onDelete={handleDeleteFlow}
      />
    </div>
  );
};

export default AllFlows;