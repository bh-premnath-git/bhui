import * as React from 'react';
import {
    Stack, LinearProgress, Typography, IconButton, Dialog, DialogTitle, DialogContent,
    DialogContentText, DialogActions, Button, Box, TextField, Chip, Divider, Popover
} from '@mui/material';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import ShareIcon from '@mui/icons-material/Share';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import * as Yup from 'yup';
import About from '../../oldpages/Catalog/components/About';
import ApiService from '../../Services/ApiServices';
import ShowAll from './showAll';
import { LuCalendarDays } from "react-icons/lu";
import { BsChatDots } from "react-icons/bs";
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { FlexibleTable } from '@/components/Tabel';
import { catalogColumns } from '@/features/catalogColumn';
interface Column {
    id: string;
    label: string;
    align: 'left' | 'right' | 'center';
    format?: (value: React.ReactNode) => React.ReactNode;
}

interface Row {
    [key: string]: React.ReactNode;
}

const validationSchema = Yup.object({
    tagKey: Yup.string().required('Tag Key is required'),
    tagValue: Yup.string().required('Tag Value is required'),
});


const columns: Column[] = [
    { id: 'field', label: 'Field', align: 'left' },
    { id: 'description', label: 'Description', align: 'left' },
    { id: 'tags', label: 'Tags', align: 'left' },
    { id: 'glossaryterms', label: 'Glossary Terms', align: 'center' },
    { id: 'edit', label: ' ', align: 'center', },

];



function createData(field: React.ReactNode, description: React.ReactNode, tags: React.ReactNode, glossaryterms: string, edit: React.ReactNode): Row {
    return { field, description, tags, glossaryterms, edit };
}



export default function CatalogsBody(props: any) {
    const { layoutList } = useSelector((state: RootState) => state.catalogApi);
    const [open2, setOpen2]: any = useState(false);

    const handleClickOpen = () => {
        setOpen2(true);
    }

    const handleClose1 = () => {
        setOpen2(false);
    };


    const actionFn = () => {
    }
    const createNewFn = () => {
        // navigate("/all-projects/new");
    };
    return (
        <>

            <Stack direction={'row'} spacing={1}>
                <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: '4px', border: '1px solid lightgrey' }} elevation={0}>
                    <Stack sx={{ p: '16px' }}>
                        <Stack direction={'row'} justifyContent={'space-between'} >
                            <Typography variant='h6' fontWeight={'bold'}>{layoutList[0].data_src_lyt_name}</Typography>
                            <Typography color={'black'} fontSize={'15px'} onClick={handleClickOpen} sx={{ textDecoration: 'underline' }}>Show All</Typography>
                            <ShowAll open2={open2} handleClose1={handleClose1} />
                        </Stack>
                        <TableContainer sx={{ maxHeight: 800 }}>
                            <FlexibleTable
                                data={layoutList[0].layout_fields}
                                columns={catalogColumns}
                                itemsPerPageOptions={[5, 10, 20]}
                                defaultItemsPerPage={10}
                                isSearch={false}
                                createNewFn={createNewFn}
                                actionFn={actionFn}
                                background='bg-green-700'
                            />
                        </TableContainer>


                    </Stack>
                </Paper>
                <Paper sx={{ width: '25%', overflow: 'hidden', borderRadius: '4px', border: '1px solid lightgrey' }} elevation={0}>
                    <About />
                </Paper>

            </Stack>
        </>
    );
}