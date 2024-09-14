// src/features/stepper/stepperSlice.js
import { createSlice } from '@reduxjs/toolkit';
import ProjectDetailsTab from '../../pages/Admin-Console/Project/Component/tabs/EnvDetailsTab';

const initialState = {
  currentStep: 1,
  stepData: {
    ProjectDetails: {},
    accessDetails: {},
    lake: {},
    zone: {},
    lifeCycle: {},
  },
};

const projectSlice = createSlice({
  name: 'stepper',
  initialState,
  reducers: {
    nextStep: (state) => {
      state.currentStep += 1;
    },
    prevStep: (state) => {
      state.currentStep -= 1;
    },
    setStepData: (state: any, action) => {
      const { step, data } = action.payload;
      state.stepData[step] = data;
    },
    resetStepper: (state) => {
      state.currentStep = 1;
      state.stepData = {
        ProjectDetails: {},
        accessDetails: {},
        lake: {},
        zone: {},
        lifeCycle: {},
      };
    },
  },
});

export const { nextStep, prevStep, setStepData, resetStepper } = projectSlice.actions;

export default projectSlice.reducer;
