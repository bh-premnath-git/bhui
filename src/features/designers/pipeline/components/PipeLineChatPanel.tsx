import React, { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AIChatInput } from '@/components/shared/AIChatInput';
import { motion } from 'framer-motion';
import SuggestionButton from './SuggestionButton'; // Import the SuggestionButton
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { apiService } from '@/lib/api/api-service';
import { toast } from 'sonner';
import { ReaderOptionsForm } from '@/components/bh-reactflow-comps/builddata/ReaderOptionsForm';
import { usePipelineContext } from '@/context/designers/DataPipelineContext';
import nodeDisplayData from '@/pages/designers/data-pipeline/data/node_display.json';
import schemaData from '@/pages/designers/data-pipeline/data/mdata.json';
import { useAppDispatch } from '@/hooks/useRedux';
import { getConnectionConfigList } from '@/store/slices/dataCatalog/datasourceSlice';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import CreateFormFormik from './form-sections/CreateForm';
import TargetPopUp from '@/components/bh-reactflow-comps/TargetPopUp';
import { CATALOG_REMOTE_API_URL } from '@/config/platformenv';
import { setIsRightPanelOpen } from '@/store/slices/designer/buildPipeLine/BuildPipeLineSlice';
// No longer need these imports since we're using TargetPopUp directly

// Define the form schema based on Reader.json
const readerFormSchema = z.object({
  reader_name: z.string().min(1, { message: "Reader name is required" }),
  source_type: z.enum(["File", "Relational"]),
  // Additional fields that will be shown conditionally
  file_type: z.string().optional(),
  query: z.string().optional(),
});

type ReaderFormValues = z.infer<typeof readerFormSchema>;

// Define the type for suggestion buttons
type Suggestion = {
  text: string;
  onClick: () => void;
};

// Define the type for chat messages
type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  suggestions?: Suggestion[];
  formData?: {
    schema: any;
    sourceColumns: any[];
    currentNodeId: string;
    initialValues: any;
    isTarget?: boolean;
  };
};

const PipeLineChatPanel = () => {
  const dispatch = useAppDispatch();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [showReaderForm, setShowReaderForm] = useState(false);
  const [showReaderOptionsForm, setShowReaderOptionsForm] = useState(false);
  const [selectedSourceType, setSelectedSourceType] = useState<"File" | "Relational" | null>(null);
  const [readerNode, setReaderNode] = useState<any>(null);
  const [selectedDataSource, setSelectedDataSource] = useState<any>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSchema, setSelectedSchema] = useState<any>(null);
  const [sourceColumns, setSourceColumns] = useState<any[]>([]);
  const [formsHanStates, setformsHanStates] = useState<Record<string, any>>({});
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);
  const pipelineContext = usePipelineContext();
  const {
    handleNodeClick,
    addNodeToHistory,
    setUnsavedChanges,
    nodes,
    edges,
    onConnect,
    setEdges,
    handleAlignHorizontal,
    handleFormSubmit,
    pipelineDtl,
    setFormStates,
    formStates,
    handleSourceUpdate
  } = pipelineContext;

  // Keep local form states in sync with context form states
  useEffect(() => {
    console.log('Form states updated in context:', formStates);
    setformsHanStates(formStates);
  }, [formStates]);

  // Initialize the Reader node from node_display.json and load connection configs
  useEffect(() => {
    // Find the Reader node from the node_display.json file
    const reader = nodeDisplayData.nodes.find(node => node.ui_properties.module_name === "Reader");
    if (reader) {
      setReaderNode(reader);
    }

    // Load connection configs for the ReaderOptionsForm
    dispatch(getConnectionConfigList({}));
  }, [dispatch]);

  // Track the last added transformation node
  const [lastAddedTransformation, setLastAddedTransformation] = useState<any>(null);

  // Track node changes to handle dependency selection
  useEffect(() => {
    // If we have a new transformation node added
    if (nodes.length > 0 && lastAddedTransformation) {
      const lastNode = nodes[nodes.length - 1];

      // Check if this is a new node that needs dependencies
      if (lastNode && lastNode.data.label === lastAddedTransformation.type) {
        console.log('New transformation node detected:', lastNode);

        // Check if the transformation needs dependencies
        const maxInputs = lastAddedTransformation.maxInputs;
        if (maxInputs > 0 || maxInputs === "unlimited") {
          console.log(`Asking for dependencies for ${lastAddedTransformation.type}`);

          // Clear the last added transformation to avoid repeated prompts
          setLastAddedTransformation(null);

          // Ask for dependencies after a short delay
          setTimeout(() => {
            askForDependencies(lastAddedTransformation.node, maxInputs, lastNode.id);
          }, 500);
        } else {
          // No dependencies needed, show confirmation
          setLastAddedTransformation(null);
          setTimeout(() => {
            setMessages(prevMessages => [
              ...prevMessages,
              {
                role: 'assistant',
                content: `Great! I've added a ${lastAddedTransformation.type} transformation to your pipeline. What would you like to do next?`,
                suggestions: [
                  { text: "Add another source", onClick: handleAddAnotherSource },
                  { text: "Add another transformation", onClick: handleShowTransformations }
                ]
              },
            ]);
          }, 300);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, lastAddedTransformation]);

  // Track edge changes to handle connection visualization
  useEffect(() => {
    console.log('Current edges:', edges);
  }, [edges]);

  // Track form states changes
  useEffect(() => {
    console.log('Form states changed:', formStates);
  }, [formStates]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        // Use smooth scrolling for better UX
        setTimeout(() => {
          scrollContainer.scrollTo({
            top: scrollContainer.scrollHeight,
            behavior: 'smooth'
          });
        }, 100);
      }
    }
  }, [messages]);

  // We're now using the handleSourceUpdate from the context

  const form = useForm<ReaderFormValues>({
    resolver: zodResolver(readerFormSchema),
    defaultValues: {
      reader_name: "",
      source_type: "File",
    },
  });

  const handleSend = () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;
    setMessages([...messages, { role: 'user', content: trimmedInput }]);
    setInput('');
    // Simulate assistant response
    setTimeout(() => {
      setMessages(prevMessages => [
        ...prevMessages,
        { role: 'assistant', content: 'Processing your request...' },
      ]);
    }, 500);
  };

  const handleCreatePipeline = () => {
    // Define what happens when the "Create Pipeline" suggestion is clicked
    setMessages([...messages, { role: 'user', content: 'Create a data pipeline' }]);
    // Simulate assistant response
    setTimeout(() => {
      setMessages(prevMessages => [
        ...prevMessages,
        {
          role: 'assistant',
          content: "Let's start creating your data pipeline. First, I need some information about the data source:"
        },
      ]);
      setShowReaderForm(true);
    }, 500);
  };

  const onSubmitReaderForm = async (data: ReaderFormValues) => {
    // Add the form data to the messages
    setMessages(prevMessages => [
      ...prevMessages,
      {
        role: 'user',
        content: `Searching for reader: ${data.reader_name}`
      },
    ]);

    // Hide the form
    setShowReaderForm(false);

    // Show loading message
    setMessages(prevMessages => [
      ...prevMessages,
      {
        role: 'assistant',
        content: `Searching for data sources matching "${data.reader_name}"...`
      },
    ]);

    try {
      // Call the API to get data sources
      const response: any = await apiService.get({
        baseUrl: CATALOG_REMOTE_API_URL,
        url: `/data_source/list/`,
        usePrefix: true,
        method: 'GET',
        params: {
          data_src_name: data.reader_name,
          offset: 0,
          limit: 10,
          order_desc: false
        }
      });

      // Check if we got results
      if (response && response.length > 0) {
        // Show success message
        setMessages(prevMessages => [
          ...prevMessages,
          {
            role: 'assistant',
            content: `I found ${response.length} data source(s) matching "${data.reader_name}".`
          },
        ]);

        // Show data sources as suggestion buttons
        setTimeout(() => {
          setMessages(prevMessages => [
            ...prevMessages,
            {
              role: 'assistant',
              content: "Please select a data source to add to your pipeline:",
              suggestions: response.map(item => ({
                text: item.data_src_name,
                onClick: () => {
                  if (readerNode) {
                    setUnsavedChanges();

                    addNodeToHistory();

                    // Create initial data for the ReaderOptionsForm
                    const initialData = {
                      reader_name: item?.data_src_name || '',
                      name: item?.data_src_name || '',
                      file_type: item?.connection_config?.custom_metadata?.file_type || item?.file_type || 'CSV',
                      source: {
                        type:
                          item?.connection_config?.custom_metadata?.connection_type?.toLowerCase() === 'local' ||
                            item?.connection_config?.custom_metadata?.connection_type?.toLowerCase() === 's3'
                            ? 'File'
                            : 'Relational',
                        source_name: item?.data_src_name || '',
                        file_name: item?.file_name || '',
                        table_name:
                          item?.connection_config?.custom_metadata?.table_name ||
                          item?.data_src_name ||
                          item?.name ||
                          '',
                        bh_project_id: item?.bh_project_id || '',
                        data_src_id: item?.data_src_id || '',
                        file_type: item?.connection_config?.custom_metadata?.file_type || item?.file_type || 'CSV',
                        connection: {
                          ...item?.connection_config?.custom_metadata,
                          name: item?.connection_config?.connection_config_name || '',
                          connection_config_id: item?.connection_config_id || ''
                        },
                        connection_config_id: item?.connection_config_id || ''
                      }
                    };
                    console.log(readerNode,"readerNode");
                    
                    // Find the existing node ID for the reader
                    const readerNodeId = nodes.find(node => 
                      node.data.label === "Reader" || node.data.label.startsWith("Reader ")
                    )?.id;
                    
                    if (readerNodeId) {
                      // Update the existing node with the new source data
                      handleSourceUpdate({
                        nodeId: readerNodeId,
                        sourceData: { data: initialData }
                      });
                    } else {
                      // If no reader node exists yet, add a new one
                      handleNodeClick(readerNode, initialData);
                    }



                    // Add a message to show that the data source was selected
                    setMessages(prevMessages => [
                      ...prevMessages,
                      {
                        role: 'user',
                        content: `Selected data source: ${item.data_src_name}`
                      },
                    ]);

                    // Add a message asking to configure the reader
                    setTimeout(() => {
                      setMessages(prevMessages => [
                        ...prevMessages,
                        {
                          role: 'assistant',
                          content: `Great! Now let's configure the reader for "${item.data_src_name}". Please review and adjust the settings below:`
                        },
                      ]);

                      // Set the selected data source and show the ReaderOptionsForm
                      setSelectedDataSource(initialData);
                      setShowReaderOptionsForm(true);
                    }, 300);
                  } else {
                    toast.error("Reader node not found. Please try again.");
                  }
                }
              }))
            },
          ]);
        }, 300);
      } else {
        // No results found
        setMessages(prevMessages => [
          ...prevMessages,
          {
            role: 'assistant',
            content: `I couldn't find any data sources matching "${data.reader_name}". Would you like to create a new one?`,
            suggestions: [
              { text: "Yes, create new", onClick: () => handleCreateNewDataSource(data.reader_name) },
              { text: "No, try another search", onClick: () => handleRetrySearch() }
            ]
          },
        ]);
      }
    } catch (error) {
      console.error("API Error:", error);
      toast.error("Failed to fetch data sources. Please try again.");

      // Show error message
      setMessages(prevMessages => [
        ...prevMessages,
        {
          role: 'assistant',
          content: "I encountered an error while searching for data sources. Please try again or check your connection."
        },
      ]);
    }
  };


  const handleCreateNewDataSource = (readerName: string) => {
    // Add the user's selection to the messages
    setMessages(prevMessages => [
      ...prevMessages,
      {
        role: 'user',
        content: `Create new data source: ${readerName}`
      },
    ]);

    // Create a mock data source object with the provided name
    const mockDataSource = {
      data_src_name: readerName,
      data_src_id: `new-${Date.now()}`, // Generate a temporary ID
      file_name: null,
      connection_config: {
        connection_config_name: "New Connection",
        custom_metadata: {
          connection_type: "Local",
          file_path_prefix: ""
        }
      }
    };

    // Add a message to confirm
    setTimeout(() => {
      setMessages(prevMessages => [
        ...prevMessages,
        {
          role: 'assistant',
          content: "I'll create a new data source for you. Would you like to add it to your pipeline now?",
          suggestions: [
            {
              text: "Yes, add to pipeline",
              onClick: () => {
                if (readerNode) {
                  setUnsavedChanges();
                  addNodeToHistory();
                  console.log(readerNode,"readerNode");
                  
                  // Find the existing node ID for the reader
                  const readerNodeId = nodes.find(node => 
                    node.data.label === "Reader" || node.data.label.startsWith("Reader ")
                  )?.id;
                  
                  if (readerNodeId) {
                    // Update the existing node with the new source data
                    handleSourceUpdate({
                      nodeId: readerNodeId,
                      sourceData: { data: mockDataSource }
                    });
                  } else {
                    // If no reader node exists yet, add a new one
                    handleNodeClick(readerNode, mockDataSource);
                  }

                  // Apply horizontal alignment after adding the node with improved timing
                  setTimeout(() => {
                    if (pipelineContext.handleAlignHorizontal) {
                      console.log('Calling handleAlignHorizontal after adding new data source');
                      pipelineContext.handleAlignHorizontal();
                      
                      // Force a re-render of the ReactFlow component
                      window.dispatchEvent(new Event('resize'));
                      
                      // Call alignment again after a short delay to ensure proper positioning
                      setTimeout(() => {
                        pipelineContext.handleAlignHorizontal();
                        window.dispatchEvent(new Event('resize'));
                      }, 200);
                    }
                  }, 500);

                  setMessages(prevMessages => [
                    ...prevMessages,
                    {
                      role: 'user',
                      content: `Add "${readerName}" to pipeline`
                    },
                  ]);

                  setTimeout(() => {
                    setMessages(prevMessages => [
                      ...prevMessages,
                      {
                        role: 'assistant',
                        content: `Great! I've added a Reader node with the new "${readerName}" data source to your pipeline. What would you like to do next?`,
                        suggestions: [
                          { text: "Add another source", onClick: handleAddAnotherSource },
                          { text: "Add transformation", onClick: handleShowTransformations }
                        ]
                      },
                    ]);
                  }, 300);
                } else {
                  toast.error("Reader node not found. Please try again.");
                }
              }
            },
            {
              text: "No, configure first",
              onClick: () => handleSourceTypeSelection(readerName, "File")
            }
          ]
        },
      ]);
    }, 500);
  };

  const handleRetrySearch = () => {
    // Add the user's selection to the messages
    setMessages(prevMessages => [
      ...prevMessages,
      {
        role: 'user',
        content: "Try another search"
      },
    ]);

    // Show the form again
    setTimeout(() => {
      setMessages(prevMessages => [
        ...prevMessages,
        {
          role: 'assistant',
          content: "Please enter a different reader name to search:"
        },
      ]);
      setShowReaderForm(true);
    }, 500);
  };

  const handleSourceTypeSelection = async (readerName: string, sourceType: string) => {
    // Add the user's selection to the messages
    setMessages(prevMessages => [
      ...prevMessages,
      {
        role: 'user',
        content: `Selected source type: ${sourceType}`
      },
    ]);

    // Create initial data for the ReaderOptionsForm
    const initialData = {
      reader_name: readerName,
      source: {
        name: readerName,
        type: sourceType,
        data_src_name: readerName,
        data_src_id: `new-${Date.now()}`,
        connection: {
          connection_type: sourceType === "File" ? "Local" : "Postgres",
          file_path_prefix: sourceType === "File" ? "data" : "",
          name: "New Connection"
        }
      }
    };

    // Set the selected data source and show the ReaderOptionsForm
    setSelectedDataSource(initialData);
    setShowReaderOptionsForm(true);


  };

  // Handle the submission of the ReaderOptionsForm
  const handleReaderOptionsSubmit = (sourceData: any) => {
    // Add a message to show the configuration was saved
    setMessages(prevMessages => [
      ...prevMessages,
      {
        role: 'user',
        content: `Configured reader: ${sourceData.sourceData.data.label}`
      },
    ]);

    // Hide the form
    setShowReaderOptionsForm(false);

    if (readerNode) {
      // Mark unsaved changes
      setUnsavedChanges();

      // Add node to history for undo functionality
      addNodeToHistory();

console.log(readerNode,"readerNode");
      
      // Find the existing node ID for the reader
      const readerNodeId = nodes.find(node => 
        node.data.label === "Reader" || node.data.label.startsWith("Reader ")
      )?.id;
      
      if (readerNodeId) {
        // Update the existing node with the new source data
        handleSourceUpdate({
          nodeId: readerNodeId,
          sourceData: sourceData
        });
      } else {
        // If no reader node exists yet, add a new one
        handleNodeClick(readerNode, sourceData.sourceData.data.source);
      }

      // Apply horizontal alignment after adding the node with improved timing
      setTimeout(() => {
        if (pipelineContext.handleAlignHorizontal) {
          console.log('Calling handleAlignHorizontal after adding reader node');
          pipelineContext.handleAlignHorizontal();
          
          // Force a re-render of the ReactFlow component
          window.dispatchEvent(new Event('resize'));
          
          // Call alignment again after a short delay to ensure proper positioning
          setTimeout(() => {
            pipelineContext.handleAlignHorizontal();
            window.dispatchEvent(new Event('resize'));
          }, 200);
        }
      }, 500);

    } else {
      toast.error("Reader node not found. Please try again.");
    }
  };

  // Function to handle adding another source
  const handleAddAnotherSource = () => {
    dispatch(setIsRightPanelOpen(true));
    setMessages(prevMessages => [
      ...prevMessages,
      {
        role: 'user',
        content: `Add another source`
      },
    ]);

    // Show the reader form again
    setTimeout(() => {
      setMessages(prevMessages => [
        ...prevMessages,
        {
          role: 'assistant',
          content: "Let's add another data source to your pipeline. Please enter a reader name to search:"
        },
      ]);
      setShowReaderForm(true);
    }, 300);
  };

  // Function to handle showing transformation options
  const handleShowTransformations = () => {
    setMessages(prevMessages => [
      ...prevMessages,
      {
        role: 'user',
        content: `Show transformation options`
      },
    ]);

    // Get all transformation nodes from nodeDisplayData (excluding Reader)
    const transformationNodes = nodeDisplayData.nodes.filter(
      node => node.ui_properties.module_name !== "Reader"
    );

    // Show transformation options as suggestion buttons
    setTimeout(() => {
      setMessages(prevMessages => [
        ...prevMessages,
        {
          role: 'assistant',
          content: "Here are the available transformations you can add to your pipeline:",
          suggestions: transformationNodes.map(node => ({
            text: node.ui_properties.module_name,
            onClick: () => {
              // Add a message to show the selection
              setMessages(prevMessages => [
                ...prevMessages,
                {
                  role: 'user',
                  content: `Add ${node.ui_properties.module_name} transformation`
                },
              ]);

              // Mark unsaved changes
              setUnsavedChanges();

              // Add node to history for undo functionality
              addNodeToHistory();

              // Store the transformation info for later use
              const transformationInfo = {
                type: node.ui_properties.module_name,
                maxInputs: node.ui_properties.ports.maxInputs,
                node: node
              };

              // Set the last added transformation to track in useEffect
              setLastAddedTransformation(transformationInfo);

              // Add the transformation node to the pipeline
console.log(node,"readerNode")

              handleNodeClick(node, null);
              
              // Explicitly call handleAlignHorizontal to ensure proper node positioning
              // Use a longer delay to ensure the node is fully added to the state
              setTimeout(() => {
                if (pipelineContext.handleAlignHorizontal) {
                  console.log('Calling handleAlignHorizontal from chat panel');
                  pipelineContext.handleAlignHorizontal();
                  
                  // Force a re-render of the ReactFlow component
                  window.dispatchEvent(new Event('resize'));
                  
                  // Call it again after a short delay to ensure proper alignment
                  setTimeout(() => {
                    pipelineContext.handleAlignHorizontal();
                    window.dispatchEvent(new Event('resize'));
                  }, 200);
                }
              }, 500);

              setTimeout(() => {
                setMessages(prevMessages => [
                  ...prevMessages,
                  {
                    role: 'assistant',
                    content: `Adding a ${node.ui_properties.module_name} transformation to your pipeline...`
                  },
                ]);
              }, 300);

              // The nodes will be updated in the context, and our useEffect will handle asking for dependencies
            }
          }))
        },
      ]);
    }, 300);
  };

  // Function to ask for dependencies based on maxInputs
  const askForDependencies = (node, maxInputs, targetNodeId) => {
    console.log(`askForDependencies called for ${node.ui_properties.module_name} with maxInputs: ${maxInputs}`);
    console.log(`Target node ID: ${targetNodeId}`);
    console.log('All nodes in context:', nodes);

    // Filter out nodes that can be used as dependencies
    const availableDependencies = nodes.filter(existingNode =>
      // Exclude the target node itself
      existingNode.id !== targetNodeId
    );

    console.log('Available dependencies:', availableDependencies);

    if (availableDependencies.length === 0) {
      // No available dependencies, show message
      setTimeout(() => {
        setMessages(prevMessages => [
          ...prevMessages,
          {
            role: 'assistant',
            content: `I've added a ${node.ui_properties.module_name} transformation to your pipeline, but there are no existing nodes to connect it to. Add more nodes first, then you can create connections.`,
            suggestions: [
              { text: "Add another source", onClick: handleAddAnotherSource },
              { text: "Add another transformation", onClick: handleShowTransformations }
            ]
          },
        ]);
      }, 300);
      return;
    }

    // Determine how many dependencies to ask for
    const numDependenciesToAsk = maxInputs === "unlimited" ?
      Math.min(availableDependencies.length, 5) : // Limit to 5 for unlimited
      Math.min(maxInputs, availableDependencies.length);

    // Create a message asking for dependencies
    const dependencyMessage = maxInputs === 1 ?
      `The ${node.ui_properties.module_name} transformation needs a dependency. Select a node to connect it to:` :
      `The ${node.ui_properties.module_name} transformation can have up to ${maxInputs === "unlimited" ? "multiple" : maxInputs} dependencies. Select nodes to connect it to:`;

    // Show message asking for dependencies
    setTimeout(() => {
      setMessages(prevMessages => [
        ...prevMessages,
        {
          role: 'assistant',
          content: dependencyMessage,
          suggestions: availableDependencies.map(depNode => ({
            text: depNode.data.title || depNode.data.label,
            onClick: () => handleDependencySelection(depNode, node, targetNodeId, maxInputs, numDependenciesToAsk)
          }))
        },
      ]);
    }, 300);
  };

  // Function to handle dependency selection
  const handleDependencySelection = (sourceNode, targetNodeType, targetNodeId, maxInputs, numDependenciesToAsk) => {
    // Add a message to show the selection
    setMessages(prevMessages => [
      ...prevMessages,
      {
        role: 'user',
        content: `Connect to: ${sourceNode.data.title || sourceNode.data.label}`
      },
    ]);

    // Create a connection between the source node and the target node
    const connection = {
      source: sourceNode.id,
      target: targetNodeId,
      sourceHandle: null,  // Add sourceHandle property
      targetHandle: null   // Add targetHandle property
    };

    // Create a unique edge ID
    const edgeId = `e${sourceNode.id}-${targetNodeId}`;

    // Create a complete edge object with all required properties
    const newEdge = {
      id: edgeId,
      source: sourceNode.id,
      target: targetNodeId,
      type: 'default',
      animated: false,
      style: { stroke: '#b1b1b7', strokeWidth: 2 }
    };

    console.log('Creating edge:', newEdge);
    console.log('Current edges before connection:', edges);

    // Add the edge directly to the edges array
    setEdges(prevEdges => {
      // Check if the edge already exists to avoid duplicates
      const edgeExists = prevEdges.some(
        edge => edge.source === sourceNode.id && edge.target === targetNodeId
      );

      if (edgeExists) {
        console.log('Edge already exists, not adding duplicate');
        return prevEdges;
      }

      return [...prevEdges, newEdge];
    });

    // Call onConnect to ensure any side effects are triggered
    // This is important as it may update node forms or other state
    onConnect(connection);

    // Force a re-render of the ReactFlow component with improved timing
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));

      // Try to trigger a layout update to make the connection visible
      if (pipelineContext.handleAlignHorizontal) {
        console.log('Calling handleAlignHorizontal after adding dependency');
        pipelineContext.handleAlignHorizontal();
        
        // Force another re-render after alignment
        window.dispatchEvent(new Event('resize'));
        
        // Call alignment again after a short delay to ensure proper positioning
        setTimeout(() => {
          pipelineContext.handleAlignHorizontal();
          window.dispatchEvent(new Event('resize'));
        }, 200);
      }
    }, 500);

    // Check if the connection was added after a short delay
    setTimeout(() => {
      console.log('Current edges after connection:', edges);
    }, 500);

    // If this is a single-input transformation or we've reached the max inputs, show the form
    if (maxInputs === 1 || numDependenciesToAsk === 1) {
      console.log("Single input transformation or last dependency selected");
      console.log("Target node type:", targetNodeType);

      // Find the schema for this transformation type
      const transformationType = targetNodeType.ui_properties.module_name;
      console.log("Transformation type:", transformationType);

      // Check if this is a Target transformation
      const isTarget = transformationType === 'Target';
      console.log("Is Target:", isTarget);

      // If this is a Target transformation, show the Target form immediately
      if (isTarget) {
        console.log("Showing Target form immediately");

        // Add a message to show that we're configuring the Target
        setTimeout(() => {
          setMessages(prevMessages => [
            ...prevMessages,
            {
              role: 'assistant',
              content: `Great! I've connected the ${sourceNode.data.title || sourceNode.data.label} to your Target transformation. Now let's configure it:`,
              formData: {
                schema: { title: 'Target' },
                sourceColumns: [], // Add empty sourceColumns array to satisfy the type requirement
                currentNodeId: targetNodeId,
                isTarget: true,
                initialValues: {
                  nodeId: targetNodeId,
                  name: `Target_${targetNodeId}`,
                  dependent_on: edges
                    .filter(edge => edge.target === targetNodeId)
                    .map(edge => edge.source)
                }
              }
            },
          ]);
        }, 300);

        return; // Skip the rest of the function
      }

      // Check if schemaData has a schema property (array) or is an array itself
      const schemaArray = Array.isArray(schemaData) ? schemaData : schemaData.schema;
      console.log("Schema array:", schemaArray);

      const schema = schemaArray.find(s => s.title === transformationType);
      console.log("Found schema:", schema ? "Yes" : "No", schema);

      if (schema) {
        // Set up the schema with the node ID for the form
        const schemaWithNodeId = {
          ...schema,
          nodeId: targetNodeId
        };

        // Set the selected schema
        setSelectedSchema(schemaWithNodeId);

        // Get column suggestions for the form
        import('@/lib/pipelineAutoSuggestion').then(module => {
          module.getColumnSuggestions(targetNodeId, nodes, edges, pipelineContext.pipelineDtl)
            .then(columns => {
              console.log(`Got column suggestions for ${transformationType}:`, columns);

              // Add a message to show that we're configuring the transformation
              setTimeout(() => {
                // Check if this is a Target transformation
                const isTarget = transformationType === 'Target';

                const newMessage = {
                  role: 'assistant',
                  content: `Great! I've connected the ${sourceNode.data.title || sourceNode.data.label} to your ${transformationType} transformation. Now let's configure it:`,
                  formData: {
                    schema: schemaWithNodeId,
                    sourceColumns: columns.map(col => ({ name: col, dataType: 'string' })),
                    currentNodeId: targetNodeId,
                    isTarget: isTarget, // Add flag to indicate if this is a Target
                    initialValues: {
                      ...formStates[targetNodeId],
                      nodeId: targetNodeId,
                      dependent_on: edges
                        .filter(edge => edge.target === targetNodeId)
                        .map(edge => edge.source)
                    }
                  }
                };

                console.log("Adding form message to chat (single-input):", newMessage);

                setMessages((prevMessages: any) => {
                  const newMessages = [...prevMessages, newMessage];
                  console.log("New messages array (single-input):", newMessages);
                  return newMessages;
                });
              }, 300);
            })
            .catch(err => {
              console.error('Error getting column suggestions:', err);

              // Fallback if we can't get column suggestions
              setTimeout(() => {
                // Check if this is a Target transformation
                const isTarget = transformationType === 'Target';

                const newMessage = {
                  role: 'assistant',
                  content: `Great! I've connected the ${sourceNode.data.title || sourceNode.data.label} to your ${transformationType} transformation. Now let's configure it:`,
                  formData: {
                    schema: schemaWithNodeId,
                    sourceColumns: [],
                    currentNodeId: targetNodeId,
                    isTarget: isTarget, // Add flag to indicate if this is a Target
                    initialValues: {
                      ...formStates[targetNodeId],
                      nodeId: targetNodeId,
                      dependent_on: edges
                        .filter(edge => edge.target === targetNodeId)
                        .map(edge => edge.source)
                    }
                  }
                };

                console.log("Adding form message to chat (fallback):", newMessage);

                setMessages((prevMessages: any) => {
                  const newMessages = [...prevMessages, newMessage];
                  console.log("New messages array (fallback):", newMessages);
                  return newMessages;
                });
              }, 300);
            });
        });
      } else {
        // Fallback if schema not found
        setTimeout(() => {
          setMessages(prevMessages => [
            ...prevMessages,
            {
              role: 'assistant',
              content: `Great! I've connected the ${sourceNode.data.title || sourceNode.data.label} to your ${targetNodeType.ui_properties.module_name} transformation. What would you like to do next?`,
              suggestions: [
                { text: "Add another source", onClick: handleAddAnotherSource },
                { text: "Add another transformation", onClick: handleShowTransformations }
              ]
            },
          ]);
        }, 300);
      }
    } else {
      // For multi-input transformations, ask for more dependencies
      const remainingDeps = numDependenciesToAsk - 1;

      // Get updated list of available dependencies (excluding already selected ones)
      const connectedNodeIds = edges
        .filter(edge => edge.target === targetNodeId)
        .map(edge => edge.source);

      const availableDependencies = nodes.filter(node =>
        node.id !== targetNodeId && !connectedNodeIds.includes(node.id)
      );

      if (availableDependencies.length === 0 || remainingDeps === 0) {
        // No more available dependencies or we've reached the limit
        setTimeout(() => {
          // Find the target node in the nodes array
          const targetNode = nodes.find(node => node.id === targetNodeId);

          if (targetNode) {
            // Find the schema for this transformation type
            const transformationType = targetNodeType.ui_properties.module_name;
            console.log("Multi-input transformation type:", transformationType);

            // Check if schemaData has a schema property (array) or is an array itself
            const schemaArray = Array.isArray(schemaData) ? schemaData : schemaData.schema;
            console.log("Multi-input schema array:", schemaArray);

            const schema = schemaArray.find(s => s.title === transformationType);
            console.log("Multi-input found schema:", schema ? "Yes" : "No", schema);

            if (schema) {
              // Set up the schema with the node ID for the form
              const schemaWithNodeId = {
                ...schema,
                nodeId: targetNodeId
              };

              // Set the selected schema and open the form
              setSelectedSchema(schemaWithNodeId);

              // Get column suggestions for the form
              import('@/lib/pipelineAutoSuggestion').then(module => {
                module.getColumnSuggestions(targetNodeId, nodes, edges, pipelineContext.pipelineDtl)
                  .then(columns => {
                    console.log(`Got column suggestions for ${transformationType}:`, columns);
                    setSourceColumns(columns.map(col => ({ name: col, dataType: 'string' })));

                    // Add a message to show that we're configuring the transformation
                    setMessages(prevMessages => [
                      ...prevMessages,
                      {
                        role: 'assistant',
                        content: `Great! I've connected the dependencies to your ${transformationType} transformation. Now let's configure it:`
                      },
                    ]);

                    // Instead of opening a dialog, add the form directly to the chat
                    setTimeout(() => {
                      console.log(`Adding form for ${transformationType} with node ID ${targetNodeId} to chat`);

                      // Add the form to the chat messages
                      // Check if this is a Target transformation
                      const isTarget = transformationType === 'Target';

                      const newMessage = {
                        role: 'assistant',
                        content: `Please configure your ${transformationType} transformation:`,
                        formData: {
                          schema: schemaWithNodeId,
                          sourceColumns: columns.map(col => ({ name: col, dataType: 'string' })),
                          currentNodeId: targetNodeId,
                          isTarget: isTarget, // Add flag to indicate if this is a Target
                          initialValues: {
                            ...formStates[targetNodeId],
                            nodeId: targetNodeId,
                            dependent_on: edges
                              .filter(edge => edge.target === targetNodeId)
                              .map(edge => edge.source)
                          }
                        }
                      };

                      console.log("Adding form message to chat:", newMessage);

                      setMessages((prevMessages: any) => {
                        const newMessages = [...prevMessages, newMessage];
                        console.log("New messages array:", newMessages);
                        return newMessages;
                      });
                    }, 300);
                  })
                  .catch(err => {
                    console.error('Error getting column suggestions:', err);

                    // Add a message to show that we're configuring the transformation
                    setMessages(prevMessages => [
                      ...prevMessages,
                      {
                        role: 'assistant',
                        content: `Great! I've connected the dependencies to your ${transformationType} transformation. Now let's configure it:`
                      },
                    ]);

                    // Instead of opening a dialog, add the form directly to the chat (fallback)
                    setTimeout(() => {
                      console.log(`Adding form for ${transformationType} with node ID ${targetNodeId} to chat (fallback)`);

                      // Add the form to the chat messages
                      // Check if this is a Target transformation
                      const isTarget = transformationType === 'Target';

                      const newMessage = {
                        role: 'assistant',
                        content: `Please configure your ${transformationType} transformation:`,
                        formData: {
                          schema: schemaWithNodeId,
                          sourceColumns: [],
                          currentNodeId: targetNodeId,
                          isTarget: isTarget, // Add flag to indicate if this is a Target
                          initialValues: {
                            ...formStates[targetNodeId],
                            nodeId: targetNodeId,
                            dependent_on: edges
                              .filter(edge => edge.target === targetNodeId)
                              .map(edge => edge.source)
                          }
                        }
                      };

                      console.log("Adding form message to chat (multi-input fallback):", newMessage);

                      setMessages((prevMessages: any) => {
                        const newMessages = [...prevMessages, newMessage];
                        console.log("New messages array (multi-input fallback):", newMessages);
                        return newMessages;
                      });
                    }, 300);
                  });
              });
            } else {
              // Fallback if schema not found
              setMessages(prevMessages => [
                ...prevMessages,
                {
                  role: 'assistant',
                  content: `Great! I've connected the dependencies to your ${targetNodeType.ui_properties.module_name} transformation. What would you like to do next?`,
                  suggestions: [
                    { text: "Add another source", onClick: handleAddAnotherSource },
                    { text: "Add another transformation", onClick: handleShowTransformations }
                  ]
                },
              ]);
            }
          } else {
            // Fallback if node not found
            setMessages(prevMessages => [
              ...prevMessages,
              {
                role: 'assistant',
                content: `Great! I've connected the dependencies to your ${targetNodeType.ui_properties.module_name} transformation. What would you like to do next?`,
                suggestions: [
                  { text: "Add another source", onClick: handleAddAnotherSource },
                  { text: "Add another transformation", onClick: handleShowTransformations }
                ]
              },
            ]);
          }
        }, 300);
      } else {
        // Ask for more dependencies
        setTimeout(() => {
          setMessages(prevMessages => [
            ...prevMessages,
            {
              role: 'assistant',
              content: `You can add ${remainingDeps} more connection${remainingDeps > 1 ? 's' : ''}. Select another node to connect:`,
              suggestions: availableDependencies.map(depNode => ({
                text: depNode.data.title || depNode.data.label,
                onClick: () => handleDependencySelection(depNode, targetNodeType, targetNodeId, maxInputs, remainingDeps)
              }))
            },
          ]);
        }, 300);
      }
    }
  };



  // Handle closing the ReaderOptionsForm
  const handleReaderOptionsClose = () => {
    setShowReaderOptionsForm(false);

    // Add a message to show the user cancelled
    setMessages(prevMessages => [
      ...prevMessages,
      {
        role: 'user',
        content: `Cancelled reader configuration`
      },
    ]);

    // Add a message asking what transformation they want next with suggestion buttons
    setTimeout(() => {
      setMessages(prevMessages => [
        ...prevMessages,
        {
          role: 'assistant',
          content: `What transformation would you like to add next?`,
          suggestions: [
            { text: "Add another source", onClick: handleAddAnotherSource },
            { text: "Add transformation", onClick: handleShowTransformations }
          ]
        },
      ]);
    }, 300);
  };

  return (
    <div className="h-full w-full flex flex-col">
      <ScrollArea ref={scrollAreaRef} className="flex-1 w-full">
        <div className="px-3 py-2 w-full mx-auto">
          {messages.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-green-500 flex-shrink-0" />
                <div className="flex-1 rounded-lg bg-gray-100 px-3 py-1.5 shadow-sm">
                  <p className="text-base font-medium text-gray-800">How can I assist you?</p>
                </div>
              </div>
              <SuggestionButton
                text="Create Pipeline"
                onClick={handleCreatePipeline}
                assistantColor="#009459"
              />
            </motion.div>
          ) : (
            <>
              {messages.map((message, index) => (
                <div key={index} className="flex flex-col gap-1.5 py-1.5">
                  <div className="flex items-start gap-2">
                    <div
                      className="w-6 h-6 mt-1 rounded-full flex-shrink-0"
                      style={{ backgroundColor: message.role === 'assistant' ? '#009459' : '#000000' }}
                    />
                    <div
                      className={`flex-1 rounded-lg px-3 py-2 shadow-sm ${message.role === 'assistant'
                          ? 'bg-gray-100 text-black'
                          : 'bg-gradient-to-r from-white to-slate-50'
                        }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed text-sm">{message.content}</p>
                    </div>
                  </div>

                  {/* Render suggestion buttons if they exist */}
                  {message.role === 'assistant' && message.suggestions && (
                    <div className="ml-8 mt-0.5 flex flex-wrap gap-1.5">
                      {message.suggestions.map((suggestion, suggestionIndex) => (
                        <SuggestionButton
                          key={suggestionIndex}
                          text={suggestion.text}
                          onClick={suggestion.onClick}
                          assistantColor="#009459"
                          index={suggestionIndex}
                        />
                      ))}
                    </div>
                  )}

                  {/* Render form if formData exists */}
                  {message.role === 'assistant' && message.formData && (
                    console.log('Rendering form with data:', message.formData),
                    <div className="ml-8 mt-2 bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                      <div className="space-y-3">
                        <h3 className="text-base font-semibold">{message.formData.schema?.title} Configuration</h3>

                        {/* Check if this is a target node */}
                        {message.formData.isTarget || message.formData.schema?.title === 'Target' ? (
                          <div className="form-wrapper">
                            {/* 
                                Use TargetPopUp for Target nodes in inline mode (not as a dialog)
                                When isOpen is false, TargetPopUp renders directly in the parent component
                              */}
                            <TargetPopUp
                              isOpen={false} // Use inline mode
                              onClose={() => {
                                // Handle form close
                                setMessages(prevMessages => [
                                  ...prevMessages,
                                  {
                                    role: 'user',
                                    content: `Cancelled Target configuration`
                                  },
                                  {
                                    role: 'assistant',
                                    content: 'What would you like to do next?',
                                    suggestions: [
                                      { text: "Add another source", onClick: handleAddAnotherSource },
                                      { text: "Add another transformation", onClick: handleShowTransformations }
                                    ]
                                  }
                                ]);
                              }}
                              nodeId={message.formData.currentNodeId}
                              initialData={formStates[message.formData.currentNodeId] || message.formData.initialValues}
                              onSourceUpdate={(sourceData) => {
                                console.log('onSourceUpdate called in chat panel with data:', sourceData);
                                console.log('Current node ID:', message.formData.currentNodeId);

                                // Update the node with the source data
                                // First, log the current state of the node
                                console.log('Current node before update:',
                                  nodes.find(node => node.id === message.formData.currentNodeId)
                                );

                                handleSourceUpdate({
                                  nodeId: message.formData.currentNodeId,
                                  sourceData
                                });

                                // Log the node after update (in next tick)
                                setTimeout(() => {
                                  const updatedNode = nodes.find(node => node.id === message.formData.currentNodeId);
                                  console.log('Node after update:', updatedNode);

                                  if (!updatedNode) {
                                    console.error('Could not find updated node with ID:', message.formData.currentNodeId);
                                    console.error('Available nodes:', nodes.map(n => ({ id: n.id, label: n.label })));
                                  }
                                }, 0);

                                // Also update the form states in the context to ensure consistency
                                // This is the key fix - we need to update formStates with the target configuration
                                console.log('Updating form states with target data:', {
                                  nodeId: message.formData.currentNodeId,
                                  sourceData: sourceData
                                });

                                // Handle the nested structure from TargetPopUp component
                                // The structure can be either:
                                // 1. { sourceData: { data: { ... } } } - from TargetPopUp
                                // 2. { data: { ... } } - from other components
                                let data;

                                if (sourceData.sourceData?.data) {
                                  // Structure from TargetPopUp
                                  data = sourceData.sourceData.data;
                                  console.log('Using nested sourceData.sourceData.data structure');
                                } else if (sourceData.data) {
                                  // Direct structure
                                  data = sourceData.data;
                                  console.log('Using direct sourceData.data structure');
                                } else {
                                  // Try to use sourceData directly as a fallback
                                  data = sourceData;
                                  console.log('Using sourceData directly as fallback');
                                }

                                if (!data) {
                                  console.error('Invalid sourceData structure:', sourceData);
                                  // Create a minimal data object to avoid errors
                                  data = {
                                    title: 'Unnamed Target',
                                    label: 'Unnamed Target',
                                    source: {
                                      target_type: 'File',
                                      load_mode: 'append'
                                    },
                                    transformationData: {
                                      write_options: {
                                        header: true,
                                        sep: ",",
                                        createDisposition: 'CREATE_IF_NEEDED',
                                        writeMethod: 'APPEND'
                                      }
                                    }
                                  };
                                }

                                // Create a safe form state object with fallbacks for missing properties
                                const updatedFormState = {
                                  ...(data.transformationData || {}),
                                  name: data.title || data.label || 'Unnamed Target',
                                  target: {
                                    target_type: data.source?.target_type || 'File',
                                    target_name: data.source?.target_name || '',
                                    table_name: data.source?.table_name || '',
                                    file_name: data.source?.file_name || '',
                                    load_mode: data.source?.load_mode || 'append',
                                    connection: data.source?.connection || {}
                                  },
                                  file_type: data.source?.file_type || 'CSV',
                                  write_options: data.transformationData?.write_options || {
                                    header: true,
                                    sep: ",",
                                    createDisposition: 'CREATE_IF_NEEDED',
                                    writeMethod: data.source?.target_type === 'Relational' ? 'direct' : 'APPEND'
                                  }
                                };

                                console.log('Updated form state:', updatedFormState);

                                try {
                                  setFormStates(prevStates => {
                                    const newStates = {
                                      ...prevStates,
                                      [message.formData.currentNodeId]: updatedFormState
                                    };
                                    console.log('New form states:', newStates);
                                    return newStates;
                                  });
                                } catch (error) {
                                  console.error('Error updating form states:', error);
                                  console.error('Node ID:', message.formData.currentNodeId);
                                  console.error('Updated form state:', updatedFormState);
                                }

                                // Update the local form states to ensure consistency
                                try {
                                  setformsHanStates(prevStates => {
                                    const newLocalStates = {
                                      ...prevStates,
                                      [message.formData.currentNodeId]: updatedFormState
                                    };
                                    console.log('New local form states:', newLocalStates);
                                    return newLocalStates;
                                  });
                                } catch (error) {
                                  console.error('Error updating local form states:', error);
                                  console.error('Node ID:', message.formData.currentNodeId);
                                  console.error('Updated form state:', updatedFormState);
                                }

                                // Mark unsaved changes
                                setUnsavedChanges();

                                // Add a message to show the form was submitted
                                setMessages(prevMessages => [
                                  ...prevMessages,
                                  {
                                    role: 'user',
                                    content: `Configured Target`
                                  },
                                  {
                                    role: 'assistant',
                                    content: `Great! I've updated the Target with your configuration. What would you like to do next?`,
                                    suggestions: [
                                      { text: "Add another source", onClick: handleAddAnotherSource },
                                      { text: "Add another transformation", onClick: handleShowTransformations }
                                    ]
                                  }
                                ]);
                              }}
                            />
                          </div>
                        ) : (
                          /* Use CreateFormFormik for other transformations */
                          <div className="form-wrapper">
                            <CreateFormFormik
                              schema={message.formData.schema}
                              sourceColumns={message.formData.sourceColumns || []}
                              onClose={() => {
                                // Handle form close
                                setMessages(prevMessages => [
                                  ...prevMessages,
                                  {
                                    role: 'user',
                                    content: `Cancelled ${message.formData?.schema?.title} configuration`
                                  },
                                  {
                                    role: 'assistant',
                                    content: 'What would you like to do next?',
                                    suggestions: [
                                      { text: "Add another source", onClick: handleAddAnotherSource },
                                      { text: "Add another transformation", onClick: handleShowTransformations }
                                    ]
                                  }
                                ]);
                              }}
                              currentNodeId={message.formData.currentNodeId}
                              initialValues={{
                                ...formStates[message.formData.currentNodeId],
                                nodeId: message.formData.currentNodeId
                              }}
                              nodes={nodes}
                              edges={edges}
                              pipelineDtl={pipelineDtl}
                              onSubmit={(data) => {
                                console.log('Form submitted with data:', data);
                                console.log('Current node ID:', message.formData.currentNodeId);
                                console.log('Current form states before update:', formStates);

                                // First, call the context's handleFormSubmit to update the global state
                                handleFormSubmit(data);

                                // Also update the form states in the context directly to ensure consistency
                                setFormStates(prevStates => ({
                                  ...prevStates,
                                  [message.formData.currentNodeId]: data
                                }));

                                // Update the node data with transformation data (similar to what handleFormSubmit does)
                                const nodeId = message.formData.currentNodeId;
                                const updatedNodes = nodes.map(node => {
                                  if (node.id === nodeId) {
                                    // Preserve existing source data if it exists
                                    const existingSource = node.data.source || {};

                                    return {
                                      ...node,
                                      data: {
                                        ...node.data,
                                        transformationData: {
                                          ...node.data.transformationData,
                                          ...data,
                                          name: data.name || node.data.title
                                        },
                                        // Preserve existing source data
                                        source: existingSource
                                      }
                                    };
                                  }
                                  return node;
                                });

                                // Update the nodes in the context
                                pipelineContext.setNodes(updatedNodes);

                                // Mark unsaved changes
                                setUnsavedChanges();

                                // Update the local form states to ensure consistency
                                setformsHanStates(prevStates => ({
                                  ...prevStates,
                                  [message.formData.currentNodeId]: data
                                }));

                                console.log('Form states after update:', formStates);

                                // Add a message to show the form was submitted
                                setMessages(prevMessages => [
                                  ...prevMessages,
                                  {
                                    role: 'user',
                                    content: `Configured ${message.formData?.schema?.title} transformation`
                                  },
                                  {
                                    role: 'assistant',
                                    content: `Great! I've updated the ${message.formData?.schema?.title} transformation with your configuration. What would you like to do next?`,
                                    suggestions: [
                                      { text: "Add another source", onClick: handleAddAnotherSource },
                                      { text: "Add another transformation", onClick: handleShowTransformations }
                                    ]
                                  }
                                ]);
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Reader Form */}
              {showReaderForm && (
                <div className="mt-2 mb-3">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 mt-1 rounded-full bg-green-500 flex-shrink-0" />
                    <div className="flex-1 rounded-lg px-3 py-2 shadow-sm bg-gray-100">
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmitReaderForm)} className="space-y-3">
                          <FormField
                            control={form.control}
                            name="reader_name"
                            render={({ field }) => (
                              <FormItem className="space-y-1.5">
                                <FormLabel className="text-sm font-medium">Reader Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter reader name" {...field} className="h-8" />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                          <div className="flex justify-end">
                            <Button type="submit" className="bg-green-600 hover:bg-green-700 h-8 text-sm px-3">
                              Search Reader
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </div>
                  </div>
                </div>
              )}

              {/* Reader Options Form */}
              {showReaderOptionsForm && selectedDataSource && (
                <div className="mt-2 mb-3">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 mt-1 rounded-full bg-green-500 flex-shrink-0" />
                    <div className="flex-1">
                      <ReaderOptionsForm
                        initialData={selectedDataSource}
                        onSourceUpdate={handleReaderOptionsSubmit}
                        onClose={handleReaderOptionsClose}
                        nodeId={`reader-${Date.now()}`}
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>
      <div className="p-2 border-t border-slate-200 bg-white">
        <AIChatInput input={input} onChange={setInput} onSend={handleSend} placeholder="Type a message..." />
      </div>
    </div>
  );
};

export default PipeLineChatPanel;
