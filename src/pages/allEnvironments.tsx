import React, { useLayoutEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { RootState } from "@/store/store";
import { FlexibleTable } from "@/components/Tabel";
import { useNavigate } from "react-router-dom";
import { listEnvironments } from '@/redux/EnvironmentSlice';
import { Spinner } from "@/components/ui/spinner";
import { ErrorDisplay } from "@/components/ui/error-display";

// Define the Environment interface based on your data structure
interface Environment {
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
  render?: (value: any) => React.ReactNode;
};

// Define the columns configuration
const columns: ColumnConfig[] = [
  {
    key: 'Environment_Name',
    header: 'Environment Name',
    sortable: true,
    filterable: true,
    type: 'text',
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
    sortable: false,
    filterable: false,
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

const AllEnvironments: React.FC = () => {
  const dispatch = useAppDispatch();
  useLayoutEffect(() => {
    dispatch(listEnvironments());
  }, [dispatch]);
  const { environmentList, loading, error } = useAppSelector(
    (state: RootState) => state.environmentApi
  );
  const navigate = useNavigate();

  if (loading) {
    return <Spinner size="lg" />;

  }

  if (error) {
    return <ErrorDisplay message={error} />;
  }
  ///all-environment/new
  const createNewFn = () => {

    navigate("/all-environment/new");
  };

  return (
    <div className="container mx-auto p-4">
      <FlexibleTable
        data={environmentList}
        columns={columns}
        itemsPerPageOptions={[5, 10, 20]}
        defaultItemsPerPage={10}
        tableName="Environment"
        createNewFn={createNewFn}
      />
    </div>
  );
};

export default AllEnvironments;