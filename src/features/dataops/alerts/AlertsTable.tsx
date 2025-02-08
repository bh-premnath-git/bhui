import { Alert } from '@/types/dataops.types';
import { DataTable } from "@/components/bh-table/data-table"
import { ColumnDefWithFilters } from "@/types/typesys.types";

interface AlertTableProps {
  alerts: Alert[]
}

export const AlertsTable = ({ alerts }: AlertTableProps) => {
  const tableName: string = "alerts"
  const columns: ColumnDefWithFilters<Alert>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
    },
    {
      accessorKey: 'severity',
      header: 'Severity',
      cell: ({ row }) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          row.original.severity === 'critical' 
            ? 'bg-red-100 text-red-800'
            : row.original.severity === 'high'
            ? 'bg-orange-100 text-orange-800'
            : row.original.severity === 'medium'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-green-100 text-green-800'
        }`}>
          {row.original.severity}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          row.original.status === 'active'
            ? 'bg-red-100 text-red-800'
            : 'bg-green-100 text-green-800'
        }`}>
          {row.original.status}
        </span>
      ),
    },
    {
      accessorKey: 'timestamp',
      header: 'Time',
    },
  ];
  return <DataTable 
  tableName={tableName}
  columns={columns} data={alerts} showToolbar={false} />;
};