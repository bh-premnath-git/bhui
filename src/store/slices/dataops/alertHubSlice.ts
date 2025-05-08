import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AlertHub } from '@/types/dataops/alertsHub';

interface AlertHubState {
  alerts: AlertHub[];
  selectedAlert: AlertHub | null;
  loading: boolean;
  error: string | null;
}

const initialState: AlertHubState = {
  alerts: [],
  selectedAlert: null,
  loading: false,
  error: null,
};

const alertHubSlice = createSlice({
  name: 'alertHub',
  initialState,
  reducers: {
    setAlerts: (state, action: PayloadAction<AlertHub[]>) => {
      state.alerts = action.payload;
    },
    setSelectedAlert: (state, action: PayloadAction<AlertHub | null>) => {
      state.selectedAlert = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setAlerts, setSelectedAlert, setLoading, setError } = alertHubSlice.actions;
export default alertHubSlice.reducer;