
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Connection } from '@/types/admin/connection';

interface ConnectionState {
  connection: Connection[];
  selectedconnection: Connection | null;
  loading: boolean;
  error: string | null;
}

const initialState: ConnectionState = {
  connection: [],
  selectedconnection: null,
  loading: false,
  error: null,
};

const connectionsSlice = createSlice({
  name: 'connections',
  initialState,
  reducers: {
    setconnection: (state, action: PayloadAction<Connection[]>) => {
      state.connection = action.payload;
    },
    setSelectedconnection: (state, action: PayloadAction<Connection | null>) => {
      state.selectedconnection = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setconnection, setSelectedconnection, setLoading, setError } = connectionsSlice.actions;
export default connectionsSlice.reducer;
