import { createColumnHelper } from "@tanstack/react-table"
import type { TToolbarConfig, ColumnDefWithFilters } from "@/types/table"
import { PlusIcon, GitBranch } from 'lucide-react';
import { Flow } from '@/types/designer/flow';

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
  // createdby, lastupdated, lastexecu
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

