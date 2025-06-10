/**
 * FlowChatPanel Component
 * 
 * This component provides a chat interface UI for the flow designer.
 * All functionality has been removed, keeping only the UI elements.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AIChatInput } from '@/components/shared/AIChatInput';
import SuggestionButton from '../../pipeline/components/SuggestionButton';
import { useFlow } from '@/context/designers/FlowContext';
import { usePipelineContext } from '@/context/designers/DataPipelineContext';
import { useAppSelector } from '@/hooks/useRedux';
import { RootState } from '@/store';
import { useModules } from '@/hooks/useModules';
import { DialogContent } from '@radix-ui/react-dialog';
import { Dialog } from '@/components/ui/dialog';
import { NodeForm } from '@/components/bh-reactflow-comps/flow/flow/subcomponents/NodeForm';
import { flow } from 'lodash';

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
  nodeForm?: {
    nodeId: string;
    onSave: () => void;
    showInline?: boolean; // Flag to indicate if the form should be shown inline
  };
};

const FlowChatPanel = () => {
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
 
  // Get module types for flow nodes
  const [moduleTypes] = useModules();
  console.log(nodes)
  // Create flow nodes similar to how they're created in PlaygroundHeader
  const flowNodes = moduleTypes.map((type) => {
    return {
      "ui_properties": {
        "module_name": type.label,
        "color": type.color,
        "icon": type.icon,
        "id": type.id,
        "ports": {
          "inputs": type.label?.toLowerCase()?.toString()=="sensor"?0:1,
          "outputs": 1,
          "maxInputs": 1
        },
        meta: {
          type: type?.type,
          moduleInfo: {
            color: type?.color,
            icon: type?.icon,
            label: type?.label,
          },
          properties:  type.operators?.map((op) => op.properties),
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
    if ( nodes && Array.isArray(nodes)) {
      // For each node in the pipeline context, check if it's in our local nodes
      nodes.forEach(node => {
        const existsInLocalNodes = localNodes.some(localNode => localNode.id === node.id);
        
        // If not in local nodes, add it
        if (!existsInLocalNodes) {
          setLocalNodes(prevLocalNodes => [...prevLocalNodes, node]);
        }
      });
      
      console.log('Synced nodes from pipeline context:', nodes);
    }
  }, [nodes, localNodes]);

  // Initialize with a welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: 'How can I assist you with your flow today?',
          suggestions: [
            { text: 'Create a new flow', onClick: () => handleDummyAction('Create new flow') },
            { text: 'Connect modules', onClick: () => handleDummyAction('Connect modules') }
          ]
        }
      ]);
    }
  }, []);

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
        // Show flow nodes as suggestion buttons
        setMessages(prevMessages => [
          ...prevMessages,
          {
            role: 'assistant',
            content: "Let's create a new flow. Here are the available modules you can add to your flow:",
            suggestions: flowNodes.map(node => ({
              text: node.ui_properties.module_name,
              onClick: () => handleAddModule(node)
            }))
          }
        ]);
      } else {
        setMessages(prevMessages => [
          ...prevMessages,
          {
            role: 'assistant',
            content: `This is a UI-only version. The "${action}" functionality has been removed.`,
            suggestions: [
              { text: 'Show another option', onClick: () => handleDummyAction('Show another option') },
              { text: 'Open configuration', onClick: () => handleOpenNodeForm() }
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
      let node:any = nodeArray[nodeArray.length-1];
      node.selected=true;
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
                        content: 'Configuration saved. What would you like to do next?',
                        suggestions: [
                          { text: 'Add another module', onClick: () => handleDummyAction('Create new flow') },
                          { text: 'Connect modules', onClick: () => handleDummyAction('Connect modules') }
                        ]
                      }
                    ]);
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
    
    // Add user message
    setMessages(prevMessages => [
      ...prevMessages,
      { role: 'user', content: `Add ${node.ui_properties.module_name} module` }
    ]);
    
    // Try to use the handleNodeClick function from the pipeline context
    if ( typeof handleNodeClick === 'function') {
      try {
        const nodeWithUniqueId = {
          ...node,
          ui_properties: {
            ...node.ui_properties,
            id: uniqueId
          }
        };
        
        // Create a new node object that matches the structure expected in the pipeline context
        // This is a workaround for the state update delay
        const newNode = {
          id: uniqueId,
          type: 'custom',
          position: { x: 50, y: 100 },
          data: {
            label: node.ui_properties.module_name,
            icon: node.ui_properties.icon,
            ports: node.ui_properties.ports,
            id: uniqueId,
            meta: node.ui_properties.meta,
            selectedData: node.ui_properties.type,
            title: node.ui_properties.module_name,
            transformationData: {
              name: node.ui_properties.module_name,
              nodeId: uniqueId
            }
          }
        };
        
        // Store the new node in a local state to use it immediately
        // This is a workaround for the state update delay in the pipeline context
        setLocalNodes(prevLocalNodes => [...prevLocalNodes, newNode]);
        
        // Use the handleNodeClick function from DataPipelineContext
        handleNodeClick(nodeWithUniqueId, null);
        setNodes(prevNodes => [...prevNodes, newNode]);
        
        // Get the current nodes and add the new node
        const updatedNodes = [...nodes, newNode];
        updateSetNode(updatedNodes, []);
        
        // Add a success message with configuration option
        setMessages(prevMessages => [
          ...prevMessages,
          {
            role: 'assistant',
            content: `Added ${node.ui_properties.module_name} module to your flow. Would you like to configure this module now?`,
            suggestions: [
              // Store a reference to the newly created node and pass it directly
              { text: 'Configure module', onClick: () => {
                // Create a direct reference to the node we just created
                const createdNode = newNode;
                console.log('Configuring node directly:', createdNode);
                
                // Set the selected node directly
                setSelectedNode(createdNode);
                setSelectedNodeId(createdNode.id);
                
                // Add a message with the node form embedded
                setMessages(prevMessages => [
                  ...prevMessages,
                  {
                    role: 'assistant',
                    content: `Configure your ${node.ui_properties.module_name} module:`,
                    nodeForm: {
                      nodeId: createdNode.id,
                      showInline: true,
                      onSave: () => {
                        // Add a success message when the form is saved
                        setMessages(prevMessages => [
                          ...prevMessages,
                          {
                            role: 'assistant',
                            content: 'Configuration saved. What would you like to do next?',
                            suggestions: [
                              { text: 'Add another module', onClick: () => handleDummyAction('Create new flow') },
                              { text: 'Connect modules', onClick: () => handleDummyAction('Connect modules') }
                            ]
                          }
                        ]);
                      }
                    }
                  }
                ]);
              }},
              { text: 'Add another module', onClick: () => handleDummyAction('Create new flow') },
              { text: 'Connect modules', onClick: () => handleDummyAction('Connect modules') }
            ]
          }
        ]);
      } catch (error) {
        console.log('Error adding module:', error);
        
        // Add a fallback message with configuration option
        setMessages(prevMessages => [
          ...prevMessages,
          {
            role: 'assistant',
            content: `This is a UI-only version. The module would be added in a full implementation. Would you like to configure this module now?`,
            suggestions: [
              { text: 'Configure module', onClick: () => handleOpenNodeForm() },
              { text: 'Add another module', onClick: () => handleDummyAction('Create new flow') },
              { text: 'Connect modules', onClick: () => handleDummyAction('Connect modules') }
            ]
          }
        ]);
      }
    } else {
      // Add a fallback message for UI-only version with configuration option
      setMessages(prevMessages => [
        ...prevMessages,
        {
          role: 'assistant',
          content: `This is a UI-only version. The ${node.ui_properties.module_name} module would be added in a full implementation. Would you like to configure this module now?`,
          suggestions: [
            { text: 'Configure module', onClick: () => handleOpenNodeForm() },
            { text: 'Add another module', onClick: () => handleDummyAction('Create new flow') },
            { text: 'Connect modules', onClick: () => handleDummyAction('Connect modules') }
          ]
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
          content: 'This is a UI-only version of the chat. Your message was received, but no processing functionality is implemented.',
          suggestions: [
            { text: 'Create a new flow', onClick: () => handleDummyAction('Create new flow') },
            { text: 'Connect modules', onClick: () => handleDummyAction('Connect modules') },
            { text: 'Configure module', onClick: handleOpenNodeForm }
          ]
        }
      ]);
    }, 500);
  };

  // Render the chat panel UI
  return (
    <div className="flex flex-col h-full p-4">
      {/* Message Area */}
      <div className="flex-1 mt-2 overflow-hidden">
        <ScrollArea className="h-full pr-2" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message, i) => (
              <div
                key={i}
                className="flex flex-col gap-3 mb-4"
              >
                {/* Message sender indicator */}
                <div className="text-xs font-medium text-gray-500 mb-1">
                  {message.role === "assistant" ? "Assistant" : "You"}
                </div>
                
                {/* Message content */}
                <div
                  className={`rounded-lg px-4 py-2 w-full relative ${
                    message.role === "assistant" ? "bg-gray-100 text-black" : "bg-blue-100 text-blue-900"
                  }`}
                >
                  <div className="whitespace-pre-wrap break-words">{message.content}</div>

                  {/* Show a message if this message is related to node configuration */}
                  {message.nodeForm && (
                    <div className="mt-4 w-full bg-white rounded-lg shadow-lg p-4 border border-gray-200">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-semibold">Module Configuration</h3>
                        <div className="text-xs text-gray-500">
                          ID: {message.nodeForm.nodeId.substring(0, 8)}...
                        </div>
                      </div>
                      
                      {message.nodeForm.showInline ? (
                        // Show the NodeForm inline in the chat
                        <div className="border rounded-md p-4 bg-gray-50">
                          <NodeForm
                            id={message.nodeForm.nodeId}
                            closeTap={() => message.nodeForm?.onSave?.()}
                          />
                        </div>
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
                </div>

                {/* Render suggestion buttons if available */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-4 grid grid-cols-1 gap-2">
                    {message.suggestions.map((suggestion, index) => (
                      <SuggestionButton
                        key={index}
                        text={suggestion.text}
                        onClick={suggestion.onClick}
                        assistantColor="#009f59"
                        index={index}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
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
                                                    content: 'Configuration saved. What would you like to do next?',
                                                    suggestions: [
                                                        { text: 'Add another module', onClick: () => handleDummyAction('Create new flow') },
                                                        { text: 'Connect modules', onClick: () => handleDummyAction('Connect modules') }
                                                    ]
                                                }
                                            ]);
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
        </ScrollArea>
      </div>

      {/* Node Configuration Panel is now handled by the Dialog */}

      {/* Input Area */}
      <div className="flex gap-2 mt-4 flex-shrink-0">
        <AIChatInput
          input={input}
          onChange={setInput}
          onSend={handleSend}
          placeholder="Ask about your flow..."
        />
      </div>
    </div>
  );
};

export default FlowChatPanel;