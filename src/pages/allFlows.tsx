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
import { FileQuestion } from "lucide-react";
import { formatedDate } from "@/Utils/dateFormatter";
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
    <div className="flex flex-col items-center justify-center h-full">
      <FileQuestion size={64} className="text-gray-400 mb-4" />
      <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Flow Available</h2>
      <button
        onClick={onAddFlow}
        className="mt-4 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
      >
        Add Flow
      </button>
    </div>
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
          navigate('/designer/flow-playground');
        }, 2000);
      }
    }
  }, [dispatch, navigate, closeModal]);

  const playground = useCallback((data: any) => {
    dispatch(setSelectedFlowFromList(data));
    navigate("/designer/flow-playground");
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