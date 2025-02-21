import React from 'react';
import { DataTable } from "@/components/bh-table/data-table";
import { ColumnDef } from "@tanstack/react-table";

interface SchemaTableProps {
    initialData: any; 
}

interface SchemaData {
    name: string;
    type: string;
    description?: string;
}

const columns: ColumnDef<SchemaData>[] = [
    {
        accessorKey: 'name',
        header: 'Name',
    },
    {
        accessorKey: 'type',
        header: 'Type',
    },
    {
        accessorKey: 'description',
        header: 'Description',
    },
];

export default function SchemaTable({ initialData }: SchemaTableProps) {
    // Transform initialData into the format expected by the table
    const tableData: SchemaData[] = React.useMemo(() => {
        if (!initialData?.schema) return [];
        
        return Object.entries(initialData.schema).map(([name, details]: [string, any]) => ({
            name,
            type: details.type || 'unknown',
            description: details.description || '',
        }));
    }, [initialData]);

    return (
        <div className="w-full">
            <DataTable
                data={tableData}
                columns={columns}
                pagination={true}
                topVariant="simple"
            />
        </div>
    );
}