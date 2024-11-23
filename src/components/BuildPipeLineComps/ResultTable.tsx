import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

function createData(
    orderid: string,
    orderdate: string,
    orderamount: string,
    order_desc: string

) {
    return { orderid, orderdate, orderamount, order_desc };
}

const rows = [
    createData('order_id1234', '1/04/2024', '1,000,000,000', 'Lorem Ipsum Is Simply Dummy Text Of The Printing '),
    createData('order_id1234', '1/04/2024', '1,000,000,000', 'Lorem Ipsum Is Simply Dummy Text Of The Printing'),
    createData('order_id1234', '1/04/2024', '1,000,000,000', 'Lorem Ipsum Is Simply Dummy Text Of The Printing'),
    createData('order_id1234', '1/04/2024', '1,000,000,000', 'Lorem Ipsum Is Simply Dummy Text Of The Printing'),
    createData('order_id1234', '1/04/2024', '1,000,000,000', 'Lorem Ipsum Is Simply Dummy Text Of The Printing'),
    createData('order_id1234', '1/04/2024', '1,000,000,000', 'Lorem Ipsum Is Simply Dummy Text Of The Printing'),
    createData('order_id1234', '1/04/2024', '1,000,000,000', 'Lorem Ipsum Is Simply Dummy Text Of The Printing'),
    createData('order_id1234', '1/04/2024', '1,000,000,000', 'Lorem Ipsum Is Simply Dummy Text Of The Printing'),
    createData('order_id1234', '1/04/2024', '1,000,000,000', 'Lorem Ipsum Is Simply Dummy Text Of The Printing'),
    createData('order_id1234', '1/04/2024', '1,000,000,000', 'Lorem Ipsum Is Simply Dummy Text Of The Printing'),
    createData('order_id1234', '1/04/2024', '1,000,000,000', 'Lorem Ipsum Is Simply Dummy Text Of The Printing'),
    createData('order_id1234', '1/04/2024', '1,000,000,000', 'Lorem Ipsum Is Simply Dummy Text Of The Printing'),
    createData('order_id1234', '1/04/2024', '1,000,000,000', 'Lorem Ipsum Is Simply Dummy Text Of The Printing'),
    createData('order_id1234', '1/04/2024', '1,000,000,000', 'Lorem Ipsum Is Simply Dummy Text Of The Printing'),
    createData('order_id1234', '1/04/2024', '1,000,000,000', 'Lorem Ipsum Is Simply Dummy Text Of The Printing'),
    createData('order_id1234', '1/04/2024', '1,000,000,000', 'Lorem Ipsum Is Simply Dummy Text Of The Printing'),
];

export default function ResultTable({drawerHeight}:any) {
    return (
        <TableContainer component={Paper} elevation={0}>
            <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                <TableHead sx={{ backgroundColor: 'lightgray' }} >
                    <TableRow>
                        <TableCell className='myHeadFont' sx={{ width: '20%' }}>Order ID</TableCell>
                        <TableCell align="left" className='myHeadFont' sx={{ width: '20%' }}>Order Date</TableCell>
                        <TableCell align="left" className='myHeadFont' sx={{ width: '15%' }}>Order Amount</TableCell>
                        <TableCell align="left" className='myHeadFont' sx={{ width: '20%' }}>Order Amount</TableCell>

                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.slice(0,drawerHeight=='60%'?7:15).map((row) => (
                        <TableRow
                            key={row.orderid}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell component="th" scope="row">
                                {row.orderid}
                            </TableCell>
                            <TableCell align="left">{row.orderdate}</TableCell>
                            <TableCell align="left">{row.orderamount}</TableCell>
                            <TableCell align="left" >{row.order_desc}</TableCell>

                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

