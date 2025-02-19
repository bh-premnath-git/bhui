import { DataTable } from "@/components/bh-table/data-table";
import { DataOpsHub } from "@/types/dataops/dataOpsHub";
import { Row } from '@tanstack/react-table';
import { useNavigation } from "@/hooks/useNavigation";
import { ROUTES } from "@/config/routes";
import { useDataOpsHubManagementService } from "@/features/dataops/dataOpsHubs/services/dataOpsHubMgtSrv";
import { columns } from "./dataOpsHubs/config/columns.config";

export function OpsHub({ dataOpsHubs }: { dataOpsHubs: DataOpsHub[] }) {
  const { handleNavigation } = useNavigation();
  const dataOpsHubSrv = useDataOpsHubManagementService();

  return (
    <DataTable<DataOpsHub>
      columns={columns}
      data={dataOpsHubs || []}
      topVariant="simple"
      pagination={true}
    />
  );
}