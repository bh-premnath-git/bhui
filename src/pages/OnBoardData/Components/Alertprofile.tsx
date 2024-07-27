import { TextField, Checkbox, Typography, Grid, Stack, Box } from '@mui/material';
import { useEffect, useState } from 'react';
import * as yup from 'yup';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Button } from 'antd';
import DialoguePopUp from './DialoguePopUp';
import { useNavigate } from 'react-router-dom';
import CommonDialog from '../../../components/common-dialoge';


const schema = yup.object().shape({
    email_id: yup.string().required('Email ID is required'),
    url: yup.string().required('URL is required'),
    teamsUrl: yup.string().required('URL is required'),
    failure_delay: yup.boolean(),
    delayed_delivery: yup.boolean(),
    successful_delivery: yup.boolean(),
    Email: yup.boolean(),
    Slack: yup.boolean(),
    Teams: yup.boolean()
    // selectedOption: yup.string().required('Please select an option'),
    // selectedOptionsecond: yup.boolean(),
});
function AlertProfileStep() {
    // const { onNext, data , onBack} = props;
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);

    const [initialValue, setInitialValue] = useState({
        email_id: '',
        url: '',
        teamsUrl: '',
        failure_delay: true,
        delayed_delivery: false,
        successful_delivery: false,
        Email: false,
        Slack: false,
        Teams: false
    })
    const [customerData, setCustomerData]: any = useState()

    const handleSubmit = (values: any) => {
        // Handle form submission
        console.log(values);
    };
    const navigate = useNavigate();
    const toggleSuccessDialog = () => {
        setShowSuccessDialog(!showSuccessDialog);
    };
    const navigateOnboardData = () =>{
		navigate("/Designer/Onboard Data");
	}

    const handleNext1 = () => {

        toggleSuccessDialog();
        handleClickOpen();

        setTimeout(() => {
            navigateOnboardData()
        }, 4000); // 4000 milliseconds = 4 seconds


    }
    const [open, setOpen] = useState(false);

	const handleClickOpen = () => {
	  setOpen(true);
	};
  
	const handleClose = () => {
	  setOpen(false);
	};


    return (
        <>

            <Stack mx={10}>
                <div className='text-left pt-10 mb-5'>
                    <h3 className='pt-10 mb-5  ' style={{ fontWeight: 'bold', padding: '1%' }}>Select Alert Setting</h3>

                </div>
                <Formik
                    initialValues={initialValue}
                    validationSchema={schema}
                    onSubmit={handleSubmit}
                    enableReinitialize={true}
                >
                    {({ errors, touched, isSubmitting, values, handleChange }) => (
                        <Form>
                            <div className="w-full text-left pt-10 pb-10" style={{ padding: '1%' }}>
                                <div>
                                    <label style={{ fontSize: '16px', fontWeight: '400', color: 'grey' }}>
                                        <Field
                                            type="checkbox"
                                            as={Checkbox}
                                            name="failure_delay"
                                            // value='true'
                                            size='medium' disabled checked={values.failure_delay} style={{ color: 'green' }}
                                            onChange={handleChange}

                                        />

                                        Send Alerts For Failure Delivery
                                    </label><br />
                                    <label style={{ fontSize: '16px', fontWeight: '400' }}>
                                        <Field
                                            type="checkbox"
                                            as={Checkbox}
                                            name="delayed_delivery"
                                            checked
                                            // value='true'
                                            // checked={values.selectedOptionsecond}
                                            size='medium' style={{ color: 'grey' }}
                                            onChange={handleChange}
                                        />

                                        Send Alerts For Delayed Delivery
                                    </label><br />
                                    <label style={{ fontSize: '16px', fontWeight: '400' }}>
                                        <Field
                                            type="checkbox"
                                            as={Checkbox}
                                            name="successful_delivery"
                                            checked

                                            // value='true'
                                            size='medium' style={{ color: 'grey' }}
                                            onChange={handleChange}
                                        />
                                        Send Alerts For Successful Delivery
                                    </label>
                                </div>


                                <Typography style={{ fontSize: '16px', fontWeight: '600', padding: '1%', marginTop: '1%' }}>Add Alert Channels</Typography>
                                <Grid container spacing={2} style={{ padding: '1%' }}>

                                    <Grid item xs={4}>
                                        <label style={{ fontSize: '16px', fontWeight: '400', color: 'grey' }}>
                                            <Field
                                                type="checkbox"
                                                as={Checkbox}
                                                name="Email"
                                                checked

                                                // value="true"
                                                size='medium' style={{ color: 'grey' }}
                                                onChange={handleChange}

                                            />
                                            Email
                                        </label><br />

                                    </Grid>
                                    <Grid item xs={4}>
                                        <label style={{ fontSize: '16px', fontWeight: '400', color: 'grey' }}>
                                            <Field
                                                type="checkbox"
                                                as={Checkbox}
                                                name="Slack"
                                                checked

                                                // value="true"
                                                size='medium' style={{ color: 'grey' }}
                                            // onChange={handleChange}

                                            />
                                            Slack
                                        </label><br />
                                        {/* <FormControlLabel
										control={<Checkbox size='medium' checked={checked5} onChange={() => setChecked5(!checked5)} style={{ color: 'grey' }} />}
										label={<Typography style={{ fontSize: '16px', fontWeight: '400' }}>Slack</Typography>}
									/> */}
                                    </Grid>

                                    {/* Second item in the row */}
                                    <Grid item xs={4}>
                                        <label style={{ fontSize: '16px', fontWeight: '400', color: 'grey' }}>
                                            <Field
                                                type="checkbox"
                                                as={Checkbox}
                                                name="Teams"
                                                checked

                                                // value='true'
                                                size='medium' style={{ color: 'grey' }}
                                            // onChange={handleChange}

                                            />
                                            Teams
                                        </label><br />
                                        {/* <FormControlLabel
										control={<Checkbox size='medium' checked={checked6} onChange={() => setChecked6(!checked6)} style={{ color: 'grey' }} />}
										label={<Typography style={{ fontSize: '16px', fontWeight: '400' }}>Teams</Typography>}
									/> */}
                                    </Grid>
                                </Grid>

                                <Grid container spacing={2} style={{ marginTop: '8px' }}>
                                    {/* First item in the row */}
                                    <Grid item xs={4}>

                                        <>
                                            <Typography sx={{ fontWeight: '500' }} variant="body2" >
                                                Recipent Email ID <span style={{ color: 'red' }}> *</span>
                                            </Typography>
                                            <Field
                                                name="email_id"
                                                className="mt-10"
                                                as={TextField}
                                                // {...field}
                                                placeholder="Enter Recipent Email ID"
                                                id="email_id"
                                                variant="outlined"
                                                value={values.email_id}
                                                onChange={handleChange}
                                                required
                                                fullWidth
                                            />
                                            <div style={{ color: 'red' }}>
                                                <ErrorMessage name="email_id" component="div" /></div>
                                        </>


                                    </Grid>
                                    <Grid item xs={4}>

                                        <>
                                            <Typography sx={{ fontWeight: '500' }} variant="body2" >
                                                Add URL <span style={{ color: 'red' }}> *</span>
                                            </Typography>
                                            <Field
                                                name="url"
                                                className="mt-10"
                                                as={TextField}
                                                // {...field}
                                                placeholder="Add Slack URL"
                                                id="name"
                                                variant="outlined"
                                                value={values.url}
                                                onChange={handleChange}
                                                fullWidth
                                            />
                                            <div style={{ color: 'red' }}>
                                                <ErrorMessage name="url" component="div" /></div>
                                        </>


                                    </Grid>

                                    {/* Second item in the row */}
                                    <Grid item xs={4}>

                                        <>
                                            <Typography sx={{ fontWeight: '500' }} variant="body2" >
                                                Add URL <span style={{ color: 'red' }}> *</span>
                                            </Typography>
                                            <Field
                                                name="teamsUrl"
                                                className="mt-10"
                                                as={TextField}
                                                // {...field}
                                                placeholder="Add Teams URL"
                                                id="name"
                                                variant="outlined"
                                                value={values.teamsUrl}
                                                onChange={handleChange}
                                                required
                                                fullWidth
                                            // InputProps={{
                                            // 	startAdornment: (
                                            // 		<InputAdornment position="start">
                                            // 			<SwombSvgIcon size={20}>heroicons-solid:user-circle</SwombSvgIcon>
                                            // 		</InputAdornment>
                                            // 	)
                                            // }}
                                            />
                                            <div style={{ color: 'red' }}>
                                                <ErrorMessage name="teamsUrl" component="div" />
                                            </div>
                                        </>

                                    </Grid>
                                </Grid>

                            </div>

                            {/* <Stack direction={'row'} mt={5} spacing={70}>
                                <Button className="ml-8"
                                    variant="contained"
                                    // onClick={onBack}
                                    color='secondary' >

                                    Back
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    disabled={isSubmitting}

                                // style={{  color: 'white', backgroundColor: 'black' }}

                                >
                                    Next
                                </Button>
                                {/* <button type="button" onClick={() => handleSubmit()}>Next</button> */}
                            {/* </Stack> */}


                        </Form>
                    )}
                </Formik>
                <Box sx={{ mx: '45%', mt: '13%' }}>
                    <Button
                        style={{
                            color: 'white',
                            backgroundColor: 'black',
                            width: '200px',
                            textTransform: 'none',

                        }} onClick={handleNext1} >
                        Finish
                    </Button>
                    {showSuccessDialog && (
                       <CommonDialog
                       open={open}
                       onClose={handleClose}
                       title="Success"
                       description="Data Onboarded  Successfully"
                       imageUrl="/src/assets/Successful.png"
                       additionalContent="You'll be automatically redirected to homepage shortly"
                     />
                    )}
                </Box>

            </Stack >
        </>

    );
}

export default AlertProfileStep;



