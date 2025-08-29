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
import { CATALOG_REMOTE_API_URL } from '@/config/platformenv';
import {
    useNodesState,
    useEdgesState,
    useReactFlow,
    Connection,
    addEdge
} from '@xyflow/react';
import { useDispatch, useSelector } from 'react-redux';

import { useParams, useNavigate, useLocation } from 'react-router-dom';
import schemaData from '@/pages/designers/data-pipeline/data/mdata.json';
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
import { useFlowAlignment } from '@/hooks/useFlowAlignment';
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
    fetchSourceColumns: () => void;
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
    initialDataMap: { [key: string]: any };
    setInitialDataMap: React.Dispatch<React.SetStateAction<{ [key: string]: any }>>;
    getInitialDataForNode: (nodeId: string, source: any) => any;
    createInitialDataForNode: (nodeId: string, source: any) => any;
    triggerManualSave: () => Promise<void>;
}

const PipelineContext = createContext<bnPipelineContextProps | undefined>(undefined);

export const PipelineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation()
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    // Only enable autosave when on pipeline canvas routes
    const isOnPipelineCanvas = useMemo(() => {
        const path = location.pathname || ''; 
        return path.startsWith('/designers/build-playground') || path.startsWith('/designers/data-flow-playground');
    }, [location.pathname]);
    const [nodeCounters, setNodeCounters] = useState<{ [key: string]: number }>({});
    const reactFlowInstance = useReactFlow();
    const [debuggedNodes, setDebuggedNodes] = useState<string[]>([]);
    const [debuggedNodesList, setDebuggedNodesList] = useState<Array<{ id: string; title: string }>>([]);
    const [isPipelineRunning, setIsPipelineRunning] = useState(false);
    const [transformationCounts, setTransformationCounts] = useState<Array<{ transformationName: string; rowCount: string }>>([]);
    // Prefer URL param id on initial load; fall back to localStorage
    const { id: routeId } = useParams<{ id?: string }>();
    const id = routeId || localStorage.getItem("pipeline_id");
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
    const [pipelines, setPipelines] = useState<Pipeline[]>([]);
    const [initialDataMap, setInitialDataMap] = useState<{ [key: string]: any }>({});

    // Single autosave timer ref to ensure only one interval at a time
    const autoSaveTimerRef = useRef<number | null>(null);

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
    const isHydratingRef = useRef(false);
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
        console.log('🔧 AutoSave - Setting unsaved changes flag');
        setHasUnsavedChanges(true);
        setIsSaving(false);
        setLastSaved(null);
    }, []);

    const setSaveError = useCallback((error: string) => {
        setIsSaving(false);
        setSaveErrorState(error);
    }, []);

    // Manual trigger for testing autosave
    const triggerManualSave = useCallback(async () => {
        console.log('🔧 AutoSave - Manual save triggered');
        if (!hasUnsavedChanges) {
            setUnsavedChanges(); // Force unsaved changes to trigger save
        }
    }, [hasUnsavedChanges, setUnsavedChanges]);

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
        // Enable auto-save only on canvas routes and when not in flow mode
        if (!isOnPipelineCanvas || isFlow) {
            // Ensure no timer is running when not on canvas
            if (autoSaveTimerRef.current) {
                window.clearInterval(autoSaveTimerRef.current);
                autoSaveTimerRef.current = null;
            }
            return;
        }

        // Avoid creating multiple intervals
        if (autoSaveTimerRef.current) {
            window.clearInterval(autoSaveTimerRef.current);
            autoSaveTimerRef.current = null;
        }

        const intervalId = window.setInterval(async () => {
            // Only log and act when on canvas to avoid noise while chatting
            if (!isOnPipelineCanvas) return;

            if (hasUnsavedChanges) {
                console.log('🔧 AutoSave - Starting save process...', selectedPipeline);
                
                const pipelineId = id || pipeline_id || pipelineDtl?.pipeline_id || selectedPipeline.pipeline_id || localStorage.getItem("pipeline_id");
                if (!pipelineId) {
                    console.warn('🔧 AutoSave - No pipeline ID available, cannot save');
                    setSaveError('No pipeline ID available for saving');
                    return;
                }
                
                try {
                    setSaving();

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

                    const pipeline_json: any = await convertOptimisedPipelineJsonToPipelineJson(serializedNodes, edges, pipelineDtl, pipelineName);

                    if (pipeline_json?.pipeline_json?.transformations) {
                        pipeline_json.pipeline_json.transformations = pipeline_json.pipeline_json.transformations.map(transform => {
                            if (transform.transformation.toLowerCase() === "target") {
                                return { ...transform, transformation: "Writer" };
                            }
                            return transform;
                        });
                    }

                    const pipelineIdFinal = id || pipeline_id || pipelineDtl?.pipeline_id || selectedPipeline.pipeline_id || localStorage.getItem("pipeline_id");
                    if (pipelineIdFinal) {
                        await apiService.patch({
                            baseUrl: CATALOG_REMOTE_API_URL,
                            url: `/pipeline/${pipelineIdFinal}`,
                            usePrefix: true,
                            method: 'PATCH',
                            data: pipeline_json
                        });
                    } else {
                        setSaveError('No pipeline ID available for saving');
                        return;
                    }

                    if ('pipeline_json' in pipeline_json) {
                        let optimised = await resolveRefsPipelineJson(pipeline_json.pipeline_json, pipeline_json.pipeline_json)
                        setPipelineJson(optimised);
                    }

                    setLastSaved(new Date());
                    setSaved();
                } catch (error) {
                    console.error('🔧 AutoSave - Error in auto-save:', error);
                    setSaveError(error.message || 'Unknown error occurred during save');
                }
            }
        }, autoSaveInterval);

        autoSaveTimerRef.current = intervalId;
        return () => {
            if (autoSaveTimerRef.current) {
                window.clearInterval(autoSaveTimerRef.current);
                autoSaveTimerRef.current = null;
            } else {
                window.clearInterval(intervalId);
            }
        };
    }, [nodes, edges, hasUnsavedChanges, autoSaveInterval, setSaving, setSaved, setSaveError, id, pipelineDtl, isFlow, formStates, isOnPipelineCanvas]);
    
    // Track formStates changes to trigger autosave
    useEffect(() => {
        // Skip if this is the initial load or if it's a flow
        if (isFlow || Object.keys(formStates).length === 0) {
            return;
        }
        
        console.log('🔧 AutoSave - FormStates changed, marking as unsaved:', {
            formStatesKeys: Object.keys(formStates),
            formStatesCount: Object.keys(formStates).length
        });
        
        // Mark as unsaved when formStates change (except during initial load)
        const timer = setTimeout(() => {
            setUnsavedChanges();
        }, 100); // Small delay to avoid triggering on initial load
        
        return () => clearTimeout(timer);
    }, [formStates, isFlow, setUnsavedChanges]);
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

    // Flow alignment helpers based on current nodes/edges
    const { alignHorizontal: alignHorizontalFlow, alignTopLeftHierarchical } = useFlowAlignment({
        nodes,
        edges,
        updateNodes: updateSetNode,
        reactFlowInstance,
    });

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
        // Set a global hydration flag to guard source updates during initial apply
        (window as any).__bh_isHydratingPipeline = true;
        isHydratingRef.current = true;
        try {
            const optimised = await resolveRefsPipelineJson(result.pipeline_definition, result.pipeline_definition);
            const uiJson = await convertPipelineToUIJson(optimised, handleSourceUpdate);
            // Set the pipeline JSON first
            setPipelineJson(optimised);

            if (!uiJson || !uiJson.nodes) {
                throw new Error('Failed to convert pipeline to UI format');
            }

            const nodesWithTitles = uiJson.nodes.map(node => {
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
                console.log(nodesWithTitles)
                // Apply nodes and edges atomically without intermediate clears
                setNodes(nodesWithTitles);
                setEdges(uiJson.edges);
updateSetNode(nodesWithTitles, uiJson.edges);
                // Defer layout until after nodes/edges are committed
                // setTimeout(async () => {
                //     try {
                //         await handleCenter();
                //         await alignTopLeftHierarchical({ 
                //             startX: 0, 
                //             startY: 0, 
                //             direction: 'RIGHT',
                //             nodeNodeSpacing: 120,
                //             layerSpacing: 200,
                //             fitView: true 
                //         });
                //     } finally {
                //         // Release hydration guard after layout
                //         (window as any).__bh_isHydratingPipeline = false;
                //         isHydratingRef.current = false;
                //     }
                // }, 0);
            }

            // Initialize form states for the new nodes
            const initialFormStates = {};
            const getInitialFormState = (transformation: any, nodeId: string, matchingNode?: any) => {
            if (!transformation || !nodeId) {
                return {};
            }
            try {
                // Handle Target/Writer transformations specially
                if (transformation.transformation === 'Writer' || transformation.transformation === 'Target') {
                    // Resolve target reference if it exists
                    let resolvedTarget = transformation.target;
                    if (resolvedTarget && resolvedTarget.$ref && result.pipeline_definition) {
                        // Resolve the reference manually
                        const refPath = resolvedTarget.$ref.substring(2); // Remove '#/'
                        const pathParts = refPath.split('/');
                        let resolved = result.pipeline_definition;
                        
                        for (const part of pathParts) {
                            if (resolved && resolved[part]) {
                                resolved = resolved[part];
                            } else {
                                resolved = null;
                                break;
                            }
                        }
                        
                        if (resolved) {
                            resolvedTarget = resolved;
                        }
                    }
                    
                    // Also resolve connection reference if it exists
                    let resolvedConnection = resolvedTarget?.connection;
                    if (resolvedConnection && resolvedConnection.$ref && result.pipeline_definition) {
                        const refPath = resolvedConnection.$ref.substring(2);
                        const pathParts = refPath.split('/');
                        let resolved = result.pipeline_definition;
                        
                        for (const part of pathParts) {
                            if (resolved && resolved[part]) {
                                resolved = resolved[part];
                            } else {
                                resolved = null;
                                break;
                            }
                        }
                        if (resolved) {
                            resolvedConnection = {
                                ...resolved,
                                // Ensure connection_config_id is available for form validation
                                connection_config_id: resolved.connection_config_id || 
                                                    resolved.id || 
                                                    resolved.name ||
                                                    // Extract from $ref path if needed
                                                    pathParts[pathParts.length - 1]
                            };
                        }
                    }
                    
                    return {
                        ...transformation,
                        nodeId,
                        target: {
                            ...resolvedTarget,
                            connection: resolvedConnection
                        }
                    };
                }
                
                // Handle Reader transformations with reference resolution
                if (transformation?.transformation === 'Reader') {
                    // Resolve source reference if it exists
                    let resolvedSource = transformation.source;
                    if (resolvedSource && resolvedSource.$ref && result.pipeline_definition) {
                        // Resolve the reference manually
                        const refPath = resolvedSource.$ref.substring(2); // Remove '#/'
                        const pathParts = refPath.split('/');
                        let resolved = result.pipeline_definition;
                        
                        for (const part of pathParts) {
                            if (resolved && resolved[part]) {
                                resolved = resolved[part];
                            } else {
                                resolved = null;
                                break;
                            }
                        }
                        
                        if (resolved) {
                            resolvedSource = resolved;
                        }
                    }
                    
                    // Also resolve connection reference if it exists
                    let resolvedConnection = resolvedSource?.connection;
                    if (resolvedConnection && resolvedConnection.$ref && result.pipeline_definition) {
                        const refPath = resolvedConnection.$ref.substring(2);
                        const pathParts = refPath.split('/');
                        let resolved = result.pipeline_definition;
                        
                        for (const part of pathParts) {
                            if (resolved && resolved[part]) {
                                resolved = resolved[part];
                            } else {
                                resolved = null;
                                break;
                            }
                        }
                        
                        if (resolved) {
                            resolvedConnection = {
                                ...resolved,
                                // Ensure connection_config_id is available for form validation
                                connection_config_id: resolved.connection_config_id || 
                                                    resolved.id || 
                                                    resolved.name ||
                                                    // Extract from $ref path if needed
                                                    pathParts[pathParts.length - 1]
                            };
                        }
                    }
                    
                    // Structure the data properly for the ReaderOptionsForm
                    const readerFormData = {
                        ...transformation,
                        nodeId,
                        // Nest source data under 'source' key as expected by the form schema
                        source: {
                            ...resolvedSource,
                            connection: resolvedConnection,
                            // Ensure source_type is properly set based on the source data
                            source_type: resolvedSource?.source_type || 
                                        (resolvedSource?.table_name ? 'Relational' : 
                                         resolvedSource?.file_name ? 'File' : 'Relational'),
                            // Add file_type if it's a file source
                            file_type: resolvedSource?.file_name ? 
                                      (resolvedSource.file_name.toLowerCase().endsWith('.csv') ? 'CSV' :
                                       resolvedSource.file_name.toLowerCase().endsWith('.json') ? 'JSON' :
                                       resolvedSource.file_name.toLowerCase().endsWith('.parquet') ? 'Parquet' : 'CSV') : undefined
                        },
                        // Ensure read_options is properly structured
                        read_options: transformation.read_options || {},
                        // Ensure column arrays are properly initialized
                        select_columns: transformation.select_columns || [],
                        drop_columns: transformation.drop_columns || [],
                        rename_columns: transformation.rename_columns || {}
                    };
                    
                    console.log(`🔧 DataPipelineContext: Structured Reader form data for ${nodeId}:`, readerFormData);
                    return readerFormData;
                }
                
                // Use the normalized transformation data from the matching node
                const nodeTransformationData = matchingNode?.data?.transformationData;
                if (nodeTransformationData) {
                    console.log(`🔧 Using normalized data for ${transformation.transformation} (${nodeId}):`, nodeTransformationData);
                    return {
                        ...nodeTransformationData,
                        nodeId
                    };
                }
                
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
                (node: any) => {
                    // Handle Target/Writer transformation matching
                    const isTargetMatch = (transformation?.transformation === 'Writer' || transformation?.transformation === 'Target') && 
                                         node?.data?.label === 'Target';
                    
                    // Handle regular transformation matching
                    const isRegularMatch = node?.data?.label === transformation?.transformation;
                    
                    // Match by name as well
                    const isNameMatch = node?.data?.title === transformation?.name;
                    
                    return (isTargetMatch || isRegularMatch) && isNameMatch;
                }
            );

            if (matchingNode?.id) {
                initialFormStates[matchingNode.id] = getInitialFormState(transformation, matchingNode.id, matchingNode);
            }
        });

        // Set the form states with the new data
        setFormStates(initialFormStates);
    } finally {
        // Ensure hydration flag is cleared even if errors occur
        if ((window as any).__bh_isHydratingPipeline) {
            (window as any).__bh_isHydratingPipeline = false;
        }
        if (isHydratingRef.current) {
            isHydratingRef.current = false;
        }
    }
    };


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

    // Function to update pipeline JSON after form submission
    const updatePipelineJsonAfterFormSubmit = useCallback(async (updatedNodes: any[], currentEdges: any[]) => {
        try {
            console.log('🔧 DataPipelineContext - Updating pipeline JSON after form submission');
            console.log('🔧 DataPipelineContext - Updated nodes for conversion:', updatedNodes.map(n => ({
                id: n.id,
                label: n.data.label,
                title: n.data.title,
                hasSource: !!n.data.source,
                hasTransformationData: !!n.data.transformationData
            })));
            
            // Convert UI nodes to pipeline JSON format
            const updatedPipelineJson = await convertOptimisedPipelineJsonToPipelineJson(
                updatedNodes, 
                currentEdges, 
                pipelineDtl, 
                pipelineName
            );
            
            // Update the pipeline JSON state
            setPipelineJson(updatedPipelineJson);
            
            console.log('🔧 DataPipelineContext - Pipeline JSON updated successfully');
            console.log('🔧 DataPipelineContext - Pipeline JSON transformations:', updatedPipelineJson?.pipeline_json?.transformations?.map(t => ({
                name: t.name,
                transformation: t.transformation,
                hasTarget: !!t.target,
                hasWriteOptions: !!t.write_options
            })));
        } catch (error) {
            console.error('🔧 DataPipelineContext - Error updating pipeline JSON:', error);
        }
    }, [pipelineDtl, pipelineName, setPipelineJson]);

    const handleFormSubmit = useCallback((data: any) => {
        console.log('🔧 DataPipelineContext - handleFormSubmit called with data:', data);
        console.log('🔧 DataPipelineContext - selectedSchema:', selectedSchema);
        
        // Get the nodeId from data.nodeId first (more reliable), then fall back to selectedSchema
        const nodeId = data.nodeId || selectedSchema?.nodeId;
        console.log('🔧 DataPipelineContext - Using nodeId:', nodeId);
        
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
            console.log('🔧 DataPipelineContext - Found node at index:', nodeIndex, 'for nodeId:', nodeId);
            
            if (nodeIndex !== -1) {
                const currentNode = currentNodes[nodeIndex];
                console.log('🔧 DataPipelineContext - Updating node:', currentNode.data.title || currentNode.data.label, 'with nodeId:', nodeId);
                // Special handling for different node types
                let updatedTitle;
                let transformationData = {
                    ...currentNodes[nodeIndex].data.transformationData,
                    ...data
                };
                
                let sourceData = currentNodes[nodeIndex].data.source || {};
                
                // Special handling for Target nodes
                if (currentNodes[nodeIndex].data.label === 'Target') {
                    console.log('🔧 DataPipelineContext - Handling Target node data:', data);
                    console.log('🔧 DataPipelineContext - Current node before update:', {
                        title: currentNodes[nodeIndex].data.title,
                        source: currentNodes[nodeIndex].data.source,
                        transformationData: currentNodes[nodeIndex].data.transformationData
                    });
                    
                    // For Target nodes, use target_name as the title
                    updatedTitle = data.target?.target_name || 
                                  data.source?.target_name || 
                                  data.name || 
                                  currentNodes[nodeIndex].data.title;
                    
                    // For target nodes, the main configuration should be in source
                    if (data.source) {
                        sourceData = {
                            ...data.source,
                            name: updatedTitle
                        };
                        console.log('🔧 DataPipelineContext - Updated sourceData:', sourceData);
                    }
                    // Keep transformation data for write options
                    if (data.transformationData) {
                        transformationData = {
                            ...transformationData,
                            ...data.transformationData
                        };
                        console.log('🔧 DataPipelineContext - Updated transformationData:', transformationData);
                    }
                    
                    // Update transformation data name to match the title
                    transformationData.name = updatedTitle;
                    
                    console.log('🔧 DataPipelineContext - Final Target node update:', {
                        updatedTitle,
                        sourceData,
                        transformationData
                    });
                } else if (currentNodes[nodeIndex].data.label === 'Filter') {
                    // For Filter nodes, use name as title
                    updatedTitle = data.name || currentNodes[nodeIndex].data.title;
                    
                    // Special handling for Filter nodes
                    if (data.condition !== undefined) {
                        transformationData.condition = data.condition;
                    }
                    transformationData.name = updatedTitle;
                } else {
                    // For other nodes, use name as title
                    updatedTitle = data.name || currentNodes[nodeIndex].data.title;
                    transformationData.name = updatedTitle;
                    
                    // For other nodes, preserve existing source data
                    sourceData = currentNodes[nodeIndex].data.source || {};
                }
                
                // Create a new node object with updated data
                const updatedNode = {
                    ...currentNodes[nodeIndex],
                    data: {
                        ...currentNodes[nodeIndex].data,
                        title: updatedTitle,
                        transformationData: transformationData,
                        source: sourceData
                    }
                };
                
                // Replace the node in the array
                currentNodes[nodeIndex] = updatedNode;
                
                // Update the nodes in the context
                setNodes(currentNodes);
                
                // Update pipeline JSON to reflect the changes
                updatePipelineJsonAfterFormSubmit(currentNodes, edges);
                
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
    }, [selectedSchema, nodes, edges, setNodes, setHeaderUpdateTrigger, updatePipelineJsonAfterFormSubmit]);

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
            console.log('🔧 DataPipelineContext: handleNodeForm called:', {
                targetNodeId,
                targetNode,
                moduleName,
                formStatesKeys: Object.keys(formStates),
                formStatesForThisNode: formStates[targetNodeId]
            });
            
            // Handle Target nodes specially since they don't have a schema in mdata.json
            if (moduleName === 'Target') {
                // Find the corresponding form state based on node ID
                const existingFormState = formStates[targetNodeId];
                
                setSelectedSchema({
                    title: 'Target',
                    nodeId: targetNodeId,
                    initialValues: existingFormState // Pass the existing form state
                });
                setIsFormOpen(true);
                return;
            }
            
            const schemaArray = Array.isArray(schemaData) ? schemaData : Object.values(schemaData);
            const moduleSchema = schemaArray.find((schema: any) => schema.title === moduleName);
            if (moduleSchema) {
                // Find the corresponding form state based on node type and ID
                const existingFormState = formStates[targetNodeId] ||
                    Object.entries(formStates).find(([key]) =>
                        key.toLowerCase().includes(moduleName.toLowerCase()))?.[1];

                console.log(`🔧 DataPipelineContext: Opening form for ${moduleName} (${targetNodeId}):`, {
                    targetNodeId,
                    moduleName,
                    existingFormState,
                    allFormStates: formStates,
                    formStateKeys: Object.keys(formStates)
                });

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
        
        // Note: Removed automatic form opening - forms should only open when user clicks on nodes
    }, [checkConnectionExists, checkForCircularDependency, setEdges, updateAllNodeDependencies]);


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

    // Clear error states and logs when pipeline changes
    useEffect(() => {
        setErrorBanner(null);
        setValidationErrors([]);
        setConversionLogs([]);
        setTerminalLogs([]);
        setShowLogs(false);
    }, [id, pipeline_id]);

    const getTransformationName = (moduleName: string): string => {
        return moduleName.toLowerCase();
    };

    // const fetchSourceColumns = useCallback(async (nodes: any) => {
    //     try {
    //         // Add null check to prevent error when nodes is undefined
    //         if (!nodes || !Array.isArray(nodes)) {
    //             console.warn('fetchSourceColumns: nodes is undefined or not an array:', nodes);
    //             return;
    //         }
            
    //         // Get only source nodes that have a data_src_id and haven't been fetched yet
    //         const sourceNodes = nodes.filter(node => {
    //             const isSourceNode = node.data?.label?.toLowerCase().includes("source") || node.data?.source;
    //             const hasDataSrcId = node.data?.source?.data_src_id;
    //             const notFetched = hasDataSrcId && !fetchedIdsRef.current.has(node.data.source.data_src_id);
    //             return isSourceNode && notFetched;
    //         });

    //         if (sourceNodes.length === 0) return;

    //         // Get unique unfetched data source IDs
    //         const uniqueDataSrcIds = Array.from(
    //             new Set(
    //                 sourceNodes
    //                     .map(node => node.data?.source?.data_src_id)
    //                     .filter(Boolean)
    //             )
    //         );

    //         if (uniqueDataSrcIds.length === 0) return;

    //         // Process each unique data source ID
    //         const results = await Promise.all(
    //             uniqueDataSrcIds.map(async (dataSrcId: any) => {
    //                 try {
    //                     // Mark as fetched before the API call
    //                     fetchedIdsRef.current.add(dataSrcId);

    //                     const response:any = await apiService.get({
    //                         baseUrl: CATALOG_REMOTE_API_URL,
    //                         url: `/data_source_layout/list_full/?data_src_id=${dataSrcId}`,
    //                         usePrefix: true,
    //                         method: 'GET',
    //                         metadata: {
    //                             errorMessage: 'Failed to fetch source layout fields'
    //                         }
    //                     });

    //                     return {
    //                         dataSrcId,
    //                         columns: response?.layout_fields?.map((field: any) => ({
    //                             name: field.lyt_fld_name,
    //                             dataType: field.lyt_fld_data_type_cd
    //                         })) || []
    //                     };
    //                 } catch (error) {
    //                     console.error(`Error fetching columns for data source ${dataSrcId}:`, error);
    //                     return { dataSrcId, columns: [] };
    //                 }
    //             })
    //         );

    //         // Safely update source columns
    //         setSourceColumns((prevColumns) => {
    //             const existingColumnNames = new Set(prevColumns.map(col => col.name));
    //             const newColumns = results
    //                 .flatMap(result => result.columns)
    //                 .filter(col => !existingColumnNames.has(col.name));

    //             return [...prevColumns, ...newColumns];
    //         });

    //     } catch (error) {
    //         console.error('Error in fetchSourceColumns:', error);
    //     }
    // }, []);

    // // Update the useEffect to be more precise
    // useEffect(() => {
    //     const unfetchedSourceNodes = nodes.filter(node => {
    //         const isSourceNode = node.data?.label?.toLowerCase().includes("source") || node.data?.source;
    //         const hasDataSrcId = node.data?.source?.data_src_id;
    //         const notFetched = hasDataSrcId && !fetchedIdsRef.current.has(node.data.source.data_src_id);
    //         return isSourceNode && hasDataSrcId && notFetched;
    //     });

    //     if (unfetchedSourceNodes.length > 0) {
    //         fetchSourceColumns(nodes);
    //     }
    // }, [nodes, fetchSourceColumns]);

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
            : baseModuleName ;
        // Find the last selected node's position
        const lastNode = nodes[nodes.length-1 ];
        const basePosition = lastNode ? {
            x: lastNode.position.x + 150,
            y: lastNode.position.y
        } : {
            x: 50+random(),
            y: 100
        };
        let updatedSource = source;
        if(updatedSource?.connection_config?.custom_metadata) {
        updatedSource.connection_config.custom_metadata.connection_config_id=source?.connection_config_id;
        }
        // updatedSource.data_src_desc='dummy description';
// debugger
        const uniqueId = `${node.ui_properties.module_name}_${Date.now()}`;
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
                source: updatedSource,
                title: source?.data_src_name.replace(/[-.\s]/g, '_') || nodeLabel.replace(/[-.\s]/g, '_'), // Also set the title with the numbered label
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
        fetchSourceColumns: () => {}, // Add empty function for now
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
        setPipelines,
        initialDataMap,
        setInitialDataMap,
        getInitialDataForNode: (nodeId: string, source: any) => initialDataMap[nodeId] || null,
        createInitialDataForNode: (nodeId: string, source: any) => {
            const initialData = { nodeId, source, timestamp: Date.now() };
            setInitialDataMap(prev => ({ ...prev, [nodeId]: initialData }));
            return initialData;
        },
        triggerManualSave
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
        // fetchSourceColumns,
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
        setPipelines,
        triggerManualSave
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
