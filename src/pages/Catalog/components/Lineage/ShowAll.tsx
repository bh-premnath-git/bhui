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


interface ShowAllProps {
    open2: boolean;
    handleClose1: () => void;
    data: any;
    dataSourceList: any;


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

const ShowAll: React.FC<ShowAllProps> = ({ open2, handleClose1, data, dataSourceList }) => {
    const [codesDtl, setCodesDtl] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(2);
    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };



    const handleClose2 = () => {
        setAnchorEl(null);
    };

    const open1 = Boolean(anchorEl);
    const id = open1 ? 'simple-popover' : undefined;

    // const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    //     setPage(newPage);
    // };

    // const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    //     setRowsPerPage(+event.target.value);
    //     setPage(0);
    // };

    const handleClose = () => {
        handleClose1();

    };
    const getItem = async () => {
        var value: any = await localStorage.getItem('codesDtl');
        setCodesDtl(JSON.parse(value))
        // console.log(value);
    };
    React.useEffect(() => {
        getItem();
    }, []);
    function findEnv(value: any) {
        // console.log(value)
        if (Array.isArray(codesDtl)) {
            var filteredData: any = codesDtl.find((code: any) => code.id.toString() === value?.toString());
            // console.log(filteredData)
            return filteredData?.dtl_desc.toString()
        } else {
            console.error('codesDtl is not an array.');
            return ''

        }

    }
    console.log(dataSourceList)

    return (


        <Dialog open={open2} onClose={handleClose} maxWidth="lg" fullWidth sx={{ minHeight: '100vh' }}>
            <DialogTitle>
                {data.data_src_name}
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
                    <TableContainer sx={{ maxHeight: 800 }}>
                        <Table stickyHeader aria-label="sticky table" style={{ border: '1px solid #f2f3f5' }} >
                            <TableHead >
                                <TableRow>
                                    {columns.map((column) => (

                                        <TableCell
                                            key={column.id}
                                            align={column.align}
                                            sx={{ backgroundColor: '#f2f2f8', color: 'black', fontSize: 'medium', fontWeight: "500" }}
                                        >
                                            {column.label}


                                        </TableCell>

                                    ))}

                                </TableRow>
                            </TableHead>
                            <TableBody >

                                {dataSourceList[0]?.layout_fields.map((row: any, index: any) => {
                                    return (
                                        <TableRow className='pt-1 ' key={index} hover role="checkbox" tabIndex={-1}  >

                                            <TableCell align="left" className='pt-1  my-2' style={{ borderBottom: '1px solid #f2f3f5' }}>
                                                <Stack direction="row" spacing={2}>
                                                    <Typography variant='body1' sx={{ fontSize: '15px', py: '2px' }}>{row?.lyt_fld_name}</Typography>
                                                    <Typography variant='body2' sx={{ padding: '4px', background: '#f2f3f5', borderRadius: '2px' }}><LuCalendarDays /></Typography>
                                                    <Typography variant='body2' sx={{ padding: '4px', background: '#f2f3f5', borderRadius: '2px' }}><BsChatDots /></Typography>

                                                </Stack>
                                            </TableCell>
                                            <TableCell align="left" className='pt-1  my-2' style={{ borderBottom: '1px solid #f2f3f5' }}>{row?.lyt_fld_desc}
                                            </TableCell>
                                            <TableCell align="left" className='pt-1  my-2' style={{ borderBottom: '1px solid #f2f3f5' }}>
                                                {
                                                    data.data_src_tags?.tagList?.map((tag: any) => (
                                                        <Typography variant='body2' sx={{
                                                            p: '5px', backgroundColor: 'aliceblue', borderRadius: '4px', width: '80%'
                                                        }}>{tag.tagKey} {'>>'} {tag.value}</Typography>
                                                    ))
                                                }

                                            </TableCell>
                                            <TableCell align="center" className='pt-1  my-2' style={{ borderBottom: '1px solid #f2f3f5' }}>Glossary Term 1</TableCell>
                                            <TableCell align="center" className='pt-1  my-2' style={{ borderBottom: '1px solid #f2f3f5' }}><MoreVertIcon onClick={handleClick} /></TableCell>

                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    {/* <TablePagination
                        rowsPerPageOptions={[10, 50, 100]}
                        component="div"
                        count={dataSourceList[0]?.layout_fields?.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    /> */}
                    <Popover
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

                    </Popover>



                </DialogContentText>
            </DialogContent>

        </Dialog>

    );
};

export default ShowAll;
