import React from 'react';
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/bh-table/data-table";

interface PreviewTableData {
    orderid: string;
    orderdate: string;
    orderamount: number;
    comment: string;
}

const columns: ColumnDef<PreviewTableData>[] = [
    {
        accessorKey: 'orderid',
        header: 'Order ID',
    },
    {
        accessorKey: 'orderdate',
        header: 'Order Date',
    },
    {
        accessorKey: 'orderamount',
        header: 'Order Amount',
        cell: ({ row }) => {
            const amount = row.getValue('orderamount') as number;
            return `$${amount.toLocaleString('en-US')}`;
        },
    },
    {
        accessorKey: 'comment',
        header: 'Comment',
    },
];

const mockData: PreviewTableData[] = [
    { orderid: 'ORD-2024-001', orderdate: '2024-01-04', orderamount: 1000000000, comment: 'Lorem ipsum dolor sit amet' },
    { orderid: 'ORD-2024-002', orderdate: '2024-01-04', orderamount: 1500000000, comment: 'Consectetur adipiscing elit' },
    { orderid: 'ORD-2024-003', orderdate: '2024-01-04', orderamount: 2000000000, comment: 'Sed do eiusmod tempor' },
    { orderid: 'ORD-2024-004', orderdate: '2024-01-04', orderamount: 2500000000, comment: 'Ut labore et dolore' },
    { orderid: 'ORD-2024-005', orderdate: '2024-01-04', orderamount: 3000000000, comment: 'Magna aliqua ut enim' },
    { orderid: 'ORD-2024-006', orderdate: '2024-01-04', orderamount: 3500000000, comment: 'Ad minim veniam quis' },
    { orderid: 'ORD-2024-007', orderdate: '2024-01-04', orderamount: 4000000000, comment: 'Nostrud exercitation ullamco' },
    { orderid: 'ORD-2024-008', orderdate: '2024-01-04', orderamount: 4500000000, comment: 'Laboris nisi ut aliquip' },
    { orderid: 'ORD-2024-009', orderdate: '2024-01-04', orderamount: 5000000000, comment: 'Ex ea commodo consequat' },
    { orderid: 'ORD-2024-010', orderdate: '2024-01-04', orderamount: 5500000000, comment: 'Duis aute irure dolor' },
];

function PreviewTable() {
    return (
        <div className="w-full">
            <DataTable
                data={mockData}
                columns={columns}
                pagination={true}
                topVariant="simple"
            />
        </div>
    );
}

export default PreviewTable;