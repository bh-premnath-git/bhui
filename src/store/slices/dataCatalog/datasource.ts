
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DataSource } from '@/types/data-catalog/dataCatalog';  

interface DataSourceState {
  environments: DataSource[];
  selectedEnvironment: DataSource | null;
  loading: boolean;
  error: string | null;
}

const initialState: DataSourceState = {
  environments: [],
  selectedEnvironment: null,
  loading: false,
  error: null,
};

const environmentsSlice = createSlice({
  name: 'environments',
  initialState,
  reducers: {
    setEnvironments: (state, action: PayloadAction<Environment[]>) => {
      state.environments = action.payload;
    },
    setSelectedEnvironment: (state, action: PayloadAction<Environment | null>) => {
      state.selectedEnvironment = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setEnvironments, setSelectedEnvironment, setLoading, setError } = environmentsSlice.actions;
export default environmentsSlice.reducer;