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
import { FileQuestion, Package } from 'lucide-react';
import { FaFilter } from "react-icons/fa";
import { dataopsColumn } from "@/components/Dataops/DataOpsColumn";
import { Card } from '@/components/ui/card';

interface DataOpItem {
  job_id: string;
  project_name: string;
  flow_name: string;
  zone_name: string;
  flow_status: string;
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
  { key: 'flow_name', label: 'Flow' },
  { key: 'zone_name', label: 'Target Zone' },
  { key: 'flow_status', label: 'Status' },
];

const EmptyState = () => (
    <Card className="relative overflow-hidden w-full max-w-2xl mx-auto mt-20">
      <div className="absolute inset-0 bg-gradient-to-br from-gradient/5 via-primary/2 to-background" />
      <div className="relative p-8 sm:p-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="absolute top-0 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

          <div className="relative inline-flex mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/0 blur-2xl" />
            <div className="relative bg-gradient-to-br from-background to-muted p-4 rounded-2xl border border-gradient/10">
              <Package className="w-12 h-12 text-gradient" />
            </div>
          </div>

          <h2 className="text-3xl font-bold tracking-tight mb-4 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            Welcome to Your Job Monitor !
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
            Ready to monitor your job when flow is started.
          </p>
        </div>
      </div>
    </Card>
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
      if (!item || typeof item.flow_status !== 'string') {
        return;
      }

      const status = item.flow_status.trim();
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
          activeStatuses.includes(item.flow_status)
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