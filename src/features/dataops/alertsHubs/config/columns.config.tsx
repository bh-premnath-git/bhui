import { createColumnHelper } from "@tanstack/react-table";
import type { ColumnDefWithFilters } from "@/types/table";
import { AlertHub } from "@/types/dataops/alertsHub";
import { useState } from "react";
import { FlexibleDialog } from "../components/AlertForm";
import { Plus, Eye } from "lucide-react"; // Import icons

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
      const alertId = row.original.alert_id; // Get alert_id from the row
      // console.log(value) // null

      // Check if resolution data exists - handle both object and array formats
      let hasResolutionData = false;
      let resolutionData = null;

      if (value) {
        if (typeof value === 'object' && !Array.isArray(value)) {
          hasResolutionData = true;
          resolutionData = value;
        } else if (Array.isArray(value) && value.length > 0) {
          hasResolutionData = true;
          resolutionData = value;
        }
      }

      return (
        <>
          <span
            className={`cursor-pointer px-2 py-1 rounded flex items-center gap-1 ${
              hasResolutionData 
                ? "bg-green-100 text-green-700" 
                : "bg-red-100 text-red-700"
            }`}
            onClick={() => setOpen(true)}
          >
            {hasResolutionData ? (
              <>
                <Eye size={16} />
                View Resolution
              </>
            ) : (
              <>
                <Plus size={16} />
                Add Reason
              </>
            )}
          </span>
          <FlexibleDialog
            open={open}
            mode="resolve"
            onClose={() => setOpen(false)}
            alertId={alertId} // Pass alertId to dialog
            onResolve={(correctionPlan, preventionPlan) => {
              console.log("Correction Plan:", correctionPlan);
              console.log("Prevention Plan:", preventionPlan);
              setOpen(false);
            }}
            currentResolution={hasResolutionData ? resolutionData : null}
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
      const alertId = row.original.alert_id; // Get alert_id from the row

      return (
        <>
          <span
            className="cursor-pointer bg-blue-100 text-blue-700 px-2 py-1 rounded"
            onClick={() => setOpen(true)}
          >
            {value || "Unassigned"}
          </span>
          <FlexibleDialog
            open={open}
            mode="assign"
            onClose={() => setOpen(false)}
            alertId={alertId} // Pass alertId to dialog
            onAssign={(assignee) => {
              console.log("Assigned To:", assignee);
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
 