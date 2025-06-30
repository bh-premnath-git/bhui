import React, { useState, useEffect, useCallback } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AIChatInput } from '@/components/shared/AIChatInput';
import { m, motion } from 'framer-motion';
import SuggestionButton from './SuggestionButton'; // Import the SuggestionButton
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import CreateFormFormik from './form-sections/CreateForm';
import TargetPopUp from '@/components/bh-reactflow-comps/TargetPopUp';
import { CATALOG_REMOTE_API_URL } from '@/config/platformenv';
import { setIsRightPanelOpen } from '@/store/slices/designer/buildPipeLine/BuildPipeLineSlice';
import { debugNodeData, validateNodeTransformationData, compareBeforeAfterSubmit } from '@/lib/debugPipeline';
import { useParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

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
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  msg_owner?: string;
  suggestions?: Suggestion[];
  formData?: {
    schema: any;
    sourceColumns: any[];
    currentNodeId: string;
    initialValues: any;
    isTarget?: boolean;
    isConfirmation?:boolean; // New field to indicate confirmation
  };
};

const PipeLineChatPanel = () => {
  const dispatch = useAppDispatch();
  const { id } = useParams<{ id: string }>();
  
  // Debug id
  useEffect(() => {
    console.log('PipeLineChatPanel id:', id);
  }, [id]);

  // Helper function to get avatar initials from msg_owner
  const getAvatarInitials = (msgOwner?: string): string => {
    if (!msgOwner) return 'AI'; // Default for assistant messages
    return msgOwner.substring(0, 2).toUpperCase();
  };
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [showReaderForm, setShowReaderForm] = useState(false);
  const [showReaderOptionsForm, setShowReaderOptionsForm] = useState(false);
  const [selectedSourceType, setSelectedSourceType] = useState<"File" | "Relational" | null>(null);
  const [showTransformationDropdown, setShowTransformationDropdown] = useState(false);
  const [readerNode, setReaderNode] = useState<any>(null);
  const [selectedDataSource, setSelectedDataSource] = useState<any>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSchema, setSelectedSchema] = useState<any>(null);
  const [sourceColumns, setSourceColumns] = useState<any[]>([]);
  const [formsHanStates, setformsHanStates] = useState<Record<string, any>>({});
  const [chatHistory, setChatHistory] = useState<any>(null);
  const [isSavingChatHistory, setIsSavingChatHistory] = useState(false);
  const [lastSavedMessageCount, setLastSavedMessageCount] = useState(0); // Track how many messages have been saved
  const [savedMessageIds, setSavedMessageIds] = useState<Set<string>>(new Set()); // Track which messages are saved
  const [isLoadingChatHistory, setIsLoadingChatHistory] = useState(false);
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);
  const hasLoadedChatHistoryRef = React.useRef<string | null>(null); // Track which pipeline ID we've loaded
  const pipelineContext = usePipelineContext();
  const token: any = sessionStorage?.getItem("token");
  const decoded: any = token ? jwtDecode(token) : null;
  console.log(decoded, "decoded token in chat panel")
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
 const handleShowTransformations = () => {
  

    // Show transformation dropdown
    setTimeout(() => {
     
      setShowTransformationDropdown(true);
    }, 300);
  };

  // Handle transformation selection from dropdown
  const handleTransformationSelection = (transformationName: string) => {
    // Get all transformation nodes from nodeDisplayData (excluding Reader)
    const transformationNodes = nodeDisplayData.nodes.filter(
      node => node.ui_properties.module_name !== "Reader"
    );

    const selectedNode = transformationNodes.find(
      node => node.ui_properties.module_name === transformationName
    );

    if (!selectedNode) {
      toast.error("Transformation not found. Please try again.");
      return;
    }

    // Hide the dropdown
    setShowTransformationDropdown(false);

    // Add a message to show the selection
    setMessages(prevMessages => [
      ...prevMessages,
      {
        role: 'user',
        content: `Add ${selectedNode.ui_properties.module_name} transformation`
      },
    ]);

    // Mark unsaved changes
    setUnsavedChanges();

    // Add node to history for undo functionality
    addNodeToHistory();

    // Store the transformation info for later use
    const transformationInfo = {
      type: selectedNode.ui_properties.module_name,
      maxInputs: selectedNode.ui_properties.ports.maxInputs,
      node: selectedNode
    };

    // Set the last added transformation to track in useEffect
    setLastAddedTransformation(transformationInfo);

    // Add the transformation node to the pipeline
    console.log(selectedNode, "selectedTransformationNode");
    handleNodeClick(selectedNode, null);

    // Explicitly call handleAlignHorizontal to ensure proper node positioning
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

   

    // The nodes will be updated in the context, and our useEffect will handle asking for dependencies
  };
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
            addMessageWithFormData({
              role: 'assistant',
              content: `Great! I've added a ${lastAddedTransformation.type} transformation to your pipeline. What would you like to do next?`,
              suggestions: [
                { text: "Add another source", onClick: handleAddAnotherSource },
                { text: "Add another transformation", onClick: handleShowTransformations }
              ]
            });
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

  // Debug selectedDataSource changes
  useEffect(() => {
    console.log('selectedDataSource changed:', selectedDataSource);
  }, [selectedDataSource]);

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

  // Chat History Functions
  const generateMessageId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Save only messages with form data to database
  const saveChatHistoryBatchWithMessages = useCallback(async (messagesToSave: ChatMessage[]) => {
    console.log('saveChatHistoryBatchWithMessages called with:', {
      id,
      isSavingChatHistory,
      totalMessages: messagesToSave.length,
      savedMessageIds: savedMessageIds.size,
      currentSavedIds: Array.from(savedMessageIds),
      allMessageIds: messagesToSave.map(m => ({ id: m.id, content: m.content.substring(0, 30) }))
    });

    if (!id) {
      console.warn('No id available, skipping chat history save');
      return;
    }

    if (isSavingChatHistory) {
      console.warn('Already saving chat history, skipping');
      return;
    }

    // Filter to only messages with form data that haven't been saved
    // Only save confirmation messages (final form data), not initial configuration messages
    const formDataMessages = messagesToSave.filter(msg => {
      // Only save messages that have form data
      if (!msg.formData) {
        return false;
      }
      
      // Only save confirmation messages (final submitted form data)
      // Skip initial configuration messages to avoid duplicates
      if (!msg.formData.isConfirmation) {
        console.log('Skipping non-confirmation form message:', msg.content.substring(0, 50));
        return false;
      }
      
      // Check if already saved
      if (!msg.id) {
        console.log('Found form data confirmation message without ID:', msg.content);
        return true; // If no ID, it's definitely new
      }
      const isAlreadySaved = savedMessageIds.has(msg.id);
      console.log(`Form data confirmation message ID ${msg.id} already saved:`, isAlreadySaved, 'Content:', msg.content.substring(0, 50));
      return !isAlreadySaved;
    });

    if (formDataMessages.length === 0) {
      console.log('No new form data messages to save');
      return;
    }

    console.log(`Saving ${formDataMessages.length} form data messages out of ${messagesToSave.length} total messages`);

    setIsSavingChatHistory(true);
    try {
      // Format only the form data messages
      const formattedMessages = formDataMessages.map((msg) => {
        // Ensure message has an ID for local tracking, but don't send to API
        if (!msg.id) {
          msg.id = generateMessageId();
        }
        
        // Properly serialize formData to avoid circular references and functions
        let serializedFormData = undefined;
        if (msg.formData) {
          try {
            serializedFormData = {
              schema: msg.formData.schema,
              sourceColumns: msg.formData.sourceColumns || [],
              currentNodeId: msg.formData.currentNodeId,
              isTarget: msg.formData.isTarget,
              // Properly serialize initialValues by creating a clean copy
              initialValues: msg.formData.initialValues ? JSON.parse(JSON.stringify(msg.formData.initialValues)) : {}
            };
            console.log('Serialized formData for message:', msg.id, serializedFormData);
          } catch (error) {
            console.error('Error serializing formData for message:', msg.id, error);
            serializedFormData = {
              currentNodeId: msg.formData.currentNodeId,
              initialValues: {}
            };
          }
        }
        
        return {
          // Don't include id - FastAPI will auto-generate primary key
          role: msg.role,
          content: msg.content,
          timestamp: new Date().toISOString(),
          // Don't save suggestions since they contain onClick functions that can't be serialized
          // and are only meaningful for the current session
          suggestions: [],
          formData: serializedFormData
        };
      });

      const chatHistoryData = {
        pipeline_id: id,
        messages: formattedMessages,
        append: true, // Always append for batch saves
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Saving form data messages batch:', {
        formDataMessagesCount: formattedMessages.length,
        messageIds: formDataMessages.map(m => m.id) // Use original messages for tracking
      });
      
      const result = await apiService.savePipelineChatHistory(id, chatHistoryData);
      console.log('Form data messages batch saved successfully:', result);

      // Update saved message tracking - keep messages in UI, just track what's been saved
      const newSavedIds = new Set([...savedMessageIds, ...formDataMessages.map(m => m.id)]);
      setSavedMessageIds(newSavedIds);
      setLastSavedMessageCount(messagesToSave.length);

      console.log('Updated saved message tracking:', {
        totalSavedIds: newSavedIds.size,
        totalMessages: messagesToSave.length,
        savedIds: Array.from(newSavedIds),
        newlySavedIds: formDataMessages.map(m => m.id) // Use original messages for tracking
      });
      
    } catch (error) {
      console.error('Failed to save form data messages batch:', error);
      console.error('Error details:', {
        id,
        formDataMessagesCount: formDataMessages.length,
        totalMessagesCount: messagesToSave.length,
        error: error instanceof Error ? error.message : error
      });
    } finally {
      setIsSavingChatHistory(false);
    }
  }, [id, isSavingChatHistory, savedMessageIds]);

  // Save only form data messages from current messages state
  const saveChatHistoryBatch = useCallback(async () => {
    console.log('saveChatHistoryBatch called with:', {
      id,
      isSavingChatHistory,
      totalMessages: messages.length,
      savedMessageIds: savedMessageIds.size,
      currentSavedIds: Array.from(savedMessageIds),
      allMessageIds: messages.map(m => ({ id: m.id, content: m.content.substring(0, 30) }))
    });

    if (!id) {
      console.warn('No id available, skipping chat history save');
      return;
    }

    if (isSavingChatHistory) {
      console.warn('Already saving chat history, skipping');
      return;
    }

    // Filter to only messages with form data that haven't been saved
    const formDataMessages = messages.filter(msg => {
      // Only save messages that have form data
      if (!msg.formData) {
        return false;
      }
      
      // Check if already saved
      if (!msg.id) {
        console.log('Found form data message without ID:', msg.content);
        return true; // If no ID, it's definitely new
      }
      const isAlreadySaved = savedMessageIds.has(msg.id);
      console.log(`Form data message ID ${msg.id} already saved:`, isAlreadySaved, 'Content:', msg.content.substring(0, 50));
      return !isAlreadySaved;
    });

    if (formDataMessages.length === 0) {
      console.log('No new form data messages to save');
      return;
    }

    console.log(`Saving ${formDataMessages.length} form data messages out of ${messages.length} total messages`);

    setIsSavingChatHistory(true);
    try {
      // Format only the form data messages
      const formattedMessages = formDataMessages.map((msg) => {
        // Ensure message has an ID for local tracking, but don't send to API
        if (!msg.id) {
          msg.id = generateMessageId();
        }
        
        // Properly serialize formData to avoid circular references and functions
        let serializedFormData = undefined;
        if (msg.formData) {
          try {
            serializedFormData = {
              schema: msg.formData.schema,
              sourceColumns: msg.formData.sourceColumns || [],
              currentNodeId: msg.formData.currentNodeId,
              isTarget: msg.formData.isTarget,
              // Properly serialize initialValues by creating a clean copy
              initialValues: msg.formData.initialValues ? JSON.parse(JSON.stringify(msg.formData.initialValues)) : {}
            };
            console.log('Serialized formData for message:', msg.id, serializedFormData);
          } catch (error) {
            console.error('Error serializing formData for message:', msg.id, error);
            serializedFormData = {
              currentNodeId: msg.formData.currentNodeId,
              initialValues: {}
            };
          }
        }
        
        return {
          // Don't include id - FastAPI will auto-generate primary key
          role: msg.role,
          content: msg.content,
          timestamp: new Date().toISOString(),
          // Don't save suggestions since they contain onClick functions that can't be serialized
          // and are only meaningful for the current session
          suggestions: [],
          formData: serializedFormData
        };
      });

      const chatHistoryData = {
        pipeline_id: id,
        messages: formattedMessages,
        append: true, // Always append for batch saves
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Saving form data messages batch:', {
        formDataMessagesCount: formattedMessages.length,
        messageIds: formDataMessages.map(m => m.id) // Use original messages for tracking
      });
      
      const result = await apiService.savePipelineChatHistory(id, chatHistoryData);
      console.log('Form data messages batch saved successfully:', result);

      // Update saved message tracking - keep messages in UI, just track what's been saved
      const newSavedIds = new Set([...savedMessageIds, ...formDataMessages.map(m => m.id)]);
      setSavedMessageIds(newSavedIds);
      setLastSavedMessageCount(messages.length);

      console.log('Updated saved message tracking:', {
        totalSavedIds: newSavedIds.size,
        totalMessages: messages.length,
        savedIds: Array.from(newSavedIds),
        newlySavedIds: formDataMessages.map(m => m.id) // Use original messages for tracking
      });
      
    } catch (error) {
      console.error('Failed to save form data messages batch:', error);
      console.error('Error details:', {
        id,
        formDataMessagesCount: formDataMessages.length,
        totalMessagesCount: messages.length,
        error: error instanceof Error ? error.message : error
      });
    } finally {
      setIsSavingChatHistory(false);
    }
  }, [id, isSavingChatHistory, messages, savedMessageIds]);
 const handleCreatePipeline = () => {
    // Define what happens when the "Create Pipeline" suggestion is clicked
    addMessageWithFormData({ role: 'user', content: 'Create a data pipeline' });
    // Simulate assistant response
    setTimeout(() => {
      // addMessageWithFormData({
      //   role: 'assistant',
      //   content: "Let's start creating your data pipeline. First, I need some information about the data source:"
      // });
      setShowReaderForm(true);
    }, 500);
  };

  // Legacy save function - now also saves only form data messages
  const saveChatHistory = useCallback(async (messagesToSave: ChatMessage[]) => {
    console.log('saveChatHistory called with:', {
      id,
      isSavingChatHistory,
      totalMessages: messagesToSave.length,
      savedMessageIds: savedMessageIds.size,
      lastSavedCount: lastSavedMessageCount
    });

    if (!id) {
      console.warn('No id available, skipping chat history save');
      return;
    }

    if (isSavingChatHistory) {
      console.warn('Already saving chat history, skipping');
      return;
    }

    // Filter to only messages with form data that haven't been saved
    const formDataMessages = messagesToSave.filter(msg => {
      // Only save messages that have form data
      if (!msg.formData) {
        return false;
      }
      
      const messageId = msg.id || generateMessageId();
      return !savedMessageIds.has(messageId);
    });

    if (formDataMessages.length === 0) {
      console.log('No new form data messages to save');
      return;
    }

    console.log(`Saving ${formDataMessages.length} form data messages out of ${messagesToSave.length} total messages`);

    setIsSavingChatHistory(true);
    try {
      // Format only the form data messages
      const formattedMessages = formDataMessages.map((msg) => {
        const messageId = msg.id || generateMessageId();
        // Ensure original message has ID for local tracking
        if (!msg.id) {
          msg.id = messageId;
        }
        
        // Properly serialize formData to avoid circular references and functions
        let serializedFormData = undefined;
        if (msg.formData) {
          try {
            serializedFormData = {
              schema: msg.formData.schema,
              sourceColumns: msg.formData.sourceColumns || [],
              currentNodeId: msg.formData.currentNodeId,
              isTarget: msg.formData.isTarget,
              // Properly serialize initialValues by creating a clean copy
              initialValues: msg.formData.initialValues ? JSON.parse(JSON.stringify(msg.formData.initialValues)) : {}
            };
            console.log('Serialized formData for message (legacy):', messageId, serializedFormData);
          } catch (error) {
            console.error('Error serializing formData for message (legacy):', messageId, error);
            serializedFormData = {
              currentNodeId: msg.formData.currentNodeId,
              initialValues: {}
            };
          }
        }
        
        return {
          // Don't include id - FastAPI will auto-generate primary key
          role: msg.role,
          content: msg.content,
          timestamp: new Date().toISOString(),
          // Don't save suggestions since they contain onClick functions that can't be serialized
          // and are only meaningful for the current session
          suggestions: [],
          formData: serializedFormData
        };
      });

      const chatHistoryData = {
        pipeline_id: id,
        messages: formattedMessages,
        append: true, // Set append to true for all saves
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Saving form data messages (legacy):', {
        formDataMessagesCount: formattedMessages.length,
        messageIds: formDataMessages.map(m => m.id) // Use original messages for tracking
      });
      
      const result = await apiService.savePipelineChatHistory(id, chatHistoryData);
      console.log('Form data messages saved successfully (legacy):', result);

      // Update saved message tracking
      const newSavedIds = new Set([...savedMessageIds, ...formDataMessages.map(m => m.id)]);
      setSavedMessageIds(newSavedIds);
      setLastSavedMessageCount(messagesToSave.length);

      console.log('Updated saved message tracking (legacy):', {
        totalSavedIds: newSavedIds.size,
        newSavedCount: messagesToSave.length
      });
      
    } catch (error) {
      console.error('Failed to save form data messages (legacy):', error);
      console.error('Error details:', {
        id,
        formDataMessagesCount: formDataMessages.length,
        totalMessagesCount: messagesToSave.length,
        error: error instanceof Error ? error.message : error
      });
    } finally {
      setIsSavingChatHistory(false);
    }
  }, [id, isSavingChatHistory, savedMessageIds, lastSavedMessageCount,messages]);

  // Helper function to generate contextual messages based on form data
  const generateContextualMessages = useCallback((formDataMessage: any, index: number, allFormDataMessages: any[]) => {
    const messages: ChatMessage[] = [];
    const messageId = formDataMessage.id;
    const originalMsgOwner = formDataMessage.msg_owner;
    
    if (index === 0) {
    
      
      messages.push({
        id: `create_pipeline_${messageId}`,
        role: 'user',
        content: 'Create a data pipeline',
        msg_owner: originalMsgOwner
      });
      
      messages.push({
        id: `start_pipeline_${messageId}`,
        role: 'assistant',
        content: "Let's start creating your data pipeline. First, I need some information about the data source:",
        msg_owner: originalMsgOwner
      });
    }

    // Generate messages based on form data type
    if (formDataMessage.formData) {
      const formData = formDataMessage.formData;
      
      // Handle Reader/Source configuration
      if (formData.schema && formData.schema.module_name === 'Reader') {
        // Extract data source info from form data
        const initialValues = formData.initialValues || {};
        const dataSourceName = initialValues.reader_name || initialValues.name || 'data source';
       
        
        // The actual form data message (from database)
        messages.push({
          ...formDataMessage,
          suggestions: [] // Will be regenerated
        });
        
      
        
      } else if (formData.schema && formData.schema.module_name) {
        // Handle other transformation types
        const transformationType = formData.schema.module_name;
        const nodeId = formData.currentNodeId;
        
        // User request for transformation
        messages.push({
          id: `transform_request_${messageId}`,
          role: 'user',
          content: `Add ${transformationType} transformation`,
          msg_owner: originalMsgOwner
        });
        
        // Assistant confirmation
        messages.push({
          id: `transform_added_${messageId}`,
          role: 'assistant',
          content: `I've added a ${transformationType} transformation to your pipeline. Let's configure it:`,
          msg_owner: originalMsgOwner
        });
        
        // The actual form data message (from database)
        messages.push({
          ...formDataMessage,
          suggestions: [] // Will be regenerated
        });
        
        // Success message after transformation configuration
        messages.push({
          id: `transform_success_${messageId}`,
          role: 'assistant',
          content: `Excellent! The ${transformationType} transformation has been configured successfully.`,
          msg_owner: originalMsgOwner,
          suggestions: [
            { text: "Add another transformation", onClick: handleShowTransformations },
            { text: "Add target destination", onClick: () => console.log('Add target') }
          ]
        });
      } else {
        // Generic form data message
        messages.push({
          ...formDataMessage,
          suggestions: [] // Will be regenerated
        });
      }
    } else {
      // Fallback for messages without form data (shouldn't happen with new logic)
      messages.push({
        ...formDataMessage,
        suggestions: []
      });
    }
    
    return messages;
  }, [handleCreatePipeline, handleAddAnotherSource, handleShowTransformations]);



  // Load chat history when id changes
  useEffect(() => {
    let isCancelled = false;
    
    const loadHistoryForCurrentId = async () => {
      if (!id) {
        console.warn('No id available, skipping chat history load');
        return;
      }

      // Check if we've already loaded this pipeline's history
      if (hasLoadedChatHistoryRef.current === id) {
        console.log('Chat history already loaded for pipeline:', id);
        return;
      }

      // Prevent multiple simultaneous loads
      if (isLoadingChatHistory) {
        console.log('Already loading chat history, skipping');
        return;
      }

      console.log('Loading chat history for pipeline ID:', id);
      setIsLoadingChatHistory(true);
      
      try {
        const response = await apiService.getPipelineChatHistory(id);
        
        // Check if component was unmounted or id changed during the async operation
        if (isCancelled) {
          console.log('Load cancelled for id:', id);
          return;
        }
        
        console.log('Loaded chat history response:', response);
        
        // Handle the new API response format: { success: true, data: { messages: [...] } }
        if (response && response.success && response.data && response.data.messages) {
          const history = response.data;
          console.log('Loaded form data messages:', history.messages.length);
          setChatHistory(history);
          
          // Since we only saved form data messages, we need to recreate the full chat flow
          const formDataMessages = history.messages.filter((msg: any) => msg.formData);
          console.log('Form data messages to recreate from:', formDataMessages.length);
          
          if (formDataMessages.length === 0) {
            // No form data messages, start fresh
            setMessages([]);
            setSavedMessageIds(new Set());
            setLastSavedMessageCount(0);
            hasLoadedChatHistoryRef.current = id;
            return;
          }
          
          // Generate full chat history from form data messages
          const recreatedMessages: ChatMessage[] = [];
          
          formDataMessages.forEach((formDataMsg: any, index: number) => {
            const contextualMessages = generateContextualMessages(formDataMsg, index, formDataMessages);
            recreatedMessages.push(...contextualMessages);
          });
          
          // Add final completion message if we have form data messages
          if (formDataMessages.length > 0) {
            const lastFormData = formDataMessages[formDataMessages.length - 1];
            recreatedMessages.push({
              id: `completion_${lastFormData.id}`,
              role: 'assistant',
              content: "Great work! Your pipeline configuration is looking good. What would you like to do next?",
              msg_owner: lastFormData.msg_owner,
              suggestions: [
                { text: "Add another source", onClick: handleAddAnotherSource },
                { text: "Add another transformation", onClick: handleShowTransformations },
              ]
            });
          }
          
          console.log('Recreated full chat history with', recreatedMessages.length, 'messages from', formDataMessages.length, 'form data messages');
          setMessages(recreatedMessages);
          
          // Track only the original form data messages as saved
          const savedFormDataIds:any = new Set(formDataMessages.map((msg: any) => msg.id).filter(Boolean));
          setSavedMessageIds(savedFormDataIds);
          setLastSavedMessageCount(recreatedMessages.length);
          
          console.log('Tracked form data messages as saved:', {
            recreatedCount: recreatedMessages.length,
            savedFormDataIds: savedFormDataIds.size,
            savedIds: Array.from(savedFormDataIds)
          });
          
          // Restore forms based on the last form data message
          const lastFormDataMessage = formDataMessages[formDataMessages.length - 1];
          if (lastFormDataMessage && lastFormDataMessage.formData) {
            const formData = lastFormDataMessage.formData;
            
            // Check if we need to restore reader form
            if (formData.schema && formData.schema.module_name === 'Reader') {
              console.log('Restoring reader configuration form from form data');
              
              const initialValues = formData.initialValues || {};
              const dataSourceName = initialValues.reader_name || initialValues.name || 'data source';
              
              // Set up the initial data for ReaderOptionsForm restoration
              const initialData = {
                reader_name: dataSourceName,
                name: dataSourceName,
                file_type: initialValues.file_type || 'CSV',
                source: initialValues.source || {
                  name: dataSourceName,
                  type: 'File',
                  data_src_name: dataSourceName,
                  file_name: dataSourceName,
                  connection: {
                    connection_config_id: 0,
                    connection_type: 'Local',
                    file_path_prefix: 'data'
                  }
                }
              };
              
              // Restore the ReaderOptionsForm
              setTimeout(() => {
                setSelectedDataSource(initialData);
                setShowReaderOptionsForm(true);
              }, 500);
            }
          }
          
          console.log('Chat history recreated successfully');
          
        } else if (response && !response.success) {
          console.warn('API returned unsuccessful response:', response);
          setMessages([]);
        } else {
          console.log('No chat history found or empty response');
          setMessages([]);
        }
        
        // Mark this pipeline as loaded
        hasLoadedChatHistoryRef.current = id;
        
      } catch (error) {
        if (!isCancelled) {
          console.error('Failed to load chat history:', error);
          console.error('Error details:', {
            id,
            error: error instanceof Error ? error.message : error
          });
          // Initialize with empty messages if loading fails
          setMessages([]);
          hasLoadedChatHistoryRef.current = id; // Mark as loaded even if failed
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingChatHistory(false);
        }
      }
    };

    // Reset state when id changes
    if (id && hasLoadedChatHistoryRef.current !== id) {
      console.log('Pipeline ID changed to:', id);
      hasLoadedChatHistoryRef.current = null; // Reset loaded state
      loadHistoryForCurrentId();
    }

    // Cleanup function to cancel ongoing operations
    return () => {
      isCancelled = true;
    };
  }, [id]); // Only depend on id

  // Save chat history when explicitly triggered (on form saves, etc.)
  const saveChatHistoryOnAction = useCallback(async (actionDescription?: string) => {
    console.log(`Saving chat history on action: ${actionDescription || 'Manual save'}`);
    if (messages.length > 0 && id) {
      await saveChatHistory(messages);
    } else {
      console.log('Cannot save chat history:', {
        noMessages: messages.length === 0,
        noPipelineId: !id
      });
    }
  }, [messages, id, saveChatHistory]);

  // Helper function to add message with form data
  const addMessageWithFormData = useCallback((message: ChatMessage) => {
    const messageWithId = {
      ...message,
      id: message.id || generateMessageId()
    };
    console.log('Adding message with ID:', messageWithId.id, 'Content:', messageWithId.content);
    setMessages(prevMessages => [...prevMessages, messageWithId]);
  }, []);

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
    addMessageWithFormData({ role: 'user', content: trimmedInput });
    setInput('');
    // Simulate assistant response
    setTimeout(() => {
      addMessageWithFormData({ role: 'assistant', content: 'Processing your request...' });
    }, 500);
  };

 
  const onSubmitReaderForm = async (data: ReaderFormValues) => {
    // Add the form data to the messages (no formData needed for search message)
    addMessageWithFormData({
      role: 'user',
      content: `Searching for reader: ${data.reader_name}`
    });

    // Hide the form
    setShowReaderForm(false);

    // Show loading message
    // addMessageWithFormData({
    //   role: 'assistant',
    //   content: `Searching for data sources matching "${data.reader_name}"...`
    // });

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
      if (response?.data && response?.data.length > 0) {
        // Show success message
        // addMessageWithFormData({
        //   role: 'assistant',
        //   content: `I found ${response?.data.length} data source(s) matching "${data.reader_name}".`
        // });

        // Show data sources as suggestion buttons
        setTimeout(() => {
          addMessageWithFormData({
            role: 'assistant',
            content: "Please select a data source to add to your pipeline:",
            suggestions: response?.data?.map(item => ({
                text: item.data_src_name,
                onClick: () => {
                  if (readerNode) {
                    setUnsavedChanges();

                    addNodeToHistory();

                    console.log(readerNode, "readerNode");
                    console.log("Auto-configuring source with API data:", item);
                    
                    // Create a copy of the reader node with a unique ID to ensure we create a new node
                    const newReaderNode = {
                      ...readerNode,
                      id: `reader-${Date.now()}`
                    };
                    
                    // When adding another source, we always want to create a new Reader node
                    // We'll pass the basic data here, and the full configuration will be handled by handleReaderOptionsSubmit
                    // handleNodeClick(newReaderNode, {
                    //   reader_name: item.data_src_name,
                    //   name: item.data_src_name,
                    //   source: {
                    //     source_name: item.data_src_name,
                    //     data_src_id: item.data_src_id
                    //   }
                    // });

                    // Add a message to show that the data source was selected
                    addMessageWithFormData({
                      role: 'user',
                      content: `Selected data source: ${item.data_src_name}`
                    });

                    // Auto-configure the source without showing the form
                    setTimeout(() => {
                      // Find the most recently added Reader node to get the nodeId
                      const readerNodes = nodes.filter(node => 
                        node.data.label === "Reader" || node.data.label.startsWith("Reader ")
                      );
                      const latestReaderNodeId = readerNodes.length > 0 ? readerNodes[readerNodes.length - 1].id : newReaderNode.id;
                      
                      // Structure the data in the format expected by handleReaderOptionsSubmit
                      const formattedSourceData = {
                        nodeId: latestReaderNodeId,
                        sourceData: {
                          data: {
                            label: item.data_src_name,
                            source: {
                              data_src_id: item.data_src_id,
                              data_src_name: item.data_src_name,
                              source_name: item.data_src_name,
                              data_src_desc: item.data_src_desc || item.data_src_name,
                              connection_type: item.connection_config?.custom_metadata?.connection_type || 
                                              (item.connection_config?.connection_name?.toLowerCase() === 's3' ? 'S3' : 'Local'),
                              connection_config_id: item.connection_config_id,
                              file_name: item.file_name,
                              file_path_prefix: item.file_path_prefix || item.connection_config?.custom_metadata?.file_path_prefix,
                              file_type: item.connection_config?.custom_metadata?.file_type || 'CSV',
                              table_name: item.connection_config?.custom_metadata?.table_name || item.data_src_name,
                              type: item.connection_config?.custom_metadata?.connection_type?.toLowerCase() === 'local' ||
                                    item.connection_config?.custom_metadata?.connection_type?.toLowerCase() === 's3'
                                    ? 'File' : 'Relational',
                              // Add additional fields from API response
                              total_records: item.total_records,
                              data_src_quality: item.data_src_quality,
                              data_source_layout: item.data_source_layout,
                              bh_project_id: item.bh_project_id,
                              connection_config: {
                                custom_metadata: item.connection_config?.custom_metadata || {},
                                connection_config_name: item.connection_config?.connection_config_name || ''
                              },
                              name: item.data_src_name
                            }
                          }
                        }
                      };
                      
                      console.log("Formatted source data for handleReaderOptionsSubmit:", formattedSourceData);
                      
                      // Directly configure the source using the properly formatted API data
                      handleReaderOptionsSubmit(formattedSourceData);
                    }, 500);
                  } else {
                    toast.error("Reader node not found. Please try again.");
                  }
                }
              }))
            },
          );
        }, 300);
      } else {
        // No results found
        addMessageWithFormData({
          role: 'assistant',
          content: `I couldn't find any data sources matching "${data.reader_name}". Would you like to create a new one?`,
          suggestions: [
            { text: "Yes, create new", onClick: () => handleCreateNewDataSource(data.reader_name) },
            { text: "No, try another search", onClick: () => handleRetrySearch() }
          ]
        });
      }
    } catch (error) {
      console.error("API Error:", error);
      toast.error("Failed to fetch data sources. Please try again.");

      // Show error message
      addMessageWithFormData({
        role: 'assistant',
        content: "I encountered an error while searching for data sources. Please try again or check your connection."
      });
    }

    // Save chat history batch after reader form submission
    setTimeout(() => {
      saveChatHistoryBatch();
    }, 1000);
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
                  console.log(readerNode, "readerNode");
                  
                  // Create a copy of the reader node with a unique ID to ensure we create a new node
                  const newReaderNode = {
                    ...readerNode,
                    id: `reader-${Date.now()}`
                  };
                  
                  // When creating a new data source, we always want to create a new Reader node
                  handleNodeClick(newReaderNode, mockDataSource);

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
      name: readerName,
      file_type: 'CSV',
      query: '',
      read_options: {},
      source: {
        name: readerName,
        type: sourceType,
        source_name: readerName,
        data_src_name: readerName,
        data_src_id: `new-${Date.now()}`,
        file_name: '',
        table_name: '',
        bh_project_id: '',
        file_type: 'CSV',
        connection: {
          connection_config_id: 0,
          connection_type: sourceType === "File" ? "Local" : "Postgres",
          file_path_prefix: sourceType === "File" ? "data" : "",
          name: "New Connection"
        },
        connection_config_id: 0
      }
    };

    // Set the selected data source and show the ReaderOptionsForm
    console.log('Setting selectedDataSource for new source:', initialData);
    setSelectedDataSource(initialData);
    setShowReaderOptionsForm(true);


  };

  // Handle the submission of the ReaderOptionsForm
  const handleReaderOptionsSubmit = (sourceData: any) => {
    // Find the most recently added Reader node to get the nodeId
    const readerNodes = nodes.filter(node => 
      node.data.label === "Reader" || node.data.label.startsWith("Reader ")
    );
    const latestReaderNodeId = readerNodes.length > 0 ? readerNodes[readerNodes.length - 1].id : `reader-${Date.now()}`;

    // Add messages to show the configuration was saved
    const readerMessages = [
     
      {
        role: 'assistant' as const,
        content: `Great! What would you like to do next?`,
        suggestions: [
          { text: "Add another source", onClick: handleAddAnotherSource },
          { text: "Add another transformation", onClick: handleShowTransformations }
        ],
        id: generateMessageId(),
        // Include form data to save reader configuration in chat history
        formData: {
          schema: {
            module_name: 'Reader',
            title: 'Reader',
            type: 'reader_configuration'
          },
          sourceColumns: [],
          currentNodeId: latestReaderNodeId,
          isTarget: false,
          isConfirmation: true, // Flag to indicate this is a confirmation message, not a form message
          initialValues: {
            nodeId: latestReaderNodeId,
            reader_name: sourceData.sourceData?.data?.source?.source_name || sourceData.sourceData?.data?.label || '',
            name: sourceData.sourceData?.data?.source?.source_name || sourceData.sourceData?.data?.label || '',
            source_type: sourceData.sourceData?.data?.source?.type || 'File',
            file_type: sourceData.sourceData?.data?.source?.file_type || 'CSV',
            connection_config_id: sourceData.sourceData?.data?.source?.connection_config_id || 0,
            data_src_id: sourceData.sourceData?.data?.source?.data_src_id || '',
            // Store the complete source configuration for reference
            sourceConfiguration: sourceData.sourceData?.data?.source || sourceData.sourceData?.data || {}
          }
        }
      }
    ];

    console.log('Reader messages created:', readerMessages);
    console.log('Reader message with formData:', readerMessages[1]);

    setMessages(prevMessages => {
      const updatedMessages = [...prevMessages, ...readerMessages];
      // Save chat history batch after reader configuration with the updated messages
      setTimeout(() => {
        console.log('Saving reader configuration to chat history...');
        console.log('Messages to save:', updatedMessages.length);
        console.log('Messages with formData:', updatedMessages.filter(msg => msg.formData).length);
        saveChatHistoryBatchWithMessages(updatedMessages);
      }, 1000);
      return updatedMessages;
    });

    // Hide the form
    setShowReaderOptionsForm(false);

    if (readerNode) {
      // Mark unsaved changes
      setUnsavedChanges();

      // Add node to history for undo functionality
      addNodeToHistory();

      console.log(readerNode, "readerNode");

      // When configuring a reader from the ReaderOptionsForm, we should update the existing node
      // Find the most recently added Reader node to update
      const readerNodes = nodes.filter(node => 
        node.data.label === "Reader" || node.data.label.startsWith("Reader ")
      );
      
      // Get the most recently added reader node (last in the array)
      const latestReaderNodeId = readerNodes.length > 0 ? readerNodes[readerNodes.length - 1].id : null;
      
      if (latestReaderNodeId) {
        // Update the existing node with the new source data
        handleSourceUpdate({
          nodeId: latestReaderNodeId,
          sourceData: sourceData
        });
      } else {
        // If no reader node exists yet, add a new one
        handleNodeClick(readerNode, sourceData.sourceData?.data?.source || sourceData);
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
 

  // Function to handle showing transformation options
 

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
      `Select a node to connect it to:` :
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

    // Find existing connections to this target node to determine which handle to use
    const existingConnections = edges.filter(edge => edge.target === targetNodeId);
    
    // Find the target node to get its module name
    const targetNode = nodes.find(node => node.id === targetNodeId);
    const targetModuleName = targetNode?.data?.label;
    
    // Determine if this is a multi-input node (like Joiner, Lookup, SetCombiner, CustomPySpark)
    const isMultiInputNode = targetNodeType.ui_properties.ports.maxInputs === "unlimited" || 
                             targetNodeType.ui_properties.ports.maxInputs > 1;
    
    // For multi-input nodes, we need to create distinct input handles
    let targetHandle;
    
    if (isMultiInputNode) {
      // For multi-input nodes, create a unique handle for each connection
      // Use a consistent naming pattern that includes the source node ID to ensure uniqueness
      targetHandle = `input-${sourceNode.id}`;
      
      // Check if we already have a connection from this source to this target
      const existingConnection = existingConnections.find(
        edge => edge.source === sourceNode.id && edge.target === targetNodeId
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
      sourceHandle: 'output-0',  // Use the first output handle of the source node
      targetHandle: targetHandle  // Use a different input handle for each connection
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
      style: { stroke: '#b1b1b7', strokeWidth: 2 }
    };

    console.log('Creating edge:', newEdge);
    console.log('Current edges before connection:', edges);

    // Add the edge directly to the edges array
    setEdges(prevEdges => {
      // Check if the edge already exists to avoid duplicates
      // Now we also check the specific handles to allow multiple connections between the same nodes
      const edgeExists = prevEdges.some(
        edge => 
          edge.source === sourceNode.id && 
          edge.target === targetNodeId && 
          edge.targetHandle === targetHandle
      );

      if (edgeExists) {
        console.log('Edge already exists with the same handle, not adding duplicate');
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
          
          // Force update node internals to ensure handles are properly rendered
          // This is crucial for multi-input nodes
          const targetNode = nodes.find(node => node.id === targetNodeId);
          if (targetNode && targetNode.data?.ports?.maxInputs) {
            // We can't directly use useUpdateNodeInternals here since it's a hook
            // Instead, we'll trigger a resize event which will cause React Flow to recalculate
            // node positions and connections
            window.dispatchEvent(new Event('resize'));
            
            // Also dispatch a custom event that our NodeHandles component can listen for
            const updateEvent = new CustomEvent('updateNodeInternals', { 
              detail: { nodeId: targetNodeId } 
            });
            window.dispatchEvent(updateEvent);
            
            console.log('Dispatched updateNodeInternals event for target node:', targetNodeId);
          }
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
                    .map(edge => ({
                      source: edge.source,
                      targetHandle: edge.targetHandle
                    }))
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
                        .map(edge => ({
                          source: edge.source,
                          targetHandle: edge.targetHandle
                        }))
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
                        .map(edge => ({
                          source: edge.source,
                          targetHandle: edge.targetHandle
                        }))
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
                              .map(edge => ({
                                source: edge.source,
                                targetHandle: edge.targetHandle
                              }))
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
                              .map(edge => ({
                                source: edge.source,
                                targetHandle: edge.targetHandle
                              }))
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
              <div className="ml-8">
                <SuggestionButton
                  text="Create Pipeline"
                  onClick={handleCreatePipeline}
                  assistantColor="#009459"
                />
              </div>
            </motion.div>
          ) : (
            <>
              {messages.map((message, index) => (
                <div key={index} className="flex flex-col gap-1.5 py-1.5">
                  <div className="flex items-start gap-2">
                    <div
                      className="w-6 h-6 mt-1 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-medium"
                      style={{ backgroundColor: message.role === 'assistant' ? '#009459' : '#000000' }}
                    >
                      {message.role === 'assistant' 
                        ? getAvatarInitials(message.msg_owner)
                        : getAvatarInitials(message.msg_owner)
                      }
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


                  {/* Render form if formData exists and it's not a confirmation message */}
                  {message.role === 'assistant' && message.formData && message.formData.schema && !message.formData.isConfirmation && (
                    console.log('Rendering form with data:', message.formData),
                    <div className="pl-8 mt-2 bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                      <div className="space-y-3">
                        <h3 className="text-base font-semibold">{message.formData.schema?.title || 'Configuration'}</h3>

                        {message.formData.schema?.type === 'reader_configuration' ? (
                          <div className="form-wrapper">
                            <div className="p-4 bg-gray-50 rounded-lg">
                              <h4 className="font-medium mb-2">Reader Configuration Saved</h4>
                              <div className="text-sm text-gray-600 space-y-1">
                                <p><strong>Reader Name:</strong> {message.formData.initialValues?.reader_name || 'N/A'}</p>
                                <p><strong>Source Type:</strong> {message.formData.initialValues?.source_type || 'N/A'}</p>
                                <p><strong>File Type:</strong> {message.formData.initialValues?.file_type || 'N/A'}</p>
                              </div>
                            </div>
                          </div>
                        ) : message.formData.isTarget || message.formData.schema?.title === 'Target' ? (
                          <div className="form-wrapper">
                          
                            <TargetPopUp
                              isOpen={false} // Use inline mode
                              onClose={() => {
                                // Handle form close
                                
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

                                
                                let data;

                                if (sourceData.sourceData?.data) {
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

                                // Update the chat message's formData.initialValues with the submitted data
                                setMessages(prevMessages => {
                                  return prevMessages.map(msg => {
                                    if (msg.formData && msg.formData.currentNodeId === message.formData.currentNodeId) {
                                      console.log('🔄 Updating Target chat message formData.initialValues for nodeId:', message.formData.currentNodeId);
                                      console.log('📝 Previous Target initialValues:', msg.formData.initialValues);
                                      console.log('📝 Updated Target form state to merge:', updatedFormState);
                                      const updatedInitialValues = {
                                        ...msg.formData.initialValues,
                                        ...updatedFormState
                                      };
                                      console.log('📝 Updated Target initialValues:', updatedInitialValues);
                                      return {
                                        ...msg,
                                        formData: {
                                          ...msg.formData,
                                          initialValues: updatedInitialValues
                                        }
                                      };
                                    }
                                    return msg;
                                  });
                                });

                                // Mark unsaved changes
                                setUnsavedChanges();

                                // Add a message to show the form was submitted
                                const newTargetMessages = [
                                  {
                                    role: 'user' as const,
                                    content: `Configured Target`,
                                    id: generateMessageId()
                                  },
                                  {
                                    role: 'assistant' as const,
                                    content: `Great! I've updated the Target with your configuration. What would you like to do next?`,
                                    suggestions: [
                                      { text: "Add another source", onClick: handleAddAnotherSource },
                                      { text: "Add another transformation", onClick: handleShowTransformations }
                                    ],
                                    id: generateMessageId(),
                                    // Include form data to save target configuration in chat history
                                    formData: {
                                      schema: message.formData.schema,
                                      sourceColumns: message.formData.sourceColumns || [],
                                      currentNodeId: message.formData.currentNodeId,
                                      isTarget: true,
                                      isConfirmation: true, // Flag to indicate this is a confirmation message, not a form message
                                      initialValues: {
                                        ...message.formData.initialValues,
                                        ...updatedFormState
                                      }
                                    }
                                  }
                                ];
                                
                                setMessages(prevMessages => {
                                  const updatedMessages = [...prevMessages, ...newTargetMessages];
                                  // Save chat history batch after target form submission with updated messages
                                  setTimeout(() => {
                                    console.log('Saving target configuration to chat history...');
                                    console.log('Target messages to save:', updatedMessages.length);
                                    console.log('Target messages with formData:', updatedMessages.filter(msg => msg.formData).length);
                                    saveChatHistoryBatchWithMessages(updatedMessages);
                                  }, 1000);
                                  return updatedMessages;
                                });
                              }}
                            />
                          </div>
                        ) : (
                          <div className="form-wrapper">
                            {message.formData && message.formData.schema && message.formData.currentNodeId ? (
                              <CreateFormFormik
                                schema={message.formData.schema}
                                sourceColumns={message.formData.sourceColumns || []}
                                onClose={() => {
                                  // Handle form close
                                  
                                }}
                                currentNodeId={message.formData.currentNodeId}
                              initialValues={{
                                // Start with the original form data initial values
                                ...message.formData.initialValues,
                                // Then try to get values from formStates (saved form data)
                                ...formStates[message.formData.currentNodeId],
                                nodeId: message.formData.currentNodeId,
                                // Finally, try to get values from the node's transformationData if it exists
                                ...(() => {
                                  const node = nodes.find(n => n.id === message.formData.currentNodeId);
                                  return node?.data?.transformationData || {};
                                })()
                              }}
                              nodes={nodes}
                              edges={edges}
                              pipelineDtl={pipelineDtl}
                              onSubmit={(data) => {
                                console.log('🚀 Form submitted with data:', data);
                                const nodeId = message.formData.currentNodeId;
                                const updatedTitle = data.name || data.title || "Transformation";

                                // Debug: Log current state before update
                                debugNodeData(pipelineContext.nodes, `📋 Nodes before form submission for ${nodeId}:`);
                                console.log('📝 Form states before update:', formStates);

                                // Directly update the node in the context
                                const currentNodes = [...pipelineContext.nodes];
                                const nodeIndex = currentNodes.findIndex(node => node.id === nodeId);
                                if (nodeIndex !== -1) {
                                  const currentNodeData = JSON.parse(JSON.stringify(currentNodes[nodeIndex].data));
                                  if (!currentNodeData.transformationData) {
                                    currentNodeData.transformationData = {};
                                  }
                                  
                                  // Create a clean copy of the form data
                                  const cleanFormData = { ...data };
                                  
                                  // Remove nodeId from the transformation data as it's metadata
                                  delete cleanFormData.nodeId;
                                  
                                  // Special handling for different transformation types
                                  if (currentNodes[nodeIndex].data.label === 'Filter') {
                                    console.log('Processing Filter node in PipeLineChatPanel:', data);
                                    // Ensure condition is properly set
                                    if (data.condition !== undefined) {
                                      cleanFormData.condition = data.condition;
                                    }
                                  }
                                  
                                  // Update the node with the transformation data
                                  const updatedNode = {
                                    ...currentNodes[nodeIndex],
                                    data: {
                                      ...currentNodeData,
                                      title: updatedTitle,
                                      transformationData: cleanFormData, // This is the key fix - store the clean data
                                      source: currentNodeData.source || {}
                                    }
                                  };
                                  
                                  console.log('✅ Updated node with transformationData:', updatedNode);
                                  
                                  currentNodes[nodeIndex] = updatedNode;
                                  pipelineContext.setNodes(currentNodes);
                                  
                                  // Debug: Log nodes after update
                                  debugNodeData(currentNodes, `📋 Nodes after form submission for ${nodeId}:`);
                                  
                                  // Update form states with the data including nodeId for tracking
                                  const formStateData = { ...cleanFormData, nodeId: nodeId, name: updatedTitle };
                                  setFormStates(prevStates => ({ ...prevStates, [nodeId]: formStateData }));
                                  setformsHanStates(prevStates => ({ ...prevStates, [nodeId]: formStateData }));
                                  
                                  console.log('📝 Updated form states:', { [nodeId]: formStateData });

                                  // Mark as unsaved
                                  setUnsavedChanges();
                                  
                                  // Validate nodes after update
                                  validateNodeTransformationData(currentNodes);
                                  
                                  window.dispatchEvent(new Event('resize'));
                                }

                                // Call handleFormSubmit to ensure all state is updated properly
                                const formSubmitData = { ...data, nodeId: nodeId, name: updatedTitle };
                                handleFormSubmit(formSubmitData);

                                // Log the data being sent to handleFormSubmit
                                console.log('Data sent to handleFormSubmit:', formSubmitData);

                                // Add a message to show the form was submitted
                                const newMessages = [
                                  { role: 'user' as const, content: `Configured ${message.formData?.schema?.title} transformation`, id: generateMessageId() },
                                  {
                                    role: 'assistant' as const, 
                                    content: `Great! I've updated the ${message.formData?.schema?.title} transformation with your configuration. What would you like to do next?`, 
                                    suggestions: [
                                      { text: "Add another source", onClick: handleAddAnotherSource },
                                      { text: "Add another transformation", onClick: handleShowTransformations }
                                    ],
                                    id: generateMessageId(),
                                    // Include form data to save transformation configuration in chat history
                                    formData: {
                                      schema: message.formData.schema,
                                      sourceColumns: message.formData.sourceColumns || [],
                                      currentNodeId: message.formData.currentNodeId,
                                      isTarget: message.formData.isTarget || false,
                                      isConfirmation: true, // Flag to indicate this is a confirmation message, not a form message
                                      initialValues: {
                                        ...message.formData.initialValues,
                                        ...data,
                                        nodeId: nodeId,
                                        name: updatedTitle
                                      }
                                    }
                                  }
                                ];
                                
                                // SINGLE STATE UPDATE: Update existing message formData AND add new messages
                                setMessages(prevMessages => {
                                  console.log('🔄 SINGLE STATE UPDATE: Updating formData.initialValues and adding new messages');
                                  
                                  // Recreate cleanFormData within this scope
                                  const cleanFormData = { ...data };
                                  delete cleanFormData.nodeId;
                                  
                                  // Special handling for different transformation types
                                  const currentNode = nodes.find(n => n.id === nodeId);
                                  if (currentNode && currentNode.data.label === 'Filter') {
                                    console.log('Processing Filter node in PipeLineChatPanel:', data);
                                    if (data.condition !== undefined) {
                                      cleanFormData.condition = data.condition;
                                    }
                                  }
                                  
                                  console.log('📝 Clean form data to merge:', cleanFormData);
                                  
                                  // STEP 1: Update the existing message's formData.initialValues
                                  const messagesWithUpdatedFormData = prevMessages.map(msg => {
                                    if (msg.formData && msg.formData.currentNodeId === nodeId) {
                                      console.log('🔄 Updating chat message formData.initialValues for nodeId:', nodeId);
                                      console.log('📝 Previous initialValues:', msg.formData.initialValues);
                                      
                                      const updatedInitialValues = {
                                        ...msg.formData.initialValues,
                                        ...cleanFormData
                                      };
                                      console.log('📝 Updated initialValues:', updatedInitialValues);
                                      
                                      return {
                                        ...msg,
                                        formData: {
                                          ...msg.formData,
                                          initialValues: updatedInitialValues
                                        }
                                      };
                                    }
                                    return msg;
                                  });
                                  
                                  // STEP 2: Add the new messages
                                  const finalMessages = [...messagesWithUpdatedFormData, ...newMessages];
                                  
                                  console.log('📋 Final messages count:', finalMessages.length);
                                  console.log('📋 Messages with formData after update:');
                                  finalMessages.forEach((msg, index) => {
                                    if (msg.formData && msg.formData.initialValues) {
                                      console.log(`  Message ${index} (${msg.id}):`, {
                                        content: msg.content.substring(0, 50),
                                        nodeId: msg.formData.currentNodeId,
                                        initialValues: msg.formData.initialValues
                                      });
                                    }
                                  });
                                  
                                  // STEP 3: Save chat history batch with the correctly updated messages
                                  setTimeout(() => {
                                    console.log('💾 About to save chat history batch with updated formData');
                                    console.log('💾 Passing finalMessages directly to avoid stale closure:', finalMessages.length);
                                    saveChatHistoryBatchWithMessages(finalMessages);
                                  }, 500);
                                  
                                  return finalMessages;
                                });
                              }}

                            />
                            ) : (
                              <div className="p-4 text-center text-gray-500">
                                Form data is not available. Please refresh the page or start a new configuration.
                              </div>
                            )}
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
                        nodeId={(() => {
                          // Find the most recently added Reader node
                          const readerNodes = nodes.filter(node => 
                            node.data.label === "Reader" || node.data.label.startsWith("Reader ")
                          );
                          // Get the most recently added reader node (last in the array)
                          return readerNodes.length > 0 ? readerNodes[readerNodes.length - 1].id : `reader-${Date.now()}`;
                        })()}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Transformation Selection Dropdown */}
              {showTransformationDropdown && (
                <div className="mt-2 mb-3">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 mt-1 rounded-full bg-blue-500 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="rounded-lg bg-gray-50 p-4 border border-gray-200 shadow-sm">
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                              Select Transformation
                            </label>
                            <Select onValueChange={handleTransformationSelection}>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Choose a transformation..." />
                              </SelectTrigger>
                              <SelectContent style={{zIndex:9999}}>
                                {nodeDisplayData.nodes
                                  .filter(node => node.ui_properties.module_name !== "Reader")
                                  .map(node => (
                                    <SelectItem 
                                      key={node.ui_properties.module_name} 
                                      value={node.ui_properties.module_name}
                                    >
                                      <div className="flex flex-col">
                                        <span className="font-medium">{node.ui_properties.module_name}</span>
                                      </div>
                                    </SelectItem>
                                  ))
                                }
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex justify-end">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setShowTransformationDropdown(false)}
                              className="h-8 text-sm px-3"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>
      <div className="p-2 border-t border-slate-200 bg-white">
       
        <AIChatInput variant='designer' input={input} onChange={setInput} onSend={handleSend} placeholder="Type a message..." />
      </div>
    </div>
  );
};

export default PipeLineChatPanel;

