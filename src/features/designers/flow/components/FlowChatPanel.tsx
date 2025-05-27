import React, { useState, useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AIChatInput } from '@/components/shared/AIChatInput';
import { motion } from 'framer-motion';
import SuggestionButton from '../../pipeline/components/SuggestionButton';
import { useFlow } from '@/context/designers/FlowContext';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { RootState } from '@/store';
import { useModules } from '@/hooks/useModules';
import { createShortUUID } from '@/lib/utils';
import { usePipelineContext } from '@/context/designers/DataPipelineContext';
import { NodeForm } from '@/components/bh-reactflow-comps/flow/flow/subcomponents/NodeForm/NodeForm';
// Dialog import removed as we're now embedding the form in the chat

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
  };
};

const FlowChatPanel = () => {
  const dispatch = useAppDispatch();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [moduleTypes] = useModules();
  const { selectedFlow } = useAppSelector((state: RootState) => state.flow);

  // State variables for NodeForm dialog removed as we're now embedding the form in the chat

  // Get all needed functions and data from DataPipelineContext
  const { 
    handleNodeClick, 
    addNodeToHistory, 
    updateSetNode, 
    nodes: pipelineNodes, 
    edges: pipelineEdges 
  } = usePipelineContext();

  const {
    nodes,
    edges,
    setEdges,
    updateNodeFormData,
    saveFlow,
    setIsSaving,
    setIsSaved,
    selectedFlowId,
    nodeFormData,
    selectNode,
    revertOrSaveData
  } = useFlow();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        // Use smooth scrolling for better UX
        // Increased timeout to allow NodeForm to render properly
        setTimeout(() => {
          scrollContainer.scrollTo({
            top: scrollContainer.scrollHeight,
            behavior: 'smooth'
          });
        }, 300);
      }
    }
  }, [messages]);
  
  // Log pipeline nodes for debugging
  useEffect(() => {
    console.log("DataPipelineContext nodes:", pipelineNodes);
    console.log("FlowContext nodes:", nodes);
  }, [pipelineNodes, nodes]);

  // Initialize with a welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: 'How can I assist you with your flow today?',
          suggestions: [
            { text: 'Create a new flow', onClick: handleCreateFlow }
          ]
        }
      ]);
    }
  }, []);

  const handleSend = () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    setMessages([...messages, { role: 'user', content: trimmedInput }]);
    setInput('');

    // Simulate assistant response
    setTimeout(() => {
      setMessages(prevMessages => [
        ...prevMessages,
        {
          role: 'assistant',
          content: 'I understand you want to work with flows. What would you like to do?',
          suggestions: [
            { text: 'Create a new flow', onClick: handleCreateFlow },
            { text: 'Add a module to the flow', onClick: handleShowModules }
          ]
        },
      ]);
    }, 500);
  };

  const handleCreateFlow = () => {
    setMessages([...messages, { role: 'user', content: 'Create a new flow' }]);

    // Get all module types
    const availableModules = moduleTypes || [];

    // Directly show modules as suggestion buttons
    setTimeout(() => {
      setMessages(prevMessages => [
        ...prevMessages,
        {
          role: 'assistant',
          content: "Let's create a new flow. Here are the available modules you can add to your flow:",
          suggestions: availableModules.map(module => ({
            text: module.label || 'Module',
            onClick: () => handleAddModule(module)
          }))
        },
      ]);
    }, 500);
  };

  const handleShowModules = () => {
    setMessages([...messages, { role: 'user', content: 'Show all modules' }]);

    // Get all module types
    const availableModules = moduleTypes || [];

    // Show modules as suggestion buttons
    setTimeout(() => {
      setMessages(prevMessages => [
        ...prevMessages,
        {
          role: 'assistant',
          content: "Here are the available modules you can add to your flow:",
          suggestions: availableModules.map(module => ({
            text: module.label || 'Module',
            onClick: () => handleAddModule(module)
          }))
        },
      ]);
    }, 500);
  };

  // Function to handle adding a module to the flow
  const handleAddModule = (module: any) => {
    console.log(module)
    // Add a message to show the selection
    setMessages(prevMessages => [
      ...prevMessages,
      {
        role: 'user',
        content: `Add ${module.label} module`
      },
    ]);

    // Create a node object in the format expected by handleNodeClick
    let nodeForPipeline = {
      ui_properties: {
        module_name: module.label,
        color: module.color,
        icon: module.icon,
        type: module.type,
        id: createShortUUID(),
        meta: {
          type: module.type,
          moduleInfo: {
            color: module.color,
            icon: module.icon,
            label: module.label,
          },
          properties: module.operators.map((op) => op.properties),
          fullyOptimized: false
        },
        requiredFields: []
      }
    };
    
    // Add node to history before adding the node
    addNodeToHistory();

    // Use the handleNodeClick function from DataPipelineContext
    handleNodeClick(nodeForPipeline, null);
    
    // Show confirmation message after a delay to allow the node to be added
    setTimeout(() => {
      setMessages(prevMessages => [
        ...prevMessages,
        {
          role: 'assistant',
          content: `Great! I've added a ${module.label} module to your flow. What would you like to do next?`,
          suggestions: [
            { text: 'Add another module', onClick: handleShowModules },
            { text: 'Configure this module', onClick: () => handleConfigureModule(module.label, module) }
          ]
        },
      ]);
    }, 500);
  };

  const handleConfigureModule = (moduleLabel: string, module: any) => {
    // Add a message to show the selection
    setMessages(prevMessages => [
      ...prevMessages,
      {
        role: 'user',
        content: `Configure ${moduleLabel} module`
      },
    ]);
    
    // Find the node with the matching label in the pipeline nodes
    const targetNode = pipelineNodes.find(node => node.data.label === moduleLabel);

    if (!targetNode) {
      // Module not found
      setTimeout(() => {
        setMessages(prevMessages => [
          ...prevMessages,
          {
            role: 'assistant',
            content: `I couldn't find a ${moduleLabel} module in your flow. Would you like to add one?`,
            suggestions: [
              { text: 'Add module', onClick: () => handleAddModule(module) }
            ]
          },
        ]);
      }, 500);
      return;
    }

    const nodeId = targetNode.id;

    // First select the node in the Flow context
    selectNode(nodeId);
    
    // Ensure the node data is properly loaded before showing the form
    const existingNodeFormData = nodeFormData.find(item => item.nodeId === nodeId);
    
    // If we don't have form data for this node yet, initialize it
    if (!existingNodeFormData) {
      // Create a more complete initial form data
      const initialFormData = {
        task_id: `${moduleLabel}_${createShortUUID()}`.toLowerCase(),
        type: targetNode.data.selectedData || '',
        depends_on: [],
        // Add any existing data from the node
        ...(targetNode.data.formData || {}),
        ...(targetNode.data.transformationData || {})
      };
      
      // Update the node form data
      updateNodeFormData(nodeId, initialFormData);
      
      // Also update the node data to include this form data
      const updatedNodes = pipelineNodes.map(node => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              formData: initialFormData,
            }
          };
        }
        return node;
      });
      
      // Update the nodes in the pipeline context
      updateSetNode(updatedNodes, pipelineEdges);
    }

    // Add a message with the NodeForm embedded
    setTimeout(() => {
      setMessages(prevMessages => [
        ...prevMessages,
        {
          role: 'assistant',
          content: `Here's the configuration form for the ${moduleLabel} module:`,
          nodeForm: {
            nodeId: nodeId,
            onSave: () => handleNodeFormSave(moduleLabel)
          }
        },
      ]);
    }, 500);
  };

  // Handler for when the NodeForm is saved
  const handleNodeFormSave = (moduleLabel: string) => {
    console.log("Pipeline nodes in handleNodeFormSave:", pipelineNodes);
    
    // Find the node with the matching label in the pipeline nodes
    const targetNode = pipelineNodes.find(node => node.data.label === moduleLabel);
    
    if (targetNode) {
      const nodeId = targetNode.id;
      
      // Get the updated form data
      const formData = nodeFormData.find(item => item.nodeId === nodeId)?.formData || {};
      
      // Update the node with the form data
      const updatedNodes = pipelineNodes.map(node => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              selectedData: formData.type || node.data.selectedData,
              formData: formData,
              transformationData: {
                ...node.data.transformationData,
                ...formData,
                type: formData.type || node.data.selectedData
              }
            }
          };
        }
        return node;
      });
      
      // Update the nodes in the pipeline context
      updateSetNode(updatedNodes, pipelineEdges);
    }
    
    // Save the flow to ensure all changes are persisted
    saveFlow().then(() => {
      setIsSaved(true);
      setIsSaving(false);
      
      // Add a confirmation message
      setMessages(prevMessages => [
        ...prevMessages,
        {
          role: 'assistant',
          content: `Great! The ${moduleLabel} module configuration has been saved. What would you like to do next?`,
          suggestions: [
            { text: 'Add another module', onClick: handleShowModules },
            { text: 'Connect modules', onClick: handleConnectModules }
          ]
        },
      ]);
    });
  };

  
  const handleConnectModules = () => {
    // Add a message to show the selection
    setMessages(prevMessages => [
      ...prevMessages,
      {
        role: 'user',
        content: 'Connect modules'
      },
    ]);

    // Check if we have at least 2 nodes to connect
    if (pipelineNodes.length < 2) {
      setTimeout(() => {
        setMessages(prevMessages => [
          ...prevMessages,
          {
            role: 'assistant',
            content: 'You need at least 2 modules to create a connection. Would you like to add another module?',
            suggestions: [
              { text: 'Add another module', onClick: handleShowModules }
            ]
          },
        ]);
      }, 500);
      return;
    }

    // Show source node selection
    setTimeout(() => {
      setMessages(prevMessages => [
        ...prevMessages,
        {
          role: 'assistant',
          content: 'Select the source module:',
          suggestions: pipelineNodes.map(node => ({
            text: node.data.label,
            onClick: () => handleSelectSourceNode(node.id)
          }))
        },
      ]);
    }, 500);
  };

  const handleSelectSourceNode = (sourceNodeId: string) => {
    
    // Add a message to show the selection
    const sourceNode = pipelineNodes.find(node => node.id === sourceNodeId);

    setMessages(prevMessages => [
      ...prevMessages,
      {
        role: 'user',
        content: `Select source: ${sourceNode?.data.label || sourceNodeId}`
      },
    ]);

    // Show target node selection (excluding the source node)
    setTimeout(() => {
      setMessages(prevMessages => [
        ...prevMessages,
        {
          role: 'assistant',
          content: 'Select the target module:',
          suggestions: pipelineNodes
            .filter(node => node.id !== sourceNodeId)
            .map(node => ({
              text: node.data.label,
              onClick: () => handleSelectTargetNode(sourceNodeId, node.id)
            }))
        },
      ]);
    }, 500);
  };

  const handleSelectTargetNode = (sourceNodeId: string, targetNodeId: string) => {
    
    // Add a message to show the selection
    const targetNode = pipelineNodes.find(node => node.id === targetNodeId);

    setMessages(prevMessages => [
      ...prevMessages,
      {
        role: 'user',
        content: `Select target: ${targetNode?.data.label || targetNodeId}`
      },
    ]);

    // Create a unique edge ID
    const edgeId = `e${sourceNodeId}-${targetNodeId}`;

    // Create the edge
    const newEdge = {
      id: edgeId,
      source: sourceNodeId,
      target: targetNodeId,
      type: 'default',
      animated: false,
      markerEnd: {
        type: 'arrowclosed',
      },
      style: { stroke: '#b1b1b7', strokeWidth: 2 }
    };

    // Check if the edge already exists to avoid duplicates
    const edgeExists = pipelineEdges.some(
      edge => edge.source === sourceNodeId && edge.target === targetNodeId
    );

    if (!edgeExists) {
      // Add the edge using updateSetNode to ensure both contexts are updated
      const updatedEdges = [...pipelineEdges, newEdge];
      updateSetNode(pipelineNodes, updatedEdges);
    }

    // Update the target node's dependencies
    const targetNodeFormData = nodeFormData.find(item => item.nodeId === targetNodeId)?.formData || {};
    const sourceNodeFormData = nodeFormData.find(item => item.nodeId === sourceNodeId)?.formData || {};

    // Get the source node's task_id
    const sourceTaskId = sourceNodeFormData.task_id;

    if (sourceTaskId) {
      // Update the target node's depends_on array
      const updatedDependsOn = [...(targetNodeFormData.depends_on || [])];

      if (!updatedDependsOn.includes(sourceTaskId)) {
        updatedDependsOn.push(sourceTaskId);
      }

      const updatedFormData = {
        ...targetNodeFormData,
        depends_on: updatedDependsOn
      };

      updateNodeFormData(targetNodeId, updatedFormData);
    }

    // Save the flow
    saveFlow().then(() => {
      setIsSaved(true);
      setIsSaving(false);
    });

    // Show confirmation message
    setTimeout(() => {
      setMessages(prevMessages => [
        ...prevMessages,
        {
          role: 'assistant',
          content: 'Great! I\'ve connected the modules. What would you like to do next?',
          suggestions: [
            { text: 'Add another module', onClick: handleShowModules },
            { text: 'Connect more modules', onClick: handleConnectModules }
          ]
        },
      ]);
    }, 500);
  };

  return (
    <div className="flex flex-col h-full p-4">
      {/* Message Area */}
      <div className="flex-1 mt-4 overflow-hidden">
        <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
          <div className="space-y-6">
            {messages.map((message, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 ${message.role === "assistant" ? "flex-row" : "flex-row-reverse"
                  }`}
              >
                <div
                  className={`rounded-lg px-4 py-2 max-w-[80%] relative ${message.role === "assistant" ? "bg-gray-100 text-black" : "bg-blue-100 text-blue-900"
                    } ${message.role === "assistant"
                      ? "before:absolute before:left-[-6px] before:top-3 before:border-4 before:border-transparent before:border-r-gray-100"
                      : "before:absolute before:right-[-6px] before:top-3 before:border-4 before:border-transparent before:border-l-blue-100"
                    }`}
                >
                  <div className="whitespace-pre-wrap break-words">{message.content}</div>

                  {/* Render NodeForm if available */}
                  {message.nodeForm && (
                    <div className="mt-4 w-full">
                      <NodeForm
                        key={`node-form-${message.nodeForm.nodeId}`}
                        id={message.nodeForm.nodeId}
                        closeTap={() => {
                          // Get the current node data
                          const nodeId = message.nodeForm?.nodeId || '';
                          const currentNode = nodes.find(n => n.id === nodeId);
                          
                          if (currentNode) {
                            // Get the updated form data
                            const formData = nodeFormData.find(item => item.nodeId === nodeId)?.formData || {};
                            
                            // Update the node with the form data
                            const updatedNodes = nodes.map(node => {
                              if (node.id === nodeId) {
                                return {
                                  ...node,
                                  data: {
                                    ...node.data,
                                    selectedData: formData.type || node.data.selectedData,
                                    formData: formData,
                                    transformationData: {
                                      ...node.data.transformationData,
                                      ...formData,
                                      type: formData.type || node.data.selectedData
                                    }
                                  }
                                };
                              }
                              return node;
                            });
                            
                            // Update the nodes in the pipeline context
                            updateSetNode(updatedNodes, edges);
                          }
                          
                          // Make sure to call revertOrSaveData with true to save the data
                          revertOrSaveData(nodeId, true);
                          
                          // Save the flow to ensure all changes are persisted
                          saveFlow().then(() => {
                            setIsSaved(true);
                            setIsSaving(false);
                            
                            // Then call the onSave callback
                            message.nodeForm?.onSave();
                          });
                        }}
                      />
                    </div>
                  )}

                  {/* Render suggestion buttons if available */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-4 space-y-2">
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
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="flex gap-2 mt-4 flex-shrink-0">
        <AIChatInput
          input={input}
          onChange={setInput}
          onSend={handleSend}
          placeholder="Ask about your flow..."
          disabled={!selectedFlowId}
        />
      </div>

      {/* NodeForm Dialog removed as we're now embedding the form in the chat */}
    </div>
  );
};

export default FlowChatPanel;