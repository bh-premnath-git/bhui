import { CATALOG_REMOTE_API_URL } from '@/config/platformenv';
import { apiService } from '@/lib/api/api-service';
import { Pipeline } from '@/types/designer/pipeline';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

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

export const patchPipelineOperation = createAsyncThunk(
    "pipeline/patchPipelineOperation",
    async (data: { pipelineId: number, data: Partial<Pipeline> }) => {
        const response = await apiService.patch<Pipeline>({
            baseUrl:CATALOG_REMOTE_API_URL,
            url: `/pipeline/${data.pipelineId}`,
            data: data.data,
            usePrefix: true,
            method: 'PATCH',
            metadata: {
                errorMessage: 'Failed to patch pipeline operation'
            }
        });
        return response;
    }
);

const pipelineSlice = createSlice({
    name: 'pipeline',
    initialState,
    reducers: {
        setPipelines: (state, action: PayloadAction<Pipeline[]>) => {
            state.pipelines = action.payload;
        },
        setSelectedPipeline: (state, action: PayloadAction<any | null>) => {
            state.selectedPipeline = action.payload;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(patchPipelineOperation.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(patchPipelineOperation.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.pipelines.findIndex(pipeline => pipeline.pipeline_id === action.payload.pipeline_id);
                if (index !== -1) {
                    state.pipelines[index] = action.payload;
                }
            })
            .addCase(patchPipelineOperation.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to patch pipeline operation';
            });
    }
});

export const { setPipelines, setSelectedPipeline, setLoading, setError } = pipelineSlice.actions;
export default pipelineSlice.reducer;