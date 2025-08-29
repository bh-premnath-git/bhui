import React, { memo, useCallback, useState, useEffect } from 'react';
import { useEdges, useReactFlow, useNodes } from '@xyflow/react';
import schemaData from '@/pages/designers/data-pipeline/data/mdata.json';
import OrderPopUp from './OrderPopUp';
import { validateFormData } from './validation';
import { NodeToolbar } from './components/NodeToolbar';
import { NodeTitle } from './components/NodeTitle';
import { NodeImage } from './components/NodeImage';
import { NodeHandles } from './components/NodeHandles';
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
import AiChatComponent from './AiChatComponent';
import { alignNodesToTopLeft } from '@/utils/nodeAlignment';
import { pipelineSchema } from "@bh-ai/schemas";
import { usePipelineModules } from '@/hooks/usePipelineModules';

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
    const { setSelectedNode } = useFlow();
    const { 
        setIsNodeFormOpen,
        setSelectedNodeId, 
        nodes,
        handleRefreshNode,transformationCounts, pipelineDtl, updateSetNode,attachedCluster } = usePipelineContext();
    const { isFlow, selectedEngineType } = useAppSelector((state) => state.buildPipeline);
    const dispatch = useAppDispatch();
    const { setBottomDrawerContent, closeBottomDrawer, isBottomDrawerOpen } = useSidebar();
    const [isLoading, setIsLoading] = useState(false);
    const [isShowingInDrawer, setIsShowingInDrawer] = useState(false);
    const [isAiChatOpen, setIsAiChatOpen] = useState(false);
    
    // Get dynamic pipeline modules
    const pipelineModules = usePipelineModules(selectedEngineType || 'pyspark');
    // Helper function to find dynamic schema for a node
    const findDynamicSchema = useCallback((nodeLabel: string) => {
        try {
            // First, try to find the transformation directly from the pipeline schema
            if (pipelineSchema?.allOf) {
                const engineType = selectedEngineType || 'pyspark';
                const engineSchema = pipelineSchema.allOf.find((schema: any) => 
                    schema.if?.properties?.engine_type?.const === engineType
                );
                
                if (engineSchema?.then?.properties?.transformations?.items?.allOf) {
                    const transformation = engineSchema.then.properties.transformations.items.allOf.find((t: any) => 
                        t?.then?.ui_properties?.module_name === nodeLabel
                    );
                    
                    if (transformation?.then) {
                        console.log(`✅ Found dynamic schema for ${nodeLabel}:`, transformation.then);
                        return {
                            ...transformation.then,
                            title: nodeLabel,
                            nodeId: id // Add node ID for compatibility
                        };
                    }
                }
            }
            
            // Fallback: Find the module from processed pipeline modules
            const module = pipelineModules.find(mod => mod.label === nodeLabel);
            if (!module) {
                console.log(`No module found for label: ${nodeLabel}`);
                return null;
            }

            // Get the first operator (transformation) from the module
            const operator = module.operators?.[0];
            if (!operator) {
                console.log(`No operator found for module: ${nodeLabel}`);
                return null;
            }

            // Create a schema object compatible with the existing form system
            return {
                title: nodeLabel,
                type: operator.type,
                properties: operator.properties,
                required: operator.requiredFields || [],
                description: operator.description || '',
                ui_properties: {
                    module_name: module.label,
                    color: module.color,
                    icon: module.icon,
                    ports: module.ports
                }
            };
        } catch (error) {
            console.error('Error finding dynamic schema:', error);
            return null;
        }
    }, [pipelineModules, selectedEngineType, id]);
    
    // Add useEffect to check validation status whenever formStates changes
    useEffect(() => {
        const formData = formStates[id];
        // Try dynamic schema first, fallback to static schema
        let nodeSchema = findDynamicSchema(data.label);
        if (!nodeSchema) {
            nodeSchema = schemaData.schema.find((s: any) => s.title === data.label);
        }
        const isSource = data.label?.toLowerCase()?.includes("source");
        
        // Set initial title from data.label if it exists (but not when editing)
        if (data.title && data.title !== titleValue && !isEditingTitle) {
            setTitleValue(data.title);
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

    }, [formStates, id, data.label, data.source, setNodes, formHasBeenOpened, isEditingTitle, findDynamicSchema]);

    // Add effect to track form state
    useEffect(() => {
        const isNodeSelected = formStates[id] && selectedSchema?.nodeId === id;
        setIsSelected(isNodeSelected);
    }, [formStates, id, selectedSchema]);
    
    // Add effect to update title when node data changes (but not when editing)
    useEffect(() => {
        if (data.title && data.title !== titleValue && !isEditingTitle) {
            setTitleValue(data.title);
            console.log(`CustomNode: Updating title for node ${id} to ${data.title}`);
        }
    }, [data.title, titleValue, id, isEditingTitle]);

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
        console.log('Title changing to:', newValue);
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
        console.log('Title blur triggered, current value:', titleValue);
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

        // Only update if the title has actually changed
        if (titleValue !== data.title) {
            // Update nodes using pipeline context to ensure proper state management and persistence
            const updatedNodes = nodes.map(node =>
                node.id === id
                    ? { ...node, data: { ...node.data, title: titleValue } }
                    : node
            );
            
            // Use a small timeout to ensure the editing state is properly set before updating
            setTimeout(() => {
                updateSetNode(updatedNodes, edgesInFlow);
            }, 0);
        }
    }, [id, nodes, edgesInFlow, updateSetNode, titleValue, data.label, data.title, isTitleDuplicate]);

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

        // Try to find dynamic schema first, fallback to static schema
        let schema = findDynamicSchema(data.label);
        
        // If no dynamic schema found, try the static schema as fallback
        if (!schema) {
            schema = schemaData.schema.find(
                (s: Schema) => s.title === data.label
            );
        }

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
                
                // For Reader nodes, we need to create a proper schema structure
                if (data?.label === "Reader") {
                    console.log('🔧 CustomNode: Creating Reader schema for data:', data);
                    console.log('🔧 CustomNode: data.source:', data?.source);
                    console.log('🔧 CustomNode: data.data_src_id:', data?.data_src_id);
                    console.log('🔧 CustomNode: data.source?.data_src_id:', data?.source?.data_src_id);
                    
                    // Create a Reader schema structure
                    const readerSchema = {
                        title: "Reader",
                        nodeId: id,
                        initialValues: {
                            reader_name: data?.title || data?.source?.data_src_name || data?.source?.name || '',
                            name: data?.title || data?.source?.data_src_name || data?.source?.name || '',
                            file_type: data?.source?.file_type || 'CSV',
                            source: {
                                type: data?.source?.type || 'File',
                                source_name: data?.source?.data_src_name || data?.source?.name || data?.title || '',
                                file_name: data?.source?.file_name || data?.source?.data_src_name || data?.title || '',
                                table_name: data?.source?.table_name || data?.source?.data_src_name || '',
                                bh_project_id: data?.source?.bh_project_id || '',
                                data_src_id: data?.source?.data_src_id || data?.data_src_id || '',
                                file_type: data?.source?.file_type || 'CSV',
                                connection: {
                                    ...data?.source?.connection,
                                    name: data?.source?.connection?.name || data?.source?.connection?.connection_config_name || '',
                                    connection_config_id: data?.source?.connection_config_id || data?.source?.connection?.connection_config_id || '',
                                    file_path_prefix: data?.source?.file_path_prefix || data?.source?.connection?.file_path_prefix || '',
                                },
                                connection_config_id: data?.source?.connection_config_id || data?.source?.connection?.connection_config_id || '',
                                ...data?.source
                            },
                            ...data?.source,
                            nodeId: id
                        }
                    };
                    
                    console.log('🔧 CustomNode: Setting Reader schema with initialValues:', readerSchema);
                    
                    setSelectedSchema(readerSchema);
                    
                    // Update form states with the Reader data
                    setFormStates((prev: any) => ({
                        ...prev,
                        [id]: readerSchema.initialValues
                    }));
                    
                    setIsFormOpen(true);
                } else {
                    setSelectedSource(data?.source);
                }
                
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
                const updatedNodes = nodes.map(node =>
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
                );
                updateSetNode(updatedNodes, edgesInFlow);
            }
        }
    }, [data, id, formStates, setSelectedSchema, setFormStates, setIsFormOpen, handleSearchResultClick, nodes, edgesInFlow, updateSetNode, findDynamicSchema]);



    const handleDebug = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onDebugToggle(id, titleValue);
    }, [id, titleValue, onDebugToggle]);

    const handleNodeClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        handleSearchResultClick(id);
    }, [id, handleSearchResultClick]);

    const handleAlignTopLeftClick = useCallback(() => {
        alignNodesToTopLeft(nodesInFlow, edgesInFlow, updateSetNode, reactFlowInstance);
    }, [nodesInFlow, edgesInFlow, updateSetNode, reactFlowInstance]);

    const handleMetricsClick = useCallback(async (e: React.MouseEvent) => {
        console.log('handleMetricsClick called for node:', id)
        e.stopPropagation();
        e.preventDefault();
        // Proceed with API call if we have the necessary data
        if (titleValue && pipelineDtl && (pipelineDtl.name || pipelineDtl.pipeline_name)) {
            setIsLoading(true);
            setIsShowingInDrawer(true);
            // await handleAlignTopLeftClick();
            
            try {
                console.log('Making API call with params:', {
                    pipelineName: pipelineDtl?.name || pipelineDtl?.pipeline_name,
                    transformationName: titleValue,
                    host: attachedCluster?.master_ip || "host.docker.internal",
                    isFlow
                });
                
                // First fetch the data
                const result = await dispatch(fetchTransformationOutput({
                    pipelineName: pipelineDtl?.name || pipelineDtl?.pipeline_name,
                    transformationName: titleValue,
                    host: attachedCluster?.master_ip || "host.docker.internal",
                    isFlow
                })).unwrap();
                
                console.log('API call result:', result);
                
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
                
                // Realign all nodes to top-left when drawer is opened
                handleAlignTopLeftClick();
            } catch (error) {
                console.error("Error fetching transformation output:", error);
            } finally {
                setIsLoading(false);
            }
        } else {
            console.log('Missing required data for API call:', {
                titleValue,
                pipelineDtl,
                pipelineName: pipelineDtl?.name || pipelineDtl?.pipeline_name
            });
        }
    }, [dispatch, pipelineDtl, titleValue, isFlow, transformationCounts, closeBottomDrawer, setBottomDrawerContent, handleAlignTopLeftClick, attachedCluster]);

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
                    className="relative mb-1 mt-4"
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
                    initialData={selectedSource}
                    nodeId={id}
                    onSourceUpdate={onSourceUpdate}
                />
            )}
            <AiChatComponent isAiChatOpen={isAiChatOpen} setIsAiChatOpen={setIsAiChatOpen} data={data} current_node_id={id} />
        </div>
    );
});
