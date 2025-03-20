import { createColumnHelper } from '@tanstack/react-table';
import type {TToolbarConfig, ColumnDefWithFilters } from "@/types/table"
import { DataOpsHub } from '@/types/dataops/dataOpsHub';
import { Clock } from 'lucide-react';

export const columnHelper = createColumnHelper<DataOpsHub>();

const columns: ColumnDefWithFilters<DataOpsHub>[] = [
  columnHelper.accessor('flow_name', {
    header: 'Flow Name',        
    enableColumnFilter: true,
  }),
  columnHelper.accessor('project_name', {
    header: 'Project Name',
    enableColumnFilter: true,
  }),
  columnHelper.accessor('flow_status', {
    header: 'Flow Status',
    enableColumnFilter: true,
    filterFn: (row, columnId, filterValue) => {
      // Debug what's happening
      console.log("Filtering:", { 
        value: row.getValue(columnId), 
        filterValue 
      });
      
      // If no filter or empty array, show all rows
      if (!filterValue || !filterValue.length) return true;
      
      // Check if row's status is in the selected filters array
      return filterValue.includes(row.getValue(columnId));
    }
  }),
  columnHelper.accessor('flow_type', {
    header: 'Flow Type',
    enableColumnFilter: true,
  }),
  columnHelper.accessor('job_start_time', {
    header: 'Job Start Time',
    enableColumnFilter: true,
  }),
  columnHelper.accessor('created_at', {
    header: 'Created At',
    enableColumnFilter: true,
  }),
  columnHelper.accessor('created_by', {
    header: 'Created By',
    enableColumnFilter: true,
  }),
];

const getToolbarConfig = (): TToolbarConfig => {
  return {
    buttons: [
      {
        label: "Xplore",
        variant: "outline",
        icon: Clock,
        onClick: () => {
          window.dispatchEvent(new Event("openXploreops"));
        },
      }
    ]
  }
}

export { columns, getToolbarConfig };