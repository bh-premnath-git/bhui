import React, { useLayoutEffect } from "react";
import { FlexibleTable } from "@/components/Tabel";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { RootState } from "@/store/store";
import { useNavigate } from "react-router-dom";
import { getGitProject } from '@/redux/ProjectSlice';
import { Spinner } from "@/components/ui/spinner";
import { ErrorDisplay } from "@/components/ui/error-display";
import { FileQuestion } from "lucide-react";
import { getdataSourceList } from "@/redux/CatalogSlice";

// Define types in a separate file for better organization
interface CatalogInter {
  data_src_name: string;
  data_src_desc: string;
  data_src_quality: number;
  data_src_id: number;
  bh_project_id: number;
  data_src_tags: object;
  data_source_metadata: Array<object>[];
  data_src_last_updated: string;
}
interface projectInter {
  bh_project_id: number,
  bh_project_name: string
}
interface DataCatalogTableProps {
  projectList: projectInter[]
  catalogList: CatalogInter[];
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
  render?: (value: any, rowData: CatalogInter) => React.ReactNode;
};

// Define column configurations outside the component for better performance
const columns: ColumnConfig[] = [
  {
    key: 'data_src_name',
    header: 'Data Source',
    sortable: true,
    filterable: true,
    type: 'text',
    render: (value: string, rowData: CatalogInter) => (
      <div>
        <div>{value || 'Never'}</div>
        {/* {rowData.toString()} */}
        <div className="text-sm text-gray-500">{rowData.data_src_desc || 'No description available'}</div>
      </div>
    ),
  },
  {
    key: 'bh_project_id',
    header: 'Project',
    sortable: true,
    filterable: true,
    type: 'text',
  },
  {
    key: 'bh_owner',
    header: 'Owner',
    sortable: true,
    filterable: true,
    type: 'text',
    render: (value: string | null) => value || 'Jhon',

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

function DataCatalogTable({
  projectList,
  catalogList,
  loading,
  error,
}: DataCatalogTableProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  useLayoutEffect(() => {
    dispatch(getGitProject());
    dispatch(getdataSourceList());
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

  if (catalogList.length === 0) {
    return <EmptyComponent />;
  }

  return (
    <div className="container mx-auto p-4">
      <FlexibleTable
        data={catalogList}
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

const DataCatalog: React.FC = () => {

  const { dataSourceList, loading, error: apiError } = useAppSelector(
    (state: RootState) => state.catalogApi
  );
  const { gitProjectList } = useAppSelector(
    (state: RootState) => state.projectApi
  );

  const error = apiError ? { message: apiError } : null;

  return (
    <DataCatalogTable
      catalogList={dataSourceList}
      projectList={gitProjectList}
      loading={loading}
      error={error}
    />
  );
};

export default DataCatalog;