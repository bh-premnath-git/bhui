import { createColumnHelper } from "@tanstack/react-table";
import type { TToolbarConfig, ColumnDefWithFilters } from "@/types/table";
import { AlertHub } from "@/types/dataops/alertsHub";

export const columnHelper = createColumnHelper<AlertHub>();

export const columns: ColumnDefWithFilters<AlertHub, any>[] = [
 columnHelper.accessor("flow_name", {
    header: "Flow Name",
    enableColumnFilter: true,
  }),
  columnHelper.accessor("project_name", {
    header: "Project Name",
    enableColumnFilter: true,
  }),
  columnHelper.accessor("monitor.monitor_template_data.monitor_type", {
    header: "Monitor Type",
    enableColumnFilter: true,
  }),
  columnHelper.accessor("alert_description", {
    header: "Alert Description",
    enableColumnFilter: true,
  }),
  columnHelper.accessor("alter_status", {
    header: "Alter Status",
    enableColumnFilter: true,
  }),
  columnHelper.accessor("assigned_to", {
    header: "Assigned To",
    enableColumnFilter: true,
  }),
  columnHelper.accessor("created_by", {
    header: "Created By",
    enableColumnFilter: true,
  }),
  columnHelper.accessor("created_on", {
    header: "Created On",
    enableColumnFilter: true,
  }),
];