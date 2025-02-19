
import { configureStore } from '@reduxjs/toolkit';
import usersReducer from './slices/admin/usersSlice';
import projectsReducer from './slices/admin/projectsSlice';
import environmentsReducer from './slices/admin/environmentsSlice';
import dataSourceReducer from './slices/dataCatalog/datasourceSlice';
import pipelineReducer from './slices/designer/pipelineSlice';
import dataopshubReducer from './slices/dataops/dataOpsHubSlice';
import alertHubReducer from './slices/dataops/alertHubSlice';

export const store = configureStore({
  reducer: {
    users: usersReducer,
    projects: projectsReducer,
    environments: environmentsReducer,
    datasource: dataSourceReducer,
    pipeline: pipelineReducer,
    dataOpsHub: dataopshubReducer,
    alertHub: alertHubReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
