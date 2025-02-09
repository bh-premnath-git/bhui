import { Alert } from '@/types/dataops.types';
import { DataTable } from "@/components/bh-table/data-table"
import { ColumnDefWithFilters } from "@/types/typesys.types";
import { getUniqueValues } from '@/lib/utils';
import { AlertTriangle, Info } from 'lucide-react';
import { Chip } from '@/components/ui/chip';
import { formatDate } from '@/lib/dayeformat';

interface AlertTableProps {
  alerts: Alert[]
}

export const AlertsTable = ({ alerts }: AlertTableProps) => {
  const tableName: string = "alerts"
  const columns: ColumnDefWithFilters<Alert>[] = [
    {
      accessorKey: 'flow_name',
      header: 'Title',
      filterOptions: getUniqueValues(alerts, 'flow_name')
    },
    {
      accessorKey: 'project_name',
      header: 'Project',
      filterOptions: getUniqueValues(alerts, 'project_name')
    },
    {
      accessorKey: 'monitor.monitor_type',
      header: 'Monitor Type',
      filterOptions: getUniqueValues(alerts, 'monitor.monitor_type'),
      cell: ({ row }) => {
        const type = (row.original.monitor.monitor_type as string).toLowerCase()
        return (
          <div className="flex items-center gap-2">
            {type === 'information' ? (
              <Info className="w-4 h-4 text-blue-500" />
            ) : type === 'action' ? (
              <AlertTriangle className="w-4 h-4 text-red-500" />
            ) : null}
            <span
              className={`capitalize ${type === 'information'
                  ? 'text-blue-500'
                  : type === 'action'
                    ? 'text-red-500'
                    : ''
                }`}
            >
              {row.original.monitor.monitor_type}
            </span>
          </div>
        )
      }
    },
    {
      accessorKey: 'alert_description',
      header: 'Alert Description',
      cell: ({ row }) => {
        let words = (row.original.alert_description as string).replace(/[_-]/g, ' ').split(' ');
        words = words.map((word, index) =>
          index === 0 ?
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() :
            word.toLowerCase()
        )
        return (
          <>{words.join(' ')}</>
        )
      }
    },
    {
      accessorKey: 'alter_status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.alter_status;
        const chipColor =
        status === "open"
          ? "error"
          : status === "closed"
          ? "success"
          : status === "in_progress"
          ? "warning"
          : "default";

        return (
          <Chip label={status} color={chipColor} size="small" />
          
        )
      }
    },
    {
      accessorKey: 'created_on',
      header: 'Created On',
      cell: ({ row }) => {
        return (
          <>{formatDate(row.original.created_on, "MM/dd/yyyy hh:mm a")}</>
        )
      }
    }
  ];
  return <DataTable
    tableName={tableName}
    columns={columns} data={alerts} showToolbar={true} />;
};