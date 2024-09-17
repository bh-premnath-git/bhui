import { Box, Grid, IconButton, InputAdornment, MenuItem, Popover, Select, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField, Typography, styled, tableCellClasses } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import React, { useEffect, useState } from "react";
import Button from '@mui/material/Button';
import { motion } from 'framer-motion';
// import styled from "@emotion/styled";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Link, useNavigate } from 'react-router-dom';
import Divider from '@mui/material/Divider';
import ApiService from "../../Services/ApiServices";
import { Field, Form, Formik } from "formik";
import * as Yup from 'yup';
import { BiSolidSearchAlt2 } from "react-icons/bi";
import DateDisplay from "../../components/DateDisplay";





const validationSchema = Yup.object().shape({
    bh_project_id: Yup.string(),
    delivery_name: Yup.string(),
    customer_id: Yup.string(),
    // selectedTag: Yup.string(),
});
const CustomPlaceholder = styled(MenuItem)(({ theme }) => ({
    fontFamily: 'Inter !important', // Replace 'YourFontFamily' with the desired font family
    color: theme.palette.text.disabled,
  }));


export default function PublishData() {
    const [anchorEl, setAnchorEl] = useState(null);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [openAddLink, setOpenAddLink] = useState(false);
    const [selectedOption, setSelectedOption]: any = useState([])
    const [publishData, setPublishData]: any = useState()
    const [optionValue, setOptionValue]: any = useState([])
    const [optionTagValue, setOptionTagValue]: any = useState([])
    const [publishDataList, setPublishDataList]: any = useState([]);
    const [projects, setProjects]: any = useState([]);
    const [formValues, setFormValues] = useState({
        bh_project_id: '',
        delivery_name: '',
        customer_id: ''
    });
    const navigate = useNavigate();
    const handleChangePage = (newPage: any) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: any) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };
    const handleOpen = (event: any) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };
    const open = Boolean(anchorEl);
    const id = open ? 'popup' : undefined;
    const openLinkDialog = () => {
        console.log(publishData)
        navigate('/Designer/targetsteps', { state: { 'step': 0, 'id': publishData.publish_id } });
        setOpenAddLink(true)
    };

    const clonePublishData = async () => {
        console.log(publishData)
        publishData.publish_id = null;
        console.log(publishData)
        var result = await ApiService('8011', 'post', `/publish_data/publish_details`, publishData);
        if (result) {
            fetchDeliveryName({ offset: 0, limit: 100 });
            handleClose()
        }

    }

    const handleProjectChange = (event) => {
        setFormValues({ ...formValues, bh_project_id: event.target.value });
    };

    const handleJobTypeChange = (event) => {
        setFormValues({ ...formValues, delivery_name: event.target.value });
    };

    const handlePipelineChange = (event) => {
        setFormValues({ ...formValues, customer_id: event.target.value });
    };

    // const handleTagChange = (event) => {
    //     setFormValues({ ...formValues, selectedTag: event.target.value });
    // };

    // const handleSearchChange = (event) => {
    //     setFormValues({ ...formValues, searchValue: event.target.value });
    // };

    const handleSubmit = (values: any) => {
        console.log('Form Submitted', values);
        values.offset = 0;
        values.limit = 60;
        fetchDeliveryName(values);
    };
    useEffect(() => {

        fetchProject();
        // fetchDataSourceTag()
        fetchConsumer()
        fetchDeliveryName({ offset: 0, limit: 60 })

    }, []);

    const fetchConsumer = async () => {
        const params = {}
        console.log(params)
        try {
            const result = await ApiService('8011', 'get', '/customer/search', null, params);
            console.log(result)
            setSelectedOption(result)
        }
        catch (error) {
            console.error('Error fetching Status', error);

        }
    }
    const fetchDeliveryName = async (params) => {

        console.log(params)
        try {
            const result = await ApiService('8011', 'get', '/publish_data/publish_details/list/', null, params);
            console.log(result);
            setOptionValue(result)
            setOptionTagValue(result)
            if (result) {
                setPublishDataList(result)
            } else {
                setPublishDataList([])
            }
        }
        catch (error) {
            console.error('Error fetching Status', error);
        }
    }


    const fetchProject = async () => {
        const params = { ...projects }
        try {
            const result = await ApiService('8011', 'get', '/bh_project/search', null, params);
            console.log(result)
            const projectOptions = result.map((project) => ({
                label: project.bh_project_name,
                value: project.bh_project_id,
            }));
            setProjects(projectOptions)
        }
        catch (error) {
            console.error('Error fetching Status', error);

        }
    }
    function handleData(data: any) {
        setPublishData(data);
    }
    useEffect(() => {

    }, [publishData])
    return (

        <Stack >
            <Formik
                initialValues={formValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ values, handleChange, handleBlur }) => (
                    <Form>
                        <Stack direction="row" justifyContent={'space-between'}>
                            <Stack direction={'row'} justifyContent={'space-between'} spacing={3}>
                                <Stack sx={{ width: '25ch' }}>
                                    <Typography className='text-start myHeadFont' sx={{ py: 1, fontWeight: 'bold' }}>Project Name</Typography>
                                    <Field
                                        as={Select}
                                        name="bh_project_id"
                                        value={values.bh_project_id}
                                        onChange={(e) => {
                                            handleChange(e);
                                            handleProjectChange(e);
                                        }}
                                        onBlur={handleBlur}
                                        displayEmpty
                                        className="rounded shadow-sm"
                                        sx={{
                                            '& .MuiSelect-select': {
                                              fontFamily: 'Inter !important', // Apply font family to the select component
                                            },
                                          }}
                                        >
                                          <CustomPlaceholder value="" disabled>
                                            Select Project Name
                                          </CustomPlaceholder>
                                        {projects?.map((item: any, index: number) => (
                                            <MenuItem key={index} value={item?.value}>{item?.label}</MenuItem>))}
                                    </Field>
                                </Stack>
                                <Stack sx={{ width: '25ch' }}>
                                    <Typography sx={{ py: 1, fontWeight: 'bold' }} className='text-start myHeadFont'>Delivery Name</Typography>
                                    <Field
                                        as={Select}
                                        name="delivery_name"
                                        value={values.delivery_name}
                                        onChange={(e) => {
                                            handleChange(e);
                                            handleJobTypeChange(e);
                                        }}
                                        onBlur={handleBlur}
                                        displayEmpty
                                        className="rounded shadow-sm"
                                        sx={{
                                            '& .MuiSelect-select': {
                                              fontFamily: 'Inter !important', // Apply font family to the select component
                                            },
                                          }}
                                    >
                                        <CustomPlaceholder value="" disabled>
                                            Select Delivery Name
                                        </CustomPlaceholder>
                                        {optionValue?.map((item: any, index: number) => (
                                            <MenuItem value={item?.delivery_name} key={index}>{item?.delivery_name}</MenuItem>
                                        ))}
                                    </Field>
                                </Stack>
                                <Stack sx={{ width: '25ch' }}>
                                    <Typography sx={{ py: 1, fontWeight: 'bold' }} className='text-start myHeadFont'>Customer Name</Typography>
                                    <Field
                                        as={Select}
                                        name="customer_id"
                                        value={values.customer_id}
                                        onChange={(e) => {
                                            handleChange(e);
                                            handlePipelineChange(e);
                                        }}
                                        onBlur={handleBlur}
                                        displayEmpty
                                        className="rounded shadow-sm"
                                        sx={{
                                            '& .MuiSelect-select': {
                                              fontFamily: 'Inter !important', // Apply font family to the select component
                                            },
                                          }}
                                    >
                                        <CustomPlaceholder value="" disabled>
                                            Select Customer Name
                                        </CustomPlaceholder>
                                        {selectedOption?.map((item: any, index: number) => (
                                            <MenuItem key={index} value={item?.customer_id}>{item?.relation_ship_owner}</MenuItem>
                                        ))}

                                    </Field>
                                </Stack>
                                {/* <Stack sx={{ width: '25ch' }}>
                                    <Typography sx={{ py: 1, fontWeight: 'bold' }} className='text-start'>Tags</Typography>
                                    <Field
                                        as={Select}
                                        name="selectedTag"
                                        value={values.selectedTag}
                                        onChange={(e) => {
                                            handleChange(e);
                                            handleTagChange(e);
                                        }}
                                        onBlur={handleBlur}
                                        displayEmpty
                                        className="rounded shadow-sm"
                                    >
                                        <MenuItem value="" disabled>
                                            Select Tags
                                        </MenuItem>
                                        <MenuItem value="option1">Option 1</MenuItem>
                                        <MenuItem value="option2">Option 2</MenuItem>
                                        <MenuItem value="option3">Option 3</MenuItem>
                                    </Field>
                                </Stack> */}
                            </Stack>

                            <Stack direction={'row'} justifyContent={'space-between'} spacing={3}>
                                <Stack>
                                    <Stack sx={{ py: 2, mt: 1 }}></Stack>
                                    <Button className="headNt bg-dark" variant="contained" type="submit" >
                                        <BiSolidSearchAlt2 className="mx-2" /> Search
                                    </Button>
                                </Stack>
                                <Stack>
                                    <Stack sx={{ py: 2, mt: 1 }}></Stack>
                                    <Button className="headNt bg-dark " variant="contained" component={Link} to={'/Designer/targetsteps'}>
                                        Publish New Data
                                    </Button>
                                </Stack>
                            </Stack>
                        </Stack>
                    </Form>
                )}
            </Formik>
            {publishDataList.length > 0 ? (<TableContainer sx={{ py: 3 }}>
                <Table sx={{ border: '1px solid #f2f2f8' }} aria-label="simple table">
                    <TableHead sx={{ backgroundColor: '#f2f2f8' }}>
                        <TableRow >
                            <TableCell sx={{ fontWeight: 'bold', borderBottom: '1px solid #f2f2f8' }} className="myHeadFont">Project Name</TableCell>
                            <TableCell align="left" sx={{ fontWeight: 'bold', borderBottom: '1px solid #f2f2f8' }} className="myHeadFont">Delivery Name</TableCell>
                            <TableCell align="left" sx={{ fontWeight: 'bold', borderBottom: '1px solid #f2f2f8' }} className="myHeadFont">Customer Name</TableCell>
                            <TableCell align="left" sx={{ fontWeight: 'bold', borderBottom: '1px solid #f2f2f8' }} className="myHeadFont">Last Published On</TableCell>
                            <TableCell align="left" sx={{ fontWeight: 'bold', borderBottom: '1px solid #f2f2f8' }} className="myHeadFont">Created By</TableCell>
                            <TableCell align="left" sx={{ fontWeight: 'bold', borderBottom: '1px solid #f2f2f8' }} className="myHeadFont">Tags</TableCell>
                            <TableCell align="left" sx={{ fontWeight: 'bold', borderBottom: '1px solid #f2f2f8' }} className="myHeadFont">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {publishDataList?.map((row: any, index) => (
                            <TableRow
                                key={index}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 }, border: '1px solid #f2f2f8' }}
                            >
                                <TableCell component="th" scope="row" sx={{ borderBottom: '1px solid #f2f2f8' }} className="myFont">
                                    Demo
                                </TableCell>
                                <TableCell align="left" sx={{ borderBottom: '1px solid #f2f2f8' }} className="myFont">{row?.delivery_name}</TableCell>
                                <TableCell align="left" sx={{ borderBottom: '1px solid #f2f2f8' }} className="myFont">SWOMB</TableCell>
                                <TableCell align="left" sx={{ borderBottom: '1px solid #f2f2f8' }} className="myFont"><DateDisplay dateString={row.updated_at} /></TableCell>
                                <TableCell align="left" sx={{ borderBottom: '1px solid #f2f2f8' }} className="myFont">{row.created_by}</TableCell>
                                <TableCell align="left" sx={{ borderBottom: '1px solid #f2f2f8' }} className="myFont">
                                    {row?.tag?.tag ? (<Grid container spacing={2}>
                                        {row?.tag?.tag?.map((item: any, index) => (
                                            <Grid item key={index}>
                                                <Box sx={{ bgcolor: '#d0f4e8', textAlign: 'start', pr: '8px', py: '2px', borderRadius: '5px' }}>
                                                    <Typography className="px-2 myFont">{item?.key} {'>>'} {item?.value}</Typography>
                                                </Box>
                                            </Grid>
                                        ))}
                                    </Grid>) : (
                                        <Grid container spacing={2}>
                                            {[1].map((item, index) => (
                                                <Grid key={index}>
                                                    <Box sx={{ bgcolor: '#d0f4e8', textAlign: 'start', pr: '8px', py: '2px', borderRadius: '5px' }}>
                                                        <Typography className="px-2 myFont" sx={{ fontWeight: '500', color: 'black' }}>Tag Not Added</Typography>
                                                    </Box>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    )}
                                </TableCell>
                                <TableCell align="left" sx={{ borderBottom: '1px solid #f2f2f8' }} className="myFont"><IconButton onClick={(event) => { handleOpen(event); handleData(row); }}>
                                    <MoreVertIcon />
                                </IconButton></TableCell>



                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

            </TableContainer>) : (
                <div className="text-center my-5">
                    <img src="/assets/userlanding/Layer 34.png" alt="" width={150} />
                    <div className="my-4 h6 text-dark">Published Data Not Found !</div>
                </div>
            )}
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
                <Button sx={{ my: 1, mx: 1, color: 'black' }} onClick={openLinkDialog}>
                    Edit
                </Button><br />
                <Divider sx={{ color: 'grey' }} />
                <Button sx={{ mx: 1, color: 'black' }} onClick={clonePublishData} >Clone</Button><br />
                <Divider sx={{ color: 'grey' }} />
                <Button sx={{ mx: 1, color: 'black' }}>Disable</Button><br />

            </Popover>
            {publishDataList.length > 0 && (<TablePagination
                rowsPerPageOptions={[10, 25, 100]}
                component="div"
                count={publishDataList.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />)}
        </Stack>


    );
}