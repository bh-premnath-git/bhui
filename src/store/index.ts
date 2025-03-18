import { configureStore } from '@reduxjs/toolkit';
import usersReducer from './slices/admin/usersSlice';
import projectsReducer from './slices/admin/projectsSlice';
import environmentsReducer from './slices/admin/environmentsSlice';
import dataSourceReducer from './slices/dataCatalog/datasourceSlice';
import pipelineReducer from './slices/designer/pipelineSlice';
import flowReducer from './slices/designer/flowSlice';
import dataopshubReducer from './slices/dataops/dataOpsHubSlice';
import alertHubReducer from './slices/dataops/alertHubSlice';
import layoutFiedlReducer from './slices/dataCatalog/layoutFieldSlice';
import autoSaveReducer from './slices/designer/features/autoSaveSlice';
import taskDetailSlice from './slices/dataops/taskDetailSlice';
import globalReducer from './slices/globalGitSlice';
import connectionReducer from './slices/admin/connection'
import buildPipelineReducer from './slices/designer/buildPipeLine/BuildPipeLineSlice'
import clusterReducer from './slices/designer/buildPipeLine/clusterSlice'

export const store = configureStore({
  reducer: {
    users: usersReducer,
    projects: projectsReducer,
    environments: environmentsReducer,
    connections: connectionReducer,
    datasource: dataSourceReducer,
    pipeline: pipelineReducer,
    flow: flowReducer,
    dataOpsHub: dataopshubReducer,
    alertHub: alertHubReducer,
    layoutField: layoutFiedlReducer,
    autoSave: autoSaveReducer,
    tasksetails: taskDetailSlice,
    global: globalReducer,
    buildPipeline: buildPipelineReducer,
    cluster: clusterReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
