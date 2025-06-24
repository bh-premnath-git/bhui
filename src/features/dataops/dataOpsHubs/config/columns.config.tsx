import { createColumnHelper } from '@tanstack/react-table';
import type {TToolbarConfig, ColumnDefWithFilters } from "@/types/table"
import { DataOpsHub } from '@/types/dataops/dataOpsHub';
import { Clock } from 'lucide-react';
import { formatDuration } from '@/lib/date-format';

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
    header: 'Job Duration',
    cell: ({ row }) => {
      const startTime = row.original.job_start_time;
      const endTime = row.original.job_end_time;
      return formatDuration(startTime, endTime);
    },
    enableColumnFilter: false,
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
        className: "bg-primary text-primary-foreground",
        icon: Clock,
        onClick: () => {
          window.dispatchEvent(new Event("openXploreops"));
        },
      }
    ]
  }
}

export { columns, getToolbarConfig };