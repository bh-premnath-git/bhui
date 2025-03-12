import React, { memo, useCallback, useState, useEffect } from 'react';
import { Handle, Position, useEdges, useReactFlow } from 'reactflow';
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

interface Schema {
    title: string;
    nodeId?: string;
    [key: string]: any;
}

export const CustomNode = memo(({ data, id, setNodes, setSelectedSchema, setFormStates, setIsFormOpen, formStates, setRunDialogOpen, setSelectedFormState, onDebugToggle, debuggedNodes, onSourceUpdate, pipelineDtl, setEdges, style, selectedSchema,handleSearchResultClick }: {
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
}) => {
    // console.log(data)
    const [showToolbar, setShowToolbar] = useState(false);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [titleValue, setTitleValue] = useState(data.title );
    const edges = useEdges();
    const reactFlowInstance = useReactFlow();
    const [showInfo, setShowInfo] = useState(false);
    const [toolbarTimeout, setToolbarTimeout] = useState<NodeJS.Timeout | null>(null);
    const [validationStatus, setValidationStatus] = useState<'none' | 'valid' | 'warning' | 'error'>('none');
    const [validationMessages, setValidationMessages] = useState<string[]>([]);
    const [showValidationTooltip, setShowValidationTooltip] = useState(false);
    const [selectedSourceLabel, setSelectedSourceLabel] = useState(null);
    const [selectedSource, setSelectedSource] = useState(null);
    const [isSelected, setIsSelected] = useState(false);
    const [titleError, setTitleError] = useState<string | null>(null);
// console.log(data,"data")
    // Add useEffect to check validation status whenever formStates changes
    useEffect(() => {
        const formData = formStates[id];
        const nodeSchema = schemaData.schema.find((s: any) => s.title === data.label);
        const isSource = data.label?.toLowerCase()?.includes("source");
        // console.log(schemaData.schema)
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
        if (isSource ) {
            const { isValid, warnings } = validateFormData(formData, nodeSchema, true, data.source);
            setValidationStatus(isValid ? 'valid' : 'error');
            setValidationMessages(warnings);
            return;
        }
 
        if (formData) {
            const { isValid, warnings } = validateFormData(formData, nodeSchema, false,data.label?.toLowerCase()=="target"? formData.target:null);
            setValidationStatus(isValid ? 'valid' : warnings.length > 0 ? 'warning' : 'error');
            setValidationMessages(warnings);
        } else {
            setValidationStatus('error');
            setValidationMessages(['Form not filled']);
        }
    }, [formStates, id, data.label, data.source, setNodes]);

    // Add effect to track form state
    useEffect(() => {
        const isNodeSelected = formStates[id] && selectedSchema?.nodeId === id;
        setIsSelected(isNodeSelected);
    }, [formStates, id, selectedSchema]);

    const handleDoubleClick = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsEditingTitle(true);
    }, []);

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
        const { setEdges } = reactFlowInstance;
        setNodes((nodes: any[]) => nodes.filter(node => node.id !== id));
        setEdges((edges: any[]) => edges.filter(edge =>
            edge.source !== id && edge.target !== id
        ));
        if (debuggedNodes.has(id)) {
            onDebugToggle(id, data.title);
        }
    }, [id, setNodes, reactFlowInstance, debuggedNodes, onDebugToggle, data.title]);

    const handleClone = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setNodes((nodes: any[]) => {
            const nodeToClone = nodes.find(node => node.id === id);
            if (!nodeToClone) return nodes;

            const cloneCount = nodes.filter(node =>
                node.id.startsWith(`${id}_clone_`)
            ).length;

            const newNode = {
                ...nodeToClone,
                id: `${id}_clone_${Date.now()}`,
                position: {
                    x: nodeToClone.position.x + (100 * (cloneCount + 1)),
                    y: nodeToClone.position.y
                }
            };
            return [...nodes, newNode];
        });
    }, [id, setNodes]);

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

    const handleInfo = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setShowInfo(true);
    }, []);

    const handleImageClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setIsSelected(true);
        handleSearchResultClick(id);

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
        } else {
            // console.log('Schema not found for:', data);
            if (data?.source || data?.label === "Reader") {
                setSelectedSourceLabel("Source");
                setSelectedSource(data?.source);
            }
            if(data?.label.toLowerCase() === "target" || data?.title.toLowerCase() === "target"){
                setSelectedSourceLabel("target");
                let targetData = data;
                targetData.source = data?.source ? data?.source : data;
                setSelectedSource(targetData);
                
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

            {/* Main node content */}
            <div className="relative">
                <NodeToolbar 
                    show={showToolbar}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onInfo={handleInfo}
                    onClone={handleClone}
                    onDebug={handleDebug}
                    isDebugged={debuggedNodes.has(id)}
                />

                <NodeTitle 
                    isEditing={isEditingTitle}
                    value={titleValue}
                    onChange={handleTitleChange}
                    onBlur={handleTitleBlur}
                    onDoubleClick={handleDoubleClick}
                    error={titleError}
                    isSelected={isSelected}
                    label={data.label}
                />

                <NodeImage 
                    data={data}
                    isSelected={isSelected}
                    onImageClick={handleImageClick}
                    onMouseEnter={handleImageHover}
                    onMouseLeave={handleImageLeave}
                    formStates={formStates}
                    id={id}
                />
            </div>

            <ValidationIndicator 
                data={data}
                validationStatus={validationStatus}
                validationMessages={validationMessages}
                showTooltip={showValidationTooltip}
                onTooltipEnter={() => setShowValidationTooltip(true)}
                onTooltipLeave={() => setShowValidationTooltip(false)}
            />

            <NodeHandles data={data} />

            {showInfo && (
                <NodeInfo 
                    data={data}
                    titleValue={titleValue}
                    debuggedNodes={debuggedNodes}
                    id={id}
                    formStates={formStates}
                    onClose={() => setShowInfo(false)}
                />
            )}

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
        </div>
    );
});