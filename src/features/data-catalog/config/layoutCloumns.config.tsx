import { createColumnHelper } from "@tanstack/react-table";
import type { TToolbarConfig, ColumnDefWithFilters } from "@/types/table"; 
import { LayoutField } from "@/types/data-catalog/dataCatalog";
import { formatDate } from "@/lib/date-format";
import { Info } from "lucide-react";

const columnHelper = createColumnHelper<LayoutField>();

const columns: ColumnDefWithFilters<LayoutField, any>[] = [
    columnHelper.accessor('lyt_fld_name', {
        header: 'Field Name',
        enableColumnFilter: true,
    }),
    columnHelper.accessor('lyt_fld_desc', {
        header: 'Field Description',
        enableColumnFilter: true,
        // headerButton: {
        //     icon: Info,
        //     onClick: () => console.log("Duration help clicked"),
        //     tooltip: "Duration is measured in milliseconds",
        //   },
    }),
    columnHelper.accessor('lyt_fld_tags', {
        header: 'Field Tags',
        enableColumnFilter: true,
    }),
       
];

export { columns };