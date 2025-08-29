import { createColumnHelper } from "@tanstack/react-table"
import type { TToolbarConfig, ColumnDefWithFilters } from "@/types/table"
import { PlusIcon, Repeat } from 'lucide-react';
import { Release } from "@/types/dataops/realease";
import { Badge } from "@/components/ui/badge";

const columnHelper = createColumnHelper<Release>()

const columns: ColumnDefWithFilters<Release>[] = [
  columnHelper.accessor('name', {
    header: 'Name',
    enableColumnFilter: true,
  }),
  columnHelper.accessor('environment', {
    header: 'Environment',
    enableColumnFilter: true,
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: (info) => {
        return <Badge variant={info.getValue() as any}>{info.getValue()}</Badge>
    },
    enableColumnFilter: true,
  })
];

const getToolbarConfig = (): TToolbarConfig => {
  return {
    buttons: [
      {
        label: <Repeat className="mr-2 h-4 w-4" />,
        variant: "outline",
        className: "bg-primary text-primary-foreground",
        icon: PlusIcon,
        onClick: () => {
        },
      }]
  }

}

export { columns, getToolbarConfig }