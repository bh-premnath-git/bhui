
import { configureStore } from '@reduxjs/toolkit';
import usersReducer from './slices/admin/usersSlice';
import projectsReducer from './slices/admin/projectsSlice';
import environmentsReducer from './slices/admin/environmentsSlice';

export const store = configureStore({
  reducer: {
    users: usersReducer,
    projects: projectsReducer,
    environments: environmentsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
