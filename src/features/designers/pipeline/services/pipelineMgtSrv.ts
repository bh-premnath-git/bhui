import { Pipeline } from '@/types/designer/pipeline';
import { useAppDispatch } from '@/hooks/uaeRedux';
import { setPipelines, setSelectedPipeline } from '@/store/slices/designer/pipelineSlice';

export interface PipelineManagementService {
    getPipelines(): Promise<Pipeline[]>;
    selectedPipeline(pipeline: Pipeline | null): Promise<Pipeline | null>;
}

export const usePipelineManagementService = () => {
    const dispatch = useAppDispatch();
    return ({
        setPipelines: (pipelines: Pipeline[]) => {
            dispatch(setPipelines(pipelines));
        },
        selectedPipeline: (pipeline: Pipeline | null) => {
            dispatch(setSelectedPipeline(pipeline));
        }
    })
}