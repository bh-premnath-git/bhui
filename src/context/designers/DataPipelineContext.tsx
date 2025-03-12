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
import { convertPipelineToUIJson, usePipelineQuery, useUpdatePipelineMutation, useTransformationCountQuery } from '@/lib/pipelineJsonConverter';
import { CATALOG_API_PORT } from '@/config/platformenv';
import {
    useNodesState,
    useEdgesState,
    useReactFlow,
    Connection,
    addEdge
} from 'reactflow';
import { useDispatch, useSelector } from 'react-redux';

import { useParams, useNavigate } from 'react-router-dom';
import schemaData from '@/pages/designers/data-pipeline/data/mdata.json';
import axios from 'axios';
import { convertUIToPipelineJson } from '@/lib/convertUIToPipelineJson';
import { getPipelineById, getTransformationCount, runNextCheckpoint, startPipeLine, stopPipeLine, updatePipeline,
    } from '@/store/slices/designer/buildPipeLine/BuildPipeLineSlice';

import { getInitialFormState } from '@/lib/transformationUtils';
import { AppDispatch, RootState } from '@/store';
import { apiService } from '@/lib/api/api-service';

// API client setup
const apiClient = axios.create({
    baseURL: `http://localhost:${CATALOG_API_PORT}`
});

interface PipelineData {
    pipeline_json: {
        name: string;
        transformations: any[];
        // Add other properties as needed
    };
    pipeline_id: string;
    pipeline_name: string;
}
interface UIProperties {
    color: string;
    icon: string;
    module_name: string;
    ports: any;
}

interface Node {
    ui_properties: UIProperties;
    [key: string]: any;
}

interface PipelineContextProps {
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
    sourceColumns: any;
    setSourceColumns: React.Dispatch<React.SetStateAction<any>>;
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
    fetchSourceColumns: (nodes: any) => void;
    handleLeavePage: () => void;
    getTransformationName: (moduleName: string) => string;
    addNodeToHistory: () => void;
    handleCopy: () => void;
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
}

const PipelineContext = createContext<PipelineContextProps | undefined>(undefined);

export const PipelineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [nodeCounters, setNodeCounters] = useState<{ [key: string]: number }>({});
    const reactFlowInstance = useReactFlow();
    const [debuggedNodes, setDebuggedNodes] = useState<string[]>([]);
    const [debuggedNodesList, setDebuggedNodesList] = useState<Array<{ id: string; title: string }>>([]);
    const [isPipelineRunning, setIsPipelineRunning] = useState(false);
    const [transformationCounts, setTransformationCounts] = useState<Array<{ transformationName: string; rowCount: string }>>([]);
    const { id } = useParams();
    const dispatch = useDispatch<AppDispatch>();
    
    const ctrlDTimeout = useRef<NodeJS.Timeout | null>(null);
    const [history, setHistory] = useState<Array<{ nodes: any; edges: any }>>([]);
    const [redoStack, setRedoStack] = useState<Array<{ nodes: any; edges: any }>>([]);
    const [sourceColumns, setSourceColumns] = useState<any>([]);
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
    const [isFormOpen, setIsFormOpen] = useState(false);
  const {pipelineDtl}=useSelector((state:RootState)=>state.buildPipeline)
const [selectedSchema, setSelectedSchema] = useState<any | null>(null);
    const [formStates, setFormStates] = useState<{ [key: string]: any }>({});
    const [runDialogOpen, setRunDialogOpen] = useState(false);
    const [selectedFormState, setSelectedFormState] = useState<any>(null);
    const [showLeavePrompt, setShowLeavePrompt] = useState(false);
    const time = import.meta.env.VITE_AUTO_SAVE_TIME;
    const autoSaveInterval = parseInt(time, 10) || 5000;
    const navigate = useNavigate();
    // console.log("Id", id);
    const [isCanvasLoading, setIsCanvasLoading] = useState(false);
    const { zoomIn, zoomOut, fitView } = useReactFlow();

    const [isSaving, setIsSaving] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [saveError, setSaveErrorState] = useState<string | null>(null);
    const [pipelineName, setPipeLineName] = useState<any>(null);
    const [pipelineJson, setPipelineJson] = useState<any>(null);
    const [headerUpdateTrigger, setHeaderUpdateTrigger] = useState(0);

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
            console.log("Header update trigger incremented:", prev + 1);
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

    // Add this near other Redux selectors
    const saveStatus = { hasUnsavedChanges }
    // Fetch pipeline details when id changes
    const { data: pipelineData, isLoading: isPipelineLoading } = usePipelineQuery(id);
    // const updatePipeline = useUpdatePipelineMutation();
 
    useEffect(() => { 
        const fetchPipelineDetails = async () => {
            try {
                let response = await dispatch(getPipelineById({id:id})).unwrap();
                console.log(response.pipeline_json);
                
               setPipeLineName({pipeLineName:response.pipeline_json.name});
            setPipelineJson(response.pipeline_json)
                
                const uiJson = convertPipelineToUIJson(response.pipeline_json);
                const convertedJson = await uiJson;
                console.log(convertedJson)
                const nodesWithTitles = convertedJson.nodes.map(node => {
                    const matchingTransformation = response.pipeline_json.transformations.find(
                        (t: any) => {
                            console.log(t)
                            if (t.title === node.data.title && t.name) {
                                return true;
                            }
                            return false;
                        }
                    );
    
                    // If we found a matching transformation, use its name as the title
                    if (matchingTransformation) {
                        console.log(matchingTransformation)
                        return {
                            ...node,
                            data: {
                                ...node.data,
                                title: matchingTransformation.name,
                                transformationData: {
                                    ...node.data.transformationData,
                                    name: matchingTransformation.name // Ensure name is preserved in transformation data
                                }
                            }
                        };
                    }
                    return node;
                });
                console.log(nodesWithTitles)
                setNodes(nodesWithTitles);
                setEdges(convertedJson.edges);
    
                const initialFormStates = {};
                response.pipeline_json.transformations.forEach((transformation: any) => {
                    const matchingNode = nodesWithTitles.find(
                        (node: any) => 
                            node.data.label === transformation.transformation && 
                            node.data.title === transformation.name
                    );
    
                    if (matchingNode?.id) {
                        initialFormStates[matchingNode.id] = getInitialFormState(transformation, matchingNode.id);
                    }
                });
    
                console.log('Initial Form States:', initialFormStates);
                setFormStates(initialFormStates);
            } catch (error) {
                console.error("Error fetching pipeline details:", error);
            }
        };
        fetchPipelineDetails();
    }, [id, dispatch, pipelineData]);

    // Update the auto-save effect
    useEffect(() => {
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
                    const pipeline_json = convertUIToPipelineJson(serializedNodes, edges, pipelineDtl);
                    console.log(pipeline_json,"pipeline_json")
                    await apiService.patch({
                        portNumber: CATALOG_API_PORT,
                        url: `/pipeline/${id}`,
                        usePrefix: true,
                        method: 'PATCH',
                        data: pipeline_json
                    });

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
    }, [nodes, edges, hasUnsavedChanges, autoSaveInterval, setSaving, setSaved, setSaveError, id, pipelineDtl]);

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
        if (typeof nodesOrUpdater === 'function') {
            setNodes((prevNodes) => 
                nodesOrUpdater(prevNodes).map(sanitizeNode)
            );
        } else {
            setNodes(nodesOrUpdater.map(sanitizeNode));
        }
    }, [setNodes, sanitizeNode]);

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

    const handleNodeUpdate = useCallback((nodeId: string, updatedData: any) => {
        setSanitizedNodes(prevNodes =>
            prevNodes.map(node => {
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
            })
        );
        setUnsavedChanges();
    }, [setSanitizedNodes, dispatch]);

    const handleCenter = useCallback(() => {
        try {
            fitView({ duration: 800, padding: 0.1 });
        } catch (error) {
            console.error('FitView error:', error);
        }
    }, [fitView]);

    const handleSourceUpdate = useCallback(async({ nodeId, sourceData }: { nodeId: string, sourceData: any }) => {
        // debugger
        console.log(sourceData)
        setSanitizedNodes(prevNodes =>
            prevNodes.map(node => {
                if (node.id === nodeId) {
                    return {
                        ...node,
                        label: sourceData.data.label,
                        data: {
                            ...node.data,
                            title: sourceData.data.label,
                            source: sourceData.data.source,
                        }
                    };
                }
                return node;
            })
        );
        setUnsavedChanges();
       
    }, [setSanitizedNodes, dispatch]);

    const handleEdgesChange = useCallback((changes: any) => {
        onEdgesChange(changes);
        setUnsavedChanges();
    }, [onEdgesChange, dispatch]);

    const handleFormSubmit = useCallback((data: any) => {
        console.log('Form data:', data);
        if (selectedSchema?.nodeId) {
            // Update form states
            setFormStates((prev: any) => ({
                ...prev,
                [selectedSchema.nodeId]: data
            }));
  
            // Update node data with transformation data
            setSanitizedNodes((nds) =>
                nds.map((node) => {
                    if (node.id === selectedSchema.nodeId) {
                        return {
                            ...node,
                            data: {
                                ...node.data,
                                transformationData: {
                                    ...node.data.transformationData,
                                    ...data,
                                    name: data.name || node.data.title
                                }
                            }
                        };
                    }
                    return node;
                })
            );
        }
        setIsFormOpen(false);
    }, [selectedSchema, setSanitizedNodes]);

    const handleDialogClose = useCallback(() => {
        setIsFormOpen(false);
    }, []);

    const handleRunClick = useCallback((e: React.MouseEvent) => {
    
        const pipelineConfig:any = convertUIToPipelineJson(nodes, edges, pipelineDtl);
          setSelectedFormState(pipelineConfig);
          return pipelineConfig;
      }, [edges, formStates, reactFlowInstance]);


    const handleNodeForm = useCallback((targetNodeId: string) => {
        const targetNode = nodes.find(node => node.id === targetNodeId);
  console.log(targetNode,"targetNode")
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

    const onConnect = useCallback((connection: Connection) => {
        if (checkConnectionExists(connection)) {
            return;
        }
  
        // Get source and target nodes
        const sourceNode = nodes.find(n => n.id === connection.source);
        const targetNode = nodes.find(n => n.id === connection.target);
  
        if (!sourceNode || !targetNode) return;
  
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
  
        setEdges((eds: any) => addEdge(connection, eds));
        handleNodeForm(connection.target!);
    }, [checkConnectionExists, checkForCircularDependency, handleNodeForm, setEdges, nodes, edges]);
  

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

    const handleRun = useCallback(async () => {
        try {
            setIsCanvasLoading(true);
            setIsPipelineRunning(true);
            setShowLogs(true);
            
            setConversionLogs([{
                timestamp: new Date().toISOString(),
                message: 'Starting pipeline validation...',
                level: 'info'
            }]);
            setValidationErrors([]);
  
            const validationResult:any = convertUIToPipelineJson(nodes, edges, pipelineDtl, true);
            
            if (validationResult.logs) {
                setConversionLogs(prevLogs => [...prevLogs, ...validationResult.logs]);
            }
  
            if (!validationResult.isValid) {
                throw new Error(`Pipeline is incomplete or broken:\n${validationResult.errors.join('\n')}`);
            }
  
            const {pipeline_json}:any = await convertUIToPipelineJson(nodes, edges, pipelineDtl);
            console.log(pipeline_json)
  
            pipeline_json.transformations = pipeline_json.transformations.map(transform => {
                if (transform.transformation.toLowerCase() === "target") {
                    return {
                        ...transform,
                        transformation: "Writer"
                    };
                }
                return transform;
            });
  
            // Create the request data object with array
            const requestData = {
                pipeline_name: pipelineDtl?.pipeline_name || "sample_pipeline",
                pipeline_json: pipeline_json,
                mode: 'DEBUG',
                checkpoints: debuggedNodesList.map(checkpoint => checkpoint.title)
            };
  
            setSelectedFormState(pipeline_json);
            setRunDialogOpen(true);
  
            setConversionLogs(prevLogs => [...prevLogs, {
                timestamp: new Date().toISOString(),
                message: 'Pipeline validation successful. Starting execution...',
                level: 'info'
            }]);
  
            // Pass the request data directly
            let response:any = await dispatch(startPipeLine(requestData)).unwrap();
            if (response.error) {
                throw new Error(response.error);
            }
  
            let countsResponse = await dispatch(getTransformationCount({
                params: pipelineDtl?.pipeline_name
            })).unwrap();
            console.log(countsResponse,"countsResponse")
            
            if (countsResponse.transformationOutputCounts) {
                setTransformationCounts(countsResponse.transformationOutputCounts);
            }
  
        } catch (error) {
            console.error('Error starting pipeline:', error);
            
            // Add error log
            setTerminalLogs(prevLogs => [...prevLogs, {
                timestamp: new Date().toISOString(),
                message: `Error: ${error.message}`,
                level: 'error'
            }]);
  
            if (error.message.includes('Pipeline is incomplete or broken:')) {
                const errorMessages = error.message.split('\n').slice(1);
                setValidationErrors(errorMessages);
            }
  
            setSaveError(error.message);
            setIsPipelineRunning(false);
        } finally {
            setIsCanvasLoading(false);
        }
    }, [handleRunClick, debuggedNodesList, nodes, edges, pipelineDtl]);
  

    const handleStop = useCallback(async () => {
        try {
          let response=await dispatch(stopPipeLine({params:pipelineDtl?.pipeline_name})).unwrap();
            if (response.message) {
                setIsPipelineRunning(false);
                // Clear transformation counts when stopping the pipeline
                setTransformationCounts([]);
            }
        } catch (error) {
            console.error('Error stopping pipeline:', error);
        }
    }, [pipelineDtl?.pipeline_name]);

    const handleNext = useCallback(async () => {
        try {
            console.log('Next pipeline clicked');
            let result:any = await dispatch(runNextCheckpoint({pipeline_name:pipelineDtl?.pipeline_name})).unwrap();
            // Only proceed if first API call was successful
            if (result && !result.error) {
              let countsResponse=await dispatch(getTransformationCount({params:pipelineDtl?.pipeline_name})).unwrap();
              console.log(countsResponse,"countsResponse")
                if (countsResponse.error) {
                    throw new Error(countsResponse.error);
                }
                if (countsResponse.transformationOutputCounts) {
                    setTransformationCounts(countsResponse.transformationOutputCounts);
                }
            } else {
                throw new Error(result.error || 'Failed to run next checkpoint');
            }
        } catch (error) {
            console.error('Error in handleNext:', error);
            // Handle error appropriately (e.g., show error message to user)
        }
    }, [pipelineDtl?.pipeline_name]);

    const getTransformationName = (moduleName: string): string => {
        return moduleName.toLowerCase();
    };

    const fetchSourceColumns = useCallback(async (nodes: any) => {
        try {
            // Get only source nodes that have a data_src_id and haven't been fetched yet
            const sourceNodes = nodes.filter(node => 
                (node.data.label.toLowerCase().includes("source") || node.data.source) &&
                node.data.source?.data_src_id &&
                !node.data.source?.columnsLoaded  // Add a flag to track if columns were loaded
            );

            if (sourceNodes.length === 0) return;

            // Create a Set of unique data_src_ids to prevent duplicate requests
            const uniqueDataSrcIds = new Set(sourceNodes.map(node => node.data.source.data_src_id));

            const columnsPromises = Array.from(uniqueDataSrcIds).map(async (dataSrcId) => {
                const response: any = await apiService.get({
                    portNumber: CATALOG_API_PORT,
                    url: `/data_source_layout/list_full/?data_src_id=${dataSrcId}`,
                    usePrefix: true,
                    method: 'GET',
                    metadata: {
                        errorMessage: 'Failed to fetch source layout fields'
                    }
                });

                // Mark nodes with this data_src_id as loaded
                setSanitizedNodes(prevNodes => prevNodes.map(node => {
                    if (node.data.source?.data_src_id === dataSrcId) {
                        return {
                            ...node,
                            data: {
                                ...node.data,
                                source: {
                                    ...node.data.source,
                                    columnsLoaded: true
                                }
                            }
                        };
                    }
                    return node;
                }));

                return response?.layout_fields?.map((field: any) => ({
                    name: field.lyt_fld_name,
                    dataType: field.lyt_fld_data_type_cd
                })) || [];
            });

            const allColumns = (await Promise.all(columnsPromises)).flat();
            setSourceColumns(allColumns);
        } catch (error) {
            console.error('Error fetching columns:', error);
        }
    }, []);

    // Update the useEffect to only run when necessary
    useEffect(() => {
        const hasNewSourceNodes = nodes.some(node => 
            (node.data.label.toLowerCase().includes("source") || node.data.source) &&
            node.data.source?.data_src_id &&
            !node.data.source?.columnsLoaded
        );

        if (hasNewSourceNodes) {
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
            const pipeline_json = convertUIToPipelineJson(nodes, edges, pipelineDtl);
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

    const handleCopy = useCallback(() => {
        const selectedNodes = nodes.filter(node => node.selected);
        const selectedEdges = edges.filter(edge => {
            const sourceNode = selectedNodes.find(node => node.id === edge.source);
            const targetNode = selectedNodes.find(node => node.id === edge.target);
            return sourceNode && targetNode;
        });
  
        // Copy form states for selected nodes
        const selectedFormStates = selectedNodes.reduce((acc, node) => {
            if (formStates[node.id]) {
                acc[node.id] = formStates[node.id];
            }
            return acc;
        }, {});
  
        setCopiedNodes(selectedNodes);
        setCopiedEdges(selectedEdges);
        // Store copied form states
        setCopiedFormStates(selectedFormStates);
    }, [nodes, edges, formStates]);

    const handlePaste = useCallback(() => {
        if (copiedNodes.length === 0) return;
        addNodeToHistory();
        const idMapping = {};
        const newNodes = copiedNodes.map(node => {
            const newId = `${node.id}_copy_${Date.now()}`;
            idMapping[node.id] = newId;
  
            return {
                ...node,
                id: newId,
                position: {
                    x: node.position.x + 50,
                    y: node.position.y + 50
                },
                selected: false
            };
        });
        const newEdges = copiedEdges.map(edge => ({
            ...edge,
            id: `${edge.id}_copy_${Date.now()}`,
            source: idMapping[edge.source],
            target: idMapping[edge.target],
            selected: false
        }));
  
        const newFormStates = {};
        Object.entries(copiedFormStates).forEach(([oldNodeId, formState]) => {
            const newNodeId = idMapping[oldNodeId];
            if (newNodeId) {
                newFormStates[newNodeId] = { ...formState };
            }
        });
  
        setSanitizedNodes(prevNodes => [...prevNodes, ...newNodes]);
        setEdges(prevEdges => [...prevEdges, ...newEdges]);
        setFormStates(prevFormStates => ({
            ...prevFormStates,
            ...newFormStates
        })); 
        setUnsavedChanges();
    }, [copiedNodes, copiedEdges, copiedFormStates, addNodeToHistory, setSanitizedNodes, setEdges, setFormStates, dispatch]);

    const handleCut = useCallback(() => {
        const selectedNodes = nodes.filter(node => node.selected);
        const selectedEdges = edges.filter(edge => {
            const sourceNode = selectedNodes.find(node => node.id === edge.source);
            const targetNode = selectedNodes.find(node => node.id === edge.target);
            return sourceNode && targetNode;
        });
  
        setCopiedNodes(selectedNodes);
        setCopiedEdges(selectedEdges);
  
        addNodeToHistory();
        setSanitizedNodes(nds => nds.filter(node => !node.selected));
        setEdges(eds => eds.filter(edge => !edge.selected));
        setUnsavedChanges();
    }, [nodes, edges, addNodeToHistory, setSanitizedNodes, setEdges, dispatch]);
  
    const handleRedo = useCallback(() => {
        if (redoStack.length > 0) {
            const lastState = redoStack[redoStack.length - 1];
            setRedoStack((prev) => prev.slice(0, -1));
            setHistory((prev) => [...prev, { nodes, edges }]);
            setSanitizedNodes(lastState.nodes);
            setEdges(lastState.edges);
        }
    }, [redoStack, nodes, edges]);
  
    const handleUndo = useCallback(() => {
        if (history.length > 0) {
            const lastState = history[history.length - 1];
            setHistory((prev) => prev.slice(0, -1));
            setRedoStack((prev) => [...prev, { nodes, edges }]);
            setSanitizedNodes(lastState.nodes);
            setEdges(lastState.edges);
        }
    }, [history, nodes, edges]);
  
    const handleLogsClick = useCallback(() => {
        setShowLogs(prev => !prev);  // Toggle logs visibility
    }, []);
    const handleZoomIn = useCallback(() => {
        zoomIn({ duration: 800 });
    }, [zoomIn]);
  
    // Add new function for zoom out
    const handleZoomOut = useCallback(() => {
        zoomOut({ duration: 800 });
    }, [zoomOut]);
  

    const handleKeyDown = (event: KeyboardEvent) => {
        const isFormElement = document.activeElement instanceof HTMLInputElement || 
                             document.activeElement instanceof HTMLTextAreaElement ||
                             document.activeElement instanceof HTMLSelectElement;
  
        if (!isFormElement) {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'c') {
                event.preventDefault();
                handleCopy();
            }
    
            // Paste (Ctrl + V)
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'v') {
                event.preventDefault();
                handlePaste();
            }
    
            // Cut (Ctrl + X)
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'x') {
                event.preventDefault();
                handleCut();
            }
    
            // Undo (Ctrl + Z)
            if ((event.ctrlKey || event.metaKey) && !event.shiftKey && event.key.toLowerCase() === 'z') {
                event.preventDefault();
                handleUndo();
            }
    
            // Redo (Ctrl + Y or Ctrl + Shift + Z)
            if ((event.ctrlKey || event.metaKey) && 
                (event.key.toLowerCase() === 'y' || (event.shiftKey && event.key.toLowerCase() === 'z'))) {
                event.preventDefault();
                handleRedo();
            }
            // Debug mode toggle (Ctrl + D)
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'd') {
                event.preventDefault();
                
                // Add selected nodes to debug list
                const selectedNodes = nodes.filter(node => node.selected);
                if (selectedNodes.length > 0) {
                    selectedNodes.forEach(node => {
                        handleDebugToggle(node.id, node.data.title);
                    });
                } else {
                    // If no nodes are selected, show a notification or alert
                    console.log('Please select nodes to debug');
                    // Optionally add a UI notification here
                }
            }
  
          
  
            // Existing shortcuts
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'f') {
                event.preventDefault();
                const searchInput = document.querySelector<HTMLInputElement>('[data-search-input]');
                if (searchInput) {
                    searchInput.focus();
                    searchInput.select();
                }
            }
  
            // Run pipeline (Ctrl + R)
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'r') {
                event.preventDefault();
                handleRun();
            }
  
            // Open logs (Ctrl + L)
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'l') {
                event.preventDefault();
                handleLogsClick();
            }
  
            // Stop pipeline (Ctrl + K)
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault();
                handleStop();
            }
  
            // Next step (Ctrl + N)
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'n') {
                event.preventDefault();
                handleNext();
            }
  
            // Zoom in (Ctrl + Plus)
            if ((event.ctrlKey || event.metaKey) && (event.key === '+' || event.key === '=')) {
                event.preventDefault();
                handleZoomIn();
            }
  
            // Zoom out (Ctrl + Minus)
            if ((event.ctrlKey || event.metaKey) && event.key === '-') {
                event.preventDefault();
                handleZoomOut();
            }
  
            // ... rest of existing shortcuts (Copy, Paste, Cut, etc.) ...
        }
    };


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
        console.log(baseModuleName)
        // Find the last selected node's position
        const lastNode = nodes[nodes.length - 1];
        const basePosition = lastNode ? {
            x: lastNode.position.x + 150,
            y: lastNode.position.y
        } : {
            x: 50,
            y: 100
        };
  
        const uniqueId = `${node.ui_properties.module_name}_${Date.now()}`;
        console.log(baseModuleName,"baseModuleName")
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
                source: source,
                title: source?.data_src_name || nodeLabel, // Also set the title with the numbered label
                onUpdate: (updatedData: any) => handleNodeUpdate(uniqueId, updatedData)
            }
        };
  
        setSanitizedNodes((prevNodes) => [...prevNodes, newNode]);
        setUnsavedChanges();
  
        setTimeout(() => {
            reactFlowInstance.fitView({ padding: 0.2, duration: 400 });
        }, 50);
    }, [nodes, setSanitizedNodes, reactFlowInstance, dispatch, handleNodeUpdate]);

    const handleAlignHorizontal = useCallback(() => {
        if (nodes.length === 0) return;
  
        // Create a map of node levels (columns)
        const nodeLevels = new Map<string, number>();
        const visited = new Set<string>();
  
        // Find source nodes (nodes with no incoming edges)
        const sourceNodes = nodes.filter(node => 
            !edges.some(edge => edge.target === node.id)
        );
  
        // Assign levels through BFS
        const queue = sourceNodes.map(node => ({ id: node.id, level: 0 }));
        while (queue.length > 0) {
            const { id, level } = queue.shift()!;
            if (visited.has(id)) continue;
            
            visited.add(id);
            nodeLevels.set(id, level);
  
            // Find all outgoing edges from this node
            const outgoingEdges = edges.filter(edge => edge.source === id);
            outgoingEdges.forEach(edge => {
                if (!visited.has(edge.target)) {
                    queue.push({ id: edge.target, level: level + 1 });
                }
            });
        }
  
        // Get maximum level for spacing calculation
        const maxLevel = Math.max(...Array.from(nodeLevels.values()));
        const levelWidth = 200; // Horizontal spacing between levels
        const nodeSpacing = 150; // Vertical spacing between nodes in the same level
  
        // Group nodes by their levels
        const nodesByLevel = new Map<number, string[]>();
        nodeLevels.forEach((level, nodeId) => {
            if (!nodesByLevel.has(level)) {
                nodesByLevel.set(level, []);
            }
            nodesByLevel.get(level)!.push(nodeId);
        });
  
        // Calculate new positions
        const startX = 50;
        const startY = 50;
        const newNodes = nodes.map(node => {
            const level = nodeLevels.get(node.id) || 0;
            const nodesInLevel = nodesByLevel.get(level) || [];
            const indexInLevel = nodesInLevel.indexOf(node.id);
            
            return {
                ...node,
                position: {
                    x: startX + (level * levelWidth),
                    y: startY + (indexInLevel * nodeSpacing)
                }
            };
        });
  
        setSanitizedNodes(newNodes);
  
        // Center the view
        setTimeout(() => {
            const centerX = startX + (maxLevel * levelWidth) / 2;
            const maxNodesInLevel = Math.max(...Array.from(nodesByLevel.values()).map(n => n.length));
            const centerY = startY + (maxNodesInLevel * nodeSpacing) / 2;
            reactFlowInstance.setCenter(centerX, centerY, { duration: 800 });
        }, 50);
  
        setUnsavedChanges();
    }, [nodes, edges, setSanitizedNodes, dispatch, reactFlowInstance]);
  
    const handleAlignVertical = useCallback(() => {
        if (nodes.length === 0) return;
  
        // Create a map of node levels (rows)
        const nodeLevels = new Map<string, number>();
        const visited = new Set<string>();
  
        // Find source nodes (nodes with no incoming edges)
        const sourceNodes = nodes.filter(node => 
            !edges.some(edge => edge.target === node.id)
        );
  
        // Assign levels through BFS
        const queue = sourceNodes.map(node => ({ id: node.id, level: 0 }));
        while (queue.length > 0) {
            const { id, level } = queue.shift()!;
            if (visited.has(id)) continue;
            
            visited.add(id);
            nodeLevels.set(id, level);
  
            // Find all outgoing edges from this node
            const outgoingEdges = edges.filter(edge => edge.source === id);
            outgoingEdges.forEach(edge => {
                if (!visited.has(edge.target)) {
                    queue.push({ id: edge.target, level: level + 1 });
                }
            });
        }
  
        // Get maximum level for spacing calculation
        const maxLevel = Math.max(...Array.from(nodeLevels.values()));
        const levelHeight = 150; // Vertical spacing between levels
        const nodeSpacing = 200; // Horizontal spacing between nodes in the same level
  
        // Group nodes by their levels
        const nodesByLevel = new Map<number, string[]>();
        nodeLevels.forEach((level, nodeId) => {
            if (!nodesByLevel.has(level)) {
                nodesByLevel.set(level, []);
            }
            nodesByLevel.get(level)!.push(nodeId);
        });
  
        // Calculate new positions
        const startX = 50;
        const startY = 50;
        const newNodes = nodes.map(node => {
            const level = nodeLevels.get(node.id) || 0;
            const nodesInLevel = nodesByLevel.get(level) || [];
            const indexInLevel = nodesInLevel.indexOf(node.id);
            
            return {
                ...node,
                position: {
                    x: startX + (indexInLevel * nodeSpacing),
                    y: startY + (level * levelHeight)
                }
            };
        });
  
        setSanitizedNodes(newNodes);
  
        // Center the view
        setTimeout(() => {
            const maxNodesInLevel = Math.max(...Array.from(nodesByLevel.values()).map(n => n.length));
            const centerX = startX + (maxNodesInLevel * nodeSpacing) / 2;
            const centerY = startY + (maxLevel * levelHeight) / 2;
            reactFlowInstance.setCenter(centerX, centerY, { duration: 800 });
        }, 50);
  
        setUnsavedChanges();
    }, [nodes, edges, setSanitizedNodes, dispatch, reactFlowInstance]);
  
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
        sourceColumns,
        setSourceColumns,
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
        setIsCanvasLoading,
        handleAlignHorizontal,
        handleAlignVertical,
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
        pipelineJson
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
        sourceColumns,
        setSourceColumns,
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
        runDialogOpen,
        selectedFormState,
        showLeavePrompt,
        handleKeyDown,
        handleZoomIn,
        handleZoomOut,
        handleCenter,
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
        pipelineJson
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
