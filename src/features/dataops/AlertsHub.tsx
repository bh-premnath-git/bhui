import { DataTable } from "@/components/bh-table/data-table";
import { AlertHub } from "@/types/dataops/alertsHub";
import { Row } from '@tanstack/react-table';
import { useNavigation } from "@/hooks/useNavigation";
import { ROUTES } from "@/config/routes";
import { useAlertHubManagementService } from "@/features/dataops/alertsHubs/services/alertsHubMgtSrv";
import { columns } from "./alertsHubs/config/columns.config";

export function AlertsHub({ alertHubs }: { alertHubs: AlertHub[] }) {
  const { handleNavigation } = useNavigation();
  const alertHubSrv = useAlertHubManagementService();

  return (
    <DataTable<AlertHub>
      columns={columns}
      data={alertHubs || []}
      topVariant="simple"
      pagination={true}
    />
  );
}

