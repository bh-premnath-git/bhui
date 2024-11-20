import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import {
    Box, Typography, Stack, Popover, Button,
    Dialog, DialogTitle, DialogContent,
    DialogContentText, DialogActions, TextField, Chip, Divider,
    hexToRgb
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import IconButton from '@mui/material/IconButton';
import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { useEffect } from 'react';
import {ApiService} from '@/services/apiServices';
import { formatDate } from '../../Utils/dateFormatter';

interface Column {
    id: 'project' | 'pipeline' | 'type' | 'details' | 'time' | 'status' | 'runstatus' | 'action';
    label: string;
    minWidth?: number;
    align?: 'left';
    format?: (value: number) => string;
}

const columns: readonly Column[] = [
    { id: 'project', label: 'Project Name', minWidth: 170, },
    { id: 'pipeline', label: 'Pipeline Name', minWidth: 100 },
    {
        id: 'type',
        label: 'Type',
        minWidth: 100,
        align: 'left',
        // format: (value: number) => value.toLocaleString('en-US'),
    },
    {
        id: 'details',
        label: 'Details',
        minWidth: 200,
        align: 'left',
        format: (value: number) => value.toLocaleString('en-US'),
    },
    {
        id: 'time',
        label: 'Timestamp',
        minWidth: 120,
        align: 'left',
        // format: (value: number) => value.toFixed(2),
    },
    {
        id: 'status',
        label: 'Status',
        minWidth: 120,
        align: 'left',
        // format: (value: number) => value.toFixed(2),
    },
    // {
    //     id: 'runstatus',
    //     label: 'Run Status',
    //     minWidth: 250,
    //     align: 'left',
    //     // format: (value: number) => value.toFixed(2),
    // },
    {
        id: 'action',
        label: 'Action',
        minWidth: 170,
        align: 'left',
        // format: (value: number) => value.toFixed(2),
    },
];

interface Data {
    project: string;
    pipeline: string;
    type: number;
    details: number;
    time: any;
    status: any;
    runstatus: any;
    action: any;
}


const validationSchemaLink = Yup.object({
    label: Yup.string().required('User Name is required'),
});

export default function AlertTableDtl({ jobDetailList }: any) {
    const [anchorEl, setAnchorEl] = useState(null);
    const [openAddLink, setOpenAddLink] = useState(false);

    const [jobDetail, setJobDetail] = useState();
    const [codesDtl, setCodesDtl]: any = useState(localStorage.getItem('codesDtl'));

    const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'popup' : undefined;
    const openLinkDialog = () => {
        setOpenAddLink(true)
    };
    const closeLinkDialog = () => {
        setOpenAddLink(false)
    }
    const colors = [
        { bgcolor: '#07a260', color: '#ffff' },
        { bgcolor: '#f7a01f', color: '#ffff' },
        { bgcolor: '#0198d7', color: '#ffff' },
        { bgcolor: '#05aaad', color: '#ffff' },
        { bgcolor: '#c049c0', color: '#ffff' },
    ];
    function findValue(value: any) {
        var data = JSON.parse(codesDtl)
        if (Array.isArray(data)) {
            var filteredData: any = data.find(code => code.id.toString() === value.toString());
            return filteredData?.dtl_desc.toString()
        } else {
            console.error('data is not an array.');
            return ''

        }

    }
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };
    const linkSubmit = (values: any, { setSubmitting }: any) => {
        console.log('Form values:', values);
        setSubmitting(false);
        setOpenAddLink(false);

    };

    return (
        <>
            <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: '1px' }}>
                <TableContainer sx={{ maxHeight: 440 }}>
                    <Table stickyHeader aria-label="sticky table">
                        <TableHead >
                            <TableRow >
                                {columns.map((column) => (
                                    <TableCell className='myHeadFont text-bold text-lg'
                                        key={column.id}
                                        align={column.align}
                                        style={{ minWidth: column.minWidth, backgroundColor: '#f2f2f8', fontSize: '16px' }}
                                    >
                                        {column.label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {jobDetailList?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((row: any, index: any) => (
                                    <TableRow key={index} hover role="checkbox" tabIndex={-1}>
                                        <TableCell
                                            className="myFont"
                                            sx={{ borderBottom: '1px solid #f2f3f5', padding: '3px' }} // Reduced padding
                                        >
                                            {row?.project_name}
                                        </TableCell>
                                        <TableCell
                                            className="myFont"
                                            sx={{ borderBottom: '1px solid #f2f3f5', padding: '4px' }} // Reduced padding
                                        >
                                            {row?.source_name}
                                        </TableCell>
                                        <TableCell
                                            className="myFont"
                                            sx={{ borderBottom: '1px solid #f2f3f5', padding: '4px' }} // Reduced padding
                                        >
                                            <span
                                                className="p-2 m-0" // Removed w-10 to set a consistent width using style
                                                style={{
                                                    display: 'inline-block', // Ensure it's treated as a block-level element for consistent width
                                                    width: '200px', // Set the desired consistent width
                                                    color: colors[index]?.color || '#e82cc8',
                                                    backgroundColor: colors[index % 6]?.bgcolor || '#2c2c2c', // 
                                                    textAlign: 'center', // Center the text inside the span
                                                    borderRadius: '4px', // Optional: Rounded corners for a better look
                                                }}
                                            >
                                                {row?.monitor?.monitor_template_data?.monitor_template_name}
                                            </span>
                                        </TableCell>

                                        <TableCell
                                            className="myFont"
                                            sx={{ borderBottom: '1px solid #f2f3f5', padding: '4px' }} // Reduced padding
                                        >
                                            {row?.alert_description}
                                        </TableCell>
                                        <TableCell
                                            className="myFont"
                                            sx={{ borderBottom: '1px solid #f2f3f5', padding: '4px' }} // Reduced padding
                                        >
                                            {formatDate(row?.created_on)}
                                        </TableCell>
                                        <TableCell
                                            className="myFont"
                                            sx={{ borderBottom: '1px solid #f2f3f5', padding: '4px' }} // Reduced padding
                                        >
                                            <span className="p-2 rounded" style={{ color: row?.monitor?.status == "active" ? 'green' : "gray" }}>{row?.monitor?.status == "active" ? "Open" : "Closed"}</span>
                                        </TableCell>

                                        <TableCell
                                            className="myFont"
                                            sx={{ borderBottom: '1px solid #f2f3f5', padding: '4px' }} // Reduced padding
                                        >
                                            <IconButton onClick={handleOpen}>
                                                <MoreVertIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>

                    </Table>
                </TableContainer>
                <Popover
                    elevation={1}
                    id={id}
                    open={open}
                    anchorEl={anchorEl}
                    onClose={handleClose}
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
                    <Button sx={{ my: 1, mx: 1 }} onClick={openLinkDialog}>
                        Acknowledge Alert
                    </Button><br />
                    <Button sx={{ mx: 1 }}>Close Alert</Button><br />

                </Popover>
                <Dialog open={openAddLink} onClose={closeLinkDialog} PaperProps={{ sx: { borderRadius: '2px' } }}>
                    <DialogTitle px={2}>Acknowledge Alert</DialogTitle>
                    <DialogContent sx={{ width: '100%', height: '400px' }} >
                        <Formik
                            initialValues={{ url: '', label: '' }}
                            validationSchema={validationSchemaLink}
                            onSubmit={linkSubmit}
                        >
                            {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
                                <Form style={{ textAlign: 'center' }}>
                                    <div>
                                        <div style={{ paddingTop: '2px', paddingBottom: '8px', textAlign: 'start', paddingLeft: '3px', fontSize: '12px' }}>
                                            <label htmlFor="url">Are you sure you want to acknowledge Alert? If yes,please provide comment below.</label>
                                        </div>
                                        <Field type="text" id="comment" name="comment" placeholder="Type your comment here" multiline rows={5} as={TextField} sx={{
                                            width: '100%',
                                        }} />

                                    </div>

                                    <div>
                                        <div style={{ paddingTop: '14px', paddingBottom: '8px', textAlign: 'start', paddingLeft: '3px', fontSize: '14px' }}>
                                            <label className='py-12 my-12' htmlFor="label">Assign User<span style={{ color: 'red' }}>*</span></label>

                                        </div>
                                        <Field type="text" id="label" name="label" placeholder="Enter User Name" as={TextField} sx={{ width: '100%' }} />
                                        <div style={{ color: 'red', textAlign: 'start', paddingLeft: '21px' }}>
                                            <ErrorMessage name="label" component="div" />
                                        </div>
                                    </div>
                                    <Stack direction={"row"} spacing={1} sx={{ mt: 2 }}>
                                        <Stack>
                                            <AddCircleIcon sx={{ color: '#42CD3F', mt: 1 }} />
                                        </Stack>
                                        <Stack>
                                            <Button onClick={openLinkDialog}>
                                                <Typography variant='subtitle1' fontWeight={"bold"} sx={{ color: '#42CD3F', }} >
                                                    ADD ATTACHMENTS
                                                </Typography>
                                            </Button>
                                        </Stack>
                                    </Stack>


                                    <DialogActions sx={{ mt: 4, justifyContent: 'center', }} >

                                        <Button onClick={closeLinkDialog} variant="outlined"
                                            size="large" sx={{ width: '25%', bgcolor: 'white', borderColor: 'black' }}  >Close</Button>
                                        <Button type='submit' variant="contained"
                                            color="secondary"
                                            size="large" sx={{ width: '50%' }}>Acknowledge Alert</Button>
                                        {/* disabled={!values.tagKey || !values.tagValue} */}
                                    </DialogActions>
                                </Form>
                            )}
                        </Formik>
                    </DialogContent>
                </Dialog>

            </Paper>
            <TablePagination
                rowsPerPageOptions={[10, 25, 100]}
                component="div"
                count={jobDetailList.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </>
    );
}