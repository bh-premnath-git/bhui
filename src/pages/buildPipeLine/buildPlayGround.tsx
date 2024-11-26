import React, {  useCallback, useMemo, useState } from 'react';
import ReactFlow, {
    useNodesState,
    useEdgesState,
    Connection,
    addEdge,
    useReactFlow,
    ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import nodeData from './node_display.json';
import schemaData from './mdata.json';
import { Button, Dialog, DialogActions, DialogContent, Menu, MenuItem } from '@mui/material';
import schemaValidation from './sample_validation.json';
import { ApiService } from '@/services/apiServices';
import { CustomEdge } from '@/components/BuildPipeLineComps/customEdge';
import { CustomNode } from '@/components/BuildPipeLineComps/CustomNode';
import { FlowControls } from './FlowControls';
import CreateFormFormik from '@/components/BuildPipeLineComps/CreateForm';

interface UIProperties {
    color: string;
    icon: string;
    module_name: string;
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

const AllNodes: React.FC = () => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedSchema, setSelectedSchema]: any = useState<Schema | null>(null);
    const [formStates, setFormStates] = useState<{ [key: string]: any }>({});
    const [runDialogOpen, setRunDialogOpen] = useState(false);
    const [selectedFormState, setSelectedFormState] = useState<any>(null);
    const [pipelineConfig, setPipelineConfig] = useState<any[]>([]);
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [nodeCounters, setNodeCounters] = useState<{ [key: string]: number }>({});
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const reactFlowInstance = useReactFlow();
    const { zoomIn, zoomOut, fitView } = useReactFlow();
    const [debuggedNodes, setDebuggedNodes] = useState<Set<string>>(new Set());
    const [debuggedNodesList, setDebuggedNodesList] = useState<Array<{ id: string, title: string }>>([]);
    const [isPipelineRunning, setIsPipelineRunning] = useState(false);
    const [transformationCounts, setTransformationCounts] = useState<Array<{ transformationName: string, rowCount: string }>>([]);

    const handleNodeClick = useCallback((node: Node) => {
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

        const newNode = {
            id: uniqueId,
            type: 'custom',
            position,
            data: {
                label: `${node.ui_properties.module_name}`,
                icon: node.ui_properties.icon,
            }
        };

        setNodes((prevNodes) => [...prevNodes, newNode]);

        setTimeout(() => {
            reactFlowInstance.fitView({ padding: 0.2, duration: 400 });
        }, 50);
    }, [nodes, setNodes, nodeCounters, reactFlowInstance]);

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


    const handleRunPipelineClick = useCallback(() => {
        // Helper function to perform topological sort
        const getOrderedNodes = (nodes: any[], edges: any[]): string[] => {
            const graph: { [key: string]: string[] } = {};
            const visited = new Set<string>();
            const ordered: string[] = [];

            // Build adjacency list
            nodes.forEach(node => {
                graph[node.id] = [];
            });
            edges.forEach(edge => {
                if (graph[edge.source]) {
                    graph[edge.source].push(edge.target);
                }
            });

            // DFS function for topological sort
            const visit = (nodeId: string) => {
                if (visited.has(nodeId)) return;
                visited.add(nodeId);

                // Visit all dependencies first
                if (graph[nodeId]) {
                    graph[nodeId].forEach(dependentId => visit(dependentId));
                }

                ordered.unshift(nodeId);
            };

            // Start DFS from each node
            nodes.forEach(node => {
                if (!visited.has(node.id)) {
                    visit(node.id);
                }
            });

            return ordered;
        };

        // Get ordered node IDs
        const orderedNodeIds = getOrderedNodes(nodes, edges);

        // Create pipeline steps in correct order
        const pipelineSteps = orderedNodeIds
            .map(nodeId => {
                const node = nodes.find(n => n.id === nodeId);
                const state = formStates[nodeId];
                if (!node || !state) return null;

                const incomingEdges = edges.filter(edge => edge.target === nodeId);
                const dependentOn = incomingEdges.map(edge => {
                    const sourceNode = nodes.find(n => n.id === edge.source);
                    return sourceNode ? `${sourceNode.data.label.toLowerCase()}_transformation` : null;
                }).filter(Boolean);

                return {
                    name: `${node.data.label.toLowerCase()}_transformation`,
                    dependent_on: dependentOn.length > 0 ? dependentOn : ['read_input_data'],
                    transformation: node.data.label,
                    ...state
                };
            })
            .filter(Boolean);

        setPipelineConfig(pipelineSteps);
        setSelectedFormState(pipelineSteps);
        // setRunDialogOpen(true);
        // console.log(pipelineSteps)
        return pipelineSteps;
    }, [formStates, nodes, edges]);

    const filteredNodes = useMemo(() => nodeData.nodes, []);
    console.log(filteredNodes)

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

    const onConnect = useCallback((connection: Connection) => {
        if (checkConnectionExists(connection)) {
            return;
        }

        setEdges(eds => addEdge(connection, eds));
        handleNodeForm(connection.target!);
    }, [checkConnectionExists, handleNodeForm, setEdges]);

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
            />
        )
    }), [setNodes, setSelectedSchema, setFormStates, setIsFormOpen, formStates,
        setRunDialogOpen, setSelectedFormState, handleDebugToggle, debuggedNodes]);

    const handleMoreClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMoreClose = () => {
        setAnchorEl(null);
    };

    const handleCenter = useCallback(() => {
        fitView({ duration: 800, padding: 0.1 });
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
            const params = new URLSearchParams({
                pipeline_name: 'sample',
                pipeline_json: JSON.stringify(schemaValidation),
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
    }, [handleRunPipelineClick, debuggedNodes]);

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
        }
    }, []);

    const edgeTypes = useMemo(() => ({
        default: (props: any) => (
            <CustomEdge {...props} transformationCounts={transformationCounts} />
        )
    }), [transformationCounts]);

    return (
        <div className="p-6  mx-auto">
            {debuggedNodesList.length > 0 && (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
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
                {filteredNodes.slice(0, 8).map((node: Node) => (
                    <div
                        key={node.ui_properties.module_name}
                        onMouseEnter={() => setHoveredNode(node.ui_properties.module_name)}
                        onMouseLeave={() => setHoveredNode(null)}
                    >
                        <button
                            onClick={() => handleNodeClick(node)}
                            className="rounded text-white flex items-center transition-all duration-500 ease-in-out"
                            style={{
                                backgroundColor: node.ui_properties.color,
                                padding: hoveredNode === node.ui_properties.module_name ? '1px 5px' : '1px',
                            }}
                        >
                            {hoveredNode === node.ui_properties.module_name ? (
                                <div className="flex items-center transition-all duration-500 ease-in-out rounded-lg">
                                    <img
                                        src={node.ui_properties.icon}
                                        alt={node.ui_properties.module_name}
                                        className="w-9 h-9"
                                    />
                                    <div className="ml-2 opacity-100 transition-opacity duration-500 ease-in-out text-sm">
                                        {node.ui_properties.module_name}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center transition-all duration-300 rounded-lg ease-in-out">
                                    <img
                                        src={node.ui_properties.icon}
                                        alt={node.ui_properties.module_name}
                                        className="w-9 h-9 rounded"
                                    />
                                </div>
                            )}
                        </button>
                    </div>
                ))}

                {filteredNodes.length > 8 && (
                    <>
                        <button
                            onClick={handleMoreClick}
                            className="rounded"
                        >
                            <img src="/assets/buildPipeline/add.svg" alt="" />
                        </button>

                        <Menu elevation={1}
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleMoreClose}
                        >
                            {filteredNodes.slice(8).map((node: Node) => (
                                <MenuItem
                                    key={node.ui_properties.module_name}
                                    onClick={() => {
                                        handleNodeClick(node);
                                        handleMoreClose();
                                    }}
                                    sx={{
                                        width: '300px',  // Increased width
                                        padding: '12px 16px' // More padding for elegance
                                    }}
                                >
                                    <div className="flex items-center w-full">
                                        <img
                                            src={node.ui_properties.icon}
                                            alt={node.ui_properties.module_name}
                                            className="w-9 h-9"
                                        />
                                        <div className="mx-4 flex flex-col justify-between h-8 relative">
                                            <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
                                            <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-gray-200 -translate-x-1/2"></div>
                                            <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
                                        </div>
                                        <span className="text-gray-700">{node.ui_properties.module_name}</span>
                                    </div>
                                </MenuItem>
                            ))}
                        </Menu>
                    </>
                )}
            </div>
            <div style={{ height: '72vh', width: '100%', }}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    nodeTypes={memoizedNodeTypes}
                    edgeTypes={edgeTypes}
                    fitView
                    proOptions={{ hideAttribution: true }}

                >
                    
                </ReactFlow>
            </div>
            <div className="flex items-center justify-end gap-4 mt-4">
                {/* <button
                    onClick={handleRunPipelineClick}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    disabled={Object.keys(formStates).filter(key => formStates[key] !== null).length === 0}
                >
                    Run Pipeline
                </button> */}
                <FlowControls
                    onZoomIn={handleZoomIn}
                    onZoomOut={handleZoomOut}
                    onCenter={handleCenter}
                    // onFit={handleFit}
                    onRun={handleRun}
                    onStop={handleStop}
                    onNext={handleNext}
                    isPipelineRunning={isPipelineRunning}
                />
            </div>

            <Dialog
                open={isFormOpen}
                onClose={handleDialogClose}
                maxWidth={false}
            >
                <DialogContent sx={{ width: '800px' }}>
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
        </div>
    );
};

// Wrap the exported component with ReactFlowProvider
export default React.memo(() => (
    <ReactFlowProvider>
        <AllNodes />
    </ReactFlowProvider>
));