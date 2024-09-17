// src/redux/store.ts
import { configureStore } from '@reduxjs/toolkit';
import BuildPipeLineSlice from './BuildPipeLineSlice';
import toggleReducer from './ToggleSlice';
import ProjectSlice from './ProjectSlice';


export const store = configureStore({
  reducer: {
    buildPipeLineApi: BuildPipeLineSlice,
    projectApi: ProjectSlice,
    toggle: toggleReducer,
   

    
  },
});
export type RootState = ReturnType<typeof store.getState>;
export default store;

// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;
