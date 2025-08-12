import { useCallback } from 'react';

export type UseHandleDependencySelectionParams = {
  edges: any[];
  nodes: any[];
  setEdges: (updater: (prev: any[]) => any[]) => void;
  onConnect: (connection: any) => void;
  pipelineContext: any;
  setMessages: (updater: any) => void;
  setSelectedSchema: (schema: any) => void;
  setSourceColumns: (cols: any[]) => void;
  formStates: Record<string, any>;
  setFormStates: (updater: any) => void;
  setformsHanStates: (updater: any) => void;
  setUnsavedChanges: () => void;
  handleFormSubmit: (data: any) => void;
  saveChatHistoryBatchWithMessages: (messages: any[]) => void;
  handleShowTransformations: () => void;
  getSchemaForTransformation: (transformationType: string, targetNodeId: string, engineType: string) => any;
  generateMessageId: () => string;
};

export const useHandleDependencySelection = (params: UseHandleDependencySelectionParams) => {
  const {
    edges,
    nodes,
    setEdges,
    onConnect,
    pipelineContext,
    setMessages,
    setSelectedSchema,
    setSourceColumns,
    formStates,
    setFormStates,
    setformsHanStates,
    setUnsavedChanges,
    handleFormSubmit,
    saveChatHistoryBatchWithMessages,
    handleShowTransformations,
    getSchemaForTransformation,
    generateMessageId,
  } = params;

  const handleDependencySelection = useCallback(
    (
      sourceNode: any,
      targetNodeType: any,
      targetNodeId: string,
      maxInputs: number | 'unlimited',
      numDependenciesToAsk: number,
      skipFormOpen = false
    ) => {
      // Find existing connections to this target node to determine which handle to use
      const existingConnections = edges.filter((edge: any) => edge.target === targetNodeId);

      // Find the target node to get its module name
      const targetNode = nodes.find((node: any) => node.id === targetNodeId);
      const targetModuleName = (targetNode as any)?.data?.label;

      // Determine if this is a multi-input node (like Joiner, Lookup, SetCombiner, CustomPySpark)
      const isMultiInputNode =
        targetNodeType.ui_properties.ports.maxInputs === 'unlimited' ||
        targetNodeType.ui_properties.ports.maxInputs > 1;

      // For multi-input nodes, we need to create distinct input handles
      let targetHandle: string | undefined;

      if (isMultiInputNode) {
        // For multi-input nodes, create a unique handle for each connection
        // Use a consistent naming pattern that includes the source node ID to ensure uniqueness
        targetHandle = `input-${sourceNode.id}`;

        // Check if we already have a connection from this source to this target
        const existingConnection = existingConnections.find(
          (edge: any) => edge.source === sourceNode.id && edge.target === targetNodeId
        );

        if (existingConnection) {
          // If a connection already exists, use its handle to avoid duplicates
          targetHandle = existingConnection.targetHandle;
        }
      } else {
        // For single-input nodes, use the standard approach
        const targetHandleIndex = existingConnections.length;
        targetHandle = `input-${targetHandleIndex}`;
      }

      // Create a connection between the source node and the target node
      const connection = {
        source: sourceNode.id,
        target: targetNodeId,
        sourceHandle: 'output-0', // Use the first output handle of the source node
        targetHandle: targetHandle, // Use a different input handle for each connection
      };

      // Create a unique edge ID that includes the handle information
      const edgeId = `e${sourceNode.id}-${targetNodeId}-${targetHandle}`;

      // Create a complete edge object with all required properties
      const newEdge = {
        id: edgeId,
        source: sourceNode.id,
        target: targetNodeId,
        sourceHandle: 'output-0',
        targetHandle: targetHandle,
        type: 'default',
        animated: false,
        style: { stroke: '#b1b1b7', strokeWidth: 2 },
      } as any;

      // Add the edge directly to the edges array
      setEdges((prevEdges: any[]) => {
        // Check if the edge already exists to avoid duplicates
        // Now we also check the specific handles to allow multiple connections between the same nodes
        const edgeExists = prevEdges.some(
          (edge: any) => edge.source === sourceNode.id && edge.target === targetNodeId && edge.targetHandle === targetHandle
        );

        if (edgeExists) {
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
          pipelineContext.handleAlignHorizontal();

          // Force another re-render after alignment
          window.dispatchEvent(new Event('resize'));

          // Call alignment again after a short delay to ensure proper positioning
          setTimeout(() => {
            pipelineContext.handleAlignHorizontal();
            window.dispatchEvent(new Event('resize'));

            // Force update node internals to ensure handles are properly rendered
            // This is crucial for multi-input nodes
            const targetNode = nodes.find((node: any) => node.id === targetNodeId);
            if (targetNode && (targetNode as any).data?.ports?.maxInputs) {
              // We can't directly use useUpdateNodeInternals here since it's a hook
              // Instead, we'll trigger a resize event which will cause React Flow to recalculate
              // node positions and connections
              window.dispatchEvent(new Event('resize'));

              // Also dispatch a custom event that our NodeHandles component can listen for
              const updateEvent = new CustomEvent('updateNodeInternals', {
                detail: { nodeId: targetNodeId },
              });
              window.dispatchEvent(updateEvent);
            }
          }, 200);
        }
      }, 500);

      // If skipFormOpen is true, just create the connection and exit
      if (skipFormOpen) {
        return;
      }

      // If this is a single-input transformation or we've reached the max inputs, show the form
      if (maxInputs === 1 || numDependenciesToAsk === 1) {
        // Find the schema for this transformation type
        const transformationType = targetNodeType.ui_properties.module_name;

        // Check if this is a Target transformation
        const isTarget = transformationType === 'Target';

        // Build the dependency data from the current connection
        const dependentOnData = [
          {
            source: sourceNode.id,
            targetHandle: targetHandle,
          },
        ];

        // If this is a Target transformation, show the Target form immediately
        if (isTarget) {
          // Add a message to show that we're configuring the Target
          setTimeout(() => {
            setMessages((prevMessages: any) => [
              ...prevMessages,
              {
                role: 'assistant',
                content: '',
                formData: {
                  schema: { title: 'Target' },
                  sourceColumns: [], // Add empty sourceColumns array to satisfy the type requirement
                  currentNodeId: targetNodeId,
                  isTarget: true,
                  formId: `form_${targetNodeId}_${Date.now()}`, // Add unique form identifier
                  initialValues: {
                    nodeId: targetNodeId,
                    name: `Target_${targetNodeId}`,
                    dependent_on: dependentOnData,
                  },
                },
              },
            ]);
          }, 600); // Increased timeout to ensure connections are established

          return; // Skip the rest of the function
        }

        // Get schema with proper transformation name mapping
        const engineType = (pipelineContext.pipelineDtl?.engine_type as string) || 'pyspark';
        const schemaWithNodeId = getSchemaForTransformation(
          transformationType,
          targetNodeId,
          engineType
        );

        if (schemaWithNodeId) {
          // Set the selected schema
          setSelectedSchema(schemaWithNodeId);

          // Get column suggestions for the form
          import('@/lib/pipelineAutoSuggestion').then((module) => {
            module
              .getColumnSuggestions(targetNodeId, nodes, edges, pipelineContext.pipelineDtl)
              .then((columns: string[]) => {
                // Add a message to show that we're configuring the transformation
                setTimeout(() => {
                  console.log('Opening form for transformation:', transformationType, 'with targetNodeId:', targetNodeId);

                  const formId = `form_${targetNodeId}_${Date.now()}`;
                  console.log(`📝 Creating new form with formId: ${formId}, nodeId: ${targetNodeId}, transformation: ${transformationType}`);

                  // Debug: Log current form states and node data
                  const currentNode = nodes.find((n: any) => n.id === targetNodeId);
                  console.log(`📝 Current form states for ${targetNodeId}:`, formStates[targetNodeId]);
                  console.log(`📝 Current node transformation data:`, (currentNode as any)?.data?.transformationData);
                  console.log(`📝 Current node data:`, (currentNode as any)?.data);

                  // Create the embedded form data directly
                  const embeddedFormData: any = {
                    schema: schemaWithNodeId,
                    sourceColumns: columns.map((col: string) => ({ name: col, dataType: 'string' })),
                    currentNodeId: targetNodeId,
                    formId: formId,
                    isEmbeddedForm: true, // Flag to indicate this is an embedded form
                    initialValues: (() => {
                      const currentNode = nodes.find((n: any) => n.id === targetNodeId);
                      const initialValues = {
                        // Start with existing form states
                        ...formStates[targetNodeId],
                        // Add current node's transformation data if available
                        ...((currentNode as any)?.data?.transformationData || {}),
                        // Always include nodeId and dependencies
                        nodeId: targetNodeId,
                        dependent_on: dependentOnData,
                      } as any;
                      console.log(`📝 Final initial values for form:`, initialValues);
                      return initialValues;
                    })(),
                    onSubmit: (data: any) => {
                      // Handle form submission
                      const nodeId = data.nodeId || targetNodeId;
                      const formId = (embeddedFormData as any).formId;

                      // Get the current node to determine the title
                      const currentNode = nodes.find((n: any) => n.id === nodeId);
                      // Preserve the existing node title/label, don't overwrite with transformation type
                      const updatedTitle =
                        data.name ||
                        data.title ||
                        (currentNode as any)?.data?.title ||
                        (currentNode as any)?.data?.label ||
                        `${schemaWithNodeId.title}_${String(nodeId).slice(-4)}`;

                      // Update local form states first
                      const cleanFormData: any = { ...data };
                      delete cleanFormData.nodeId;
                      const formStateData = { ...cleanFormData, nodeId: nodeId, name: updatedTitle };
                      setFormStates((prevStates: any) => ({ ...prevStates, [nodeId]: formStateData }));
                      setformsHanStates((prevStates: any) => ({ ...prevStates, [nodeId]: formStateData }));

                      // Mark as unsaved
                      setUnsavedChanges();

                      console.log(`🔧 Calling handleFormSubmit with:`, { ...data, nodeId: nodeId, name: updatedTitle });
                      console.log(`🔧 Updated form states for nodeId ${nodeId}:`, formStateData);
                      const formSubmitData = { ...data, nodeId: nodeId, name: updatedTitle };
                      handleFormSubmit(formSubmitData);

                      // Add a message to show the form was submitted and remove the embedded form
                      const newMessages = [
                        { role: 'user' as const, content: `Configured ${schemaWithNodeId?.title} transformation`, id: generateMessageId() },
                        {
                          role: 'assistant' as const,
                          content: '',
                          id: generateMessageId(),
                          // Include form data to save transformation configuration in chat history
                          formData: {
                            schema: schemaWithNodeId,
                            sourceColumns: columns.map((col: string) => ({ name: col, dataType: 'string' })),
                            currentNodeId: targetNodeId,
                            isTarget: isTarget || false,
                            isConfirmation: true, // Flag to indicate this is a confirmation message, not a form message
                            initialValues: {
                              ...formStates[targetNodeId],
                              ...data,
                              nodeId: nodeId,
                              name: updatedTitle,
                            },
                          },
                        },
                      ];

                      // SINGLE STATE UPDATE: Remove embedded form message and add new messages
                      setMessages((prevMessages: any) => {
                        // Recreate cleanFormData within this scope
                        const cleanFormData: any = { ...data };
                        delete cleanFormData.nodeId;

                        // Special handling for different transformation types
                        const currentNode = nodes.find((n: any) => n.id === nodeId);
                        if (currentNode && (currentNode as any).data.label === 'Filter') {
                          if (data.condition !== undefined) {
                            cleanFormData.condition = data.condition;
                          }
                        }

                        // STEP 1: Remove the embedded form message
                        const messagesWithoutEmbeddedForm = prevMessages.filter(
                          (msg: any) => !(msg.formData && msg.formData.isEmbeddedForm && msg.formData.formId === formId)
                        );

                        // STEP 2: Add the new messages
                        const finalMessages = [...messagesWithoutEmbeddedForm, ...newMessages];

                        // STEP 3: Save chat history batch with the correctly updated messages
                        setTimeout(() => {
                          saveChatHistoryBatchWithMessages(finalMessages);
                        }, 500);

                        // Show transformations dropdown after transformation configuration
                        setTimeout(() => {
                          handleShowTransformations();
                        }, 800);

                        return finalMessages;
                      });
                    },
                    onClose: () => {
                      // Remove the embedded form message when closed
                      setMessages((prevMessages: any) =>
                        prevMessages.filter((msg: any) => !(msg.formData && msg.formData.isEmbeddedForm && msg.formData.formId === formId))
                      );
                    },
                  };

                  // Create the embedded form message
                  const newMessage = {
                    role: 'assistant',
                    content: '',
                    formData: embeddedFormData,
                  };

                  setMessages((prevMessages: any) => {
                    const newMessages = [...prevMessages, newMessage];
                    console.log('Added form message to chat:', newMessage);
                    return newMessages;
                  });
                }, 800); // Increased timeout to ensure dependencies are properly set
              })
              .catch((err: any) => {
                console.error('Error getting column suggestions:', err);

                // Fallback if we can't get column suggestions
                setTimeout(() => {
                  console.log('Opening form (fallback) for transformation:', transformationType, 'with targetNodeId:', targetNodeId);

                  const formId = `form_${targetNodeId}_${Date.now()}`;
                  console.log(`📝 Creating new form (fallback) with formId: ${formId}, nodeId: ${targetNodeId}, transformation: ${transformationType}`);

                  // Create the embedded form data directly (fallback)
                  const embeddedFormData: any = {
                    schema: schemaWithNodeId,
                    sourceColumns: [],
                    currentNodeId: targetNodeId,
                    formId: formId,
                    isEmbeddedForm: true, // Flag to indicate this is an embedded form
                    initialValues: (() => {
                      const currentNode = nodes.find((n: any) => n.id === targetNodeId);
                      const initialValues = {
                        // Start with existing form states
                        ...formStates[targetNodeId],
                        // Add current node's transformation data if available
                        ...((currentNode as any)?.data?.transformationData || {}),
                        // Always include nodeId and dependencies
                        nodeId: targetNodeId,
                        dependent_on: dependentOnData,
                      } as any;
                      console.log(`📝 Final initial values for form:`, initialValues);
                      return initialValues;
                    })(),
                    onSubmit: (data: any) => {
                      // Handle form submission (same as above)
                      const nodeId = data.nodeId || targetNodeId;
                      const formId = (embeddedFormData as any).formId;

                      // Get the current node to determine the title
                      const currentNode = nodes.find((n: any) => n.id === nodeId);
                      // Preserve the existing node title/label, don't overwrite with transformation type
                      const updatedTitle =
                        data.name ||
                        data.title ||
                        (currentNode as any)?.data?.title ||
                        (currentNode as any)?.data?.label ||
                        `${schemaWithNodeId.title}_${String(nodeId).slice(-4)}`;

                      // Update local form states first
                      const cleanFormData: any = { ...data };
                      delete cleanFormData.nodeId;
                      const formStateData = { ...cleanFormData, nodeId: nodeId, name: updatedTitle };
                      setFormStates((prevStates: any) => ({ ...prevStates, [nodeId]: formStateData }));
                      setformsHanStates((prevStates: any) => ({ ...prevStates, [nodeId]: formStateData }));

                      // Mark as unsaved
                      setUnsavedChanges();

                      console.log(`🔧 Calling handleFormSubmit with:`, { ...data, nodeId: nodeId, name: updatedTitle });
                      console.log(`🔧 Updated form states for nodeId ${nodeId}:`, formStateData);
                      const formSubmitData = { ...data, nodeId: nodeId, name: updatedTitle };
                      handleFormSubmit(formSubmitData);

                      // Add a message to show the form was submitted and remove the embedded form
                      const newMessages = [
                        { role: 'user' as const, content: `Configured ${schemaWithNodeId?.title} transformation`, id: generateMessageId() },
                        {
                          role: 'assistant' as const,
                          content: '',
                          id: generateMessageId(),
                          formData: {
                            schema: schemaWithNodeId,
                            sourceColumns: [],
                            currentNodeId: targetNodeId,
                            isTarget: isTarget || false,
                            isConfirmation: true,
                            initialValues: {
                              ...formStates[targetNodeId],
                              ...data,
                              nodeId: nodeId,
                              name: updatedTitle,
                            },
                          },
                        },
                      ];

                      // Remove embedded form message and add new messages
                      setMessages((prevMessages: any) => {
                        const cleanFormData: any = { ...data };
                        delete cleanFormData.nodeId;

                        const currentNode = nodes.find((n: any) => n.id === nodeId);
                        if (currentNode && (currentNode as any).data.label === 'Filter') {
                          if (data.condition !== undefined) {
                            cleanFormData.condition = data.condition;
                          }
                        }

                        const messagesWithoutEmbeddedForm = prevMessages.filter(
                          (msg: any) => !(msg.formData && msg.formData.isEmbeddedForm && msg.formData.formId === formId)
                        );

                        const finalMessages = [...messagesWithoutEmbeddedForm, ...newMessages];

                        setTimeout(() => {
                          saveChatHistoryBatchWithMessages(finalMessages);
                        }, 500);

                        setTimeout(() => {
                          handleShowTransformations();
                        }, 800);

                        return finalMessages;
                      });
                    },
                    onClose: () => {
                      setMessages((prevMessages: any) =>
                        prevMessages.filter((msg: any) => !(msg.formData && msg.formData.isEmbeddedForm && msg.formData.formId === formId))
                      );
                    },
                  };

                  const newMessage = {
                    role: 'assistant',
                    content: '',
                    formData: embeddedFormData,
                  };

                  setMessages((prevMessages: any) => {
                    const newMessages = [...prevMessages, newMessage];
                    console.log('Added fallback form message to chat:', newMessage);
                    return newMessages;
                  });
                }, 800); // Increased timeout to ensure dependencies are properly set
              });
          });
        } else {
          // Fallback if schema not found
          console.warn('Schema not found for transformation:', transformationType);
          setTimeout(() => {
            handleShowTransformations();
          }, 300);
        }
      } else {
        // For multi-input transformations, ask for more dependencies
        const remainingDeps = numDependenciesToAsk - 1;

        // Get updated list of available dependencies (excluding already selected ones)
        const connectedNodeIds = edges
          .filter((edge: any) => edge.target === targetNodeId)
          .map((edge: any) => edge.source);

        const availableDependencies = nodes.filter(
          (node: any) => node.id !== targetNodeId && !connectedNodeIds.includes(node.id)
        );

        if (availableDependencies.length === 0 || remainingDeps === 0) {
          // No more available dependencies or we've reached the limit
          // But skip if we're in multi-dependency selection mode
          if (!skipFormOpen) {
            setTimeout(() => {
              // Find the target node in the nodes array
              const targetNode = nodes.find((node: any) => node.id === targetNodeId);

              if (targetNode) {
                // Find the schema for this transformation type
                const transformationType = targetNodeType.ui_properties.module_name;

                // Get schema with proper transformation name mapping
                const engineType = (pipelineContext.pipelineDtl?.engine_type as string) || 'pyspark';
                const schemaWithNodeId = getSchemaForTransformation(
                  transformationType,
                  targetNodeId,
                  engineType
                );

                if (schemaWithNodeId) {
                  // Set the selected schema and open the form
                  setSelectedSchema(schemaWithNodeId);

                  // Get column suggestions for the form
                  import('@/lib/pipelineAutoSuggestion').then((module) => {
                    module
                      .getColumnSuggestions(targetNodeId, nodes, edges, pipelineContext.pipelineDtl)
                      .then((columns: string[]) => {
                        setSourceColumns(columns.map((col: string) => ({ name: col, dataType: 'string' })));

                        // Add a message to show that we're configuring the transformation
                        setMessages((prevMessages: any) => [
                          ...prevMessages,
                          {
                            role: 'assistant',
                            content: '',
                          },
                        ]);

                        // Instead of opening a dialog, add the form directly to the chat
                        setTimeout(() => {
                          // Add the form to the chat messages
                          // Check if this is a Target transformation
                          const isTarget = transformationType === 'Target';

                          const newMessage = {
                            role: 'assistant',
                            content: `Please configure your ${transformationType} transformation:`,
                            formData: {
                              schema: schemaWithNodeId,
                              sourceColumns: columns.map((col: string) => ({ name: col, dataType: 'string' })),
                              currentNodeId: targetNodeId,
                              isTarget: isTarget, // Add flag to indicate if this is a Target
                              formId: `form_${targetNodeId}_${Date.now()}`, // Add unique form identifier
                              initialValues: {
                                ...formStates[targetNodeId],
                                nodeId: targetNodeId,
                                dependent_on: dependentOnData,
                              },
                            },
                          } as any;

                          setMessages((prevMessages: any) => {
                            const newMessages = [...prevMessages, newMessage];
                            return newMessages;
                          });
                        }, 300);
                      })
                      .catch((err: any) => {
                        console.error('Error getting column suggestions:', err);

                        // Add a message to show that we're configuring the transformation
                        setMessages((prevMessages: any) => [
                          ...prevMessages,
                          {
                            role: 'assistant',
                            content: '',
                          },
                        ]);

                        // Instead of opening a dialog, add the form directly to the chat (fallback)
                        setTimeout(() => {
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
                              formId: `form_${targetNodeId}_${Date.now()}`, // Add unique form identifier
                              initialValues: {
                                ...formStates[targetNodeId],
                                nodeId: targetNodeId,
                                dependent_on: dependentOnData,
                              },
                            },
                          } as any;

                          setMessages((prevMessages: any) => {
                            const newMessages = [...prevMessages, newMessage];
                            return newMessages;
                          });
                        }, 300);
                      });
                  });
                } else {
                  handleShowTransformations();
                }
              } else {
                handleShowTransformations();
              }
            }, 300);
          }
        } else {
          // Ask for more dependencies
          setTimeout(() => {
            setMessages((prevMessages: any) => [
              ...prevMessages,
              {
                role: 'assistant',
                content: `You can add ${remainingDeps} more connection${remainingDeps > 1 ? 's' : ''}. Select another node to connect:`,
                suggestions: availableDependencies.map((depNode: any) => ({
                  text: depNode.data.title || depNode.data.label,
                  onClick: () =>
                    handleDependencySelection(
                      depNode,
                      targetNodeType,
                      targetNodeId,
                      maxInputs as any,
                      remainingDeps
                    ),
                })),
              },
            ]);
          }, 300);
        }
      }
    },
    [
      edges,
      nodes,
      setEdges,
      onConnect,
      pipelineContext,
      setMessages,
      setSelectedSchema,
      setSourceColumns,
      formStates,
      setFormStates,
      setformsHanStates,
      setUnsavedChanges,
      handleFormSubmit,
      saveChatHistoryBatchWithMessages,
      handleShowTransformations,
      getSchemaForTransformation,
      generateMessageId,
    ]
  );

  return { handleDependencySelection };
};