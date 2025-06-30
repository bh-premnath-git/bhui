import React, { memo, useCallback, useState, useEffect } from 'react';
import { Handle, Position, useEdges, useReactFlow, useNodes } from 'reactflow';
import schemaData from '@/pages/designers/data-pipeline/data/mdata.json';
import OrderPopUp from './OrderPopUp';
import { validateFormData } from './validation';
import { NodeToolbar } from './components/NodeToolbar';
import { NodeTitle } from './components/NodeTitle';
import { NodeImage } from './components/NodeImage';
import { NodeHandles } from './components/NodeHandles';
import { NodeInfo } from './components/NodeInfo';
import { ValidationIndicator } from './components/ValidationIndicator';
import TargetPopUp from '../TargetPopUp';
import { useFlow } from "@/context/designers/FlowContext";
import { usePipelineContext } from '@/context/designers/DataPipelineContext';
import { fetchTransformationOutput } from "@/store/slices/designer/buildPipeLine/BuildPipeLineSlice";
import { Terminal, PreviewData } from "./LogsPage";
import { useSidebar } from "@/context/SidebarContext";
import { setIsRightPanelOpen } from '@/store/slices/designer/buildPipeLine/BuildPipeLineSlice';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { RowCountBadge } from './components';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AiChatComponent from './AiChatComponent';

interface Schema {
    title: string;
    nodeId?: string;
    [key: string]: any;
}

export const CustomNode = memo(({ data, id, setNodes, setSelectedSchema, setFormStates, setIsFormOpen, formStates,  onDebugToggle, debuggedNodes, onSourceUpdate, style, selectedSchema, handleSearchResultClick, onNodeDoubleClick, onImageClick,type }: {
    data: any;
    id: string;
    setNodes: any;
    setSelectedSchema: any;
    setFormStates: any;
    setIsFormOpen: any;
    formStates: any;
    setRunDialogOpen: any;
    setSelectedFormState: any;
    onDebugToggle: (nodeId: string, title: string) => void;
    debuggedNodes: Set<string>;
    onSourceUpdate: (updatedSource: any) => void;
    pipelineDtl: any;
    setEdges: any;
    style?: React.CSSProperties;
    selectedSchema?: any;
    handleSearchResultClick: (data: any) => void;
    onNodeDoubleClick?: (nodeId: string) => void;
    onImageClick?: (nodeId: string) => void;
    type?: any;
    transformationCounts?: Array<{ transformationName: string; rowCount: number }>;
}) => {
    const [showToolbar, setShowToolbar] = useState(false);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [titleValue, setTitleValue] = useState(data.title);
    const reactFlowInstance = useReactFlow();
    const nodesInFlow = useNodes();
    const edgesInFlow = useEdges();

    const [toolbarTimeout, setToolbarTimeout] = useState<NodeJS.Timeout | null>(null);
    const [validationStatus, setValidationStatus] = useState<'none' | 'valid' | 'warning' | 'error'>('none');
    const [validationMessages, setValidationMessages] = useState<string[]>([]);
    const [showValidationTooltip, setShowValidationTooltip] = useState(false);
    const [selectedSourceLabel, setSelectedSourceLabel] = useState(null);
    const [formHasBeenOpened, setFormHasBeenOpened] = useState(false);
    const [selectedSource, setSelectedSource] = useState(null);
    const [isSelected, setIsSelected] = useState(false);
    const [titleError, setTitleError] = useState<string | null>(null);
    const { selectNode, revertOrSaveData, updateNodeDimensions, setSelectedNode } = useFlow();
    const { 
        setIsNodeFormOpen,
        setSelectedNodeId, 
        nodes,
        handleRefreshNode,transformationCounts, pipelineDtl, updateSetNode } = usePipelineContext();
    const { isFlow } = useAppSelector((state) => state.buildPipeline);
    const dispatch = useAppDispatch();
    const { setBottomDrawerContent, closeBottomDrawer, isBottomDrawerOpen } = useSidebar();
    const [isLoading, setIsLoading] = useState(false);
    const [isShowingInDrawer, setIsShowingInDrawer] = useState(false);
    const [isAiChatOpen, setIsAiChatOpen] = useState(false);
    // Add useEffect to check validation status whenever formStates changes
    useEffect(() => {
        const formData = formStates[id];
        const nodeSchema = schemaData.schema.find((s: any) => s.title === data.label);
        const isSource = data.label?.toLowerCase()?.includes("source");
        
        // Set initial title from data.label if it exists
        if (data.title) {
            setTitleValue(data.title);
            setNodes((nodes: any[]) =>
                nodes.map(node =>
                    node.id === id
                        ? { ...node, data: { ...node.data, title: data.title } }
                        : node
                )
            );
        }

        // Validation logic
        if (isFlow) { 
            if (formData) {
                const { status, warnings } = validateFormData(
                    formData, 
                    nodeSchema, 
                    true, 
                    data.source, 
                    formHasBeenOpened
                );
                setValidationStatus(status);
                setValidationMessages(warnings);
            } else {
                setValidationStatus('error');
                setValidationMessages(['Form not filled']);
            }
        } else {
            if (isSource) {
                const { status, warnings } = validateFormData(
                    formData, 
                    nodeSchema, 
                    true, 
                    data.source, 
                    formHasBeenOpened
                );
                setValidationStatus(status);
                setValidationMessages(warnings);
                return;
            }

            if (formData) {
                const { status, warnings } = validateFormData(
                    formData, 
                    nodeSchema, 
                    false, 
                    data.label?.toLowerCase() === "target" ? formData.target : null,
                    formHasBeenOpened
                );
                setValidationStatus(status);
                setValidationMessages(warnings);
            } else {
                setValidationStatus('error');
                setValidationMessages(['Form not filled']);
            }
        }

    }, [formStates, id, data.label, data.source, setNodes, formHasBeenOpened]);

    // Add effect to track form state
    useEffect(() => {
        const isNodeSelected = formStates[id] && selectedSchema?.nodeId === id;
        setIsSelected(isNodeSelected);
    }, [formStates, id, selectedSchema]);
    
    // Add effect to update title when node data changes
    useEffect(() => {
        if (data.title) {
            setTitleValue(data.title);
            console.log(`CustomNode: Updating title for node ${id} to ${data.title}`);
            
            // Also update the node data to ensure the title is displayed correctly
            setNodes((nodes: any[]) =>
                nodes.map(node =>
                    node.id === id
                        ? { ...node, data: { ...node.data, title: data.title } }
                        : node
                )
            );
        }
    }, [data.title]);

    const handleDoubleClick = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // If onNodeDoubleClick is provided, use it to open the NodeForm
        if (onNodeDoubleClick) {
            // Mark that the form has been opened for this node
            setFormHasBeenOpened(true);
            onNodeDoubleClick(id);
        } else {
            // Otherwise, fall back to the original behavior
            setIsEditingTitle(true);
        }
    }, [id, onNodeDoubleClick]);

    const handleImageHover = useCallback(() => {
        // Clear any existing timeout
        if (toolbarTimeout) {
            clearTimeout(toolbarTimeout);
        }
        setShowToolbar(true);
    }, [toolbarTimeout]);

    const handleImageLeave = useCallback(() => {
        // Set a new timeout
        const timeout = setTimeout(() => {
            setShowToolbar(false);
        }, 4000); // 4 seconds
        setToolbarTimeout(timeout);
    }, []);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (toolbarTimeout) {
                clearTimeout(toolbarTimeout);
            }
        };
    }, [toolbarTimeout]);

    const handleDelete = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        const { setEdges, setNodes } = reactFlowInstance;
        setNodes((nodes: any[]) => nodes.filter(node => node.id !== id));
        setEdges((edges: any[]) => edges.filter(edge =>
            edge.source !== id && edge.target !== id
        ));
        if (debuggedNodes.has(id)) {
            onDebugToggle(id, data.title);
        }
        

    }, [id, setNodes, reactFlowInstance, debuggedNodes, onDebugToggle, data.title]);



    const handleEdit = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setIsEditingTitle(true);
    }, []);

    const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        // Optional: Add additional validation here if needed
        setTitleValue(newValue);
    }, []);

    // Add function to check if title already exists
    const isTitleDuplicate = useCallback((newTitle: string, currentId: string) => {
        const existingNodes = reactFlowInstance.getNodes();
        return existingNodes.some(node =>
            node.id !== currentId &&
            (node.data.title === newTitle || node.data.label === newTitle)
        );
    }, [reactFlowInstance]);

    const handleTitleBlur = useCallback(() => {
        setIsEditingTitle(false);
        setTitleError(null);

        const baseModuleName = data.label.split(' ')[0];

        if (titleValue === baseModuleName && isTitleDuplicate(baseModuleName, id)) {
            setTitleError('This name is already in use');
            setTitleValue(data.title);
            return;
        }

        if (isTitleDuplicate(titleValue, id)) {
            setTitleError('This name is already in use');
            setTitleValue(data.title);
            return;
        }

        setNodes((nodes: any[]) =>
            nodes.map(node =>
                node.id === id
                    ? { ...node, data: { ...node.data, title: titleValue } }
                    : node
            )
        );
    }, [id, setNodes, titleValue, data.label, data.title, isTitleDuplicate]);

    const handleRefresh = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        console.log('Refreshing node:', id);
        
        // Call the context's handleRefreshNode function
        if (handleRefreshNode) {
            handleRefreshNode(id);
        }
    }, [id, handleRefreshNode]);

    const handleAiChat = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        console.log('Opening AI Chat for node:', id);
        setIsAiChatOpen(true);
    }, [id]);

    const handleImageClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setIsSelected(true);
        handleSearchResultClick(id);

        // Don't open the NodeForm on single click, only on double click
        // The onNodeDoubleClick handler is used in handleDoubleClick

        // Otherwise, use the original form opening logic
        const schema = schemaData.schema.find(
            (s: Schema) => s.title === data.label
        );

        if (schema) {
            // Get the existing form state for this node
            const existingFormState = formStates[id];

            // Get the transformation data from the node
            const transformationData = data.transformationData;

            // Combine existing form state with transformation data
            const combinedState = {
                ...existingFormState,
                ...transformationData,
                // Preserve the name if it exists
                name: data.title || existingFormState?.name
            };

            setSelectedSchema({
                ...schema,
                nodeId: id,
                // Pass the combined state as initial values
                initialValues: combinedState
            });

            // Update form states with combined state
            setFormStates((prev: any) => ({
                ...prev,
                [id]: combinedState
            }));

            setIsFormOpen(true);
            // Mark that the form has been opened for this node
            setFormHasBeenOpened(true);
        } else {
            // console.log('Schema not found for:', data);
            if (data?.source || data?.label === "Reader") {
                dispatch(setIsRightPanelOpen(false))
                setSelectedSourceLabel("Source");
                setSelectedSource(data?.source);
                // Mark that the form has been opened for this node
                setFormHasBeenOpened(true);
            }
            if (data?.label.toLowerCase() === "target" || data?.title.toLowerCase() === "target") {
                setSelectedSourceLabel("target");
                let targetData = data;
                targetData.source = data?.source ? data?.source : data;
                setSelectedSource(targetData);
                // Mark that the form has been opened for this node
                setFormHasBeenOpened(true);

                // Update the node title immediately when target configuration is updated
                setNodes((nodes: any[]) =>
                    nodes.map(node =>
                        node.id === id
                            ? {
                                ...node,
                                data: {
                                    ...node.data,
                                    title: targetData.source.name || targetData.source.title || "Target",
                                    source: targetData.source
                                }
                            }
                            : node
                    )
                );
            }
        }
    }, [data, id, formStates, setSelectedSchema, setFormStates, setIsFormOpen, handleSearchResultClick, setNodes]);



    const handleDebug = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onDebugToggle(id, titleValue);
    }, [id, titleValue, onDebugToggle]);

    const handleNodeClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        handleSearchResultClick(id);
    }, [id, handleSearchResultClick]);

    const handleAlignTopLeftClick = useCallback(() => {
        console.log("Align Top Left clicked");
        try {
            if (!nodesInFlow || nodesInFlow.length === 0) {
                console.log("No nodes to align");
                return;
            }
            
            // Simple grid layout starting from top-left
            const startX = -250; // Move nodes more to the right
            const startY = -120; // Move nodes even higher up (can go negative)
            const gridSpacing = 150; // Space between nodes
            const nodesPerRow = 4; // Number of nodes per row
            
            const newNodes = nodesInFlow.map((node, index) => {
                const row = Math.floor(index / nodesPerRow);
                const col = index % nodesPerRow;
                
                return {
                    ...node,
                    position: {
                        x: startX + (col * gridSpacing),
                        y: startY + (row * gridSpacing)
                    }
                };
            });

            // Update nodes with new positions
            updateSetNode(newNodes, edgesInFlow);

            // Center the view after a short delay
            setTimeout(() => {
                if (reactFlowInstance && reactFlowInstance.setCenter) {
                    // Calculate the center of the grid
                    const rows = Math.ceil(nodesInFlow.length / nodesPerRow);
                    const centerX = startX + ((nodesPerRow - 1) * gridSpacing) / 2;
                    const centerY = startY + ((rows - 1) * gridSpacing) / 2;
                    
                    reactFlowInstance.setCenter(centerX, centerY, { duration: 800 });
                }
                
                // Try to click the fitView button directly as a fallback
                const fitViewButton = document.querySelector('.react-flow__controls-fitview');
                if (fitViewButton instanceof HTMLElement) {
                    console.log("Clicking fitView button after top-left alignment");
                    fitViewButton.click();
                }
            }, 100);
            
        } catch (error) {
            console.error("Error in align top left:", error);
        }
    }, [nodesInFlow, edgesInFlow, reactFlowInstance, updateSetNode]);

    const handleMetricsClick = useCallback(async (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        
        // Find the row count for this node
        const rowCount = transformationCounts?.find(
            (t) => t.transformationName?.toLowerCase() === titleValue?.toLowerCase()
        )?.rowCount;
        
        // Only proceed if rowCount exists (meaning the node is in debug list)
        if (rowCount) {
            setIsLoading(true);
            setIsShowingInDrawer(true);
            await handleAlignTopLeftClick();
            
            try {
                // First fetch the data
                const result = await dispatch(fetchTransformationOutput({
                    pipelineName: pipelineDtl?.name || pipelineDtl?.pipeline_name,
                    transformationName: titleValue,
                    isFlow
                })).unwrap();
                
                // Format the data for the Terminal component
                const previewData: PreviewData = {
                    transformationName: titleValue || 'Transformation',
                    outputs: result.outputs || []
                };
                
                // Create the Terminal component with the preview data
                const terminalComponent = (
                    <Terminal 
                        isOpen={true}  // Set to true since we're opening it in the drawer
                        onClose={closeBottomDrawer}
                        title={`${titleValue || 'Transformation'} Data`}
                        previewData={previewData}
                        pipelineName={pipelineDtl?.pipeline_name}
                        activeTabOnOpen={isFlow ? "terminal" : "preview"}
                    />
                );
                setBottomDrawerContent(terminalComponent, `${titleValue || 'Transformation'} Data`);
            } catch (error) {
                console.error("Error fetching transformation output:", error);
            } finally {
                setIsLoading(false);
            }
        }
    }, [dispatch, pipelineDtl, titleValue, isFlow, transformationCounts, closeBottomDrawer, setBottomDrawerContent, handleAlignTopLeftClick]);

    // Effect to handle drawer state synchronization - only reacts to external drawer close
    useEffect(() => {
        // If we're showing our content in the drawer and the drawer is closed externally,
        // update our local state
        if (isShowingInDrawer && !isBottomDrawerOpen) {
            setIsShowingInDrawer(false);
        }
    }, [isShowingInDrawer, isBottomDrawerOpen]);

    return (
        <div
            className="relative group"
            style={{
                minWidth: 50,
                ...style
            }}
            onClick={handleNodeClick}
        >
            {/* Debug indicator */}
            {debuggedNodes.has(id) && (
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm z-10" />
            )}

            {/* Row count badge positioned above the node */}
            <div className="flex flex-col items-center">
                <RowCountBadge 
                    rowCount={transformationCounts?.find(
                        (t) => t.transformationName?.toLowerCase() === titleValue?.toLowerCase()
                    )?.rowCount}
                    isLoading={isLoading}
                    onMetricsClick={handleMetricsClick}
                    className="relative mb-1"
                />

                {/* Main node content */}
                <div className="relative">
                    <NodeToolbar
                        show={showToolbar}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onDebug={handleDebug}
                        onRefresh={handleRefresh}
                        onAiChat={handleAiChat}
                        isDebugged={debuggedNodes.has(id)}
                    />

                    <NodeImage
                    data={data}
                    isSelected={isSelected}
                    onImageClick={(e: React.MouseEvent) => {
                        if (onImageClick) {
                            e.stopPropagation();
                            onImageClick(id);
                            let node = nodes.find((n) => n.id == id)
                            console.log(data?.id, "data?.id", id, "id", node, "node")
                            // selectNode(data?.id?.toString());
                            setSelectedNode(node)
                            setSelectedNodeId(data?.id)

                            setTimeout(() => {
                                setSelectedNodeId(data?.id);
                                setIsNodeFormOpen(true);
                            }, 50);
                        } else {
                            handleImageClick(e);
                        }
                    }}
                    onMouseEnter={handleImageHover}
                    onMouseLeave={handleImageLeave}
                    formStates={formStates}
                    id={id}
                />
                </div>
            </div>

            <ValidationIndicator
                data={data}
                validationStatus={validationStatus}
                validationMessages={validationMessages}
                showTooltip={showValidationTooltip}
                onTooltipEnter={() => setShowValidationTooltip(true)}
                onTooltipLeave={() => setShowValidationTooltip(false)}
                type={type}
                label={ <NodeTitle
                    isEditing={isEditingTitle}
                    value={titleValue}
                    onChange={handleTitleChange}
                    onBlur={handleTitleBlur}
                    onDoubleClick={handleDoubleClick}
                    error={titleError}
                    isSelected={isSelected}
                    label={data.label}
                />}
            />

            <NodeHandles data={data} />



            {/* Popups */}
            {selectedSourceLabel === "Source" && (
                <OrderPopUp
                    isOpen={true}
                    onClose={() => setSelectedSourceLabel(null)}
                    source={selectedSource}
                    nodeId={id}
                    onSourceUpdate={onSourceUpdate}
                />
            )}

            {selectedSourceLabel === "target" && (
                <TargetPopUp
                    isOpen={true}
                    onClose={() => setSelectedSourceLabel(null)}
                    source={selectedSource}
                    nodeId={id}
                    onSourceUpdate={onSourceUpdate}
                />
            )}
            <AiChatComponent isAiChatOpen={isAiChatOpen} setIsAiChatOpen={setIsAiChatOpen} data={data} current_node_id={id} />
        </div>
    );
});
