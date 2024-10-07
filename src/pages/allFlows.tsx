import React, { useLayoutEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { RootState } from "@/store/store";
import { FlexibleTable } from "@/components/Tabel";
import Modal from "@/portal/ModalPortal"
import CreateFlowForm from "@/components/CreateFlowForm/CreateFlowForm";
import { useNavigate } from "react-router-dom";
import { listFlows, getFlowProjectList } from '@/redux/FlowSlice';
import { Spinner } from "@/components/ui/spinner";
import { ErrorDisplay } from "@/components/ui/error-display";
import { FileQuestion } from "lucide-react";

interface Flow {
  id: number;
  Name: string;
  Environment: number;
  Project: number;
  LastExecutedOn: string | null;
  git_branch: string;
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
    header: 'Flow Name',
    sortable: true,
    filterable: true,
    type: 'text',
  },
  {
    key: 'Environment',
    header: 'Environment ID',
    sortable: false,
    type: 'number',
  },
  {
    key: 'Project',
    header: 'Project ID',
    sortable: false,
    type: 'number',
  },
  {
    key: 'LastExecutedOn',
    header: 'Last Executed',
    sortable: false,
    type: 'date',
    render: (value: string | null) => value || 'Never',
  },
  {
    key: 'git_branch',
    header: 'Git Branch',
    sortable: false,
    filterable: false,
    type: 'text',
  },
];
const EmptyComponent: React.FC<{ onAddFlow: () => void }> = ({ onAddFlow }) => {
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
};
const AllFlows: React.FC = () => {
  const dispatch = useAppDispatch();
  useLayoutEffect(() => {
    dispatch(listFlows());
    dispatch(getFlowProjectList({}));
  }, [dispatch]);
  const { flows, loading, error } = useAppSelector(
    (state: RootState) => state.flowApi
  );
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);


  if (loading) {
    return <Spinner size="lg" />;
  }

  if (error) {
    return <ErrorDisplay message={error} />;
  }
  const funcCreateFlow = () => {
    setIsModalOpen(()=>(true));
  }
  const closeModal = () => {
    setIsModalOpen(false);
  };
  const playground = (data: any) => {
    navigate("/designer/flow-playground")

  }

  if (flows.length === 0) {
    return <><EmptyComponent onAddFlow={funcCreateFlow} />
    <Modal isOpen={isModalOpen} onClose={closeModal}>
        <CreateFlowForm onClose={closeModal} />
      </Modal>
    </>;
  }
  return (
    <div className="container mx-auto p-4">
      <FlexibleTable
        data={flows}
        columns={columns}
        itemsPerPageOptions={[5, 10, 20]}
        defaultItemsPerPage={10}
        tableName="Flow"
        createNewFn={funcCreateFlow}
        playRow={true}
        playRowFn={playground}
      />
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <CreateFlowForm onClose={closeModal} />
      </Modal>
    </div>
  );
};

export default AllFlows;