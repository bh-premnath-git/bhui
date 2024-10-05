
import React from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, InputLabel, MenuItem, FormControl, Select, Typography, Stack, TextField, Link, FormControlLabel, InputAdornment, IconButton, Box } from "@mui/material";
import { Formik, Field, Form } from 'formik';
import Checkbox from '@mui/material/Checkbox';
import CloseIcon from '@mui/icons-material/Close';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import * as Yup from 'yup';
import { pink } from '@mui/material/colors';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
// import { Divider } from "material-ui";

// Define the validation schema using Yup
const validationSchema = Yup.object({
    project: Yup.string().required('Project is required'),
    branch: Yup.string().required('Branch is required'),
    name: Yup.string().required('Name is required'),
    environment: Yup.string().required('Environment is required'),
    class: Yup.string().required('Class is required'),
    schedule: Yup.string().required('Schedule is required'),
});

const DialogBox: any= ({open,handleClose}:any) => {
    const [openSecondDialog, setOpenSecondDialog] = React.useState(false);
    const [value, setValue] = React.useState(0);
    const [schedule, setSchedule] = React.useState(0);
    const [age, setAge] = React.useState('');


    const handleChange1 = (event: any) => {
        setAge(event.target.value);
    };




    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };


    const handleIncrement = () => {
        setSchedule(prev => prev + 1);
    };

    const handleDecrement = () => {
        setSchedule(prev => Math.max(prev - 1, 0));
    };




    
    const handleOpenSecondDialog = () => {
        setOpenSecondDialog(true);
    };

    const handleCloseSecondDialog = () => {
        setOpenSecondDialog(false);
    };


    const getDialogContent = () => {
        switch (value) {
            case 0:
                return 'Repeat Every';
            case 1:
                return 'Repeat Every ';
            case 2:
                return 'Repeat At';
            case 3:
                return 'Repeat On';
            case 4:
                return 'Repeat On';
            case 5:
                return 'Repeat ';
            default:
                return 'Repeat ';
        }
    };


    const getLabel = (value) => {
        const labels = [
            'Minutes',  // value === 0
            'Hours',     // value === 1
            'Day',      // value === 2
            'Week',     // value === 3
            'Month',    // value === 4
            'Year'      // value === 5
        ];
        return labels[value] || 'Minutes';
    };

    const label = { inputProps: { 'aria-label': 'Checkbox demo' } };



    return (
        <>
           
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                maxWidth='lg'
            >

                <Formik
                    initialValues={{
                        project: '',
                        branch: '',
                        name: '',
                        environment: '',
                        class: '',
                        schedule: ''
                    }}
                    validationSchema={validationSchema}
                    onSubmit={(values) => {
                        // Handle form submission
                        console.log(values);
                        handleClose();
                    }}
                >
                    {({ errors, touched }) => (
                        <Form>
                            <DialogContent>
                                <DialogContentText id="alert-dialog-description" sx={{ paddingLeft: '25%', whiteSpace: "nowrap" }}>
                                    Please fill in the details below to add a new flow.
                                </DialogContentText>
                                <DialogContentText id="alert-dialog-description" sx={{ fontWeight: 'bold', color: 'black', mt: 1, pl: 1 }} >
                                    Create Flow
                                </DialogContentText>

                                <Stack direction={'row'} sx={{ mt: 1 }}>
                                    <Typography variant="body1" sx={{ pl: 1 }}>Project</Typography>
                                    <Typography variant="body1" sx={{ pl: 22 }}>Branch</Typography>
                                    <Typography variant="body1" sx={{ pl: 20 }}>Name</Typography>
                                </Stack>
                                <Stack direction={'row'}>
                                    <FormControl sx={{ m: 1, minWidth: 200 }} size="small">
                                        <InputLabel id="project-label">Select Project</InputLabel>
                                        <Field
                                            as={Select}
                                            labelId="project-label"
                                            name="project"
                                            id="project-select"
                                        >
                                            <MenuItem value="">
                                                <em>None</em>
                                            </MenuItem>
                                            <MenuItem value="10">Ten</MenuItem>
                                            <MenuItem value="20">Twenty</MenuItem>
                                            <MenuItem value="30">Thirty</MenuItem>
                                        </Field>
                                    </FormControl>
                                    <FormControl sx={{ m: 1, minWidth: 200 }} size="small">
                                        <InputLabel id="branch-label">Select Branch</InputLabel>
                                        <Field
                                            as={Select}
                                            labelId="branch-label"
                                            name="branch"
                                            id="branch-select"
                                        >
                                            <MenuItem value="">
                                                <em>None</em>
                                            </MenuItem>
                                            <MenuItem value="10">Ten</MenuItem>
                                            <MenuItem value="20">Twenty</MenuItem>
                                            <MenuItem value="30">Thirty</MenuItem>
                                        </Field>
                                    </FormControl>
                                    <Field
                                        as={TextField}
                                        name="name"
                                        placeholder="Enter Name"
                                        size="small"
                                        sx={{ m: 1 }}
                                        fullWidth
                                    />
                                </Stack>
                                <Stack direction={'row'} sx={{ mt: 1 }}>
                                    <Typography variant="body1" sx={{ pl: 1 }}>Environment</Typography>
                                    <Typography variant="body1" sx={{ pl: 17 }}>Class</Typography>
                                    <Typography variant="body1" sx={{ pl: 22 }}>Schedule</Typography>
                                </Stack>
                                <Stack direction={'row'}>
                                    <FormControl sx={{ m: 1, minWidth: 200 }} size="small">
                                        <InputLabel id="environment-label">Select Environment</InputLabel>
                                        <Field
                                            as={Select}
                                            labelId="environment-label"
                                            name="environment"
                                            id="environment-select"
                                        >
                                            <MenuItem value="">
                                                <em>None</em>
                                            </MenuItem>
                                            <MenuItem value="10">Ten</MenuItem>
                                            <MenuItem value="20">Twenty</MenuItem>
                                            <MenuItem value="30">Thirty</MenuItem>
                                        </Field>
                                    </FormControl>
                                    <FormControl sx={{ m: 1, minWidth: 200 }} size="small">
                                        <InputLabel id="class-label">Select Class</InputLabel>
                                        <Field
                                            as={Select}
                                            labelId="class-label"
                                            name="class"
                                            id="class-select"
                                        >
                                            <MenuItem value="">
                                                <em>None</em>
                                            </MenuItem>
                                            <MenuItem value="10">Ten</MenuItem>
                                            <MenuItem value="20">Twenty</MenuItem>
                                            <MenuItem value="30">Thirty</MenuItem>
                                        </Field>
                                    </FormControl>
                                    <Field
                                        as={TextField}
                                        name="schedule"
                                        placeholder="Schedule Interval"
                                        size="small"
                                        sx={{ m: 1 }}
                                        fullWidth
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <AccessTimeIcon sx={{ cursor: 'pointer' }} onClick={handleOpenSecondDialog} />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />




                                </Stack>
                                {/* <Link
                                    component="button"
                                    variant="body2"
                                    sx={{ color: '#2196F3' }}
                                    onClick={() => {
                                        console.info("I'm a button.");
                                    }}
                                >
                                    Add Notes
                                </Link> */}
                                <KeyboardArrowDownIcon sx={{ color: '#2196F3' }} />
                                <DialogContentText id="alert-dialog-description" sx={{ fontWeight: 'bold', color: 'black', mt: 1 }} >
                                    Select Alert Settings
                                </DialogContentText>
                                <DialogContentText id="alert-dialog-description" sx={{ fontWeight: 'bold', mt: 1 }} >
                                    Recipient Email ID
                                </DialogContentText>
                                <TextField
                                    placeholder="Enter Recipient Email ID "
                                    id="outlined-size-small"
                                    size="small"
                                    sx={{ marginTop: 1 }}
                                />


                            </DialogContent>
                            <Stack direction={'row'} sx={{ px: 3 }}>
                                <FormControlLabel control={<Checkbox defaultChecked color="success" />} label="On Job Start" />
                                <FormControlLabel disabled control={<Checkbox defaultChecked />} sx={{ px: 15 }} label="On Job Failure" />
                                <FormControlLabel disabled control={<Checkbox defaultChecked />} label="On Job Success" />
                            </Stack>



                            <DialogActions sx={{ display: 'flex', justifyContent: "center", spacing: 5 }}>
                                <Button type="button" onClick={handleClose} variant="outlined" sx={{ textTransform: "none", color: 'black', borderColor: 'black', paddingX: "10%" }}>Close</Button>
                                <Button type="submit" variant='contained' sx={{ background: 'black', textTransform: "none", paddingX: "8%" }} >
                                    Create Flow
                                </Button>
                            </DialogActions>
                        </Form>
                    )}
                </Formik>
            </Dialog>

            <Dialog
                open={openSecondDialog}
                onClose={handleCloseSecondDialog}
                aria-labelledby="second-dialog-title"
                aria-describedby="second-dialog-description"
                maxWidth='md'


            >
                <Stack direction={'row'} sx={{ display: 'flex', justifyContent: "space-between" }}>
                    <DialogTitle id="second-dialog-title" sx={{ fontWeight: "bold" }}>
                        Schedule Interval
                    </DialogTitle>
                    <CloseIcon sx={{ marginTop: '20px', marginRight: '5px' }} onClick={handleCloseSecondDialog} />
                </Stack>

                <Tabs value={value} onChange={handleChange} centered TabIndicatorProps={{ style: { display: 'none' } }} >
                    <Tab
                        label="Minutes"
                        style={{color:value == 0 ?'white':'black'}}
                        sx={{
                            flex: 1,
                            py: 1,
                            textTransform: 'none',
                            backgroundColor: value === 0 ? '#2196F3' : 'transparent',
                            borderRadius: 1,
                            '&:hover': {
                                backgroundColor: value === 0 ? '#1976D2' : 'rgba(0, 0, 0, 0.04)',
                                color:  value === 0 ?'white':'black',

                            },
                        }}

                    />
                    <Tab
                        label="Hourly"
                        style={{color:value == 1 ?'white':'black'}}
                        sx={{
                            flex: 1,
                            py: 1,
                            textTransform: 'none',
                            backgroundColor: value === 1 ? '#2196F3' : 'transparent',
                            borderRadius: 1,
                            '&:hover': {
                                backgroundColor: value === 1 ? '#1976D2' : 'rgba(0, 0, 0, 0.04)',
                                color: 'white',
                            }
                        }}







                    />
                    <Tab
                        label="Daily"
                        style={{color:value == 2 ?'white':'black'}}
                        sx={{
                            flex: 1,
                            py: 1,
                            textTransform: 'none',
                            backgroundColor: value === 2 ? '#2196F3' : 'transparent',
                            borderRadius: 1,
                            '&:hover': {
                                backgroundColor: value === 2 ? '#1976D2' : 'rgba(0, 0, 0, 0.04)',
                                color: 'white',

                            },
                        }}
                    />
                    <Tab
                        label="Weekly"
                        style={{color:value == 3 ?'white':'black'}}
                        sx={{
                            flex: 1,
                            py: 1,
                            textTransform: 'none',
                            backgroundColor: value === 3 ? '#2196F3' : 'transparent',
                            borderRadius: 1,
                            '&:hover': {
                                backgroundColor: value === 3 ? '#1976D2' : 'rgba(0, 0, 0, 0.04)',
                                color: 'white',

                            },
                        }}
                    />
                    <Tab
                        label="Monthly"
                        style={{color:value == 4 ?'white':'black'}}
                        sx={{
                            flex: 1,
                            py: 1,
                            textTransform: 'none',
                            backgroundColor: value === 4 ? '#2196F3' : 'transparent',
                            borderRadius: 1,
                            '&:hover': {
                                backgroundColor: value === 4 ? '#1976D2' : 'rgba(0, 0, 0, 0.04)',
                                color: 'white',

                            },
                        }}
                    />
                    <Tab
                        label="Yearly"
                        style={{color:value == 5 ?'white':'black'}}
                        sx={{
                            flex: 1,
                            py: 1,
                            textTransform: 'none',
                            backgroundColor: value === 5 ? '#1976D2' : 'transparent',
                            borderRadius: 2,
                            '&:hover': {
                                backgroundColor: value === 5 ? '#1976D2' : 'rgba(0, 0, 0, 0.04)',
                                color: 'white',


                            },
                        }}
                    />




                </Tabs>
                <Stack direction={'row'}>
                    <DialogContentText id="alert-dialog-description" sx={{ color: 'black', my: 1, pl: 2 }}>
                        {getDialogContent()}
                    </DialogContentText>
                    {value === 1 && (
                        <DialogContentText id="alert-dialog-description" sx={{ color: 'black', pl: 20, pt: 1 }}>
                            Time
                        </DialogContentText>
                    )}
                    {value === 4 && (
                        <Typography sx={{ color: 'black', mt: 1, pl: 5 }}>Repeat At</Typography>
                    )}





                </Stack>
                {(value === 0) && (
                    <>
                        <Stack direction={'row'}>
                            <TextField
                                value={schedule}
                                onChange={(e) => setSchedule(Number(e.target.value))}

                                sx={{ maxWidth: 100, ml: 3 }}
                                type="number"
                                label=""
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <IconButton onClick={handleDecrement} edge="start">
                                                {/* <RemoveIcon /> */}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={handleIncrement} edge="end">
                                                {/* <AddIcon /> */}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <Typography sx={{ mt: 2, pl: 1 }}>Minutes</Typography>
                        </Stack>
                    </>
                )}
                <Stack direction={'row'}>

                    {(value === 1) && (
                        <TextField
                            value={schedule}
                            onChange={(e) => setSchedule(Number(e.target.value))}
                            sx={{ maxWidth: 100, ml: 4 }}
                            type="number"
                            label=""
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <IconButton onClick={handleDecrement} edge="start">
                                            {/* <RemoveIcon /> */}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={handleIncrement} edge="end">
                                            {/* <AddIcon /> */}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    )}
                    <Stack direction={'row'}>
                        {(value === 1) && (
                            <Typography sx={{ paddingLeft: '15px', marginTop: '10px' }}>
                                {getLabel(value)}

                            </Typography>
                        )}

                        {(value === 1) && (
                            <>

                                <Typography sx={{ paddingLeft: '20px', marginTop: '10px' }}>
                                    From
                                </Typography>


                                <TextField
                                    id="time"
                                    label=""
                                    type="time"

                                    defaultValue="12:00"
                                    //  className={classes.textField}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    inputProps={{
                                        step: 300, // 5 min
                                    }}
                                    sx={{ paddingTop: '0px', display: 'flex', float: 'start', paddingLeft: '10px' }}
                                />
                            </>


                        )}


                        {(value === 2) && (
                            <TextField
                                id="time"
                                label=""
                                type="time"
                                defaultValue="07:30"
                                //  className={classes.textField}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                inputProps={{
                                    step: 300, // 5 min
                                }}
                                sx={{ paddingLeft: '20px', pt: 1, width: '150px' }}
                            />
                        )}


                        {value === 3 && (
                            <>
                                <Stack spacing={2}>
                                    <Stack direction="row" sx={{ marginBottom: 10 }}>
                                        <Box display="flex" alignItems="center">
                                            <Checkbox defaultChecked color="success" sx={{ marginLeft: 1 }} />
                                            <Typography variant="body2" sx={{ marginLeft: 0 }}>
                                                Sun
                                            </Typography>
                                        </Box>
                                        <Box display="flex" alignItems="center">
                                            <Checkbox defaultChecked color="default" />
                                            <Typography variant="body2" sx={{ marginLeft: 0 }}>
                                                Mon
                                            </Typography>
                                        </Box>
                                        <Box display="flex" alignItems="center">
                                            <Checkbox defaultChecked color="default" />
                                            <Typography variant="body2" sx={{ marginLeft: 0 }}>
                                                Tue
                                            </Typography>
                                        </Box>
                                        <Box display="flex" alignItems="center">
                                            <Checkbox defaultChecked color="default" />
                                            <Typography variant="body2" sx={{ marginLeft: 0 }}>
                                                Wed
                                            </Typography>
                                        </Box>
                                        <Box display="flex" alignItems="center">
                                            <Checkbox defaultChecked color="default" />
                                            <Typography variant="body2" sx={{ marginLeft: 0 }}>
                                                Thu
                                            </Typography>
                                        </Box>
                                        <Box display="flex" alignItems="center">
                                            <Checkbox defaultChecked color="default" />
                                            <Typography variant="body2" sx={{ marginLeft: 0 }}>
                                                Fri
                                            </Typography>
                                        </Box>
                                        <Box display="flex" alignItems="center">
                                            <Checkbox defaultChecked color="default" />
                                            <Typography variant="body2" sx={{ marginLeft: 1 }}>
                                                Sat
                                            </Typography>
                                        </Box>




                                    </Stack>
                                    <Stack sx={{ marginTop: '10px', }}>


                                        <Typography sx={{ color: 'black', paddingTop: '5px', ml: 2 }}>Repeat At</Typography>

                                        <TextField
                                            id="time"
                                            label=""
                                            type="time"
                                            defaultValue="07:30"
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                            inputProps={{
                                                step: 300, // 5 min
                                            }}
                                            sx={{ paddingTop: '5px', ml: 2, width: '130px' }}
                                        />

                                    </Stack>
                                </Stack>








                            </>




                        )}
                        {value === 4 && (

                            <Stack direction={'row'} sx={{ marginTop: '10px' }} >

                                <FormControl sx={{ ml: 2, minWidth: 100, }} >
                                    <InputLabel id="demo-select-small-label">1</InputLabel>
                                    <Select
                                        labelId="demo-select-small-label"
                                        id="demo-select-small"
                                        value={age}
                                        label="Age"
                                        onChange={handleChange1}
                                        size="small"
                                    >
                                        <MenuItem value="">
                                            <em>None</em>
                                        </MenuItem>
                                        <MenuItem value={10}>Ten</MenuItem>
                                        <MenuItem value={20}>Twenty</MenuItem>
                                        <MenuItem value={30}>Thirty</MenuItem>
                                    </Select>
                                </FormControl>

                                <TextField
                                    id="time"
                                    label=""
                                    type="time"
                                    defaultValue="07:30"
                                    //  className={classes.textField}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    inputProps={{
                                        step: 300, // 5 min
                                    }}
                                    sx={{ paddingLeft: '20px', width: '150px' }}
                                />

                            </Stack>

                        )}


                        {value === 5 && (
                            <>
                                <Stack spacing={2}>
                                    <Stack direction={'row'} sx={{ marginTop: '10px', }} >

                                        <FormControl sx={{ ml: 2, minWidth: 100, }} >
                                            {/* <InputLabel id="demo-select-small-label">Every</InputLabel> */}
                                            <Select
                                                labelId="demo-select-small-label1"
                                                id="demo-select-small"
                                                value={age}
                                                label="Age"
                                                size="small"
                                                onChange={handleChange1}
                                            >
                                                <MenuItem value="">
                                                    <em>None</em>
                                                </MenuItem>
                                                <MenuItem selected value={10}>Every</MenuItem>
                                                <MenuItem value={20}>Twenty</MenuItem>
                                                <MenuItem value={30}>Thirty</MenuItem>
                                            </Select>
                                        </FormControl>
                                        <FormControl sx={{ ml: 2, minWidth: 150, }} >
                                            {/* <InputLabel id="demo-select-small-label">September</InputLabel> */}
                                            <Select
                                                labelId="demo-select-small-label2"
                                                id="demo-select-small"
                                                value={age}
                                                placeholder="September"
                                                // label="September"
                                                onChange={handleChange1}
                                                size="small"
                                            >
                                                <MenuItem value="">
                                                    <em>None</em>
                                                </MenuItem>
                                                <MenuItem value={10}>Ten</MenuItem>
                                                <MenuItem value={20}>Twenty</MenuItem>
                                                <MenuItem value={30}>Thirty</MenuItem>
                                            </Select>
                                        </FormControl>
                                        <FormControl sx={{ ml: 2, minWidth: 100, }} >
                                            {/* <InputLabel id="demo-select-small-label">5</InputLabel> */}
                                            <Select
                                                labelId="demo-select-small-label3"
                                                id="demo-select-small"
                                                value={age}
                                                label="Age"
                                                size="small"
                                                onChange={handleChange1}
                                            >
                                                <MenuItem value="">
                                                    <em>None</em>
                                                </MenuItem>
                                                <MenuItem value={10}>Ten</MenuItem>
                                                <MenuItem value={20}>Twenty</MenuItem>
                                                <MenuItem value={30}>Thirty</MenuItem>
                                            </Select>
                                        </FormControl>

                                    </Stack>
                                    <Stack direction={'column'} >

                                        <Typography sx={{ color: 'black', ml: 2 }}>Repeat At</Typography>
                                        <TextField
                                            id="time"
                                            label=""
                                            type="time"
                                            defaultValue="12:00"

                                            //  className={classes.textField}
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                            inputProps={{
                                                step: 300, // 5 min
                                            }}
                                            sx={{ paddingTop: '10px', ml: 2, width: "130px" }}
                                        />




                                    </Stack>
                                </Stack>

                            </>
                        )}





                    </Stack>


                </Stack>


                {/* {(value !== 3 && value !== 0) && (

                    <DialogActions sx={{ display: 'flex', justifyContent: "center", spacing: 5 }}>
                        <Button
                            type="button"
                            onClick={handleCloseSecondDialog}
                            variant="outlined"
                            sx={{ textTransform: "none", color: 'black', borderColor: 'black', paddingX: "7%" }}
                        >
                            Close
                        </Button>
                        <Button
                            type="submit"
                            variant='contained'
                            sx={{ background: 'black', textTransform: "none", paddingX: "8%" }}
                            onClick={handleCloseSecondDialog}
                        >
                            Save
                        </Button>
                    </DialogActions>

                )} */}

                {/* <Divider style={{ width: '100px', color: 'blue' }} /> */}



                <DialogActions sx={{ display: 'flex', justifyContent: "center", spacing: 5,mt:5 }}>
                    <Button type="button" onClick={handleCloseSecondDialog} variant="outlined" sx={{ textTransform: "none", color: 'black', borderColor: 'black', paddingX: "7%" }}>
                        Close
                    </Button>
                    <Button type="submit" variant='contained' sx={{ background: 'black', textTransform: "none", paddingX: "8%" }} onClick={handleCloseSecondDialog}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

        </>
    );
};


export default DialogBox;









