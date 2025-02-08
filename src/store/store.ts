import { configureStore } from '@reduxjs/toolkit';
import sidebarReducer from './features/sidebarSlice';
import userReducer from './features/userSlice';
import dataSourcesReducer from './features/dataSourcesSlice';
import managedUsersReducer from './features/manageUserSlice';
import operationReducer from './features/operationSlice';
import alertReducer from './features/alertSlice';
import buildPipeLineReducer from './oldstore/BuildPipeLineSlice';
import projectReducer from "./oldstore/ProjectSlice"
import autoSaveReducer from "./oldstore/features/autoSaveSlice"

export const store = configureStore({
  reducer: {
    sidebar: sidebarReducer,
    users: userReducer,
    dataSources: dataSourcesReducer,
    managedUsers: managedUsersReducer,
    operations: operationReducer,
    alerts: alertReducer,
    buildPipeLine: buildPipeLineReducer,
    projectApi: projectReducer,
    autoSave: autoSaveReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;