import { Operation } from '@/types/dataops.types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface OperationState {
    operations: Operation[];
    loading: boolean;
    error: string | null;
}

const initialState: OperationState = {
    operations: [],
    loading: false,
    error: null,
};

const operationsSlice = createSlice({
    name: 'operations',
    initialState,
    reducers: {
        setOperations(state, action: PayloadAction<Operation[]>) {
            state.operations = action.payload;
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
        clearOperations(state) {
            state.operations = [];
            state.loading = false;
            state.error = null;
        }
    }
});
export const { setOperations, setLoading, setError, clearOperations } = operationsSlice.actions;
export default operationsSlice.reducer;