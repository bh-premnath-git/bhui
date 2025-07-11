import { createColumnHelper } from "@tanstack/react-table";
import type { ColumnDefWithFilters } from "@/types/table";
import { AlertHub } from "@/types/dataops/alertsHub";
import { useState } from "react";
import { FlexibleDialog } from "../components/AlertForm";

export const columnHelper = createColumnHelper<AlertHub>();

export const columns: ColumnDefWithFilters<AlertHub>[] = [
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
    enableColumnFilter: false,
  }),
  columnHelper.accessor("alert_description", {
    header: "Alert Description",
    enableColumnFilter: true,
  }),
  columnHelper.accessor("alter_status", {
    header: "Alter Status",
    enableColumnFilter: true,
  }),
  columnHelper.accessor("resolution_reason", {
    header: "Resolution Reason",
    enableColumnFilter: true,
    cell: ({ getValue, row }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [open, setOpen] = useState(false);
      const value = getValue();
      return (
        <>
          <span
            className="cursor-pointer bg-red-100 and text-red-700"
            onClick={() => setOpen(true)}
          >
            {value ? value : "Not Resolved"}
          </span>
          <FlexibleDialog
            open={open}
            mode="resolve"
            onClose={() => setOpen(false)}
              onResolve={(resolutionReason, resolutionPlan) => {
              console.log("Correction :", resolutionReason);
              console.log("Reason :", resolutionPlan);
              setOpen(false);
            }}
          />
        </>
      );
    },
  }),
  columnHelper.accessor("assigned_to", {
    header: "Assigned To",
    enableColumnFilter: true,
    cell: ({ getValue, row }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [open, setOpen] = useState(false);
      const value = getValue();
      return (
        <>
          <span
            className="cursor-pointer  bg-blue-100 and text-blue-700"
            onClick={() => setOpen(true)}
          >
            {value || "Unassigned"}
          </span>
          <FlexibleDialog
            open={open}
            mode="assign"
            onClose={() => setOpen(false)}
            onAssign={(assignee) => {
              console.log("Assigned To :", assignee);
              setOpen(false);
            }}
            currentUser={value}
          />
        </>
      );
    },
  }),
  columnHelper.accessor("created_by", {
    header: "Created By",
    enableColumnFilter: false,
  }),
  columnHelper.accessor("created_on", {
    header: "Created On",
    enableColumnFilter: false,
  }),
];