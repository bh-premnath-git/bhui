import { useFormContext } from 'react-hook-form';
import { Button, FormControlLabel, FormLabel, InputLabel, MenuItem, Radio, RadioGroup, TextField, Stack } from '@mui/material';
import 'react-toastify/dist/ReactToastify.css';
import { Formik, Form, Field, ErrorMessage, useFormikContext } from 'formik';
import * as Yup from 'yup';
import { useEffect, useState } from 'react';
import useToast from '../../../../../oldcomponents/teast-service';
import ApiService from '../../../../../Services/ApiServices';
import { ToastContainer } from 'react-toastify';




const schema = Yup.object().shape({
	access_type_cd: Yup.string().required('Access Type is required'),
	access_details: Yup.object().shape({
		aws_access_key_id: Yup.string().required('Access Key is required'),
		aws_secret_access_key: Yup.string().required('Access Key is required'),

	})
});



function AccessDetailsTab(props: any) {
	const [ToastComponent, showToast] = useToast();
	const [accessList, setAccessList] = useState([]);
	const { onNext, project, onBack } = props;
	const [isTestConnection, setIsTestConnection] = useState(false);
	const [isNextButtonDisabled, setIsNextButtonDisabled] = useState(false);

	const methods = useFormContext();
	const [initialValue, setInitialValue]: any = useState({

		access_type_cd: '',
		access_details: {
			aws_access_key_id: '',
			aws_secret_access_key: ''
		}

	});
	useEffect(() => {
		console.log(props.data)
		const fetchData = async () => {
			try {
				const result = await ApiService('8011', 'get', '/codes_hdr/3');
				console.log(result.codes_dtl);
				setAccessList(result.codes_dtl)
				console.log(accessList);
			} catch (error) {
				console.error('Error fetching data:', error);
			}
		};
		fetchData();

		if (props.data) {
			const fetchAccessDetail = async () => {
				try {
					const result = await ApiService('8011', 'get', `/bh_project/${props.data}`);
					console.log(result);
					if (result && result?.access_details) {
						setInitialValue({ access_type_cd: result?.access_type_cd, access_details: result?.access_details })
					}
					// setAccessList(result.codes_dtl)
					// console.log(accessList);
				} catch (error) {
					console.error('Error fetching data:', error);
				}
			};
			fetchAccessDetail()
		}
		return () => {
		};
	}, []);

	const updateAccessDetails = async (data: any) => {
		var bh_broject_id = props.data;
		const result = await ApiService('8011', 'put', `bh_project/${bh_broject_id}`, data);
		console.log(result)
		if (result) {
			onNext(data)

		}
	}

	// const showToaster = () => {
	// 	console.log(props.data)

	// 	showToast('Restart request has been submitted successfully', { vertical: 'top', horizontal: 'center' });
	// };
	const handleClick = async (values) => {
		console.log(values);

		const { aws_access_key_id, aws_secret_access_key } = values.access_details;

		// Check if both access key and secret access key are filled
		if (aws_access_key_id && aws_secret_access_key) {
			var body = values.access_details;
			try {
				const result = await ApiService('8011', 'post', '/aws/test_connection', body);
				console.log(result);

				if (result.status) {
					setIsTestConnection(true);
					showToast('Connection successful', { color: '#00b060' });
				} else {
					setIsTestConnection(false);
					showToast('Invalid credentials', { color: 'red' });
				}
			} catch (e) {
				setIsTestConnection(false);
				showToast('Invalid credentials', { color: 'red' });
			}
		} else {
			// Handle case where keys are empty
			setIsTestConnection(false);
			showToast('Please enter both Access Key and Secret Access Key', { color: 'red' });
		}
	};


	const handleNextClick = () => {
		if (isTestConnection) {
			// Proceed with the next action
			console.log('Proceeding to the next step...');
			// Implement your next step logic here
		} else {
			console.log('Next button is disabled');
		}
	};
	console.log(isTestConnection)

	return (
		<>
			<Formik
				initialValues={initialValue}
				validationSchema={schema}
				enableReinitialize={true}

				onSubmit={(values, { setSubmitting }) => {
					// Handle form submission
					console.log(values);
					updateAccessDetails(values)
					// onNext(values);

					setSubmitting(false);
				}}
			>
				{({ isSubmitting, isValid, dirty, values }) => (
					<Form>
						<div className='text-left pt-10 mb-10'>
							<h6 className='pt-3 mb-3'>Manually Create AWS Stack</h6>
							{/* <div className='w-75 py-3 m-auto'>
								Follow the steps below to configure storage, compute, and network settings in the AWS Console. BigHammer.ai will create all the required infrastructure in AWS.
								Please <a href="#">click here</a>   to understand list of persmission required for the account and list of infrastructure created.
							</div> */}
						</div>

						<div className='w-75 m-auto'>
							{/* <div style={{ marginBottom: '8px', fontSize: '14px', textAlign: 'start' }}>
								<label>Access Type</label> <span style={{ color: 'red', paddingTop: '6px' }}>*</span>
							</div> */}
							<Field name="access_type_cd">
								{({ field }: any) => (
									<RadioGroup {...field} row className="SwombSettings-group">

										{
											accessList.map((access: any) => (
												<FormControlLabel key={access.id} value={access.id} control={<Radio style={{ color: "green" }} />} label={access.dtl_desc} />
											))
										}

									</RadioGroup>
								)}
							</Field>
							<div style={{ color: 'red', marginTop: '8px', textAlign: 'start' }}>
								<ErrorMessage name="access_type_cd" component="div" />
							</div>
						</div>
						{/* {values..map((connection, index) => ( */}
						<>
							<div className="row my-2 w-75 m-auto">

								<div className='col-6'>


									<div style={{ marginBottom: '8px', fontSize: '14px', textAlign: 'start' }}>
										<label htmlFor="access_details.aws_access_key_id" >Access Key</label> <span style={{ color: 'red', paddingTop: '6px' }}>*</span>
									</div>
									<Field name="access_details.aws_access_key_id" type='password' as={TextField} placeholder="Enter Access Key" variant="outlined" fullWidth className='shadow-sm' />
									<div style={{ color: 'red', marginTop: '8px', textAlign: 'start' }}>
										<ErrorMessage name="access_details.aws_access_key_id" component="div" />
									</div>
								</div>

								<div className='col-6'>
									<div style={{ marginBottom: '8px', fontSize: '14px', textAlign: 'start' }}>
										<label htmlFor="access_details.aws_secret_access_key">Secret Access Key</label> <span style={{ color: 'red', paddingTop: '6px' }}>*</span>
									</div>
									<Field name="access_details.aws_secret_access_key" type='password' as={TextField} placeholder="Enter Secret Access Key" className='shadow-sm' variant="outlined" fullWidth />
									<div style={{ color: 'red', marginTop: '8px', textAlign: 'start' }}>
										<ErrorMessage name="access_details.aws_secret_access_key" component="div" />
									</div>
								</div>
							</div>
							<br></br>
							<div className="text-left">
								<Button
									sx={{ textTransform: 'none' }}
									variant="contained"
									className="bg-dark text-white"
									aria-label="Sign in"
									size="large"
									onClick={() => handleClick(values)}
								>
									Validate Access
								</Button>
								<ToastContainer />
								<div>
									<ToastComponent />
								</div>
							</div>
						</>
						{/* ))} */}


						{/* <div className='text-center m-32'> */}
						<Stack direction={'row'} justifyContent={'space-between'} mt={5}>
							<Button className="ml-8 bg-secondary" sx={{ textTransform: 'none' }}
								variant="contained" onClick={onBack}>
								Back
							</Button>
							<Button sx={{ textTransform: 'none' }}
								className="ml-8 bg-dark text-white"
								variant="contained"
								disabled={!isTestConnection}
								onClick={handleNextClick}
								type="submit"
							>
								Next
							</Button>
						</Stack>


					</Form>
				)}
			</Formik>




		</>
	);
}

export default AccessDetailsTab;
