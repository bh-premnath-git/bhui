import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { RootState } from "@/store/store";
import { getDataOps } from "@/redux/DataOpsSlice";

// Components
import { FlexibleTable } from "@/components/Tabel";
import { Spinner } from "@/components/ui/spinner";
import { ErrorDisplay } from "@/components/ui/error-display";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ShowingLogs from "@/components/Dataops/ShowingLogs";
import MyChartComponent from "@/components/Dataops/ChartComponent";
import DataOpsChartHeader from "@/components/Dataops/DataOpsChartHeader";
import FilterForm from '@/components/Dataops/FilterForm';

// Material UI imports
import { Card, CardContent, Divider, Grid, Tab, Tabs, Stack } from "@mui/material";

// Icons
import { FileQuestion } from "lucide-react";
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
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedRowData, setSelectedRowData] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (dataOpsList?.length && !selectedRowData) {
      setSelectedRowData(dataOpsList[0]);
    }
  }, [dataOpsList]);

  // Filter data based on search term and active field-based filters
  const filteredData = useMemo(() => {
    let filtered = dataOpsList.filter(item =>
      Object.values(item).some((value:any) => 
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    if (Object.keys(activeFilters).length > 0) {
      filtered = filtered.filter(item => 
        Object.entries(activeFilters).every(([key, value]) =>
          item[key]?.toString().toLowerCase().includes(value.toLowerCase())
        )
      );
    }

    return filtered;
  }, [dataOpsList, searchTerm, activeFilters]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }

  const handleFilterSubmit = useCallback((values: Record<string, string>) => {
    const nonEmptyFilters = Object.fromEntries(
      Object.entries(values).filter(([_, value]) => value?.trim() !== '')
    );
    setActiveFilters(nonEmptyFilters);
    setIsFilterOpen(false);
  }, []);

  const handleRowSelect = useCallback((row: any) => {
    setSelectedRowData(row);
  }, []);

  if (loading) return <Spinner size="lg" />;
  if (error) return <ErrorDisplay message={error.message} />;
  if (!dataOpsList?.length) return <EmptyState />;

  return (
    <div className="container mx-auto px-4">
      {/* Header Section */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" my={2}>
        <DataOpsChartHeader selectedRowData={selectedRowData} />
        <Stack direction="row" spacing={2} alignItems="center">
          <Input
            placeholder="Search Pipeline"
            className="w-44"
            value={searchTerm}
            onChange={handleSearch}
          />
          <FaFilter
            onClick={() => setIsFilterOpen(true)}
            className="border w-9 h-9 p-2 rounded shadow cursor-pointer hover:bg-gray-50"
          />
        </Stack>
      </Stack>

      {/* Table Component */}
      <FlexibleTable
        data={filteredData}
        columns={dataopsColumn}
        itemsPerPageOptions={[5, 10, 20]}
        defaultItemsPerPage={10}
        isSearch={false}
        playRow={true}
        playRowFn={handleRowSelect}
        isAction={false}
      />
      
      {/* Filter Form */}
      <FilterForm
        open={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onSubmit={handleFilterSubmit}
        items={dataOpsList}
        filterableFields={filterableFields}
      />

      {/* Details Card */}
      {selectedRowData && (
        <Card elevation={0} className="border rounded shadow-sm mt-4">
          <CardContent>
            <Label className="text-md">
              Job Name: <span className="font-bold">{selectedRowData.pipeline_name}</span>
            </Label>

            <Tabs
              value={selectedTab}
              onChange={(_, newValue) => setSelectedTab(newValue)}
              className="mt-4"
            >
              <Tab label={<Label>Properties</Label>} sx={{ textTransform: 'none' }} />
              <Tab label={<Label>Show Logs</Label>} sx={{ textTransform: 'none' }} />
            </Tabs>

            <Divider sx={{ width: '12%', mb: 2 }} />

            {selectedTab === 0 && (
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Stack spacing={1}>
                    <Label className="text-sm">Batch ID: {selectedRowData.batch_id}</Label>
                    <Label className="text-sm">Input data: {selectedRowData.input_data_path}</Label>
                    <Label className="text-sm">Output data: {selectedRowData.output_data_path}</Label>
                  </Stack>
                </Grid>
                <Grid item xs={8}>
                  <Card className="border shadow-sm rounded" elevation={0}>
                    <CardContent>
                      <Label className="text-md mb-4">Data Statistics</Label>
                      <MyChartComponent selectedRowData={selectedRowData} />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {selectedTab === 1 && <ShowingLogs />}
          </CardContent>
        </Card>
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
    dispatch(getDataOps());
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
