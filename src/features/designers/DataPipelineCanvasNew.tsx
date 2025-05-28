// src/features/designers/DataPipelineCanvasNew.tsx
import React, { useMemo, useEffect } from 'react';
import { useSidebar } from '@/context/SidebarContext';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CustomNode } from '@/components/bh-reactflow-comps/builddata/CustomNode';
import { CustomEdge } from '@/components/bh-reactflow-comps/builddata/customEdge';
import { Terminal } from '@/components/bh-reactflow-comps/builddata/LogsPage';
import { FlowControls } from '@/features/designers/pipeline/components/FlowControls';
import KeyboardShortcutsPanel from '@/features/designers/pipeline/components/ShortcutsInfoPanel';
import { usePipelineContext } from '@/context/designers/DataPipelineContext';
import { ComposableCanvas } from '@/components/ComposableCanvas';
import { LoaderCircle } from 'lucide-react';
import CreateFormFormik from '@/features/designers/pipeline/components/form-sections/CreateForm';
import '@/features/designers/pipeline/styles/PipelineCanvas.css';

const DataPipelineCanvasNew: React.FC = () => {
  const { isRightAsideOpen, isBottomDrawerOpen } = useSidebar();
  const {
    pipelineDtl,
    nodes,
    edges,
    formStates,
    setNodes,
    setSelectedSchema,
    setFormStates,
    setIsFormOpen,
    setRunDialogOpen,
    setSelectedFormState,
    handleDebugToggle,
    handleRunClick,
    handleSourceUpdate,
    handleSearchResultClick,
    debuggedNodes,
    transformationCounts,
    debuggedNodesList,
    handleZoomIn,
    handleZoomOut,
    handleCenter,
    handleAlignHorizontal,
    handleAlignVertical,
    handleRun,
    handleStop,
    handleNext,
    isPipelineRunning,
    isCanvasLoading,
    terminalLogs,
    conversionLogs,
    isFormOpen,
    selectedSchema,
    sourceColumns,
    handleDialogClose,
    handleFormSubmit,
    showLogs,
    setShowLogs,
    handleLeavePage,
    showLeavePrompt,
    setShowLeavePrompt,
    ctrlDTimeout,
    hasUnsavedChanges,
    setLastSaved,
    lastSaved,
    fetchPipelineDetails
  } = usePipelineContext();
  
  // Add resize event handler to force canvas resizing when right aside or bottom drawer opens/closes
  useEffect(() => {
    
    const handleResize = () => {
      // Force a resize event to make ReactFlow recalculate dimensions
      window.dispatchEvent(new Event('resize'));
    };
    
    // Trigger resize after a short delay when the layout state changes
    const timer = setTimeout(handleResize, 100);
    // Trigger another resize after a longer delay for smoother transition
    const secondTimer = setTimeout(handleResize, 300);
    const thirdTimer = setTimeout(handleResize, 600);
    
    // Try to trigger fitView if possible through the context
    if (handleCenter) {
      const fitViewTimer = setTimeout(() => {
        try {
          handleCenter();
          // Make sure nodes are visible when layout changes
          if (nodes.length > 0 && (isRightAsideOpen || isBottomDrawerOpen)) {
            console.log('Centering nodes after layout change');
            handleCenter();
          }
        } catch (error) {
          console.error('Error calling handleCenter:', error);
        }
      }, 350);
      
      // Add a second fitView attempt after a longer delay
      const secondFitViewTimer = setTimeout(() => {
        try {
          handleCenter();
        } catch (error) {
          console.error('Error in second fitView attempt:', error);
        }
      }, 800);
      
      return () => {
        clearTimeout(timer);
        clearTimeout(secondTimer);
        clearTimeout(thirdTimer);
        clearTimeout(fitViewTimer);
        clearTimeout(secondFitViewTimer);
      };
    }
    
    return () => {
      clearTimeout(timer);
      clearTimeout(secondTimer);
      clearTimeout(thirdTimer);
    };
  }, [isRightAsideOpen, isBottomDrawerOpen, handleCenter, nodes.length]);
useEffect(() => {
  fetchPipelineDetails()
},[]);
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
  }), [
    setNodes, 
    setSelectedSchema, 
    setFormStates, 
    setIsFormOpen, 
    formStates,
    setRunDialogOpen, 
    setSelectedFormState, 
    handleDebugToggle, 
    debuggedNodesSet, 
    handleSourceUpdate, 
    pipelineDtl
  ]);

  const edgeTypes = useMemo(() => ({
    default: (props: any) => (
      <CustomEdge 
        {...props} 
        transformationCounts={transformationCounts} 
        pipelineDtl={pipelineDtl} 
        debuggedNodesList={debuggedNodesList}
      />
    )
  }), [transformationCounts, pipelineDtl, debuggedNodesList]);

  // Custom controls component for the pipeline canvas
  const PipelineControls = () => {
    // Create local implementations of the zoom and center functions
    // These will be used directly by the FlowControls component
    const localZoomIn = () => {
      try {
        // Use direct DOM manipulation to trigger a zoom in event
        const zoomInEvent = new WheelEvent('wheel', {
          bubbles: true,
          cancelable: true,
          deltaY: -100,
          ctrlKey: true
        });
        document.querySelector('.react-flow')?.dispatchEvent(zoomInEvent);
        
        // Also try to call the context function
        handleZoomIn();
      } catch (error) {
        console.error('Zoom in error:', error);
      }
    };
    
    const localZoomOut = () => {
      try {
        // Use direct DOM manipulation to trigger a zoom out event
        const zoomOutEvent = new WheelEvent('wheel', {
          bubbles: true,
          cancelable: true,
          deltaY: 100,
          ctrlKey: true
        });
        document.querySelector('.react-flow')?.dispatchEvent(zoomOutEvent);
        
        // Also try to call the context function
        handleZoomOut();
      } catch (error) {
        console.error('Zoom out error:', error);
      }
    };
    
    const localCenter = () => {
      try {
        // Try to call the context function
        handleCenter();
        
        // Also try to use the fitView button from ReactFlow controls
        const fitViewButton = document.querySelector('.react-flow__controls-fitview');
        if (fitViewButton instanceof HTMLElement) {
          fitViewButton.click();
        }
      } catch (error) {
        console.error('Center error:', error);
      }
    };
    
    return (
      <div className={`fixed ${isBottomDrawerOpen ? 'bottom-[10px]' : 'bottom-4'} ${isRightAsideOpen ? 'right-[41%]' : 'right-4'} z-20 transition-all duration-300`}>
        <FlowControls
          onZoomIn={localZoomIn}
          onZoomOut={localZoomOut}
          onCenter={localCenter}
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
    );
  };

  // Define keyboard shortcuts for display
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

  return (
    <div className={`flex flex-col h-full w-[99%] pipeline-container ${isRightAsideOpen ? 'with-right-aside' : ''} ${isBottomDrawerOpen ? 'with-bottom-drawer' : ''}`}>
      <div 
        className={`flex-1 relative p-1 ml-8 transition-all duration-300`}
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          height: isBottomDrawerOpen ? 'calc(100% - 300px)' : '100%',
          width: isRightAsideOpen ? 'calc(100% - 50px)' : '100%'
        }}>

        {/* Keyboard shortcuts panel */}
        <div className={`fixed top-20 left-24 z-50 transition-all duration-300 ${isRightAsideOpen ? 'with-right-aside-panel' : ''}`}>
          <div className="rounded-lg p-2 text-sm">
            <KeyboardShortcutsPanel keyboardShortcuts={keyboardShortcuts} />
          </div>
        </div>

        {/* Debug mode panel */}
        {debuggedNodesList?.length > 0 && (
          <div className={`fixed top-20 ${isRightAsideOpen ? 'right-[524px]' : 'right-4'} z-40 mb-4 p-3 bg-blue-50 rounded-xl shadow-sm w-[400px] border border-blue-100/50 backdrop-blur-sm max-h-[${isBottomDrawerOpen ? '30vh' : '50vh'}] overflow-auto transition-all duration-300`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-blue-900 flex items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Debug Mode
              </h3>
              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                {debuggedNodesList.length} nodes
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 overflow-y-auto custom-scrollbar pr-1" style={{ maxHeight: `${Math.min(40 * Math.ceil(debuggedNodesList.length / 2), 300)}px` }}>
              {debuggedNodesList.map(({ id, title }) => (
                <div
                  key={id}
                  className="group flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg text-sm text-blue-700 border border-blue-100 hover:border-blue-200 transition-all duration-200 hover:shadow-sm"
                >
                  <span className="truncate max-w-[180px]" title={title}>{title}</span>
                  <button
                    onClick={() => handleDebugToggle(id, title)}
                    className="opacity-70 hover:opacity-100 hover:text-red-500 transition-all duration-200 ml-1"
                    title="Remove from debug"
                    aria-label={`Remove ${title} from debug list`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Canvas */}
        <div 
          className={`flex-1 relative transition-all duration-300 ${isRightAsideOpen ? 'with-right-panel' : ''} ${isBottomDrawerOpen ? 'with-bottom-drawer-panel' : ''}`}
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            flex: '1 1 auto',
            height: isBottomDrawerOpen ? 'calc(100% - 20px)' : '100%'
          }}>

          <ComposableCanvas
            className={`w-full h-full bg-background transition-all duration-300 reactflow-wrapper ${isRightAsideOpen ? 'with-right-panel-canvas' : ''} ${isBottomDrawerOpen ? 'with-bottom-drawer-canvas' : ''}`}
            type="pipeline"
            nodeTypes={memoizedNodeTypes}
            edgeTypes={edgeTypes}
            controls={<PipelineControls />}
            loading={isCanvasLoading}
            defaultViewport={{ x: 0, y: 0, zoom: 0.7 }}
            minZoom={0.2}
            maxZoom={1.5}
          />
        </div>

        {/* Node Form Dialog */}
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

        {/* Leave Prompt Dialog */}
        <Dialog
          open={showLeavePrompt}
          onOpenChange={setShowLeavePrompt}
        >
          <DialogContent>
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

              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Unsaved Changes
              </h2>
              <p className="text-gray-600 mb-6">
                You have unsaved changes in your pipeline. Are you sure you want to leave? All changes will be lost.
              </p>

              <div className="flex gap-3 w-full">
                <Button onClick={() => setShowLeavePrompt(false)}>
                  Stay
                </Button>
                <Button onClick={handleLeavePage}>
                  Leave Page
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Terminal/Logs Component */}
        <Terminal
          isOpen={showLogs}
          onClose={() => setShowLogs(false)}
          title="Pipeline Validation Logs"
          terminalLogs={terminalLogs}
          proplesLogs={conversionLogs}
        />

        {/* Loading Overlay */}
        {isCanvasLoading && (
          <div 
            className="fixed z-50 flex items-center justify-center pointer-events-auto bg-white/50 backdrop-blur-[1px] transition-all duration-300"
            style={{
              top: 0,
              bottom: 0,
              left: 0,
              right: isRightAsideOpen ? '520px' : 0
            }}
          >
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

export default React.memo(DataPipelineCanvasNew);