import React, { useEffect, useState } from 'react';
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import { Box, Button, Stack, Step, StepLabel, Stepper, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import TargetSteps from './TargetSteps';
import ConnectionDetailsStep from './ConnectionDetailsStep';
import DeliveryOptionsStep from './DeliveryOptionsStep';
import TaggingStep from './TaggingStep';
import DeliveryScheduleStep from './DeliveryScheduleStep';
import PublishAlertProfileStep from './PublishAlertProfile';
import ApiService from '../../Services/ApiServices';
import SwombLoading from '../Portal/SwombLoading';
import SuccessfulDialogueBox from './SuccessfulDialoguebox';
import './Step.css';
import Crumbs from '../../components/Breadcrumbs';
import CommonDialog from '../../components/common-dialoge';

const Target = ({handleBreadStep}:any) => {
  const location = useLocation();
  const [publishData, setPublishData] = useState<any>();
  const [publishdataId, setPublishdataId] = useState(location.state ? location.state?.id : null);
  const routeParams = useParams();
  const [noTarget, setNoTarget] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(location.state ? location.state?.step : 0);
  const [completed, setCompleted] = useState<{ [k: number]: boolean }>({});
  const [open, setOpen] = useState(false);
  const handleClose = () => {
		setOpen(false);
	  };

  const steps = [
    'Target Customer',
    'Source Details',
    'Delivery Options',
    'Tagging',
    'Schedule',
    'Alert Profile'
  ];

  const navigate = useNavigate();

  const totalSteps = () => steps.length;
  const completedSteps = () => Object.keys(completed).length;
  const isLastStep = () => activeStep === totalSteps() - 1;
  const allStepsCompleted = () => completedSteps() === totalSteps();

  const toggleSuccessDialog = () => {
    setShowSuccessDialog(!showSuccessDialog);
  };

  useEffect(() => {
	handleBreadStep(activeStep);
    if (publishdataId) {
      getData(publishdataId);
    } else if (location.state) {
      getData(location.state?.id);
    }
  }, [location.state]);

  async function getData(publishdataId) {
    setPublishdataId(publishdataId);
    const data = {};
    const result = await ApiService('8011', 'get', `/publish_data/publish_details/${publishdataId}`, data);
    if (result) {
      setPublishData(result);
    }
  }

  const handleNext = async (data: any) => {
    if (activeStep === 0) {
      setPublishdataId(data);
    }
    if (!isLastStep()) {
      const newActiveStep = isLastStep() && !allStepsCompleted()
        ? steps.findIndex((step, i) => !(i in completed))
        : activeStep + 1;
      if (newActiveStep === 2) {
        navigate('/publisher/runquarydetails', { state: publishdataId });
      } else {
        setActiveStep(newActiveStep);
	handleBreadStep(newActiveStep);

      }

    } else {
      toggleSuccessDialog();
      handleClickOpen()
       setTimeout(() => {
        navigate('/Designer/publish Data');
      }, 4000);
    }
  };
  const handleClickOpen = () => {
		setOpen(true);
	  };

  const handlePrivious = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
	handleBreadStep((prevActiveStep) => prevActiveStep - 1);

  };

  const handleStep = (step: number) => () => {
    setActiveStep(step);
  };

  if (status === 'loading') {
    return <SwombLoading />;
  }

  if (noTarget) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.1 } }}
        className="flex flex-col flex-1 items-center justify-center h-full"
      >
        <Typography color="text.secondary" variant="h5">
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

  return (
    <>
      {/* <Crumbs currentStep={activeStep} />  Pass the current step to the breadcrumbs component */}
      <div className="flex flex-col w-full border-1 shadow p-10 sm:w-auto sm:flex-row space-y-16 sm:space-y-0 flex-1 items-center justify-center space-x-16">
        <Box sx={{ width: '80%', justifyContent: 'center', paddingTop: '30px', margin: 'auto', minHeight: '70vh' }}>
          <Stack ml={2}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label, index) => (
                <Step key={label} completed={completed[index]} sx={{
                  '& .MuiStepLabel-root .Mui-completed': {
                    color: '#07A260',
                    fontFamily:'Inter !important'
                  },
                  '& .MuiStepLabel-label.Mui-completed.MuiStepLabel-alternativeLabel': {
                    color: '#07A260',
                    fontWeight: 'bold',
                    fontFamily:'Inter !important'
                  },
                  '& .MuiStepLabel-root .Mui-active': {
                    color: 'black',
                    fontWeight: 'bold',
                    fontFamily:'Inter !important'
                  },
                  '& .MuiStepLabel-label.Mui-active.MuiStepLabel-alternativeLabel': {
                    color: 'black',
                    fontFamily:'Inter !important'
                  },
                  '& .MuiStepLabel-root .Mui-active .MuiStepIcon-text': {
                    fill: 'white',
                    fontFamily:'Inter !important'
                  },
                }}>
                  <StepLabel onClick={() => handleStep(index)}>
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Stack>
          <div className="content-center text-center m-auto">
            <React.Fragment>
              <Box sx={{ width: '80%', justifyContent: 'center', m: 'auto' }}>
                {activeStep === 0 ? <TargetSteps handleNext={handleNext} publishData={publishData} publishId={publishdataId} />
                  : activeStep === 1 ? <ConnectionDetailsStep handlePrivious={handlePrivious} handleNext={handleNext} publishId={publishdataId} />
                  : activeStep === 2 ? <DeliveryOptionsStep handlePrivious={handlePrivious} handleNext={handleNext} publishId={publishdataId} />
                  : activeStep === 3 ? <TaggingStep publishId={publishdataId} handlePrivious={handlePrivious} handleNext={handleNext} />
                  : activeStep === 4 ? <DeliveryScheduleStep publishId={publishdataId} handlePrivious={handlePrivious} handleNext={handleNext} />
                  : <PublishAlertProfileStep publishId={publishdataId} handlePrivious={handlePrivious} handleNext={handleNext} />}
              </Box>
              <Box>
                <Stack sx={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  display: 'flex',
                  mt: 6
                }}>
                  <Box>
                  {showSuccessDialog && (
								 <CommonDialog
								 open={open}
								 onClose={handleClose}
								 title=""
								 description="Data published successfully"
								 imageUrl="/assets/success.png"
								 additionalContent="You'll be automatically redirected to homepage shortly"
							   />

                    )}
                  </Box>
                </Stack>
                {activeStep !== steps.length && completed[activeStep] && (
                  <Typography variant="caption" sx={{ display: 'inline-block' }}>
                    Step {activeStep + 1} already completed
                  </Typography>
                )}
              </Box>
            </React.Fragment>
          </div>
        </Box>
      </div>
    </>
  );
};

export default Target;