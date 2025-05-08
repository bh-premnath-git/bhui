import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TaskDetails } from '@/types/dataops/dataOpsHub';

interface TaskDetailState {
  taskDetails: TaskDetails[];
  selectedTaskDetail: TaskDetails | null;
  loading: boolean;
  error: string | null;
}

const initialTaskDetailState: TaskDetailState = {
  taskDetails: [],
  selectedTaskDetail: null,
  loading: false,
  error: null,
};

const taskDetailSlice = createSlice({
    name: 'taskDetail',
    initialState: initialTaskDetailState,
    reducers: {
      setTaskDetails: (state, action: PayloadAction<TaskDetails[]>) => {
        state.taskDetails = action.payload;
      },
      setSelectedTaskDetail: (state, action: PayloadAction<TaskDetails | null>) => {
        state.selectedTaskDetail = action.payload;
      },
      setLoading: (state, action: PayloadAction<boolean>) => {
        state.loading = action.payload;
      },
      setError: (state, action: PayloadAction<string | null>) => {
        state.error = action.payload;
      },
    },
  });

export const { setTaskDetails, setSelectedTaskDetail, setLoading, setError } = taskDetailSlice.actions;
export default taskDetailSlice.reducer;