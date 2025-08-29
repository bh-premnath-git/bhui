import { DataTable } from "@/components/bh-table/data-table";
import { DataOpsHub } from "@/types/dataops/dataOpsHub";
import { Row } from '@tanstack/react-table';
import { useNavigation } from '@/hooks/useNavigation';
import { useDataOpsHubManagementService } from "@/features/dataops/dataOpsHubs/services/dataOpsHubMgtSrv";
import { columns, getToolbarConfig } from "./dataOpsHubs/config/columns.config";
import { useState, useEffect } from "react";
import { OpsHubSlideWrapper } from "./dataOpsHubs/components/OpsHubSlideWrapper";
import { ROUTES } from "@/config/routes";

interface OpsHubProps {
  dataOpsHubs: DataOpsHub[];
  pageCount: number;
  pageIndex: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export function OpsHub({ 
  dataOpsHubs,
  pageCount,
  pageIndex,
  pageSize,
  onPageChange,
  onPageSizeChange,
  hasNextPage,
  hasPreviousPage
}: OpsHubProps) {
  const { handleNavigation } = useNavigation();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<DataOpsHub | undefined>(undefined);
  const dataOpsHubSrv = useDataOpsHubManagementService();

  const handleRowClick = (row: Row<DataOpsHub>) => {
    setSelectedRow(row.original);
    setIsSheetOpen(true);
    dataOpsHubSrv.selectDataOpsHub(row.original);
  };

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
        key={`${pageIndex}-${pageSize}opshub`}
        columns={columns}
        data={dataOpsHubs}
        fullData={dataOpsHubs}
        topVariant="status"
        headerFilter="flow_status"
        pagination={true}
        onRowClick={handleRowClick}
        toolbarConfig={getToolbarConfig()}
        pageCount={pageCount}
        pageIndex={pageIndex}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
      />
      <OpsHubSlideWrapper
        isSheetOpen={isSheetOpen}
        setIsSheetOpen={setIsSheetOpen}
        selectedRow={selectedRow}
      />
    </>
  );
}