import {
    FormControl, FormControlLabel, TextField, Radio,
    RadioGroup, Paper, TableContainer, Table,
    TableHead, TableRow, TableCell, TableBody, Typography,
    Stack, Box, Button
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Field, Form, Formik } from 'formik';
import * as yup from 'yup';
import { green } from '@mui/material/colors';
import ApiService from '../../Services/ApiServices';

const validationSchema = yup.object().shape({
    minute: yup.number().integer().min(0).max(59),
    hours: yup.number().integer().min(0).max(23),
    dayOfMonth: yup.number().integer().min(1).max(31),
    month: yup.number().integer().min(1).max(12),
    dayOfWeek: yup.number().integer().min(0).max(6),
    scheduleOption: yup.string().required('Schedule option is required'),
});

function DeliveryScheduleStep({ handlePrivious, handleNext, publishId }) {
    const [scheduleOption, setScheduleOption] = useState([]);
    const [publishData, setPublishData]: any = useState({});
    const [initialValues, setInitialValues] = useState({
        minute: '',
        hours: '',
        dayOfMonth: '',
        month: '',
        dayOfWeek: '',
        scheduleOption: '',
    });
    const [bgColor, setBgColor] = useState('white');

    useEffect(() => {
        const getScheduleOption = async () => {
            var params = {};
            var result = await ApiService('8011', 'get', `codes_hdr/28`, params)
            console.log(result)
            if (result) {
                setScheduleOption(result?.codes_dtl);
            }
        };
        getScheduleOption()
        if (publishId) {
            getData(publishId)
        }
    }, [publishId]);

    async function getData(publishdataId) {
        var data = {};
        var result = await ApiService('8011', 'get', `/publish_data/publish_details/${publishdataId}`, data);
        if (result) {
            setPublishData(result)
            if (result?.schedule_details?.scheduleOption) {
                setInitialValues({
                    scheduleOption: result?.schedule_details?.scheduleOption,
                    minute: result?.schedule_details?.minute,
                    hours: result?.schedule_details?.hours,
                    dayOfMonth: result?.schedule_details?.dayOfMonth,
                    month: result?.schedule_details?.month,
                    dayOfWeek: result?.schedule_details?.dayOfWeek,
                })
            }
        }
        console.log(result)
    }

    async function update(data) {
        publishData.schedule_details = data;
        console.log(publishData)
        var result = await ApiService('8011', 'put', `/publish_data/publish_details/${publishId}`, publishData);
        console.log(result)
        if (result) {
            handleNext(result)
        }
    }
    const getFormattedSchedule = (values) => {
        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const monthsOfYear = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
        // Check if all values are empty or undefined
        if (!values.minute && !values.hours && !values.dayOfMonth && !values.month && !values.dayOfWeek) {
            return <span style={{ backgroundColor: 'white' }}></span>;
        }
    
        const minute = values.minute ? `${values.minute}, ` : '0';
        const hourStart = values.hours ? ` ${values.hours}:` : '';
        const dayOfMonth = values.dayOfMonth ? `on day ${values.dayOfMonth} of the month, ` : '';
        const dayOfWeek = values.dayOfWeek !== '' ? `and on ${daysOfWeek[values.dayOfWeek]}` : '';
        const month = values.month !== '' ? `only in ${monthsOfYear[values.month - 1]}` : '';
    
        let formattedSchedule = '';
    
        if (!values.dayOfMonth && !values.month && !values.dayOfWeek) {
            formattedSchedule = `At ${hourStart} ${minute}`.trim();
        } else if (!values.dayOfWeek) {
            formattedSchedule = `At ${hourStart} ${minute}${dayOfMonth}`.trim();
        } else {
            formattedSchedule = `At ${hourStart} ${minute}${dayOfMonth} ${dayOfWeek} ${month}`.trim();
        }
    
        return <span style={{ backgroundColor: '#d0f4e8' }}>{formattedSchedule}</span>;
    };
    return (
        <>
            <Stack className='m-auto'>
                <Stack spacing={4} sx={{ pt: '4%', margin: 'auto' }}>
                    <Stack>
                        <Typography variant='subtitle1' fontWeight={'bold'} sx={{ fontFamily: 'Inter !important' }}>
                            Select Any One Schedule Option
                        </Typography>

                        <Formik
                            initialValues={initialValues}
                            validationSchema={validationSchema}
                            enableReinitialize={true}
                            onSubmit={(values) => {
                                update(values)
                                console.log('Submitted values:', values);
                            }}
                        >
                            {({ values, handleChange, setFieldValue }) => (
                                <Form>
                                    <FormControl
                                        component="fieldset"
                                        className="formControl"
                                        sx={{ mt: 2, textAlign: 'left' }}
                                    >
                                        <RadioGroup
                                            aria-label="Layout Direction"
                                            className="SwombSettings-group"
                                            row
                                            name="scheduleOption"
                                            value={values.scheduleOption}
                                            onChange={(e) => {
                                                handleChange(e);
                                                setFieldValue('scheduleOption', e.target.value);
                                            }}
                                        >
                                            <br></br>
                                            {scheduleOption?.map((item: any) => (
                                                <Box border={1} sx={{ mx: 2 }} borderColor={"lightgray"} borderRadius={2} pl={1}
                                                    width={"200px"} key={item?.id}>
                                                    <FormControlLabel
                                                        value={item?.id}
                                                        control={<Radio sx={{
                                                            '&.Mui-checked': {
                                                                color: green[500],
                                                            },
                                                            '&:not(.Mui-checked)': {
                                                                color: "black",
                                                            },
                                                        }} />}
                                                        label={item?.dtl_desc}
                                                        sx={{
                                                            '& .MuiFormControlLabel-label': {
                                                                fontFamily: 'Inter !important', // Custom font for the label
                                                            },
                                                        }}

                                                    />
                                                </Box>
                                            ))}
                                        </RadioGroup>
                                    </FormControl>
                                    <br></br>

                                    {values?.scheduleOption === '2119' && (
                                        <>
                                            <Stack direction={'row'} justifyContent={'center'}>
                                                <FormControl
                                                    component="fieldset"
                                                    className="formControl"
                                                    sx={{ mt: 2, textAlign: 'left' }}
                                                >
                                                    <RadioGroup
                                                        aria-label="Layout Direction"
                                                        className="SwombSettings-group"
                                                        row
                                                        defaultValue="22"
                                                    >
                                                        <br></br>
                                                        {/* <Box border={1} borderColor={"lightgray"} borderRadius={2} pl={1} width={"200px"} ml={2}>
                                                            <FormControlLabel
                                                                key="22"
                                                                value="22"
                                                                control={<Radio sx={{
                                                                    '&.Mui-checked': {
                                                                        color: green[500],
                                                                    },
                                                                    '&:not(.Mui-checked)': {
                                                                        color: "black",
                                                                    },
                                                                }} />}
                                                                // label="Cron Expression"
                                                            />
                                                        </Box> */}
                                                    </RadioGroup>
                                                </FormControl>
                                            </Stack>

                                            <Stack >
                                                <TableContainer className='rounded' sx={{ mt: 2 }}>
                                                    <Table sx={{ minWidth: 660 }} aria-label="simple table">
                                                        <TableHead sx={{ backgroundColor: '#E5E5E5' }}>
                                                            <TableRow>
                                                                <TableCell sx={{ width: '20%' }} className='myFont'>Minute (0-59)</TableCell>
                                                                <TableCell sx={{ width: '19%' }} align="left" className='myFont'>Hours (0-23)</TableCell>
                                                                <TableCell sx={{ width: '23%' }} align="left" className='myFont'>Day Of The Month (1-31)</TableCell>
                                                                <TableCell sx={{ width: '19%' }} align="left" className='myFont'>Month (1-12)</TableCell>
                                                                <TableCell sx={{ width: '20%' }} align="left" className='myFont'>Day Of The Week (0-6)</TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            <TableRow>
                                                                <TableCell >
                                                                    <Field
                                                                        className='myFont'
                                                                        name="minute"
                                                                        as={TextField}
                                                                        placeholder="Enter Minute"
                                                                        InputProps={{ disableUnderline: true }}
                                                                        variant="standard"
                                                                        onChange={handleChange}
                                                                    />
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Field
                                                                        className='myFont'
                                                                        name="hours"
                                                                        as={TextField}
                                                                        placeholder="Enter Hours"
                                                                        InputProps={{ disableUnderline: true }}
                                                                        variant="standard"
                                                                        onChange={handleChange}
                                                                    />
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Field
                                                                        className='myFont'
                                                                        name="dayOfMonth"
                                                                        as={TextField}
                                                                        placeholder="Enter day of the month"
                                                                        InputProps={{ disableUnderline: true }}
                                                                        variant="standard"
                                                                        onChange={handleChange}
                                                                    />
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Field
                                                                        className='myFont'
                                                                        name="month"
                                                                        as={TextField}
                                                                        placeholder="Enter Month"
                                                                        InputProps={{ disableUnderline: true }}
                                                                        variant="standard"
                                                                        onChange={handleChange}
                                                                    />
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Field
                                                                        className='myFont'
                                                                        name="dayOfWeek"
                                                                        as={TextField}
                                                                        placeholder="Enter day of the week"
                                                                        InputProps={{ disableUnderline: true }}
                                                                        variant="standard"
                                                                        onChange={handleChange}
                                                                    />
                                                                </TableCell>
                                                            </TableRow>
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                                <Stack>
                                                    <Box sx={{ width: '45%', margin: 'auto', textAlign: 'center' }}>
                                                        <Stack direction={'row'} sx={{ color: '#07A260', marginTop: '5%', justifyContent: 'center', padding: '10px' }}>
                                                            {getFormattedSchedule(values)}
                                                        </Stack>
                                                    </Box>


                                                </Stack>
                                                <Stack mt={4}>
                                                    <Typography color={'inherit'} align='left' mt={2} variant='h6' sx={{fontFamily:'Inter !important'}}>
                                                        Here are some examples for you
                                                    </Typography>

                                                    <TableContainer className='shadow-sm' sx={{ mt: 2 }}>
                                                        <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                                            <TableHead sx={{ backgroundColor: '#E5E5E5' }}>
                                                                <TableRow>
                                                                    <TableCell sx={{ width: '50%' }} className='myFont'>Cron Expression</TableCell>
                                                                    <TableCell sx={{ width: '50%' }} align="left" className='myFont'>Schedule</TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                                    <TableCell component="th" scope="row">
                                                                        <Typography className='myFont'>*****</Typography><br />
                                                                        <Typography className='myFont'>0****</Typography><br />
                                                                        <Typography className='myFont'>00***</Typography><br />
                                                                        <Typography className='myFont'>00**Fri</Typography><br />
                                                                    </TableCell>
                                                                    <TableCell align="left">
                                                                        <Typography className='myFont'>Every Minute</Typography><br />
                                                                        <Typography className='myFont'>Every Hour</Typography><br />
                                                                        <Typography className='myFont'>Every Day At 12.00 AM</Typography><br />
                                                                        <Typography className='myFont'>At 12.00 AM, Only On Friday</Typography><br />
                                                                    </TableCell>
                                                                </TableRow>
                                                            </TableBody>
                                                        </Table>
                                                    </TableContainer>
                                                </Stack>
                                            </Stack>
                                        </>
                                    )}

                                    <br></br>
                                    <br></br>
                                    <Stack direction={'row'} spacing={3} justifyContent={'center'}>
                                        <Button variant="contained" className='bg-secondary' onClick={handlePrivious}   >Back
                                        </Button>
                                        <Button variant="contained" className='create-btn' type='submit'  >
                                            {publishData?.schedule_details?.scheduleOption ? "Update" : "Next"}
                                        </Button>
                                    </Stack>
                                </Form>
                            )}
                        </Formik>
                    </Stack>
                </Stack>
            </Stack>
        </>
    );
}

export default DeliveryScheduleStep;