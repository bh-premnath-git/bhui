import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { RootState } from "@/store/store";
import { getDataOps } from "@/redux/DataOpsSlice";

// Components
import { FlexibleTable } from "@/components/Tabel";
import { Spinner } from "@/components/ui/spinner";
import { ErrorDisplay } from "@/components/ui/error-display";
import { Input } from "@/components/ui/input";
import DataOpsChartHeader from "@/components/Dataops/DataOpsChartHeader";
import FilterForm from '@/components/Dataops/FilterForm';
import TaskDetails from '@/components/TaskDetails/TaskDetails';

// Material UI imports
import { Stack } from "@mui/material";

// Icons
import { FileQuestion } from 'lucide-react';
import { FaFilter } from "react-icons/fa";

// Constants and Types
import { dataopsColumn } from "@/components/Dataops/DataOpsColumn";

const filterableFields = [
  { key: 'project_name', label: 'Project' },
  { key: 'pipeline_name', label: 'Pipeline' },
  { key: 'zone_name', label: 'Target Zone' },
  { key: 'pipeline_status', label: 'Status' },
];

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-full">
    <FileQuestion size={64} className="text-gray-400 mb-4" />
    <h2 className="text-2xl font-semibold text-gray-700 mb-2">Data Not Available</h2>
  </div>
);

interface DataOpsTableProps {
  dataOpsList: any[];
  loading: boolean;
  error: { message: string } | null;
}

const DataOpsTable: React.FC<DataOpsTableProps> = ({ dataOpsList, loading, error }) => {
  const [selectedRowData, setSelectedRowData] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [activeStatuses, setActiveStatuses] = useState<string[]>([]);

  useEffect(() => {
    if (dataOpsList?.length && !selectedRowData) {
      setSelectedRowData(dataOpsList[0]);
    }
  }, [dataOpsList]);

  const filteredData = useMemo(() => {
    let filtered = dataOpsList.filter((item) =>
      Object.values(item).some((value: any) =>
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    // Filter by active filters
    if (Object.keys(activeFilters).length > 0) {
      filtered = filtered.filter((item) =>
        Object.entries(activeFilters).every(([key, value]) =>
          item[key]?.toString().toLowerCase().includes(value.toLowerCase())
        )
      );
    }

    // Apply status filtering
    if (activeStatuses.length > 0) {
      filtered = filtered.filter((item) =>
        activeStatuses.includes(item.pipeline_status)
      );
    }

    return filtered;
  }, [dataOpsList, searchTerm, activeFilters, activeStatuses]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterSubmit = useCallback((values: Record<string, string>) => {
    const nonEmptyFilters = Object.fromEntries(
      Object.entries(values).filter(([_, value]) => value?.trim() !== '')
    );
    setActiveFilters(nonEmptyFilters);
    setIsFilterOpen(false);
  }, []);

  const handleRowClick = (row: any) => {
    setSelectedJobId(row.job_id);
    setSelectedRowData(row);
  };

  const handleStatusFilterChange = (selectedStatuses: string[]) => {
    setActiveStatuses(selectedStatuses);
  };

  if (loading) return <Spinner size="lg" />;
  if (error) return <ErrorDisplay message={error.message} />;
  if (!dataOpsList?.length) return <EmptyState />;

  return (
    <div className="container mx-auto px-4">
      <Stack direction="row" justifyContent="space-between" alignItems="center" mt={2}>
        <DataOpsChartHeader
          selectedRowData={countPipelineStatuses(dataOpsList)}
          clickstatusType={handleStatusFilterChange}
        />
        <Stack direction="row" spacing={2} alignItems="center" mt={13}>
          <Input
            placeholder="Search Pipeline"
            className="w-44"
            value={searchTerm}
            onChange={handleSearch}
          />
          <FaFilter
            onClick={() => setIsFilterOpen(true)}
            className="border w-9 h-9 p-2 rounded cursor-pointer hover:bg-gray-50"
          />
        </Stack>
      </Stack>

      <FlexibleTable
        data={filteredData}
        columns={dataopsColumn}
        itemsPerPageOptions={[5, 10, 20]}
        defaultItemsPerPage={10}
        isSearch={false}
        playRow={true}
        playRowFn={handleRowClick}
        isAction={false}
      />

      <FilterForm
        open={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onSubmit={handleFilterSubmit}
        items={dataOpsList}
        filterableFields={filterableFields}
      />

      {selectedJobId && (
        <TaskDetails
          jobId={selectedJobId}
          onClose={() => setSelectedJobId(null)}
          selectedRowData={selectedRowData}
        />
      )}
    </div>
  );
};

const AllDataOps: React.FC = () => {
  const { getDataOpsList, loading, error: apiError } = useAppSelector(
    (state: RootState) => state.dataopsApi
  );
  const dispatch = useAppDispatch();

  useEffect(() => {
    const timenow = new Date();
    const thirtyDaysAgo = new Date(timenow);
    thirtyDaysAgo.setDate(timenow.getDate() - 10);

    const thirtyDaysAgoISOString = thirtyDaysAgo.toISOString();
    const params = { job_start_time: thirtyDaysAgoISOString };

    dispatch(getDataOps(params));
  }, [dispatch]);

  const error = apiError ? { message: apiError } : null;

  return (
    <DataOpsTable
      dataOpsList={getDataOpsList}
      loading={loading}
      error={error}
    />
  );
};

export default AllDataOps;

function countPipelineStatuses(dataArray) {
  const statusCounts = {
    Success: 0,
    Failed: 0,
    InProgress: 0,
  };

  dataArray.forEach(item => {
    if (item.pipeline_status === "Success") {
      statusCounts.Success++;
    } else if (item.pipeline_status === "Failed") {
      statusCounts.Failed++;
    } else if (item.pipeline_status === "In Progress") {
      statusCounts.InProgress++;
    }
  });

  return statusCounts;
}

