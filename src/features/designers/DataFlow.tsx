import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {ReactFlow} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CustomNode } from '@/components/bh-reactflow-comps/builddata/CustomNode';
import { CustomEdge } from '@/components/bh-reactflow-comps/builddata/customEdge';
import { Terminal } from '@/components/bh-reactflow-comps/builddata/LogsPage';
import { FlowControls } from '@/features/designers/pipeline/components/FlowControls';
import { LoaderCircle, GitBranch } from 'lucide-react';
import { usePipelineContext } from '@/context/designers/DataPipelineContext';
import { useSidebar } from '@/context/SidebarContext';
import { useFlow } from '@/context/designers/FlowContext';
import '@/features/designers/pipeline/styles/PipelineCanvas.css';
import CreateFormFormik from './pipeline/components/form-sections/CreateForm';
import { NodeForm } from '@/components/bh-reactflow-comps/flow/flow/subcomponents/NodeForm/NodeForm';
import { useParams, useNavigate } from 'react-router-dom';
// Sheet components removed as we're using Dialog instead
import { useFlow as useFlowApi } from '@/features/designers/flow/hooks/useFlow';
import { useAppDispatch } from '@/hooks/useRedux';
import { setSelectedEnv, setSelectedFlow } from '@/store/slices/designer/flowSlice';

import { convertFlowJsonToReactFlow } from '@/lib/pipelineJsonConverter';
import { useModules } from '@/hooks/useModules';
import { EmptyState } from '@/components/shared/EmptyState';
import { CreateFlowDialog } from '@/features/designers/flow/components/CreateFlowDialog';
import { GitControlsFooterPortal } from '@/components/git/GitControlsFooter';
import { CommitModal } from '@/components/git/CommitModal';
import { setEnabled } from '@/store/slices/gitSlice';

interface DataFlowProps {
    gitIntegration: boolean;
  }

const DataFlow: React.FC<DataFlowProps> = ({gitIntegration=false}) => {
    const { isRightAsideOpen, isBottomDrawerOpen } = useSidebar();
    const { 
        selectNode, 
        revertOrSaveData, 
        setSelectedFlowId, 
        reactFlowInstance, 
        selectedFlowId, 
        setIsSaving, 
        setIsSaved, 
        prevNodeFn, 
        setNodeFormData,
        nodes: flowNodes,
        edges: flowEdges,
        onNodesChange: flowOnNodesChange,
        onEdgesChange: flowOnEdgesChange
    } = useFlow();
    const navigate = useNavigate();
    const [nodeFormData, setNodeFormDataLocal] = useState<any[]>([]);
    const {
        conversionLogs, terminalLogs, pipelineDtl, handleRun, handleStop, handleNext, handleSourceUpdate, updateSetNode,
        handleLeavePage,
        handleFormSubmit,
        setShowLeavePrompt,
        handleNodesChange,
        handleEdgesChange,
        handleDialogClose,
        setSelectedSchema,
        setFormStates,
        setIsFormOpen,
        formStates,
        setRunDialogOpen,
        setSelectedFormState,
        handleRunClick,
        handleAlignTopLeft,
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
        setSelectedNodeId,
        setNodes,
    } = usePipelineContext();

    // Use flow nodes and edges for the ReactFlow component
    const nodes = flowNodes;
    const edges = flowEdges;

    const onError = useCallback((id: string) => {
        // console.log('Flow Error:', id);
    }, []);
    const [moduleTypes] = useModules();
    const [createFlowDialogOpen, setCreateFlowDialogOpen] = useState(false);

    const dispatch = useAppDispatch();

    // Enable git integration when component mounts
    useEffect(() => {
        dispatch(setEnabled(gitIntegration));
        return () => {
            dispatch(setEnabled(false));
        };
    }, [ gitIntegration, dispatch]);
    const { id } = useParams();
    const { useFetchFlowById, fetchFlowsList } = useFlowApi();
    const { data: flowList, isLoading: isFlowListLoading }: any = fetchFlowsList(1, 1000, true);

    // Validate flowId before making API call
    const isValidFlowId = (flowId: string | null | undefined): flowId is string => {
        return typeof flowId === 'string' && flowId.trim().length > 0;
    };

    // Only fetch flow if we have a valid ID
    const shouldFetchFlow = isValidFlowId(id);
    const { data: flow, isLoading: isFlowLoading, isError, refetch } = useFetchFlowById(id, shouldFetchFlow);

    const isLoading = isFlowLoading || isFlowListLoading;

    // Auto-select first flow if no ID is provided
    useEffect(() => {
        if (!id && flowList && Array.isArray(flowList.data) && flowList.data.length > 0) {
            const firstFlow = flowList.data[0];
            console.log(`DataFlow: No ID provided, auto-selecting first flow ${firstFlow.flow_id}`);
            navigate(`/designers/data-flow-playground/${firstFlow.flow_id}`);
        }
    }, [id, flowList, navigate]);

    // Force refetch when ID changes
    useEffect(() => {
        if (isValidFlowId(id)) {
            console.log(`DataFlow: ID changed to ${id}, forcing refetch of flow data`);
            // Force a refetch of the flow data
            refetch();
        } else if (id) {
            console.warn(`DataFlow: Invalid flow ID provided: ${id}, skipping refetch`);
        }
    }, []);

    // Listen for custom flow selection events
    useEffect(() => {
        const handleFlowSelected = (event: CustomEvent) => {
            const { flowId } = event.detail;
            console.log(`DataFlow: Received flowSelected event for flow ${flowId}`);

            // Force a refresh regardless of whether we're on this flow
            console.log(`DataFlow: Forcing refetch for flow ${flowId}`);
            refetch();

            // Reset processedFlowId to ensure the flow is processed again
            setProcessedFlowId(null);

            // Force a re-render
            setForceRender(prev => prev + 1);
        };

        // Add event listener
        document.addEventListener('flowSelected', handleFlowSelected as EventListener);

        // Clean up
        return () => {
            document.removeEventListener('flowSelected', handleFlowSelected as EventListener);
        };
    }, [refetch]);
    const handleOpenNodeForm = useCallback((nodeId: string) => {
        console.log('DataFlow: Opening NodeForm for node:', nodeId);

        // First select the node in the Flow context
        selectNode(nodeId);

        // Then set the selected node ID and open the form
        setSelectedNodeId(nodeId);
        setIsNodeFormOpen(true);
    }, [selectNode, setSelectedNodeId, setIsNodeFormOpen]);

    const debuggedNodesSet = useMemo(() => new Set(debuggedNodes), [debuggedNodes]);

    // Update memoizedNodeTypes to include debug props
    const memoizedNodeTypes = useMemo(() => ({
        custom: (props: any) => {
            let type = "";

            return (
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
                    type={type}
                    onImageClick={handleOpenNodeForm}
                    transformationCounts={transformationCounts}
                />
            )
        }
    }), [setNodes, setSelectedSchema, setFormStates, setIsFormOpen, formStates,
        setRunDialogOpen, setSelectedFormState, handleDebugToggle, debuggedNodesSet,
        handleSourceUpdate, pipelineDtl, handleOpenNodeForm, setNodeFormDataLocal, transformationCounts]);

    // Key state to force re-render
    const [forceRender, setForceRender] = useState(0);

    // Track if we've already processed this flow to prevent loops
    const [processedFlowId, setProcessedFlowId] = useState<string | null>(null);

    // Reset processedFlowId when ID changes
    useEffect(() => {
        if (id) {
            // Check if the current processedFlowId starts with this ID
            const isCurrentFlow = processedFlowId?.startsWith(id + '-');

            if (!isCurrentFlow) {
                console.log(`DataFlow: ID changed to ${id}, resetting processedFlowId`);
                setProcessedFlowId(null);
            }
        }
    }, [id, processedFlowId]);

    // Load flow data when flow changes
    useEffect(() => {
        // Only update the selected flow ID if it's different and valid
        if (isValidFlowId(id) && id !== selectedFlowId) {
            console.log(`DataFlow: Setting selected flow ID to ${id}`);
            setSelectedFlowId(id);
        } else if (id && !isValidFlowId(id)) {
            console.warn(`DataFlow: Invalid flow ID provided, not setting selected flow: ${id}`);
        }
    }, [id, selectedFlowId, setSelectedFlowId, isValidFlowId]);

    // Separate effect for handling flow data changes
    useEffect(() => {
        // Skip if no flow data or invalid ID
        if (!flow || !isValidFlowId(id)) {
            if (id && !isValidFlowId(id)) {
                console.warn(`DataFlow: Skipping flow data processing due to invalid flow ID: ${id}`);
            }
            return;
        }

        // Skip if we've already processed this exact flow instance
        // We use a combination of ID and flow data to determine if this is a new fetch
        const flowKey = `${id}-${flow.updated_at || Date.now()}`;
        if (processedFlowId === flowKey) {
            return;
        }

        console.log(`DataFlow: Processing flow ${id}, data:`, flow);

        // Mark this flow as processed to prevent loops
        setProcessedFlowId(flowKey);

        // Force a re-render when flow changes
        setForceRender(prev => prev + 1);

        // Check if flow has valid definition
        if (flow?.flow_definition?.flow_json) {
            try {
                // Safely check if flowJson exists
                const flowJson = flow.flow_definition.flow_json?.flowJson;

                if (!flowJson) {
                    console.log("DataFlow: No flow JSON data found, using empty nodes/edges");
                    // Use empty arrays if no flow JSON
                    updateSetNode([], []);
                    return;
                }

                console.log("DataFlow: Processing flow JSON:", flowJson);

                // The converter function will handle parsing if needed
                const { nodes, edges, nodeFormData } = convertFlowJsonToReactFlow(flowJson, moduleTypes);

                console.log('DataFlow: Converted flow.json to ReactFlow format:', { nodes, edges, nodeFormData });

                // Update the state with the converted data
                console.log("DataFlow: Updating nodes and edges:", nodes, edges);

                // Clear existing nodes and edges first
                updateSetNode([], []);

                // Use a short timeout to ensure the clear operation completes
                setTimeout(() => {
                    // Use updateSetNode to update both nodes and edges in one call
                    updateSetNode(nodes, edges);

                    // Update form data
                    setNodeFormData(nodeFormData);
                    setNodeFormDataLocal(nodeFormData);

                    // Center the view after a short delay to ensure nodes are rendered
                    setTimeout(() => {
                        if (handleCenter) {
                            console.log("DataFlow: Centering view after flow load");
                            handleCenter();
                        }
                    }, 300);
                }, 50);
            } catch (error) {
                console.error('Error converting flow.json to ReactFlow format:', error);
                // Use empty arrays on error
                updateSetNode([], []);
            }
        } else {
            console.log("DataFlow: No flow definition found, using empty nodes/edges");
            // Use empty arrays if no flow definition
            updateSetNode([], []);
        }

        // Update Redux state
        dispatch(setSelectedFlow(flow));

        // Set environment if available
        const flowdeployment = flow;
        if (flowdeployment?.flow_deployment?.[0]?.bh_env_id) {
            dispatch(setSelectedEnv(Number(flowdeployment.flow_deployment[0].bh_env_id)));
        }
    }, [flow, id, moduleTypes, updateSetNode, setNodeFormData, handleCenter, dispatch]);

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

    // Calculate sidebar width based on expanded state
    const getMainContentStyle = () => {
        // Calculate the available width without sidebar
        let availableWidth = '100%';
        if (isRightAsideOpen) {
            availableWidth = 'calc(100% - 25%)'; // Assuming right panel is 25%
        }

        return {
            height: '100%',
            width: availableWidth,
            transition: 'all 0.3s ease-in-out'
        };
    };

    return (
        <div className={`flex h-full w-full pipeline-container ${isRightAsideOpen ? 'with-right-aside' : ''} ${isBottomDrawerOpen ? 'with-bottom-drawer' : ''}`}>
            <div
                className={`flex-1 relative p-1 transition-all duration-300`}
                style={getMainContentStyle()}>
                <div
                    className={`flex-1 relative transition-all duration-300 ${isRightAsideOpen ? 'with-right-panel' : ''} ${isBottomDrawerOpen ? 'with-bottom-drawer-panel' : ''}`}
                    style={{
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        flex: '1 1 auto',
                        height: '100%'
                    }}>
                    {isLoading ? (
                        <div className="w-full h-full flex items-center justify-center bg-background">
                            <div className="flex flex-col items-center">
                                <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
                                <p className="mt-4 text-sm text-muted-foreground">Loading flow data...</p>
                            </div>
                        </div>
                    ) : !isLoading && flowList && Array.isArray(flowList.data) && flowList.data.length === 0 ? (
                        <div className="w-full h-full flex items-center justify-center bg-background">
                            <EmptyState
                                Icon={GitBranch}
                                title="No Flow Found"
                                description="Get started by creating a new flow."
                                action={
                                    <Button
                                        onClick={() => setCreateFlowDialogOpen(true)}
                                        className="mt-4"
                                    >
                                        Create Flow
                                    </Button>
                                }
                            />
                        </div>
                    ) : (
                        <ReactFlow
                            key={`flow-${id}-${forceRender}`} // Add key to force re-render
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
                            onNodesChange={flowOnNodesChange}
                            onEdgesChange={flowOnEdgesChange}
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
                            className="w-full h-full bg-background transition-all duration-300 reactflow-wrapper"
                            onInit={(instance) => {
                                // Only log once to prevent console spam
                                console.log(`ReactFlow initialized for flow ${id}`);

                                // Store the instance for later use
                                if (instance && typeof instance.fitView === 'function') {
                                    // Center the view after initialization
                                    setTimeout(() => {
                                        try {
                                            instance.fitView({ padding: 0.2 });
                                            console.log(`Centering view for flow ${id}`);
                                        } catch (error) {
                                            console.error('Error centering view:', error);
                                        }
                                    }, 300);
                                }
                            }}
                        />
                    )}

                    {/* Flow Controls */}
                    <div className={`fixed ${isBottomDrawerOpen ? 'bottom-[300px]' : 'bottom-20'} ${isRightAsideOpen ? 'right-[41%]' : 'right-4'} z-[1000] transition-all duration-300`}>
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
                            onAlignTopLeft={handleAlignTopLeft}
                            terminalLogs={terminalLogs}
                            proplesLogs={conversionLogs}
                        />
                    </div>
                    <GitControlsFooterPortal />
                    <CommitModal />
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
                    open={isNodeFormOpen}
                    onOpenChange={(open) => setIsNodeFormOpen(open)}
                >
                    <DialogContent className="max-w-[80%] max-h-[80vh] overflow-y-auto">
                        {selectedNodeId && (
                            <NodeForm
                                id={selectedNodeId}
                                closeTap={() => setIsNodeFormOpen(false)}
                            />
                        )}
                    </DialogContent>
                </Dialog>

                {showLogs && (
                    <div className={`fixed bottom-0 left-0 right-0 h-[300px] bg-background border-t z-50 transition-all duration-300 ${isRightAsideOpen ? 'with-right-aside-logs' : ''}`}>
                        <div className="flex justify-between items-center p-2 border-b">
                            <h3 className="text-sm font-medium">Logs</h3>
                            <Button variant="ghost" size="sm" onClick={() => setShowLogs(false)}>
                                Close
                            </Button>
                        </div>
                        <div className="h-[calc(300px-40px)] overflow-auto p-2">
                            <Terminal
                                isOpen={showLogs}
                                onClose={() => setShowLogs(false)}
                                terminalLogs={terminalLogs}
                            />
                        </div>
                    </div>
                )}

                {/* Create Flow Dialog */}
                <CreateFlowDialog
                    open={createFlowDialogOpen}
                    onOpenChange={setCreateFlowDialogOpen}
                />
            </div>
        </div>
    );
};

export default DataFlow;