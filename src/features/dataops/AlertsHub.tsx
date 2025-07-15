import { DataTable } from "@/components/bh-table/data-table";
import { AlertHub } from "@/types/dataops/alertsHub";
import { columns } from "./alertsHubs/config/columns.config";

export function AlertsHub({ alertHubs }: { alertHubs: AlertHub[] }) {

  return (
    <DataTable<AlertHub>
      columns={columns}
      data={alertHubs || []}
      topVariant="simple"
      pagination={true}
    />
  );
}

