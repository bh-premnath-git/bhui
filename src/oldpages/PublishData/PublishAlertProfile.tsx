import InputAdornment from '@mui/material/InputAdornment';
import {
    TextField, Checkbox, FormGroup, Typography, Grid, Button, Stack
} from '@mui/material';
import { Controller, useForm, useFormContext } from 'react-hook-form';
import { useEffect, useState } from 'react';
import * as yup from 'yup';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import {ApiService} from '@/services/apiServices';




const schema = yup.object().shape({
    email_id: yup.string(),
    url: yup.string(),
    teamsUrl: yup.string(),
    failure_delay: yup.boolean(),
    delayed_delivery: yup.boolean(),
    successful_delivery: yup.boolean(),
    Email: yup.boolean(),
    Slack: yup.boolean(),
    Teams: yup.boolean()
});

function PublishAlertProfileStep({handlePrivious,handleNext,publishId}) {
    const [initialValue, setInitialValues] = useState({
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
    const [publishData, setPublishData]: any = useState()

    useEffect(() => {
        if (publishId) {
			getData(publishId)
		}

    }, []);

    async function getData(publishdataId) {
        var data = {};
        var result = await ApiService('8011', 'get', `/publish_data/publish_details/${publishdataId}`, data);
        if (result) {
          setPublishData(result)
         if(result?.alert_setting){
            setInitialValues(result?.alert_setting)
         }
    
        }
        console.log(result)
      }
     
    const saveData = async (values: any, { setSubmitting }: any) => {
        publishData.alert_setting=values
        console.log(publishData)
        var result = await ApiService('8011', 'put', `/publish_data/publish_details/${publishId}`, publishData);
        console.log(result)
        if (result) {
          handleNext(result)
        }
    };
    return (
        <div>
            <div className='text-start pt-4 mb-10'>
                <h6 className='pt-10 mb-10' style={{ fontWeight: 'bold', padding: '1%' }}>Select Alert Setting</h6>

            </div>
            <Formik
                initialValues={initialValue}
                validationSchema={schema}
                onSubmit={saveData}
                enableReinitialize={true}
            >
                {({ errors, touched, isSubmitting, values, handleChange }) => (
                    <Form>
                        <div className="w-full text-start pt-10 pb-10" style={{ padding: '1%' }}>
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
                                        // value='true'
                                        size='medium' style={{ color: 'grey' }}
                                        onChange={handleChange}
                                    />
                                    Send Alerts For Successful Delivery
                                </label>
                            </div>


                            <Typography style={{ fontSize: '16px', fontWeight: '600', padding: '1%', marginTop: '1%' }} className='myHeadFont'>Add Alert Channels</Typography>
                            <Grid container spacing={2} style={{ padding: '1%' }}>

                                <Grid item xs={4}>
                                    <label style={{ fontSize: '16px', fontWeight: '400', color: 'grey' }}>
                                        <Field
                                            type="checkbox"
                                            as={Checkbox}
                                            name="Email"
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
                                        <Typography sx={{ fontWeight: '500' }} variant="body2" className='myFont'>
                                            Recipent Email ID {values?.Email && (<span style={{ color: 'red' }}> *</span>)}
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
                                            required={values.Email ? true : false}

                                            fullWidth sx={{
                                                '& .MuiInputBase-input::placeholder': {
                                                  fontFamily: 'Inter !important', // Custom font for placeholder text
                                                },
                                              }}
                                        />
                                        <div style={{ color: 'red' }}>
                                            <ErrorMessage name="email_id" component="div" /></div>
                                    </>


                                </Grid>
                                <Grid item xs={4}>

                                    <>
                                        <Typography sx={{ fontWeight: '500' }} variant="body2" className='myFont'>
                                            Add URL {values?.Slack && (<span style={{ color: 'red' }}> *</span>)}
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
                                            required={values.Slack ? true : false}
                                            sx={{
                                                '& .MuiInputBase-input::placeholder': {
                                                  fontFamily: 'Inter !important', // Custom font for placeholder text
                                                },
                                              }}

                                        />
                                        <div style={{ color: 'red' }}>
                                            <ErrorMessage name="url" component="div" /></div>
                                    </>


                                </Grid>

                                {/* Second item in the row */}
                                <Grid item xs={4}>

                                    <>
                                        <Typography sx={{ fontWeight: '500' }} variant="body2" className='myFont' >
                                            Add URL {values?.Teams && (<span style={{ color: 'red' }}> *</span>)}
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
                                            required={values.Teams ? true : false}
                                            fullWidth
                                            sx={{
                                                '& .MuiInputBase-input::placeholder': {
                                                  fontFamily: 'Inter !important', // Custom font for placeholder text
                                                },
                                              }}

                                        />
                                        <div style={{ color: 'red' }}>
                                            <ErrorMessage name="teamsUrl" component="div" />
                                        </div>
                                    </>

                                </Grid>
                            </Grid>

                        </div>
                        <br></br>
                        <Stack direction={'row'} justifyContent={'center'} spacing={3}>
                            <Button className="bg-secondary text-white"
                                variant="contained"
                                onClick={handlePrivious}
                            >
                                Back
                            </Button>
                            <Button className="bg-dark text-white"
                                type="submit"
                                variant="contained"
                            >
                                {publishData?.alert_setting?"Update":"Next"}
                            </Button>
                        </Stack>


                    </Form>
                )}
            </Formik>

        </div >
    );
}

export default PublishAlertProfileStep;