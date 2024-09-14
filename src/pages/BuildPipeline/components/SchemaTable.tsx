import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import { Button, Stack, Typography, Dialog, DialogTitle, DialogContent, DialogActions, TextField, } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { MdOutlineDeleteSweep } from 'react-icons/md';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';

interface Column {
    id: 'name' | 'datatype' | 'primarykey' | 'optional' | 'description' | 'tags' | 'clear';
    label: string;
    minWidth?: number;
    align?: 'left';
    format?: (value: number) => string;
}

const columns: readonly Column[] = [
    { id: 'name', label: 'Field Name', align: 'left' },
    { id: 'datatype', label: 'Data Type', align: 'left' },
    { id: 'primarykey', label: 'Primary Key', align: 'left' },
    { id: 'optional', label: 'Optional', align: 'left' },
    { id: 'description', label: 'Description', align: 'left' },
    { id: 'tags', label: 'Tags', minWidth: 170, align: 'left' },
    { id: 'clear', label: '', minWidth: 170, align: 'left' },
];

interface Data {
    name: string;
    datatype: string;
    primarykey: React.ReactNode;
    optional: React.ReactNode;
    description: React.ReactNode;
    tags: React.ReactNode;
    clear: React.ReactNode;
}

function createData(
    name: string,
    datatype: string,
    primarykey: React.ReactNode,
    optional: React.ReactNode,
    description: React.ReactNode,
    tags: React.ReactNode,
    clear: React.ReactNode
): Data {
    return { name, datatype, primarykey, optional, description, tags, clear };
}

const rows = [
    createData('NameType2', '', <Checkbox defaultChecked color="success" />, <Checkbox defaultChecked color="success" />, 'Lorem Ispusm Is..', <Stack direction={"row"} > <Typography sx={{ backgroundColor: 'lightgray', mx: 2, p: '5px', borderRadius: 1 }}>Infer Schema from Data<ClearIcon /></Typography></Stack>, <MdOutlineDeleteSweep className='text-danger fs-4' />),
    createData('NameType2', '', <Checkbox defaultChecked disabled color="success" />, <Checkbox defaultChecked disabled color="success" />, 'Lorem Ispusm Is..', '', <MdOutlineDeleteSweep className='text-danger fs-4' />),
    createData('NameType2', '', <Checkbox defaultChecked disabled color="success" />, <Checkbox defaultChecked disabled color="success" />, '', '', <MdOutlineDeleteSweep className='text-danger fs-4' />),
    createData('NameType2', '', <Checkbox defaultChecked color="success" />, <Checkbox defaultChecked color="success" />, '', '', <MdOutlineDeleteSweep className='text-danger fs-4' />),
    createData('NameType2', '', <Checkbox defaultChecked color="success" />, <Checkbox defaultChecked color="success" />, '', '', <MdOutlineDeleteSweep className='text-danger fs-4' />),
    createData('NameType2', '', <Checkbox defaultChecked color="success" />, <Checkbox defaultChecked color="success" />, '', '', <MdOutlineDeleteSweep className='text-danger fs-4' />),
    createData('NameType2', '', <Checkbox defaultChecked color="success" />, <Checkbox defaultChecked color="success" />, '', '', <MdOutlineDeleteSweep className='text-danger fs-4' />),
    createData('NameType2', '', <Checkbox defaultChecked color="success" />, <Checkbox defaultChecked color="success" />, '', '', <MdOutlineDeleteSweep className='text-danger fs-4' />),
    createData('NameType2', '', <Checkbox defaultChecked disabled color="success" />, <Checkbox defaultChecked disabled color="success" />, '', '', <MdOutlineDeleteSweep className='text-danger fs-4' />),
    createData('NameType2', '', <Checkbox defaultChecked color="success" />, <Checkbox defaultChecked color="success" />, '', '', <MdOutlineDeleteSweep className='text-danger fs-4' />),
    createData('NameType2', '', <Checkbox defaultChecked color="success" />, <Checkbox defaultChecked color="success" />, '', '', <MdOutlineDeleteSweep className='text-danger fs-4' />),
    createData('NameType2', '', <Checkbox defaultChecked color="success" />, <Checkbox defaultChecked color="success" />, '', '', <MdOutlineDeleteSweep className='text-danger fs-4' />),
    createData('NameType2', '', <Checkbox defaultChecked color="success" />, <Checkbox defaultChecked color="success" />, '', '', <MdOutlineDeleteSweep className='text-danger fs-4' />),
];

function SchemaTable() {
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [openDialog, setOpenDialog] = React.useState(false);
    const [inputValue, setInputValue] = React.useState('');

    const [age, setAge] = React.useState('');

    const handleChange = (event: SelectChangeEvent) => {
        setAge(event.target.value);
    };


    const handleClickOpenDialog = () => {
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
    };

    const handleSave = () => {
        // Handle save action
        console.log('Saved value:', inputValue);
        handleCloseDialog();
    };

    return (
        <Paper elevation={0} sx={{ width: '100%', overflow: 'hidden' }} className='myFont'>
            <TableContainer sx={{ maxHeight: 440 }}>
                <Table stickyHeader aria-label="sticky table">
                    <TableHead>
                        <TableRow>
                            {columns.map((column) => (
                                <TableCell className='myHeadFont'
                                    key={column.id}
                                    align={column.align}
                                    style={{ minWidth: column.minWidth }}
                                    sx={{ backgroundColor: 'lightgray', fontWeight: 'bold' }}
                                >
                                    {column.label}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((row) => (
                                <TableRow hover role="checkbox" tabIndex={-1} key={row.name}>
                                    {columns.map((column) => {
                                        const value = row[column.id];
                                        return (
                                            <TableCell className='myFont' key={column.id} align={column.align}>
                                                {column.id === 'description' && (
                                                    <Link href="#" onClick={handleClickOpenDialog}>
                                                        {value ? ('') : "Add"}
                                                    </Link>
                                                )}
                                                {column.id === 'datatype' && (
                                                    <Select
                                                        value={age}
                                                        onChange={handleChange}
                                                        displayEmpty
                                                        inputProps={{ 'aria-label': 'Without label' }}
                                                    >
                                                        <MenuItem value="">
                                                            Timestamp
                                                        </MenuItem>
                                                        <MenuItem value={"array"}>Array</MenuItem>
                                                        <MenuItem value={"binary"}>Binary</MenuItem>
                                                        <MenuItem value={"boolean"}>Boolean</MenuItem>
                                                        <MenuItem value={'byte'}>Byte</MenuItem>
                                                        <MenuItem value={'date'}>Date</MenuItem>
                                                        <MenuItem value={'int'}>Integer</MenuItem>
                                                        <MenuItem value={'double'}>Double</MenuItem>
                                                    </Select>
                                                )}
                                                {column.format && typeof value === 'number'
                                                    ? column.format(value)
                                                    : value}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Stack my={2}>
                <Stack direction={"row"} spacing={1}>
                    <Typography my={2} color={'skyblue'} fontWeight={"bold"}> <Checkbox defaultChecked disabled /> Eliminate Duplicate Records</Typography>
                </Stack>
                <Stack direction={"row"} spacing={1}>
                    <Typography my={2} color={'skyblue'} fontWeight={"bold"}> <Checkbox defaultChecked disabled /> Trim All Columns</Typography>
                </Stack>
                <Stack direction={"row"} spacing={1}>
                    <Typography my={2} color={'skyblue'} fontWeight={"bold"}> <Checkbox defaultChecked disabled /> Eliminate Records without Primary Key</Typography>
                </Stack>
            </Stack>

            <Stack direction={"row"} spacing={4} justifyContent={"center"}>
                <Button variant='outlined' sx={{ color: 'black', borderColor: 'black', px: 7, textTransform: 'none' }}>
                    Close
                </Button>
                <Button variant='contained' sx={{ backgroundColor: 'black', color: 'white', px: 7, textTransform: 'none' }}>
                    Save
                </Button>
            </Stack>

            <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth>
                <Stack direction={"row"} justifyContent={"space-between"}>
                    <DialogTitle fontWeight={"bold"}>Add Description</DialogTitle>
                    <ClearIcon sx={{ my: 2.5, mx: 2 }} onClick={handleCloseDialog} />
                </Stack>

                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={inputValue}
                        onChange={handleInputChange}
                        placeholder='Enter Description Here'
                        multiline
                        rows={4}
                    />
                </DialogContent>
                <Stack direction={"row"} spacing={4} justifyContent={"center"} my={2}>
                    <Button variant='outlined' sx={{ color: 'black', borderColor: 'black', px: 7, textTransform: 'none' }} onClick={handleCloseDialog}>
                        Close
                    </Button>
                    <Button variant='contained' sx={{ backgroundColor: 'black', color: 'white', px: 7, textTransform: 'none' }} onClick={handleSave}>
                        Save
                    </Button>
                </Stack>
            </Dialog>
        </Paper>
    );
}

export default SchemaTable;