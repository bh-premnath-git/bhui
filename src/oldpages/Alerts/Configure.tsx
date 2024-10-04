import {
	Box,
	Button,
	Typography,
	Stack,
	TextField,
	Paper,
	Stepper,
	Step,
	StepLabel,
} from "@mui/material";
import { debounce, } from 'lodash';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from "react-router-dom";
import TargetHeader from "../PublishData/TargetHeader";
import DialogueBox from "./DialogueBox";
import MonitorStep from "./components/MonitorStep";
import SourceStep from "./components/SourceStep";
import CriteriaStep from "./components/CriteriaStep";
import SelectScheduleStep from "./components/SelectSchedule";
import AlertChannelStep from "./components/AlertChannelStep";
import CommonDialog from "../../oldcomponents/common-dialoge";


/**
 * The Meta-Data app.
 */


function Configure(props: any) {

	// useEffect(() => {
	// 	fetchProject();

	// });
	// const[result]=props;

	const [noTarget, setNoTarget] = useState(false);
	const [initialValue, setInitialValue] = useState({
		data_src_name: "",
		source_file_path: ""
		// path:"",
	});
	const [showSuccessDialog, setShowSuccessDialog] = useState(false);
	const location = useLocation();
	const [currentIndex, setCurrentIndex] = useState<number>(location.state ? location.state : 0);

	const hu = props.fetchPathRegion;
	const steps = [
		'Monitor',
		'Select Source',
		'Select Criteria',
		'Select Schedule',
		'Select Alert Channel',

	];
	if (noTarget) {
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
					There is no such target!
				</Typography>
				<Button
					className="mt-24"
					component={Link}
					variant="outlined"
					to="/consumer/targets"
					color="inherit"
				>
					Go to Targets Page
				</Button>
			</motion.div>
		);
	}
	const [activeStep, setActiveStep] = React.useState(currentIndex);
	const [completed, setCompleted] = React.useState<{
		[k: number]: boolean;
	}>({});



	// const initialValues = {
	// 	data_src_name: "",
	// };





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
	const handleStep = (step: number) => () => {
		setActiveStep(step);
	};
	const handleReset = () => {
		setActiveStep(0);
		setCompleted({});
	};
	const toggleSuccessDialog = () => {
		setShowSuccessDialog(!showSuccessDialog);
	};

	const handleNext = () => {
		setActiveStep((prevActiveStep) => prevActiveStep + 1);

	};
	const handleNext1 = () => {
		if (isLastStep()) {
			toggleSuccessDialog();
			handleClickOpen();

			setTimeout(() => {
				// Close the dialog after 4 seconds
				handleClose();
			}, 4000); // 4000 milliseconds = 4 seconds
		}
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
			<TargetHeader />
			<div className="flex flex-col w-full border-1  shadow p-10 sm:w-auto sm:flex-row space-y-16 sm:space-y-0 flex-1 items-center justify-center space-x-16">
				<Box sx={{ width: '80%', justifyContent: 'center', paddingTop: '30px', margin: 'auto', minHeight: '70vh' }}>
					<Stack ml={2}>
						<Stepper activeStep={activeStep} alternativeLabel >
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
									<StepLabel onClick={() => handleStep(index)}>
										{label}
									</StepLabel>
								</Step>
							))}
						</Stepper>
					</Stack>
					<div className=" content-center text-center" >
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
										< MonitorStep />
										: activeStep === 1 ? <SourceStep />
											: activeStep === 2 ? <CriteriaStep />
												: activeStep === 3 ? <SelectScheduleStep />
													: <AlertChannelStep />}
								</Box>
								<Box >
									{/* <Button
													color="inherit"
													disabled={activeStep === 0}
													onClick={handleBack}
													sx={{ mr: 1 }}
												>
													Back
												</Button> */}

									{/* <Box sx={{ flex: '1 1 auto' }} /> */}
									{/* <Button onClick={handleNext} sx={{ mr: 1 }}
													disabled={activeStep === 4}
												>
													Next
												// </Button> */}
									{/* // {activeStep !== steps.length && */}
									{/* // 	(completed[activeStep] ? (
												// 		<Typography variant="caption" sx={{ display: 'inline-block' }}>
												// 			Step {activeStep + 1} already completed
												// 		</Typography>
												// 	) : (
												// 		''
												// 	))} */}
									<Stack sx={{
										justifyContent: 'center',
										alignItems: 'center',
										display: 'flex',
										mt: 6


									}} >
										<Box >
											<Button variant="contained" sx={{
												color: 'white', backgroundColor: 'black', width: '200px', ml: 10,
												// disabled={ activeStep === 4}
												textTransform: 'none',
												'&:hover': {
													backgroundColor: 'black', // Set the background color to transparent on hover
												},


											}} onClick={() => { handleNext(); handleNext1(); }} >Next

												{/* <Typography variant="h6" sx={{ textTransform: 'none' }}>Next</Typography> */}
											</Button>
											{showSuccessDialog && (
												<CommonDialog
													open={open}
													onClose={handleClose}
													title=""
													description=" New Monitor Added"
													imageUrl="/src/assets/Successful.png"
													additionalContent="You'll be automatically redirected to homepage shortly"
												/>
											)}



										</Box>
									</Stack>
									{activeStep !== steps.length &&
										(completed[activeStep] ? (
											<Typography variant="caption" sx={{ display: 'inline-block' }}>
												Step {activeStep + 1} already completed
											</Typography>
										) : (
											''
										))}
								</Box>
							</React.Fragment>
						)}
					</div>
				</Box>
			</div>


		</>
	);
}

export default Configure;