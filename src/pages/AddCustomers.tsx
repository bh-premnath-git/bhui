import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';
import { SyntheticEvent, useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import _ from 'lodash';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import * as React from 'react';
import { Box, FormControl, FormControlLabel, Radio, RadioGroup, Step, StepButton, StepContent, StepLabel, Stepper } from '@mui/material';
import CustomerDetailsStep from '@/components/CustomerTabs/CustomerDetailsStep';
import ConnectionStep from '@/components/CustomerTabs/ConnectionStep';
import AlertProfileStep from '@/components/CustomerTabs/AlertProfileStep';
import TaggingStep from '@/components/CustomerTabs/TaggingStep';
/**
 * Form Validation Schema
 */
const schema = yup.object().shape({
	name: yup
		.string()
		.required('You must enter a Consumer Name')
		.min(5, 'The Consumer Name must be at least 5 characters')
});

function AddCustomers() {
	const location = useLocation();
	const [manageCustomerId, setManageCustomerId] = useState(location.state?location.state?.customer_id:null);
	const [noCustomer, setNoCustomer] = useState(false);




	const steps = [
		'Customer Details',
		'Connection Details',
		'Alert Profile',
		'Client Setup'
	];


	useEffect(() => {
	}, []);
	if (noCustomer) {
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
					There is no such customer!
				</Typography>
				<Button
					className="mt-24"
					component={Link}
					variant="outlined"
					to="/Admin-Console/Customers"
					color="inherit"
				>
					Go to Customers Page
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

	const handleBack = () => {

		setActiveStep((prevActiveStep) => prevActiveStep - 1);

	};

	const completedSteps = () => {
		return Object.keys(completed).length;
	};

	const allStepsCompleted = () => {
		return completedSteps() === totalSteps();
	};

	const handleNext = (formData: any) => {
		console.log(formData)
		if (formData.customer_id) {
			setManageCustomerId(formData.customer_id)
		}
		console.log(formData.customer_id)

		// alert(1)
		setActiveStep((prevActiveStep) => prevActiveStep + 1);

	}

	const handleStep = (step: number) => () => {
		setActiveStep(step);
	};

	const handleReset = () => {
		setActiveStep(0);
		setCompleted({});
	};

// console.log(location.state)

	return (
		<>
			<div className="shadow p-4 rounded">
				<br></br>
				<Box sx={{ width: '75%', m: 'auto', paddingTop: '30px' }}>
					<Stepper activeStep={activeStep} alternativeLabel>
						{steps.map((label, index) => (
							<Step key={label} completed={completed[index]} sx={{
								'& .MuiStepLabel-root .Mui-completed': {
									color: 'green', // circle color (COMPLETED)
								},
								'& .MuiStepLabel-label.Mui-completed.MuiStepLabel-alternativeLabel':
								{
									color: 'green',
									fontWeight: 'bold'// Just text label (COMPLETED)
								},
								'& .MuiStepLabel-root .Mui-active': {
									color: 'black',
									fontWeight: 'bold'

								},
								'& .MuiStepLabel-label.Mui-active.MuiStepLabel-alternativeLabel':
								{
									color: 'black', // Just text label (ACTIVE)
								},
								'& .MuiStepLabel-root .Mui-active .MuiStepIcon-text': {
									fill: 'white', // circle's number (ACTIVE)
								},
							}}>
								<StepButton style={{ fontWeight: 'bold' }} color="inherit" onClick={handleStep(index)}>
									{label}
								</StepButton>
							</Step>
						))}
					</Stepper>
					<div className="m-auto max-w-3xl content-center text-center">
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
								<Box sx={{ width: '90%',margin:'auto' }}>
									{activeStep === 0 ?
										<CustomerDetailsStep onNext={handleNext} data={manageCustomerId} onBack={handleBack} />
										: activeStep === 1 ? <ConnectionStep onNext={handleNext} data={manageCustomerId} onBack={handleBack} />
											: activeStep === 2 ? <AlertProfileStep onNext={handleNext} data={manageCustomerId} onBack={handleBack} />
												: <TaggingStep onNext={handleNext} data={manageCustomerId} onBack={handleBack} />}
								</Box>

							</React.Fragment>
						)}
					</div>
				</Box>
			</div>

		</>
	);
}

export default AddCustomers;