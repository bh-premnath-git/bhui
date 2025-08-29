/**
 * FlowChatPanel Component
 * 
 * This component provides a chat interface UI for the flow designer.
 * All functionality has been removed, keeping only the UI elements.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AIChatInput } from '@/components/shared/AIChatInput';
import { m, motion } from 'framer-motion';
import SuggestionButton from '../../pipeline/components/SuggestionButton';
import { useFlow } from '@/context/designers/FlowContext';
import { usePipelineContext } from '@/context/designers/DataPipelineContext';
import { useAppSelector } from '@/hooks/useRedux';
import { RootState } from '@/store';
import { useModules } from '@/hooks/useModules';
import { DialogContent } from '@radix-ui/react-dialog';
import { Dialog } from '@/components/ui/dialog';
import { NodeForm } from '@/components/bh-reactflow-comps/flow/flow/subcomponents/NodeForm';
import { flow, random } from 'lodash';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

// Define the type for suggestion buttons
type Suggestion = {
  text: string;
  onClick: () => void;
};

// Define the type for chat messages
type ChatMessage = {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  msg_owner?: string;
  suggestions?: Suggestion[];
  showDependencyEdit?: boolean; // Flag to show edit icon for dependencies
  dependencyEditData?: {
    targetNodeId: string;
    targetNodeType: any;
    dependencies: any[];
    transformationType: string;
  };
  nodeForm?: {
    nodeId: string;
    onSave: () => void;
    showInline?: boolean; // Flag to indicate if the form should be shown inline
  };
  formData?: {
    schema: any;
    sourceColumns: any[];
    currentNodeId: string;
    initialValues: any;
    isTarget?: boolean;
    isConfirmation?: boolean;
    isMultiSourceSelect?: boolean;
    isSingleDependencySelect?: boolean;
    isMultiDependencySelect?: boolean;
    formId?: string;
    dependencyData?: {
      dependencies: any[];
      targetNodeType: any;
      targetNodeId: string;
      maxInputs: number | string;
    };
    isDependencyEdit?: boolean;
  };
};

// Single dependency selection component
const SingleDependencySelectForm: React.FC<{
  dependencies: any[];
  onSubmit: (selectedDependency: any) => void;
  onClose: () => void;
  targetNodeType: any;
  targetNodeId: string;
  maxInputs: number | string;
}> = ({ dependencies, onSubmit, onClose, targetNodeType, targetNodeId, maxInputs }) => {
  console.log('SingleDependencySelectForm rendered with dependencies:', dependencies);

  return (
    <div className="single-dependency-select-form rounded-lg bg-white shadow-sm">
      <Select onValueChange={(value) => {
        console.log('SingleDependencySelectForm: Selected value:', value);
        const selected = dependencies.find(dep => dep.id === value);
        console.log('SingleDependencySelectForm: Found selected dependency:', selected);

        if (selected) {
          console.log('SingleDependencySelectForm: Calling onSubmit with selected dependency');
          onSubmit(selected);
        }
      }}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a node to connect to" />
        </SelectTrigger>
        <SelectContent style={{ zIndex: 9999 }}>
          {dependencies.map((dep) => (
            <SelectItem key={dep.id} value={dep.id}>
              {dep.data.title || dep.data.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

// Multi-dependency selection component
const MultiDependencySelectForm: React.FC<{
  dependencies: any[];
  onSubmit: (selectedDependencies: any[]) => void;
  onClose: () => void;
  targetNodeType: any;
  targetNodeId: string;
  maxInputs: number | string;
}> = ({ dependencies, onSubmit, onClose, targetNodeType, targetNodeId, maxInputs }) => {
  const [selectedDependencies, setSelectedDependencies] = useState<any[]>([]);

  const handleDependencyToggle = (dependency: any) => {
    setSelectedDependencies(prev => {
      const isSelected = prev.some(s => s.id === dependency.id);
      if (isSelected) {
        return prev.filter(s => s.id !== dependency.id);
      } else {
        const maxLimit = maxInputs === "unlimited" ? 10 : maxInputs as number;
        if (prev.length >= maxLimit) {
          toast.error(`Maximum ${maxLimit} dependencies allowed`);
          return prev;
        }
        return [...prev, dependency];
      }
    });
  };

  const handleSubmit = () => {
    if (selectedDependencies.length > 0) {
      onSubmit(selectedDependencies);
    } else {
      toast.error("Please select at least one dependency");
    }
  };

  const maxLimit = maxInputs === "unlimited" ? 10 : maxInputs as number;

  return (
    <div className="multi-dependency-select-form p-4 border rounded-lg bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-4">
        Select nodes to connect ({selectedDependencies.length}/{maxLimit === 10 ? "multiple" : maxLimit})
      </h3>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {dependencies.map((dependency) => (
          <div key={dependency.id} className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={`dependency-${dependency.id}`}
              checked={selectedDependencies.some(s => s.id === dependency.id)}
              onChange={() => handleDependencyToggle(dependency)}
              className="rounded"
            />
            <label
              htmlFor={`dependency-${dependency.id}`}
              className="flex-1 cursor-pointer text-sm"
            >
              <div className="font-medium">{dependency.data.title || dependency.data.label}</div>
              <div className="text-gray-500 text-xs">Type: {dependency.data.label}</div>
            </label>
          </div>
        ))}
      </div>
      <div className="flex justify-end space-x-2 mt-4">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={selectedDependencies.length === 0}>
          Connect Selected ({selectedDependencies.length})
        </Button>
      </div>
    </div>
  );
};

const FlowChatPanel = () => {
  const { id } = useParams<{ id: string }>();
  const { selectNode, revertOrSaveData, setSelectedNode } = useFlow();
  const [nodeFormData, setNodeFormDataLocal] = useState<any[]>([]);
  const {
    conversionLogs, terminalLogs, pipelineDtl, handleRun, handleStop, handleNext, handleSourceUpdate, updateSetNode,
    handleLeavePage,
    handleFormSubmit,
    setShowLeavePrompt,
    handleNodesChange,
    handleEdgesChange,
    handleDialogClose,
    setSelectedSchema,
    setFormStates,
    setIsFormOpen,
    formStates,
    setRunDialogOpen,
    setSelectedFormState,
    handleRunClick,
    handleCut,
    handleUndo,
    handleRedo,
    handleLogsClick,
    handleKeyDown,
    handleAlignHorizontal,
    handleAlignVertical,
    debuggedNodes,
    debuggedNodesList,
    isPipelineRunning,
    isCanvasLoading,
    onConnect,
    handleDebugToggle,
    handleCopy,
    handlePaste,
    handleSearchResultClick,
    handleZoomIn,
    handleZoomOut,
    handleCenter,
    transformationCounts,
    highlightedNodeId,
    showLogs,
    nodes,
    edges,
    selectedSchema,
    sourceColumns,
    isFormOpen,
    showLeavePrompt,
    ctrlDTimeout,
    hasUnsavedChanges,
    setShowLogs,
    handleNodeClick,
    isNodeFormOpen,
    setIsNodeFormOpen,
    setNodes
  } = usePipelineContext();

  const token: any = sessionStorage?.getItem("token");
  const decoded: any = token ? jwtDecode(token) : null;

  // Function to generate unique message IDs
  const generateMessageId = () => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Helper function to get avatar initials
  const getAvatarInitials = (role: 'user' | 'assistant', msgOwner?: string): string => {
    if (role === 'assistant') {
      return 'AI'; // Always show AI for assistant messages
    } else {
      // For user messages, try to get initials from JWT token
      console.log('Getting avatar for user, JWT decoded object:', decoded); // Debug log

      // Try different JWT token properties
      let userInitials = '';

      if (decoded?.name) {
        const nameParts = decoded.name.split(' ');
        if (nameParts.length >= 2) {
          userInitials = (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase();
        } else {
          userInitials = nameParts[0].substring(0, 2).toUpperCase();
        }
      } else if (decoded?.username || decoded?.userName) {
        const username = decoded.username || decoded.userName;
        userInitials = username.substring(0, 2).toUpperCase();
      } else if (decoded?.email) {
        userInitials = decoded.email.substring(0, 2).toUpperCase();
      } else if (decoded?.first_name && decoded?.last_name) {
        userInitials = (decoded.first_name.charAt(0) + decoded.last_name.charAt(0)).toUpperCase();
      } else if (decoded?.first_name) {
        userInitials = decoded.first_name.substring(0, 2).toUpperCase();
      } else if (decoded?.sub) {
        // JWT 'sub' field often contains user identifier
        userInitials = decoded.sub.substring(0, 2).toUpperCase();
      } else if (msgOwner) {
        userInitials = msgOwner.substring(0, 2).toUpperCase();
      } else {
        userInitials = 'U'; // Default fallback for user
      }

      console.log('User initials result:', userInitials); // Debug log
      return userInitials;
    }
  };

  // Get module types for flow nodes
  const [moduleTypes] = useModules();
  // Create flow nodes similar to how they're created in PlaygroundHeader
  const flowNodes = moduleTypes.map((type) => {
    return {
      "ui_properties": {
        "module_name": type.label,
        "color": type.color,
        "icon": type.icon,
        "id": type.id,
        "ports": {
          "inputs": type.label?.toLowerCase()?.toString() == "sensor" ? 0 : 1,
          "outputs": 1,
          "maxInputs": type.label?.toLowerCase()?.toString() == "sensor" ? 0 : (type.maxInputs || 1)
        },
        meta: {
          type: type?.type,
          moduleInfo: {
            color: type?.color,
            icon: type?.icon,
            label: type?.label,
          },
          properties: type.operators?.map((op) => op.properties),
          description: type?.description,
          fullyOptimized: false,
        }
      }
    };
  });

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [lastAddedNodeId, setLastAddedNodeId] = useState<string | null>(null);
  const [lastAddedNodeName, setLastAddedNodeName] = useState<string | null>(null);

  // Add a local state to track nodes for immediate access
  const [localNodes, setLocalNodes] = useState<any[]>([]);

  // Add a state to track whether we're showing the form inline or in a dialog
  const [showFormInline, setShowFormInline] = useState<boolean>(true);

  // Add states for transformation dropdown
  const [showTransformationDropdown, setShowTransformationDropdown] = useState(false);
  const [lastAddedTransformation, setLastAddedTransformation] = useState<any>(null);

  // Helper function to apply alignment with proper timing
  const applyNodeAlignment = useCallback((delay: number = 500) => {
    setTimeout(() => {
      if (handleAlignHorizontal) {
        handleAlignHorizontal();
        
        // Force a re-render of the ReactFlow component
        window.dispatchEvent(new Event('resize'));
        
        // Call alignment again after a short delay to ensure proper positioning
        setTimeout(() => {
          handleAlignHorizontal();
          window.dispatchEvent(new Event('resize'));
        }, 200);
      }
    }, delay);
  }, [handleAlignHorizontal]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        setTimeout(() => {
          scrollContainer.scrollTo({
            top: scrollContainer.scrollHeight,
            behavior: 'smooth'
          });
        }, 300);
      }
    }
  }, [messages]);

  // Sync pipeline context nodes with local nodes when pipeline context nodes change
  useEffect(() => {
    if (nodes && Array.isArray(nodes)) {
      let hasNewNodes = false;
      
      // For each node in the pipeline context, check if it's in our local nodes
      nodes.forEach(node => {
        const existsInLocalNodes = localNodes.some(localNode => localNode.id === node.id);

        // If not in local nodes, add it
        if (!existsInLocalNodes) {
          setLocalNodes(prevLocalNodes => [...prevLocalNodes, node]);
          hasNewNodes = true;
        }
      });

      console.log('Synced nodes from pipeline context:', nodes);
      
      // Apply alignment if new nodes were added
      if (hasNewNodes) {
        applyNodeAlignment(300);
      }
    }
  }, [nodes, localNodes, applyNodeAlignment]);

  // Function to handle creating a flow
  const handleCreateFlow = () => {
    // Add user message
    setMessages(prevMessages => [
      ...prevMessages,
      { role: 'user', content: 'Create Flow', id: generateMessageId() }
    ]);

    // Show transformation dropdown after a delay
    setTimeout(() => {
      handleShowTransformations();
    }, 500);
  };

  // Function to show transformation dropdown
  const handleShowTransformations = () => {
    // Add assistant message asking to select a transformation
    setMessages(prevMessages => [
      ...prevMessages,
      {
        role: 'assistant',
        content: 'Select a transformation to add to your flow:'
      }
    ]);

    setTimeout(() => {
      setShowTransformationDropdown(true);
    }, 300);
  };

  // Handle transformation selection from dropdown
  const handleTransformationSelection = (transformationName: string) => {
    setShowTransformationDropdown(false);

    // Find the selected transformation from flowNodes
    const selectedNode = flowNodes.find(
      node => node.ui_properties.module_name === transformationName
    );

    if (!selectedNode) {
      toast.error("Transformation not found. Please try again.");
      return;
    }

    // Add user message showing the selected transformation
    setMessages(prevMessages => [
      ...prevMessages,
      {
        role: 'user',
        content: `Add ${transformationName} transformation`
      },
    ]);

    // Store the transformation info for later use
    const transformationInfo = {
      type: selectedNode.ui_properties.module_name,
      maxInputs: selectedNode.ui_properties.ports.maxInputs,
      node: selectedNode
    };



    // Set the last added transformation to track in useEffect
    setLastAddedTransformation(transformationInfo);

    // Add the transformation node to the flow
    handleAddModule(selectedNode);
  };

  // Track node changes to handle dependency selection
  useEffect(() => {
    if (nodes.length > 0 && lastAddedTransformation) {
      const lastNode = nodes[nodes.length - 1];

      // Check if this is a new node that needs dependencies
      // Compare against the base module name, not the exact label (which may have numbers)
      const baseModuleName = lastAddedTransformation.type;
      const nodeBaseName = lastNode?.data?.label?.replace(/ \d+$/, ''); // Remove trailing numbers like " 2"
      
      if (lastNode && (lastNode.data.label === lastAddedTransformation.type || nodeBaseName === baseModuleName)) {
        // Check if the transformation needs dependencies
        const maxInputs = lastAddedTransformation.maxInputs;

        // Check if it's a sensor node
        if (lastAddedTransformation.type.toLowerCase() === 'sensor') {
          // For sensor nodes, show the form directly
          setLastAddedTransformation(null);
          setTimeout(() => {
            handleOpenNodeForm();
          }, 500);
        } else if (maxInputs > 0 || maxInputs === "unlimited") {
          // For other nodes, ask for dependencies first
          setLastAddedTransformation(null);
          setTimeout(() => {
            askForDependencies(lastAddedTransformation.node, maxInputs, lastNode.id);
          }, 500);
        } else {
          // No dependencies needed, show transformation selection again
          setLastAddedTransformation(null);
          setTimeout(() => {
            handleShowTransformations();
          }, 300);
        }
      }
    }
  }, [nodes, lastAddedTransformation]);

  // Function to ask for dependencies
  const askForDependencies = (node: any, maxInputs: number | string, targetNodeId: string) => {
    // Get all available nodes from both localNodes and pipeline context nodes
    const allNodes = [...localNodes, ...nodes];
    
    // Remove duplicates based on node ID and filter out the target node
    const uniqueNodes = allNodes.filter((node, index, self) => 
      index === self.findIndex(n => n.id === node.id) && node.id !== targetNodeId
    );
    
    const availableDependencies = uniqueNodes;

    if (availableDependencies.length === 0) {
      // No available dependencies, show form directly
      setTimeout(() => {
        handleOpenNodeForm();
      }, 300);
      return;
    }

    // Create a message asking for dependencies
    const dependencyMessage = maxInputs === 1 ?
      `Select a node to connect to:` :
      `The ${node.ui_properties.module_name} transformation can have up to ${maxInputs === "unlimited" ? "multiple" : maxInputs} dependencies. Select nodes to connect to:`;

    // Show message asking for dependencies
    setTimeout(() => {
      const isSingleInput = maxInputs === 1;

      setMessages(prevMessages => [
        ...prevMessages,
        {
          role: 'assistant',
          content: dependencyMessage,
          formData: {
            schema: { type: 'dependency-select' },
            sourceColumns: [],
            currentNodeId: `dependency-select-${targetNodeId}`,
            initialValues: {},
            isTarget: false,
            isSingleDependencySelect: isSingleInput,
            isMultiDependencySelect: !isSingleInput,
            dependencyData: {
              dependencies: availableDependencies,
              targetNodeType: node,
              targetNodeId: targetNodeId,
              maxInputs: maxInputs
            }
          }
        }
      ]);
    }, 300);
  };

  // Handle dependency selection
  const handleDependencySelection = (selectedDependencies: any[], targetNodeId: string) => {
    // Add user message showing the selection
    const dependencyNames = selectedDependencies.map(dep => dep.data.title || dep.data.label).join(', ');
    setMessages(prevMessages => [
      ...prevMessages,
      {
        role: 'user',
        content: `Connected to: ${dependencyNames}`
      }
    ]);

    // Create connections between the selected dependencies and the target node
    selectedDependencies.forEach(dependency => {
      const connection = {
        source: dependency.id,
        target: targetNodeId,
        sourceHandle: null,
        targetHandle: null
      };
      
      // Use the onConnect function from the pipeline context to create the connection
      if (onConnect) {
        onConnect(connection);
      } else {
        console.warn('onConnect function not available');
      }
    });

    // Apply horizontal alignment after connections are made
    applyNodeAlignment(300);

    // After dependency selection and connection creation, show the form
    setTimeout(() => {
      handleOpenNodeForm();
    }, 500); // Increased timeout to allow connections to be processed
  };

  // Dummy action handler for demonstration purposes
  const handleDummyAction = (action: string) => {
    // Add user message
    setMessages(prevMessages => [
      ...prevMessages,
      { role: 'user', content: action }
    ]);

    // Add assistant response
    setTimeout(() => {
      if (action === 'Create new flow') {
        handleShowTransformations();
      } else if (action === 'Connect modules') {
        setMessages(prevMessages => [
          ...prevMessages,
          {
            role: 'assistant',
            content: 'To connect modules, you need at least two modules in your flow. Would you like to add more transformations first?',
            suggestions: [
              { text: 'Add transformation', onClick: () => handleShowTransformations() },
              { text: 'Configure existing module', onClick: () => handleOpenNodeForm() }
            ]
          }
        ]);
      } else {
        setMessages(prevMessages => [
          ...prevMessages,
          {
            role: 'assistant',
            content: `I can help you with "${action}". What would you like to do next?`,
            suggestions: [
              { text: 'Add transformation', onClick: () => handleShowTransformations() },
              { text: 'Configure module', onClick: () => handleOpenNodeForm() }
            ]
          }
        ]);
      }
    }, 500);
  };

  // Handler for opening node form
  const handleOpenNodeForm = useCallback(() => {
    console.log('Synced nodes from pipeline context:', nodes);
    console.log('Local nodes:', localNodes);

    // Try to get the node from localNodes first, then fall back to nodes
    let nodeArray = localNodes.length > 0 ? localNodes : nodes;

    // Get the latest node
    if (nodeArray && nodeArray.length > 0) {
      let node: any = nodeArray[nodeArray.length - 1];
      node.selected = true;
      console.log('Selected node for form:', node);

      if (node) {
        // Set the selected node in the Flow context
        setSelectedNode(node);

        // Set the selected node ID for the form
        const nodeId = node.id || node.data?.id;
        console.log('Setting node ID:', nodeId);

        if (nodeId) {
          setSelectedNodeId(nodeId);

          if (showFormInline) {
            // Add a message with the node form embedded
            setMessages(prevMessages => [
              ...prevMessages,
              {
                role: 'assistant',
                content: `Configure your module:`,
                nodeForm: {
                  nodeId: nodeId,
                  showInline: true,
                  onSave: () => {
                    // Add a success message when the form is saved
                    setMessages(prevMessages => [
                      ...prevMessages,
                      {
                        role: 'assistant',
                        content: 'Configuration saved successfully!'
                      }
                    ]);
                    
                    // Apply horizontal alignment after form save
                    applyNodeAlignment(200);
                    
                    // Directly show transformation selection after a short delay
                    setTimeout(() => {
                      handleShowTransformations();
                    }, 500);
                  }
                }
              }
            ]);
          } else {
            // Open the form dialog after a short delay to ensure state is updated
            setTimeout(() => {
              console.log('Opening node form for node ID:', nodeId);
              setIsNodeFormOpen(true);
            }, 200);
          }
        } else {
          console.error('Node has no ID:', node);
        }
      } else {
        console.error('Invalid node structure:', node);
      }
    } else {
      console.error('No nodes available in either localNodes or nodes');
    }
  }, [nodes, localNodes, setSelectedNode, setSelectedNodeId, setIsNodeFormOpen, showFormInline, setMessages]);


  // Handle adding a module to the flow
  const handleAddModule = (node) => {
    // Generate a unique ID for the new node
    const uniqueId = `${node.ui_properties.module_name}_${Date.now()}`;

    // Store the node ID and name for later use in configuration
    setLastAddedNodeId(uniqueId);
    setLastAddedNodeName(node.ui_properties.module_name);

    // Calculate position based on existing nodes to avoid overlap
    const baseModuleName = node.ui_properties.module_name;
    const existingNodes = (localNodes.length > 0 ? localNodes : nodes).filter(n =>
      n.data?.label?.toLowerCase().startsWith(baseModuleName.toLowerCase())
    );
    const nodeNumber = existingNodes.length + 1;
    const nodeLabel = existingNodes.length > 0
      ? `${baseModuleName} ${nodeNumber}`
      : baseModuleName;

    // Find the last node's position to calculate new position
    const allNodes = localNodes.length > 0 ? localNodes : nodes;
    const lastNode = allNodes && allNodes.length > 0 ? allNodes[allNodes.length - 1] : null;
    const basePosition = lastNode ? {
      x: lastNode.position.x + 150,
      y: lastNode.position.y
    } : {
      x: 50 + random(0, 50), // Add some randomness to avoid exact overlap
      y: 100
    };

    // Try to use the handleNodeClick function from the pipeline context
    if (typeof handleNodeClick === 'function') {
      try {
        const nodeWithUniqueId = {
          ...node,
          ui_properties: {
            ...node.ui_properties,
            id: uniqueId
          }
        };

        // Create a new node object that matches the structure expected in the pipeline context
        const newNode = {
          id: uniqueId,
          type: 'custom',
          position: basePosition,
          data: {
            label: nodeLabel,
            icon: node.ui_properties.icon,
            ports: node.ui_properties.ports,
            id: uniqueId,
            meta: node.ui_properties.meta,
            selectedData: node.ui_properties.type,
            title: nodeLabel,
            transformationData: {
              name: nodeLabel,
              nodeId: uniqueId
            }
          }
        };

        // Store the new node in a local state to use it immediately
        setLocalNodes(prevLocalNodes => [...prevLocalNodes, newNode]);

        // Use the handleNodeClick function from DataPipelineContext
        handleNodeClick(nodeWithUniqueId, null);
        setNodes(prevNodes => [...prevNodes, newNode]);

        // Get the current nodes and add the new node
        const updatedNodes = [...nodes, newNode];
        updateSetNode(updatedNodes, edges);

        // Apply horizontal alignment after adding the node with improved timing
        applyNodeAlignment(500);
        
        // Additional alignment call after nodes are fully rendered
        applyNodeAlignment(1000);

        // Add a success message
        setMessages(prevMessages => [
          ...prevMessages,
          {
            role: 'assistant',
            content: `Added ${nodeLabel} module to your flow.`
          }
        ]);
      } catch (error) {
        console.log('Error adding module:', error);

        // Add a fallback message
        setMessages(prevMessages => [
          ...prevMessages,
          {
            role: 'assistant',
            content: `This is a UI-only version. The module would be added in a full implementation.`
          }
        ]);
      }
    } else {
      // Add a fallback message for UI-only version
      setMessages(prevMessages => [
        ...prevMessages,
        {
          role: 'assistant',
          content: `This is a UI-only version. The ${node.ui_properties.module_name} module would be added in a full implementation.`
        }
      ]);
    }
  };

  // Handle user input
  const handleSend = () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    // Add user message
    setMessages([...messages, { role: 'user', content: trimmedInput }]);
    setInput('');

    // Add a typing indicator and response
    setTimeout(() => {
      setMessages(prevMessages => [
        ...prevMessages,
        {
          role: 'assistant',
          content: 'I can help you create and manage your flow. What would you like to do?',
          suggestions: [
            { text: 'Add transformation', onClick: () => handleShowTransformations() },
            { text: 'Connect modules', onClick: () => handleDummyAction('Connect modules') },
            { text: 'Configure module', onClick: handleOpenNodeForm }
          ]
        }
      ]);
    }, 500);
  };

  // Render the chat panel UI
  return (
    <div className="h-full w-full flex flex-col">
      <ScrollArea ref={scrollAreaRef} className="flex-1 w-full">
        <div className="px-3 py-2 w-full mx-auto">
          {messages.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-green-500 flex-shrink-0" />
                <div className="flex-1 rounded-lg bg-gray-100 px-3 py-1.5 shadow-sm">
                  <p className="text-base font-medium text-gray-800">How can I assist you with your flow?</p>
                </div>
              </div>
              <div className="ml-8">
                <SuggestionButton
                  text="Create Flow"
                  onClick={handleCreateFlow}
                  assistantColor="#009459"
                />
              </div>
            </motion.div>
          ) : (
            <>
              {messages.map((message, index) => (
                <div key={index} className="flex flex-col gap-1.5 py-1.5">
                  {/* Only render message bubble if there's content */}
                  {message.content && message.content.trim() !== '' && (
                    <div className="flex items-start gap-2">
                      <div
                        className="w-6 h-6 mt-1 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-medium"
                        style={{ backgroundColor: message.role === 'assistant' ? '#009459' : '#000000' }}
                      >
                        {getAvatarInitials(message.role, message.msg_owner)}
                      </div>
                      <div
                        className={`flex-1 rounded-lg px-3 py-2 shadow-sm ${message.role === 'assistant'
                          ? 'bg-gray-100 text-black'
                          : 'bg-gradient-to-r from-white to-slate-50'
                          }`}
                      >
                        <p className="whitespace-pre-wrap leading-relaxed text-sm">{message.content}</p>
                      </div>
                    </div>
                  )}

                  {/* Render suggestion buttons if they exist */}
                  {message.role === 'assistant' && message.suggestions && (
                    <div className="flex flex-wrap gap-1.5 pl-8">
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

                  {/* Show a message if this message is related to node configuration */}
                  {message.nodeForm && (
                    <div className="pl-8 mt-2 bg-white rounded-lg shadow-sm">

                        {message.nodeForm.showInline ? (
                          // Show the NodeForm inline in the chat
                            <NodeForm
                              id={message.nodeForm.nodeId}
                              closeTap={() => message.nodeForm?.onSave?.()}
                            />
                        ) : (
                          // Show a message that the form is displayed separately
                          <div className="p-4 border border-dashed rounded-md flex items-center justify-center">
                            <p className="text-gray-500">
                              The module configuration panel is now displayed separately.
                            </p>
                          </div>
                        )}
                    </div>
                  )}

                  {/* Render form data components similar to PipeLineChatPanel */}
                  {message.formData && message.formData.isSingleDependencySelect && (
                    <div className="pl-8 mt-2 bg-white rounded-lg shadow-sm">
                      <div className="form-wrapper">
                        <SingleDependencySelectForm
                          dependencies={message.formData.dependencyData?.dependencies || []}
                          onSubmit={(selectedDependency) => {
                            handleDependencySelection([selectedDependency], message.formData.dependencyData?.targetNodeId || '');
                          }}
                          onClose={() => {
                            // Handle form close
                          }}
                          targetNodeType={message.formData.dependencyData?.targetNodeType}
                          targetNodeId={message.formData.dependencyData?.targetNodeId || ''}
                          maxInputs={message.formData.dependencyData?.maxInputs || 1}
                        />
                      </div>
                    </div>
                  )}

                  {/* Multi-dependency selection form */}
                  {message.formData && message.formData.isMultiDependencySelect && (
                    <div className="pl-8 mt-2 bg-white rounded-lg shadow-sm">
                      <div className="form-wrapper">
                        <MultiDependencySelectForm
                          dependencies={message.formData.dependencyData?.dependencies || []}
                          onSubmit={(selectedDependencies) => {
                            handleDependencySelection(selectedDependencies, message.formData.dependencyData?.targetNodeId || '');
                          }}
                          onClose={() => {
                            // Handle form close
                          }}
                          targetNodeType={message.formData.dependencyData?.targetNodeType}
                          targetNodeId={message.formData.dependencyData?.targetNodeId || ''}
                          maxInputs={message.formData.dependencyData?.maxInputs || 'unlimited'}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}

          {/* Transformation Dropdown */}
          {showTransformationDropdown && (
            <div className="px-3 py-2">
              <div className=" mt-2 bg-white rounded-lg shadow-sm ">
                <Select onValueChange={(value) => {
                  handleTransformationSelection(value);
                }}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a transformation..." />
                  </SelectTrigger>
                  <SelectContent style={{ zIndex: 9999 }}>
                    {flowNodes.map((node) => (
                      <SelectItem key={node.ui_properties.id} value={node.ui_properties.module_name}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: node.ui_properties.color }}
                          />
                          {node.ui_properties.module_name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      {/* Only show the Dialog when not in inline form mode */}
      <Dialog
        open={isNodeFormOpen && !showFormInline}
        onOpenChange={(open) => {
          if (!open) {
            if (selectedNodeId) {
              revertOrSaveData(selectedNodeId, false);
            }
            setSelectedNodeId(null);
          }
          setIsNodeFormOpen(open);
        }}
      >
        <DialogContent className="max-w-[60%] max-h-[80vh]">
          <div className="max-h-[calc(100vh-10rem)] overflow-y-auto pb-4">
            <h2 className="text-xl font-semibold mb-4">
              {lastAddedNodeName ? `${lastAddedNodeName} Configuration` : 'Module Configuration'}
            </h2>

            {selectedNodeId ? (
              <div key={`node-form-${selectedNodeId}`}>
                <div className="mb-4 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-600">Node ID: {selectedNodeId}</p>
                  {lastAddedNodeName && (
                    <p className="text-sm text-gray-600 mt-1">Module Type: {lastAddedNodeName}</p>
                  )}
                </div>
                <NodeForm
                  id={selectedNodeId}
                  closeTap={() => {
                    setIsNodeFormOpen(false);

                    // Add a message to show the action
                    setMessages(prevMessages => [
                      ...prevMessages,
                      {
                        role: 'assistant',
                        content: 'Configuration saved successfully!'
                      }
                    ]);
                    
                    // Directly show transformation selection after a short delay
                    setTimeout(() => {
                      handleShowTransformations();
                    }, 500);
                  }}
                />
              </div>
            ) : (
              <div className="p-4 border border-dashed rounded-md">
                <p className="text-gray-500">No node selected for configuration</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <div className="p-2 border-t border-slate-200 bg-white">
        <AIChatInput
          variant='designer'
          input={input}
          onChange={setInput}
          onSend={handleSend}
          placeholder="Type a message..."
          enableVoiceInput={true}
          disabled={false}
          isLoading={false}
          nodes={nodes}
          edges={edges}
          pipelineDtl={pipelineDtl}
        />
      </div>
    </div>
  );
};

export default FlowChatPanel;