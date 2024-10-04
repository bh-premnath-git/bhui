import { configureStore } from '@reduxjs/toolkit';
import BuildPipeLineSlice from '@/redux/BuildPipeLineSlice';
import toggleReducer from '@/redux/ToggleSlice';
import ProjectSlice from '@/redux/ProjectSlice';
import FlowSlice from '@/redux/FlowSlice';
import Environment from '@/redux/EnvironmentSlice';

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

