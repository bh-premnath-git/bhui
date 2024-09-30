import { configureStore } from '@reduxjs/toolkit';
import BuildPipeLineSlice from './BuildPipeLineSlice';
import toggleReducer from './ToggleSlice';
import ProjectSlice from './ProjectSlice';
import FlowSlice from './FlowSlice';
import Environment from './EnvironmentSlice';

export const store = configureStore({
  reducer: {
    buildPipeLineApi: BuildPipeLineSlice,
    projectApi: ProjectSlice,
    environmentApi: Environment,
    toggle: toggleReducer,
    flowApi: FlowSlice
  },
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;

