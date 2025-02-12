import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Environment } from '@/types/features/environment/types';

interface EnvironmentState {
    environments: Environment[];
    loading: boolean;
    error: string | null;
}

const initialState: EnvironmentState = {
    environments: [],
    loading: false,
    error: null,
};

const environmentSlice = createSlice({
    name: 'environments',
    initialState,
    reducers: {
        setLoading(state, action: PayloadAction<boolean>) {
            state.loading = action.payload;
        },
        setError(state, action: PayloadAction<string | null>) {
            state.error = action.payload;
        },
        setEnvironments(state, action: PayloadAction<Environment[]>) {
            state.environments = action.payload;
            state.loading = false;
            state.error = null;
        },
        clearDataSources(state) {
            state.environments = [];
            state.loading = false;
            state.error = null;
          },
    }
}   );

export const { setLoading, setError, setEnvironments } = environmentSlice.actions;
export default environmentSlice.reducer;
