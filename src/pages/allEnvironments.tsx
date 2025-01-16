import React, { useLayoutEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { RootState } from "@/store/store";
import { FlexibleTable } from "@/components/Table";
import { useNavigate } from "react-router-dom";
import { listEnvironments, setEditEnvironmentData } from '@/redux/EnvironmentSlice';
import { Spinner } from "@/components/ui/spinner";
import { ErrorDisplay } from "@/components/ui/error-display"
import { FolderPlus, Settings2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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
  render?: (value: any, row: any) => React.ReactNode;

};

const AllEnvironments: React.FC = () => {
  const dispatch = useAppDispatch();
  useLayoutEffect(() => {
    dispatch(listEnvironments({ offset: 0, limit: 1000 }));
  }, [dispatch]);
  const { environmentList, loading, error } = useAppSelector(
    (state: RootState) => state.environmentApi
  );
  const navigate = useNavigate();

  const handleEnvClick = (env: Environment) => {
    dispatch(setEditEnvironmentData(env));
    navigate(`/admin-console/environment/${env.bh_env_id}`);
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
        <div className="flex items-center gap-3">
          <span onClick={() => handleEnvClick(rowData)} className="cursor-pointer">
            {value}
          </span>
        </div>
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
      <Card className="relative overflow-hidden w-full max-w-2xl mx-auto mt-20">
        <div className="absolute inset-0 bg-gradient-to-br from-gradient/5 via-primary/2 to-background" />
        <div className="relative p-8 sm:p-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="absolute top-0 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

            <div className="relative inline-flex mb-8">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/0 blur-2xl" />
              <div className="relative bg-gradient-to-br from-background to-muted p-4 rounded-2xl border border-gradient/10">
                <Settings2 className="w-12 h-12 text-gradient" />
              </div>
            </div>

            <h2 className="text-3xl font-bold tracking-tight mb-4 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
              Welcome to Your Environment
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
              Start your journey by creating your first Environment. Transform your ideas into reality.
            </p>

            <Button
              size="lg"
              onClick={() => navigate("/admin-console/environment/new")}
              className="relative group bg-foreground hover:bg-foreground/90 text-background rounded-md px-6 py-3 font-medium"
            >
              <span className="absolute inset-0 transform transition-transform group-hover:scale-105 bg-gradient-to-r from-primary to-primary/90 rounded-md blur opacity-0 group-hover:opacity-30" />
              <FolderPlus className="mr-2 h-5 w-5" />
              <span className="relative">Create Environment</span>
            </Button>

            <p className="mt-6 text-sm text-muted-foreground">
              Click the button above to begin your Environment
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
    return <ErrorDisplay message={error} />;
  }
  ///admin-console/environment/new
  const createNewFn = () => {
    dispatch(setEditEnvironmentData({}));
    navigate("/admin-console/environment/new");
  };

  //edit action
  const actionFn = (rowData: Environment, action: string) => {
    if (action === 'edit') {
      dispatch(setEditEnvironmentData(rowData));
      navigate(`/admin-console/environment/${rowData.bh_env_id}`);
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
        tableName="Create Environment"
        createNewFn={createNewFn}
        actionFn={actionFn}
        background="bg-black"
        rowColorFn={(row, index) => (index % 2 === 0 ? "bg-white" : "bg-gray-100")}
      />
    </div>
  );
};

export default AllEnvironments;