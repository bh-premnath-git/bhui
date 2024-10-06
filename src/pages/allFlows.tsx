import React, { useLayoutEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { RootState } from "@/store/store";
import { FlexibleTable } from "@/components/Tabel";
import Modal  from "@/portal/ModalPortal"
import CreateFlowForm from "@/components/CreateFlowForm/CreateFlowForm";
import { useNavigate } from "react-router-dom";
import { listFlows, getFlowProjectList } from '@/redux/FlowSlice';
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
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }
  const funcCreateFlow = () => {
    setIsModalOpen(true);
  }
  const closeModal = () => {
    setIsModalOpen(false);
};
const playground = (data: any) => {
  navigate("/designer/flow-playground")
  
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