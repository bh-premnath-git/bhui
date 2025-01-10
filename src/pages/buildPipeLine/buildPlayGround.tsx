import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ReactFlow, {
    useNodesState,
    useEdgesState,
    Connection,
    addEdge,
    useReactFlow,
    ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import nodeData from '../../pages/buildPipeLine/node_display.json';
import schemaData from '../../pages/buildPipeLine/mdata.json';
import { Button, Dialog, DialogActions, DialogContent, Menu, MenuItem } from '@mui/material';
import schemaValidation from '../../pages/buildPipeLine/sample_validation.json';
import { CustomNode } from '@/components/BuildPipeLineComps/CustomNode';
import { ApiService } from '@/services/apiServices';
import { CustomEdge } from '@/components/BuildPipeLineComps/customEdge';
import { FlowControls } from './FlowControls';
import CreateFormFormik from '@/components/BuildPipeLineComps/CreateForm';
import NodeDropList from '@/components/BuildPipeLineComps/NodeDropList';
import { ErrorBoundary } from "@/ErrorBoundry"
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setSaving, setSaved, setSaveError, setUnsavedChanges } from '@/redux/features/autoSaveSlice';
import { connect } from 'http2';
import { useNavigate, useLocation } from 'react-router-dom';

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

interface Schema {
    title: string;
    nodeId?: string;
    [key: string]: any;
}

const BuildPlayGround: React.FC = () => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [pipelineDtl, setPipelineDtl] = useState<any>(null);
    const [selectedSchema, setSelectedSchema]: any = useState<Schema | null>(null);
    const [formStates, setFormStates] = useState<{ [key: string]: any }>({});
    const [runDialogOpen, setRunDialogOpen] = useState(false);
    const [selectedFormState, setSelectedFormState] = useState<any>(null);
    const [pipelineConfig, setPipelineConfig] = useState<any[]>([]);
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [nodeCounters, setNodeCounters] = useState<{ [key: string]: number }>({});
    const reactFlowInstance = useReactFlow();
    const { zoomIn, zoomOut, fitView } = useReactFlow();
    const [debuggedNodes, setDebuggedNodes] = useState<Set<string>>(new Set());
    const [debuggedNodesList, setDebuggedNodesList] = useState<Array<{ id: string, title: string }>>([]);
    const [isPipelineRunning, setIsPipelineRunning] = useState(false);
    const [transformationCounts, setTransformationCounts] = useState<Array<{ transformationName: string, rowCount: string }>>([]);
    const { id } = useParams();
    const dispatch = useDispatch();
    const saveStatus = useSelector((state: any) => state.autoSave);
    const time = import.meta.env.VITE_AUTO_SAVE_TIME;
    const autoSaveInterval = parseInt(time, 10) || 30000;
    const [history, setHistory] = useState<{ nodes: any[], edges: any[] }[]>([]);
    const [redoStack, setRedoStack] = useState<{ nodes: any[], edges: any[] }[]>([]);
    const [showLeavePrompt, setShowLeavePrompt] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const fetchPipelineDetails = async () => {
            try {
                const response = await ApiService(
                    "8011",
                    "get",
                    `/pipeline/${id}`,
                    null
                );
                console.log(response);
                setPipelineDtl(response);

                // Set the nodes and edges from the response if they exist
                if (response?.pipeline_json?.nodes) {
                    setNodes(response.pipeline_json.nodes);
                }
                if (response?.pipeline_json?.edges) {
                    setEdges(response.pipeline_json.edges);
                }

                // Update node counters based on existing nodes
                if (response?.pipeline_json?.nodes) {
                    const counters: { [key: string]: number } = {};
                    response.pipeline_json.nodes.forEach((node: any) => {
                        const moduleName = node.data.label;
                        counters[moduleName] = (counters[moduleName] || 0) + 1;
                    });
                    setNodeCounters(counters);
                }
            } catch (error) {
                console.error("Error fetching pipeline details:", error);
            }
        };

        fetchPipelineDetails();
    }, []);

    const handleNodesChange = useCallback((changes: any) => {
        onNodesChange(changes);
        dispatch(setUnsavedChanges());
    }, [onNodesChange, dispatch]);

    const handleEdgesChange = useCallback((changes: any) => {
        onEdgesChange(changes);
        dispatch(setUnsavedChanges());
    }, [onEdgesChange, dispatch]);

    useEffect(() => {
        const intervalId = setInterval(async () => {
            if (saveStatus.hasUnsavedChanges) {  // Only save if there are changes
                try {
                    dispatch(setSaving());
                    const pipeline_json = {
                        pipeline_json: {
                            nodes: nodes,
                            edges: edges
                        }
                    };
                    await ApiService(
                        "8011",
                        "patch",
                        `/pipeline/${id}`,
                        pipeline_json
                    );
                    dispatch(setSaved());
                } catch (error) {
                    console.error('Error saving pipeline state:', error);
                    dispatch(setSaveError());
                }
            }
        }, autoSaveInterval);

        return () => clearInterval(intervalId);
    }, [nodes, edges, id, dispatch, saveStatus.hasUnsavedChanges, autoSaveInterval]);

    const onError = useCallback((id: string) => {
        console.error('Flow Error:', id);
    }, []);

    const handleNodeUpdate = useCallback((nodeId: string, updatedData: any) => {
        setNodes(prevNodes =>
            prevNodes.map(node => {
                if (node.id === nodeId) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            label: updatedData.data.label,
                            source: updatedData.data.source
                        }
                    };
                }
                return node;
            })
        );
        dispatch(setUnsavedChanges());
    }, [setNodes, dispatch]);

    const handleNodeClick = useCallback((node: Node, source: any) => {
        if (!node?.ui_properties?.module_name) {
            console.error('Invalid node data');
            return;
        }

        const currentCount = nodeCounters[node.ui_properties.module_name] || 0;
        const newCount = currentCount + 1;

        setNodeCounters(prev => ({
            ...prev,
            [node.ui_properties.module_name]: newCount
        }));

        const position = {
            x: nodes.length * 130 + 50,
            y: 100
        };

        const uniqueId = `${node.ui_properties.module_name}_${newCount}`;

        // Create a more detailed node data structure
        const newNode = {
            id: uniqueId,
            type: 'custom',
            position,
            data: {
                label: source?.data_src_name || node.ui_properties.module_name,
                icon: node.ui_properties.icon,
                ports: node.ui_properties.ports,
                source: source,
                onUpdate: (updatedData: any) => handleNodeUpdate(uniqueId, updatedData)
            }
        };

        setNodes((prevNodes) => [...prevNodes, newNode]);
        dispatch(setUnsavedChanges());

        setTimeout(() => {
            reactFlowInstance.fitView({ padding: 0.2, duration: 400 });
        }, 50);
    }, [nodes, setNodes, nodeCounters, reactFlowInstance, dispatch, handleNodeUpdate]);

    const handleFormSubmit = useCallback((data: any) => {
        console.log('Form data:', data);
        if (selectedSchema?.nodeId) {
            setFormStates((prev: any) => ({
                ...prev,
                [selectedSchema.nodeId]: data
            }));
        }
        setIsFormOpen(false);
    }, [selectedSchema]);

    const handleDialogClose = useCallback(() => {
        setIsFormOpen(false);
    }, []);

    const handleRunClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        const allNodes = reactFlowInstance.getNodes();
        const sourceNodes = allNodes.filter(node =>
            node.data.label.toLowerCase().includes("source") || node.data.source
        );
        const targetNodes = allNodes.filter(node =>
            !edges.some(edge => edge.source === node.id)
        );
        const sources = sourceNodes.map(node => ({
            name: node?.data?.title || node.data?.source?.data_src_name || "input_data",
            source_type: "File",
            file_name: `${node.data.source?.file_path_prefix || "examples"}/${node.data.source?.file_name || "NaN"}`,
            connection: {
                name: node.data.source?.connection_name || "local_connection",
                connection_type: node.data.source?.connection_type || "Local",
                file_path_prefix: `${node.data.source?.file_path_prefix || "examples"}/`
            }
        }));
        const targets = targetNodes.map(node => ({
            name: "output_data",
            type: "File",
            connection: {
                type: "File",
                file_path: "examples/output.csv"
            },
            load_mode: "overwrite"
        }));

        const getOrderedNodes = () => {
            const orderedNodes: any[] = [];
            const visited = new Set<string>();

            const processNode = (nodeId: string) => {
                if (visited.has(nodeId)) return;
                visited.add(nodeId);

                const incomingEdges = edges.filter(edge => edge.target === nodeId);
                incomingEdges.forEach(edge => {
                    if (!visited.has(edge.source)) {
                        processNode(edge.source);
                    }
                });

                const node = allNodes.find(n => n.id === nodeId);
                if (node) {
                    orderedNodes.push(node);
                }
            };

            targetNodes.forEach(node => {
                processNode(node.id);
            });

            return orderedNodes;
        };

        // Get ordered nodes and create transformations
        const orderedNodes = getOrderedNodes();
        const transformations = orderedNodes.map(node => {
            console.log(node.data)
            if (node.data.label.toLowerCase().includes("source") || node.data.source) {
                return {
                    name: "read_" + node?.data?.title || node.data?.source?.data_src_name || null,
                    dependent_on: [],
                    transformation: "Reader",
                    source: {
                        name: node?.data?.title || node.data?.source?.data_src_name || null,
                        source_type: "File",
                        file_name: node.data.source?.file_name || null,
                        connection: {
                            name: node.data.source?.connection_name || null,
                            connection_type: node.data.source?.connection_type || null,
                            file_path_prefix: node.data.source?.file_path_prefix || null
                        }
                    },
                    read_options: {
                        header: true
                    }
                };
            }

            const moduleName = node.data.label.split(' ')[0].toLowerCase();
            const incomingEdges = edges.filter(edge => edge.target === node.id);
            const dependentOn = incomingEdges.map(edge => {
                const sourceNode = allNodes.find(n => n.id === edge.source);
                console.log(sourceNode?.data);

                if (sourceNode?.data?.source) {
                    return "read_" + (sourceNode.data.title || sourceNode.data.source.data_src_name || "input_data");
                } else if (sourceNode?.data?.label) {
                    return `${sourceNode.data.label.split(' ')[0].toLowerCase()}_transformation`;
                }
                return null;
            }).filter(Boolean);

            // Special handling for join transformations
            if (moduleName === 'join' || moduleName === 'joiner') {
                const formState = formStates[node.id] || {};
                return {
                    name: `${moduleName}_transformation`,
                    dependent_on: dependentOn,
                    transformation: "Joiner",
                    conditions: [
                        {
                            join_input: formState.join_input || "read_lookup_data",
                            join_condition: formState.join_condition || "",
                            join_type: formState.join_type || "left"
                        }
                    ],
                    expressions: formState.expressions || [
                        {
                            target_column: formState.target_column || "",
                            expression: formState.expression || ""
                        }
                    ],
                    advanced: {
                        hints: [
                            {
                                join_input: formState.hint_input || "read_input_data",
                                hint_type: formState.hint_type || "broadcast"
                            }
                        ]
                    }
                };
            }

            // Handle other transformations
            return {
                name: `${moduleName}_transformation`,
                dependent_on: dependentOn,
                transformation: node.data.label,
                ...(formStates[node.id] || {})
            };
        }).filter(Boolean);

        const pipelineConfig = {
            name: `${pipelineDtl?.pipeline_name || "sample_pipeline"}`,
            description: `${pipelineDtl?.pipeline_description || " "}`,
            version: "1.0",
            mode: "DEBUG",
            parameters: [],
            sources,
            targets,
            transformations
        };

        console.log('Pipeline Configuration:', pipelineConfig);
        setSelectedFormState(pipelineConfig);
        // setRunDialogOpen(true);
        return pipelineConfig;
    }, [edges, formStates, reactFlowInstance]);


    const filteredNodes = useMemo(() => nodeData.nodes, []);

    const checkConnectionExists = useCallback((connection: Connection): boolean => {
        return edges.some(
            edge => edge.source === connection.source && edge.target === connection.target
        );
    }, [edges]);

    const handleNodeForm = useCallback((targetNodeId: string) => {
        const targetNode = nodes.find(node => node.id === targetNodeId);

        if (targetNode) {
            const moduleName = targetNode.data.label.split(' ')[0];
            const schemaArray = Array.isArray(schemaData) ? schemaData : Object.values(schemaData);
            const moduleSchema = schemaArray.find((schema: any) => schema.title === moduleName);

            if (moduleSchema) {
                setSelectedSchema({ ...moduleSchema, nodeId: targetNodeId });
                setIsFormOpen(true);
            }
        }
    }, [nodes]);



    const checkForCircularDependency = (source: string, target: string): boolean => {
        // Example of a simple circular check:
        const graph = buildGraphFromEdges(edges);
        return hasCycle(graph, source, target);
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


    const buildGraphFromEdges = (edges: any[]) => {
        const graph: { [key: string]: string[] } = {};
        edges.forEach(edge => {
            if (!graph[edge.source]) graph[edge.source] = [];
            graph[edge.source].push(edge.target);
        });
        return graph;
    };

    const hasCycle = (graph: any, startNode: string, targetNode: string): boolean => {
        const visited = new Set<string>();
        const stack = [startNode];
        while (stack.length > 0) {
            const currentNode = stack.pop()!;
            if (currentNode === targetNode) {
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


    const handleDebugToggle = useCallback((nodeId: string, title: string) => {
        setDebuggedNodes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(nodeId)) {
                newSet.delete(nodeId);
                setDebuggedNodesList(list => list.filter(item => item.id !== nodeId));
            } else {
                newSet.add(nodeId);
                setDebuggedNodesList(list => [...list, { id: nodeId, title }]);
            }
            return newSet;
        });
    }, []);

    const handleSourceUpdate = useCallback(({ nodeId, sourceData }: { nodeId: string, sourceData: any }) => {
        setNodes(prevNodes =>
            prevNodes.map(node => {
                if (node.id === nodeId) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            label: sourceData.data.label,
                            source: sourceData.data.source,
                        }
                    };
                }
                return node;
            })
        );
        dispatch(setUnsavedChanges());
    }, [setNodes, dispatch]);

    // Update memoizedNodeTypes to include debug props
    const memoizedNodeTypes = useMemo(() => ({
        custom: (props: any) => (
            <CustomNode
                {...props}
                setNodes={setNodes}
                setSelectedSchema={setSelectedSchema}
                setFormStates={setFormStates}
                setIsFormOpen={setIsFormOpen}
                formStates={formStates}
                setRunDialogOpen={setRunDialogOpen}
                setSelectedFormState={setSelectedFormState}
                onDebugToggle={handleDebugToggle}
                debuggedNodes={debuggedNodes}
                handleRunClick={handleRun}
                onSourceUpdate={handleSourceUpdate}
            />
        )
    }), [setNodes, setSelectedSchema, setFormStates, setIsFormOpen, formStates,
        setRunDialogOpen, setSelectedFormState, handleDebugToggle, debuggedNodes, handleSourceUpdate]);



    const handleCenter = useCallback(() => {
        try {
            fitView({ duration: 800, padding: 0.1 });
        } catch (error) {
            console.error('FitView error:', error);
        }
    }, [fitView]);

    // Add new function for zoom in
    const handleZoomIn = useCallback(() => {
        zoomIn({ duration: 800 });
    }, [zoomIn]);

    // Add new function for zoom out
    const handleZoomOut = useCallback(() => {
        zoomOut({ duration: 800 });
    }, [zoomOut]);

    const handleRun = useCallback(async () => {
        try {
            setIsPipelineRunning(true);

            // Call handleRunClick to get the pipeline configuration
            const pipelineConfig = handleRunClick(new Event('click') as any);

            const params = new URLSearchParams({
                pipeline_name: 'sample',
                pipeline_json: JSON.stringify(pipelineConfig), // Use the actual config object
                mode: 'DEBUG',
            });

            debuggedNodesList.forEach(checkpoint => {
                params.append('checkpoints', checkpoint?.title);
            });

            const response = await ApiService(
                "8011",
                "post",
                `/pipeline/debug/start_pipeline?${params.toString()}`,
                null
            );

            if (response.error) {
                throw new Error(response.error);
            }

            const countsResponse = await ApiService(
                "8011",
                "get",
                `/pipeline/debug/get_transformation_count`,
                null,
                { pipeline_name: 'sample' }
            );

            if (countsResponse.error) {
                throw new Error(countsResponse.error);
            }

            if (countsResponse.transformationOutputCounts) {
                setTransformationCounts(countsResponse.transformationOutputCounts);
            }
        } catch (error) {
            console.error('Error starting pipeline:', error);
        }
    }, [handleRunClick, debuggedNodesList]);

    const handleStop = useCallback(async () => {
        const response = await ApiService(
            "8011",
            "post",
            `/pipeline/debug/stop_pipeline`,
            null, { pipeline_name: 'sample' }
        );
        console.log(response)
        if (response.message) {
            setIsPipelineRunning(false);
            console.log('Stop pipeline clicked');
        }

    }, []);
    const handleNext = useCallback(async () => {
        try {
            console.log('Next pipeline clicked');
            const result = await ApiService(
                "8011",
                "post",
                `/pipeline/run-next-checkpoint`,
                null,
                { pipeline_name: 'sample' }
            );

            // Only proceed if first API call was successful
            if (result && !result.error) {
                const countsResponse = await ApiService(
                    "8011",
                    "get",
                    `/pipeline/debug/get_transformation_count`,
                    null,
                    { pipeline_name: 'sample' }
                );

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
    }, []);

    const edgeTypes = useMemo(() => ({
        default: (props: any) => (
            <CustomEdge {...props} transformationCounts={transformationCounts} />
        )
    }), [transformationCounts]);

    // Add defaultViewport configuration
    const defaultViewport = { x: 0, y: 0, zoom: 0.7 }; // Adjust zoom value as needed (0.7 = 70% zoom)

    const addNodeToHistory = useCallback(() => {
        setHistory((prev) => [...prev, { nodes, edges }]);
        setRedoStack([]); // Clear redo stack on new action
    }, [nodes, edges]);

    const handleCut = useCallback(() => {
        addNodeToHistory();
        setNodes((nds) => nds.filter((node) => !node.selected));
        setEdges((eds) => eds.filter((edge) => !edge.selected));
    }, [nodes, edges, addNodeToHistory]);

    const handleRedo = useCallback(() => {
        if (redoStack.length > 0) {
            const lastState = redoStack[redoStack.length - 1];
            setRedoStack((prev) => prev.slice(0, -1));
            setHistory((prev) => [...prev, { nodes, edges }]);
            setNodes(lastState.nodes);
            setEdges(lastState.edges);
        }
    }, [redoStack, nodes, edges]);

    const handleUndo = useCallback(() => {
        if (history.length > 0) {
            const lastState = history[history.length - 1];
            setHistory((prev) => prev.slice(0, -1));
            setRedoStack((prev) => [...prev, { nodes, edges }]);
            setNodes(lastState.nodes);
            setEdges(lastState.edges);
        }
    }, [history, nodes, edges]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.ctrlKey && event.key === 'x') {
                handleCut();
            } else if (event.ctrlKey && event.key === 'y') {
                handleRedo();
            } else if (event.ctrlKey && event.key === 'z') {
                handleUndo();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleCut, handleRedo, handleUndo]);

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (saveStatus.hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
                return e.returnValue;
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [saveStatus.hasUnsavedChanges]);

    useEffect(() => {
        // Handle browser back button
        const handlePopState = (event: PopStateEvent) => {
            if (saveStatus.hasUnsavedChanges) {
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
    }, [saveStatus.hasUnsavedChanges, location.pathname]);

    const handleLeavePage = useCallback(async () => {
        try {
            dispatch(setSaving());
            const pipeline_json = {
                pipeline_json: {
                    nodes: nodes,
                    edges: edges
                }
            };
            await ApiService("8011", "patch", `/pipeline/${id}`, pipeline_json);
            dispatch(setSaved());
            dispatch(setUnsavedChanges());
            setShowLeavePrompt(false);

            navigate("/designers/build-datapipeline/", { replace: true });

        } catch (error) {
            console.error('Error saving pipeline state:', error);
            dispatch(setSaveError());
            setShowLeavePrompt(false);
            navigate("/designers/build-datapipeline/", { replace: true });
        }
    }, [nodes, edges, id, dispatch, navigate]);

    return (
        <div>

            <div className="p-1 ml-8">
                {debuggedNodesList.length > 0 && (
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
                <div style={{ height: '69vh', width: '100%', }}>
                    <ReactFlow
                        nodes={nodes || []}
                        edges={edges || []}
                        onNodesChange={handleNodesChange}
                        onEdgesChange={handleEdgesChange}
                        onConnect={onConnect}
                        nodeTypes={memoizedNodeTypes}
                        edgeTypes={edgeTypes}
                        onError={onError}
                        defaultViewport={defaultViewport}
                        minZoom={0.2}  // Minimum zoom level
                        maxZoom={1.5}  // Maximum zoom level
                        fitView
                        fitViewOptions={{ padding: 0.2, maxZoom: 0.8 }} // Adjust fitView zoom
                        proOptions={{ hideAttribution: true }}
                    />
                </div>
                <div className="flex items-center justify-end gap-4 mt-4">
                    <FlowControls
                        onZoomIn={handleZoomIn}
                        onZoomOut={handleZoomOut}
                        onCenter={handleCenter}
                        handleRunClick={handleRun}
                        onStop={handleStop}
                        onNext={handleNext}
                        isPipelineRunning={isPipelineRunning}
                        isLoading={false}
                        pipelineConfig={handleRunClick}
                    />
                </div>

                <Dialog
                    open={isFormOpen}
                    onClose={handleDialogClose}
                    maxWidth={false}
                >
                    <DialogContent sx={{ width: '1000px' }}>
                        {selectedSchema && (
                            <CreateFormFormik
                                schema={selectedSchema}
                                onSubmit={handleFormSubmit}
                                initialValues={formStates[selectedSchema.nodeId]}
                            />
                        )}
                    </DialogContent>
                </Dialog>

                <Dialog
                    open={runDialogOpen}
                    onClose={() => setRunDialogOpen(false)}
                    maxWidth={false}
                >
                    <DialogContent sx={{ width: '800px' }}>
                        <pre className="whitespace-pre-wrap bg-gray-100 p-4 rounded">
                            {JSON.stringify(selectedFormState, null, 2)}
                        </pre>
                    </DialogContent>
                    <DialogActions>
                        <Button sx={{ backgroundColor: '#000', color: 'white', textTransform: 'none' }} onClick={() => setRunDialogOpen(false)}>Execute</Button>
                    </DialogActions>
                </Dialog>

                <Dialog
                    open={showLeavePrompt}
                    onClose={handleLeavePage}
                    PaperProps={{
                        sx: {
                            borderRadius: '12px',
                            padding: '8px',
                            maxWidth: '450px',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                        }
                    }}
                >
                    <DialogContent sx={{ padding: '24px' }}>
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
                                    fullWidth
                                    onClick={() => setShowLeavePrompt(false)}
                                    sx={{
                                        textTransform: 'none',
                                        borderRadius: '8px',
                                        padding: '10px',
                                        backgroundColor: '#f3f4f6',
                                        color: '#374151',
                                        '&:hover': {
                                            backgroundColor: '#e5e7eb'
                                        }
                                    }}
                                >
                                    Stay
                                </Button>
                                <Button
                                    fullWidth
                                    onClick={handleLeavePage}
                                    sx={{
                                        textTransform: 'none',
                                        borderRadius: '8px',
                                        padding: '10px',
                                        backgroundColor: '#dc2626',
                                        color: 'white',
                                        '&:hover': {
                                            backgroundColor: '#b91c1c'
                                        }
                                    }}
                                >
                                    Leave Page
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

// 4. Add error boundary wrapper

// Wrap the exported component with both providers
export default React.memo(() => (
    <ErrorBoundary>
        <ReactFlowProvider>
            <BuildPlayGround />
        </ReactFlowProvider>
    </ErrorBoundary>
));