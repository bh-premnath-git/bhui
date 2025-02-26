import { Pipeline } from '@/types/designer/pipeline';
import { useAppDispatch } from '@/hooks/useRedux';
import { setPipelines, setSelectedPipeline } from '@/store/slices/designer/pipelineSlice';

export interface PipelineManagementService {
    getPipelines(): Promise<Pipeline[]>;
    selectedPipeline(pipeline: Pipeline | null): Promise<Pipeline | null>;
}

export const usePipelineManagementService = () => {
    const dispatch = useAppDispatch();
    return ({
        setPipelines: (pipelines: any[]) => {
            dispatch(setPipelines(pipelines));
        },
        selectedPipeline: (pipeline: Pipeline | null) => {
            dispatch(setSelectedPipeline(pipeline));
        }
    })
}