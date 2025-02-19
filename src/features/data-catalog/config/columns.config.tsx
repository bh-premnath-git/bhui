import { createColumnHelper } from '@tanstack/react-table';
import type { TToolbarConfig, ColumnDefWithFilters } from "@/types/table"
import { DataSource } from '@/types/data-catalog/dataCatalog';


const columnHelper = createColumnHelper<DataSource>();

export const columns: ColumnDefWithFilters<DataSource, any>[] = [
  columnHelper.accessor('data_src_name', {
    header: 'Name',
    enableColumnFilter: true,
  }),
  columnHelper.accessor('data_src_desc', {
    header: 'Description',
    enableColumnFilter: false,
  }),
];




