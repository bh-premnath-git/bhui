import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import _ from 'lodash';
import * as yup from 'yup';
import * as React from 'react';
import { Box, Grid, Step, StepButton, Stepper } from '@mui/material';
import CustomerDetailsStep from '@/components/CustomerTabs/CustomerDetailsStep';
import ConnectionStep from '@/components/CustomerTabs/ConnectionStep';
import AlertProfileStep from '@/components/CustomerTabs/AlertProfileStep';
import TaggingStep from '@/components/CustomerTabs/TaggingStep';
import { COLORS } from '@/Utils/constants';

/**
 * Form Validation Schema
 */
const schema = yup.object().shape({
	name: yup
		.string()
		.required('You must enter a Consumer Name')
		.min(5, 'The Consumer Name must be at least 5 characters')
});

function EditCustomer() {
	const location = useLocation();
	const navigate = useNavigate();
	const [manageCustomerId, setManageCustomerId] = useState(location.state?.rowData ? location.state?.rowData?.customer_id : null);
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
		if (formData.customer_id) {
			setManageCustomerId(formData.customer_id)
		}

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


	return (
		<>
			<div className="container shadow p-4 rounded w-10/12  m-auto mt-4">
				<Grid item xs={12} container justifyContent="flex-end">
					<Button
					sx={{
						backgroundColor: 'black',
						color: 'white',
						'&:hover': {
						backgroundColor: 'black',
						},
					}}
					className="mt-1"
					onClick={() => navigate('/AllCustomers')}
					>
					View All Customers
					</Button>
				</Grid>
				<br></br>
				
				<Box sx={{ width: '75%', m: 'auto', paddingTop: '30px' }}>
					<Stepper activeStep={activeStep} alternativeLabel>
						{steps.map((label, index) => (
							<Step key={label} completed={completed[index]} sx={{
								'& .MuiStepLabel-root .Mui-completed': { color: COLORS.green },
								'& .MuiStepLabel-label.Mui-completed.MuiStepLabel-alternativeLabel': {
									color: COLORS.green,
									fontWeight: 'bold'
								},
								'& .MuiStepLabel-root .Mui-active': {
									color: 'black',
									fontWeight: 'bold'
								},
								'& .MuiStepLabel-label.Mui-active.MuiStepLabel-alternativeLabel': { color: 'black' },
								'& .MuiStepLabel-root .Mui-active .MuiStepIcon-text': { fill: 'white' },
							}}>
								<StepButton style={{ fontWeight: 'bold' }} color="inherit" onClick={handleStep(index)}>
									{label}
								</StepButton>
							</Step>
						))}
					</Stepper>
					<div className="m-auto content-center text-center">
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
								<Box sx={{ width: '100%', margin: 'auto' }}>
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

export default EditCustomer;