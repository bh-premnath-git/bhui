import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';

interface Column {
    id: 'orderid' | 'orderdate' | 'orderamount' | 'comment';
    label: string;
    minWidth?: number;
    align?: 'left';
    format?: (value: number) => string;
}

const columns: readonly Column[] = [
    { id: 'orderid', label: 'Order ID', minWidth: 170 },
    { id: 'orderdate', label: 'Order Date', minWidth: 100 },
    {
        id: 'orderamount',
        label: 'Order Amount',
        minWidth: 170,
        align: 'left',
        format: (value: number) => value.toLocaleString('en-US'),
    },
    {
        id: 'comment',
        label: 'Comment',
        minWidth: 170,
        align: 'left',
        format: (value: number) => value.toLocaleString('en-US'),
    },
];

interface Data {
    orderid: string;
    orderdate: string;
    orderamount: number;
    comment: string;

}

function createData(
    orderid: string,
    orderdate: string,
    orderamount: number,
    comment: string,
): Data {
    return { orderid, orderdate, orderamount, comment };
}

const rows = [
    createData('Order_ID1234', '1/04/2024', 1000000000, 'Lorem Ipusm is Simply Dummy Test Of the Printing '),
    createData('Order_ID1234', '1/04/2024', 1000000000, 'Lorem Ipusm is Simply Dummy Test Of the Printing '),
    createData('Order_ID1234', '1/04/2024', 1000000000, 'Lorem Ipusm is Simply Dummy Test Of the Printing '),
    createData('Order_ID1234', '1/04/2024', 1000000000, 'Lorem Ipusm is Simply Dummy Test Of the Printing '),
    createData('Order_ID1234', '1/04/2024', 1000000000, 'Lorem Ipusm is Simply Dummy Test Of the Printing '),
    createData('Order_ID1234', '1/04/2024', 1000000000, 'Lorem Ipusm is Simply Dummy Test Of the Printing '),
    createData('Order_ID1234', '1/04/2024', 1000000000, 'Lorem Ipusm is Simply Dummy Test Of the Printing '),
    createData('Order_ID1234', '1/04/2024', 1000000000, 'Lorem Ipusm is Simply Dummy Test Of the Printing '),
    createData('Order_ID1234', '1/04/2024', 1000000000, 'Lorem Ipusm is Simply Dummy Test Of the Printing '),
    createData('Order_ID1234', '1/04/2024', 1000000000, 'Lorem Ipusm is Simply Dummy Test Of the Printing '),

];

function PreviewTable() {
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    return (
        <Paper elevation={0} sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer sx={{ maxHeight: 500 }}>
                <Table stickyHeader aria-label="sticky table">
                    <TableHead>
                        <TableRow>
                            {columns.map((column) => (
                                <TableCell className='myHeadFont'
                                    key={column.id}
                                    align={column.align}
                                    style={{ minWidth: column.minWidth }}
                                    sx={{ backgroundColor: '#E9E9E9', fontWeight: 'bold' }}

                                >
                                    {column.label}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((row) => {
                                return (
                                    <TableRow hover role="checkbox" tabIndex={-1} key={row.orderid}>
                                        {columns.map((column) => {
                                            const value = row[column.id];
                                            return (
                                                <TableCell className='myFont' key={column.id} align={column.align}>
                                                    {column.format && typeof value === 'number'
                                                        ? column.format(value)
                                                        : value}
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                );
                            })}
                    </TableBody>
                </Table>
            </TableContainer>
            {/* <TablePagination
                rowsPerPageOptions={[10, 25, 100]}
                component="div"
                count={rows.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            /> */}
        </Paper>
    );
}

export default PreviewTable;