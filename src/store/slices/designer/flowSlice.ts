import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Flow } from '@/types/designer/flow';

interface FlowState {
    flows: Flow[];
    selectedFlow: Flow | null;
    loading: boolean;
    error: string | null;
}

const initialState: FlowState = {
    flows: [],
    selectedFlow: null,
    loading: false,
    error: null,
};

const flowSlice = createSlice({
    name: 'flow',
    initialState,
    reducers: {
        setFlows: (state, action: PayloadAction<Flow[]>) => {
            state.flows = action.payload;
        },
        setSelectedFlow: (state, action: PayloadAction<Flow | null>) => {
            state.selectedFlow = action.payload;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
    },
});

export const { setFlows, setSelectedFlow, setLoading, setError } = flowSlice.actions;
export default flowSlice.reducer;