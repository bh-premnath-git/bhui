import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { Button, Divider, IconButton, Popover, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close'; // Import CloseIcon
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { LuCalendarDays } from "react-icons/lu";
import { BsChatDots } from "react-icons/bs";
import { AnyNode } from 'postcss';
import { FlexibleTable } from '@/components/Tabel';
import { catalogColumns } from '@/features/catalogColumn';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';


interface ShowAllProps {
    open2: boolean;
    handleClose1: () => void;


}
interface Column {
    id: string;
    label: string;
    align: 'left' | 'right' | 'center';
    format?: (value: React.ReactNode) => React.ReactNode;
}

interface Row {
    [key: string]: React.ReactNode;
}


const columns: Column[] = [
    { id: 'field', label: 'Field', align: 'left' },
    { id: 'description', label: 'Description', align: 'left' },
    { id: 'tags', label: 'Tags', align: 'left' },
    { id: 'glossaryterms', label: 'Glossary Terms', align: 'center' },
    { id: 'edit', label: ' ', align: 'center', },

];

const ShowAll: React.FC<ShowAllProps> = ({ open2, handleClose1 }) => {
    const { layoutList } = useSelector((state: RootState) => state.catalogApi);

    const [codesDtl, setCodesDtl] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(2);
    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = (event: any) => {
        setAnchorEl(event.currentTarget);
    };



    const handleClose2 = () => {
        setAnchorEl(null);
    };

    const open1 = Boolean(anchorEl);
    const id = open1 ? 'simple-popover' : undefined;


    const handleClose = () => {
        handleClose1();

    };
   
    const actionFn = () => {
    }
    const createNewFn = () => {
        // navigate("/all-projects/new");
    };

    return (


        <Dialog open={open2} onClose={handleClose} maxWidth="xl" fullWidth sx={{ minHeight: '100vh' }}>
            <DialogTitle>
                {layoutList[0].data_src_lyt_name}
                <IconButton
                    edge="end"
                    color="inherit"
                    onClick={handleClose1}
                    aria-label="close"
                    sx={{ position: 'absolute', right: 15, top: 0 }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    <TableContainer sx={{ minHeight: 800 }}>
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

                    {/* <Popover
                        elevation={1}
                        id={id}
                        open={open1}
                        anchorEl={anchorEl}
                        onClose={handleClose2}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                    // sx={{ width: 300 }}
                    >
                        <Button sx={{ my: 1, mx: 1, color: 'black', textTransform: 'none' }}  >
                            Edit Description
                        </Button><br />
                        <Divider sx={{ color: 'black' }} />
                        <Button sx={{ mx: 1, color: 'black', textTransform: 'none' }} >Add Tag</Button><br />
                        <Divider sx={{ color: 'black' }} />
                        <Button sx={{ mx: 1, color: 'black', textTransform: 'none' }} >Add Term</Button><br />

                    </Popover> */}



                </DialogContentText>
            </DialogContent>

        </Dialog>

    );
};

export default ShowAll;
