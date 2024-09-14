import Button from '@mui/material/Button';
import { Link, useNavigate, useParams } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import * as Yup from 'yup';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import Box from '@mui/system/Box';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Autocomplete from '@mui/material/Autocomplete/Autocomplete';
import Checkbox from '@mui/material/Checkbox/Checkbox';
import { Chip, FormControl, FormControlLabel, Grid, Paper, Radio, RadioGroup, Typography } from '@mui/material';
import { Formik, Form, Field, FieldArray, ErrorMessage } from 'formik';
import { useLocation } from 'react-router';
import ApiService from '../../../../services/ApiServices';
import axios from 'axios';
import { notification } from 'antd';
import DialogueBox2 from './DialogueBox2';
import CommonDialog from '../../../../components/common-dialoge';



const schema = Yup.object().shape({
	bh_user_first_name: Yup.string().required('First Name is required'),
	bh_user_middle_name: Yup.string(),
	bh_user_last_name: Yup.string().required('Last Name is required'),
	user_email_id: Yup.string().email('Invalid email address').required('user_email_id is required'),
	user_status_cd: Yup.string().required('Please Select Status'),
	user_admin_status_cd: Yup.string().required('Please Select Is Admin User'),
	project_details: Yup.array().of(
		Yup.object().shape({
			project: Yup.object().required('Project is required'),
			projectRole: Yup.array().of(Yup.object().required('is required'))
		})
	)
});


function UserDetailsStep() {

	// { value: '1', label: 'Project 1' },
	// { value: '2', label: 'Project 2' },
	// { value: '3', label: 'Project 3' },
	// { value: '4', label: 'Project 4' }
	const [roles, setRoles] = React.useState([]);
	const [projects, setProjects] = React.useState([]);
	const [selectedOption, setSelectedOption] = useState('Enable');
	const [statusOptions, setStatusOptions] = React.useState([]);
	const [adminUsers, setAdminUsers] = React.useState([]);
	const [adminAccessToken, setAccessToken] = React.useState([]);
	const [showSuccessDialog, setShowSuccessDialog] = useState(false);

	const [initialValue, setInitialValue] = React.useState({
		bh_user_first_name: '',
		bh_user_middle_name: '',
		bh_user_last_name: '',
		user_email_id: '',
		user_status_cd: '',
		user_admin_status_cd: '',
		project_details: [{ project: null, projectRole: [] }]
	});
	const navigate = useNavigate();
	const location = useLocation();
	const userData = location.state;

	React.useEffect(() => {
		console.log(userData);
		if (userData) {
			setInitialValue(userData)
		}
		const fetchProjectRoles = async () => {
			try {
				const result = await ApiService('8011', 'get', '/codes_hdr/1');
				console.log(result)
				setRoles(result.codes_dtl);
			}
			catch (error) {
				console.error('Error fetching projects roles', error);
			}
		}


		const fetchStatus = async () => {

			try {
				const result = await ApiService('8011', 'get', '/codes_hdr/7');
				console.log(result)

				setStatusOptions(result.codes_dtl);

			}
			catch (error) {
				console.error('Error fetching Status', error);

			}
		}

		const fetchIsAdminUser = async () => {

			try {
				const result = await ApiService('8011', 'get', '/codes_hdr/22');
				console.log(result)

				setAdminUsers(result.codes_dtl);

			}
			catch (error) {
				console.error('Error fetching Status', error);

			}
		}
		const fetchProject = async () => {

			try {
				const result = await ApiService('8011', 'get', '/bh_project/search');
				console.log(result)
				var tempList: any = [];
				for (let i = 0; i < result.length; i++) {
					var data = { value: result[i]?.bh_project_id, label: result[i]?.bh_project_name }
					tempList.push(data);
				}
				console.log(tempList)
				setProjects(tempList)


				// setProjects(result.bh_project_name);

			}
			catch (error) {
				console.error('Error fetching Status', error);

			}
		}
		fetchProject()
		fetchProjectRoles();
		fetchStatus();
		fetchIsAdminUser();
		// handleSubmit();
		// getToken()

	}, []
	)

	const addUser = async (values: any, { setSubmitting }: any) => {
		// Log the form values
		console.log('Form values:', values);
		try {
			// console.log(values);
			if (userData) {
				console.log(userData.bh_user_id);
				const url = `/bh_user/${userData.bh_user_id}`; // Adjust the endpoint URL as needed
				const result = await ApiService('8011', 'put', url, values);
				console.log(result)

				if (result) {
					navigate(`/Admin-Console/Users`);
				}
			} else {
				createKeyCloakUser(values)
				// handleSubmit(values)

			}
		}
		catch (error) {
			console.error('Error fetching Status', error);

		}

		// Call another function here if needed


		// Set submitting to false to indicate form submission is complete
		setSubmitting(false);
	};
	async function add(value) {
		const url = '/bh_user'; // Adjust the endpoint URL as needed
		const result = await ApiService('8011', 'post', url, value);
		console.log(result)

		if (result) {
			handleNext1();
		}
	}

	const createKeyCloakUser = async (value) => {

		fetch('http://localhost:8005/create-user', {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				user: {
					username: `${value?.bh_user_first_name}`,
					email: value?.user_email_id,
					password: 'Bighammer@123',
					first_name: `${value?.bh_user_first_name}`,
					last_name: `${value?.bh_user_last_name}`,
					enabled: true,
					email_verified: true,
					credentials: [
						{
							type: 'password',
							value: 'password',
							temporary: false
						}
					]
				},
				token_data: {
					server_url: 'http://keycloak:8080',
					username: 'admin',
					password: 'password',
					grant_type: 'password',
					realm_name: 'master',
					client_id: 'admin-cli'
				}
			})
		})
			.then(response => {
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}
				return response.json();
			})
			.then(data => {
				add(value)
				console.log('User creation successful:', data);
				notification.success({
					message: 'User creation successful',
					duration: 3, // Duration in seconds
					placement: 'bottomRight', // Position of the snack bar
				});
			})
			.catch(error => {
				console.error('Error creating user:', error);
			});


	};
	const toggleSuccessDialog = () => {
		setShowSuccessDialog(!showSuccessDialog);
	};
	const navigateUsers = () => {
		navigate("/Admin Console/Manage Data Platform Users");
	}
	const handleNext1 = () => {
		toggleSuccessDialog();
		handleClickOpen();
		setTimeout(() => {
			navigateUsers();
		}, 4000); // 4000 milliseconds = 4 seconds
	};
	const [open, setOpen] = useState(false);

	const handleClickOpen = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};


	return (
		<>

			<div className="text-start">
				<Formik
					initialValues={initialValue}
					validationSchema={schema}
					onSubmit={addUser}
					enableReinitialize={true}

				>
					{({ values, isSubmitting, isValid, dirty, }) => (
						<Form>
							<Typography gutterBottom variant="subtitle1" color="text.secondary" style={{ width: '50%', margin: 'auto', padding: '4px', fontWeight: 400 }}>
								Please fill in the details below to add a new user
							</Typography>
							<Grid container spacing={2} style={{ marginTop: '12px' }}>
								<Grid item xs={3}>
									<div style={{ marginBottom: '8px', fontSize: '14px' }}>
										<label htmlFor="bh_user_first_name" >First Name</label> <span style={{ color: 'red', paddingTop: '6px' }}>*</span>
									</div>
									<Field name="bh_user_first_name" as={TextField} placeholder="Enter First Name" variant="outlined" fullWidth />
									<div style={{ color: 'red', marginTop: '8px' }}>
										<ErrorMessage name="bh_user_first_name" component="div" />
									</div>
								</Grid>
								<Grid item xs={3}>
									<div style={{ marginBottom: '8px', fontSize: '14px' }}>

										<label htmlFor="bh_user_middle_name">Middle Name</label>
									</div>

									<Field name="bh_user_middle_name" as={TextField} placeholder="Enter Middle Name" variant="outlined" fullWidth />

									<ErrorMessage name="bh_user_middle_name" component="div" />
								</Grid>
								<Grid item xs={3}>
									<div style={{ marginBottom: '8px', fontSize: '14px' }}>

										<label htmlFor="bh_user_last_name">Last Name</label> <span style={{ color: 'red', paddingTop: '6px' }}>*</span>
									</div>

									<Field name="bh_user_last_name" as={TextField} placeholder="Enter Last Name" variant="outlined" fullWidth />

									<div style={{ color: 'red', marginTop: '8px' }}>
										<ErrorMessage name="bh_user_last_name" component="div" />
									</div>
								</Grid>
							</Grid>
							<Grid container spacing={2} style={{ marginTop: '12px' }}>
								<Grid item xs={7} >
									<div style={{ marginBottom: '8px', fontSize: '14px' }}>

										<label htmlFor="user_email_id">Email Id</label> <span style={{ color: 'red', paddingTop: '6px' }}>*</span>
									</div>

									<Field name="user_email_id" as={TextField} placeholder="Enter Email ID" variant="outlined" fullWidth />
									<div style={{ color: 'red', marginTop: '8px' }}>

										<ErrorMessage name="user_email_id" component="div" />
									</div>
								</Grid>
							</Grid>
							<Grid container spacing={2}>
								<Grid item xs={6}>
									<Typography sx={{ fontWeight: '500', marginTop: '20px' }} variant="body2">
										Status <span style={{ color: 'red', paddingTop: '6px' }}>*</span>
									</Typography>
									<Field name="user_status_cd" >
										{/* as={RadioGroup} */}
										{({ field }: any) => (
											<RadioGroup {...field} style={{ flexDirection: 'row' }}>
												{statusOptions.map((option: any) => (
													<div style={{ display: 'flex' }}>
														{/* value="enable" abel="Enable" */}
														<FormControlLabel key={option.id}
															value={option.id}
															control={<Radio style={{ color: 'green' }} />}
															checked={selectedOption === option.dtl_desc}
															onChange={() => setSelectedOption(option.dtl_desc)}
															label={option.dtl_desc} />
														{/* <FormControlLabel value="disable" control={<Radio style={{ color: 'green' }} />} label="Disable" /> */}
													</div>
												))}
											</RadioGroup>
										)}
									</Field>

								</Grid>
								<Grid item xs={6}>
									<Typography sx={{ fontWeight: '500', marginTop: '20px' }} variant="body2">
										Is Admin User <span style={{ color: 'red', paddingTop: '6px' }}>*</span>
									</Typography>
									<Field name="user_admin_status_cd" >
										{/* as={RadioGroup} */}
										{({ field }: any) => (
											<RadioGroup {...field} style={{ flexDirection: 'row' }}>
												{adminUsers.map((option: any) => (
													<div style={{ display: 'flex' }}>

														<FormControlLabel value={option.id} key={option.id} control={<Radio style={{ color: 'green' }} />} label={option.dtl_desc} />
														{/* <FormControlLabel value="disable" control={<Radio style={{ color: 'green' }} />} label="No" /> */}
													</div>

												))}
											</RadioGroup>
										)}
									</Field>
								</Grid>
							</Grid>
							<FieldArray name="project_details" >
								{arrayHelpers => (
									<div style={{ marginTop: '20px' }}>
										{values.project_details.map((project, index) => (
											<Grid container spacing={2} key={index} style={{ marginTop: '12px' }}>
												<Grid item xs={6}>
													<div style={{ marginBottom: '8px', fontSize: '14px' }}>

														<label htmlFor={`project_details.${index}.project`}>Project</label> <span style={{ color: 'red', paddingTop: '6px' }}>*</span>
													</div>

													<Field
														name={`project_details.${index}.project`}
														render={({ field, form }: any) => (
															<Autocomplete
																{...field}
																options={projects}
																getOptionLabel={(option: any) => option.label}
																onChange={(event, value) => {
																	console.log(form.values)
																	form.setFieldValue(`project_details.${index}.project`, value);

																}}
																renderInput={(params) => <TextField {...params} placeholder="Select a project" />}
															/>
														)}
													/>
													<div style={{ color: 'red', marginTop: '8px' }}>

														<ErrorMessage name={`project_details.${index}.project`} component="div" />

													</div>
												</Grid>
												<Grid item xs={6}>
													<div style={{ marginBottom: '8px', fontSize: '14px' }}>

														<label htmlFor={`project_details.${index}.projectRole`}>Project Role</label> <span style={{ color: 'red', paddingTop: '6px' }}>*</span>
													</div>
													<Field
														name={`project_details.${index}.projectRole`}
														render={({ field, form }: any) => (
															<Autocomplete
																{...field}
																multiple
																options={roles}
																getOptionLabel={(option: any) => option.dtl_desc}
																onChange={(event, value) => {

																	form.setFieldValue(`project_details.${index}.projectRole`, value);
																}}
																renderOption={(_props, option: any, { selected }) => (
																	<li {..._props}>
																		<Checkbox style={{ marginRight: 8 }} checked={selected} />
																		{option.dtl_desc}
																	</li>
																)}
																renderInput={(params) => <TextField {...params} placeholder="Select roles" variant="outlined" />}
															/>
														)}
													/>
													<div style={{ color: 'red' }}>
														<ErrorMessage name={`project_details.${index}.projectRole`} component="div" />
													</div>											</Grid>
											</Grid>
										))}
										<Button
											type="button"
											onClick={() => {
												const data = values.project_details;
												const newProjectList = projects.filter((project: any) => !data.some((item: any) => item.project.value === project.value));
												setProjects(newProjectList);
												arrayHelpers.push({ project: null, projectRole: [] });
											}}
										>              <Typography sx={{ fontWeight: 'bold', marginTop: '12px', color: 'green' }} variant="body2">

												Add Project</Typography>
										</Button>
									</div>
								)}
							</FieldArray>



							<div className='text-center m-32'>
								<Button
									className="ml-8"
									variant="contained"
									// disabled={!dirty}
									type="submit"
									color='primary'
									disabled={!isValid || !dirty}
									// onClick={handleNext1}
								>
									{userData ? 'Update User' : 'Add User'}
								</Button>

							</div>
							{showSuccessDialog && (
								<CommonDialog
									open={open}
									onClose={handleClose}
									title=""
									description="User Added Successfully"
									imageUrl="/src/assets/Successful.png"
									additionalContent="You'll be automatically redirected to homepage shortly"
								/>

							)}
						</Form>
					)}
				</Formik >
			</div>


		</>
	);
}

export default UserDetailsStep;