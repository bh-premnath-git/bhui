import { useFlow } from '@/context/designers/FlowContext';
import { useEffect, useState } from 'react';

export const usePipeline = (pipelineName: string | null) => {
    const { getPipelineDetails, flowPipeline } = useFlow();
    const [pipelineDetails, setPipelineDetails] = useState<any>(null);
    
    // Update pipelineDetails whenever pipelineName or flowPipeline changes
    useEffect(() => {
        const details = getPipelineDetails(pipelineName);
        setPipelineDetails(details);
    }, [pipelineName, getPipelineDetails, flowPipeline]);

    return { pipelineDetails };
};
