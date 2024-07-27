import { Button, TextField, Typography, Stack } from '@mui/material';
import { useEffect, useState } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import dayjs from 'dayjs';
import { DatePicker } from 'antd';
 
const { RangePicker } = DatePicker;


const validationSchema = Yup.object({
    project_name: Yup.string(),
    source_id: Yup.string(),
    start_date: Yup.date(),
    end_date: Yup.date(),
    alert_status: Yup.string(),
});

function AlertTableHead({ filterOption, status, fetchJobDetails }) {
    const [show, setShow] = useState(false);
    const projectList = filterOption?.projectData;
    const pipeLineList = filterOption?.pipeLineData;
    const navigate = useNavigate();

    const monitorPageDetails = () => {
        navigate('/Alerts/New Monitor');
    };

    useEffect(() => {
        console.log(projectList);
        console.log(filterOption);
    }, []);
    const [selectedvalue, setSelectedValue] = useState<any>({
        'project_name': null,
        'source_id': null,
        'start_date': null,
        'end_date': null,
        'alert_status': null
    })
    const updateSelectedValue = (field, value) => {
        setSelectedValue((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    }
    const handleDateChange = (dates, dateStrings) => {
        updateSelectedValue('start_date', dateStrings[0]);
        updateSelectedValue('end_date', dateStrings[1]);
    };

    return (
        <Formik
            initialValues={{
                project_name: '',
                source_id: '',
                start_date: '',
                end_date: '',
                alert_status: ''
            }}
            validationSchema={validationSchema}
            onSubmit={(values) => {
                const filteredValues = Object.fromEntries(
                    Object.entries(values).filter(([key, value]) => value !== '')
                );
                console.log(filteredValues);
                fetchJobDetails(filteredValues)
            }}
        >
            {({ values, errors, touched, setFieldValue }) => (
                <Form>
                    <Stack direction={'row'} justifyContent={'space-between'}>
                        <Stack direction={'row'} spacing={2} my={3}>
                            <Stack className='text-start'>
                                <Typography className='text-start' fontWeight={'bold'} fontSize={16} my={1}>Project</Typography>
                                <Autocomplete
                                    disablePortal
                                    options={projectList || []} // Ensure projectList is an array
                                    sx={{ width: 200 }}
                                    getOptionLabel={(option: any) => option.project_name}
                                    onChange={(event, newValue) => setFieldValue('project_name', newValue ? newValue.project_name : '')}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            placeholder='Select Project'
                                            error={touched.project_name && Boolean(errors.project_name)}
                                            helperText={touched.project_name && errors.project_name}
                                            InputProps={{
                                                ...params.InputProps,
                                                sx: {
                                                    '& input::placeholder': {
                                                      fontFamily: 'Inter', // Change to your custom font family
                                                    },
                                                  },
                                                endAdornment: (
                                                    <>
                                                        {params.InputProps.endAdornment}
                                                    </>
                                                )
                                            }}
                                        />
                                    )}
                                />
                            </Stack>

                            <Stack>
                                <Typography fontWeight={'bold'} className='text-start' fontSize={16} my={1}>Source</Typography>
                                <Autocomplete
                                    disablePortal
                                    options={pipeLineList || []}
                                    sx={{ width: 200 }}
                                    getOptionLabel={(option: any) => option.source_name}
                                    onChange={(event, newValue) => setFieldValue('source_id', newValue ? newValue.source_id : '')}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            placeholder='Select Source'
                                            error={touched.source_id && Boolean(errors.source_id)}
                                            helperText={touched.source_id && errors.source_id}
                                            InputProps={{
                                                ...params.InputProps,
                                                sx: {
                                                    '& input::placeholder': {
                                                      fontFamily: 'Inter', // Change to your custom font family
                                                    },
                                                  },
                                                endAdornment: (
                                                    <>
                                                        {params.InputProps.endAdornment}
                                                    </>
                                                )
                                            }}
                                        />
                                    )}
                                />
                            </Stack>

                            {/* <Stack>
                                <Typography fontWeight={'bold'} className='text-start' fontSize={16} my={1}>Start Date</Typography>
                                <TextField
                                    type="date"
                                    id="start_date"
                                    name="start_date"
                                    value={values.start_date}
                                    onChange={(event) => setFieldValue('start_date', event.target.value)}
                                    error={touched.start_date && Boolean(errors.start_date)}
                                    helperText={touched.start_date && errors.start_date}
                                />
                            </Stack>
                            <Stack>
                                <Typography fontWeight={'bold'} className='text-start' fontSize={16} my={1}>End Date</Typography>
                                <TextField
                                    type="date"
                                    id="end_date"
                                    name="end_date"
                                    value={values.end_date}
                                    onChange={(event) => setFieldValue('end_date', event.target.value)}
                                    error={touched.end_date && Boolean(errors.end_date)}
                                    helperText={touched.end_date && errors.end_date}
                                />
                            </Stack> */}
                            <Stack spacing={2}>
                                <Stack>
                                    <Typography fontWeight={'bold'} className='text-start' fontFamily={'Inter'} fontSize={16} my={1}>
                                        Start {'&'} End Date
                                    </Typography>
                                    <RangePicker size='large'
                                        style={{ minWidth: "100px", maxWidth: '310px',minHeight:'56px',borderRadius:'4px' }}
                                        className='myFont border-1'
                                        value={[
                                            selectedvalue.start_date ? dayjs(selectedvalue.start_date) : null,
                                            selectedvalue.end_date ? dayjs(selectedvalue.end_date) : null
                                        ]}
                                        format="DD/MM/YYYY"
                                        onChange={handleDateChange}
                                    />
                                </Stack>
                            </Stack>
                            <Stack>
                                <Typography fontWeight={'bold'} className='text-start' fontSize={16} my={1}>Status</Typography>
                                <Autocomplete
                                    disablePortal
                                    options={status || []}
                                    sx={{ width: 200 }}
                                    getOptionLabel={(option: any) => option.dtl_desc}
                                    onChange={(event, newValue) => setFieldValue('alert_status', newValue ? newValue.id : '')}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            placeholder='Select Status'
                                            error={touched.alert_status && Boolean(errors.alert_status)}
                                            helperText={touched.alert_status && errors.alert_status}
                                            InputProps={{
                                                ...params.InputProps,
                                                sx: {
                                                    '& input::placeholder': {
                                                      fontFamily: 'Inter', // Change to your custom font family
                                                    },
                                                  },
                                                endAdornment: (
                                                    <>
                                                        {params.InputProps.endAdornment}
                                                    </>
                                                )
                                            }}
                                        />
                                    )}
                                />
                            </Stack>
                        </Stack>
                        <Stack direction={'row'} spacing={2} mt={7}>
                            <Stack >
                                <Button variant="contained" sx={{
                                    bgcolor: 'black', color: 'white', py: 1, textTransform: 'none',fontFamily:'Inter', '&:hover': {
                                        bgcolor: 'black',
                                    }
                                }} type='submit'>
                                    Search
                                </Button>

                            </Stack>

                            <Stack >
                                <Button variant="contained" sx={{
                                    bgcolor: 'black', color: 'white', py: 1, textTransform: 'none',fontFamily:'Inter', '&:hover': {
                                        bgcolor: 'black',
                                    }
                                }} onClick={monitorPageDetails}>
                                    New Monitor
                                </Button>

                            </Stack>
                        </Stack>
                    </Stack>
                </Form>
            )}
        </Formik>
    );
}

export default AlertTableHead;
