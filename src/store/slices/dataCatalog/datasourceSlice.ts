import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DataSource } from '@/types/data-catalog/dataCatalog';  
interface DataSourceState {
  datasource: DataSource[];
  selectedDataSource: DataSource | null;
  loading: boolean;
  error: string | null;
}

const initialState: DataSourceState = {
  datasource: [],
  selectedDataSource: null,
  loading: false,
  error: null,
};

const dataSourceSlice = createSlice({
  name: 'datasource',
  initialState,
  reducers: {
    setDatasources: (state, action: PayloadAction<DataSource[]>) => {
      state.datasource = action.payload;
    },
    setSelectedDatasource: (state, action: PayloadAction<DataSource | null>) => {
      state.selectedDataSource = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setDatasources, setSelectedDatasource, setLoading, setError } = dataSourceSlice.actions;
export default dataSourceSlice.reducer;