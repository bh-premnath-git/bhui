import React, { useCallback, useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { RootState } from "@/store/store";
import { FlexibleTable } from "@/components/Tabel";
import Modal from "@/portal/ModalPortal"
import CreateFlowForm from "@/components/CreateFlowForm/CreateFlowForm";
import { useNavigate } from "react-router-dom";
import { listFlows, getFlowProjectList, getEnvironmentList, createFlow, setSelectedFlowFromList } from '@/redux/FlowSlice';
import { Spinner } from "@/components/ui/spinner";
import { ErrorDisplay } from "@/components/ui/error-display";
import { formatedDate } from "@/Utils/dateFormatter";
import { FolderPlus, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";


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
  // Add other fields as needed
}

type ColumnConfig = {
  key: keyof Flow;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  type?: 'text' | 'number' | 'date' | 'badge';
  render?: (value: any) => React.ReactNode;
};

const columns: ColumnConfig[] = [
  {
    key: 'Name',
    header: 'Name',
    sortable: true,
    filterable: true,
    type: 'text',
  },
  {
    key: 'schedule_intervals',
    header: 'Schedule',
    sortable: true,
    filterable: true,
    type: 'text',
    render: (row: any) => row.schedule_type ?? "",
  },
  {
    key: 'Environment',
    header: 'Environment',
    sortable: true,
    filterable: true,
    type: 'number',
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
                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
                
                {/* Icon container with glow effect */}
                <div className="relative inline-flex mb-8">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/0 blur-2xl" />
                    <div className="relative bg-gradient-to-br from-background to-muted p-4 rounded-2xl border border-gradient/10">
                    <Workflow className="w-12 h-12 text-gradient" />
                    </div>
                </div>

                {/* Welcome text */}
                <h2 className="text-3xl font-bold tracking-tight mb-4 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                    Welcome to Your Flow creation!
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
                  Ready to streamline your processes? Kickstart your new flow.
                </p>

                {/* Action button with hover effect */}
                <Button
                    size="lg"
                    onClick={onAddFlow}
                    className="relative group bg-foreground hover:bg-foreground/90 text-background rounded-md px-6 py-3 font-medium"
                >
                    <span className="absolute inset-0 transform transition-transform group-hover:scale-105 bg-gradient-to-r from-primary to-primary/90 rounded-md blur opacity-0 group-hover:opacity-30" />
                    <FolderPlus className="mr-2 h-5 w-5" />
                    <span className="relative">Create New Flow</span>
                </Button>

                {/* Additional guidance */}
                <p className="mt-6 text-sm text-muted-foreground">
                  Click the button above to begin setting up your flow
                </p>
            </div>
        </div>
    </Card>
  );
});

const AllFlows: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreatingFlow, setIsCreatingFlow] = useState(false);
  const [localFlows, setLocalFlows] = useState<Flow[]>([]);
  const { flows, loading, error } = useAppSelector(
    (state: RootState) => state.flowApi
  );

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        dispatch(listFlows()),
        dispatch(getFlowProjectList({})),
        dispatch(getEnvironmentList())
      ]);
    };
    fetchData();
  }, [dispatch]);

  useEffect(() => {
    setLocalFlows(flows);
  }, [flows]);

  const funcCreateFlow = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setIsCreatingFlow(()=>false);
  }, []);

  const handleCreateFlow = useCallback(async (payload: any) => {
    setIsCreatingFlow(()=>true);
    try {
      const result = await dispatch(createFlow(payload));
      if (createFlow.fulfilled.match(result)) {
        // Optimistic update
        dispatch(setSelectedFlowFromList(result.payload));
        setLocalFlows(prevFlows => [...prevFlows, result.payload]);
        closeModal();
        // Navigate after a short delay to allow for the UI update
      } else {
        // Handle error
        console.error("Failed to create flow");
        closeModal();
      }
    } catch (err) {
      console.error("Error creating flow:", err);
      closeModal();
    } finally {
      if (!error) {
      setTimeout(() => {
          navigate('/designers/flow-playground');
        }, 2000);
      }
    }
  }, [dispatch, navigate, closeModal]);

  const playground = useCallback((data: any) => {
    dispatch(setSelectedFlowFromList(data));
    navigate("/designers/flow-playground");
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <ErrorDisplay message={error} />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {localFlows.length === 0 ? (
        <EmptyComponent onAddFlow={funcCreateFlow} />
      ) : (
        <FlexibleTable
          data={localFlows}
          columns={columns}
          itemsPerPageOptions={[5, 10, 20]}
          defaultItemsPerPage={10}
          tableName="Create New Flow"
          createNewFn={funcCreateFlow}
          playRow={true}
          playRowFn={playground}
        />
      )}
      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={closeModal}>
          <CreateFlowForm onClose={closeModal} onCreateFlow={handleCreateFlow} isLoading={isCreatingFlow} />
        </Modal>
      )}
    </div>
  );
};

export default AllFlows;