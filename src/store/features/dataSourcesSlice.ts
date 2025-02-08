import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DataSource } from '@/types/data-catalog.types';

interface DataSourcesState {
  data: DataSource[];
  loading: boolean;
  error: string | null;
}

const initialState: DataSourcesState = {
  data: [],
  loading: false,
  error: null,
};

const dataSourcesSlice = createSlice({
  name: 'dataSources',
  initialState,
  reducers: {
    setDataSources(state, action: PayloadAction<any[]>) {
      state.data = action.payload;
      state.loading = false;
      state.error = null;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.loading = false;
    },
    clearDataSources(state) {
      state.data = [];
      state.loading = false;
      state.error = null;
    },                      
  },
});

export const { setDataSources, setLoading, setError, clearDataSources } = dataSourcesSlice.actions;
export default dataSourcesSlice.reducer;
