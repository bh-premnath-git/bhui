
import { createColumnHelper } from "@tanstack/react-table"
import type { ColumnDefWithFilters } from "@/types/table"
import { Environment } from '@/types/admin/environemnt';

const columnHelper = createColumnHelper<Environment>()


export const columns: ColumnDefWithFilters<Environment>[] = [
  columnHelper.accessor('bh_env_name', {
    header: 'Name',
    enableColumnFilter: true,
  }),
  columnHelper.accessor('bh_env_provider_name', {
    header: 'Type',
    enableColumnFilter: true,
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    enableColumnFilter: false,
  }),
  
];
