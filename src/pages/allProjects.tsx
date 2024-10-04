import React from "react";
import { FlexibleTable } from "@/components/Tabel";
import { useAppSelector } from "@/redux/hooks";
import { RootState } from "@/store/store";
import { useNavigate } from "react-router-dom";

// Define types in a separate file for better organization
interface GitProject {
  projectName: string;
  ytdCost: number;
  currentMonthCost: number;
  totalStorage: number;
  totalDataSources: number;
  status: string;
}

interface GitProjectTableProps {
  gitProjectList: GitProject[];
  loading: boolean;
  error: { message: string } | null;
}

// Define the ColumnConfig type based on what FlexibleTable expects
type ColumnConfig = {
  key: string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  type?: 'text' | 'number' | 'date' | 'badge';
  badgeConfig?: {
    colorMap: Record<string, string>;
  };
  render?: (value: any) => React.ReactNode;
};

// Define column configurations outside the component for better performance
const columns: ColumnConfig[] = [
  {
    key: 'Project_Name',
    header: 'Project Name',
    sortable: true,
    filterable: true,
    type: 'text',
  },
  {
    key: 'YTD_Cost ($)',
    header: 'YTD Cost ($)',
    type: 'number',
    sortable: false,
  },
  {
    key: 'Current_Month_Cost ($)',
    header: 'Current Month Cost ($)',
    type: 'number',
    sortable: false,
  },
  {
    key: 'Total Storage (GB)',
    header: 'Total Storage (GB)',
    type: 'number',
    sortable: true,
  },
  {
    key: 'total_data_sources',
    header: 'Total Data Sources',
    type: 'number',
    sortable: true,
  },
  {
    key: 'status',
    header: 'Status',
    type: 'badge',
    sortable: false,
    filterable: false,
    badgeConfig: {
      colorMap: {
        active: 'bg-green-500',
        inactive: 'bg-red-500',
        // Add more status colors as needed
      },
    },
  },
  
];

function GitProjectTable({
  gitProjectList,
  loading,
  error,
}: GitProjectTableProps) {
  const navigate = useNavigate();
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }
  const createNewFn = () => {
    navigate("/all-projects/new");
  };
  return (
    <div className="container mx-auto p-4">
      <FlexibleTable
        data={gitProjectList}
        columns={columns}
        itemsPerPageOptions={[5, 10, 20]}
        defaultItemsPerPage={10}
        tableName="Project"
        createNewFn={createNewFn}
      />
    </div>
  );
}

const AllProjects: React.FC = () => {
  const { gitProjectList, loading, error: apiError } = useAppSelector(
    (state: RootState) => state.projectApi
  );
  
  const error = apiError ? { message: apiError } : null;
  
  return (
    <GitProjectTable
      gitProjectList={gitProjectList}
      loading={loading}
      error={error}
    />
  );
};

export default AllProjects;