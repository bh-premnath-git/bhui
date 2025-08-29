import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DataOpsHub } from '@/types/dataops/dataOpsHub';

interface DataOpsHubState {
  dataOpsHub: DataOpsHub[];
  selectedDataOpsHub: DataOpsHub | null;
  loading: boolean;
  error: string | null;
}

const initialState: DataOpsHubState = {
  dataOpsHub: [],
  selectedDataOpsHub: null,
  loading: false,
  error: null,
};

const dataOpsHubSlice = createSlice({
  name: 'dataOpsHub',
  initialState,
  reducers: {
    setDataOpsHubs: (state, action: PayloadAction<DataOpsHub[]>) => {
      state.dataOpsHub = action.payload;
    },
    setSelectedDataOpsHub: (state, action: PayloadAction<DataOpsHub | null>) => {
      state.selectedDataOpsHub = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setDataOpsHubs, setSelectedDataOpsHub, setLoading, setError } = dataOpsHubSlice.actions;
export default dataOpsHubSlice.reducer;
