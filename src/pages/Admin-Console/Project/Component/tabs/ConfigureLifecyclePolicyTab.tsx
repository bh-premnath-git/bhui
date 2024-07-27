import { Button , Stack } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import { Controller, useFormContext } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import ApiService from '../../../../../services/ApiServices';
import DialoguePopUp1 from './DialoguePopUp1';
import CommonDialog from '../../../../../components/common-dialoge';

/**
 * The shipping tab.
 * 
 * 
 * 
 */


const validationSchema = Yup.object().shape({
	zone_list: Yup.array().of(
		Yup.object().shape({
			lake_zone_cd: Yup.number(),
			lake_zone_name: Yup.string(),
			lake_zone_url: Yup.string().required('Zone URL is required'),
			lake_zone_std_days: Yup.number(),
			lake_zone_arch_days: Yup.number(),
			bh_project_id: Yup.number(),
		})
	)
});




function ConfigureLifecyclePolicyTab(props:any) {
	const { onNext, data, onBack } = props;
	const navigate = useNavigate();
	const [showSuccessDialog, setShowSuccessDialog] = useState(false);

	// const dispatch = useAppDispatch();
	const methods = useFormContext();
	const [codesDtl, setCodesDtl] = useState([]);

	const [initialValues, setInitialValues] = useState({
		zone_list: [{
			lake_zone_cd: 0,
			lake_zone_name: '',
			lake_zone_url: '',
			lake_zone_std_days: 0,
			lake_zone_arch_days: 0,
			bh_project_id: props.data.id
		}]
	});


	// function handleSaveProject() {
	// 	dispatch(saveProject(getValues() as ProjectType));
	// }

	useEffect(() => {
		getItem()
	}, []);

	const getItem = async () => {
		var value: any = await localStorage.getItem('codesDtl');
		setCodesDtl(JSON.parse(value))
		console.log(value);
	};

	function findValue(value:any) {
		if (Array.isArray(codesDtl)) {
			// Now you can safely use the filter method
			var filteredData: any = codesDtl.find((code:any) => code.id.toString() === value.toString());
			return filteredData?.dtl_desc.toString()
			// Further processing...
		} else {
			console.error('codesDtl is not an array.');
			return ''

		}

	}
	const location = useLocation();
	const userData = location.state;
	useEffect(() => {
		const delay = 500; // 2000 milliseconds = 2 seconds
		if (userData) {
			setInitialValues(userData)
		}
		const timerId = setTimeout(() => {
			const fetchData = async () => {
				try {
					const result = await ApiService('8011','get', `/bh_project/${props.data}`);
					console.log(result)
					setInitialValues({ zone_list: result.lake_zone })

				} catch (error) {
					console.error('Error fetching data:', error);
				}
			};

			fetchData();
		}, delay);

		// Clean-up function to clear the timer if the component unmounts
		return () => clearTimeout(timerId);
	}, []);



	const updateLifeCyclePolicy = async (values:any) => {
		console.log(values)
		for (let i = 0; i < values.zone_list.length; i++) {
			const result = await ApiService('8011','put', `bh_project/lake_zone/${values.zone_list[i].lake_zone_id}`, values.zone_list[i]);
			console.log(result)
		}

		await goToProject();
	}
	const goToProject = () => {
		navigate('/All Projects')

	}
	const toggleSuccessDialog = () => {
        setShowSuccessDialog(!showSuccessDialog);
    };
	const navigateProjects = () =>{
		navigate("/Home");
	}

	const handleNext1 = () => {
		toggleSuccessDialog();
		handleClickOpen();
		setTimeout(() => {
		  navigateProjects();
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
			<div className='text-center w-75 m-auto py-2'>
					Configure duration for which data needs to be stored. Please note life cycle policy is done as per the organisation governance standards. to know more about life cycle policy click here.
			</div>
			<Formik
				initialValues={initialValues}
				validationSchema={validationSchema}
				onSubmit={(values, { setSubmitting }) => {
					console.log(values);
					updateLifeCyclePolicy(values)
					// setSubmitting(false);
				}}
				enableReinitialize={true}

			>
				{({ values, isSubmitting }) => (
					<Form>
						<FieldArray name="zone_list">
							{({ push, remove }) => (

								<div className='m-auto'>
									<div className='text-start my-3'>
										<h6 className='pt-10 mb-10'>Days in Standard Zone</h6>
									</div>
									<div className='row -mx-5'>
										{values.zone_list?.map((zone, index) => (
											<div key={index} className='col-2 mx-2' >
												<div >
													<div style={{ marginBottom: '8px', fontSize: '14px', textAlign: 'start' }}>
														<label htmlFor={`zone_list.${index}.lake_zone_std_days`}>{findValue(values.zone_list[index].lake_zone_cd)} </label> <span style={{ color: 'red', paddingTop: '6px' }}>*</span>
													</div>
													<Field name={`zone_list.${index}.lake_zone_std_days`} as={TextField} variant="outlined" fullWidth className='shadow-sm' />
													<div style={{ color: 'red', marginTop: '8px', textAlign: 'start' }}>
														<ErrorMessage name={`zone_list.${index}.lake_zone_std_days`} component="div" />
													</div>
												</div>

											</div>
										))}

									</div>

									<div className='text-start my-3'>
										<h6 className='pt-10 mb-10'>Days in Archive Zone</h6>
									</div>
									<div className='row'>
										{values.zone_list?.map((zone, index) => (
											<div key={index} className='col-2 mx-2' >
												<div >
													<div style={{ marginBottom: '8px', fontSize: '14px', textAlign: 'start' }}>
														<label htmlFor={`zone_list.${index}.lake_zone_arch_days`}>{findValue(values.zone_list[index].lake_zone_cd)} </label> <span style={{ color: 'red', paddingTop: '6px' }}>*</span>
													</div>
													<Field name={`zone_list.${index}.lake_zone_arch_days`} as={TextField} variant="outlined" fullWidth className='shadow-sm'/>
													<div style={{ color: 'red', marginTop: '8px', textAlign: 'start' }}>
														<ErrorMessage name={`zone_list.${index}.lake_zone_arch_days`} component="div" />
													</div>
												</div>

											</div>
										))}

									</div>
								</div>

							)}
						</FieldArray>
						<Stack direction={'row'} justifyContent={'space-between'} mt={5}>
							<Button sx={{ textTransform: 'none' }}
								className="bg-secondary "
								variant="contained"
								onClick={onBack}
							>
								Back
							</Button>
							<Button sx={{ textTransform: 'none' }}
								className="bg-dark text-white"
								variant="contained"
								type="submit"
							onClick={handleNext1}>
								{/* Create Project */}
								{userData ? 'Update Project' : 'Create Project'}
							</Button>
							{showSuccessDialog && (
                         <CommonDialog
						 open={open}
						 onClose={handleClose}
						 title=""
						 description="Project Created Successfully"
						 imageUrl="/src/assets/Successful.png"
						 additionalContent="You'll be automatically redirected to homepage shortly"
					   />
                    )}
						</Stack>
					</Form>
				)}
			</Formik>
			{/* <Formik
				initialValues={{
					standard_zone: {
						bronze_zone: '0',
						silver_zone: '0',
						gold_zone: '0',
						log_zone: '0',
						quarantine_zone: '0',
					},
					archive_zone: {
						bronze_zone: '0',
						silver_zone: '0',
						gold_zone: '0',
						log_zone: '0',
						quarantine_zone: '0',
					},
				}}
				validationSchema={schema}
				onSubmit={(values, { setSubmitting }) => {
					console.log(values);
					navigate('/Admin-Console/Projects');
					onNext(values);

					setSubmitting(false);
				}}
			>
				{({ isSubmitting, isValid, dirty }) => (
					<Form>

						<div className='text-left pt-10 mb-10'>
							<h3 className='pt-10 mb-10'>Days in Standard Zone</h3>
						</div>


						<div className="flex -mx-5">
							<div className='m-2'>
								<Field name="standard_zone.bronze_zone" label='Bronze Zone' as={TextField} placeholder="Enter Project Name" variant="outlined" fullWidth />
								<div style={{ color: 'red', marginTop: '8px', textAlign: 'start' }}>
									<ErrorMessage name="standard_zone.bronze_zone" component="div" />
								</div>
							</div>
							<div className='m-2'>
								<Field name="standard_zone.silver_zone" label='Silver Zone' as={TextField} placeholder="Enter Project Name" variant="outlined" fullWidth />
								<div style={{ color: 'red', marginTop: '8px', textAlign: 'start' }}>
									<ErrorMessage name="standard_zone.silver_zone" component="div" />
								</div>
							</div>
							<div className='m-2'>
								<Field name="standard_zone.gold_zone" label='Gold Zone' as={TextField} placeholder="Enter Project Name" variant="outlined" fullWidth />
								<div style={{ color: 'red', marginTop: '8px', textAlign: 'start' }}>
									<ErrorMessage name="standard_zone.gold_zone" component="div" />
								</div>
							</div>
							<div className='m-2'>
								<Field name="standard_zone.log_zone" label='Log Zone' as={TextField} placeholder="Enter Project Name" variant="outlined" fullWidth />
								<div style={{ color: 'red', marginTop: '8px', textAlign: 'start' }}>
									<ErrorMessage name="standard_zone.log_zone" component="div" />
								</div>
							</div>
							<div className='m-2'>
								<Field name="standard_zone.quarantine_zone" label='Quarantine Zone' as={TextField} placeholder="Enter Project Name" variant="outlined" fullWidth />
								<div style={{ color: 'red', marginTop: '8px', textAlign: 'start' }}>
									<ErrorMessage name="standard_zone.quarantine_zone" component="div" />
								</div>
							</div>
						</div>

						<div className='text-left pt-10 mb-10'>
							<h3 className='pt-10 mb-10'>Days in Archive Zone</h3>
						</div>
						<div className="flex -mx-5">
							<div className='m-2'>
								<Field name="archive_zone.bronze_zone" label='Bronze Zone' as={TextField} placeholder="Enter Project Name" variant="outlined" fullWidth />
								<div style={{ color: 'red', marginTop: '8px', textAlign: 'start' }}>
									<ErrorMessage name="archive_zone.bronze_zone" component="div" />
								</div>
							</div>
							<div className='m-2'>
								<Field name="archive_zone.silver_zone" label='Silver Zone' as={TextField} placeholder="Enter Project Name" variant="outlined" fullWidth />
								<div style={{ color: 'red', marginTop: '8px', textAlign: 'start' }}>
									<ErrorMessage name="archive_zone.silver_zone" component="div" />
								</div>
							</div>
							<div className='m-2'>
								<Field name="archive_zone.gold_zone" label='Gold Zone' as={TextField} placeholder="Enter Project Name" variant="outlined" fullWidth />
								<div style={{ color: 'red', marginTop: '8px', textAlign: 'start' }}>
									<ErrorMessage name="archive_zone.gold_zone" component="div" />
								</div>
							</div>
							<div className='m-2'>
								<Field name="archive_zone.log_zone" label='Log Zone' as={TextField} placeholder="Enter Project Name" variant="outlined" fullWidth />
								<div style={{ color: 'red', marginTop: '8px', textAlign: 'start' }}>
									<ErrorMessage name="archive_zone.log_zone" component="div" />
								</div>
							</div>
							<div className='m-2'>
								<Field name="archive_zone.quarantine_zone" label='Quarantine Zone' as={TextField} placeholder="Enter Project Name" variant="outlined" fullWidth />
								<div style={{ color: 'red', marginTop: '8px', textAlign: 'start' }}>
									<ErrorMessage name="archive_zone.quarantine_zone" component="div" />
								</div>
							</div>
						</div>





						<div className='text-center m-20'>
							<Button
								className="ml-8 px-32"
								variant="contained"
								color='primary'
								type="submit"
								
							>
								Submit Project
							</Button>
						</div>

					</Form>
				)}
			</Formik> */}


			{/* <Button
				variant="contained"
				color="secondary"
				className="mt-16 px-32"
				aria-label="Sign in"
				size="large"
				// onClick={handleSaveProject}
				component={Link}
				to="/Admin-Console/Projects"
			>
				Submit Project
			</Button> */}

		</>
	);
}

export default ConfigureLifecyclePolicyTab;
