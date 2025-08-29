import React from 'react';
import {ReactFlow,  Node, Edge } from '@xyflow/react';

interface PipelineCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: any) => void;
  nodeTypes: any;
  edgeTypes: any;
  highlightedNodeId: string | null;
}

export const PipelineCanvas: React.FC<PipelineCanvasProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  nodeTypes,
  edgeTypes,
  highlightedNodeId,
}) => {
  const defaultViewport = { x: 0, y: 0, zoom: 0.7 };

  return (
    <div style={{ height: '7  5vh', width: '100%' }}>
      <ReactFlow
        nodes={nodes.map(node => ({
          ...node,
          selected: node.selected || false,
          style: {
            ...node.style,
            ...(highlightedNodeId === node.id && {
              background: 'linear-gradient(to right, rgba(59, 130, 246, 0.05), rgba(59, 130, 246, 0.1))',
              boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.3), 0 4px 12px rgba(59, 130, 246, 0.1)',
              borderRadius: '12px',
              padding: '4px',
              zIndex: 1000,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            })
          }
        }))}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultViewport={defaultViewport}
        minZoom={0.2}
        maxZoom={1.5}
        fitView
        fitViewOptions={{ padding: 0.2, maxZoom: 0.8 }}
        proOptions={{ hideAttribution: true }}
      />
    </div>
  );
}; 