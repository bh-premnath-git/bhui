import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactFlow, {
  Connection,
  addEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';

import { useNavigate, useLocation, useParams } from 'react-router-dom';
// import { usePipelineContext } from '@/context/designers/DataPipelineContext';
import { CustomNode } from '@/components/bh-reactflow-comps/builddata/CustomNode';
import { CustomEdge } from '@/components/bh-reactflow-comps/builddata/customEdge';
import { Terminal } from '@/components/bh-reactflow-comps/builddata/LogsPage';
// import { useAutoSave } from '@/hooks/useAutoSave';
// import { useForm } from '@/hooks/useForm';
import { FlowControls } from '@/features/designers/pipeline/components/FlowControls';
import NodesPanel from '@/features/designers/pipeline/components/NodesPanel';
// import DebugPanel from '@/features/designers/pipeline/components/DebugPanel';
import SearchPanel from '@/features/designers/pipeline/components/SearchPanel';
import ShortcutsInfoPanel from '@/features/designers/pipeline/components/ShortcutsInfoPanel';
import {
  checkConnectionExists,
  checkForCircularDependency,
} from '@/lib/graphUtils';
import { useDispatch, useSelector } from 'react-redux';
import { setPipelineJson, setPipeLineName, setSaved, setSaveError, setSaving, setUnsavedChanges } from '@/store/slices/designer/features/autoSaveSlice';
import { convertPipelineToUIJson } from '@/lib/pipelineJsonConverter';
import { getPipelineById, getTransformationCount, runNextCheckpoint, startPipeLine, stopPipeLine, updatePipeline } from '@/store/slices/designer/buildPipeLine/BuildPipeLineSlice';
import { RootState } from '@/store';
import { AppDispatch } from '@/store'; // Adjust the import based on your structure
import nodeData from '@/pages/designers/data-pipeline/data/node_display.json';
import schemaData from '@/pages/designers/data-pipeline/data/mdata.json';
import KeyboardShortcutsPanel from '@/features/designers/pipeline/components/ShortcutsInfoPanel';
import NodeDropList from '@/components/bh-reactflow-comps/builddata/NodeDropList';
import { LoaderCircle } from 'lucide-react';
// import CreateFormFormik from './pipeline/components/form-sections/CreateForm';
import { getInitialFormState } from '@/lib/transformationUtils';
import { convertUIToPipelineJson } from '@/lib/convertUIToPipelineJson';
import CreateFormFormik from './pipeline/components/form-sections/CreateForm';

const BuildPlayGround: React.FC = () => {
  const {pipelineDtl}=useSelector((state:RootState)=>state.buildPipeline)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSchema, setSelectedSchema]: any = useState<any | null>(null);
  const [formStates, setFormStates] = useState<{ [key: string]: any }>({});
  const [runDialogOpen, setRunDialogOpen] = useState(false);
  const [selectedFormState, setSelectedFormState] = useState<any>(null);
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
  const dispatch = useDispatch<AppDispatch>();
  const saveStatus = useSelector((state: any) => state.autoSave);
  const time = import.meta.env.VITE_AUTO_SAVE_TIME;
  const autoSaveInterval = parseInt(time, 10) || 10000;
  const [history, setHistory] = useState<{ nodes: any[], edges: any[] }[]>([]);
  const [redoStack, setRedoStack] = useState<{ nodes: any[], edges: any[] }[]>([]);
  const [showLeavePrompt, setShowLeavePrompt] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [sourceColumns, setSourceColumns] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ id: string, label: string, title: string }>>([]);
  const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null);
  const [copiedNodes, setCopiedNodes] = useState<any[]>([]);
  const [copiedEdges, setCopiedEdges] = useState<any[]>([]);
  const [copiedFormStates, setCopiedFormStates] = useState<{ [key: string]: any }>({});
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [conversionLogs, setConversionLogs] = useState<Array<{ timestamp: string; message: string; level: 'info' | 'error' | 'warning' }>>([]);
  const [terminalLogs, setTerminalLogs] = useState<Array<{ timestamp: string; message: string; level: 'info' | 'error' | 'warning' }>>([]);
  const [showLogs, setShowLogs] = useState(false);
  const ctrlDTimeout = useRef<NodeJS.Timeout | null>(null);
  const [isCanvasLoading, setIsCanvasLoading] = useState(false);

  const pipelineId = pipelineDtl?.pipeline_id;


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


  useEffect(() => {
      const fetchPipelineDetails = async () => {
          try {
              
              let response=dispatch(getPipelineById({id:id})).unwrap()
              console.log(response.pipeline_json)
              dispatch(setPipeLineName({pipeLineName:response?.pipeline_json?.name}))
              dispatch(setPipelineJson({pipelineJson:response?.pipeline_json}))
              console.log(response)
              if (response?.pipeline_json) {
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
              }
          } catch (error) {
              console.error("Error fetching pipeline details:", error);
          }
      };

      fetchPipelineDetails();
  }, [id]);

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
          if (saveStatus.hasUnsavedChanges) {
              try {
                  dispatch(setSaving());
                  const pipeline_json:any = convertUIToPipelineJson(nodes, edges, pipelineDtl);
                  if (id) {
                      dispatch(updatePipeline({ id: id, data: pipeline_json }));
                      console.log(pipeline_json,"pipeline_json")
                      dispatch(setPipeLineName({pipeLineName:pipeline_json.pipeline_json.name}));
                      dispatch(setPipelineJson({pipelineJson:pipeline_json.pipeline_json}));
                      dispatch(setSaved());
                      console.log(pipeline_json)
                      // Clear any existing validation errors
                      setValidationErrors([]);
                      console.log(pipeline_json.pipeline_json.name)
                  } else {
                      console.error("Pipeline ID is not defined.");
                  }
              } catch (error) {
                  if (error.logs) {
                      // Show the logs in the terminal
                      setConversionLogs(error.logs);
                      setShowLogs(true);
                  }
                  if (error.message.includes('Pipeline is incomplete or broken:')) {
                      const errorMessages = error.message.split('\n').slice(1);
                      setValidationErrors(errorMessages);
                  }
                  console.error('Error saving pipeline state:', error);
                  dispatch(setSaveError(error.message));
              }
          }
      }, autoSaveInterval);

      return () => clearInterval(intervalId);
  }, [nodes, edges, id, dispatch, saveStatus.hasUnsavedChanges, autoSaveInterval, pipelineDtl, pipelineId]);

  const onError = useCallback((id: string) => {
      // console.log('Flow Error:', id);
  }, []);

  const handleNodeUpdate =  useCallback(async(nodeId: string, updatedData: any) => {
      console.log(updatedData)
      setNodes(prevNodes =>
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
      
  }, [setNodes, dispatch]);

  // const handleNodeClick = useCallback((event: any, node: any) => {
  //     // Clear any previous highlight
  //     setHighlightedNodeId(null);

  //     // Set the new highlighted node
  //     setTimeout(() => {
  //         setHighlightedNodeId(node?.id);
  //         // Optional: Clear highlight after some time
  //         setTimeout(() => setHighlightedNodeId(null), 2000);
  //     }, 0);
  // }, []);

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

      setNodes((prevNodes) => [...prevNodes, newNode]);
      dispatch(setUnsavedChanges());

      setTimeout(() => {
          reactFlowInstance.fitView({ padding: 0.2, duration: 400 });
      }, 50);
  }, [nodes, setNodes, reactFlowInstance, dispatch, handleNodeUpdate]);

  const handleFormSubmit = useCallback((data: any) => {
      console.log('Form data:', data);
      if (selectedSchema?.nodeId) {
          // Update form states
          setFormStates((prev: any) => ({
              ...prev,
              [selectedSchema.nodeId]: data
          }));

          // Update node data with transformation data
          setNodes((nds) =>
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
  }, [selectedSchema, setNodes]);

  const handleDialogClose = useCallback(() => {
      setIsFormOpen(false);
  }, []);

  const handleRunClick = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      const allNodes = reactFlowInstance.getNodes();
      console.log(allNodes)
      const sourceNodes = allNodes.filter(node =>
          node.data.label.toLowerCase().includes("source") || node.data.source
      );
      const targetNodes = allNodes.filter(node =>
          !edges.some(edge => edge.source === node.id)
      );
      console.log(sourceNodes)
      const sources = sourceNodes.map(node => ({
          name: node.data?.source?.data_src_name ?? node.data?.source?.name,
          source_type: "File",
          file_name: `${node.data.source?.file_name}`,
          data_src_id: node.data.source?.data_src_id || "NaN",
          connection: {
              name: node.data.source?.connection_name || "local_connection",
              connection_type: (node.data.source?.connection_type || "local").charAt(0).toUpperCase() +
                  (node.data.source?.connection_type || "local").slice(1),
              file_path_prefix: `${node.data.source?.file_path_prefix }`
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
      console.log(orderedNodes)
      const transformations = orderedNodes.map(node => {
          const isTargetNode = !edges.some(edge => edge.source === node.id);
          if (isTargetNode) {
              return null;
          }

          if (node.data.label.toLowerCase().includes("source") || node.data.source) {
              console.log(node.data)

              return {
                  name: node?.data?.title,
                  dependent_on: [],
                  transformation: "Reader",
                  source: {
                      name: node.data?.source?.data_src_name || null,
                      source_type: "File",
                      file_name: node.data.source?.file_name || null,
                      connection: {
                          name: node.data.source?.custom_metadata?.source?.connection?.connection_name || node.data.source?.connection_type + "_connection" || "local_connection",
                          connection_type: (node.data.source?.connection_type || "local").charAt(0).toUpperCase() +
                              (node.data.source?.connection_type || "local").slice(1),
                          file_path_prefix: node.data.source?.file_path_prefix || null
                      }
                  },
                  read_options: {
                      header: true
                  }
              };
          }

          const moduleName = node.data?.title.split(' ')[0].toLowerCase();
          const incomingEdges = edges.filter(edge => edge.target === node.id);
          const dependentOn = incomingEdges.map(edge => {
              const sourceNode = allNodes.find(n => n.id === edge.source);
              if (sourceNode?.data?.source) {
                  return (sourceNode.data.title || sourceNode.data.source.data_src_name );
              } else if (sourceNode?.data?.label) {
                  const moduleName = sourceNode.data.title.split(' ')[0].toLowerCase();
                  console.log(moduleName);
                  return getTransformationName(moduleName);
              }
              return null;
          }).filter(Boolean);

          // Handle Aggregator transformation specifically
          if (node.data.label === "Aggregator") {
              const formState = formStates[node.id] || {};
              return {
                  name: getTransformationName(moduleName),
                  dependent_on: dependentOn,
                  transformation: node.data.label,
                  aggregate: formState.aggregate || [],
                  pivot: formState.pivot?.map(p => ({
                      pivot_column: p.pivot_column,
                      pivot_values: p.pivot_values?.split(',').map(v => v.trim()) || []
                  })) || []
              };
          }

          // Handle other transformations
          return {
              name: getTransformationName(moduleName),
              dependent_on: dependentOn,
              transformation: node.data.label,
              ...(formStates[node.id] || {})
          };
      }).filter(Boolean); // This will remove any null values (including skipped target nodes)

      const pipelineConfig = {
          "$schema": "https://json-schema.org/draft-07/schema#",
          name: `${pipelineDtl?.pipeline_name || "sample_pipeline"}`,
          description: `${pipelineDtl?.pipeline_description || " "}`,
          version: "1.0",
          mode: "DEBUG",
          parameters: [],
          sources,
          targets,
          transformations
      };

      console.log(nodes);
      console.log(edges)
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

  const handleSourceUpdate = useCallback(async({ nodeId, sourceData }: { nodeId: string, sourceData: any }) => {
      // debugger
      console.log(sourceData)
      setNodes(prevNodes =>
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
      dispatch(setUnsavedChanges());
     
  }, [setNodes, dispatch]);

  // Update memoizedNodeTypes to include debug props
  const memoizedNodeTypes = useMemo(() => ({
      custom: (props: any) => (
          <CustomNode
              {...props}
              pipelineDtl={pipelineDtl}
              setNodes={setNodes}
              setSelectedSchema={setSelectedSchema}
              setFormStates={setFormStates}
              setIsFormOpen={setIsFormOpen}
              formStates={formStates}
              setRunDialogOpen={setRunDialogOpen}
              setSelectedFormState={setSelectedFormState}
              onDebugToggle={handleDebugToggle}
              debuggedNodes={debuggedNodes}
              handleRunClick={handleRunClick}
              onSourceUpdate={handleSourceUpdate}
              handleSearchResultClick={handleSearchResultClick}
              
          />
      )
  }), [setNodes, setSelectedSchema, setFormStates, setIsFormOpen, formStates,
      setRunDialogOpen, setSelectedFormState, handleDebugToggle, debuggedNodes, handleSourceUpdate, pipelineDtl]);



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
          setIsCanvasLoading(true); // Start loading
          setIsPipelineRunning(true);
          setShowLogs(true);
          
          // Clear previous logs and errors
          setConversionLogs([{
              timestamp: new Date().toISOString(),
              message: 'Starting pipeline validation...',
              level: 'info'
          }]);
          setValidationErrors([]);

          // Perform validation first
          const validationResult:any = convertUIToPipelineJson(nodes, edges, pipelineDtl, true);
          
          // Always update logs with validation results
          if (validationResult.logs) {
              setConversionLogs(prevLogs => [...prevLogs, ...validationResult.logs]);
          }

          // If validation fails, throw error
          if (!validationResult.isValid) {
              throw new Error(`Pipeline is incomplete or broken:\n${validationResult.errors.join('\n')}`);
          }

          // If validation passes, get pipeline configuration
          // const pipelineConfig = handleRunClick(new Event('click') as any);
          const {pipeline_json}:any = convertUIToPipelineJson(nodes, edges, pipelineDtl);
          // Replace Target transformation with Writer before API call
          pipeline_json.transformations = pipeline_json.transformations.map(transform => {
              if (transform.transformation.toLowerCase() === "target") {
                  console.log(transform,"transform")
                  return {
                      ...transform,
                      transformation: "Writer"
                  };
              }
              return transform;
          });
          const params = new URLSearchParams({
              pipeline_name: `${pipelineDtl?.pipeline_name || "sample_pipeline"}`,
              pipeline_json: JSON.stringify(pipeline_json),
              mode: 'DEBUG',
          });

          debuggedNodesList.forEach(checkpoint => {
              params.append('checkpoints', checkpoint?.title);
          });

          setSelectedFormState(pipeline_json);
          setRunDialogOpen(true);

          // Add execution start log
          setConversionLogs(prevLogs => [...prevLogs, {
              timestamp: new Date().toISOString(),
              message: 'Pipeline validation successful. Starting execution...',
              level: 'info'
          }]);
          let response=await dispatch(startPipeLine({params:params})).unwrap();
          if (response.error) {
              throw new Error(response.error);
          }
          let countsResponse=await dispatch(getTransformationCount({params:pipelineDtl?.pipeline_name})).unwrap();
          if (countsResponse.error) {
              throw new Error(countsResponse.error);
          }
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

          dispatch(setSaveError(error.message));
          setIsPipelineRunning(false);
      } finally {
          setIsCanvasLoading(false); // End loading
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

  const edgeTypes = useMemo(() => ({
      default: (props: any) => (
          <CustomEdge {...props} transformationCounts={transformationCounts} pipelineDtl={pipelineDtl} debuggedNodesList={debuggedNodesList}/>
      )
  }), [transformationCounts]);

  // Add defaultViewport configuration
  const defaultViewport = { x: 0, y: 0, zoom: 0.7 }; // Adjust zoom value as needed (0.7 = 70% zoom)

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

      // Create new IDs for the pasted nodes
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

      // Update edges with new node IDs
      const newEdges = copiedEdges.map(edge => ({
          ...edge,
          id: `${edge.id}_copy_${Date.now()}`,
          source: idMapping[edge.source],
          target: idMapping[edge.target],
          selected: false
      }));

      // Create new form states for pasted nodes
      const newFormStates = {};
      Object.entries(copiedFormStates).forEach(([oldNodeId, formState]) => {
          const newNodeId = idMapping[oldNodeId];
          if (newNodeId) {
              newFormStates[newNodeId] = { ...formState };
          }
      });

      setNodes(prevNodes => [...prevNodes, ...newNodes]);
      setEdges(prevEdges => [...prevEdges, ...newEdges]);
      // Update form states with the copied states
      setFormStates(prevFormStates => ({
          ...prevFormStates,
          ...newFormStates
      })); 
      dispatch(setUnsavedChanges());
  }, [copiedNodes, copiedEdges, copiedFormStates, addNodeToHistory, setNodes, setEdges, setFormStates, dispatch]);

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
      setNodes(nds => nds.filter(node => !node.selected));
      setEdges(eds => eds.filter(edge => !edge.selected));
      dispatch(setUnsavedChanges());
  }, [nodes, edges, addNodeToHistory, setNodes, setEdges, dispatch]);

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

  const handleLogsClick = useCallback(() => {
      setShowLogs(prev => !prev);  // Toggle logs visibility
  }, []);

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

  useEffect(() => {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nodes, handleDebugToggle, handleCopy, handlePaste, handleCut, handleUndo, handleRedo, handleRun, handleStop, handleNext, handleZoomIn, handleZoomOut, handleLogsClick]);

  useEffect(() => {
      return () => {
          if (ctrlDTimeout.current) {
              clearTimeout(ctrlDTimeout.current);
          }
      };
  }, []);

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
          const pipeline_json = convertUIToPipelineJson(nodes, edges, pipelineDtl);
          if (pipelineId) {
            await dispatch(updatePipeline({ id: id, data: pipeline_json }));

              dispatch(setSaved());
              dispatch(setUnsavedChanges());
              setShowLeavePrompt(false);

              navigate("/designers/build-datapipeline/", { replace: true });
          } else {
              console.error("Pipeline ID is not defined.");
          }
      } catch (error) {
          console.error('Error saving pipeline state:', error);
          dispatch(setSaveError(error.message));
          setShowLeavePrompt(false);
          navigate("/designers/build-datapipeline/", { replace: true });
      }
  }, [nodes, edges, pipelineId, dispatch, navigate]);

  const getTransformationName = (moduleName: string): string => {
      const lowerModuleName = moduleName.toLowerCase();
      console.log(lowerModuleName);
      return `${lowerModuleName}`;
  };



  // Add this function to handle search
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

  // Add this function to handle result selection
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

  // Add keyboard shortcut info to the UI
  const keyboardShortcuts = [
      { key: 'Ctrl + C', action: 'Copy' },
      { key: 'Ctrl + V', action: 'Paste' },
      { key: 'Ctrl + X', action: 'Cut' },
      { key: 'Ctrl + Z', action: 'Undo' },
      { key: 'Ctrl + Y', action: 'Redo' },
      { key: 'Ctrl + F', action: 'Search' },
      { key: 'Ctrl + D', action: 'Add to Debug List' },
      { key: 'Ctrl + R', action: 'Run Pipeline' },
      { key: 'Ctrl + L', action: 'Open Logs' },
      { key: 'Ctrl + K', action: 'Stop Pipeline' },
      { key: 'Ctrl + N', action: 'Next Step' },
      { key: 'Ctrl + +', action: 'Zoom In' },
      { key: 'Ctrl + -', action: 'Zoom Out' },
  ];

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

      setNodes(newNodes);

      // Center the view
      setTimeout(() => {
          const centerX = startX + (maxLevel * levelWidth) / 2;
          const maxNodesInLevel = Math.max(...Array.from(nodesByLevel.values()).map(n => n.length));
          const centerY = startY + (maxNodesInLevel * nodeSpacing) / 2;
          reactFlowInstance.setCenter(centerX, centerY, { duration: 800 });
      }, 50);

      dispatch(setUnsavedChanges());
  }, [nodes, edges, setNodes, dispatch, reactFlowInstance]);

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

      setNodes(newNodes);

      // Center the view
      setTimeout(() => {
          const maxNodesInLevel = Math.max(...Array.from(nodesByLevel.values()).map(n => n.length));
          const centerX = startX + (maxNodesInLevel * nodeSpacing) / 2;
          const centerY = startY + (maxLevel * levelHeight) / 2;
          reactFlowInstance.setCenter(centerX, centerY, { duration: 800 });
      }, 50);

      dispatch(setUnsavedChanges());
  }, [nodes, edges, setNodes, dispatch, reactFlowInstance]);

  return (
      <div className="relative h-full">
          <div className="p-1 ml-8">
             
              {/* Add search component */}
              <div className="absolute top- -100 right-4 z-50">
                  <div className="relative">
                      <div className="relative">
                          <input
                              data-search-input
                              type="text"
                              value={searchTerm}
                              onChange={(e) => handleSearch(e.target.value)}
                              placeholder="Search nodes... (Ctrl+F)"
                              className="w-64 px-4 py-2 pr-10 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                          </div>
                      </div>

                      {/* Search Results Dropdown */}
                      {searchResults.length > 0 && searchTerm && (
                          <div className="absolute mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-100 max-h-60 overflow-y-auto">
                              {searchResults.map((result) => (
                                  <button
                                      key={result.id}
                                      onClick={() => handleSearchResultClick(result.id)}
                                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                                  >
                                      <div className="flex flex-col">
                                          <span className="font-medium text-gray-800">{result.title}</span>
                                          <span className="text-xs text-gray-500">{result.label}</span>
                                      </div>
                                  </button>
                              ))}
                          </div>
                      )}
                  </div>

                  {/* Add keyboard shortcuts info */}

              </div>
              <div className="absolute  mt-2 z-50">
  <div className=" rounded-lg  p-2 text-sm">
      <KeyboardShortcutsPanel keyboardShortcuts={keyboardShortcuts} />
  </div>
</div>
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
              <div style={{ height: '65vh', width: '100%', }}>
                  <ReactFlow
                      nodes={nodes.map(node => ({
                          ...node,
                          selected: node.selected || false,
                          style: {
                              ...node.style,
                              ...(highlightedNodeId === node.id && {
                                  background: 'linear-gradient(to right, rgba(59, 130, 246, 0.05), rgba(59, 130, 246, 0.1))',
                                  boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.3), 0 4px 12px rgba(59, 130, 246, 0.1)',
                                  borderRadius: '12px',
                                  padding: '4px',
                                  zIndex: 1000,
                                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                              })
                          }
                      }))}
                      edges={edges}
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
                      onAlignHorizontal={handleAlignHorizontal}
                      onAlignVertical={handleAlignVertical}
                      handleRunClick={handleRun}
                      onStop={handleStop}
                      onNext={handleNext}
                      isPipelineRunning={isPipelineRunning}
                      isLoading={isCanvasLoading}
                      pipelineConfig={handleRunClick}
                      terminalLogs={terminalLogs}
                      proplesLogs={conversionLogs}
                         
                  />
              </div>

              <Dialog
                  open={isFormOpen}
                  onOpenChange={handleDialogClose}
                  aria-modal="true"
              >
                  <DialogContent className="max-w-[60%]">
                      {selectedSchema && (
                          <CreateFormFormik
                              schema={selectedSchema}
                              sourceColumns={sourceColumns}
                              onClose={handleDialogClose}
                              currentNodeId={selectedSchema?.nodeId || ''}
                              initialValues={{
                                  ...formStates[selectedSchema?.nodeId],
                                  nodeId: selectedSchema?.nodeId // Add the nodeId to initialValues
                              }}
                              nodes={nodes}
                              edges={edges}
                              pipelineDtl={pipelineDtl}
                              onSubmit={handleFormSubmit}
                          />
                      )}
                  </DialogContent>
              </Dialog>



              <Dialog
                  open={showLeavePrompt}
                  onOpenChange={setShowLeavePrompt}
                  // onClose={handleLeavePage}
                  
              >
                  <DialogContent >
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
                                  onClick={() => setShowLeavePrompt(false)}
                                  
                              >
                                  Stay
                              </Button>
                              <Button
                                  onClick={handleLeavePage}
                                  
                              >
                                  Leave Page
                              </Button>
                          </div>
                      </div>
                  </DialogContent>
              </Dialog>

              {/* Add Terminal component */}
              <Terminal
                  isOpen={showLogs}
                  onClose={() => setShowLogs(false)}
                  title="Pipeline Validation Logs"
                  terminalLogs={terminalLogs}
                  proplesLogs={conversionLogs}
              />

              {/* Loading Overlay */}
              {isCanvasLoading && (
                  <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-50 flex items-center justify-center pointer-events-auto">
                      <div className="flex flex-col items-center gap-2">
                          <LoaderCircle size={40} />
                          <span className="text-sm text-gray-600 font-medium">Processing...</span>
                      </div>
                  </div>
              )}
          </div>
      </div>
  );
};

export default React.memo(BuildPlayGround);
