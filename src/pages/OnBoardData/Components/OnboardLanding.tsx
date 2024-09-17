import { styled } from "@mui/material/styles";
import {
  Box,
  Button,
  Step,
  StepButton,
  Stepper,
  Typography,
  Stack,
  Theme
} from "@mui/material";
import * as yup from "yup";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import { Link, useNavigate, useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";

import OnboardSelectSource from "./OnboardSelectSource";
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import ApiService from "../../../Services/ApiServices";
import Sources from "./Sources";
import ConfigurationStep from "./ConfigurationStep";
import TaggingStep from "./TaggingStep";
import ScheduleStep from "./ScheduleStep";
import AlertProfileStep from "./Alertprofile";


type FormType = {
  sourceName: string;
};

const schema = yup.object().shape({
  sourceName: yup.string().required("sourceName is required"),
});

function OnboardLanding(props:any) {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const routeParams = useParams();
  const [sourceItem, setSourceItem]: any = useState();
  const [tags, setTags]:any = React.useState([]);


  const { targetStep } = routeParams;

  if (targetStep != null) {
    setCurrentIndex(parseInt(targetStep));
  }

  useEffect(() => {
    getItem();
    setCurrentIndex((prev) => prev);
    setActiveStep(currentIndex);
    props.handleBreadStep(currentIndex);
  }, [currentIndex, sourceItem]);

  const { control, watch, reset, handleSubmit, formState } = useForm<FormType>({
    mode: "all",
    resolver: yupResolver(schema),
  });
  const handleTagsFromChild = (newTags) => {
    setTags(newTags);
    console.log('Tags received from child:', newTags);
  };
  // const useStyles = makeStyles((theme: Theme) => ({
  //   button: {
  //     "&:hover": {
  //       backgroundColor: "black",
  //     },
  //   },
  //   fixedButton: {
  //     position: 'fixed',
  //     bottom: theme.spacing(2),
  //     left: '50%',
  //     transform: 'translateX(-50%)',
  //     zIndex: 1000, // Ensure it's above other elements
  //   },
  // }));
  const methods = useForm({
    mode: "onChange",
    defaultValues: {},
    resolver: yupResolver(schema),
  });
  const navigate = useNavigate();
  // const classes = useStyles();

  const steps = ["Onboard Data", "Configuration", "Tagging", "Schedule", "Alert Profile"];

  const [activeStep, setActiveStep] = React.useState(currentIndex);
  const [isFileSelect, setIsFileSelect] = React.useState(false);

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
  const handleNext1 = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
   
  };
const handleNext = () => {
    // alert(activeStep);
    console.log(sourceItem)


    const newActiveStep =
      isLastStep() && !allStepsCompleted()
        ? steps.findIndex((step, i) => !(i in completed))
        : activeStep + 1;
    // alert(newActiveStep);

    setActiveStep(newActiveStep);
    props.handleBreadStep(newActiveStep);
    if (activeStep === 4) {
      navigate("./Designer/Onboard Data");
    }
    
  };

  // const handleFirstNext = () => {
  //   setIsFileSelect(true);
  // };
  // const handleBack = () => {
  //   setActiveStep((prevActiveStep) => prevActiveStep - 1);
  // };

  const handleStep = (step: number) => () => {
    setActiveStep(step);
  };

  const handleComplete = (data_src_id) => {
    const newCompleted = completed;
    newCompleted[activeStep] = true;
    setCompleted(newCompleted);
    handleNext();
  };

  const handleReset = () => {
    setActiveStep(0);
    setCompleted({});
  };

  const [isSourceExist, setIsSourceExist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [codesDtl, setCodesDtl] = useState([]);

  const fetchSource = async (search: any) => {

    try {
      const params: any = {
        data_src_name: search
      };
      setIsLoading(true)
      const result = await ApiService('8011', 'get', '/data_source/check_src_exists', null, params);
      console.log(result);
      setIsSourceExist(result)
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error);
    }

  };
  const saveSource = async (data: any) => {
    console.log(data)
    var body: any = {
      "name": data.data_src_name,
      "source_file_path": data.source_file_path
    }
    try {
      const result = await ApiService('8011', 'post', '/author_data/process-file', body);
      console.log(result);
      // setPlatfomRegionList(result);
      setSourceItem(result);
      if (result) {
        setIsFileSelect(true)
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  const getItem = async () => {
    var value: any = await localStorage.getItem('codesDtl');
    setCodesDtl(JSON.parse(value))
    // console.log(value);
  };
 
  return (
    <div>
      <div className="m-auto ">
        <Stack direction={'row'} justifyContent={'space-around'}>
          {activeStep === 0 && isFileSelect ? (<Stack sx={{ mt: 3 }}>
            {sourceItem != null ? (<Typography className="text-14 sm:text-20 truncate font-semibold" sx={{ mt: 1 }}>{sourceItem?.data_source?.data_src_name}</Typography>
            ) : null}
          </Stack>) : (
            <Stack>

            </Stack>
          )}
          <Stepper
            activeStep={activeStep}
            alternativeLabel
            sx={{ marginY: 3, width: '70%' }}
          >
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
                <StepButton color="error" onClick={handleStep(index)}>
                  {label}
                </StepButton>
              </Step>
            ))}
          </Stepper>
          {activeStep === 0 && isFileSelect ? (<Stack sx={{ mt: 3 }}>
            <Button
              // component={Link}
              // to="/dataconfig/configurations/new"
              variant="contained"
              // color="primary"
              sx={{
                backgroundColor: '#008cda', color: 'white', '&:hover': {
                  backgroundColor: '#008cda', // Set your standard hover color
                },
              }}

            >

              <RemoveRedEyeOutlinedIcon sx={{ mr: 1 }} />
              View All Recipe
            </Button>
          </Stack>) : (
            <Stack>

            </Stack>
          )}
        </Stack>
        <div
          className="m-auto content-center text-start "
          style={{ width: "100%" }}
        >
          {allStepsCompleted() ? (
            <React.Fragment>
              <Typography sx={{ mt: 2, mb: 1 }}>
                All steps completed - you&apos;re finished
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
                <Box sx={{ flex: "1 1 auto" }} />
                <Button onClick={handleReset}>Reset</Button>
              </Box>
            </React.Fragment>
          ) : (
            <React.Fragment>

              {activeStep === 0 && !isFileSelect ? (
                <OnboardSelectSource search={fetchSource} path={saveSource} 
                isSourceExists={isSourceExist} />
              ) : activeStep === 0 && isFileSelect ? (
                <Sources sourceItem={sourceItem} codesDtl={codesDtl} handleNext={handleNext} />
              ) : activeStep === 1 ? (
                <ConfigurationStep sourceItem={sourceItem?.data_source?.data_src_id} handleNext={handleNext}/>
              ) : //   <ConfigurationStep />
                activeStep === 2 ? (
                  <TaggingStep handleNext={handleNext} sourceItem={sourceItem?.data_source?.data_src_id} onTagsChange={handleTagsFromChild}/>
                ) : activeStep === 3 ? (
                  <ScheduleStep sourceItem={sourceItem?.data_source?.data_src_id} tags={tags} handleNext={handleNext}/>
                ) : (<AlertProfileStep />)
              }


            </React.Fragment>
          )}
        </div>
        {/* <Stack sx={{
          justifyContent: 'center',
          alignItems: 'center',
          display: 'flex',
          mt: 6


        }} >
          <Box >
            <Button variant="contained" sx={{
              color: 'white', backgroundColor: 'black', width: '200px', ml: 7,

              textTransform: 'none',
              '&:hover': {
                backgroundColor: 'black',
              },


            }}    >Next


            </Button>


          </Box>
        </Stack> */}
      </div>
    </div>
  );
}

export default OnboardLanding;