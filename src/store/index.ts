
import { configureStore } from '@reduxjs/toolkit';
import usersReducer from './slices/admin/usersSlice';
import projectsReducer from './slices/admin/projectsSlice';
import environmentsReducer from './slices/admin/environmentsSlice';
import dataSourceReducer from './slices/dataCatalog/datasourceSlice';
import pipelineReducer from './slices/designer/pipelineSlice';
import { pipeline } from 'stream';

export const store = configureStore({
  reducer: {
    users: usersReducer,
    projects: projectsReducer,
    environments: environmentsReducer,
    datasource: dataSourceReducer,
    pipeline: pipelineReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
