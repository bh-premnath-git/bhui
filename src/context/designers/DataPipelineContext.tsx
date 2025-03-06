// import React, {
//     createContext,
//     useState,
//     useCallback,
//     useEffect,
//     useMemo
// } from 'react';
// import { convertPipelineToUIJson, convertUIToPipelineJson, usePipelineQuery, useUpdatePipelineMutation, useTransformationCountQuery } from '@/lib/pipelineJsonConverter';
// import { CATALOG_API_PORT } from '@/config/platformenv';
// import {
//     useNodesState,
//     useEdgesState,
//     useReactFlow,
//     Connection,
//     addEdge
// } from 'reactflow';
// import { useDispatch, useSelector } from 'react-redux';
// import {
//     setSaving,
//     setSaved,
//     setSaveError,
//     setUnsavedChanges,
//     setPipeLineName
// } from '@/store/slices/designer/features/autoSaveSlice';
// import { useParams, useNavigate } from 'react-router-dom';
// import schemaData from '@/pages/designers/data-pipeline/data/mdata.json';
// import axios from 'axios';

// // API client setup
// const apiClient = axios.create({
//     baseURL: `http://localhost:${CATALOG_API_PORT}`
// });

// interface PipelineContextProps {
//     nodes: any;
//     setNodes: React.Dispatch<React.SetStateAction<any>>;
//     onNodesChange: (changes: any) => void;
//     edges: any;
//     setEdges: React.Dispatch<React.SetStateAction<any>>;
//     onEdgesChange: (changes: any) => void;
//     reactFlowInstance: any;
//     nodeCounters: { [key: string]: number };
//     setNodeCounters: React.Dispatch<React.SetStateAction<{ [key: string]: number }>>;
//     debuggedNodes: Set<string>;
//     setDebuggedNodes: React.Dispatch<React.SetStateAction<Set<string>>>;
//     debuggedNodesList: Array<{ id: string; title: string }>;
//     setDebuggedNodesList: React.Dispatch<React.SetStateAction<Array<{ id: string; title: string }>>>;
//     isPipelineRunning: boolean;
//     setIsPipelineRunning: React.Dispatch<React.SetStateAction<boolean>>;
//     transformationCounts: Array<{ transformationName: string; rowCount: string }>;
//     setTransformationCounts: React.Dispatch<React.SetStateAction<Array<{ transformationName: string; rowCount: string }>>>;
//     pipelineDtl: any;
//     setPipelineDtl: React.Dispatch<React.SetStateAction<any>>;
//     formStates: { [key: string]: any };
//     setFormStates: React.Dispatch<React.SetStateAction<{ [key: string]: any }>>;
//     sourceColumns: any;
//     setSourceColumns: React.Dispatch<React.SetStateAction<any>>;
//     searchTerm: string;
//     setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
//     searchResults: Array<{ id: string; label: string; title: string }>;
//     setSearchResults: React.Dispatch<React.SetStateAction<Array<{ id: string; label: string; title: string }>>>;
//     highlightedNodeId: string | null;
//     setHighlightedNodeId: React.Dispatch<React.SetStateAction<string | null>>;
//     copiedNodes: any;
//     setCopiedNodes: React.Dispatch<React.SetStateAction<any>>;
//     copiedEdges: any;
//     setCopiedEdges: React.Dispatch<React.SetStateAction<any>>;
//     copiedFormStates: { [key: string]: any };
//     setCopiedFormStates: React.Dispatch<React.SetStateAction<{ [key: string]: any }>>;
//     validationErrors: string | string[];
//     setValidationErrors: React.Dispatch<React.SetStateAction<string | string[]>>;
//     conversionLogs: Array<{ timestamp: string; message: string; level: 'info' | 'error' | 'warning' }>;
//     setConversionLogs: React.Dispatch<React.SetStateAction<Array<{ timestamp: string; message: string; level: 'info' | 'error' | 'warning' }>>>;
//     terminalLogs: Array<{ timestamp: string; message: string; level: 'info' | 'error' | 'warning' }>;
//     setTerminalLogs: React.Dispatch<React.SetStateAction<Array<{ timestamp: string; message: string; level: 'info' | 'error' | 'warning' }>>>;
//     showLogs: boolean;
//     setShowLogs: React.Dispatch<React.SetStateAction<boolean>>;
//     handleSearch: (term: string) => void;
//     handleSearchResultClick: (nodeId: string) => void;
//     handleNodeUpdate: (nodeId: string, updatedData: any) => void;
//     handleSourceUpdate: ({ nodeId, sourceData }: { nodeId: string; sourceData: any }) => void;
//     handleNodesChange: (changes: any) => void;
//     handleEdgesChange: (changes: any) => void;
//     handleFormSubmit: (data: any) => void;
//     handleDialogClose: () => void;
//     handleRunClick: (e: React.MouseEvent) => any;
//     handleNodeForm: (targetNodeId: string) => void;
//     onConnect: (connection: Connection) => void;
//     handleDebugToggle: (nodeId: string, title: string) => void;
//     handleRun: () => void;
//     handleStop: () => void;
//     handleNext: () => void;
//     fetchSourceColumns: (nodes: any) => void;
//     handleLeavePage: () => void;
//     getTransformationName: (moduleName: string) => string;
//     addNodeToHistory: () => void;
//     handleCopy: () => void;
//     handlePaste: () => void;
//     handleCut: () => void;
//     handleUndo: () => void;
//     handleRedo: () => void;
//     handleLogsClick: () => void;
//     selectedSchema: any;
//     setSelectedSchema: React.Dispatch<React.SetStateAction<any>>;
//     isFormOpen: boolean;
//     setIsFormOpen: React.Dispatch<React.SetStateAction<boolean>>;
//     handleNodeClick: (node: any, source: any) => void;

// }

// const PipelineContext = createContext({} as PipelineContextProps);

// export const PipelineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//     const [nodes, setNodes, onNodesChange] = useNodesState([]);
//     const [edges, setEdges, onEdgesChange] = useEdgesState([]);
//     const [nodeCounters, setNodeCounters] = useState<{ [key: string]: number }>({});
//     const reactFlowInstance = useReactFlow();
//     const [debuggedNodes, setDebuggedNodes] = useState<Set<string>>(new Set());
//     const [debuggedNodesList, setDebuggedNodesList] = useState<Array<{ id: string; title: string }>>([]);
//     const [isPipelineRunning, setIsPipelineRunning] = useState(false);
//     const [transformationCounts, setTransformationCounts] = useState<Array<{ transformationName: string; rowCount: string }>>([]);
//     const { id } = useParams();
//     const dispatch = useDispatch();
//     const saveStatus = useSelector((state: any) => state.autoSave);
//     const [history, setHistory] = useState<Array<{ nodes: any; edges: any }>>([]);
//     const [redoStack, setRedoStack] = useState<Array<{ nodes: any; edges: any }>>([]);
//     const [sourceColumns, setSourceColumns] = useState<any>([]);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [searchResults, setSearchResults] = useState<Array<{ id: string; label: string; title: string }>>([]);
//     const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null);
//     const [copiedNodes, setCopiedNodes] = useState<any>([]);
//     const [copiedEdges, setCopiedEdges] = useState<any>([]);
//     const [copiedFormStates, setCopiedFormStates] = useState<{ [key: string]: any }>({});
//     const [validationErrors, setValidationErrors] = useState<string | string[]>([]);
//     const [conversionLogs, setConversionLogs] = useState<Array<{ timestamp: string; message: string; level: 'info' | 'error' | 'warning' }>>([]);
//     const [terminalLogs, setTerminalLogs] = useState<Array<{ timestamp: string; message: string; level: 'info' | 'error' | 'warning' }>>([]);
//     const [showLogs, setShowLogs] = useState(false);
//     const [isFormOpen, setIsFormOpen] = useState(false);
//     const [pipelineDtl, setPipelineDtl] = useState<any>(null);
//     const [selectedSchema, setSelectedSchema] = useState<any | null>(null);
//     const [formStates, setFormStates] = useState<{ [key: string]: any }>({});
//     const [runDialogOpen, setRunDialogOpen] = useState(false);
//     const [selectedFormState, setSelectedFormState] = useState<any>(null);
//     const time = import.meta.env.VITE_AUTO_SAVE_TIME;
//     const autoSaveInterval = parseInt(time, 10) || 10000;
//     const navigate = useNavigate();
//     console.log("Id", id);

//     // Fetch pipeline details when id changes
//     const { data: pipelineData, isLoading: isPipelineLoading } = usePipelineQuery(id);
//     const updatePipeline = useUpdatePipelineMutation();

//     useEffect(() => {
//         const fetchPipelineDetails = async () => {
//             try {
//                 if (pipelineData) {
//                     setPipelineDtl(pipelineData);
//                     dispatch(setPipeLineName({ pipeLineName: pipelineData.pipeline_json.name }));

//                     if (pipelineData?.pipeline_json) {
//                         const uiJson = convertPipelineToUIJson(pipelineData.pipeline_json);
//                         const convertedJson = await uiJson;
//                         const nodesWithTitles = convertedJson.nodes.map((node: any) => {
//                             const matchingTransformation = pipelineData.pipeline_json.transformations.find(
//                                 (t: any) => t.title === node.data.title && t.name
//                             );
//                             if (matchingTransformation) {
//                                 return {
//                                     ...node,
//                                     data: {
//                                         ...node.data,
//                                         title: matchingTransformation.name,
//                                         transformationData: {
//                                             ...node.data.transformationData,
//                                             name: matchingTransformation.name
//                                         }
//                                     }
//                                 };
//                             }
//                             return node;
//                         });
//                         setNodes(nodesWithTitles);
//                         setEdges(convertedJson.edges);
//                         const initialFormStates: { [key: string]: any } = {};
//                         pipelineData.pipeline_json.transformations.forEach((transformation: any) => {
//                             const matchingNode = nodesWithTitles.find((node: any) =>
//                                 node.data.label === transformation.transformation &&
//                                 node.data.title === transformation.name
//                             );
//                             if (matchingNode?.id) {
//                                 switch (transformation.transformation) {
//                                     case 'Joiner':
//                                         initialFormStates[matchingNode.id] = {
//                                             conditions: transformation.conditions || [],
//                                             expressions: transformation.expressions || [],
//                                             advanced: transformation.advanced || [],
//                                             name: transformation.name
//                                         };
//                                         break;
//                                     case 'SchemaTransformation':
//                                         initialFormStates[matchingNode.id] = {
//                                             derived_fields: transformation.derived_fields || [],
//                                             name: transformation.name
//                                         };
//                                         break;
//                                     case 'Sorter':
//                                         initialFormStates[matchingNode.id] = {
//                                             sort_columns: transformation.sort_columns || [],
//                                             name: transformation.name
//                                         };
//                                         break;
//                                     case 'Aggregator':
//                                         initialFormStates[matchingNode.id] = {
//                                             group_by: transformation.group_by || [],
//                                             aggregate: transformation.aggregations || [],
//                                             pivot: transformation.pivot_by || [],
//                                             name: transformation.name
//                                         };
//                                         break;
//                                     case 'Filter':
//                                         initialFormStates[matchingNode.id] = {
//                                             condition: transformation.condition || '',
//                                             name: transformation.name
//                                         };
//                                         break;
//                                     case 'Repartition':
//                                         initialFormStates[matchingNode.id] = {
//                                             repartition_type: transformation.repartition_type || 'repartition',
//                                             repartition_value: transformation.repartition_value || '',
//                                             override_partition: transformation.override_partition || '',
//                                             repartition_expression: transformation.repartition_expression || [{
//                                                 expression: '',
//                                                 sort_order: '',
//                                                 order: 0
//                                             }],
//                                             limit: transformation.limit || '',
//                                             name: transformation.name
//                                         };
//                                         break;
//                                     case 'Lookup':
//                                         initialFormStates[matchingNode.id] = {
//                                             lookup_name: transformation.lookup_name || '',
//                                             lookup_table: transformation.lookup_table || '',
//                                             lookup_columns: transformation.lookup_columns || [{
//                                                 source_column: '',
//                                                 lookup_column: '',
//                                                 output_column: ''
//                                             }],
//                                             lookup_conditions: transformation.lookup_conditions || [{
//                                                 source_column: '',
//                                                 lookup_column: '',
//                                                 operator: '='
//                                             }],
//                                             broadcast_hint: transformation.broadcast_hint || false,
//                                             name: transformation.name
//                                         };
//                                         break;
//                                     case 'Dedup':
//                                         initialFormStates[matchingNode.id] = {
//                                             keep: transformation.keep || "any",
//                                             dedup_by: transformation.dedup_by || [],
//                                             order_by: transformation.order_by || [],
//                                             name: transformation.name
//                                         };
//                                         break;
//                                     case 'SequenceGenerator':
//                                         initialFormStates[matchingNode.id] = {
//                                             for_column_name: transformation.for_column_name || '',
//                                             order_by: transformation.order_by || [],
//                                             start_with: transformation.start_with || 1,
//                                             step: transformation.step || ''
//                                         };
//                                         break;
//                                     case 'Drop':
//                                         initialFormStates[matchingNode.id] = {
//                                             column_list: transformation.column_list || [],
//                                             pattern: transformation.pattern || '',
//                                             transformation: transformation.transformation || '',
//                                             name: transformation.name
//                                         };
//                                         break;
//                                     case 'Select':
//                                         initialFormStates[matchingNode.id] = {
//                                             column_list: (transformation.column_list || []).map((col: any) => ({
//                                                 name: col.name || '',
//                                                 expression: col.expression || ''
//                                             })),
//                                             transformation: transformation.transformation || '',
//                                             name: transformation.name
//                                         };
//                                         break;
//                                     default:
//                                         if (transformation.name) {
//                                             initialFormStates[matchingNode.id] = {
//                                                 ...transformation,
//                                                 name: transformation.name
//                                             };
//                                         }
//                                 }
//                             }
//                         });
//                         setFormStates(initialFormStates);
//                     }
//                 }
//             } catch (error) {
//                 console.error("Error processing pipeline details:", error);
//             }
//         };
//         fetchPipelineDetails();
//     }, [id, dispatch, pipelineData]);

//     // Auto-save effect
//     useEffect(() => {
//         const intervalId = setInterval(async () => {
//             if (saveStatus.hasUnsavedChanges) {
//                 try {
//                     dispatch(setSaving());
//                     const pipeline_json: any = convertUIToPipelineJson(nodes, edges, pipelineDtl);
//                     await updatePipeline.mutateAsync({ id, pipeline_json });
//                     dispatch(setPipeLineName({ pipeLineName: pipeline_json.pipeline_json.name }));
//                     dispatch(setSaved());
//                     setValidationErrors([]);
//                 } catch (error: any) {
//                     if (error.logs) {
//                         setConversionLogs(error.logs);
//                         setShowLogs(true);
//                     }
//                     if (error.message && error.message.includes('Pipeline is incomplete or broken:')) {
//                         const errorMessages = error.message.split('\n').slice(1);
//                         setValidationErrors(errorMessages);
//                     }
//                     console.error('Error saving pipeline state:', error);
//                     dispatch(setSaveError(error.message));
//                 }
//             }
//         }, autoSaveInterval);
//         return () => clearInterval(intervalId);
//     }, [nodes, edges, id, dispatch, saveStatus.hasUnsavedChanges, autoSaveInterval, pipelineDtl, updatePipeline]);

//     const handleNodeUpdate = useCallback((nodeId: string, updatedData: any) => {
//         setNodes(prevNodes =>
//             prevNodes.map(node => {
//                 if (node.id === nodeId) {
//                     return {
//                         ...node,
//                         data: {
//                             ...node.data,
//                             label: updatedData.data.label,
//                             source: updatedData.data.source,
//                             title: updatedData.data.title
//                         }
//                     };
//                 }
//                 return node;
//             })
//         );
//         dispatch(setUnsavedChanges());
//     }, [setNodes, dispatch]);

//     const handleSourceUpdate = useCallback(({ nodeId, sourceData }: { nodeId: string; sourceData: any }) => {
//         setNodes(prevNodes =>
//             prevNodes.map(node => {
//                 if (node.id === nodeId) {
//                     return {
//                         ...node,
//                         data: {
//                             ...node.data,
//                             label: sourceData.data.label,
//                             source: sourceData.data.source
//                         }
//                     };
//                 }
//                 return node;
//             })
//         );
//         dispatch(setUnsavedChanges());
//     }, [setNodes, dispatch]);

//     const handleNodesChange = useCallback((changes: any) => {
//         onNodesChange(changes);
//         dispatch(setUnsavedChanges());
//     }, [onNodesChange, dispatch]);

//     const handleEdgesChange = useCallback((changes: any) => {
//         onEdgesChange(changes);
//         dispatch(setUnsavedChanges());
//     }, [onEdgesChange, dispatch]);

//     const handleFormSubmit = useCallback((data: any) => {
//         if (selectedSchema?.nodeId) {
//             setFormStates((prev: any) => ({
//                 ...prev,
//                 [selectedSchema.nodeId]: data
//             }));
//             setNodes((nds) =>
//                 nds.map((node) => {
//                     if (node.id === selectedSchema.nodeId) {
//                         return {
//                             ...node,
//                             data: {
//                                 ...node.data,
//                                 transformationData: {
//                                     ...node.data.transformationData,
//                                     ...data,
//                                     name: data.name || node.data.title
//                                 }
//                             }
//                         };
//                     }
//                     return node;
//                 })
//             );
//         }
//         setIsFormOpen(false);
//     }, [selectedSchema, setNodes]);

//     const handleDialogClose = useCallback(() => {
//         setIsFormOpen(false);
//     }, []);

//     const handleRunClick = useCallback((e: React.MouseEvent) => {
//         e.stopPropagation();
//         const allNodes = reactFlowInstance.getNodes();
//         const sourceNodes = allNodes.filter(node =>
//             node.data.label.toLowerCase().includes("source") || node.data.source
//         );
//         const targetNodes = allNodes.filter(node =>
//             !edges.some(edge => edge.source === node.id)
//         );
//         const sources = sourceNodes.map(node => ({
//             name: node.data?.source?.data_src_name,
//             source_type: "File",
//             file_name: `${node.data.source?.file_path_prefix || "examples"}/${node.data.source?.file_name || "NaN"}`,
//             data_src_id: node.data.source?.data_src_id || "NaN",
//             connection: {
//                 name: node.data.source?.connection_name || "local_connection",
//                 connection_type: (node.data.source?.connection_type || "local").charAt(0).toUpperCase() +
//                     (node.data.source?.connection_type || "local").slice(1),
//                 file_path_prefix: `${node.data.source?.file_path_prefix || "examples"}/`
//             }
//         }));
//         const targets = targetNodes.map(node => ({
//             name: "output_data",
//             type: "File",
//             connection: {
//                 type: "File",
//                 file_path: "examples/output.csv"
//             },
//             load_mode: "overwrite"
//         }));

//         const getOrderedNodes = () => {
//             const orderedNodes: any[] = [];
//             const visited = new Set<string>();

//             const processNode = (nodeId: string) => {
//                 if (visited.has(nodeId)) return;
//                 visited.add(nodeId);

//                 const incomingEdges = edges.filter(edge => edge.target === nodeId);
//                 incomingEdges.forEach(edge => {
//                     if (!visited.has(edge.source)) {
//                         processNode(edge.source);
//                     }
//                 });
//                 const node = allNodes.find(n => n.id === nodeId);
//                 if (node) {
//                     orderedNodes.push(node);
//                 }
//             };

//             targetNodes.forEach(node => {
//                 processNode(node.id);
//             });

//             return orderedNodes;
//         };

//         const orderedNodes = getOrderedNodes();
//         const transformations = orderedNodes.map(node => {
//             const isTargetNode = !edges.some(edge => edge.source === node.id);
//             if (isTargetNode) {
//                 return null;
//             }

//             if (node.data.label.toLowerCase().includes("source") || node.data.source) {
//                 return {
//                     name: node?.data?.title,
//                     dependent_on: [],
//                     transformation: "Reader",
//                     source: {
//                         name: node.data?.source?.data_src_name || null,
//                         source_type: "File",
//                         file_name: node.data.source?.file_name || null,
//                         connection: {
//                             name: node.data.source?.custom_metadata?.source?.connection?.connection_name ||
//                                 (node.data.source?.connection_type ? node.data.source?.connection_type + "_connection" : "local_connection"),
//                             connection_type: (node.data.source?.connection_type || "local").charAt(0).toUpperCase() +
//                                 (node.data.source?.connection_type || "local").slice(1),
//                             file_path_prefix: node.data.source?.file_path_prefix || null
//                         }
//                     },
//                     read_options: {
//                         header: true
//                     }
//                 };
//             }

//             const moduleName = node.data?.title.split(' ')[0].toLowerCase();
//             const incomingEdges = edges.filter(edge => edge.target === node.id);
//             const dependentOn = incomingEdges.map(edge => {
//                 const sourceNode = allNodes.find(n => n.id === edge.source);
//                 if (sourceNode?.data?.source) {
//                     return sourceNode.data.title || sourceNode.data.source.data_src_name;
//                 } else if (sourceNode?.data?.label) {
//                     const modName = sourceNode.data.title.split(' ')[0].toLowerCase();
//                     return getTransformationName(modName);
//                 }
//                 return null;
//             }).filter(Boolean);

//             if (node.data.label === "Aggregator") {
//                 const formState = formStates[node.id] || {};
//                 return {
//                     name: getTransformationName(moduleName),
//                     dependent_on: dependentOn,
//                     transformation: node.data.label,
//                     group_by: formState.group_by?.map((g: any) => g.group_by) || [],
//                     aggregate: formState.aggregate || [],
//                     pivot: formState.pivot?.map((p: any) => ({
//                         pivot_column: p.pivot_column,
//                         pivot_values: (typeof p.pivot_values === 'string'
//                             ? p.pivot_values.split(',').map((v: string) => v.trim())
//                             : []) || []
//                     })) || []
//                 };
//             }

//             return {
//                 name: getTransformationName(moduleName),
//                 dependent_on: dependentOn,
//                 transformation: node.data.label,
//                 ...(formStates[node.id] || {})
//             };
//         }).filter(Boolean);

//         const pipelineConfig = {
//             "$schema": "https://json-schema.org/draft-07/schema#",
//             name: `${pipelineDtl?.pipeline_name || "sample_pipeline"}`,
//             description: `${pipelineDtl?.pipeline_description || " "}`,
//             version: "1.0",
//             mode: "DEBUG",
//             parameters: [],
//             sources,
//             targets,
//             transformations
//         };

//         setSelectedFormState(pipelineConfig);
//         return pipelineConfig;
//     }, [edges, formStates, reactFlowInstance, pipelineDtl]);

//     const handleNodeForm = useCallback((targetNodeId: string) => {
//         const targetNode = nodes.find(node => node.id === targetNodeId);
//         if (targetNode) {
//             const moduleName = targetNode.data.label.split(' ')[0];
//             const schemaArray = Array.isArray(schemaData) ? schemaData : Object.values(schemaData);
//             const moduleSchema = schemaArray.find((schema: any) => schema.title === moduleName);
//             if (moduleSchema) {
//                 const existingFormState = formStates[targetNodeId] ||
//                     Object.entries(formStates).find(([key]) =>
//                         key.toLowerCase().includes(moduleName.toLowerCase())
//                     )?.[1];
//                 setSelectedSchema({
//                     ...moduleSchema,
//                     nodeId: targetNodeId,
//                     initialValues: existingFormState
//                 });
//                 setIsFormOpen(true);
//             }
//         }
//     }, [nodes, formStates]);

//     const checkConnectionExists = useCallback((connection: Connection): boolean => {
//         return edges.some(edge => edge.source === connection.source && edge.target === connection.target);
//     }, [edges]);

//     const checkForCircularDependency = (source: string, target: string): boolean => {
//         const graph: { [key: string]: string[] } = {};
//         edges.forEach(edge => {
//             if (!graph[edge.source]) graph[edge.source] = [];
//             graph[edge.source].push(edge.target);
//         });
//         const visited = new Set<string>();
//         const stack = [source];
//         while (stack.length > 0) {
//             const currentNode = stack.pop()!;
//             if (currentNode === target) {
//                 return true;
//             }
//             visited.add(currentNode);
//             if (graph[currentNode]) {
//                 graph[currentNode].forEach(neighbor => {
//                     if (!visited.has(neighbor)) {
//                         stack.push(neighbor);
//                     }
//                 });
//             }
//         }
//         return false;
//     };

//     const onConnect = useCallback((connection: Connection) => {
//         if (checkConnectionExists(connection)) {
//             return;
//         }
//         const sourceNode = nodes.find(n => n.id === connection.source);
//         const targetNode = nodes.find(n => n.id === connection.target);
//         if (!sourceNode || !targetNode) return;
//         const targetInputs = edges.filter(e => e.target === connection.target).length;
//         const maxInputs = targetNode.data.ports?.maxInputs;
//         if (maxInputs !== "unlimited" && targetInputs >= maxInputs) {
//             console.warn("Maximum inputs reached for this node");
//             return;
//         }
//         const isCircular = checkForCircularDependency(connection.source!, connection.target!);
//         if (isCircular) {
//             console.error("Circular dependency detected, connection not added.");
//             return;
//         }
//         setEdges((eds: any) => addEdge(connection, eds));
//         handleNodeForm(connection.target!);
//     }, [checkConnectionExists, checkForCircularDependency, handleNodeForm, setEdges, nodes, edges]);

//     const handleDebugToggle = useCallback((nodeId: string, title: string) => {
//         setDebuggedNodes(prev => {
//             const newSet = new Set(prev);
//             if (newSet.has(nodeId)) {
//                 newSet.delete(nodeId);
//                 setDebuggedNodesList(list => list.filter(item => item.id !== nodeId));
//             } else {
//                 newSet.add(nodeId);
//                 setDebuggedNodesList(list => [...list, { id: nodeId, title }]);
//             }
//             return newSet;
//         });
//     }, []);

//     const handleRun = useCallback(async () => {
//         try {
//             setIsPipelineRunning(true);
//             setShowLogs(true);
//             setConversionLogs([{
//                 timestamp: new Date().toISOString(),
//                 message: 'Starting pipeline validation...',
//                 level: 'info'
//             }]);
//             setValidationErrors([]);
//             const validationResult: any = convertUIToPipelineJson(nodes, edges, pipelineDtl, true);
//             if (validationResult.logs) {
//                 setConversionLogs(prevLogs => [...prevLogs, ...validationResult.logs]);
//             }
//             if (!validationResult.isValid) {
//                 throw new Error(`Pipeline is incomplete or broken:\n${validationResult.errors.join('\n')}`);
//             }
//             const pipelineConfig = handleRunClick(new Event('click') as any);
//             const params = new URLSearchParams({
//                 pipeline_name: `${pipelineDtl?.pipeline_name || "sample_pipeline"}`,
//                 pipeline_json: JSON.stringify(pipelineConfig),
//                 mode: 'DEBUG',
//             });
//             debuggedNodesList.forEach(checkpoint => {
//                 params.append('checkpoints', checkpoint?.title?.toLowerCase());
//             });
//             setSelectedFormState(pipelineConfig);
//             setRunDialogOpen(true);
//             setConversionLogs(prevLogs => [...prevLogs, {
//                 timestamp: new Date().toISOString(),
//                 message: 'Pipeline validation successful. Starting execution...',
//                 level: 'info'
//             }]);
            
//             const { data: response } = await apiClient.post(
//                 `/pipeline/debug/start_pipeline?${params.toString()}`
//             );
            
//             if (response.error) {
//                 throw new Error(response.error);
//             }
//             if (response) {
//                 setConversionLogs(prevLogs => [...prevLogs, {
//                     timestamp: new Date().toISOString(),
//                     message: 'Pipeline started successfully. Streaming logs...',
//                     level: 'info'
//                 }]);
//                 const streamLogsInterval = setInterval(async () => {
//                     try {
//                         const { data: logsResponse } = await axios.get(
//                             `http://localhost:8011/api/v1/pipeline/stream-logs/${pipelineDtl?.pipeline_name || "sample"}`
//                         );
//                         if (logsResponse) {
//                             const newLogs = Array.isArray(logsResponse) ? logsResponse : [logsResponse];
//                             setTerminalLogs(prevLogs => [
//                                 ...prevLogs,
//                                 ...newLogs.map(log => ({
//                                     timestamp: new Date().toISOString(),
//                                     message: log.message || log,
//                                     level: log.level || 'info'
//                                 }))
//                             ]);
//                             if (logsResponse.some(log =>
//                                 log.message?.includes('Pipeline completed') ||
//                                 log.message?.includes('Pipeline failed') ||
//                                 log.level === 'error'
//                             )) {
//                                 clearInterval(streamLogsInterval);
//                                 setIsPipelineRunning(false);
//                             }
//                         }
//                     } catch (error) {
//                         console.error('Error streaming logs:', error);
//                         clearInterval(streamLogsInterval);
//                         setIsPipelineRunning(false);
//                     }
//                 }, 1000);
//                 return () => clearInterval(streamLogsInterval);
//             }

//             const { data: countsResponse } = await apiClient.get(
//                 `/pipeline/debug/get_transformation_count`,
//                 { params: { pipeline_name: `${pipelineDtl?.pipeline_name || "sample_pipeline"}` } }
//             );
            
//             if (countsResponse.error) {
//                 throw new Error(countsResponse.error);
//             }
//             if (countsResponse.transformationOutputCounts) {
//                 setTransformationCounts(countsResponse.transformationOutputCounts);
//             }
//         } catch (error: any) {
//             console.error('Error starting pipeline:', error);
//             setTerminalLogs(prevLogs => [...prevLogs, {
//                 timestamp: new Date().toISOString(),
//                 message: `Error: ${error.message}`,
//                 level: 'error'
//             }]);
//             if (error.message && error.message.includes('Pipeline is incomplete or broken:')) {
//                 const errorMessages = error.message.split('\n').slice(1);
//                 setValidationErrors(errorMessages);
//             }
//             dispatch(setSaveError(error.message));
//             setIsPipelineRunning(false);
//         }
//     }, [handleRunClick, debuggedNodesList, nodes, edges, pipelineDtl]);

//     const handleStop = useCallback(async () => {
//         try {
//             const { data: response } = await apiClient.post(
//                 `/pipeline/debug/stop_pipeline`,
//                 null,
//                 { params: { pipeline_name: `${pipelineDtl?.pipeline_name || "sample_pipeline"}` } }
//             );
//             if (response.message) {
//                 setIsPipelineRunning(false);
//             }
//         } catch (error) {
//             console.error('Error stopping pipeline:', error);
//         }
//     }, [pipelineDtl?.pipeline_name]);

//     const handleNext = useCallback(async () => {
//         try {
//             const { data: result } = await apiClient.post(
//                 `/pipeline/run-next-checkpoint`,
//                 null,
//                 { params: { pipeline_name: `${pipelineDtl?.pipeline_name || "sample_pipeline"}` } }
//             );
            
//             if (result && !result.error) {
//                 const { data: countsResponse } = await apiClient.get(
//                     `/pipeline/debug/get_transformation_count`,
//                     { params: { pipeline_name: `${pipelineDtl?.pipeline_name || "sample_pipeline"}` } }
//                 );
                
//                 if (countsResponse.error) {
//                     throw new Error(countsResponse.error);
//                 }
//                 if (countsResponse.transformationOutputCounts) {
//                     setTransformationCounts(countsResponse.transformationOutputCounts);
//                 }
//             } else {
//                 throw new Error(result.error || 'Failed to run next checkpoint');
//             }
//         } catch (error) {
//             console.error('Error in handleNext:', error);
//         }
//     }, [pipelineDtl?.pipeline_name]);

//     const getTransformationName = (moduleName: string): string => {
//         return moduleName.toLowerCase();
//     };

//     const fetchSourceColumns = useCallback(async (nodes: any) => {
//         try {
//             const sourceNodes = nodes.filter(node =>
//                 node.data.label.toLowerCase().includes("source") || node.data.source
//             );
//             const columnsPromises = sourceNodes.map(async (node: any) => {
//                 const dataSrcId = node.data.source?.data_src_id;
//                 if (!dataSrcId) return [];
//                 const { data: response } = await apiClient.get(
//                     `/data_source_layout/list_full/?data_src_id=${dataSrcId}`
//                 );
//                 return response?.layout_fields?.map((field: any) => ({
//                     name: field.lyt_fld_name,
//                     dataType: field.lyt_fld_data_type_cd
//                 })) || [];
//             });
//             const allColumns = (await Promise.all(columnsPromises)).flat();
//             setSourceColumns(allColumns);
//         } catch (error) {
//             console.error('Error fetching columns:', error);
//         }
//     }, []);

//     useEffect(() => {
//         fetchSourceColumns(nodes);
//     }, [nodes, fetchSourceColumns]);

//     const handleSearch = useCallback((term: string) => {
//         setSearchTerm(term);
//         if (!term.trim()) {
//             setSearchResults([]);
//             setHighlightedNodeId(null);
//             return;
//         }
//         const results = nodes.filter(node =>
//             node.data.label?.toLowerCase().includes(term.toLowerCase()) ||
//             node.data.title?.toLowerCase().includes(term.toLowerCase())
//         ).map(node => ({
//             id: node.id,
//             label: node.data.label,
//             title: node.data.title || node.data.label
//         }));
//         setSearchResults(results);
//     }, [nodes]);

//     const handleSearchResultClick = useCallback((nodeId: string) => {
//         setHighlightedNodeId(nodeId);
//         const node = nodes.find(n => n.id === nodeId);
//         if (node) {
//             reactFlowInstance.setCenter(
//                 node.position.x + 100,
//                 node.position.y + 100,
//                 { duration: 800 }
//             );
//         }
//     }, [nodes, reactFlowInstance]);

//     const handleLeavePage = useCallback(async () => {
//         try {
//             dispatch(setSaving());
//             const pipeline_json = convertUIToPipelineJson(nodes, edges, pipelineDtl);
//             await updatePipeline.mutateAsync({ id, pipeline_json });
//             dispatch(setSaved());
//             dispatch(setUnsavedChanges());
//             navigate("/designers/build-datapipeline/", { replace: true });
//         } catch (error: any) {
//             console.error('Error saving pipeline state:', error);
//             dispatch(setSaveError(error.message));
//             navigate("/designers/build-datapipeline/", { replace: true });
//         }
//     }, [nodes, edges, id, dispatch, navigate, pipelineDtl, updatePipeline]);

//     const addNodeToHistory = useCallback(() => {
//         setHistory(prev => [...prev, { nodes, edges }]);
//         setRedoStack([]);
//     }, [nodes, edges]);

//     const handleCopy = useCallback(() => {
//         const selectedNodes = nodes.filter(node => node.selected);
//         const selectedEdges = edges.filter(edge => {
//             const sourceNode = selectedNodes.find(node => node.id === edge.source);
//             const targetNode = selectedNodes.find(node => node.id === edge.target);
//             return sourceNode && targetNode;
//         });
//         const selectedFormStates = selectedNodes.reduce((acc: any, node: any) => {
//             if (formStates[node.id]) {
//                 acc[node.id] = formStates[node.id];
//             }
//             return acc;
//         }, {});
//         setCopiedNodes(selectedNodes);
//         setCopiedEdges(selectedEdges);
//         setCopiedFormStates(selectedFormStates);
//     }, [nodes, edges, formStates]);

//     const handlePaste = useCallback(() => {
//         if (copiedNodes.length === 0) return;
//         addNodeToHistory();
//         const idMapping: { [key: string]: string } = {};
//         const newNodes = copiedNodes.map((node: any) => {
//             const newId = `${node.id}_copy_${Date.now()}`;
//             idMapping[node.id] = newId;
//             return {
//                 ...node,
//                 id: newId,
//                 position: {
//                     x: node.position.x + 50,
//                     y: node.position.y + 50
//                 },
//                 selected: false
//             };
//         });
//         const newEdges = copiedEdges.map((edge: any) => ({
//             ...edge,
//             id: `${edge.id}_copy_${Date.now()}`,
//             source: idMapping[edge.source],
//             target: idMapping[edge.target],
//             selected: false
//         }));
//         const newFormStates: { [key: string]: any } = {};
//         Object.entries(copiedFormStates).forEach(([oldNodeId, formState]) => {
//             const newNodeId = idMapping[oldNodeId];
//             if (newNodeId) {
//                 newFormStates[newNodeId] = { ...formState };
//             }
//         });
//         setNodes(prevNodes => [...prevNodes, ...newNodes]);
//         setEdges(prevEdges => [...prevEdges, ...newEdges]);
//         setFormStates(prevFormStates => ({
//             ...prevFormStates,
//             ...newFormStates
//         }));
//         dispatch(setUnsavedChanges());
//     }, [copiedNodes, copiedEdges, copiedFormStates, addNodeToHistory, dispatch]);

//     const handleCut = useCallback(() => {
//         const selectedNodes = nodes.filter(node => node.selected);
//         const selectedEdges = edges.filter(edge => {
//             const sourceNode = selectedNodes.find(node => node.id === edge.source);
//             const targetNode = selectedNodes.find(node => node.id === edge.target);
//             return sourceNode && targetNode;
//         });
//         setCopiedNodes(selectedNodes);
//         setCopiedEdges(selectedEdges);
//         addNodeToHistory();
//         setNodes(nds => nds.filter(node => !node.selected));
//         setEdges(eds => eds.filter(edge => !edge.selected));
//         dispatch(setUnsavedChanges());
//     }, [nodes, edges, addNodeToHistory, dispatch]);

//     const handleRedo = useCallback(() => {
//         if (redoStack.length > 0) {
//             const lastState = redoStack[redoStack.length - 1];
//             setRedoStack(prev => prev.slice(0, -1));
//             setHistory(prev => [...prev, { nodes, edges }]);
//             setNodes(lastState.nodes);
//             setEdges(lastState.edges);
//         }
//     }, [redoStack, nodes, edges]);

//     const handleUndo = useCallback(() => {
//         if (history.length > 0) {
//             const lastState = history[history.length - 1];
//             setHistory(prev => prev.slice(0, -1));
//             setRedoStack(prev => [...prev, { nodes, edges }]);
//             setNodes(lastState.nodes);
//             setEdges(lastState.edges);
//         }
//     }, [history, nodes, edges]);

//     const handleLogsClick = useCallback(() => {
//         setShowLogs(prev => !prev);
//     }, []);

//     const handleNodeClick = useCallback((node: any, source: any) => {
//         if (!node?.ui_properties?.module_name) {
//             console.error('Invalid node data');
//             return;
//         }
//         const baseModuleName = node.ui_properties.module_name;
//         const existingNodes = nodes.filter(n =>
//             n.data.label.toLowerCase().startsWith(baseModuleName.toLowerCase())
//         );
//         const nodeNumber = existingNodes.length + 1;
//         const nodeLabel = existingNodes.length > 0 ? `${baseModuleName} ${nodeNumber}` : baseModuleName;
//         const lastNode = nodes[nodes.length - 1];
//         const basePosition = lastNode ? {
//             x: lastNode.position.x + 150,
//             y: lastNode.position.y
//         } : {
//             x: 50,
//             y: 100
//         };
//         const uniqueId = `${node.ui_properties.module_name}_${Date.now()}`;
//         const newNode = {
//             id: uniqueId,
//             type: 'custom',
//             position: basePosition,
//             data: {
//                 label: source?.data_src_name || baseModuleName,
//                 icon: node.ui_properties.icon,
//                 ports: node.ui_properties.ports,
//                 source: source,
//                 title: source?.data_src_name || nodeLabel,
//                 onUpdate: (updatedData: any) => handleNodeUpdate(uniqueId, updatedData)
//             }
//         };
//         setNodes(prevNodes => [...prevNodes, newNode]);
//         dispatch(setUnsavedChanges());
//         setTimeout(() => {
//             reactFlowInstance.fitView({ padding: 0.2, duration: 400 });
//         }, 50);
//     }, [nodes, setNodes, reactFlowInstance, dispatch, handleNodeUpdate]);

//     const value = useMemo(() => ({
//         nodes,
//         setNodes,
//         onNodesChange,
//         edges,
//         setEdges,
//         onEdgesChange,
//         reactFlowInstance,
//         nodeCounters,
//         setNodeCounters,
//         debuggedNodes,
//         setDebuggedNodes,
//         debuggedNodesList,
//         setDebuggedNodesList,
//         isPipelineRunning,
//         setIsPipelineRunning,
//         transformationCounts,
//         setTransformationCounts,
//         pipelineDtl,
//         setPipelineDtl,
//         formStates,
//         setFormStates,
//         sourceColumns,
//         setSourceColumns,
//         searchTerm,
//         setSearchTerm,
//         searchResults,
//         setSearchResults,
//         highlightedNodeId,
//         setHighlightedNodeId,
//         copiedNodes,
//         setCopiedNodes,
//         copiedEdges,
//         setCopiedEdges,
//         copiedFormStates,
//         setCopiedFormStates,
//         validationErrors,
//         setValidationErrors,
//         conversionLogs,
//         setConversionLogs,
//         terminalLogs,
//         setTerminalLogs,
//         showLogs,
//         setShowLogs,
//         handleSearch,
//         handleSearchResultClick,
//         handleNodeUpdate,
//         handleSourceUpdate,
//         handleNodesChange,
//         handleEdgesChange,
//         handleFormSubmit,
//         handleDialogClose,
//         handleRunClick,
//         handleNodeForm,
//         onConnect,
//         handleDebugToggle,
//         handleRun,
//         handleStop,
//         handleNext,
//         fetchSourceColumns,
//         handleLeavePage,
//         getTransformationName,
//         addNodeToHistory,
//         handleCopy,
//         handlePaste,
//         handleCut,
//         handleUndo,
//         handleRedo,
//         handleLogsClick,
//         selectedSchema,
//         setSelectedSchema,
//         isFormOpen,
//         setIsFormOpen,
//         handleNodeClick,
//     }), [
//         nodes,
//         setNodes,
//         onNodesChange,
//         edges,
//         setEdges,
//         onEdgesChange,
//         reactFlowInstance,
//         nodeCounters,
//         setNodeCounters,
//         debuggedNodes,
//         setDebuggedNodes,
//         debuggedNodesList,
//         setDebuggedNodesList,
//         isPipelineRunning,
//         setIsPipelineRunning,
//         transformationCounts,
//         setTransformationCounts,
//         pipelineDtl,
//         setPipelineDtl,
//         formStates,
//         setFormStates,
//         sourceColumns,
//         setSourceColumns,
//         searchTerm,
//         setSearchTerm,
//         searchResults,
//         setSearchResults,
//         highlightedNodeId,
//         setHighlightedNodeId,
//         copiedNodes,
//         setCopiedNodes,
//         copiedEdges,
//         setCopiedEdges,
//         copiedFormStates,
//         setCopiedFormStates,
//         validationErrors,
//         setValidationErrors,
//         conversionLogs,
//         setConversionLogs,
//         terminalLogs,
//         setTerminalLogs,
//         showLogs,
//         setShowLogs,
//         handleSearch,
//         handleSearchResultClick,
//         handleNodeUpdate,
//         handleSourceUpdate,
//         handleNodesChange,
//         handleEdgesChange,
//         handleFormSubmit,
//         handleDialogClose,
//         handleRunClick,
//         handleNodeForm,
//         onConnect,
//         handleDebugToggle,
//         handleRun,
//         handleStop,
//         handleNext,
//         fetchSourceColumns,
//         handleLeavePage,
//         getTransformationName,
//         addNodeToHistory,
//         handleCopy,
//         handlePaste,
//         handleCut,
//         handleUndo,
//         handleRedo,
//         handleLogsClick,
//         selectedSchema,
//         setSelectedSchema,
//         isFormOpen,
//         setIsFormOpen,
//         handleNodeClick
//     ]);

//     return (
//         <PipelineContext.Provider value={value}>
//             {children}
//         </PipelineContext.Provider>
//     );
// };

// export const usePipelineContext = () => {
//     const context = React.useContext(PipelineContext);
//     if (context === undefined) {
//         throw new Error('usePipelineContext must be used within a PipelineProvider');
//     }
//     return context;
// };
