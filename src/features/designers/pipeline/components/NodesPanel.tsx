import React, { useMemo } from 'react';
import NodeDropList from '@/components/bh-reactflow-comps/builddata/NodeDropList';
import { usePipelineContext } from '@/context/designers/DataPipelineContext';
import nodeData from '@/pages/designers/data-pipeline/data/node_display.json'; 

const NodesPanel: React.FC = () => {
    const { handleNodeClick, addNodeToHistory } = usePipelineContext();
    const filteredNodes = useMemo(() => nodeData.nodes,[nodeData.nodes]); 

    return (
        <div className="flex justify-center gap-4 mb-4">
            <NodeDropList
                filteredNodes={filteredNodes}
                handleNodeClick={handleNodeClick}
                addNodeToHistory={addNodeToHistory}
            />
        </div>
    );
};

export default NodesPanel;