import React, { useLayoutEffect } from "react";
import { FlexibleTable } from "@/components/Tabel";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { RootState } from "@/store/store";
import { useNavigate } from "react-router-dom";
import { getGitProject } from '@/redux/ProjectSlice';
import { Spinner } from "@/components/ui/spinner";
import { ErrorDisplay } from "@/components/ui/error-display";
import { FileQuestion } from "lucide-react";

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
    sortable: false,
  },
  {
    key: 'total_data_sources',
    header: 'Total Data Sources',
    type: 'number',
    sortable: false,
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

const EmptyComponent: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <FileQuestion size={64} className="text-gray-400 mb-4" />
      <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Project Available</h2>
      <button
        onClick={() => navigate("/all-projects/new")}
        className="mt-4 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
      >
        Add Project
      </button>
    </div>
  );
};

function GitProjectTable({
  gitProjectList,
  loading,
  error,
}: GitProjectTableProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  useLayoutEffect(() => {
    dispatch(getGitProject());
  }, [dispatch]);

  if (loading) {
    return <Spinner size="lg" />;
  }

  if (error) {
    return <ErrorDisplay message={error.message} />;
  }

  const createNewFn = () => {
    navigate("/all-projects/new");
  };
  const actionFn = (rowData: any, action: string) => {
    // console.log("Action:", action, "Row Data:", rowData);    
  }

  if (gitProjectList.length === 0) {
    return <EmptyComponent />;
  }
  
  return (
    <div className="container mx-auto p-4">
      <FlexibleTable
        data={gitProjectList}
        columns={columns}
        itemsPerPageOptions={[5, 10, 20]}
        defaultItemsPerPage={10}
        tableName="Project"
        createNewFn={createNewFn}
        actionFn={actionFn}
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