import { createColumnHelper } from "@tanstack/react-table";
import type { ColumnDefWithFilters } from "@/types/table"; 
import { LayoutField } from "@/types/data-catalog/dataCatalog";
import { Gavel } from "lucide-react";

const columnHelper = createColumnHelper<LayoutField>();

const columns: ColumnDefWithFilters<LayoutField, any>[] = [
    columnHelper.accessor('lyt_fld_name', {
        header: 'Name',
        enableColumnFilter: false,
    }),
    columnHelper.accessor('lyt_fld_desc', {
        header: 'Description',
        enableColumnFilter: false,
        headerButton: {
            icon: Gavel,
            onClick: () => console.log("Generate the Description of the field"),
            tooltip: "Generate the Description of the field",
        },
    }),
    columnHelper.accessor('lyt_fld_tags', {
        header: 'Tags',
        cell: ({ getValue }) => {
            const tags = getValue();
            return Object.entries(tags).map(([key, value]) => `${key}: ${value}`).join(', ');
        },
    }),
];

export { columns };