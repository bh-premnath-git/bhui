import React, { useCallback, useEffect, useMemo} from 'react';
import ReactFlow from 'reactflow';
import 'reactflow/dist/style.css';
import {Dialog,DialogContent} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CustomNode } from '@/components/bh-reactflow-comps/builddata/CustomNode';
import { CustomEdge } from '@/components/bh-reactflow-comps/builddata/customEdge';
import { Terminal } from '@/components/bh-reactflow-comps/builddata/LogsPage';
import { FlowControls } from '@/features/designers/pipeline/components/FlowControls';
import nodeData from '@/pages/designers/data-pipeline/data/node_display.json';
import KeyboardShortcutsPanel from '@/features/designers/pipeline/components/ShortcutsInfoPanel';
import NodeDropList from '@/components/bh-reactflow-comps/builddata/NodeDropList';
import { LoaderCircle } from 'lucide-react';
import CreateFormFormik from './pipeline/components/form-sections/CreateForm';
import { usePipelineContext } from '@/context/designers/DataPipelineContext';

const BuildPlayGround: React.FC = () => {
    const {conversionLogs,
        terminalLogs,pipelineDtl,
        handleRun,
        handleStop,
        handleNext,
        handleSourceUpdate,
        handleLeavePage,
        handleSearch,
        handleNodeClick,
        handleFormSubmit,setShowLeavePrompt,handleNodesChange,handleEdgesChange,
        handleDialogClose,setNodes,setSelectedSchema,setFormStates,
        setIsFormOpen,formStates,setRunDialogOpen,setSelectedFormState,handleRunClick,handleCut,
        handleUndo,handleRedo,handleLogsClick,handleKeyDown,handleAlignHorizontal,handleAlignVertical,
        debuggedNodes,debuggedNodesList,isPipelineRunning,isCanvasLoading,onConnect,handleDebugToggle,
        addNodeToHistory,handleCopy,handlePaste,handleSearchResultClick,handleZoomIn,handleZoomOut,
        handleCenter,transformationCounts,searchTerm,searchResults,highlightedNodeId,copiedEdges,showLogs,
        nodes,edges,selectedSchema,sourceColumns,isFormOpen,showLeavePrompt,ctrlDTimeout,hasUnsavedChanges,setShowLogs,
        setLastSaved,lastSaved
    }=usePipelineContext()
  const onError = useCallback((id: string) => {
      // console.log('Flow Error:', id);
  }, []);
  
  const filteredNodes = useMemo(() => nodeData.nodes, []);
  // Create a Set from the array for .has() functionality
  const debuggedNodesSet = useMemo(() => new Set(debuggedNodes), [debuggedNodes]);

  // Update memoizedNodeTypes to include debug props
  const memoizedNodeTypes = useMemo(() => ({
      custom: (props: any) => (
          <CustomNode
              {...props}
              pipelineDtl={pipelineDtl}
              setNodes={setNodes}
              setSelectedSchema={setSelectedSchema}
              setFormStates={setFormStates}
              setIsFormOpen={setIsFormOpen}
              formStates={formStates}
              setRunDialogOpen={setRunDialogOpen}
              setSelectedFormState={setSelectedFormState}
              onDebugToggle={handleDebugToggle}
              debuggedNodes={debuggedNodesSet}
              handleRunClick={handleRunClick}
              onSourceUpdate={handleSourceUpdate}
              handleSearchResultClick={handleSearchResultClick}
              
          />
      )
  }), [setNodes, setSelectedSchema, setFormStates, setIsFormOpen, formStates,
      setRunDialogOpen, setSelectedFormState, handleDebugToggle, debuggedNodesSet, handleSourceUpdate, pipelineDtl]);
// console.log(transformationCounts,"transformationCounts")

  const edgeTypes = useMemo(() => ({
      default: (props: any) => (
          <CustomEdge {...props} transformationCounts={transformationCounts} pipelineDtl={pipelineDtl} debuggedNodesList={debuggedNodesList}/>
      )
  }), [transformationCounts]);

  // Add defaultViewport configuration
  const defaultViewport = { x: 0, y: 0, zoom: 0.7 }; // Adjust zoom value as needed (0.7 = 70% zoom)


  useEffect(() => {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nodes, handleDebugToggle, handleCopy, handlePaste, handleCut, handleUndo, handleRedo, handleRun, handleStop, handleNext, handleZoomIn, handleZoomOut, handleLogsClick]);

  useEffect(() => {
      return () => {
          if (ctrlDTimeout.current) {
              clearTimeout(ctrlDTimeout.current);
          }
      };
  }, []);

  useEffect(() => {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
          if (hasUnsavedChanges) {
              e.preventDefault();
              e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
              return e.returnValue;
          }
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  useEffect(() => {
      // Handle browser back button
      const handlePopState = (event: PopStateEvent) => {
          if (hasUnsavedChanges) {
              event.preventDefault();
              setShowLeavePrompt(true);
              // Push the current state back to maintain the current URL
              window.history.pushState(null, '', location.pathname);
          }
      };

      // Push initial state
      window.history.pushState(null, '', location.pathname);
      window.addEventListener('popstate', handlePopState);

      return () => {
          window.removeEventListener('popstate', handlePopState);
      };
  }, [hasUnsavedChanges, location.pathname]);

  
  const keyboardShortcuts = [
      { key: 'Ctrl + C', action: 'Copy' },
      { key: 'Ctrl + V', action: 'Paste' },
      { key: 'Ctrl + X', action: 'Cut' },
      { key: 'Ctrl + Z', action: 'Undo' },
      { key: 'Ctrl + Y', action: 'Redo' },
      { key: 'Ctrl + F', action: 'Search' },
      { key: 'Ctrl + D', action: 'Add to Debug List' },
      { key: 'Ctrl + R', action: 'Run Pipeline' },
      { key: 'Ctrl + L', action: 'Open Logs' },
      { key: 'Ctrl + K', action: 'Stop Pipeline' },
      { key: 'Ctrl + N', action: 'Next Step' },
      { key: 'Ctrl + +', action: 'Zoom In' },
      { key: 'Ctrl + -', action: 'Zoom Out' },
  ];

//   const handleFormSubmit = (values: any) => {
//     console.log('Form submitted with values:', values);
//     // Handle the form submission
//     // Update your state or make API calls as needed
//     handleDialogClose(); // Close the dialog after successful submission
//   };

  return (
      <div className="relative h-full">
          <div className="p-1 ml-8">
             
              {/* Add search component */}
              <div className="absolute top- -100 right-4 z-50">
                  <div className="relative">
                      <div className="relative">
                          <input
                              data-search-input
                              type="text"
                              value={searchTerm}
                              onChange={(e) => handleSearch(e.target.value)}
                              placeholder="Search nodes... (Ctrl+F)"
                              className="w-64 px-4 py-2 pr-10 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                          </div>
                      </div>
                      {searchResults?.length > 0 && searchTerm && (
                          <div className="absolute mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-100 max-h-60 overflow-y-auto">
                              {searchResults.map((result) => (
                                  <button
                                      key={result.id}
                                      onClick={() => handleSearchResultClick(result.id)}
                                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                                  >
                                      <div className="flex flex-col">
                                          <span className="font-medium text-gray-800">{result.title}</span>
                                          <span className="text-xs text-gray-500">{result.label}</span>
                                      </div>
                                  </button>
                              ))}
                          </div>
                      )}
                  </div>
              </div>
              <div className="absolute  mt-2 z-50">
  <div className=" rounded-lg  p-2 text-sm">
      <KeyboardShortcutsPanel keyboardShortcuts={keyboardShortcuts} />
  </div>
</div>
              {debuggedNodesList?.length > 0 && (
                  <div className="mb-4 p-2 bg-blue-50 rounded-lg">
                      <h3 className="text-sm font-medium text-blue-900 mb-2">Debugged Nodes:</h3>
                      <div className="flex flex-wrap gap-2">
                          {debuggedNodesList.map(({ id, title }) => (
                              <div
                                  key={id}
                                  className="flex items-center gap-2 bg-white px-3 py-1 rounded-full text-sm text-blue-700 border border-blue-200"
                              >
                                  <span>{title}</span>
                                  <button
                                      onClick={() => handleDebugToggle(id, title)}
                                      className="hover:text-blue-900"
                                  >
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                  </button>
                              </div>
                          ))}
                      </div>
                  </div>
              )}
              <div className="flex justify-center gap-4 mb-4">
                  <NodeDropList
                      filteredNodes={filteredNodes}
                      handleNodeClick={handleNodeClick}
                      addNodeToHistory={addNodeToHistory}
                  />

              </div>
              <div style={{ height: '75vh', width: '100%', }}>
                  <ReactFlow
                      nodes={nodes?.map(node => ({
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
                      onNodesChange={handleNodesChange}
                      onEdgesChange={handleEdgesChange}
                      onConnect={onConnect}
                      nodeTypes={memoizedNodeTypes}
                      edgeTypes={edgeTypes}
                      onError={onError}
                      defaultViewport={defaultViewport}
                      minZoom={0.2}  
                      maxZoom={1.5}  
                      fitView
                      fitViewOptions={{ padding: 0.2, maxZoom: 0.8 }} 
                      proOptions={{ hideAttribution: true }}
                  />
              </div>
              <div className="flex items-center justify-end gap-4 mt-4">
                  <FlowControls
                      onZoomIn={handleZoomIn}
                      onZoomOut={handleZoomOut}
                      onCenter={handleCenter}
                      onAlignHorizontal={handleAlignHorizontal}
                      onAlignVertical={handleAlignVertical}
                      handleRunClick={handleRun}
                      onStop={handleStop}
                      onNext={handleNext}
                      isPipelineRunning={isPipelineRunning}
                      isLoading={isCanvasLoading}
                      pipelineConfig={handleRunClick}
                      terminalLogs={terminalLogs}
                      proplesLogs={conversionLogs}
                         
                  />
              </div>

              <Dialog
                  open={isFormOpen}
                  onOpenChange={handleDialogClose}
                  aria-modal="true"
              >
                  <DialogContent className="max-w-[60%]">
                      {selectedSchema && (
                          <CreateFormFormik
                              schema={selectedSchema}
                              sourceColumns={sourceColumns}
                              onClose={handleDialogClose}
                              currentNodeId={selectedSchema?.nodeId || ''}
                              initialValues={{
                                  ...formStates[selectedSchema?.nodeId],
                                  nodeId: selectedSchema?.nodeId
                              }}
                              nodes={nodes}
                              edges={edges}
                              pipelineDtl={pipelineDtl}
                              onSubmit={handleFormSubmit}
                          />
                      )}
                  </DialogContent>
              </Dialog>



              <Dialog
                  open={showLeavePrompt}
                  onOpenChange={setShowLeavePrompt}
                  // onClose={handleLeavePage}
                  
              >
                  <DialogContent >
                      <div className="flex flex-col items-center text-center">
                          {/* Warning Icon */}
                          <div className="mb-4 p-3 rounded-full bg-amber-50">
                              <svg
                                  className="w-8 h-8 text-amber-500"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                              >
                                  <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                  />
                              </svg>
                          </div>

                          {/* Title and Description */}
                          <h2 className="text-xl font-semibold text-gray-800 mb-2">
                              Unsaved Changes
                          </h2>
                          <p className="text-gray-600 mb-6">
                              You have unsaved changes in your pipeline. Are you sure you want to leave? All changes will be lost.
                          </p>

                          {/* Action Buttons */}
                          <div className="flex gap-3 w-full">
                              <Button
                                  onClick={() => setShowLeavePrompt(false)}
                                  
                              >
                                  Stay
                              </Button>
                              <Button
                                  onClick={handleLeavePage}
                                  
                              >
                                  Leave Page
                              </Button>
                          </div>
                      </div>
                  </DialogContent>
              </Dialog>

              {/* Add Terminal component */}
              <Terminal
                  isOpen={showLogs}
                  onClose={() => setShowLogs(false)}
                  title="Pipeline Validation Logs"
                  terminalLogs={terminalLogs}
                  proplesLogs={conversionLogs}
              />

              {/* Loading Overlay */}
              {isCanvasLoading && (
                  <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-50 flex items-center justify-center pointer-events-auto">
                      <div className="flex flex-col items-center gap-2">
                          <LoaderCircle size={40} />
                          <span className="text-sm text-gray-600 font-medium">Processing...</span>
                      </div>
                  </div>
              )}
          </div>
      </div>
  );
};

export default React.memo(BuildPlayGround);
