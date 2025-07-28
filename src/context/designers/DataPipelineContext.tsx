import React, {
    createContext,
    useState,
    useCallback,
    useEffect,
    useMemo,
    MutableRefObject,
    useRef,
    useContext
} from 'react';
import { usePipelineActions } from '@/hooks/usePipelineActions';
import { convertPipelineToUIJson} from '@/lib/pipelineJsonConverter';
import { CATALOG_LIVE_API_URL, CATALOG_REMOTE_API_URL, USE_SECURE } from '@/config/platformenv';
import {
    useNodesState,
    useEdgesState,
    useReactFlow,
    Connection,
    addEdge
} from 'reactflow';
import { useDispatch, useSelector } from 'react-redux';

import { useParams, useNavigate, useLocation } from 'react-router-dom';
import schemaData from '@/pages/designers/data-pipeline/data/mdata.json';
import axios from 'axios';
import { convertOptimisedPipelineJsonToPipelineJson, resolveRefsPipelineJson, convertUIToPipelineJsonUpToNode } from '@/lib/convertUIToPipelineJson';
import { validatePipelineConnections } from '@/lib/validatePipelineConnections';
import { validateFormData } from '@/components/bh-reactflow-comps/builddata/validation';
import { ValidationIssue } from '@/components/headers/build-playground-header/components/PipelineControls';
import {updatePipeline} from '@/store/slices/designer/buildPipeLine/BuildPipeLineSlice';

import { AppDispatch, RootState } from '@/store';
import { apiService } from '@/lib/api/api-service';
import { useAppSelector } from '@/hooks/useRedux';
import { random } from 'lodash';
import { usePipelineOperations } from '@/hooks/usePipelineOperations';
import { Pipeline } from '@/types/designer/pipeline';

interface UIProperties {
    color: string;
    icon: string;
    module_name: string;
    ports: any;
    id?: string;
    meta?:any;
    type?:any;
    operators?: any[];
}

interface Node {
    ui_properties: UIProperties;
    [key: string]: any;
}

interface bnPipelineContextProps {
    nodes: any;
    setNodes: React.Dispatch<React.SetStateAction<any>>;
    onNodesChange: (changes: any) => void;
    edges: any;
    setEdges: React.Dispatch<React.SetStateAction<any>>;
    onEdgesChange: (changes: any) => void;
    reactFlowInstance: any;
    nodeCounters: { [key: string]: number };
    setNodeCounters: React.Dispatch<React.SetStateAction<{ [key: string]: number }>>;
    debuggedNodes: string[];
    setDebuggedNodes: React.Dispatch<React.SetStateAction<string[]>>;
    debuggedNodesList: Array<{ id: string; title: string }>;
    setDebuggedNodesList: React.Dispatch<React.SetStateAction<Array<{ id: string; title: string }>>>;
    isPipelineRunning: boolean;
    setIsPipelineRunning: React.Dispatch<React.SetStateAction<boolean>>;
    transformationCounts: Array<{ transformationName: string; rowCount: string }>;
    setTransformationCounts: React.Dispatch<React.SetStateAction<Array<{ transformationName: string; rowCount: string }>>>;
    pipelineDtl: any;
    // setPipelineDtl: React.Dispatch<React.SetStateAction<any>>;
    formStates: { [key: string]: any };
    setFormStates: React.Dispatch<React.SetStateAction<{ [key: string]: any }>>;
    fetchPipelineDetails: () => Promise<void>;
    sourceColumns: any;
    setSourceColumns: React.Dispatch<React.SetStateAction<any>>;
    setPipeline_id: React.Dispatch<React.SetStateAction<any>>;
    searchTerm: string;
    setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
    searchResults: Array<{ id: string; label: string; title: string }>;
    setSearchResults: React.Dispatch<React.SetStateAction<Array<{ id: string; label: string; title: string }>>>;
    highlightedNodeId: string | null;
    setHighlightedNodeId: React.Dispatch<React.SetStateAction<string | null>>;
    copiedNodes: any;
    setCopiedNodes: React.Dispatch<React.SetStateAction<any>>;
    copiedEdges: any;
    setCopiedEdges: React.Dispatch<React.SetStateAction<any>>;
    copiedFormStates: { [key: string]: any };
    setCopiedFormStates: React.Dispatch<React.SetStateAction<{ [key: string]: any }>>;
    validationErrors: string | string[];
    setValidationErrors: React.Dispatch<React.SetStateAction<string | string[]>>;
    conversionLogs: Array<{ timestamp: string; message: string; level: 'info' | 'error' | 'warning' }>;
    setConversionLogs: React.Dispatch<React.SetStateAction<Array<{ timestamp: string; message: string; level: 'info' | 'error' | 'warning' }>>>;
    terminalLogs: Array<{ timestamp: string; message: string; level: 'info' | 'error' | 'warning' }>;
    setTerminalLogs: React.Dispatch<React.SetStateAction<Array<{ timestamp: string; message: string; level: 'info' | 'error' | 'warning' }>>>;
    showLogs: boolean;
    setShowLogs: React.Dispatch<React.SetStateAction<boolean>>;
    errorBanner: { title: string; description: string } | null;
    setErrorBanner: React.Dispatch<React.SetStateAction<{ title: string; description: string } | null>>;
    handleSearch: (term: string) => void;
    handleSearchResultClick: (nodeId: string) => void;
    handleNodeUpdate: (nodeId: string, updatedData: any) => void;
    handleSourceUpdate: ({ nodeId, sourceData }: { nodeId: string; sourceData: any }) => void;
    handleNodesChange: (changes: any) => void;
    handleEdgesChange: (changes: any) => void;
    handleFormSubmit: (data: any) => void;
    handleDialogClose: () => void;
    handleRunClick: (e: React.MouseEvent) => any;
    handleNodeForm: (targetNodeId: string) => void;
    onConnect: (connection: Connection) => void;
    handleDebugToggle: (nodeId: string, title: string) => void;
    handleRun: () => void;
    handleStop: () => void;
    handleNext: () => void;
    handleRefreshNode: (nodeId: string) => Promise<void>;
    fetchSourceColumns: (nodes: any) => void;
    handleLeavePage: () => void;
    getTransformationName: (moduleName: string) => string;
    addNodeToHistory: () => void;
    handleCopy: () => void;
    isPipelineValid: boolean;
    pipelineValidationErrors: ValidationIssue[];
    pipelineValidationWarnings: ValidationIssue[];
    handlePaste: () => void;
    handleCut: () => void;
    handleUndo: () => void;
    handleRedo: () => void;
    handleLogsClick: () => void;
    selectedSchema: any;
    setSelectedSchema: React.Dispatch<React.SetStateAction<any>>;
    isFormOpen: boolean;
    setIsFormOpen: React.Dispatch<React.SetStateAction<boolean>>;
    handleNodeClick: (node: any, source: any) => void;
    isCanvasLoading: boolean;
    setIsCanvasLoading: React.Dispatch<React.SetStateAction<boolean>>;
    handleAlignHorizontal: () => void;
    handleAlignVertical: () => void;
    handleAlignTopLeft: () => void;
    runDialogOpen: boolean;
    setRunDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
    selectedFormState: any;
    setSelectedFormState: React.Dispatch<React.SetStateAction<any>>;
    showLeavePrompt: boolean;
    setShowLeavePrompt: React.Dispatch<React.SetStateAction<boolean>>;
    handleKeyDown: (event: KeyboardEvent) => void;
    handleZoomIn: () => void;
    handleZoomOut: () => void;
    handleCenter: () => void;
    makePipeline: (result: any) => void;
    ctrlDTimeout: MutableRefObject<NodeJS.Timeout | null>;
    isSaving: boolean;
    hasUnsavedChanges: boolean;
    lastSaved: Date | null;
    saveError: string | null;
    setSaving: () => void;
    setSaved: () => void;
    setLastSaved: (date: Date) => void;
    setUnsavedChanges: () => void;
    setSaveError: (error: string) => void;
    setPipeLineName: (json: any) => void;
    setPipelineJson: (json: any) => void;
    pipelineName: any;
    pipelineJson: any;
    setProjectName: (name: string) => void;
    projectName: string;
    isNodeFormOpen: boolean;
    setIsNodeFormOpen: React.Dispatch<React.SetStateAction<boolean>>;
    selectedNodeId: string | null;
    setSelectedNodeId: React.Dispatch<React.SetStateAction<string | null>>;
    updatedSelectedNodeId: any
    updateSetNode: (node: any, edges: any) => void
    updateAllNodeDependencies: () => void
    selectedMode: 'engine' | 'debug' | 'interactive'
    attachedCluster: any
    setAttachedCluster: React.Dispatch<React.SetStateAction<any>>
    attachCluster: (cluster: any) => void
    detachCluster: () => void
    pipelines: Pipeline[];
    setPipelines: React.Dispatch<React.SetStateAction<Pipeline[]>>;
}

const PipelineContext = createContext<bnPipelineContextProps | undefined>(undefined);

export const PipelineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation()
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [nodeCounters, setNodeCounters] = useState<{ [key: string]: number }>({});
    const reactFlowInstance = useReactFlow();
    const [debuggedNodes, setDebuggedNodes] = useState<string[]>([]);
    const [debuggedNodesList, setDebuggedNodesList] = useState<Array<{ id: string; title: string }>>([]);
    const [isPipelineRunning, setIsPipelineRunning] = useState(false);
    const [transformationCounts, setTransformationCounts] = useState<Array<{ transformationName: string; rowCount: string }>>([]);
    const id = localStorage.getItem("pipeline_id");
    const dispatch = useDispatch<AppDispatch>();

    const ctrlDTimeout = useRef<NodeJS.Timeout | null>(null);
    const [history, setHistory] = useState<Array<{ nodes: any; edges: any }>>([]);
    const [redoStack, setRedoStack] = useState<Array<{ nodes: any; edges: any }>>([]);
    const [sourceColumns, setSourceColumns] = useState<any>([]);
    const [pipeline_id, setPipeline_id] = useState<any>(localStorage.getItem("pipeline_id"));
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<Array<{ id: string; label: string; title: string }>>([]);
    const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null);
    const [copiedNodes, setCopiedNodes] = useState<any>([]);
    const [copiedEdges, setCopiedEdges] = useState<any>([]);
    const [copiedFormStates, setCopiedFormStates] = useState<{ [key: string]: any }>({});
    const [validationErrors, setValidationErrors] = useState<string | string[]>([]);
    const [conversionLogs, setConversionLogs] = useState<Array<{ timestamp: string; message: string; level: 'info' | 'error' | 'warning' }>>([]);
    const [terminalLogs, setTerminalLogs] = useState<Array<{ timestamp: string; message: string; level: 'info' | 'error' | 'warning' }>>([]);
    const [showLogs, setShowLogs] = useState(false);
    const [errorBanner, setErrorBanner] = useState<{ title: string; description: string } | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const { pipelineDtl, isFlow,selectedMode } = useSelector((state: RootState) => state.buildPipeline)
    const [isNodeFormOpen, setIsNodeFormOpen] = useState(false);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [selectedSchema, setSelectedSchema] = useState<any | null>(null);
    const [formStates, setFormStates] = useState<{ [key: string]: any }>({});
    const [runDialogOpen, setRunDialogOpen] = useState(false);
    const [selectedFormState, setSelectedFormState] = useState<any>(null);
    const [showLeavePrompt, setShowLeavePrompt] = useState(false);
    const time = import.meta.env.VITE_AUTO_SAVE_TIME;
    const autoSaveInterval = parseInt(time, 10) || 5000;
    const navigate = useNavigate();
    const [isCanvasLoading, setIsCanvasLoading] = useState(false);
    const { zoomIn, zoomOut, fitView } = useReactFlow();
    const [pipelines, setPipelines] = useState<Pipeline[]>([]);

    const [isSaving, setIsSaving] = useState(false); 
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [saveError, setSaveErrorState] = useState<string | null>(null);
    const [pipelineName, setPipeLineName] = useState<any>(null);
    const [projectName, setProjectName] = useState<string>('');
    const [attachedCluster, setAttachedCluster] = useState<any>(null);
    
    // Pipeline validation states
    const [isPipelineValid, setIsPipelineValid] = useState(true);
    const [pipelineValidationErrors, setPipelineValidationErrors] = useState<ValidationIssue[]>([]);
    const [pipelineValidationWarnings, setPipelineValidationWarnings] = useState<ValidationIssue[]>([]);
    // const { selectedMode } = useAppSelector((state: RootState) => state.buildPipeline);

    // Pipeline validation effect - runs when nodes, edges, or form states change
    useEffect(() => {
        const validatePipeline = () => {
            let allErrors: ValidationIssue[] = [];
            let allWarnings: ValidationIssue[] = [];

            // Add null check to prevent error when nodes is undefined
            if (!nodes || !Array.isArray(nodes)) {
                console.warn('validatePipeline: nodes is undefined or not an array:', nodes);
                return;
            }

            // Validate pipeline structure (connections)
            if (nodes.length > 0) {
                // Filter nodes to ensure they have the required 'type' property for UINode
                const validNodes = nodes.filter(node => node.type && node.data);
                const connectionValidation = validatePipelineConnections(validNodes as any, edges);
                if (!connectionValidation.isValid) {
                    // Convert connection validation errors to ValidationIssue objects
                    const connectionErrors = connectionValidation.errors.map(error => {
                        // Extract node name from error message
                        const nodeMatch = error.match(/(?:node|Node)\s*["']([^"']+)["']|["']([^"']+)["']\s*(?:node|Node)/i);
                        const nodeName = nodeMatch ? (nodeMatch[1] || nodeMatch[2]) : undefined;
                        
                        // Determine error type and suggestion
                        let type = 'CONNECTION';
                        let suggestion = undefined;
                        
                        if (error.toLowerCase().includes('no input')) {
                            suggestion = "Connect an input source or transformation to this node";
                        } else if (error.toLowerCase().includes('no output')) {
                            suggestion = "Connect this node to a target or another transformation";
                        } else if (error.toLowerCase().includes('reader')) {
                            type = 'MISSING_READER';
                            suggestion = "Add a Reader node to start your data pipeline";
                        } else if (error.toLowerCase().includes('target')) {
                            type = 'MISSING_TARGET';
                            suggestion = "Add a Target node to complete your data pipeline";
                        }

                        return {
                            message: error,
                            nodeName,
                            type,
                            severity: 'error' as const,
                            suggestion
                        };
                    });
                    allErrors.push(...connectionErrors);
                }
            }

            // Validate individual node forms
            nodes.forEach(node => {
                const nodeId = node.id;
                const formData = formStates[nodeId];
                
                // Safety check for schemaData and schema
                if (!schemaData || !schemaData.schema || !Array.isArray(schemaData.schema)) {
                    return;
                }
                
                const nodeSchema = schemaData.schema.find(s => 
                    s.title === node.data?.module_name
                );

                if (nodeSchema && !node.id.startsWith('Reader_')) {
                    try {
                        const validation = validateFormData(
                            formData,
                            nodeSchema,
                            node.id.startsWith('Source_'),
                            node.data?.sourceData,
                            Boolean(formData)
                        );

                        const nodeName = node.data?.title || node.data?.label;
                        const nodeType = node.data?.module_name || 'UNKNOWN';

                        if (!validation.isValid) {
                            const formErrors = validation.warnings.map(warning => ({
                                message: warning,
                                nodeId: node.id,
                                nodeName,
                                type: 'FORM_VALIDATION',
                                severity: 'error' as const,
                                suggestion: "Check the node configuration and fill in required fields"
                            }));
                            allErrors.push(...formErrors);
                        } else if (validation.status === 'warning') {
                            const formWarnings = validation.warnings.map(warning => ({
                                message: warning,
                                nodeId: node.id,
                                nodeName,
                                type: 'FORM_WARNING',
                                severity: 'warning' as const,
                                suggestion: "Review the node configuration for optimal performance"
                            }));
                            allWarnings.push(...formWarnings);
                        }
                    } catch (error) {
                        console.error('Validation error for node:', nodeId, error);
                        allErrors.push({
                            message: 'Validation failed due to an internal error',
                            nodeId: node.id,
                            nodeName: node.data?.title || node.data?.label,
                            type: 'SYSTEM_ERROR',
                            severity: 'error' as const,
                            suggestion: "Try refreshing the page or contact support if the issue persists"
                        });
                    }
                }
            });

            // Update validation state
            const isValid = allErrors.length === 0;
            setIsPipelineValid(isValid);
            setPipelineValidationErrors(allErrors);
            setPipelineValidationWarnings(allWarnings);
        };

        validatePipeline();
    }, [nodes, edges, formStates]);
    const [pipelineJson, setPipelineJson] = useState<any>(null);
    const [headerUpdateTrigger, setHeaderUpdateTrigger] = useState(0);
    // Add this at the component level, outside any callbacks
    const { selectedPipeline } = useAppSelector((state) => state.pipeline);
    const fetchedIdsRef = useRef(new Set<string>());
    const setSaving = useCallback(() => {
        setIsSaving(true);
        setHasUnsavedChanges(true);
    }, []);

    const setSaved = () => {
        setIsSaving(false);
        setHasUnsavedChanges(false);
        setLastSaved(new Date());
        setSaveErrorState(null);
        setHeaderUpdateTrigger(prev => {
            return prev + 1;
        });
    };

    const setUnsavedChanges = useCallback(() => {
        setHasUnsavedChanges(true);
        setIsSaving(false);
        setLastSaved(null);
    }, []);

    const setSaveError = useCallback((error: string) => {
        setIsSaving(false);
        setSaveErrorState(error);
    }, []);

    const handleRunClick = useCallback(async (e: React.MouseEvent) => {

        const pipelineConfig: any = await convertOptimisedPipelineJsonToPipelineJson(nodes, edges, pipelineDtl, pipelineName);
        setSelectedFormState(pipelineConfig);
        return pipelineConfig;
    }, [edges, formStates, reactFlowInstance, nodes, pipelineDtl, pipelineName]);

    // Use the pipeline actions hook
    const { handleRun, handleStop, handleNext, handleRefreshNode, fetchPipelineDetails, handleSourceUpdate } = usePipelineActions({
        nodes,
        edges,
        pipelineDtl,
        pipelineName,
        selectedMode,
        attachedCluster,
        debuggedNodesList,
        setIsCanvasLoading,
        setIsPipelineRunning,
        setConversionLogs,
        setTerminalLogs,
        setTransformationCounts,
        setSaveError,
        handleRunClick,
        setSelectedFormState,
        setRunDialogOpen,
        // For fetchPipelineDetails
        id,
        setNodes,
        setEdges,
        setPipeLineName,
        setPipelineJson,
        setFormStates,
        selectedPipeline,
        // For handleSourceUpdate
        setUnsavedChanges,
        // For showing logs
        setShowLogs,
        // For showing error banner
        setErrorBanner
    });

    // Update the auto-save effect
    useEffect(() => {
        // Skip auto-save if isFlow is true
        if (isFlow) {
            return;
        }

        const intervalId = setInterval(async () => {
            if (hasUnsavedChanges) {
                try {
                    setSaving();

                    // Convert nodes to ensure all data is serializable
                    const serializedNodes = nodes.map(node => ({
                        ...node,
                        data: {
                            ...node.data,
                            debuggedNodes: Array.isArray(node.data?.debuggedNodes)
                                ? node.data.debuggedNodes
                                : node.data?.debuggedNodes instanceof Set
                                    ? Array.from(node.data.debuggedNodes)
                                    : []
                        }
                    }));
                    // Your save logic here
                    const pipeline_json: any = await convertOptimisedPipelineJsonToPipelineJson(serializedNodes, edges, pipelineDtl, pipelineName);

                    pipeline_json.pipeline_json.transformations = pipeline_json.pipeline_json?.transformations?.map(transform => {
                        if (transform.transformation.toLowerCase() === "target") {
                            return {
                                ...transform,
                                transformation: "Writer"
                            };
                        }
                        return transform;
                    });

                    if(id){
                      await apiService.patch({
                        baseUrl: CATALOG_REMOTE_API_URL,
                        url: `/pipeline/${id}`,
                        usePrefix: true,
                        method: 'PATCH',
                        data: pipeline_json
                    });
                }
                    if ('pipeline_json' in pipeline_json) {
                        let optimised = await resolveRefsPipelineJson(pipeline_json.pipeline_json, pipeline_json.pipeline_json)
                        setPipelineJson(optimised);
                    }

                    // Ensure we're updating the save status after successful save
                    // Add a small delay to ensure UI updates properly
                    // setTimeout(() => {
                    setLastSaved(new Date());

                    setSaved();
                    // }, 100);

                } catch (error) {
                    console.error('Error in auto-save:', error);
                    setSaveError(error.message);
                }
            }
        }, autoSaveInterval);

        return () => clearInterval(intervalId);
    }, [nodes, edges, hasUnsavedChanges, autoSaveInterval, setSaving, setSaved, setSaveError, id, pipelineDtl, isFlow]);
    // Update sanitizeNode function
    const sanitizeNode = useCallback((node: any) => {
        if (!node) return node;

        // Convert Set to Array if it exists
        const debuggedNodes = node.data?.debuggedNodes;
        return {
            ...node,
            data: {
                ...node.data,
                debuggedNodes: Array.isArray(debuggedNodes)
                    ? debuggedNodes
                    : debuggedNodes instanceof Set
                        ? Array.from(debuggedNodes)
                        : []
            }
        };
    }, []);

    // Modify setNodes to sanitize nodes
    const setSanitizedNodes = useCallback((nodesOrUpdater: any) => {
        // alert()
        // if (typeof nodesOrUpdater === 'function') {
        //     setNodes((prevNodes) => 
        //         nodesOrUpdater(prevNodes).map(sanitizeNode)
        //     );
        // } else {
        //     setNodes(nodesOrUpdater.map(sanitizeNode));
        // }
    }, [sanitizeNode]);

    // Update handleNodesChange
    const handleNodesChange = useCallback((changes: any) => {
        const sanitizedChanges = changes.map((change: any) => {
            // Ensure debuggedNodes is always a plain array, not a Set
            const sanitizedChange = {
                ...change,
                item: change.item ? sanitizeNode(change.item) : change.item
            };

            // Convert any Set to Array if present
            if (sanitizedChange.debuggedNodes instanceof Set) {
                sanitizedChange.debuggedNodes = Array.from(sanitizedChange.debuggedNodes);
            }

            // Remove debuggedNodes property from the change object
            // It should only exist in the node's data
            if ('debuggedNodes' in sanitizedChange) {
                delete sanitizedChange.debuggedNodes;
            }

            return sanitizedChange;
        });
        setUnsavedChanges();
        onNodesChange(sanitizedChanges);
        // setUnsavedChanges();
    }, [onNodesChange, dispatch, sanitizeNode]);
    const updateSetNode = (newNodes, newEdges) => {
        
        // Force a new array reference to ensure React detects the change
        if (Array.isArray(newNodes)) {
            setNodes([...newNodes]);
        } else {
            console.error("Invalid nodes data:", newNodes);
            return;
        }
        
        // Update edges if they exist
        if (newEdges && Array.isArray(newEdges)) {
            setEdges([...newEdges]);
        }
        
        // Mark as having unsaved changes
        setUnsavedChanges();
        
        // Force a re-render by updating a timestamp
        setHeaderUpdateTrigger(prev => prev + 1);
    }
    const handleNodeUpdate = useCallback((nodeId: string, updatedData: any) => {
        
        // Ensure nodes is an array before mapping
        if (!Array.isArray(nodes) || nodes.length === 0) {
            console.error("Cannot update node: nodes array is empty or invalid");
            return;
        }
        
        // Create updated nodes array
        const updatedNodes = nodes.map(node => {
            if (node.id === nodeId) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        label: updatedData.data.label,
                        source: updatedData.data.source,
                        title: updatedData.data.title
                    }
                };
            }
            return node;
        });
        
        // Use updateSetNode for consistent state management
        updateSetNode(updatedNodes, edges);
    }, [nodes, edges, updateSetNode]);


    const makePipeline = async (result: any, isModify = true) => {
        let optimised;
        optimised = await resolveRefsPipelineJson(result.pipeline_definition, result.pipeline_definition);
        let uiJson = await convertPipelineToUIJson(optimised, handleSourceUpdate);

        // Set the pipeline JSON first
        setPipelineJson(optimised);

        if (!uiJson || !uiJson.nodes) {
            throw new Error('Failed to convert pipeline to UI format');
        }

        const nodesWithTitles = await uiJson.nodes.map(node => {
            const matchingTransformation = result.pipeline_definition.transformations?.find(
                (t: any) => t?.title === node?.data?.title && t?.name
            );

            if (matchingTransformation) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        title: matchingTransformation.name,
                        transformationData: {
                            ...node.data.transformationData,
                            name: matchingTransformation.name
                        }
                    }
                };
            }
            return node;
        });

        if (result.pipeline_definition == null) {
            setPipelineJson(null);
            setNodes([]);
            setEdges([]);
        } else {
            setNodes([]);

            // Set nodes and edges with the new data
            await setNodes(nodesWithTitles);
            await setEdges(uiJson.edges);

            // Center and align the nodes
            await handleCenter();
            await handleAlignHorizontal();
        }

        // Initialize form states for the new nodes
        const initialFormStates = {};
        const getInitialFormState = (transformation: any, nodeId: string) => {
            if (!transformation || !nodeId) {
                return {};
            }
            try {
                return {
                    ...transformation,
                    nodeId
                };
            } catch (error) {
                console.error(`Error creating initial form state for node ${nodeId}:`, error);
                return {};
            }
        };
        
        await result.pipeline_definition.transformations?.forEach((transformation: any) => {
            const matchingNode = nodesWithTitles.find(
                (node: any) =>
                    node?.data?.label === transformation?.transformation &&
                    node?.data?.title === transformation?.name
            );

            if (matchingNode?.id) {
                initialFormStates[matchingNode.id] = getInitialFormState(transformation, matchingNode.id);
            }
        });

        // Set the form states with the new data
        setFormStates(initialFormStates);
    }


 const updateAllNodeDependencies = useCallback(() => {
        
        // Create a map of node IDs to task IDs
        const nodeIdToTaskIdMap = new Map();
        
        // First, populate from formStates
        for (const [nodeId, formState] of Object.entries(formStates)) {
            if (formState && formState.task_id) {
                nodeIdToTaskIdMap.set(nodeId, formState.task_id);
            }
        }
        
        // Then, add from nodes data as fallback
        for (const node of nodes) {
            if (node.id && node.data?.formData?.task_id && !nodeIdToTaskIdMap.has(node.id)) {
                nodeIdToTaskIdMap.set(node.id, node.data.formData.task_id);
            }
        }
        
        // Create a map of node dependencies based on edges
        const nodeDependencies = new Map();
        
        // Process all edges to build dependencies
        for (const edge of edges) {
            if (!nodeDependencies.has(edge.target)) {
                nodeDependencies.set(edge.target, []);
            }
            
            if (nodeIdToTaskIdMap.has(edge.source)) {
                const sourceTaskId = nodeIdToTaskIdMap.get(edge.source);
                nodeDependencies.get(edge.target).push(sourceTaskId);
            }
        }
        
      
        // Update all form states with their dependencies
        setFormStates(prevFormStates => {
            const newFormStates = { ...prevFormStates };
            
            // Update each node's form state with its dependencies
            for (const [nodeId, dependsOnTaskIds] of nodeDependencies.entries()) {
                if (newFormStates[nodeId]) {
                    newFormStates[nodeId] = {
                        ...newFormStates[nodeId],
                        depends_on: dependsOnTaskIds
                    };
                }
            }
            
            // For nodes with no dependencies, ensure depends_on is an empty array
            for (const nodeId of Object.keys(newFormStates)) {
                if (!nodeDependencies.has(nodeId)) {
                    newFormStates[nodeId] = {
                        ...newFormStates[nodeId],
                        depends_on: []
                    };
                }
            }
            
            return newFormStates;
        });
    }, [nodes, edges, formStates, setFormStates]);

    const handleEdgesChange = useCallback((changes: any) => {
        // Check if any edges are being removed
        const hasRemovals = changes.some(change => change.type === 'remove');
        
        // Apply the edge changes
        onEdgesChange(changes);
        setUnsavedChanges();
        
        // If edges were removed, update all node dependencies
        if (hasRemovals) {
            // Use setTimeout to ensure the edge changes are applied first
            setTimeout(() => {
                updateAllNodeDependencies();
            }, 0);
        }
    }, [onEdgesChange, dispatch, updateAllNodeDependencies]);

    const handleFormSubmit = useCallback((data: any) => {
        
        // Get the nodeId from either selectedSchema or data.nodeId
        const nodeId = selectedSchema?.nodeId || data.nodeId;
        
        if (nodeId) {
            // Update form states first
            setFormStates((prev: any) => {
                const newFormStates = {
                    ...prev,
                    [nodeId]: data
                };
                return newFormStates;
            });

            // Get the current nodes
            const currentNodes = [...nodes];
            
            // Find the node to update
            const nodeIndex = currentNodes.findIndex(node => node.id === nodeId);
            
            if (nodeIndex !== -1) {
                // Preserve existing source data if it exists
                const existingSource = currentNodes[nodeIndex].data.source || {};
                
                // Update the node title if name is provided
                const updatedTitle = data.name || currentNodes[nodeIndex].data.title;
                

                // Special handling for Filter nodes
                let transformationData = {
                    ...currentNodes[nodeIndex].data.transformationData,
                    ...data,
                    name: updatedTitle
                };
                
                // Special handling for Filter nodes
                if (currentNodes[nodeIndex].data.label === 'Filter') {
                    // Ensure condition is properly set
                    if (data.condition !== undefined) {
                        transformationData.condition = data.condition;
                    }
                }
                
                // Create a new node object with updated data
                const updatedNode = {
                    ...currentNodes[nodeIndex],
                    data: {
                        ...currentNodes[nodeIndex].data,
                        title: updatedTitle,
                        transformationData: transformationData,
                        // Preserve existing source data
                        source: existingSource
                    }
                };
                
                // Replace the node in the array
                currentNodes[nodeIndex] = updatedNode;
                
                // Update the nodes in the context
                setNodes(currentNodes);
                
                // Force a re-render by updating a timestamp
                setHeaderUpdateTrigger(prev => prev + 1);
                
                // Force a re-render of the ReactFlow component
                setTimeout(() => {
                    window.dispatchEvent(new Event('resize'));
                }, 50);
            }
        } else {
            console.error('No nodeId found in selectedSchema or data');
        }
        
        setIsFormOpen(false);
    }, [selectedSchema, nodes, setNodes, setHeaderUpdateTrigger]);

    const handleDialogClose = useCallback(() => {
        setIsFormOpen(false);
    }, []);

    const handleNodeForm = useCallback((targetNodeId: string) => {
        // Add null check to prevent error when nodes is undefined
        if (!nodes || !Array.isArray(nodes)) {
            console.warn('handleNodeForm: nodes is undefined or not an array:', nodes);
            return;
        }
        
        const targetNode = nodes.find(node => node.id === targetNodeId);
        if (targetNode) {
            const moduleName = targetNode.data.label.split(' ')[0];
            const schemaArray = Array.isArray(schemaData) ? schemaData : Object.values(schemaData);
            const moduleSchema = schemaArray.find((schema: any) => schema.title === moduleName);
            if (moduleSchema) {
                // Find the corresponding form state based on node type and ID
                const existingFormState = formStates[targetNodeId] ||
                    Object.entries(formStates).find(([key]) =>
                        key.toLowerCase().includes(moduleName.toLowerCase()))?.[1];

                setSelectedSchema({
                    ...moduleSchema,
                    nodeId: targetNodeId,
                    initialValues: existingFormState // Pass the existing form state
                });
                setIsFormOpen(true);
            }
        }
    }, [nodes, formStates]);

    const checkConnectionExists = useCallback((connection: Connection): boolean => {
        return edges.some(
            edge => edge.source === connection.source && edge.target === connection.target
        );
    }, [edges]);

    const checkForCircularDependency = (source: string, target: string): boolean => {
        const graph: { [key: string]: string[] } = {};
        edges.forEach(edge => {
            if (!graph[edge.source]) graph[edge.source] = [];
            graph[edge.source].push(edge.target);
        });
        const visited = new Set<string>();
        const stack = [source];
        while (stack.length > 0) {
            const currentNode = stack.pop()!;
            if (currentNode === target) {
                return true;
            }
            visited.add(currentNode);
            if (graph[currentNode]) {
                graph[currentNode].forEach(neighbor => {
                    if (!visited.has(neighbor)) {
                        stack.push(neighbor);
                    }
                });
            }
        }
        return false;
    };

    // Function to update all nodes' dependencies based on current edges
   
    const onConnect = useCallback((connection: Connection) => {
        if (checkConnectionExists(connection)) {
            return;
        }

        // Add null check to prevent error when nodes is undefined
        if (!nodes || !Array.isArray(nodes)) {
            console.warn('onConnect: nodes is undefined or not an array:', nodes);
            return;
        }

        // Get source and target nodes
        const sourceNode = nodes.find(n => n.id === connection.source);
        const targetNode = nodes.find(n => n.id === connection.target);

        if (!sourceNode || !targetNode) return;

        // Add null check for edges array
        if (!edges || !Array.isArray(edges)) {
            console.warn('onConnect: edges is undefined or not an array:', edges);
            return;
        }

        // Check input limits
        const targetInputs = edges.filter(e => e.target === connection.target).length;
        const maxInputs = targetNode.data.ports?.maxInputs;

        if (maxInputs !== "unlimited" && targetInputs >= maxInputs) {
            console.warn("Maximum inputs reached for this node");
            return;
        }

        // Check for circular dependency
        const isCircular = checkForCircularDependency(connection.source!, connection.target!);
        if (isCircular) {
            console.error("Circular dependency detected, connection not added.");
            return;
        }

        // Add the edge
        setEdges((eds: any) => addEdge(connection, eds));
        
        // Update all nodes' dependencies based on the new edge
        setTimeout(() => {
            updateAllNodeDependencies();
        }, 0);
        
        // Open the node form for the target node
        handleNodeForm(connection.target!);
    }, [checkConnectionExists, checkForCircularDependency, handleNodeForm, setEdges, updateAllNodeDependencies]);


    const handleDebugToggle = useCallback((nodeId: string, title: string) => {
        setDebuggedNodes(prev => {
            const isDebugged = prev.includes(nodeId);
            if (isDebugged) {
                // Remove from debugged nodes list
                setDebuggedNodesList(list => list.filter(item => item.id !== nodeId));
                return prev.filter(id => id !== nodeId);
            } else {
                // Add to debugged nodes list
                setDebuggedNodesList(list => [...list, { id: nodeId, title }]);
                return [...prev, nodeId];
            }
        });
    }, []);

    // Attach/Detach cluster functions
    const attachCluster = useCallback((cluster: any) => {
        setAttachedCluster(cluster);
        localStorage.setItem('attachedCluster', JSON.stringify(cluster));
    }, []);

    const detachCluster = useCallback(() => {
        setAttachedCluster(null);
        localStorage.removeItem('attachedCluster');
    }, []);

    // Load attached cluster from localStorage on mount
    useEffect(() => {
        const savedCluster = localStorage.getItem('attachedCluster');
        if (savedCluster) {
            try {
                const cluster = JSON.parse(savedCluster);
                setAttachedCluster(cluster);
            } catch (error) {
                console.error('Error parsing saved cluster:', error);
                localStorage.removeItem('attachedCluster');
            }
        }
    }, []);



    const getTransformationName = (moduleName: string): string => {
        return moduleName.toLowerCase();
    };

    const fetchSourceColumns = useCallback(async (nodes: any) => {
        try {
            // Add null check to prevent error when nodes is undefined
            if (!nodes || !Array.isArray(nodes)) {
                console.warn('fetchSourceColumns: nodes is undefined or not an array:', nodes);
                return;
            }
            
            // Get only source nodes that have a data_src_id and haven't been fetched yet
            const sourceNodes = nodes.filter(node => {
                const isSourceNode = node.data?.label?.toLowerCase().includes("source") || node.data?.source;
                const hasDataSrcId = node.data?.source?.data_src_id;
                const notFetched = hasDataSrcId && !fetchedIdsRef.current.has(node.data.source.data_src_id);
                return isSourceNode && notFetched;
            });

            if (sourceNodes.length === 0) return;

            // Get unique unfetched data source IDs
            const uniqueDataSrcIds = Array.from(
                new Set(
                    sourceNodes
                        .map(node => node.data?.source?.data_src_id)
                        .filter(Boolean)
                )
            );

            if (uniqueDataSrcIds.length === 0) return;

            // Process each unique data source ID
            const results = await Promise.all(
                uniqueDataSrcIds.map(async (dataSrcId: any) => {
                    try {
                        // Mark as fetched before the API call
                        fetchedIdsRef.current.add(dataSrcId);

                        const response:any = await apiService.get({
                            baseUrl: CATALOG_REMOTE_API_URL,
                            url: `/data_source_layout/list_full/?data_src_id=${dataSrcId}`,
                            usePrefix: true,
                            method: 'GET',
                            metadata: {
                                errorMessage: 'Failed to fetch source layout fields'
                            }
                        });

                        return {
                            dataSrcId,
                            columns: response?.layout_fields?.map((field: any) => ({
                                name: field.lyt_fld_name,
                                dataType: field.lyt_fld_data_type_cd
                            })) || []
                        };
                    } catch (error) {
                        console.error(`Error fetching columns for data source ${dataSrcId}:`, error);
                        return { dataSrcId, columns: [] };
                    }
                })
            );

            // Safely update source columns
            setSourceColumns((prevColumns) => {
                const existingColumnNames = new Set(prevColumns.map(col => col.name));
                const newColumns = results
                    .flatMap(result => result.columns)
                    .filter(col => !existingColumnNames.has(col.name));

                return [...prevColumns, ...newColumns];
            });

        } catch (error) {
            console.error('Error in fetchSourceColumns:', error);
        }
    }, []);

    // Update the useEffect to be more precise
    useEffect(() => {
        const unfetchedSourceNodes = nodes.filter(node => {
            const isSourceNode = node.data?.label?.toLowerCase().includes("source") || node.data?.source;
            const hasDataSrcId = node.data?.source?.data_src_id;
            const notFetched = hasDataSrcId && !fetchedIdsRef.current.has(node.data.source.data_src_id);
            return isSourceNode && hasDataSrcId && notFetched;
        });

        if (unfetchedSourceNodes.length > 0) {
            fetchSourceColumns(nodes);
        }
    }, [nodes, fetchSourceColumns]);

    const handleSearch = useCallback((term: string) => {
        setSearchTerm(term);
        if (!term.trim()) {
            setSearchResults([]);
            setHighlightedNodeId(null);
            return;
        }

        const results = nodes.filter(node =>
            node.data.label?.toLowerCase().includes(term.toLowerCase()) ||
            node.data.title?.toLowerCase().includes(term.toLowerCase())
        ).map(node => ({
            id: node.id,
            label: node.data.label,
            title: node.data.title || node.data.label
        }));

        setSearchResults(results);
    }, [nodes]);

    const handleSearchResultClick = useCallback((nodeId: string) => {
        setHighlightedNodeId(nodeId);

        // Find the node and center the view on it
        const node = nodes.find(n => n.id === nodeId);
        if (node) {
            reactFlowInstance.setCenter(
                node.position.x + 100,
                node.position.y + 100,
                { duration: 800 }
            );
        }
    }, [nodes, reactFlowInstance]);

    const handleLeavePage = useCallback(async () => {
        try {
            setSaving();
            const pipeline_json = await convertOptimisedPipelineJsonToPipelineJson(nodes, edges, pipelineDtl, pipelineName);
            if (id) {
                await dispatch(updatePipeline({ id: id, data: pipeline_json }));

                setSaved();
                setUnsavedChanges();
                setShowLeavePrompt(false);

                navigate("/designers/build-datapipeline/", { replace: true });
            } else {
                console.error("Pipeline ID is not defined.");
            }
        } catch (error) {
            console.error('Error saving pipeline state:', error);
            setSaveError(error.message);
            setShowLeavePrompt(false);
            navigate("/designers/build-datapipeline/", { replace: true });
        }
    }, [nodes, edges, id, dispatch, navigate]);

    const addNodeToHistory = useCallback(() => {
        setHistory((prev) => [...prev, { nodes, edges }]);
        setRedoStack([]); // Clear redo stack on new action
    }, [nodes, edges]);

    const handleLogsClick = useCallback(() => {
        setShowLogs(prev => !prev);  // Toggle logs visibility
    }, []);




    const updatedSelectedNodeId = useCallback(
        (nodeId: string, selectedType: string) => {
            setNodes((prevNodes) => {
                // Add null check to prevent error when prevNodes is undefined
                if (!prevNodes || !Array.isArray(prevNodes)) {
                    console.warn('updatedSelectedNodeId: prevNodes is undefined or not an array:', prevNodes);
                    return prevNodes || [];
                }
                
                return prevNodes.map((node) => {
                    const selectionId = node.id === nodeId;
                    return selectionId
                        ? {
                            ...node,
                            data: {
                                ...node.data,
                                type: selectedType,
                                selectedData: selectedType,
                            },
                        }
                        : node;
                });
            });
        },
        []
    );

    // Use the pipeline operations hook
    const { handleAlignHorizontal,handleAlignVertical,handleAlignTopLeft,handleKeyDown,
        handleCut,handleRedo,handleUndo,handlePaste,handleCopy,handleCenter,handleZoomIn,handleZoomOut
    } = usePipelineOperations({nodes,edges,setNodes,setEdges,updateSetNode,setFormStates,formStates,
        copiedNodes,copiedEdges,copiedFormStates,setCopiedNodes,setCopiedEdges,setCopiedFormStates,history,
        setHistory,redoStack,setRedoStack,setUnsavedChanges,addNodeToHistory,handleRun,handleStop,handleNext,
        handleLogsClick,handleDebugToggle,reactFlowInstance,setSanitizedNodes,dispatch
    });

    const handleNodeClick = useCallback((node: Node, source: any) => {

        if (!node?.ui_properties?.module_name) {
            console.error('Invalid node data');
            return;
        }
        const baseModuleName = node.ui_properties.module_name;
        const existingNodes = nodes.filter(n =>
            n.data.label.toLowerCase().startsWith(baseModuleName.toLowerCase())
        );
        const nodeNumber = existingNodes.length + 1;
        const nodeLabel = existingNodes.length > 0
            ? `${baseModuleName} ${nodeNumber}`
            : baseModuleName;
        // Find the last selected node's position
        const lastNode = nodes[nodes.length-1 ];
        const basePosition = lastNode ? {
            x: lastNode.position.x + 150,
            y: lastNode.position.y
        } : {
            x: 50+random(),
            y: 100
        };

        const uniqueId = `${node.ui_properties.module_name}_${Date.now()}`;
        // debugger
        // Create a more detailed node data structure
        const newNode = {
            id: uniqueId,
            type: 'custom',
            position: basePosition,
            data: {
                label: baseModuleName, // Use the numbered label here
                icon: node.ui_properties.icon,
                ports: node.ui_properties.ports,
                id: node.ui_properties.id,
                meta: node.ui_properties.meta,
                selectedData: node.ui_properties.type,
                requiredFields: node.ui_properties.operators?.map?.((op: any) => {
                    return ({ [op.type]: op.requiredFields })
                }) || [],
                source: source,
                title: source?.data_src_name || nodeLabel, // Also set the title with the numbered label
                // Initialize an empty transformationData object to store form data
                transformationData: {
                    name: source?.data_src_name || nodeLabel,
                    nodeId: uniqueId
                },
                onUpdate: (updatedData: any) => handleNodeUpdate(uniqueId, updatedData)
            }
        };
        setNodes((prevNodes) => [...prevNodes, newNode]);
        setUnsavedChanges();

        setTimeout(() => {
            handleAlignHorizontal()
            reactFlowInstance.fitView({ padding: 0.2, duration: 400 });
        }, 50);
    }, [nodes, setNodes, reactFlowInstance, dispatch, handleNodeUpdate, handleAlignHorizontal]);

    const value = useMemo(() => ({
        nodes,
        setNodes: setSanitizedNodes,
        onNodesChange: handleNodesChange,
        edges,
        setEdges,
        onEdgesChange: handleEdgesChange,
        reactFlowInstance,
        nodeCounters,
        setNodeCounters,
        debuggedNodes,
        setDebuggedNodes,
        debuggedNodesList,
        setDebuggedNodesList,
        isPipelineRunning,
        setIsPipelineRunning,
        transformationCounts,
        setTransformationCounts,
        pipelineDtl,
        formStates,
        setFormStates,
        fetchPipelineDetails,
        sourceColumns,
        setSourceColumns,
        setPipeline_id,
        searchTerm,
        setSearchTerm,
        searchResults,
        setSearchResults,
        highlightedNodeId,
        setHighlightedNodeId,
        copiedNodes,
        setCopiedNodes,
        copiedEdges,
        setCopiedEdges,
        copiedFormStates,
        setCopiedFormStates,
        validationErrors,
        setValidationErrors,
        conversionLogs,
        setConversionLogs,
        terminalLogs,
        setTerminalLogs,
        showLogs,
        setShowLogs,
        errorBanner,
        setErrorBanner,
        handleSearch,
        handleSearchResultClick,
        handleNodeUpdate,
        handleSourceUpdate,
        handleNodesChange,
        handleEdgesChange,
        handleFormSubmit,
        handleDialogClose,
        handleRunClick,
        handleNodeForm,
        onConnect,
        handleDebugToggle,
        handleRun,
        handleStop,
        handleNext,
        fetchSourceColumns,
        handleLeavePage,
        getTransformationName,
        addNodeToHistory,
        handleCopy,
        handlePaste,
        handleCut,
        handleUndo,
        handleRedo,
        handleLogsClick,
        selectedSchema,
        setSelectedSchema,
        isFormOpen,
        setIsFormOpen,
        handleNodeClick,
        isCanvasLoading,
        setIsCanvasLoading,
        handleAlignHorizontal,
        handleAlignVertical,
        handleAlignTopLeft,
        runDialogOpen,
        setRunDialogOpen,
        selectedFormState,
        setSelectedFormState,
        showLeavePrompt,
        setShowLeavePrompt,
        handleKeyDown,
        handleZoomIn,
        handleZoomOut,
        handleCenter,
        makePipeline,
        ctrlDTimeout,
        isSaving,
        hasUnsavedChanges,
        lastSaved,
        saveError,
        setSaving,
        setSaved,
        setLastSaved,
        setUnsavedChanges,
        setSaveError,
        setPipeLineName,
        setPipelineJson,
        pipelineName,
        pipelineJson,
        setProjectName,
        projectName,
        isNodeFormOpen,
        setIsNodeFormOpen,
        selectedNodeId,
        setSelectedNodeId,
        updatedSelectedNodeId,
        updateSetNode,
        updateAllNodeDependencies,
        isPipelineValid,
        pipelineValidationErrors,
        pipelineValidationWarnings,
        selectedMode,
        handleRefreshNode,
        attachedCluster,
        setAttachedCluster,
        attachCluster,
        detachCluster,
        pipelines,
        setPipelines
    }), [
        nodes,
        setSanitizedNodes,
        handleNodesChange,
        edges,
        setEdges,
        handleEdgesChange,
        reactFlowInstance,
        nodeCounters,
        setNodeCounters,
        debuggedNodes,
        setDebuggedNodes,
        debuggedNodesList,
        setDebuggedNodesList,
        isPipelineRunning,
        setIsPipelineRunning,
        transformationCounts,
        setTransformationCounts,
        pipelineDtl,
        formStates,
        setFormStates,
        fetchPipelineDetails,
        sourceColumns,
        setSourceColumns,
        setPipeline_id,
        searchTerm,
        setSearchTerm,
        searchResults,
        setSearchResults,
        highlightedNodeId,
        setHighlightedNodeId,
        copiedNodes,
        setCopiedNodes,
        copiedEdges,
        setCopiedEdges,
        copiedFormStates,
        setCopiedFormStates,
        validationErrors,
        setValidationErrors,
        conversionLogs,
        setConversionLogs,
        terminalLogs,
        setTerminalLogs,
        showLogs,
        setShowLogs,
        handleSearch,
        handleSearchResultClick,
        handleNodeUpdate,
        handleSourceUpdate,
        handleNodesChange,
        handleEdgesChange,
        handleFormSubmit,
        handleDialogClose,
        handleRunClick,
        handleNodeForm,
        onConnect,
        handleDebugToggle,
        handleRun,
        handleStop,
        handleNext,
        fetchSourceColumns,
        handleLeavePage,
        getTransformationName,
        addNodeToHistory,
        handleCopy,
        handlePaste,
        handleCut,
        handleUndo,
        handleRedo,
        handleLogsClick,
        selectedSchema,
        setSelectedSchema,
        isFormOpen,
        setIsFormOpen,
        handleNodeClick,
        isCanvasLoading,
        handleAlignHorizontal,
        handleAlignVertical,
        handleAlignTopLeft,
        runDialogOpen,
        selectedFormState,
        showLeavePrompt,
        handleKeyDown,
        handleZoomIn,
        handleZoomOut,
        handleCenter,
        makePipeline,
        ctrlDTimeout,
        isSaving,
        hasUnsavedChanges,
        lastSaved,
        saveError,
        setSaving,
        setSaved,
        setLastSaved,
        setUnsavedChanges,
        setSaveError,
        setPipeLineName,
        setPipelineJson,
        pipelineName,
        pipelineJson,
        setProjectName,
        projectName,
        isNodeFormOpen,
        setIsNodeFormOpen,
        selectedNodeId,
        setSelectedNodeId,
        updatedSelectedNodeId,
        updateSetNode,
        updateAllNodeDependencies,
        isPipelineValid,
        pipelineValidationErrors,
        pipelineValidationWarnings,
        selectedMode,
        handleRefreshNode,
        attachedCluster,
        setAttachedCluster,
        attachCluster,
        detachCluster,
        // Functions from usePipelineOperations hook
        handleAlignHorizontal,
        handleAlignVertical,
        handleAlignTopLeft,
        handleKeyDown,
        handleCut,
        handleRedo,
        handleUndo,
        handlePaste,
        handleCopy,
        handleCenter,
        handleZoomIn,
        handleZoomOut,
        pipelines,
        setPipelines
    ]);

    return (
        <PipelineContext.Provider value={value}>
            {children}
        </PipelineContext.Provider>
    );
};

export const usePipelineContext = () => {
    const context = useContext(PipelineContext);
    if (context === undefined) {
        throw new Error('usePipelineContext must be used within a PipelineProvider');
    }
    return context;
};
