import { createColumnHelper } from "@tanstack/react-table";
import type { ColumnDefWithFilters } from "@/types/table"; 
import { TaskDetails } from "@/types/dataops/dataOpsHub";

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
];

export { columns };