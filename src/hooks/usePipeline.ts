import { useFlow } from '@/context/designers/FlowContext';

export const usePipeline = (pipelineName: string | null) => {
    const { getPipelineDetails } = useFlow();
    
    const pipelineDetails = getPipelineDetails(pipelineName);

    return { pipelineDetails };
};
