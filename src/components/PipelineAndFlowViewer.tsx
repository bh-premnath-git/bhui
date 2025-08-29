import React from 'react';
import { ReactFlow, Background, Controls, Panel } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const pipelineNodes = [
  { id: '1', data: { label: 'Read Data' }, position: { x: 0, y: 0 } },
  { id: '2', data: { label: 'Transform' }, position: { x: 250, y: 0 } },
  { id: '3', data: { label: 'Write Output' }, position: { x: 500, y: 0 } },
];
const pipelineEdges = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e2-3', source: '2', target: '3' },
];

const flowNodes = [
  { id: 'a', data: { label: 'Start' }, position: { x: 0, y: 0 } },
  { id: 'b', data: { label: 'Task 1' }, position: { x: 200, y: 0 } },
  { id: 'c', data: { label: 'Task 2' }, position: { x: 400, y: 0 } },
  { id: 'd', data: { label: 'End' }, position: { x: 600, y: 0 } },
];
const flowEdges = [
  { id: 'ea-b', source: 'a', target: 'b' },
  { id: 'eb-c', source: 'b', target: 'c' },
  { id: 'ec-d', source: 'c', target: 'd' },
];

export default function PipelineAndFlowViewer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tab, setTab] = React.useState<'pipeline' | 'flow'>('pipeline');
  return (
    <div
      className={`fixed top-0 right-0 h-full z-50 transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
      style={{ width: 900, maxWidth: '100vw', background: 'white', boxShadow: '-4px 0 24px rgba(0,0,0,0.15)' }}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between border-b px-6 py-4 bg-gray-100 sticky top-0 z-10">
          <div className="flex gap-4">
            <button className={`text-lg font-bold ${tab === 'pipeline' ? 'text-primary underline' : ''}`} onClick={() => setTab('pipeline')}>Pipeline</button>
            <button className={`text-lg font-bold ${tab === 'flow' ? 'text-primary underline' : ''}`} onClick={() => setTab('flow')}>Flow</button>
          </div>
          <button
            className="text-gray-500 hover:text-gray-800 text-2xl font-bold px-2"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-8 bg-white">
          <div style={{ height: 500 }}>
            {tab === 'pipeline' ? (
              <ReactFlow nodes={pipelineNodes} edges={pipelineEdges} fitView>
                <Background />
                <Controls />
              </ReactFlow>
            ) : (
              <ReactFlow nodes={flowNodes} edges={flowEdges} fitView>
                <Background />
                <Controls />
              </ReactFlow>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}