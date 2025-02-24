import { DataTable } from "@/components/bh-table/data-table";
import { DataOpsHub } from "@/types/dataops/dataOpsHub";
import { Row } from '@tanstack/react-table';
import { useNavigation } from "@/hooks/useNavigation";
import { ROUTES } from "@/config/routes";
import { useDataOpsHubManagementService } from "@/features/dataops/dataOpsHubs/services/dataOpsHubMgtSrv";
import { columns } from "./dataOpsHubs/config/columns.config";
import { useState } from "react";
import { OpsHubSlideWrapper } from "./dataOpsHubs/components/OpsHubSlideWrapper";

export function OpsHub({ dataOpsHubs }: { dataOpsHubs: DataOpsHub[] }) {
  const { handleNavigation } = useNavigation();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<DataOpsHub | undefined>(undefined);
  const dataOpsHubSrv = useDataOpsHubManagementService();

  const handleRowClick = (row: Row<DataOpsHub>) => {
    setSelectedRow(row.original);
    setIsSheetOpen(true);
    dataOpsHubSrv.selectDataOpsHub(row.original);
  };

  return (
    <>
      <DataTable<DataOpsHub>
        columns={columns}
        data={dataOpsHubs || []}
        topVariant="status"
        headerFilter = "flow_status"
        pagination={true}
        onRowClick={handleRowClick}
      />
      <OpsHubSlideWrapper 
        isSheetOpen={isSheetOpen} 
        setIsSheetOpen={setIsSheetOpen} 
        selectedRow={selectedRow}
      />
    </>
  );
}