import { DataTable } from "@/components/bh-table/data-table";
import { DataOpsHub } from "@/types/dataops/dataOpsHub";
import { Row } from '@tanstack/react-table';
import { useNavigation } from '@/hooks/useNavigation';
import { useDataOpsHubManagementService } from "@/features/dataops/dataOpsHubs/services/dataOpsHubMgtSrv";
import { columns, getToolbarConfig } from "./dataOpsHubs/config/columns.config";
import { useState, useMemo, useEffect } from "react";
import { OpsHubSlideWrapper } from "./dataOpsHubs/components/OpsHubSlideWrapper";
import { ROUTES } from "@/config/routes";

export function OpsHub({ dataOpsHubs }: { dataOpsHubs: DataOpsHub[] }) {
  const { handleNavigation } = useNavigation();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<DataOpsHub | undefined>(undefined);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const dataOpsHubSrv = useDataOpsHubManagementService();

  const handleRowClick = (row: Row<DataOpsHub>) => {
    setSelectedRow(row.original);
    setIsSheetOpen(true);
    dataOpsHubSrv.selectDataOpsHub(row.original);
  };

  const handlePageChange = (page: number) => {
    setPageIndex(page - 1);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPageIndex(0);
  };

  // Apply filters BEFORE pagination
  const filteredData = useMemo(() => {
    // This will be filled in by the DataTable's filtering logic
    return dataOpsHubs || [];
  }, [dataOpsHubs]);

  // Then paginate the filtered data
  const currentPageData = useMemo(() => {
    const startIndex = pageIndex * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, pageIndex, pageSize]);

  useEffect(() => {
    const handleOpenXplore = () => {
      handleNavigation(`${ROUTES.DATAOPS.OPS_HUB}/data-xplorer`);
    };
    window.addEventListener("openXploreops", handleOpenXplore);
    return () => {
      window.removeEventListener("openXploreops", handleOpenXplore);
    }
  }, [handleNavigation]);

  return (
    <>
      <DataTable<DataOpsHub>
        columns={columns}
        data={currentPageData}
        fullData={dataOpsHubs}
        topVariant="status"
        headerFilter="flow_status"
        pagination={true}
        onRowClick={handleRowClick}
        toolbarConfig={getToolbarConfig()}
        pageCount={Math.ceil((filteredData.length || 0) / pageSize)}
        pageIndex={pageIndex}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
      <OpsHubSlideWrapper
        isSheetOpen={isSheetOpen}
        setIsSheetOpen={setIsSheetOpen}
        selectedRow={selectedRow}
      />
    </>
  );
}