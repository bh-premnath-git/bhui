import { createColumnHelper } from "@tanstack/react-table"
import type { TToolbarConfig, ColumnDefWithFilters } from "@/types/table"
import { PlusIcon, GitBranch, MoreVertical } from 'lucide-react';
import { Flow } from '@/types/designer/flow';
import { formatDate } from "@/lib/date-format";

const columnHelper = createColumnHelper<Flow>()

const columns: ColumnDefWithFilters<Flow>[] = [
  columnHelper.accessor('flow_name', {
    header: 'Name',
    enableColumnFilter: true,
  }),
  columnHelper.accessor('bh_project_name', {
    header: 'Project',
    enableColumnFilter: true,
  }),
  columnHelper.accessor('created_by', {
    header: 'Created By',
    enableColumnFilter: false,
  }),
  columnHelper.accessor('updated_at', {
    header: 'Last Updated',
    cell: (info) => formatDate(info.getValue()),
    enableColumnFilter: false,
  }),
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      return (
        <div className="flex items-center space-x-2">
          <MoreVertical className="h-4 w-4" />
        </div>
      )
    },
    enableColumnFilter: false,
  }

];

const getToolbarConfig = (): TToolbarConfig => {
  return {
    buttons: [
      {
        label: <GitBranch className="mr-2 h-4 w-4" />,
        variant: "outline",
        icon: PlusIcon,
        onClick: () => {
          console.log(">>>");
        },
      }]
  }
}

export { columns, getToolbarConfig }

