import React, { useCallback, useMemo, useState } from 'react';
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

    const onError = useCallback((id: string) => {
        console.error('Flow Error:', id);
    }, []);

    const handleNodeClick = useCallback((node: Node) => {
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

        const newNode = {
            id: uniqueId,
            type: 'custom',
            position,
            data: {
                label: `${node.ui_properties.module_name}`,
                icon: node.ui_properties.icon,
                ports: node.ui_properties.ports
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

    return (
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
                <NodeDropList filteredNodes={filteredNodes} handleNodeClick={handleNodeClick} />

            </div>
            <div style={{ height: '69vh', width: '100%', }}>
                <ReactFlow
                    nodes={nodes || []}
                    edges={edges || []}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
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
                    onRun={handleRun}
                    onStop={handleStop}
                    onNext={handleNext}
                    isPipelineRunning={isPipelineRunning}
                    isLoading={false}
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

// 4. Add error boundary wrapper
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Flow Error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return <div>Something went wrong with the flow editor.</div>;
        }

        return this.props.children;
    }
}

// Wrap the exported component with both providers
export default React.memo(() => (
    <ErrorBoundary>
        <ReactFlowProvider>
            <BuildPlayGround />
        </ReactFlowProvider>
    </ErrorBoundary>
));