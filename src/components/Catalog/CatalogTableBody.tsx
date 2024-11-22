import * as React from 'react';
import { LinearProgress, Link, Typography, debounce } from '@mui/material';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BiSortAlt2 } from "react-icons/bi";
import CommonDialog from '../../oldcomponents/common-dialoge';

// import CatalogsHead from './tabs/CatalogsHead';

// import {} Catalogs from './tabs/Catalogs';

interface Column {
    id: string;
    label: string;
    icon: any,
    align: 'left' | 'right' | 'center';
    format?: (value: React.ReactNode) => React.ReactNode;
}

interface Row {
    [key: string]: React.ReactNode;
}

const columns: Column[] = [
    { id: 'data_src_name', label: 'Data Source', icon: <BiSortAlt2 />, align: 'left' },
    { id: 'owner', label: 'Owner', icon: <BiSortAlt2 />, align: 'left' },
    { id: 'totalconsumers', label: 'Total Consumers', icon: <BiSortAlt2 />, align: 'center' },
    { id: 'totalrecords', label: 'Total Records', icon: <BiSortAlt2 />, align: 'center', format: (value: any) => value.toLocaleString('en-US') },
    { id: 'data_src_quality', label: 'Quality', icon: <BiSortAlt2 />, align: 'center' },
    { id: 'updated_at', label: 'Last Updated', icon: <BiSortAlt2 />, align: 'left' },

    { id: 'access', label: 'Access', icon: '', align: 'center' },
];
export default function CatalogTableBody(props: any) {
    // const { data } = props;
    const navigate = useNavigate();
    const [selectedRow, setSelectedRow] = useState<Row | null>(null);
    const [open, setOpen] = useState(false);
    const [open1, setOpen1] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [orderBy, setOrderBy] = useState<string | null>(null);
    const [orderDirection, setOrderDirection] = useState<'asc' | 'desc'>('asc');
    const [record, setRecord] = useState(props.data);


    console.log(props.data);
    const handleClose1 = () => {
        setOpen1(false);
    };

    const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    function formatDate(dateString: any) {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.getMonth() + 1; // Month is zero-based, so we add 1
        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
    }

    const handleClick = (data: any) => {
        navigate(`/Catalog/Catalogs`, { state: data });
        // { state: data }data: any
    };

    // 

    const handleSort = (columnId: string) => {
        console.log('Sorting by column:', columnId);
        console.log('Current data:', record);

        const isAsc = orderBy === columnId && orderDirection === 'asc';
        setOrderDirection(isAsc ? 'desc' : 'asc');
        setOrderBy(columnId);

        const sortedData = [...record].sort((a, b) => {
            const valueA = a[columnId];
            const valueB = b[columnId];

            console.log(`Value A: ${valueA}, Value B: ${valueB}`);

            // Handle undefined or null values
            if (valueA === undefined || valueA === null) return 1;
            if (valueB === undefined || valueB === null) return -1;

            if (typeof valueA === 'string' && typeof valueB === 'string') {
                return isAsc ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
            }
            if (typeof valueA === 'number' && typeof valueB === 'number') {
                return isAsc ? valueA - valueB : valueB - valueA;
            }

            return 0;
        });

        console.log('Sorted data:', sortedData);
        setRecord(sortedData);
    };
    const handleNext = (event:any) => {
        event.stopPropagation();
        setOpen1(true);
    };




    return (
        <div className='p-2 m-16' >
            <TableContainer sx={{ maxHeight: 800 }}>
                <Table stickyHeader aria-label="sticky table" style={{ border: '1px solid #f2f3f5' }} >
                    <TableHead  >
                        <TableRow  >
                            {columns.map((column: any) => (
                                <TableCell
                                    key={column.id}
                                    align={column.align}
                                    onClick={() => handleSort(column.id)}
                                    sx={{ backgroundColor: '#f2f3f5', color: 'black', fontSize: '16px', fontWeight: '500' }}
                                >
                                    {column.label}{column.icon}
                                    {column.id === orderBy && (
                                        <span>{orderDirection === 'asc' ? ' 🔼' : ' 🔽'}</span>
                                    )}
                                </TableCell>
                            ))}

                        </TableRow>
                    </TableHead>
                    <TableBody>

                        {record.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row: any, index: any) => {
                            return (
                                <TableRow
                                    key={row.data_src_id}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}

                                >
                                    <TableCell style={{ width: '25%', borderBottom: '1px solid #f2f3f5' }} align="left" onClick={() => handleClick(row)}>
                                        <Typography sx={{ fontSize: '16px', fontWeight: 'bold', "&:hover": { textDecoration: "underline" } }}> {row?.data_src_name}</Typography>
                                        <Typography variant='body2'>{row?.data_src_desc}</Typography>
                                    </TableCell>

                                    <TableCell align="left" sx={{ borderBottom: '1px solid #f2f3f5' }}>Muthu Kumar</TableCell>
                                    <TableCell align="center" sx={{ borderBottom: '1px solid #f2f3f5' }}>05</TableCell>
                                    <TableCell align="center" sx={{ borderBottom: '1px solid #f2f3f5' }}>1,000,000,000</TableCell>
                                    <TableCell align="center" sx={{ borderBottom: '1px solid #f2f3f5' }}><LinearProgress variant="determinate"
                                        value={parseInt(row?.data_src_quality, 10)}
                                        sx={{ backgroundColor: 'lightgray', height: '1.5rem', }}
                                        style={{ borderRadius: '10px', }}
                                        color={parseInt(row?.data_src_quality, 10) < 50 ? 'warning' : 'success'}

                                    /></TableCell>
                                    <TableCell align="left" sx={{ borderBottom: '1px solid #f2f3f5' }}> {formatDate(row?.data_src_last_updated)}
                                    </TableCell>
                                    <TableCell align="center" sx={{ borderBottom: '1px solid #f2f3f5' }} >
                                        <Typography
                                            variant="body1"
                                            style={{ textDecoration: 'underline', color: '#07CFCA', fontWeight: 'bold' }} onClick={handleNext}

                                        >
                                            Request Access
                                        </Typography>
                                    </TableCell>


                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
            {open1 && (
                <CommonDialog
                    open={open1}
                    onClose={handleClose1}
                    title=""
                    description="Request Access"
                    imageUrl="/assets/success.png"
                    additionalContent="Access request has been sent to data owner successfully"
                />
            )}
            <TablePagination
                rowsPerPageOptions={[10, 25, 100]}
                component="div"
                count={record.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />

        </div>

    );
}