import React, { useLayoutEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { RootState } from "@/store/store";
import { FlexibleTable } from "@/components/Tabel";
import { useNavigate } from "react-router-dom";
import { listEnvironments, setEditEnvironmentData } from '@/redux/EnvironmentSlice';
import { Spinner } from "@/components/ui/spinner";
import { ErrorDisplay } from "@/components/ui/error-display";
import { FileQuestion } from "lucide-react";

// Define the Environment interface based on your data structure
interface Environment {
  bh_env_id: number;
  Environment_Name: string;
  Cloud_Provider: string;
  Created_On: string;
  bh_env_name: string;
  bh_env_provider_name: string;
  cloud_provider_name: string;
  Environment: string;
  status: string;
  // Add other fields as needed
}

// Define the ColumnConfig type
type ColumnConfig = {
  key: keyof Environment;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  type?: 'text' | 'number' | 'date' | 'badge';
  badgeConfig?: {
    colorMap: Record<string, string>;
  };
  render?: (value: any, rowData: Environment) => React.ReactNode;
};

const AllEnvironments: React.FC = () => {
  const dispatch = useAppDispatch();
  useLayoutEffect(() => {
    dispatch(listEnvironments());
  }, [dispatch]);
  const { environmentList, loading, error } = useAppSelector(
    (state: RootState) => state.environmentApi
  );
  const navigate = useNavigate();

  const handleProjectClick = (env: Environment) => {
    dispatch(setEditEnvironmentData(env));
      navigate("/all-environment/new");
  };

// Define the columns configuration
const columns: ColumnConfig[] = [
  {
    key: 'Environment_Name',
    header: 'Environment Name',
    sortable: true,
    filterable: true,
    type: 'text',
    render: (value: string, rowData: Environment) => (
      <span onClick={() => handleProjectClick(rowData)} className="cursor-pointer">
        {value}
      </span>
    ),
  },
  {
    key: 'Cloud_Provider',
    header: 'Cloud Provider',
    sortable: false,
    filterable: false,
    type: 'text',
  },
  {
    key: 'Created_On',
    header: 'Created On',
    sortable: false,
    type: 'date',
  },
  {
    key: 'bh_env_provider_name',
    header: 'Environment Type',
    sortable: false,
    filterable: false,
    type: 'text',
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    filterable: true,
    type: 'badge',
    badgeConfig: {
      colorMap: {
        active: 'bg-green-500',
        inactive: 'bg-red-500',
        // Add more status colors as needed
      },
    },
  },
  // Add more columns as needed
];
const EmptyComponent: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <FileQuestion size={64} className="text-gray-400 mb-4" />
      <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Environment Available</h2>
      <button
        onClick={() => navigate("/all-environment/new")}
        className="mt-4 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
      >
        Add Environment
      </button>
    </div>
  );
};


  if (loading) {
    return <Spinner size="lg" />;

  }

  if (error) {
    return <ErrorDisplay message={error} />;
  }
  ///all-environment/new
  const createNewFn = () => {
    dispatch(setEditEnvironmentData({}));
    navigate("/all-environment/new");
  };

  //edit action
  const actionFn = (rowData: Environment, action: string) => {
    if (action === 'edit') {
      dispatch(setEditEnvironmentData(rowData));
      navigate("/all-environment/new");
    }
  };

  if (environmentList.length === 0) {
    return <EmptyComponent />;
  }
  return (
    <div className="container mx-auto p-4">
      <FlexibleTable
        data={environmentList}
        columns={columns}
        itemsPerPageOptions={[5, 10, 20]}
        defaultItemsPerPage={10}
        tableName="Create New Environment"
        createNewFn={createNewFn}
        actionFn={actionFn}
      />
    </div>
  );
};

export default AllEnvironments;