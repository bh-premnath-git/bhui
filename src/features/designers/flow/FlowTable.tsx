import { Flow } from "@/types/designer.types";
import { DataTable } from "@/components/bh-table/data-table"
import { ColumnDefWithFilters } from "@/types/typesys.types";
import { getUniqueValues } from '@/lib/utils';
import { CustomToolbarConfig } from "@/types/data-table.types";
import { PlusIcon } from "lucide-react";


interface FlowTableProps {
  flows: Flow[];
}

export const FlowTable = ({ flows }: FlowTableProps) => {
  const tableName: string = "flows"
  const columns: ColumnDefWithFilters<Flow>[] = [
    {
      accessorKey: "flow_name",
      header: "Name",
      filterOptions: getUniqueValues(flows, 'flow_name')
    },
    {
      accessorKey: "lastRun",
      header: "Last Run",
    },
  ];

  const customToolbarConfig: CustomToolbarConfig = {
    buttons: [
      {
        label: "Add Flow",
        icon: PlusIcon,
        variant: "default",
        onClick: () => console.log("Custom Add User clicked"),
      },
    ],
  };

  return <DataTable 
  tableName={tableName}
  customToolbarConfig={customToolbarConfig}
  columns={columns} data={flows} showToolbar={true} />;
};