import { Controller, useFieldArray, useForm, useFormContext } from 'react-hook-form';
import { Button, Card, CardContent, FormControl, FormControlLabel, FormLabel, Grid, InputLabel, MenuItem, Radio, RadioGroup, Select, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionSummary } from '@mui/material';

import { ToastContainer, ToastPosition } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as yup from 'yup';
import { Formik, Form, FieldArray, Field, ErrorMessage } from 'formik';
import AddCircleIcon from '@mui/icons-material/AddCircle';

// const useStyles = makeStyles((theme) => ({
// 	root: {
// 		width: '100%',
// 		marginTop: '1%'
// 	},
// 	heading: {
// 		//   fontSize: theme.typography.pxToRem(15),
// 		//   fontWeight: theme.typography.fontWeightRegular,
// 	},
// }));
const selectBoxStyle = {
	width: '100%', // Adjust this value to match your text field width
	padding: '17px', // Adjust padding as needed
	fontSize: '14px', // Adjust font size as needed
	border: '1px solid #ccc', // Adjust border style as needed
	borderRadius: '4px', // Adjust border radius as needed

};

const validationSchema = yup.object().shape({
	connections: yup.array().of(
		yup.object().shape({
			connectionName: yup.string().required('Connection Name is required'),
			targetDeliveryPlatform: yup.string().required('Target Delivery Platform is required'),
			SnowflakeURL: yup.string(),
			SnowflakeUsername: yup.string(),
			SnowflakePassword: yup.string(),
			Warehouse: yup.string(),
		})
	)
});



function ConnectionDetailsStep(props) {
	const { onNext, data } = props;

	const { control, handleSubmit, formState: { errors }, reset } = useForm({
		// resolver: yupResolver(schema)
	});

	// const { control, formState } = methods;
	// const { errors } = formState;
	const [isExtended, setIsExtended] = useState(false);

	const toggleExtended = () => {
		setIsExtended(!isExtended);
	};
	// const classes = useStyles(); 
	const { fields, append } = useFieldArray({
		control,
		name: 'connections',
	});

	const onSubmit = (data) => {
		// Handle form submission here
		console.log(data);
	};
	useEffect(() => {
		append({})
		//Runs only on the first render
	}, []);

	const showToastMessage = () => {
		toast.success("Success Notification !", {
			position: 'top-center' as ToastPosition,
			progress: undefined,
			isLoading: false,
			hideProgressBar: true,
			style: {
				marginTop: '50px',
				fontWeight: 'bold',
				fontSize: '14px' // Adjust the margin-top value as needed
			},
		});

	};
	


	return (
		<>

			
			<Formik
				initialValues={{
					connections: [{ connectionName: '', targetDeliveryPlatform: '', SnowflakeUrl: '', SnowflakeUser: '', SnowflakePassword: '', wareHouse: '' }]
				}}
				validationSchema={validationSchema}
				// onSubmit={(values) => {
				// 	console.log(values);
				// }}
				onSubmit={(values, { resetForm }) => {
					console.log(values);
					resetForm(); // Optionally reset the form after submission
				}}
			>
				{/* <form onSubmit={handleSubmit(onSubmit)}> */}
				{({ values, errors, touched, handleSubmit }) => (
					<Form onSubmit={handleSubmit}>
						<div className="flex justify-center sm:justify-start flex-wrap -mx-92">
							<Typography sx={{ fontWeight: 'bold', marginTop: '5px' }} variant="body2">
								Add Connections
							</Typography>

							{/* {fields.map((field, index) => ( */}
							<FieldArray name="connections">
								{({ push, remove }) => (
									<>
										{values.connections.map((_, index) => (
											<div key={index}>
												<Accordion>
													<AccordionSummary
														expandIcon={<ExpandMoreIcon />}
														aria-controls={`panel${index}-content`}
														id={`panel${index}-header`}
													>
														<Typography sx={{ fontWeight: 'bold', marginTop: '10px' }}>{`Connection ${index + 1}`}</Typography>
													</AccordionSummary>
													<div className='m-12'>
														<div className='m-6'>
															<Grid container spacing={2} >
																<Grid item xs={6}>
																
																	<>
																		<Typography sx={{ fontWeight: '500', textAlign: 'start' }} variant="body2" >
																			Connection Name <span style={{ color: 'red' }}> *</span>
																		</Typography>


																		<Field name={`connections[${index}].connectionName`} type="text"
																			as={TextField}
																			fullWidth
																			variant="outlined"
																			required />
																		<div className="error" style={{ color: 'red', textAlign: 'start' }} >
																			<ErrorMessage
																				name={`connections[${index}].connectionName`} component="div" className="error"
																			/></div>


																	</>
																	
																</Grid>
																<Grid item xs={6}>
													                
																	<>
																		<Typography sx={{ fontWeight: '500', textAlign: 'start', }} variant="body2">
																			Target Delivery Platform <span style={{ color: 'red' }}> *</span>
																		</Typography>
																		<Field name={`connections[${index}].targetDeliveryPlatform`} as='select' fullWidth
																			style={selectBoxStyle}
																			variant="outlined"
																			required>
																			{/* <option value="">AWS - Redshift(wareHouse)</option> */}
																			<option value="SFTP">SFTP</option>
																			<option value="Snowflake-Warehouse">Snowflake Warehouse</option>
																			<option value={30}>AWS - Redshift (WareHouse)</option>
																			<option value={31}>AWS - S3 (Object Storage)</option>
																			<option value={32}>GCP - Cloud (Object Storage)</option>
																			<option value={35}>Databricks-Delta Lake</option>


																			{/* Add other options as needed */}
																		</Field>
																		<div className="error" style={{ color: 'red', textAlign: 'start' }} >
																			<ErrorMessage name={`connections[${index}].targetDeliveryPlatform`} component="div" className="error" /></div>
																		
																	</>
																</Grid>
															</Grid>
														</div>
														<div className='m-6'>
															<Grid container spacing={2} >
																<Grid item xs={6}>
																	{/* <Controller
													control={control}
													name="SnowflakeUrl"
													render={({ field }) => ( */}
																	<>
																		<Typography sx={{ fontWeight: '500', textAlign: 'start', marginTop: '8px' }} variant="body2" >
																			Snowflake URL
																		</Typography>
																		<Field name={`connections[${index}].SnowflakeUrl`} type="text"
																			as={TextField}
																			fullWidth
																			variant="outlined"
																			required />
																		<ErrorMessage name={`connections[${index}].SnowflakeUrl`} component="div" className="error" />


																		{/* <TextField
																			className="mt-10"
																			{...field}
																			placeholder="Snowflake URL"
																			id={`SnowflakeUrl${index}`}
																			error={!!errors[`SnowflakeUrl${index}`]}
																			helperText={errors[`SnowflakeUrl${index}`]?.message as String}
																			variant="outlined"
																			required
																			fullWidth
																		/> */}

																	</>
																	{/* )} */}
																	{/* /> */}
																</Grid>
																<Grid item xs={6} container spacing={2} >
																	<Grid item xs={6}>
																		{/* <Controller
														control={control}
														name="SnowflakeUser"
														render={({ field }) => ( */}
																		<>
																			<Typography sx={{ fontWeight: '500', textAlign: 'start', marginTop: '8px' }} variant="body2" >
																				Snowflake Username
																			</Typography>
																			<Field name={`connections[${index}].SnowflakeUser`} type="text"
																				as={TextField}
																				fullWidth
																				variant="outlined"
																				required />
																			<ErrorMessage name={`connections[${index}].SnowflakeUser`} component="div" className="error" />
																			{/* <TextField
																				className="mt-10"
																				{...field}
																				placeholder="Snowflake Username"
																				id={`SnowflakeUser${index}`}
																				error={!!errors[`SnowflakeUser${index}`]}
																				helperText={errors[`SnowflakeUser${index}`]?.message as String}
																				variant="outlined"
																				required
																				fullWidth

																			/> */}
																		</>
																		{/* )}
													/> */}
																	</Grid>
																	<Grid item xs={6}>
																		{/* <Controller
														control={control}
														name="SnowflakePassword"
														render={({ field }) => ( */}
																		<>
																			<Typography sx={{ fontWeight: '500', textAlign: 'start', marginTop: '8px' }} variant="body2" >
																				Snowflake Password
																			</Typography>
																			<Field name={`connections[${index}].SnowflakePassword`} type="password"
																				as={TextField}
																				fullWidth
																				variant="outlined"
																				required />
																			<ErrorMessage name={`connections[${index}].SnowflakePassword`} component="div" className="error" />
																			{/* <TextField
																				className="mt-10"
																				{...field}
																				placeholder="Snowflake Password"
																				id={`SnowflakePassword${index}`}
																				error={!!errors[`SnowflakePassword${index}`]}
																				helperText={errors[`SnowflakePassword${index}`]?.message as String}
																				variant="outlined"
																				required
																				fullWidth

																			/> */}
																		</>
																		{/* )}
													/> */}
																	</Grid>

																</Grid>
															</Grid>
														</div>
														<div className='m-6'>
															<Grid container spacing={2} >
																<Grid item xs={6}>
																	{/* <Controller
													control={control}
													name="wareHouse"
													render={({ field }) => ( */}
																	<>
																		<Typography sx={{ fontWeight: '500', textAlign: 'start' }} variant="body2" >
																			Warehouse
																		</Typography>
																		<Field name={`connections[${index}].wareHouse`} type="text" as={TextField}
																			fullWidth
																			variant="outlined"
																			required />
																		<ErrorMessage name={`connections[${index}].wareHouse`} component="div" className="error" />
																		{/* <TextField
																			className="mt-10"
																			{...field}
																			placeholder="Enter Warehouse"
																			id={`wareHouse${index}`}
																			error={!!errors[`wareHouse${index}`]}
																			helperText={errors[`wareHouse${index}`]?.message as String}
																			variant="outlined"
																			required
																			fullWidth
																		/> */}
																	</>
																	{/* )}
												/> */}
																</Grid>

															</Grid>
														</div>
														<ToastContainer />
														{/* <button type="button" onClick={() => remove(index)}>Remove</button> */}

														<div className="text-center p-4 m-8" style={{ color: 'blue' }}>
															<a onClick={showToastMessage} style={{ color: 'blue', fontSize: '14px', padding: '8px' }}>Test Connection</a>
														</div>
													</div>
												</Accordion>
											</div>


										))}
										<div className='text-left'>
											<Button
												className="group inline-flex items-center mt-2 -ml-4 py-2 px-4 rounded cursor-pointer"
												onClick={() => push({ connectionName: '', targetDeliveryPlatform: '', SnowflakeUrl: '', SnowflakeUser: '', SnowflakePassword: '', wareHouse: '' })}
											>
												<AddCircleIcon ></AddCircleIcon>
												<span className="ml-8 font-large text-secondary group-hover:underline" style={{ color: 'green', fontWeight: 'bold' }}>Add a Connection</span>
											</Button>
										</div>
										{/* <button type="button" onClick={() => handleSubmit()}>Submit</button> */}
										{/* <button type="button" onClick={() => push({ connectionName: '', targetDeliveryPlatform: '', SnowflakeUrl: '', SnowflakeUser: '', SnowflakePassword: '', wareHouse: '' })}>Add Connection</button> */}
									</>
								)}
							</FieldArray>
							{/* ))} */}


						</div >
					</Form >
				)
				}

				{/* </form> */}
			</Formik >

		</>
	);
}

export default ConnectionDetailsStep;