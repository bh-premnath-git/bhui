import { createColumnHelper } from '@tanstack/react-table';
import type { ColumnDefWithFilters } from "@/types/table"
import { DataOpsHub } from '@/types/dataops/dataOpsHub';

export const columnHelper = createColumnHelper<DataOpsHub>();

export const columns: ColumnDefWithFilters<DataOpsHub, any>[] = [
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
