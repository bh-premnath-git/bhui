import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { mockRequirements, RequirementStatus, MappingChatMessage } from '@/utils/mockData';
import {ReactFlow,  Background, Controls, Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Share2, MessageCircle, CheckCircle, Clock, AlertCircle } from 'lucide-react';
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
    <div className="p-6">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">{requirement.name}</h1>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Badge variant={status === RequirementStatus.COMPLETED ? 'default' : status === RequirementStatus.PENDING ? 'secondary' : 'outline'}>
                {status === RequirementStatus.COMPLETED && <CheckCircle className="h-3 w-3 mr-1" />}
                {status === RequirementStatus.PENDING && <Clock className="h-3 w-3 mr-1" />}
                {status === RequirementStatus.IN_PROGRESS && <AlertCircle className="h-3 w-3 mr-1" />}
                {status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Total Mappings:</span>
              <Badge variant="outline">{mappings.length}</Badge>
            </div>
          </div>
        </div>

        {/* Mappings Table */}
        <Card>
          <CardHeader>
            <CardTitle>Mapping Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">S.No</TableHead>
                    <TableHead>Target Table</TableHead>
                    <TableHead>Target Column</TableHead>
                    <TableHead>Source Table</TableHead>
                    <TableHead>Source Columns</TableHead>
                    <TableHead>Transformation</TableHead>
                    <TableHead>Join/Lookup Details</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mappings.map((m, idx) => (
                    <TableRow key={idx} className={m.needsInput ? 'bg-blue-50/50' : ''}>
                      <TableCell className="text-center font-medium">{idx + 1}</TableCell>
                      <TableCell>{m.targetTable}</TableCell>
                      <TableCell>{m.targetColumn}</TableCell>
                      <TableCell>{m.sourceTable}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(m.sourceColumns) ? (
                            m.sourceColumns.slice(0, 2).map((col, colIdx) => (
                              <Badge key={colIdx} variant="secondary" className="text-xs">
                                {col}
                              </Badge>
                            ))
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              {m.sourceColumns}
                            </Badge>
                          )}
                          {Array.isArray(m.sourceColumns) && m.sourceColumns.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{m.sourceColumns.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate" title={m.transformationRule}>
                        {m.transformationRule || (
                          <span className="italic text-muted-foreground">
                            {m.needsInput ? 'Pending Input' : '-'}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs truncate" title={m.joinDetails}>
                        {m.joinDetails || '-'}
                      </TableCell>
                      <TableCell>
                        {m.needsInput ? (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending Input
                          </Badge>
                        ) : (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Complete
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {m.needsInput && (
                            <Button size="sm" variant="outline" onClick={() => { setChatOpenIdx(idx); setInputValue(''); }}>
                              Provide Input
                            </Button>
                          )}
                          {m.userInput && !m.needsInput && (
                            <Badge variant="outline" className="text-xs">
                              Input Provided
                            </Badge>
                          )}
                          {m.chatMessages && m.chatMessages.length > 0 && !m.needsInput && (
                            <Button size="sm" variant="ghost" onClick={() => setChatOpenIdx(idx)} title="View Conversation">
                              <MessageCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => window.history.back()}>Back</Button>
        </div>

        {/* Completion Message */}
        {status === RequirementStatus.COMPLETED && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-green-700 font-semibold text-center">
                <CheckCircle className="h-5 w-5" />
                All required input has been provided. This requirement is now marked as <span className="underline">Completed</span>.
              </div>
            </CardContent>
          </Card>
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
        {/* Pipeline View */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                Pipeline View
              </CardTitle>
              <div className="flex items-center gap-2">
                <Switch checked={showPipeline} onCheckedChange={setShowPipeline} id="toggle-pipeline-view" />
                <label htmlFor="toggle-pipeline-view" className="text-sm text-muted-foreground select-none cursor-pointer">
                  Show Pipeline
                </label>
              </div>
            </div>
          </CardHeader>
          {showPipeline && (
            <CardContent>
              <div className="border rounded-md" style={{ width: '100%', height: 400 }}>
                <ReactFlow nodes={pipelineNodes} edges={pipelineEdges} fitView>
                  <Background />
                  <Controls />
                </ReactFlow>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default RequirementDetails;