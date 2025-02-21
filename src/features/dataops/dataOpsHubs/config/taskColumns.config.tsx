import { createColumnHelper } from "@tanstack/react-table";
import type { ColumnDefWithFilters } from "@/types/table"; 
import { TaskDetails } from "@/types/dataops/dataOpsHub";

const columnHelper = createColumnHelper<TaskDetails>();

const columns: ColumnDefWithFilters<TaskDetails, any>[] = [
    columnHelper.accessor('task_name', {
        header: 'Name',
        enableColumnFilter: false,
    }),
    columnHelper.accessor('task_status', {
        header: 'Description',
        enableColumnFilter: false,
    }),
];

export { columns };