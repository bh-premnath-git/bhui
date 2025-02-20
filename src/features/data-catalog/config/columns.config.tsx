import { createColumnHelper } from '@tanstack/react-table';
import type { TToolbarConfig, ColumnDefWithFilters } from "@/types/table"
import { DataSource } from '@/types/data-catalog/dataCatalog';
import { formatDate } from "@/lib/date-format";
import {
  Database,
  Clock,
  PlusIcon
} from "lucide-react";

const columnHelper = createColumnHelper<DataSource>();

const columns: ColumnDefWithFilters<DataSource, any>[] = [
  columnHelper.accessor('data_src_name', {
    header: 'Name',
    enableColumnFilter: true,
  }),
  columnHelper.accessor('data_src_desc', {
    header: 'Description',
    enableColumnFilter: false,
  }),
  columnHelper.accessor('total_records', {
    header: 'Total Records',
    enableColumnFilter: false,
  }),
  columnHelper.accessor('updated_at', {
    header: 'Last Updated',
    cell: (info) => formatDate(info.getValue()),
    enableColumnFilter: false,
  }),
];

const getToolbarConfig = (): TToolbarConfig => {
  return {
    buttons: [
      {
        label: "Data Source",
        variant: "outline",
        icon: PlusIcon,
        onClick: () => {
          window.dispatchEvent(new Event("openImportSourceDialog"));
        },
      },
      {
        label: "Xplore",
        variant: "outline",
        icon: Clock,
        onClick: () => {
          window.dispatchEvent(new Event("openXploreDialog"));
        },
      }
    ]
  }
}

export { columns, getToolbarConfig }
