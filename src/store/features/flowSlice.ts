import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Flow } from '@/types/features/flow/types';

interface FlowState {
    flows: Flow[];
    flow: Flow | null;
    loading: boolean;
    error: string | null;
}

const initialState: FlowState = {
    flows: [],
    flow: null,
    loading: false,
    error: null,
};

const flowSlice = createSlice({
    name: 'flows',
    initialState,
    reducers: {
        setLoading(state, action: PayloadAction<boolean>) {
            state.loading = action.payload;
        },
        setError(state, action: PayloadAction<string | null>) {
            state.error = action.payload;
        },
        setFlows(state, action: PayloadAction<Flow[]>) {
            state.flows = action.payload;
            state.loading = false;
            state.error = null;
        },
        setFlow(state, action: PayloadAction<Flow>){
            state.flow = action.payload;
            state.loading = false;
            state.error = null;
        },
        clearDataSources(state) {
            state.flows = [];
            state.flow = null;
            state.loading = false;
            state.error = null;
          },
    }
}   );

export const { setLoading, setError, setFlows, setFlow } = flowSlice.actions;
export default flowSlice.reducer;
