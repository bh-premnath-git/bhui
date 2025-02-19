import { Pipeline } from '@/types/designer/pipeline';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PipelineState {
    pipelines: Pipeline[];
    selectedPipeline: Pipeline | null;
    loading: boolean;
    error: string | null;
}

const initialState: PipelineState = {
    pipelines: [],
    selectedPipeline: null,
    loading: false,
    error: null,
};

const pipelineSlice = createSlice({
    name: 'pipeline',
    initialState,
    reducers: {
        setPipelines: (state, action: PayloadAction<Pipeline[]>) => {
            state.pipelines = action.payload;
        },
        setSelectedPipeline: (state, action: PayloadAction<Pipeline | null>) => {
            state.selectedPipeline = action.payload;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
    },
});

export const { setPipelines, setSelectedPipeline, setLoading, setError } = pipelineSlice.actions;
export default pipelineSlice.reducer;