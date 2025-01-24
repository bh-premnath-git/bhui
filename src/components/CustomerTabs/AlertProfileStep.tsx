import InputAdornment from '@mui/material/InputAdornment';
import {
	FormControl, FormControlLabel, TextField, InputLabel, MenuItem, Radio,
	RadioGroup, Select, Checkbox, FormGroup, Typography, Grid, Button, Stack
} from '@mui/material';
import { Controller, useForm, useFormContext } from 'react-hook-form';
import { useEffect, useState } from 'react';
// import { Button } from '@mui/base';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { ApiService } from '@/services/apiServices';
import { Label } from '../ui/label';
import { COLORS } from '@/utils/constants';




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

function AlertProfileStep(props: any) {
	const { onNext, data, onBack } = props;
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

	useEffect(() => {
		if (props.data) {
			const fetchConnection = async () => {
				try {
					const result = await ApiService('8011', 'get', `/customer/${props.data}`);
					setCustomerData(result)
					if (result?.alert_setting) {
						setInitialValue(result?.alert_setting)
					}
				} catch (error) {
					console.error('Error fetching data:', error);
				}
			};
			fetchConnection();
		}

	}, []);

	const saveData = async (values: any, { setSubmitting }: any) => {
		customerData.alert_setting = values;
		try {
			const result = await ApiService('8011', 'put', `/customer/${props.data}`, customerData);
			onNext(result)
		}
		catch (error) {
			console.error('Error fetching Status', error);
		}
		setSubmitting(false);
	};
	return (
		<div>
			<div className='text-start mt-2'>
				<h6 className='' style={{ fontWeight: 'bold', padding: '1%' }}>Select Alert Setting</h6>

			</div>
			<Formik
				initialValues={initialValue}
				validationSchema={schema}
				onSubmit={saveData}
				enableReinitialize={true}
			>
				{({ errors, touched, isSubmitting, values, handleChange }) => (
					<Form>
						<div className="w-full text-start " >
							<div>
								<label>
									<Field
										type="checkbox"
										as={Checkbox}
										name="failure_delay"
										// value='true'
										size='small'
										disabled checked={values.failure_delay} style={{ color: COLORS.green }}
										onChange={handleChange}

									/>

									Send Alerts For Failure Delivery
								</label><br />
								<label >
									<Field
										type="checkbox"
										as={Checkbox}
										name="delayed_delivery"
										size='medium' style={{ color: 'grey' }}
										onChange={handleChange}
									/>

									Send Alerts For Delayed Delivery
								</label><br />
								<label>
									<Field
										type="checkbox"
										as={Checkbox}
										name="successful_delivery"
										size='medium' style={{ color: 'grey' }}
										onChange={handleChange}
									/>
									Send Alerts For Successful Delivery
								</label>
							</div>
							<div className='mx-2'>
								<Typography style={{ fontSize: '16px', fontWeight: '600', }}>Add Alert Channels</Typography>
								<Grid container spacing={2} >

									<Grid item xs={4}>
										<label style={{ fontSize: '16px', fontWeight: '400', color: 'grey' }}>
											<Field
												type="checkbox"
												as={Checkbox}
												name="Email"
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
											/>
											Slack
										</label><br />

									</Grid>

									<Grid item xs={4}>
										<label style={{ fontSize: '16px', fontWeight: '400', color: 'grey' }}>
											<Field
												type="checkbox"
												as={Checkbox}
												name="Teams"
												size='medium' style={{ color: 'grey' }}

											/>
											Teams
										</label><br />

									</Grid>
								</Grid>
								<Grid container spacing={2} style={{ marginTop: '8px' }}>
									{/* First item in the row */}
									<Grid item xs={4}>

										<>

											<Label className="font-normal">
												Recipent Email ID  {values?.Email && <span style={{ color: 'red' }}>*</span>}
											</Label>
											<Field size='small' className='shadow-sm'
												name="email_id"
												as={TextField}
												placeholder="Enter Recipent Email ID"
												id="email_id"
												variant="outlined"
												value={values.email_id}
												onChange={handleChange}
												required={values.Email ? true : false}

												fullWidth
											/>
											<div style={{ color: 'red' }}>
												<ErrorMessage name="email_id" component="div" /></div>
										</>


									</Grid>
									<Grid item xs={4}>
										<>
											<Label className="font-normal">
												Add URL  {values?.Slack && <span style={{ color: 'red' }}>*</span>}
											</Label>
											<Field size='small' className='shadow-sm'
												name="url"
												as={TextField}
												placeholder="Add Slack URL"
												id="name"
												variant="outlined"
												value={values.url}
												onChange={handleChange}
												fullWidth
												required={values.Slack ? true : false}

											/>
											<div style={{ color: 'red' }}>
												<ErrorMessage name="url" component="div" /></div>
										</>


									</Grid>

									{/* Second item in the row */}
									<Grid item xs={4}>

										<>
											<Label className="font-normal">
												Add URL  {values?.Teams && <span style={{ color: 'red' }}>*</span>}
											</Label>
											<Field size='small' className='shadow-sm'
												name="teamsUrl"
												as={TextField}
												placeholder="Add Teams URL"
												id="name"
												variant="outlined"
												value={values.teamsUrl}
												onChange={handleChange}
												required={values.Teams ? true : false}
												fullWidth

											/>
											<div style={{ color: 'red' }}>
												<ErrorMessage name="teamsUrl" component="div" />
											</div>
										</>

									</Grid>
								</Grid>
							</div>




						</div>
						<br></br>
						<Stack direction={'row'} justifyContent={'space-between'}>
							<Button className="bg-secondary text-white"
								sx={{ textTransform: 'none' }}
								variant="contained"
								onClick={onBack}
							>

								Back
							</Button>
							<Button className="bg-dark text-white"
								sx={{ textTransform: 'none' }}
								type="submit"
								variant="contained"
							// disabled={isSubmitting}

							// style={{  color: 'white', backgroundColor: 'black' }}

							>
								Next
							</Button>
							{/* <button type="button" onClick={() => handleSubmit()}>Next</button> */}
						</Stack>


					</Form>
				)}
			</Formik>

		</div >
	);
}

export default AlertProfileStep;