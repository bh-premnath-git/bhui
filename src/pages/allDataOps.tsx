import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { RootState } from "@/store/store";
import { getDataOps } from "@/redux/DataOpsSlice";
import { FlexibleTable } from "@/components/Tabel";
import { Spinner } from "@/components/ui/spinner";
import { ErrorDisplay } from "@/components/ui/error-display";
import { Input } from "@/components/ui/input";
import DataOpsChartHeader from "@/components/Dataops/DataOpsChartHeader";
import FilterForm from '@/components/Dataops/FilterForm';
import TaskDetails from '@/components/TaskDetails/TaskDetails';
import { Stack } from "@mui/material";
import { FileQuestion } from 'lucide-react';
import { FaFilter } from "react-icons/fa";
import { dataopsColumn } from "@/components/Dataops/DataOpsColumn";

interface DataOpItem {
  job_id: string;
  project_name: string;
  pipeline_name: string;
  zone_name: string;
  pipeline_status: string;
  [key: string]: any;
}

interface DataOpsTableProps {
  dataOpsList: DataOpItem[];
  loading: boolean;
  error: { message: string } | null;
}

interface PipelineStatusCounts {
  Success: number;
  Failed: number;
  InProgress: number;
}

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

const countPipelineStatuses = (dataArray: DataOpItem[]): PipelineStatusCounts => {
  try {
    const statusCounts = {
      Success: 0,
      Failed: 0,
      InProgress: 0,
    };

    if (!Array.isArray(dataArray)) {
      console.error('Invalid data array provided to countPipelineStatuses');
      return statusCounts;
    }

    dataArray.forEach(item => {
      if (!item || typeof item.pipeline_status !== 'string') {
        return;
      }

      const status = item.pipeline_status.trim();
      if (status === "Success") {
        statusCounts.Success++;
      } else if (status === "Failed") {
        statusCounts.Failed++;
      } else if (status === "In Progress") {
        statusCounts.InProgress++;
      }
    });

    return statusCounts;
  } catch (error) {
    console.error('Error in countPipelineStatuses:', error);
    return { Success: 0, Failed: 0, InProgress: 0 };
  }
};

const DataOpsTable: React.FC<DataOpsTableProps> = ({ dataOpsList, loading, error }) => {
  const [selectedRowData, setSelectedRowData] = useState<DataOpItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [activeStatuses, setActiveStatuses] = useState<string[]>([]);

  useEffect(() => {
    if (Array.isArray(dataOpsList) && dataOpsList.length > 0 && !selectedRowData) {
      setSelectedRowData(dataOpsList[0]);
    }
  }, [dataOpsList, selectedRowData]);

  const filteredData = useMemo(() => {
    try {
      if (!Array.isArray(dataOpsList)) {
        console.error('dataOpsList is not an array');
        return [];
      }

      let filtered = dataOpsList.filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );

      if (Object.keys(activeFilters).length > 0) {
        filtered = filtered.filter((item) =>
          Object.entries(activeFilters).every(([key, value]) =>
            String(item[key]).toLowerCase().includes(value.toLowerCase())
          )
        );
      }

      if (activeStatuses.length > 0) {
        filtered = filtered.filter((item) =>
          activeStatuses.includes(item.pipeline_status)
        );
      }

      return filtered;
    } catch (error) {
      console.error('Error in filteredData:', error);
      return [];
    }
  }, [dataOpsList, searchTerm, activeFilters, activeStatuses]);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value || '');
  }, []);

  const handleFilterSubmit = useCallback((values: Record<string, string>) => {
    try {
      const nonEmptyFilters = Object.fromEntries(
        Object.entries(values).filter(([_, value]) => value?.trim() !== '')
      );
      setActiveFilters(nonEmptyFilters);
      setIsFilterOpen(false);
    } catch (error) {
      console.error('Error in handleFilterSubmit:', error);
      setActiveFilters({});
      setIsFilterOpen(false);
    }
  }, []);

  const handleRowClick = useCallback((row: DataOpItem) => {
    if (row && row.job_id) {
      setSelectedJobId(row.job_id);
      setSelectedRowData(row);
    }
  }, []);

  const handleStatusFilterChange = useCallback((selectedStatuses: string[]) => {
    try {
      setActiveStatuses(Array.isArray(selectedStatuses) ? selectedStatuses : []);
    } catch (error) {
      console.error('Error in handleStatusFilterChange:', error);
      setActiveStatuses([]);
    }
  }, []);

  if (loading) return <Spinner />;
  if (error) return <ErrorDisplay message={error.message} />;
  if (!Array.isArray(dataOpsList) || dataOpsList.length === 0) return <EmptyState />;

  return (
    <div className="container mx-auto px-4">
      <Stack direction="row" justifyContent="space-between" alignItems="center" mt={2}>
        <DataOpsChartHeader
          selectedRowData={countPipelineStatuses(filteredData)}
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
    try {
      const timenow = new Date();
      const thirtyDaysAgo = new Date(timenow);
      thirtyDaysAgo.setDate(timenow.getDate() - 10);

      const thirtyDaysAgoISOString = thirtyDaysAgo.toISOString();
      const params = { job_start_time: thirtyDaysAgoISOString };

      dispatch(getDataOps(params));
    } catch (error) {
      console.error('Error in AllDataOps useEffect:', error);
    }
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