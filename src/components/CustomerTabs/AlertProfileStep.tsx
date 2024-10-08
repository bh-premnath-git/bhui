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
import ApiService from '@/Services/ApiServices';




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
		console.log(props.data)
		if (props.data) {
			const fetchConnection = async () => {
				try {
					const result = await ApiService('8011', 'get', `/customer/${props.data}`);
					console.log(result);
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
		// onNext(values)

		customerData.alert_setting = values;
		console.log(props.data)

		console.log('Form values:', customerData);
		try {
			// const url = `/customer${props.data}`;
			// const result = await ApiService('8011','put', url, customerData);
			const result = await ApiService('8011', 'put', `/customer/${props.data}`, customerData);

			console.log(result)
			onNext(result)
		}
		catch (error) {
			console.error('Error fetching Status', error);
		}
		console.log('Form values:', values);
		setSubmitting(false);
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
										size='small' 
										disabled checked={values.failure_delay} style={{ color: 'green' }}
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


							<Typography style={{ fontSize: '16px', fontWeight: '600', padding: '1%', marginTop: '1%' }}>Add Alert Channels</Typography>
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
										<Typography sx={{ fontWeight: '500' }} variant="body2" >
											Recipent Email ID {values?.Email && (<span style={{ color: 'red' }}> *</span>)}
										</Typography>
										<Field size='small' 
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

											fullWidth
										/>
										<div style={{ color: 'red' }}>
											<ErrorMessage name="email_id" component="div" /></div>
									</>


								</Grid>
								<Grid item xs={4}>

									<>
										<Typography sx={{ fontWeight: '500' }} variant="body2" >
											Add URL {values?.Slack && (<span style={{ color: 'red' }}> *</span>)}
										</Typography>
										<Field size='small' 
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

										/>
										<div style={{ color: 'red' }}>
											<ErrorMessage name="url" component="div" /></div>
									</>


								</Grid>

								{/* Second item in the row */}
								<Grid item xs={4}>

									<>
										<Typography sx={{ fontWeight: '500' }} variant="body2" >
											Add URL {values?.Teams && (<span style={{ color: 'red' }}> *</span>)}
										</Typography>
										<Field size='small' 
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

										/>
										<div style={{ color: 'red' }}>
											<ErrorMessage name="teamsUrl" component="div" />
										</div>
									</>

								</Grid>
							</Grid>

						</div>
						<br></br>
						<Stack direction={'row'} justifyContent={'space-between'}>
							<Button className="bg-secondary text-white"
							sx={{textTransform:'none'}}
								variant="contained"
								onClick={onBack}
							>

								Back
							</Button>
							<Button className="bg-dark text-white"
							sx={{textTransform:'none'}}
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