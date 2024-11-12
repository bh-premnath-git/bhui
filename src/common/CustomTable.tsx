import React, { useState } from 'react';
import {
    Table, TableBody, TableCell, TableHead, TableRow, TablePagination, IconButton, Menu,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MoreVert from '@mui/icons-material/MoreVert';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../redux/hooks';
import { setSelectedFlowFromList } from '../redux/FlowSlice';

// Styled TableRow component
const StyledTableRow = styled(TableRow)(({ theme }) => ({
    // Hide last border
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));

interface Column<T> {
    key: keyof T;
    label: string;
}

interface CustomTableProps<T> {
    columns: Column<T>[];
    data: T[];
    rowsPerPageOptions?: number[];
    menuActions?: (row: T, index: number) => React.ReactNode;
    className?: string;
    headerCellStyle?: React.CSSProperties;
    metaData?: any;
}

const CustomTable = <T extends Record<string, any>>({
    columns,
    data,
    rowsPerPageOptions = [5, 10, 25],
    menuActions,
    className,
    headerCellStyle,
    metaData,
}: CustomTableProps<T>) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [menuIndex, setMenuIndex] = useState<number | null>(null);

    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>, index: number) => {
        event.stopPropagation(); // Prevent row click event
        setAnchorEl(event.currentTarget);
        setMenuIndex(index);
    };

    const handleClose = () => {
        setAnchorEl(null);
        setMenuIndex(null);
    };

    const handleRowClick = async (event: React.MouseEvent, row: T) => {
        event.preventDefault();
        if (metaData) {
            const selectedMeta = metaData.find((meta: any) => meta.Name === (row as any).Name);
            dispatch(setSelectedFlowFromList(selectedMeta));
            navigate('/Designer/FlowPlayGround');
        }
    };

    return (
        <div className={className}>
            <Table>
                <TableHead sx={{ background: '#f2f3f5' }}>
                    <TableRow>
                        {columns.map((column) => (
                            <TableCell
                                className='myHeadFont text-left p-2 m-0'
                                key={String(column.key)}
                                style={headerCellStyle}
                            >
                                {column.label}
                            </TableCell>
                        ))}
                        {menuActions && <TableCell className='myHeadFont'>Action</TableCell>}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((row, index) => (
                            <StyledTableRow
                                style={{ cursor: 'pointer' }}
                                key={index}
                                onClick={(e) => handleRowClick(e, row)}
                            >
                                {columns.map((column) => (
                                    <TableCell
                                        className='p-2 m-0 text-left'
                                        key={String(column.key)}
                                    >
                                        {String(row[column.key])}
                                    </TableCell>
                                ))}
                                {menuActions && (
                                    <TableCell className='m-0 p-0' onClick={(e) => e.stopPropagation()}>
                                        <IconButton
                                            id={`basic-button-${index}`}
                                            aria-controls={`simple-menu-${index}`}
                                            aria-haspopup='true'
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
                                    </TableCell>
                                )}
                            </StyledTableRow>
                        ))}
                </TableBody>
            </Table>
            <TablePagination
                component='div'
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

export const generateColumnsFromData = <T extends Record<string, any>>(
    data: T[],
    excludeKeys: string[] = []
): Column<T>[] => {
    if (!data || data.length === 0) return [];

    const firstItem = data[0];
    return (Object.keys(firstItem) as Array<keyof T>)
        .filter((key) => !excludeKeys.includes(key as string))
        .map((key) => ({
            label: String(key)
                .replace(/_/g, ' ')
                .replace(/\b\w/g, (char) => char.toUpperCase()),
            key,
        }));
};

export const isEmpty = (obj: any) => {
    return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
};
