import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { mockRequirements, RequirementStatus, MappingChatMessage } from '@/utils/mockData';
import ReactFlow, { Background, Controls, Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import { Share2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

const RequirementDetails: React.FC = () => {
  const { id } = useParams();
  const requirement = mockRequirements.find(r => r.id === id);
  const [mappings, setMappings] = useState(requirement ? [...requirement.mappings] : []);
  const [status, setStatus] = useState(requirement ? requirement.status : RequirementStatus.PENDING);
  const [chatOpenIdx, setChatOpenIdx] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [showPipeline, setShowPipeline] = useState(true);

  if (!requirement) {
    return <div className="max-w-5xl mx-auto py-10 text-red-500">Requirement not found.</div>;
  }

  // Helper to check if all mappings are complete
  const allComplete = mappings.every(m => !m.needsInput || (m.userInput && m.userInput.trim() !== ''));

  // When user submits input for a mapping
  const handleUserInput = (idx: number) => {
    if (!inputValue.trim()) return;
    setMappings(prev => prev.map((m, i) => {
      if (i !== idx) return m;
      const newChat = [...(m.chatMessages || []), { role: 'user' as 'user', text: inputValue }];
      let systemMsg: MappingChatMessage | null = null;
      if (newChat.length < 6) {
        systemMsg = { role: 'system', text: 'Thank you. Please provide additional clarification.' };
      }
      return {
        ...m,
        chatMessages: systemMsg ? [...newChat, systemMsg] : newChat,
        userInput: newChat.length >= 6 ? inputValue : null,
        needsInput: newChat.length < 6
      };
    }));
    setInputValue('');
    setTimeout(() => {
      setMappings(prev => prev.map((m, i) => {
        if (i !== idx) return m;
        if (m.userInput) return { ...m, needsInput: false };
        return m;
      }));
      setChatOpenIdx(null);
    }, 1000);
  };

  React.useEffect(() => {
    if (allComplete && status !== RequirementStatus.COMPLETED) {
      setStatus(RequirementStatus.COMPLETED);
    }
  }, [allComplete, status]);

  // Generate pipeline nodes and edges from mappings
  const pipelineNodes: Node[] = mappings.map((m, idx) => ({
    id: String(idx + 1),
    data: { label: m.targetColumn || `Mapping ${idx + 1}` },
    position: { x: idx * 200, y: 100 },
  }));
  const pipelineEdges: Edge[] = mappings.length > 1
    ? mappings.slice(1).map((_, idx) => ({
        id: `e${idx + 1}-${idx + 2}`,
        source: String(idx + 1),
        target: String(idx + 2),
      }))
    : [];

  return (
    <div className="relative max-w-7xl mx-auto py-10 px-2 md:px-6">
      <h1 className="text-2xl font-bold mb-6">{requirement.name} - Mapping Requirements</h1>
      <div className="mb-4 flex items-center gap-4">
        <span className="text-sm text-muted-foreground">Status: <span className={`font-semibold ${status === RequirementStatus.COMPLETED ? 'text-green-600' : status === RequirementStatus.PENDING ? 'text-blue-600' : 'text-yellow-600'}`}>{status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span></span>
        <span className="text-sm text-muted-foreground">Total Mappings: <span className="font-semibold">{mappings.length}</span></span>
      </div>
      <div className="overflow-x-auto mb-8 rounded-lg shadow border bg-white">
        <table className="min-w-full text-xs md:text-sm">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              <th className="border px-3 py-2">S.No</th>
              <th className="border px-3 py-2">Target Table</th>
              <th className="border px-3 py-2">Target Column</th>
              <th className="border px-3 py-2">Target Data Type</th>
              <th className="border px-3 py-2">Source Connection</th>
              <th className="border px-3 py-2">Source Table(s)</th>
              <th className="border px-3 py-2">Source Column(s)</th>
              <th className="border px-3 py-2">Transformation / Rule</th>
              <th className="border px-3 py-2">Join/Lookup Details</th>
              <th className="border px-3 py-2">Status</th>
              <th className="border px-3 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {mappings.map((m, idx) => (
              <tr key={idx} className={
                `${m.needsInput ? 'bg-blue-50' : idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} transition-colors`}
              >
                <td className="border px-3 py-2 text-center">{idx + 1}</td>
                <td className="border px-3 py-2">{m.targetTable}</td>
                <td className="border px-3 py-2">{m.targetColumn}</td>
                <td className="border px-3 py-2">{m.targetDataType}</td>
                <td className="border px-3 py-2">{m.sourceConnection}</td>
                <td className="border px-3 py-2">{m.sourceTable}</td>
                <td className="border px-3 py-2">{Array.isArray(m.sourceColumns) ? m.sourceColumns.join(', ') : m.sourceColumns}</td>
                <td className="border px-3 py-2">{m.transformationRule || <span className="italic text-gray-400">{m.needsInput ? 'Pending Input' : '-'}</span>}</td>
                <td className="border px-3 py-2">{m.joinDetails}</td>
                <td className="border px-3 py-2">
                  {m.needsInput ? <span className="text-blue-600 font-semibold">Pending Input</span> : <span className="text-green-600 font-semibold">Complete</span>}
                </td>
                <td className="border px-3 py-2">
                  {m.needsInput && (
                    <Button size="sm" variant="outline" onClick={() => { setChatOpenIdx(idx); setInputValue(''); }}>
                      Provide Input
                    </Button>
                  )}
                  {m.userInput && !m.needsInput && (
                    <span className="text-xs text-gray-500">Input Provided</span>
                  )}
                  {/* Show chat history icon/button if chatMessages exist */}
                  {m.chatMessages && m.chatMessages.length > 0 && !m.needsInput && (
                    <Button size="sm" variant="ghost" onClick={() => setChatOpenIdx(idx)} title="View Conversation">
                      💬
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end">
        <Button variant="outline" onClick={() => window.history.back()}>Back</Button>
      </div>
      {status === RequirementStatus.COMPLETED && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded text-green-700 font-semibold text-center shadow">
          All required input has been provided. This requirement is now marked as <span className="underline">Completed</span>.
        </div>
      )}
      {/* Sliding Chat Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl border-l z-50 transform transition-transform duration-300 ease-in-out ${chatOpenIdx !== null ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ minWidth: 350 }}
      >
        {chatOpenIdx !== null && (
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between border-b px-4 py-3 bg-gray-100 sticky top-0 z-10">
              <h2 className="text-lg font-bold">Conversation for Mapping #{chatOpenIdx + 1}</h2>
              <button
                className="text-gray-500 hover:text-gray-800 text-xl font-bold px-2"
                onClick={() => setChatOpenIdx(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {(mappings[chatOpenIdx].chatMessages || []).map((msg: MappingChatMessage, i: number) => (
                <div key={i} className={`mb-2 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}> 
                  <div className={`px-3 py-2 rounded-lg max-w-xs ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>{msg.text}</div>
                </div>
              ))}
            </div>
            {/* Only show input if mapping is pending input */}
            {mappings[chatOpenIdx].needsInput && (
              <div className="p-4 border-t bg-white flex gap-2">
                <input
                  className="flex-1 border rounded p-2"
                  placeholder="Enter your response..."
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleUserInput(chatOpenIdx); }}
                  autoFocus
                />
                <Button onClick={() => handleUserInput(chatOpenIdx)} disabled={!inputValue.trim()}>
                  Send
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Pipeline View below table */}
      <div className="flex items-center gap-2 mb-2">
        <Switch checked={showPipeline} onCheckedChange={setShowPipeline} id="toggle-pipeline-view" />
        <label htmlFor="toggle-pipeline-view" className="text-sm text-muted-foreground select-none cursor-pointer">
          Show Pipeline View
        </label>
      </div>
      {showPipeline && (
        <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl shadow border p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Share2 className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold">Pipeline View</h2>
          </div>
          <div style={{ width: '100%', height: 400 }}>
            <ReactFlow nodes={pipelineNodes} edges={pipelineEdges} fitView>
              <Background />
              <Controls />
            </ReactFlow>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequirementDetails;