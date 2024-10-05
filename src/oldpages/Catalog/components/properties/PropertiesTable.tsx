
import React, { useState } from 'react';
import { Table, TableBody, Stack, Typography, Chip, Divider, Paper } from '@mui/material';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { styled } from '@mui/material/styles';
import TablePagination from '@mui/material/TablePagination';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: '#f2f3f5',
        color: 'black',
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));

export default function PropertiesTable() {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const columns = [
        { id: 'fieldName', label: 'Field Name', align: 'left' },
        { id: 'value', label: 'Value', align: 'left' },
    ];

    const propertyList = [
        {
            'id': 1, 'fieldName': 'view_definition',
            'value': 'With Source As (Select * From "Calm-pagoda-323403"."Jaffle_shop","Raw_customers"), Renamed As (Select Id As Customer_id,First_name,Last_name Form Source)',
            'dataType': 'String'
        },
        { 'id': 2, 'fieldName': 'Node_type', 'value': 'Model', 'dataType': 'String' },
        { 'id': 3, 'fieldName': 'Is_view', 'value': 'True', 'dataType': 'Bool' },
        { 'id': 4, 'fieldName': 'Catalog_version', 'value': '1.1.0', 'dataType': 'String' },
        { 'id': 5, 'fieldName': 'Catalog_schema', 'value': 'Models/Staging/Stg_Customers.sql', 'dataType': 'String' },
        { 'id': 6, 'fieldName': 'Plan_desc', 'value': 'Models/Staging/Stg_Customers.sql', 'dataType': 'String' },
        { 'id': 7, 'fieldName': 'Catalog_type', 'value': 'View', 'dataType': 'String' },
        { 'id': 8, 'fieldName': 'Manifest_version', 'value': '1.1.0', 'dataType': 'String' },
        { 'id': 9, 'fieldName': 'Catalog_version', 'value': '1.1.0', 'dataType': 'String' },
        { 'id': 10, 'fieldName': 'Catalog_version', 'value': '1.1.0', 'dataType': 'String' },
        { 'id': 11, 'fieldName': 'Catalog_schema', 'value': 'Models/Staging/Stg_Customers.sql', 'dataType': 'String' },
        { 'id': 12, 'fieldName': 'Plan_desc', 'value': 'Models/Staging/Stg_Customers.sql', 'dataType': 'String' },
        { 'id': 13, 'fieldName': 'Catalog_type', 'value': 'View', 'dataType': 'String' },

    ];


    const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    return (
        <>

            <Stack sx={{ px: '16px' }}>
                <TableContainer sx={{ maxHeight: 800 }}>
                    <Table stickyHeader aria-label="sticky table" style={{ border: '1px solid #f2f3f5' }} >
                        <TableHead  >
                            <TableRow  >
                                {columns.map((column) => (

                                    <TableCell
                                        key={column.id}
                                        align='left'
                                        sx={{ backgroundColor: '#f2f2f8', color: 'black', fontSize: 'medium', fontWeight: "500" }}
                                    >
                                        {column.label}


                                    </TableCell>

                                ))}

                            </TableRow>
                        </TableHead>
                        <TableBody >

                            {propertyList.map((row, index) => {
                                return (
                                    <TableRow className='pt-1 ' key={index} hover role="checkbox" tabIndex={-1}  >


                                        <TableCell align="left" className='pt-2  my-2' style={{ borderBottom: '1px solid #f2f3f5' }}>
                                            <Stack direction="row" alignItems="center">
                                                <Typography variant="subtitle1" sx={{ p: '4px', fontSize: '16px',fontWeight:'border',color:'grey' }}>
                                                    {row?.fieldName}
                                                </Typography>
                                                <Chip className='mt-3 px-4'
                                                    label={`${row.dataType} `}
                                                    variant="outlined"
                                                    style={{ fontSize: '12px', borderRadius: '1pc', background: '#fff' }}
                                                />
                                            </Stack>

                                        </TableCell>

                                        <TableCell align="left" className='pt-2  my-2' style={{ borderBottom: '1px solid #f2f3f5',fontSize:'16px' }}>{row.value}</TableCell>

                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[10, 50, 100]}
                    component="div"
                    count={propertyList.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />

            </Stack>
        </>
    )
}