import { DataTable } from '@/components/bh-table/data-table';

interface PreviewTableData {
    orderid: string;
    orderdate: string;
    orderamount: number;
    comment: string;
}

const columns: any = [
    {
        key: 'orderid',
        header: 'Order ID',
        type: 'text',
    },
    {
        key: 'orderdate',
        header: 'Order Date',
        type: 'date',
    },
    {
        key: 'orderamount',
        header: 'Order Amount',
        type: 'number',
        render: (value: number) => `$${value.toLocaleString('en-US')}`,
    },
    {
        key: 'comment',
        header: 'Comment',
        type: 'text',
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
    const tableName = "preview"
    return (
        <div className="w-full  ">
            <DataTable
                tableName={tableName}
                data={mockData}
                columns={columns}
            />
        </div>
    );
}

export default PreviewTable;