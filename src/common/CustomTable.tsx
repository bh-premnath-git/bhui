import React, { useState } from 'react';
import {
    Table, TableBody, TableCell, TableHead, TableRow, TablePagination, IconButton, Menu, MenuItem,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MoreVert from '@mui/icons-material/MoreVert';

// Styled TableRow component
const StyledTableRow = styled(TableRow)(({ theme }) => ({
    // Hide last border
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));

interface CustomTableProps<T> {
    columns: any;
    data: T[];
    rowsPerPageOptions?: number[];
    menuActions?: (row: T, index: number) => React.ReactNode;
    className?:any;
    headerCellStyle?: React.CSSProperties;
}

const CustomTable = <T extends unknown>({
    columns,
    data,
    rowsPerPageOptions = [5, 10, 25],
    menuActions,
    className,
    headerCellStyle
}: CustomTableProps<T>) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [menuIndex, setMenuIndex] = useState<number | null>(null);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>, index: number) => {
        setAnchorEl(event.currentTarget);
        setMenuIndex(index);
    };

    const handleClose = () => {
        setAnchorEl(null);
        setMenuIndex(null);
    };

    return (
        <div className={className}>
            <Table>
                <TableHead sx={{ background: '#f2f3f5'}} >
                    <TableRow>
                        {columns.map((column) => (
                            <TableCell
                                className='myHeadFont text-left p-2 m-0'
                                key={column.key as string}
                                style={headerCellStyle} // Apply headerCellStyle
                            >
                                {column.label}
                            </TableCell>                        ))}
                        {menuActions&&(<TableCell className='myHeadFont'>Action</TableCell>)}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((row, index) => (
                            <StyledTableRow key={index}>
                                {columns.map((column) => (
                                    <TableCell className='p-2 m-0 text-left' key={column.key as string}>{(row[column.key] as React.ReactNode)}</TableCell>
                                ))}
                                {menuActions&&(<TableCell className='m-0 p-0'>
                                    <div style={{ boxShadow: 'none' }}>
                                        <IconButton 
                                            id={`basic-button-${index}`}
                                            aria-controls={`simple-menu-${index}`}
                                            aria-haspopup="true"
                                            onClick={(event) => handleClick(event, index)}
                                        >
                                            <MoreVert />
                                        </IconButton>
                                        <Menu
                                            id={`simple-menu-${index}`}
                                            anchorEl={anchorEl}
                                            open={Boolean(anchorEl) && menuIndex === index}
                                            onClose={handleClose}
                                            MenuListProps={{
                                                'aria-labelledby': `basic-button-${index}`,
                                            }}
                                        >
                                            {menuActions(row, index)}
                                        </Menu>
                                    </div>
                                </TableCell>)}
                            </StyledTableRow>
                        ))}
                </TableBody>
            </Table>
            <TablePagination
                component="div"
                count={data.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={rowsPerPageOptions}
            />
        </div>
    );
};

export default CustomTable;

export const generateColumnsFromData = (data: any[], excludeKeys: string[] = []) => {
    if (!data || data.length === 0) return [];

    const firstItem = data[0];
    return Object.keys(firstItem)
        .filter(key => !excludeKeys.includes(key)) // Filter out unwanted columns
        .map(key => ({
            label: key
                .replace(/_/g, ' ')
                .replace(/\b\w/g, char => char.toUpperCase()), // Convert to readable format
            key,
        }));
};

export const isEmpty = (obj) => {
    return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
};