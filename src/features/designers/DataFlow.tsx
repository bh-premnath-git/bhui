import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ReactFlow from 'reactflow';
import 'reactflow/dist/style.css';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CustomNode } from '@/components/bh-reactflow-comps/builddata/CustomNode';
import { CustomEdge } from '@/components/bh-reactflow-comps/builddata/customEdge';
import { Terminal } from '@/components/bh-reactflow-comps/builddata/LogsPage';
import { FlowControls } from '@/features/designers/pipeline/components/FlowControls';
import nodeData from '@/pages/designers/data-pipeline/data/node_display.json';
import KeyboardShortcutsPanel from '@/features/designers/pipeline/components/ShortcutsInfoPanel';
import { LoaderCircle } from 'lucide-react';
import { usePipelineContext } from '@/context/designers/DataPipelineContext';
import { useSidebar } from '@/context/SidebarContext';
import { useFlow } from '@/context/designers/FlowContext';
import '@/features/designers/pipeline/styles/PipelineCanvas.css';
import CreateFormFormik from './pipeline/components/form-sections/CreateForm';
import { NodeForm } from '@/components/bh-reactflow-comps/flow/flow/subcomponents/NodeForm/NodeForm';
import { useParams } from 'react-router-dom';
// Sheet components removed as we're using Dialog instead
import { useFlow as useFlowApi } from '@/features/designers/flow/hooks/useFlow';
import { useAppDispatch } from '@/hooks/useRedux';
import { setSelectedEnv, setSelectedFlow } from '@/store/slices/designer/flowSlice';

const BuildPlayGround: React.FC = () => {
    const { isRightAsideOpen, isBottomDrawerOpen } = useSidebar();
    const { selectNode, revertOrSaveData } = useFlow();
   
    const { 
        conversionLogs,
        terminalLogs, 
        pipelineDtl,
        handleRun,
        handleStop,
        handleNext,
        handleSourceUpdate,
        handleLeavePage,
        handleFormSubmit, 
        setShowLeavePrompt, 
        handleNodesChange, 
        handleEdgesChange,
        handleDialogClose, 
        setNodes, 
        setSelectedSchema, 
        setFormStates,
        setIsFormOpen, 
        formStates, 
        setRunDialogOpen, 
        setSelectedFormState, 
        handleRunClick, 
        handleCut,
        handleUndo, 
        handleRedo, 
        handleLogsClick, 
        handleKeyDown, 
        handleAlignHorizontal, 
        handleAlignVertical,
        debuggedNodes, 
        debuggedNodesList, 
        isPipelineRunning, 
        isCanvasLoading, 
        onConnect, 
        handleDebugToggle,
        handleCopy, 
        handlePaste, 
        handleSearchResultClick, 
        handleZoomIn, 
        handleZoomOut,
        handleCenter, 
        transformationCounts, 
        highlightedNodeId, 
        showLogs,
        nodes, 
        edges, 
        selectedSchema, 
        sourceColumns, 
        isFormOpen, 
        showLeavePrompt, 
        ctrlDTimeout, 
        hasUnsavedChanges, 
        setShowLogs, 
        isNodeFormOpen,
        setIsNodeFormOpen,
        selectedNodeId,
        setSelectedNodeId
    } = usePipelineContext();

    const onError = useCallback((id: string) => {
        // console.log('Flow Error:', id);
    }, []);
      const dispatch = useAppDispatch();
    
    const { id } = useParams();
      const { useFetchFlowById } = useFlowApi();
      const { data: flow, isLoading, isError } = useFetchFlowById(id || '');
    const handleOpenNodeForm = useCallback((nodeId: string) => {
        // First select the node in the Flow context
        selectNode(nodeId);
        
        // Then set the selected node ID and open the form
        setSelectedNodeId(nodeId);
        setIsNodeFormOpen(true);
    }, [selectNode, setSelectedNodeId, setIsNodeFormOpen]);

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
                id={props.id}
                // Add the new handler for opening the NodeForm
                onImageClick={handleOpenNodeForm}
            />
        )
    }), [setNodes, setSelectedSchema, setFormStates, setIsFormOpen, formStates,
        setRunDialogOpen, setSelectedFormState, handleDebugToggle, debuggedNodesSet, 
        handleSourceUpdate, pipelineDtl, handleOpenNodeForm]);
    
    useEffect(() => {
        if (flow) {
            alert('Flow fetched successfully');
          dispatch(setSelectedFlow(flow));
          const flowdeployment = flow;
          if (flowdeployment.flow_deployment?.[0]?.bh_env_id) {
            dispatch(setSelectedEnv(Number(flowdeployment.flow_deployment[0].bh_env_id)));
          }
        }
      }, [flow, dispatch]);
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
            
            return () => {
                clearTimeout(timer);
                clearTimeout(secondTimer);
                clearTimeout(thirdTimer);
                clearTimeout(fitViewTimer);
            };
        }
        
        return () => {
            clearTimeout(timer);
            clearTimeout(secondTimer);
            clearTimeout(thirdTimer);
        };
    }, [isRightAsideOpen, isBottomDrawerOpen, handleCenter, nodes.length]);

    const edgeTypes = useMemo(() => ({
        default: (props: any) => (
            <CustomEdge {...props} transformationCounts={transformationCounts} pipelineDtl={pipelineDtl} debuggedNodesList={debuggedNodesList} />
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


    //   const handleFormSubmit = (values: any) => {
    //     console.log('Form submitted with values:', values);
    //     // Handle the form submission
    //     // Update your state or make API calls as needed
    //     handleDialogClose(); // Close the dialog after successful submission
    //   };

    return (
            <div className={`relative h-full w-[98%] pipeline-container ${isRightAsideOpen ? 'with-right-aside' : ''} ${isBottomDrawerOpen ? 'with-bottom-drawer' : ''}`}>
                {/* <ResolveSchema/> */}
                <div className="p-1 ml-8" style={{
                    height: isBottomDrawerOpen ? 'calc(100% - 300px)' : '100%',
                    width: isRightAsideOpen ? 'calc(100% - 500px)' : '100%',
                    transition: 'all 0.3s ease-in-out'
                }}>

                    <div 
                        className={`transition-all duration-300 ${isRightAsideOpen ? 'with-right-panel' : ''} ${isBottomDrawerOpen ? 'with-bottom-drawer-panel' : ''}`}
                        style={{ 
                            height: isBottomDrawerOpen ? 'calc(75vh - 300px)' : '75vh', 
                            width: '100%',
                            transition: 'all 0.3s ease-in-out'
                        }}>
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
                    {/* Updated FlowControls container positioning */}
                    <div className={`fixed ${isBottomDrawerOpen ? 'bottom-[300px]' : 'bottom-4'} ${isRightAsideOpen ? 'right-[524px]' : 'right-4'} z-50 transition-all duration-300`}>
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
                    
                    {/* NodeForm Dialog */}
                    <Dialog
                        open={isNodeFormOpen}
                        onOpenChange={(open) => {
                            if (!open) {
                                if (selectedNodeId) {
                                    revertOrSaveData(selectedNodeId, false);
                                }
                                setSelectedNodeId(null);
                            }
                            setIsNodeFormOpen(open);
                        }}
                    >
                        <DialogContent className="max-w-[60%]">
                            <div className="max-h-[calc(100vh-10rem)] overflow-y-auto pb-4">
                                {selectedNodeId && isNodeFormOpen && (
                                    <div key={`node-form-${selectedNodeId}`}>
                                        <NodeForm
                                            id={selectedNodeId}
                                            closeTap={() => setIsNodeFormOpen(false)}
                                        />
                                    </div>
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
            
    );
};

export default React.memo(BuildPlayGround);
