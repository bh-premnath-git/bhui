import React, { useLayoutEffect } from "react";
import { FlexibleTable } from "@/components/Table";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { RootState } from "@/store/store";
import { useNavigate } from "react-router-dom";
import { getGitProject, setEditProjectData } from '@/redux/ProjectSlice';
import { Spinner } from "@/components/ui/spinner";
import { ErrorDisplay } from "@/components/ui/error-display";
import { FolderGit2, FolderPlus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// Define types in a separate file for better organization
interface GitProject {
  bh_project_id: number;
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
  render?: (value: any, rowData: GitProject) => React.ReactNode;
};

function GitProjectTable({
  gitProjectList,
  loading,
  error,
}: GitProjectTableProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  useLayoutEffect(() => {
    dispatch(getGitProject({ offset: 0, limit: 1000 }));
  }, [dispatch]);

  const handleProjectClick = (project: GitProject) => {
    dispatch(setEditProjectData(project));
    navigate(`/admin-console/projects/${project.bh_project_id}`);
  };


  // Define column configurations outside the component for better performance
  const columns: ColumnConfig[] = [
    {
      key: 'Project_Name',
      header: 'Project Name',
      sortable: true,
      filterable: true,
      type: 'text',
      render: (value: string, rowData: GitProject) => (
        <div className="flex items-center gap-3">
          <span onClick={() => handleProjectClick(rowData)} className="cursor-pointer">
            {value}
          </span>
        </div>
      ),
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
      sortable: true,
      filterable: true,
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
                <FolderGit2 className="w-12 h-12 text-gradient" />
              </div>
            </div>

            {/* Welcome text */}
            <h2 className="text-3xl font-bold tracking-tight mb-4 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
              Welcome to Your Project
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
              Start your journey by creating your first project. Transform your ideas into reality.
            </p>

            {/* Action button with hover effect */}
            <Button
              size="lg"
              onClick={() => navigate("/admin-console/projects/new")}
              className="relative group bg-foreground hover:bg-foreground/90 text-background rounded-md px-6 py-3 font-medium"
            >
              <span className="absolute inset-0 transform transition-transform group-hover:scale-105 bg-gradient-to-r from-primary to-primary/90 rounded-md blur opacity-0 group-hover:opacity-30" />
              <FolderPlus className="mr-2 h-5 w-5" />
              <span className="relative">Create Project</span>
            </Button>

            {/* Additional guidance */}
            <p className="mt-6 text-sm text-muted-foreground">
              Click the button above to begin your project
            </p>
          </div>
        </div>
      </Card>
    );
  };



  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return <ErrorDisplay message={error.message} />;
  }

  const createNewFn = () => {
    dispatch(setEditProjectData({}));
    navigate("/admin-console/projects/new");
  };

  //edit project
  const actionFn = (rowData: GitProject, action: string) => {
    if (action === 'edit') {
      dispatch(setEditProjectData(rowData));
      navigate(`/admin-console/projects/${rowData.bh_project_id}`);
    }
  };

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
        tableName="Create Project"
        createNewFn={createNewFn}
        actionFn={actionFn}
        background="bg-black"
        rowColorFn={(row, index) => (index % 2 === 0 ? "bg-white" : "bg-gray-100")}
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