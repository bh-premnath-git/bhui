import { Operation } from '@/types/dataops.types';
import { DataTable } from "@/components/bh-table/data-table"
import { ColumnDefWithFilters } from "@/types/typesys.types";

interface OperationsTableProps {
  operations: Operation[];
}

export const OperationsTable = ({ operations }: OperationsTableProps) => {
  const tableName: string = "operations"
  const columns: ColumnDefWithFilters<Operation>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <span className="capitalize">{row.original.type}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          row.original.status === 'running'
            ? 'bg-blue-100 text-blue-800'
            : row.original.status === 'completed'
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {row.original.status}
        </span>
      ),
    },
    {
      accessorKey: 'lastRun',
      header: 'Last Run',
    },
  ];
  return <DataTable 
  tableName={tableName}
  columns={columns} data={operations} showToolbar={false} />;
};