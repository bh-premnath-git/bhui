import { createColumnHelper } from "@tanstack/react-table";
import type { ColumnDefWithFilters } from "@/types/table"; 
import { TaskDetails } from "@/types/dataops/dataOpsHub";
import { formatDuration } from "@/lib/date-format";

const columnHelper = createColumnHelper<TaskDetails>();

const columns: ColumnDefWithFilters<TaskDetails>[] = [
    columnHelper.accessor('task_name', {
        header: 'Name',
        enableColumnFilter: false,
    }),
    columnHelper.accessor('task_status', {
        header: 'Status',
        enableColumnFilter: false,
    }),
    columnHelper.accessor('task_start_time', {
        header: 'Task Duration',
        cell: ({ row }) => {
            const startTime = row.original.task_start_time;
            const endTime = row.original.task_end_time;
            return formatDuration(startTime, endTime);
        },
        enableColumnFilter: false,
    }),
    columnHelper.accessor(row => row.task_metadata.task_log_url, {
        id: 'task_log_url',
        header: 'Logs',
        cell: ({ getValue }) => {
            const url = getValue();
            if (!url) return null;
            return (
                <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2">
                    <img src="/apacheairflow.png" alt="View Logs" className="w-6 h-6" />
                    <span>view</span>
                </a>
            );
        },
        enableColumnFilter: false,
    }),
];

export { columns };