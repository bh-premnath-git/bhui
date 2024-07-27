import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';
import { SyntheticEvent, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import _ from 'lodash';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import * as React from 'react';
import ProjectHeader from './ProjectHeader';
import ProjectDetailsTab from './tabs/ProjectDetailsTab';
import PreconfiguredZonesTab from './tabs/PreconfiguredZonesTab';
import CreateLakeTab from './tabs/CreateLakeTab';
import AccessDetailsTab from './tabs/AccessDetailsTab';
import ConfigureLifecyclePolicyTab from './tabs/ConfigureLifecyclePolicyTab';
import { Box, Step, StepButton, StepContent, StepLabel, Stepper } from '@mui/material';
/**
 * Form Validation Schema
 */
const schema = yup.object().shape({
	projectName: yup
		.string()
		.required('You must enter a project name')
		.min(5, 'The project name must be at least 5 characters')
});

/**
 * The project page.
 */
function Project({handleBreadStep}:any) {

	const [data, setData]: any = useState({});


	const routeParams = useParams();
	const [tabValue, setTabValue] = useState(0);
	const [noProject, setNoProject] = useState(false);
	const methods = useForm({
		mode: 'onChange',
		defaultValues: {},
		resolver: yupResolver(schema)
	});
	const { reset, watch } = methods;
	const form = watch();
	const [stepperData, setStepperData] = useState({
		bh_project_id: null,
		bh_project_cld_id: "",
		bh_project_name: "",
		bh_project_desc: "",
		cloud_provider_cd: "",
		cloud_region_cd: 0,
		access_type_cd: 0,
		access_details: {},
		Validation_status: false,
		business_url: "",
		lake_name: "",
		lake_desc: "",
		env_cd: 0,
		tags: {},
		status_cd: 0,
		preconfigured_zone: {},
		standard_zone: {},
		archive_zone: {}
	});
	
	const steps = [
		'Project Details',
		'Access Details',
		'Configure Lake',
		'Preconfigured Zones',
		'Lifecycle Policy'
	];

	function handleTabChange(event: SyntheticEvent, value: number) {
		setTabValue(value);
	}

	useEffect(() => {
		handleBreadStep(activeStep);
	}, []);
	if (noProject) {
		return (
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1, transition: { delay: 0.1 } }}
				className="flex flex-col flex-1 items-center justify-center h-full"
			>
				<Typography
					color="text.secondary"
					variant="h5"
				>
					There is no such project!
				</Typography>
				<Button
					className="mt-24"
					component={Link}
					variant="outlined"
					to="/Admin-Console/Projects"
					color="inherit"
				>
					Go to Projects Page
				</Button>
			</motion.div>
		);
	}


	const [activeStep, setActiveStep] = React.useState(0);
	const [completed, setCompleted] = React.useState<{
		[k: number]: boolean;
	}>({});

	const totalSteps = () => {
		return steps.length;
	};

	const completedSteps = () => {
		return Object.keys(completed).length;
	};

	const isLastStep = () => {
		return activeStep === totalSteps() - 1;
	};

	const allStepsCompleted = () => {
		return completedSteps() === totalSteps();
	};

	const handleNext = (formData: any) => {
		if (formData.bh_project_id) {
			var id = formData.bh_project_id;
			setData(id)
			console.log(id)
		}
		if (activeStep === 0) {
			console.log(formData)
			// var data=stepperData;
			// data.bh_project_id=formData.bh_project_id;
			// data.bh_project_cld_id=formData.bh_project_cld_id;
			// data.bh_project_name=formData.bh_project_name;
			// data.cloud_region_cd=formData.cloud_region_cd;
			// data.tags=formData.tags;


		} else if (activeStep === 1) {
			// var data=stepperData;
			// data.access_type_cd=formData.access_type_cd;
			// data.access_details=formData.access_details;
			// setStepperData(data)
			// console.log(stepperData)
		} else if (activeStep === 2) {
			var temp = stepperData;
			if (data !== undefined) {
				temp.bh_project_id = data;
			}
			temp.business_url = formData.business_url;
			temp.lake_name = formData.lake_name;
			temp.lake_desc = formData.lake_desc;
			temp.env_cd = formData.env_cd;
			setStepperData(temp)
			// console.log(stepperData)

		} else if (activeStep === 3) {
			// var data=stepperData;
			// data.preconfigured_zone=formData.preconfigured_zone;
			// setStepperData(data)
			// console.log(stepperData)
		} else if (activeStep === 4) {
			// var data=stepperData;
			// data.standard_zone=formData.standard_zone;
			// data.archive_zone=formData.archive_zone;
			// setStepperData(data)
			console.log(stepperData)
			// goToSave();
		}



		setActiveStep((prevActiveStep) => prevActiveStep + 1);
		handleBreadStep((prevActiveStep) => prevActiveStep + 1);

	};

	const handleBack = () => {

		setActiveStep((prevActiveStep) => prevActiveStep - 1);
		handleBreadStep((prevActiveStep) => prevActiveStep - 1);

	};

	const handleStep = (step: number) => () => {
		setActiveStep(step);
	};


	const handleReset = () => {
		setActiveStep(0);
		setCompleted({});
	};


	// if (_.isEmpty(form) || (project && routeParams.projectId !== project.id && routeParams.projectId !== 'new')) {
	// 	return <SwombLoading />;
	// }

	return (

		<>
			<ProjectHeader />
			<br></br>
			<div className="flex flex-col w-full border-0  shadow p-5 sm:w-auto sm:flex-row space-y-16 sm:space-y-0 flex-1 items-center justify-center space-x-16">
				<Box sx={{ width: '80%', m:'auto', paddingTop: '10px' }}>
					<Stepper activeStep={activeStep} alternativeLabel >
						{steps.map((label, index) => (
							<Step key={label} completed={completed[index]} sx={{
								'& .MuiStepLabel-root .Mui-completed': {
								  color: 'green', // circle color (COMPLETED)
								},
								'& .MuiStepLabel-label.Mui-completed.MuiStepLabel-alternativeLabel':
								  {
								  color: 'green', 
								  fontWeight:'bold'// Just text label (COMPLETED)
								  },
								'& .MuiStepLabel-root .Mui-active': {
								  color: 'black', 
								  fontWeight:'bold'
								  
								},
								'& .MuiStepLabel-label.Mui-active.MuiStepLabel-alternativeLabel':
								  {
								  color: 'black', // Just text label (ACTIVE)
								  },
								'& .MuiStepLabel-root .Mui-active .MuiStepIcon-text': {
								  fill: 'white', // circle's number (ACTIVE)
								},
								}}>
								<StepButton className='text-white' color="inherit" onClick={handleStep(index)}>
									{label}
								</StepButton>
							</Step>
						))}
					</Stepper>
					<div className="m-auto p-16 sm:p-24 max-w-3xl content-center text-center">
						{allStepsCompleted() ? (
							<React.Fragment>
								<Typography sx={{ mt: 2, mb: 1 }}>
									All steps completed - you&apos;re finished
								</Typography>
								<Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
									<Box sx={{ flex: '1 1 auto' }} />
									<Button onClick={handleReset}>Reset</Button>
								</Box>
							</React.Fragment>
						) : (
							<React.Fragment>
								<Box sx={{ width: '100%', justifyContent: 'left' }}>
									{activeStep === 0 ?
										<ProjectDetailsTab onNext={handleNext} data={data} onBack={handleBack} />
										: activeStep === 1 ? <AccessDetailsTab onNext={handleNext} data={data} onBack={handleBack} />
											: activeStep === 2 ? <CreateLakeTab onNext={handleNext} data={data} onBack={handleBack} />
												: activeStep === 3 ? <PreconfiguredZonesTab data={stepperData} onNext={handleNext} onBack={handleBack} />
													: <ConfigureLifecyclePolicyTab onNext={handleNext} data={data} onBack={handleBack} />}

								</Box>


							</React.Fragment>
						)}
					</div>
					{/* <Button onClick={handleBack} className="ml-8"
									variant="contained"

									color='secondary'>
									Back
								</Button> */}

				</Box>
			</div>


		</>
	);
}

export default Project;
