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
import { savePipelineChatHistory, getPipelineChatHistory, deletePipelineChatHistory } from './pipelineChatApi';
import { toast } from 'sonner';
import { usePipelineContext } from '@/context/designers/DataPipelineContext';
import { usePipelineModules } from '@/hooks/usePipelineModules';
import { pipelineSchema } from "@bh-ai/schemas";
import { useAppDispatch } from '@/hooks/useRedux';
import { getConnectionConfigList } from '@/store/slices/dataCatalog/datasourceSlice';
import { PipelineForm } from './PipelineForm';
import TargetPopUp from '@/components/bh-reactflow-comps/TargetPopUp';
import { CATALOG_REMOTE_API_URL, AGENT_REMOTE_URL } from '@/config/platformenv';
import { setIsRightPanelOpen } from '@/store/slices/designer/buildPipeLine/BuildPipeLineSlice';
import { useParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { ReaderOptionsForm } from '@/components/bh-reactflow-comps/builddata/ReaderOptionsForm';
import { useHandleDependencySelection } from './useHandleDependencySelection';
import { DeleteConfirmDialog } from '@/components/shared/DeleteConfirmDialog';
import { Trash2 } from 'lucide-react';

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
  showDependencyEdit?: boolean; // Flag to show edit icon for dependencies
  dependencyEditData?: {
    targetNodeId: string;
    targetNodeType: any;
    dependencies: any[];
    transformationType: string;
  };
  formData?: {
    schema: any;
    sourceColumns: any[];
    currentNodeId: string;
    initialValues: any;
    isTarget?: boolean;
    isConfirmation?: boolean; // New field to indicate confirmation
    isMultiSourceSelect?: boolean;
    isSingleDependencySelect?: boolean;
    isMultiDependencySelect?: boolean;
    formId?: string; // Add unique form identifier
    dependencyData?: {
      dependencies: any[];
      targetNodeType: any;
      targetNodeId: string;
      maxInputs: number | string;
    };
    isDependencyEdit?: boolean; // Flag to indicate dependency edit form
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
          // Automatically submit when an option is selected
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

// Dependency edit component
const DependencyEditForm: React.FC<{
  dependencies: any[];
  currentConnections: any[];
  onSubmit: (selectedDependencies: any[]) => void;
  onClose: () => void;
  targetNodeType: any;
  targetNodeId: string;
  maxInputs: number | string;
}> = ({ dependencies, currentConnections, onSubmit, onClose, targetNodeType, targetNodeId, maxInputs }) => {
  const [selectedDependencies, setSelectedDependencies] = useState<any[]>(() => {
    // Initialize with current connections
    const currentConnectionIds = currentConnections.map(conn => conn.source);
    return dependencies.filter(dep => currentConnectionIds.includes(dep.id));
  });

  const handleDependencyToggle = (dependency: any) => {
    setSelectedDependencies(prev => {
      const isSelected = prev.some(dep => dep.id === dependency.id);
      if (isSelected) {
        return prev.filter(dep => dep.id !== dependency.id);
      } else {
        if (maxInputs === 1) {
          // For single input, replace the selection
          return [dependency];
        } else {
          // For multiple inputs, add to selection
          const maxAllowed = maxInputs === "unlimited" ? 10 : maxInputs;
          if (prev.length < maxAllowed) {
            return [...prev, dependency];
          } else {
            return prev;
          }
        }
      }
    });
  };

  const handleSubmit = () => {
    onSubmit(selectedDependencies);
  };

  return (
    <div className="dependency-edit-form p-4 rounded-lg bg-gray-50 border">
      <h4 className="font-semibold mb-2">Edit Connections</h4>
      <div className="space-y-2 mb-4">
        {dependencies.map((dep) => (
          <div key={dep.id} className="flex items-center">
            <input
              type="checkbox"
              id={`edit-dep-${dep.id}`}
              checked={selectedDependencies.some(selected => selected.id === dep.id)}
              onChange={() => handleDependencyToggle(dep)}
              className="mr-2"
            />
            <label htmlFor={`edit-dep-${dep.id}`} className="flex-1">
              {dep.data.title || dep.data.label}
            </label>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={selectedDependencies.length === 0}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Update Connections
        </button>
        <button
          onClick={onClose}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
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
        // Check if we've reached the max limit
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

// Multi-source selection form component
const MultiSourceSelectForm: React.FC<{
  sources: any[];
  onSubmit: (selectedSources: any[]) => void;
  onClose: () => void;
}> = ({ sources, onSubmit, onClose }) => {
  const [selectedSources, setSelectedSources] = useState<any[]>([]);

  const handleSourceToggle = (source: any) => {
    setSelectedSources(prev => {
      const isSelected = prev.some(s => s.data_src_id === source.data_src_id);
      if (isSelected) {
        return prev.filter(s => s.data_src_id !== source.data_src_id);
      } else {
        return [...prev, source];
      }
    });
  };

  const handleSubmit = () => {
    if (selectedSources.length > 0) {
      onSubmit(selectedSources);
    } else {
      toast.error("Please select at least one data source");
    }
  };

  return (
    <div className="multi-source-select-form p-4 border rounded-lg bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Select Data Sources</h3>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {sources.map((source) => (
          <div key={source.data_src_id} className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={`source-${source.data_src_id}`}
              checked={selectedSources.some(s => s.data_src_id === source.data_src_id)}
              onChange={() => handleSourceToggle(source)}
              className="rounded"
            />
            <label
              htmlFor={`source-${source.data_src_id}`}
              className="flex-1 cursor-pointer text-sm"
            >
              <div className="font-medium">{source.data_src_name}</div>
              {/* {source.data_src_desc && (
                <div className="text-gray-500 text-xs">{source.data_src_desc}</div>
              )} */}
            </label>
          </div>
        ))}
      </div>
      <div className="flex justify-end space-x-2 mt-4">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={selectedSources.length === 0}>
          Add Selected Sources ({selectedSources.length})
        </Button>
      </div>
    </div>
  );
};

// Helper function to get schema for transformation directly from pipeline schema
const getSchemaForTransformation = (transformationType: string, targetNodeId: string, engineType: 'pyspark' | 'pyflink' = 'pyspark') => {
  console.log('🔧 getSchemaForTransformation called with:', { transformationType, targetNodeId, engineType });
  
  try {
    // Get the transformation schema directly from pipeline schema
    if (!pipelineSchema?.allOf) {
      console.error('🔧 Pipeline schema not available');
      return null;
    }
    
    const engineSchema = pipelineSchema.allOf.find((schema: any) => 
      schema.if?.properties?.engine_type?.const === engineType
    );

    if (!engineSchema?.then?.properties?.transformations?.items?.allOf) {
      console.error('🔧 No transformations found in pipeline schema');
      return null;
    }

    const availableTransformations = engineSchema.then.properties.transformations.items.allOf.map((transformation: any) => ({
      name: transformation?.if?.properties?.transformation?.const,
      description: transformation?.then?.description || '',
      schema: transformation?.then,
    })).filter((t: any) => t.name);

    console.log('🔧 Available transformations:', availableTransformations.map(t => t.name));
    
    // Find the transformation by name
    const transformation = availableTransformations.find(t => t.name === transformationType);
    
    if (transformation) {
      console.log('🔧 Found transformation in pipeline schema:', transformation.name);
      
      // Create schema object compatible with PipelineForm
      const schemaWithNodeId = {
        title: transformation.name,
        module_name: transformation.name,
        nodeId: targetNodeId,
        description: transformation.description,
        // Include the actual schema for form generation
        properties: transformation.schema.properties,
        required: transformation.schema.required,
        // Add the full transformation schema
        transformationSchema: transformation.schema
      };
      
      console.log('🔧 Created schema from pipeline schema:', schemaWithNodeId);
      return schemaWithNodeId;
    } else {
      console.error('🔧 Transformation not found in pipeline schema:', transformationType);
      console.log('🔧 Available transformation names:', availableTransformations.map(t => t.name));
      return null;
    }
  } catch (error) {
    console.error('🔧 Error getting schema from pipeline schema:', error);
    return null;
  }
};

const PipeLineChatPanel = () => {
  const dispatch = useAppDispatch();
  const { id } = useParams<{ id: string }>();
  
  // Get pipeline modules from the hook
  const pipelineModules = usePipelineModules('pyspark');
  
  // Convert pipeline modules to the format expected by existing code
  const nodeDisplayData = React.useMemo(() => {
    const nodes = [];
    
    // Add Reader node (hardcoded as it's not in the schema)
    nodes.push({
      ui_properties: {
        module_name: "Reader",
        color: "#f7a01f",
        icon: "/assets/buildPipeline/6.svg",
        ports: {
          inputs: 0,
          outputs: 1,
          maxInputs: 0
        }
      }
    });
    
    // Add Target node (hardcoded as it's not in the schema)
    nodes.push({
      ui_properties: {
        module_name: "Target",
        color: "#07a260",
        icon: "/assets/buildPipeline/7.svg",
        ports: {
          inputs: 1,
          outputs: 0,
          maxInputs: 1
        }
      }
    });
    
    // Add transformation nodes from pipeline modules
    pipelineModules.forEach(module => {
      module.operators.forEach(operator => {
        nodes.push({
          ui_properties: {
            module_name: operator.type, // Use operator.type instead of module.label to avoid duplicates
            color: module.color,
            icon: module.icon,
            ports: module.ports
          }
        });
      });
    });
    
    return { nodes };
  }, [pipelineModules]);


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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [showReaderForm, setShowReaderForm] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<number | null>(null);

  // Function to handle message deletion
  const handleDeleteMessage = (messageIndex: number) => {
    setMessageToDelete(messageIndex);
    setDeleteDialogOpen(true);
  };

  // Function to confirm message deletion
  const confirmDeleteMessage = () => {
    if (messageToDelete !== null) {
      setMessages(prevMessages => prevMessages.filter((_, index) => index !== messageToDelete));
      setDeleteDialogOpen(false);
      setMessageToDelete(null);
      toast.success("Message deleted successfully");
    }
  };

  // Function to cancel message deletion
  const cancelDeleteMessage = () => {
    setDeleteDialogOpen(false);
    setMessageToDelete(null);
  };
  const [showReaderOptionsForm, setShowReaderOptionsForm] = useState(false);
  const [selectedSourceType, setSelectedSourceType] = useState<"File" | "Relational" | null>(null);
  const [showTransformationDropdown, setShowTransformationDropdown] = useState(false);
  const [transformationSearchTerm, setTransformationSearchTerm] = useState('');
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
  const saveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null); // Prevent rapid saves
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isApiLoading, setIsApiLoading] = useState(false);
  const pipelineContext = usePipelineContext();
  const token: any = sessionStorage?.getItem("token");
  const decoded: any = token ? jwtDecode(token) : null;
  
  // Debug log to check JWT token
  console.log('JWT token:', token ? 'exists' : 'not found');
  console.log('JWT decoded:', decoded);
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
    handleSourceUpdate,
    makePipeline
  } = pipelineContext;

  // Keep local form states in sync with context form states
  useEffect(() => {
    setformsHanStates(formStates);
  }, [formStates]);

  // Function to save individual AI agent chat messages (user requests and AI responses)
  const saveAIAgentChatMessage = useCallback(async (message: ChatMessage) => {
    if (!id) {
      console.warn('No pipeline id available, skipping chat message save');
      return;
    }

    if (isSavingChatHistory) {
      console.warn('Already saving chat history, skipping individual message save');
      return;
    }

    // Check if message is already saved
    if (message.id && savedMessageIds.has(message.id)) {
      console.log('Message already saved, skipping:', message.id);
      return;
    }

    // Additional validation to prevent saving non-AI agent messages
    if (!message.role || (message.role !== 'user' && message.role !== 'assistant')) {
      console.warn('Invalid message role for AI agent save:', message.role);
      return;
    }

    setIsSavingChatHistory(true);
    try {
      // Format message for API
      const formattedMessage = {
        role: message.role,
        content: message.content,
        timestamp: new Date().toISOString(),
        suggestions: [], // Don't save suggestions as they contain functions
        formData: message.formData ? {
          schema: message.formData.schema,
          sourceColumns: message.formData.sourceColumns || [],
          currentNodeId: message.formData.currentNodeId,
          isTarget: message.formData.isTarget,
          initialValues: message.formData.initialValues ? JSON.parse(JSON.stringify(message.formData.initialValues)) : {}
        } : undefined
      };

      const chatHistoryData = {
        pipeline_id: id,
        messages: [formattedMessage],
        append: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Saving AI agent chat message:', { 
        messageId: message.id, 
        role: message.role, 
        content: message.content,
        pipelineId: id,
        apiUrl: `${CATALOG_REMOTE_API_URL}/api/v1/pipeline/${id}/chat-history`
      });
      const result = await savePipelineChatHistory(id, chatHistoryData);
      
      // Update saved message tracking
      if (message.id) {
        setSavedMessageIds(prev => new Set([...prev, message.id!]));
      }
      
      console.log('AI agent chat message saved successfully:', result);
    } catch (error) {
      console.error('Failed to save AI agent chat message:', error);
      console.error('Error details:', {
        id,
        messageId: message.id,
        messageRole: message.role,
        error: error instanceof Error ? error.message : error
      });
    } finally {
      setIsSavingChatHistory(false);
    }
  }, [id, isSavingChatHistory, savedMessageIds]);
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
      form.reset({ reader_name: "", source_type: "File" });
      setShowReaderForm(true);
    }, 300);
  };
  // Initialize the Reader node from node_display.json and load connection configs
  useEffect(() => {
    // Find the Reader node from the isplay.json file
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
    // Reset search term when showing dropdown
    setTransformationSearchTerm('');

    // Show transformation dropdown
    setTimeout(() => {
      setShowTransformationDropdown(true);
    }, 300);
  };

  // Handle transformation selection from dropdown
  const handleTransformationSelection = (transformationName: string) => {
    // Hide the dropdown first
    setShowTransformationDropdown(false);

    // Check if Reader is selected - handle it like "Create Pipeline"
    if (transformationName === "Reader") {
      // Add user message showing the Reader selection
      setMessages(prevMessages => [
        ...prevMessages,
        {
          role: 'user',
          content: `Add Reader (Data Source)`
        },
      ]);

      // Show the reader form like in Create Pipeline flow
      setTimeout(() => {
        setMessages(prevMessages => [
          ...prevMessages,
          {
            role: 'assistant',
            content: "Let's add a data source to your pipeline. Please enter a reader name to search:"
          },
        ]);
        form.reset({ reader_name: "", source_type: "File" });
        setShowReaderForm(true);
      }, 300);
      return;
    }

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

    // Add user message showing the selected transformation
    setMessages(prevMessages => [
      ...prevMessages,
      {
        role: 'user',
        content: `Add ${transformationName} transformation`
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
    handleNodeClick(selectedNode, null);

    // Explicitly call handleAlignHorizontal to ensure proper node positioning
    setTimeout(() => {
      if (pipelineContext.handleAlignHorizontal) {
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

        // Check if the transformation needs dependencies
        const maxInputs = lastAddedTransformation.maxInputs;
        if (maxInputs > 0 || maxInputs === "unlimited") {
          // Check if this node already has connections (meaning we're in a manual connection flow)
          const existingConnections = edges.filter(edge => edge.target === lastNode.id);
          
          if (existingConnections.length > 0) {
            // Node already has connections, don't ask for more dependencies
            // This prevents duplicate forms when connections are made manually
            console.log('🔧 Node already has connections, skipping automatic dependency asking');
            setLastAddedTransformation(null);
            setTimeout(() => {
              handleShowTransformations();
            }, 300);
            return;
          }

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
            handleShowTransformations();
          }, 300);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, lastAddedTransformation]);


  // Auto-save AI agent chat messages when messages change
  useEffect(() => {
    if (messages.length === 0 || !id) return;
    
    // Get the last message that was added
    const lastMessage = messages[messages.length - 1];
    
    // Only save if it's a new message (not already saved) and is a user or assistant message
    if (lastMessage && lastMessage.id && !savedMessageIds.has(lastMessage.id)) {
      // Only save user and assistant messages from AI agent interactions
      if (lastMessage.role === 'user' || lastMessage.role === 'assistant') {
        // Check if this is an AI agent conversation message (not a form interaction)
        // We can differentiate by checking if the message has complex formData with forms
        const isAIAgentMessage = !lastMessage.formData || 
          (!lastMessage.formData.isTarget && 
           !lastMessage.formData.isConfirmation && 
           !lastMessage.formData.isMultiSourceSelect && 
           !lastMessage.formData.isSingleDependencySelect && 
           !lastMessage.formData.isMultiDependencySelect);
        
        if (isAIAgentMessage) {
          console.log('Auto-saving AI agent message:', { 
            messageId: lastMessage.id, 
            role: lastMessage.role, 
            content: lastMessage.content?.substring(0, 100) + '...' 
          });
          
          // Clear any existing timeout to prevent multiple saves
          if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
          }
          
          // Use a slight delay to allow for immediate consecutive messages and prevent race conditions
          saveTimeoutRef.current = setTimeout(() => {
            // Double-check conditions before saving to prevent unnecessary calls
            if (!savedMessageIds.has(lastMessage.id!) && !isSavingChatHistory) {
              saveAIAgentChatMessage(lastMessage);
            }
            saveTimeoutRef.current = null;
          }, 800); // Increased timeout to 800ms for better debouncing
          
          return () => {
            if (saveTimeoutRef.current) {
              clearTimeout(saveTimeoutRef.current);
              saveTimeoutRef.current = null;
            }
          };
        }
      }
    }
  }, [messages.length, id, savedMessageIds.size, saveAIAgentChatMessage, isSavingChatHistory]);

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
        
        // Additional fallback to ensure scrolling works
        setTimeout(() => {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }, 300);
      }
    }
  }, [messages]);

  // Chat History Functions
  const generateMessageId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Save only messages with form data to database
  const saveChatHistoryBatchWithMessages = useCallback(async (messagesToSave: ChatMessage[]) => {

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
        return false;
      }

      // Check if already saved
      if (!msg.id) {
        return true; // If no ID, it's definitely new
      }
      const isAlreadySaved = savedMessageIds.has(msg.id);
      return !isAlreadySaved;
    });

    if (formDataMessages.length === 0) {
      return;
    }


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

      const result = await savePipelineChatHistory(id, chatHistoryData);

      // Update saved message tracking - keep messages in UI, just track what's been saved
      const newSavedIds = new Set([...savedMessageIds, ...formDataMessages.map(m => m.id)]);
      setSavedMessageIds(newSavedIds);
      setLastSavedMessageCount(messagesToSave.length);


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
        return true; // If no ID, it's definitely new
      }
      const isAlreadySaved = savedMessageIds.has(msg.id);
      return !isAlreadySaved;
    });

    if (formDataMessages.length === 0) {
      return;
    }


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

      const result = await savePipelineChatHistory(id, chatHistoryData);
      // Update saved message tracking - keep messages in UI, just track what's been saved
      const newSavedIds = new Set([...savedMessageIds, ...formDataMessages.map(m => m.id)]);
      setSavedMessageIds(newSavedIds);
      setLastSavedMessageCount(messages.length);


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
      form.reset({ reader_name: "", source_type: "File" });
      setShowReaderForm(true);
    }, 500);
  };

  // Helper function to generate contextual messages based on form data
  const generateContextualMessages = useCallback((formDataMessage: any, index: number, allFormDataMessages: any[]) => {
    const messages: ChatMessage[] = [];
    const messageId = formDataMessage.id;
    const originalMsgOwner = formDataMessage.msg_owner;

    // Generate messages based on form data type
    if (formDataMessage.formData) {
      const formData = formDataMessage.formData;
      
      // Show dependency information for transformations (not for readers)
      if (formData.schema && formData.schema.title && formData.initialValues && formData.initialValues.dependent_on) {
        const transformationType = formData.schema.title;
        const dependencies = formData.initialValues.dependent_on;
        
        if (dependencies && dependencies.length > 0) {
          // Extract the source node name from dependencies
          const sourceNodeId = dependencies[0].source;
          
          // Try to find a readable name for the source
          let sourceName = sourceNodeId;
          if (sourceNodeId.includes('Reader')) {
            sourceName = 'data source';
          } else if (sourceNodeId.includes('Filter')) {
            sourceName = 'Filter transformation';
          } else if (sourceNodeId.includes('Mapper')) {
            sourceName = 'Schema transformation';
          } else if (sourceNodeId.includes('Aggregate')) {
            sourceName = 'Aggregate transformation';
          } else if (sourceNodeId.includes('Join')) {
            sourceName = 'Join transformation';
          } else if (sourceNodeId.includes('Sort')) {
            sourceName = 'Sort transformation';
          }
          
          // Add dependency information message with edit functionality
          messages.push({
            id: `dependency_${messageId}`,
            role: 'assistant',
            content: `This ${transformationType}  depends on: ${sourceName}`,
            msg_owner: originalMsgOwner,
            showDependencyEdit: true, // Flag to show edit icon
            dependencyEditData: {
              targetNodeId: formData.currentNodeId,
              targetNodeType: formData.schema,
              dependencies: dependencies,
              transformationType: transformationType
            }
          });
        }
      }

      // Add the original form data message
      messages.push({
        ...formDataMessage,
        suggestions: [] // Will be regenerated
      });

    } else {
      // Fallback for messages without form data
      messages.push({
        ...formDataMessage,
        suggestions: []
      });
    }

    return messages;
  }, []);



  // Helper function to generate connection messages
  const generateConnectionMessages = (transformationType: string, sourceColumns: any[], nodeId: string, msgOwner: string) => {
    const messages: ChatMessage[] = [];
    
    // Find connected nodes from the pipeline context
    const connectedNodes = edges.filter(edge => edge.target === nodeId);
    
    connectedNodes.forEach((edge, index) => {
      const sourceNode = nodes.find(node => node.id === edge.source);
      if (sourceNode) {
        const sourceName = sourceNode.data.title || sourceNode.data.label || sourceNode.id;
        messages.push({
          id: `connection_${nodeId}_${edge.source}_${index}`,
          role: 'user',
          content: `Connect "${sourceName}" to ${transformationType}`,
          msg_owner: msgOwner
        });
      }
    });

    return messages;
  };

  // Helper function to generate summary messages for chat history
  const generateSummaryMessages = useCallback((formDataMessages: any[]) => {
    const summaryMessages: ChatMessage[] = [];
    
    // Create a summary of all configurations
    const summaryContent = formDataMessages.map((msg, index) => {
      const formData = msg.formData;
      if (!formData) return '';
      
      if (formData.schema && formData.schema.module_name === 'Reader') {
        const initialValues = formData.initialValues || {};
        const dataSourceName = initialValues.reader_name || initialValues.name || 'data source';
        return `• Added data source "${dataSourceName}"`;
      } else if (formData.schema && (formData.schema.module_name || formData.schema.title)) {
        const transformationType = formData.schema.module_name || formData.schema.title;
        return `• Configured ${transformationType} transformation`;
      }
      return '';
    }).filter(Boolean);

    

    return summaryMessages;
  }, [handleShowTransformations, handleAddAnotherSource]);

  // Helper function to generate individual configuration messages
  const generateConfigurationMessage = useCallback((formData: any, actionType: 'configured' | 'added' | 'connected' = 'configured') => {
    if (!formData) return '';
    
    if (formData.schema && formData.schema.module_name === 'Reader') {
      const initialValues = formData.initialValues || {};
      const dataSourceName = initialValues.reader_name || initialValues.name || 'data source';
      return `${actionType === 'configured' ? 'Configured' : 'Added'} data source "${dataSourceName}"`;
    } else if (formData.schema && (formData.schema.module_name || formData.schema.title)) {
      const transformationType = formData.schema.module_name || formData.schema.title;
      
      if (actionType === 'connected') {
        // For connection messages, check if we have source information
        const sourceInfo = formData.sourceColumns && formData.sourceColumns.length > 0 
          ? ` from ${formData.sourceColumns.length} source(s)` 
          : '';
        return `Connected${sourceInfo} to ${transformationType}`;
      } else {
        return `${actionType === 'configured' ? 'Configured' : 'Added'} ${transformationType} transformation`;
      }
    }
    return '';
  }, []);

  // Function to add dynamic configuration messages to chat
  const addConfigurationMessage = useCallback((formData: any, actionType: 'configured' | 'added' | 'connected' = 'configured') => {
    const messageContent = generateConfigurationMessage(formData, actionType);
    if (messageContent) {
      const configMessage: ChatMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content: messageContent,
        msg_owner: decoded?.name || decoded?.username || 'system'
      };
      setMessages(prev => [...prev, configMessage]);
    }
  }, [generateConfigurationMessage, decoded]);

  // Function to generate chat messages from API form data
  const generateChatFromAPIData = useCallback((apiFormData: any[]) => {
    const generatedMessages: ChatMessage[] = [];
    
    apiFormData.forEach((formDataItem, index) => {
      const formData = formDataItem.formData;
      if (!formData) return;
      
      // Generate user request message
      let userContent = '';
      let assistantContent = '';
      
      if (formData.schema && formData.schema.module_name === 'Reader') {
        const initialValues = formData.initialValues || {};
        const dataSourceName = initialValues.reader_name || initialValues.name || 'data source';
        userContent = `Add data source "${dataSourceName}"`;
        assistantContent = `Configured data source "${dataSourceName}"`;
      } else if (formData.schema && formData.schema.module_name) {
        const transformationType = formData.schema.module_name;
        
        userContent = `Add ${transformationType} transformation`;
        assistantContent = `Configured ${transformationType} transformation`;
        
        // Check for connections
        if (formData.sourceColumns && formData.sourceColumns.length > 0) {
          const connectionMessages = generateConnectionMessages(transformationType, formData.sourceColumns, formData.currentNodeId, formDataItem.msg_owner);
          generatedMessages.push(...connectionMessages);
        }
      }
      
      if (userContent) {
        generatedMessages.push({
          id: `api_user_${index}_${Date.now()}`,
          role: 'user',
          content: userContent,
          msg_owner: formDataItem.msg_owner
        });
      }
      
      if (assistantContent) {
        generatedMessages.push({
          id: `api_assistant_${index}_${Date.now()}`,
          role: 'assistant',
          content: assistantContent,
          msg_owner: formDataItem.msg_owner
        });
      }
    });
    
    return generatedMessages;
  }, [generateConnectionMessages]);

  // Test function to demonstrate dynamic chat generation (you can call this from console)
  const testDynamicChatGeneration = useCallback(() => {
    const sampleAPIData = [
      {
        id: "msg1",
        formData: {
          schema: { module_name: "Reader" },
          initialValues: { reader_name: "input.csv", name: "input.csv" },
          currentNodeId: "reader1"
        },
        msg_owner: "user123"
      },
      {
        id: "msg2",
        formData: {
          schema: { module_name: "Mapper" },
          initialValues: { column_mappings: ["name", "age", "email"] },
          currentNodeId: "schema1"
        },
        msg_owner: "user123"
      },
      {
        id: "msg3",
        formData: {
          schema: { module_name: "Filter" },
          initialValues: { filter_conditions: ["age > 18", "status = 'active'"] },
          currentNodeId: "filter1"
        },
        msg_owner: "user123"
      }
    ];

    const generatedMessages = generateChatFromAPIData(sampleAPIData);
    setMessages(generatedMessages);
    
    console.log("🎉 Generated messages:", generatedMessages);
    console.log("Sample messages that would be shown:");
    generatedMessages.forEach((msg, index) => {
      console.log(`${index + 1}. ${msg.role}: ${msg.content}`);
    });
  }, [generateChatFromAPIData]);

  // Expose the test function to window for console access (development only)
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    (window as any).testDynamicChatGeneration = testDynamicChatGeneration;
  }

  // Function to update chat history when pipeline changes occur
  const updateChatFromPipelineChange = useCallback((changeType: 'node_added' | 'node_configured' | 'connection_made', data: any) => {
    const userMessage = {
      id: generateMessageId(),
      role: 'user' as const,
      content: '',
      msg_owner: decoded?.name || decoded?.username || 'user'
    };

    const assistantMessage = {
      id: generateMessageId(),
      role: 'assistant' as const,
      content: '',
      msg_owner: decoded?.name || decoded?.username || 'system'
    };

    switch (changeType) {
      case 'node_added':
        userMessage.content = `Add ${data.nodeType} transformation`;
        assistantMessage.content = `Added ${data.nodeType} transformation to your pipeline`;
        break;
      
      case 'node_configured':
        const configMessage = generateConfigurationMessage(data.formData, 'configured');
        userMessage.content = `Configure ${data.nodeType} transformation`;
        assistantMessage.content = configMessage || `Configured ${data.nodeType} transformation`;
        break;
      
      case 'connection_made':
        userMessage.content = `Connect "${data.sourceName}" to ${data.targetName}`;
        assistantMessage.content = `Connected "${data.sourceName}" to ${data.targetName}`;
        break;
    }

    setMessages(prev => [...prev, userMessage, assistantMessage]);
  }, [generateConfigurationMessage, decoded]);

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
        return;
      }

      // Prevent multiple simultaneous loads
      if (isLoadingChatHistory) {
        return;
      }

      setIsLoadingChatHistory(true);

      try {
        const response = await getPipelineChatHistory(id);

        // Check if component was unmounted or id changed during the async operation
        if (isCancelled) {
          return;
        }


        // Handle the new API response format: { success: true, data: { messages: [...] } }
        if (response && response.success && response.data && response.data.messages) {
          const history = response.data;
          setChatHistory(history);
          // Since we only saved form data messages, we need to recreate the full chat flow
          const formDataMessages = history.messages.filter((msg: any) => msg.formData);

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

          // Add final summary message if we have form data messages
          if (formDataMessages.length > 0) {
            const summaryMessages = generateSummaryMessages(formDataMessages);
            recreatedMessages.push(...summaryMessages);
          }

          setMessages(recreatedMessages);

          // Track only the original form data messages as saved
          const savedFormDataIds: any = new Set(formDataMessages.map((msg: any) => msg.id).filter(Boolean));
          setSavedMessageIds(savedFormDataIds);
          setLastSavedMessageCount(recreatedMessages.length);

          // Restore forms based on the last form data message
          const lastFormDataMessage = formDataMessages[formDataMessages.length - 1];
          if (lastFormDataMessage && lastFormDataMessage.formData) {
            const formData = lastFormDataMessage.formData;

            // Check if we need to restore reader form
            if (formData.schema && formData.schema.module_name === 'Reader') {

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

          // After restoring messages, offer next transformation selection
          setTimeout(() => {
            handleShowTransformations();
          }, 600);

        } else if (response && !response.success) {
          console.warn('API returned unsuccessful response:', response);
          setMessages([]);
        } else {
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
      hasLoadedChatHistoryRef.current = null; // Reset loaded state
      loadHistoryForCurrentId();
    }

    // Cleanup function to cancel ongoing operations
    return () => {
      isCancelled = true;
    };
  }, [id]); // Only depend on id

  // Helper function to add message with form data
  const addMessageWithFormData = useCallback((message: ChatMessage) => {
    const messageWithId = {
      ...message,
      id: message.id || generateMessageId()
    };
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

  const handleSend = async (availableColumns?: Record<string, any>) => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isApiLoading) return;
    
    // Add user message
    const userMessage = { 
      role: 'user' as const, 
      content: trimmedInput,
      id: generateMessageId()
    };
    addMessageWithFormData(userMessage);
    
    // Save user message to chat history
    try {
      await saveAIAgentChatMessage(userMessage);
    } catch (error) {
      console.error('Failed to save user message to chat history:', error);
    }
    
    setInput('');
    setIsApiLoading(true);

    try {
      // Use the availableColumns passed from AIChatInput
      // If not provided, default to empty columns
      const columnsToUse = availableColumns || { columns: [] };

      // Call the pipeline schema edit API
      const response: any = await apiService.post({
        url: 'pipeline_schema/pipeline',
        baseUrl: AGENT_REMOTE_URL,
        method: 'POST',
        usePrefix: true,
        data: {
          pipeline_id: id, // Use the ID from params
          user_request: trimmedInput,
          available_columns: columnsToUse
        },
        metadata: {
          errorMessage: 'Failed to process your request'
        }
      });

      // Process the pipeline_json if it exists in the response
      if (response?.pipeline_json) {
        try {
          await makePipeline({ pipeline_definition: response.pipeline_json });
          setUnsavedChanges();
          console.log('Pipeline updated successfully with new schema');

          // Add success response message
          const assistantMessage = { 
            role: 'assistant' as const, 
            content: 'Pipeline updated successfully! Your changes have been applied.',
            id: generateMessageId()
          };
          addMessageWithFormData(assistantMessage);
          
          // Save assistant message to chat history
          try {
            await saveAIAgentChatMessage(assistantMessage);
          } catch (error) {
            console.error('Failed to save assistant success message to chat history:', error);
          }

          // Show success toast
          toast.success('Pipeline updated successfully');

        } catch (pipelineError) {
          console.error('Error updating pipeline:', pipelineError);
          const errorMessage = { 
            role: 'assistant' as const, 
            content: 'Failed to update the pipeline. Please try again.',
            id: generateMessageId()
          };
          addMessageWithFormData(errorMessage);
          
          // Save error message to chat history
          try {
            await saveAIAgentChatMessage(errorMessage);
          } catch (error) {
            console.error('Failed to save assistant error message to chat history:', error);
          }
          
          toast.error('Failed to update pipeline');
        }
      } else {
        // Add a generic response if no pipeline_json is returned
        const assistantMessage = { 
          role: 'assistant' as const, 
          content: response?.message || 'Request processed successfully.',
          id: generateMessageId()
        };
        addMessageWithFormData(assistantMessage);
        
        // Save assistant message to chat history
        try {
          await saveAIAgentChatMessage(assistantMessage);
        } catch (error) {
          console.error('Failed to save assistant generic message to chat history:', error);
        }
      }

      console.log('Request processed successfully:', response?.messages);

    } catch (error: any) {
      console.error('API Error:', error);
      
      // Add error response message
      const errorMessage = { 
        role: 'assistant' as const, 
        content: `Error: ${error?.response?.data?.message || 'Failed to process your request. Please try again.'}`,
        id: generateMessageId()
      };
      addMessageWithFormData(errorMessage);
      
      // Save error message to chat history
      try {
        await saveAIAgentChatMessage(errorMessage);
      } catch (error) {
        console.error('Failed to save assistant API error message to chat history:', error);
      }

      // Show error toast
      toast.error(error?.response?.data?.message || 'Failed to process your request');

    } finally {
      setIsApiLoading(false);
    }
  };


  // Function to add a single data source directly
  const addSingleDataSource = (item: any, skipUserMessage = false) => {
    // Add user message showing which specific source is being added (only if not part of multi-selection)
    if (!skipUserMessage) {
      const sourceType = item.connection_config?.custom_metadata?.connection_type || 
                        (item.connection_config?.connection_name?.toLowerCase() === 's3' ? 'S3' : 'Local');
      const sourceDetails = item.data_src_desc ? `` : '';
      
      addMessageWithFormData({
        role: 'user',
        content: `Add "${item.data_src_name}" ${sourceType} data source${sourceDetails} to pipeline`
      });
    }

    if (readerNode) {
      setUnsavedChanges();
      addNodeToHistory();
      const newReaderNode = {
        ...readerNode,
        id: `reader-${Date.now()}`
      };

      // Build initial source payload for immediate node rendering
      const initialSourcePayload = {
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
        name: item.data_src_name
      };

      // Add a fresh Reader node with initial payload so it shows proper defaults
      handleNodeClick(newReaderNode, initialSourcePayload);

      // Configure the newly added node
      setTimeout(() => {
        // Structure the data in the format expected by handleReaderOptionsSubmit
        const formattedSourceData = {
          nodeId: newReaderNode.id,
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

        // Directly configure the source using the properly formatted API data
        handleReaderOptionsSubmit(formattedSourceData);
      }, 500);
    } else {
      toast.error("Reader node not found. Please try again.");
    }
  };

  // Function to handle editing dependencies
  const handleEditDependency = useCallback((targetNodeId: string, targetNodeType: any, maxInputs: number | string) => {
    console.log('handleEditDependency called for:', targetNodeId);
    
    // Get current connections for this node
    const currentConnections = edges.filter(edge => edge.target === targetNodeId);
    console.log('Current connections:', currentConnections);
    
    // Find available dependencies (excluding the current node itself)
    const availableDependencies = nodes.filter(node => 
      node.id !== targetNodeId && 
      !node.data.isTarget &&
      node.data.ports?.outputs > 0
    );
    
    if (availableDependencies.length === 0) {
      toast.error("No available nodes to connect to.");
      return;
    }
    
    // Show dependency selection form with current connections highlighted
    const dependencyMessage = `Edit connections for ${targetNodeType.ui_properties.module_name}:`;
    
    setTimeout(() => {
      addMessageWithFormData({
        role: 'assistant',
        content: dependencyMessage,
        formData: {
          schema: { type: 'dependency-edit' },
          sourceColumns: [],
          currentNodeId: `dependency-edit-${targetNodeId}`,
          initialValues: {
            currentConnections: currentConnections.map(conn => conn.source)
          },
          isTarget: false,
          isDependencyEdit: true,
          dependencyData: {
            dependencies: availableDependencies,
            targetNodeType: targetNodeType,
            targetNodeId: targetNodeId,
            maxInputs: maxInputs,
            currentConnections: currentConnections
          }
        }
      });
    }, 100);
  }, [nodes, edges, addMessageWithFormData, toast]);

  // Function to handle dependency edit submission
  const handleDependencyEditSubmit = (selectedDependencies: any[], targetNodeType: any, targetNodeId: string, maxInputs: number | string) => {
    console.log('handleDependencyEditSubmit called with:', {
      selectedDependencies,
      targetNodeType: targetNodeType.ui_properties.module_name,
      targetNodeId,
      maxInputs
    });

    // Remove the dependency edit form from messages
    setMessages(prevMessages => 
      prevMessages.filter(msg => 
        !(msg.formData?.isDependencyEdit && msg.formData?.currentNodeId === `dependency-edit-${targetNodeId}`)
      )
    );

    // Get current connections for this node
    const currentConnections = edges.filter(edge => edge.target === targetNodeId);
    
    // Remove all current connections for this node
    setEdges(prevEdges => prevEdges.filter(edge => edge.target !== targetNodeId));
    
    // Add user message showing the edit
    const dependencyNames = selectedDependencies.map(dep => dep.data.title || dep.data.label).join(', ');
    addMessageWithFormData({
      role: 'user',
      content: `Update connections to ${dependencyNames} for ${targetNodeType.ui_properties.module_name}`
    });

    // Create new connections
    selectedDependencies.forEach((dependency, index) => {
      setTimeout(() => {
        handleDependencySelection(dependency, targetNodeType, targetNodeId, maxInputs, 1, true);
      }, index * 100);
    });

    // Update existing dependency messages with new dependency information
    setTimeout(() => {
      updateDependencyMessages(targetNodeId, selectedDependencies, targetNodeType.ui_properties.module_name);
    }, selectedDependencies.length * 100 + 100);

    // Add success message
    setTimeout(() => {
      addMessageWithFormData({
        role: 'assistant',
        content: `Successfully updated connections! ${targetNodeType.ui_properties.module_name} is now connected to ${dependencyNames}.`,
        suggestions: [
          { 
            text: "Edit Again", 
            onClick: () => handleEditDependency(targetNodeId, targetNodeType, maxInputs)
          }
        ]
      });
    }, selectedDependencies.length * 100 + 200);
  };

  // Function to update existing dependency messages after edit
  const updateDependencyMessages = (targetNodeId: string, newDependencies: any[], transformationType: string) => {
    setMessages(prevMessages => {
      return prevMessages.map(msg => {
        // Find messages that show dependency information for this node
        if (msg.showDependencyEdit && msg.dependencyEditData?.targetNodeId === targetNodeId) {
          // Update the message content and dependency data
          const dependencyNames = newDependencies.map(dep => {
            const sourceNode = nodes.find(node => node.id === dep.id);
            return sourceNode?.data?.title || sourceNode?.data?.label || dep.id;
          }).join(', ');

          // Create new dependency data structure
          const updatedDependencies = newDependencies.map(dep => ({
            source: dep.id,
            targetHandle: `input-${dep.id}`
          }));

          return {
            ...msg,
            content: `This ${transformationType} depends on: ${dependencyNames}`,
            dependencyEditData: {
              ...msg.dependencyEditData,
              dependencies: updatedDependencies
            }
          };
        }
        return msg;
      });
    });
  };

  // Function to handle single dependency selection
  const handleSingleDependencySubmit = (selectedDependency: any, targetNodeType: any, targetNodeId: string, maxInputs: number | string) => {
  

    // Add user message showing the selection
    addMessageWithFormData({
      role: 'user',
      content: `Connect "${selectedDependency.data.title || selectedDependency.data.label}" to ${targetNodeType.ui_properties.module_name}`
    });

    // Clear lastAddedTransformation to prevent interference
    setLastAddedTransformation(null);

    // Remove the dependency selection form from messages
    setMessages(prevMessages => 
      prevMessages.filter(msg => 
        !(msg.formData?.isSingleDependencySelect && msg.formData?.currentNodeId === `dependency-select-${targetNodeId}`)
      )
    );

    // Add success message with Edit option
    setTimeout(() => {
      addMessageWithFormData({
        role: 'assistant',
        content: `Great! Connected "${selectedDependency.data.title || selectedDependency.data.label}" to ${targetNodeType.ui_properties.module_name}.`,
        suggestions: [
          { 
            text: "Edit Connection", 
            onClick: () => handleEditDependency(targetNodeId, targetNodeType, maxInputs)
          }
        ]
      });
    }, 200);

    handleDependencySelection(selectedDependency, targetNodeType, targetNodeId, maxInputs, 1);
  };

  // Function to handle multiple dependency selection
  const handleMultiDependencySubmit = (selectedDependencies: any[], targetNodeType: any, targetNodeId: string, maxInputs: number | string) => {
    console.log('handleMultiDependencySubmit called with:', {
      selectedDependencies,
      targetNodeType: targetNodeType.ui_properties.module_name,
      targetNodeId,
      maxInputs
    });

    // Add user message showing the selection
    const dependencyNames = selectedDependencies.map(dep => dep.data.title || dep.data.label).join(', ');
    addMessageWithFormData({
      role: 'user',
      content: `Connect ${selectedDependencies.length} nodes (${dependencyNames}) to ${targetNodeType.ui_properties.module_name}`
    });

    // Clear lastAddedTransformation to prevent useEffect interference
    setLastAddedTransformation(null);

    // Remove the dependency selection form from messages
    setMessages(prevMessages => 
      prevMessages.filter(msg => 
        !(msg.formData?.isMultiDependencySelect && msg.formData?.currentNodeId === `dependency-select-${targetNodeId}`)
      )
    );

    // Add success message with Edit option
    setTimeout(() => {
      addMessageWithFormData({
        role: 'assistant',
        content: `Perfect! Connected ${selectedDependencies.length} nodes (${dependencyNames}) to ${targetNodeType.ui_properties.module_name}.`,
        suggestions: [
          { 
            text: "Edit Connections", 
            onClick: () => handleEditDependency(targetNodeId, targetNodeType, maxInputs)
          }
        ]
      });
    }, 200);

    // Handle each connection without asking for more dependencies
    selectedDependencies.forEach((dependency, index) => {
      setTimeout(() => {
        // Create connections for all selected dependencies
        handleDependencySelection(dependency, targetNodeType, targetNodeId, maxInputs, 1, true); // Pass true to skip form opening
      }, index * 100);
    });

    // After all connections are made, directly open the form
    setTimeout(() => {
      const transformationType = targetNodeType.ui_properties.module_name;
      
      console.log('🔧 Creating form message for transformation:', {
        transformationType,
        targetNodeId,
        targetNodeType: targetNodeType.ui_properties
      });
      
      // Check if this is a Target transformation
      const isTarget = transformationType === 'Target';

      // Build the dependency data from selectedDependencies instead of relying on edges state
      const dependentOnData = selectedDependencies.map((dep, index) => ({
        source: dep.id,
        targetHandle: `input-${dep.id}` // Use consistent handle naming
      }));

      if (isTarget) {
        // Add a message to show that we're configuring the Target
        setTimeout(() => {
          setMessages(prevMessages => [
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
                  name: "output",
                  dependent_on: dependentOnData
                }
              }
            },
          ]);
        }, 300);
        return;
      }

      // Get schema with proper transformation name mapping
      const engineType = pipelineContext.pipelineDtl?.engine_type || 'pyspark';
      const schemaWithNodeId = getSchemaForTransformation(transformationType, targetNodeId, engineType);

      if (schemaWithNodeId) {
        // Set the selected schema
        setSelectedSchema(schemaWithNodeId);

        // Get column suggestions for the form
        import('@/lib/pipelineAutoSuggestion').then(module => {
          module.getColumnSuggestions(targetNodeId, nodes, edges, pipelineContext.pipelineDtl)
            .then(columns => {
              // Add the form directly to the chat
              setTimeout(() => {
                const newMessage = {
                  role: 'assistant',
                  content: "",
                  formData: {
                    schema: schemaWithNodeId,
                    sourceColumns: columns.map(col => ({ name: col, dataType: 'string' })),
                    currentNodeId: targetNodeId,
                    isTarget: isTarget,
                    initialValues: {
                      ...formStates[targetNodeId],
                      nodeId: targetNodeId,
                      dependent_on: dependentOnData
                    }
                  }
                };

                setMessages((prevMessages: any) => {
                  const newMessages = [...prevMessages, newMessage];
                  return newMessages;
                });
              }, 300);
            })
            .catch(err => {
              console.error('Error getting column suggestions:', err);
              
              // Fallback if we can't get column suggestions
              setTimeout(() => {
                const newMessage = {
                  role: 'assistant',
                  content: '',
                  formData: {
                    schema: schemaWithNodeId,
                    sourceColumns: [],
                    currentNodeId: targetNodeId,
                    isTarget: isTarget,
                    initialValues: {
                      ...formStates[targetNodeId],
                      nodeId: targetNodeId,
                      dependent_on: dependentOnData
                    }
                  }
                };

                setMessages((prevMessages: any) => {
                  const newMessages = [...prevMessages, newMessage];
                  return newMessages;
                });
              }, 300);
            });
        });
      } else {
        // Fallback if schema not found
        handleShowTransformations();
      }
    }, selectedDependencies.length * 100 + 500); // Wait for all connections to be made
  };

  // Function to handle multiple source selection
  const handleMultiSourceSubmit = (selectedSources: any[]) => {
    // Add user message showing the selection with details
    const sourceNames = selectedSources.map(s => {
      const sourceType = s.connection_config?.custom_metadata?.connection_type || 
                        (s.connection_config?.connection_name?.toLowerCase() === 's3' ? 'S3' : 'Local');
      return `"${s.data_src_name}" (${sourceType})`;
    }).join(', ');
    
    addMessageWithFormData({
      role: 'user',
      content: `Selected ${selectedSources.length} data sources: ${sourceNames}`
    });

    // Add each selected source (skip individual user messages since we already showed the selection)
    selectedSources.forEach((source, index) => {
      setTimeout(() => {
        addSingleDataSource(source, true);
      }, index * 200); // Stagger the additions slightly
    });

    // Directly show transformations dropdown
    setTimeout(() => {
      addMessageWithFormData({
        role: 'assistant',
        content: `Now let's add a next transformation.`
      });
      handleShowTransformations();
    }, selectedSources.length * 200 + 500);
  };

  const onSubmitReaderForm = async (data: ReaderFormValues) => {

    // Hide the form
    setShowReaderForm(false);

    try {
      // Call the API to get data sources
      const response: any = await apiService.get({
        baseUrl: CATALOG_REMOTE_API_URL,
        url: `/data_source/search?params=${data.reader_name}`,
        usePrefix: true,
        method: 'GET'
      });

      // Check if we got results
      if (response && response?.length > 0) {
        // If only one source found, directly add it
        if (response.length === 1) {
          const item = response[0];

          // Directly add the single source
          setTimeout(() => {
            addSingleDataSource(item);
          }, 300);
        } else {
          // Multiple sources found - show checkbox selection
          setTimeout(() => {
            addMessageWithFormData({
              role: 'assistant',
              content:"",
              formData: {
                schema: { type: 'multiselect', sources: response },
                sourceColumns: [],
                currentNodeId: 'multi-source-select',
                initialValues: { selectedSources: [] },
                isTarget: false,
                isMultiSourceSelect: true
              }
            });
          }, 300);
        }
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
                        content: `Perfect! I've successfully added a Reader node with the "${readerName}" data source to your pipeline. Now let's add a transformation.`
                      },
                    ]);
                    handleShowTransformations();
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
      form.reset({ reader_name: "", source_type: "File" });
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
    setSelectedDataSource(initialData);
    setShowReaderOptionsForm(true);


  };

  // Handle the submission of the ReaderOptionsForm
  const handleReaderOptionsSubmit = (sourceData: any) => {
    // Always add a new Reader node when adding via chat unless we're explicitly editing an existing one
    const providedNodeId = sourceData?.nodeId as string | undefined;
    const existingNode = providedNodeId ? nodes.find(n => n.id === providedNodeId) : null;
    const sourcePayload = sourceData?.sourceData?.data?.source || sourceData?.source || sourceData;

    // Hide the form
    setShowReaderOptionsForm(false);

    if (!readerNode) {
      toast.error("Reader node not found. Please try again.");
      return;
    }

    // Mark unsaved changes and add to history
    setUnsavedChanges();
    addNodeToHistory();

    // If caller provided a nodeId, use it; otherwise create a new node
    let targetNodeId: string;
    if (providedNodeId) {
      targetNodeId = providedNodeId;
      // Update the provided node with the new source data
      handleSourceUpdate({ nodeId: targetNodeId, sourceData });
    } else {
      const newReaderNode = { ...readerNode, id: `reader-${Date.now()}` };
      targetNodeId = newReaderNode.id;
      // Add the node to the canvas with the initial source payload
      handleNodeClick(newReaderNode, sourcePayload);
      // Ensure the node gets the full configuration structure as well
      setTimeout(() => {
        handleSourceUpdate({ nodeId: targetNodeId, sourceData });
      }, 0);
    }

    // Add assistant message to show the configuration was saved
    const sourceName = sourceData.sourceData?.data?.source?.source_name ||
                       sourceData.sourceData?.data?.label ||
                       sourcePayload?.source_name ||
                       sourcePayload?.name || 'data source';

    const readerMessages = [
      {
        role: 'assistant' as const,
        content: `Perfect! I've successfully configured and added the "${sourceName}" data source to your pipeline. Now let's add a transformation.`,
        id: generateMessageId(),
        // Include form data to save reader configuration in chat history
        formData: {
          schema: {
            module_name: 'Reader',
            title: 'Reader',
            type: 'reader_configuration'
          },
          sourceColumns: [],
          currentNodeId: targetNodeId,
          isTarget: false,
          isConfirmation: true, // Flag to indicate this is a confirmation message, not a form message
          initialValues: {
            nodeId: targetNodeId,
            reader_name: sourceName,
            name: sourceName,
            source_type: sourcePayload?.type || 'File',
            file_type: sourcePayload?.file_type || 'CSV',
            connection_config_id: sourcePayload?.connection_config_id || 0,
            data_src_id: sourcePayload?.data_src_id || '',
            // Store the complete source configuration for reference
            sourceConfiguration: sourcePayload || {}
          }
        }
      }
    ];

    // Persist chat history with the new confirmation message
    const updatedMessages = [...messages, ...readerMessages];
    setTimeout(() => {
      saveChatHistoryBatchWithMessages(updatedMessages);
    }, 1000);

    // Apply horizontal alignment after adding the node with improved timing
    setTimeout(() => {
      if (pipelineContext.handleAlignHorizontal) {
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

    // Show transformations dropdown after reader configuration
    setTimeout(() => {
      handleShowTransformations();
    }, 800);
  };

  // Function to handle adding another source


  // Function to handle showing transformation options


  // Function to ask for dependencies based on maxInputs
  const askForDependencies = (node, maxInputs, targetNodeId) => {
    console.log('askForDependencies called with:', {
      node: node.ui_properties.module_name,
      maxInputs,
      targetNodeId,
      totalNodes: nodes.length
    });

    // Filter out nodes that can be used as dependencies
    const availableDependencies = nodes.filter(existingNode =>
      // Exclude the target node itself
      existingNode.id !== targetNodeId
    );

    console.log('Available dependencies:', availableDependencies.map(dep => ({ id: dep.id, label: dep.data.label })));

    if (availableDependencies.length === 0) {
      // No available dependencies, show message and directly show transformations
      console.log('No available dependencies found, showing transformations');
      setTimeout(() => {
        handleShowTransformations();
      }, 300);
      return;
    }

    // Determine how many dependencies to ask for
    const numDependenciesToAsk = maxInputs === "unlimited" ?
      Math.min(availableDependencies.length, 5) : // Limit to 5 for unlimited
      Math.min(maxInputs, availableDependencies.length);

    // Create a message asking for dependencies
    const dependencyMessage = maxInputs === 1 ?
      `Select a node to connect to:` :
      `The ${node.ui_properties.module_name} transformation can have up to ${maxInputs === "unlimited" ? "multiple" : maxInputs} dependencies. Select nodes to connect to:`;

    // Show message asking for dependencies with dropdown form
    setTimeout(() => {
      const isSingleInput = maxInputs === 1;

      console.log('Adding dependency selection message:', {
        isSingleInput,
        dependencyMessage,
        targetNodeId,
        availableDependencies: availableDependencies.length
      });

      addMessageWithFormData({
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
      });
    }, 300);
  };

  // Function to handle dependency selection
  const { handleDependencySelection } = useHandleDependencySelection({
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
  });

  // Cleanup timeout on component unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
    };
  }, []);

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex items-center justify-end px-3 py-2 border-b bg-white">
        <Button
          variant="outline"
          size="sm"
          className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 transition-colors p-2"
          onClick={() => {
            if (!id) {
              toast.error('No pipeline id found');
              return;
            }
            setShowDeleteConfirm(true);
          }}
          title="Delete Chat History"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
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

                  
                  {/* Only render message bubble if there's content */}
                  {message.content && message.content.trim() !== '' && (
                    <div className="flex items-start gap-2 group">
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
                      {/* Delete button - only show on hover */}
                      <button
                        onClick={() => handleDeleteMessage(index)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-red-100 rounded-full mt-1"
                        title="Delete message"
                      >
                        <Trash2 className="w-4 h-4 text-red-500 hover:text-red-700" />
                      </button>
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

                  {/* Render dependency edit functionality */}
                  {message.role === 'assistant' && message.showDependencyEdit && message.dependencyEditData && (
                    <div className="pl-8 mt-2">
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border">
                        <span className="text-sm text-gray-600">Dependencies:</span>
                        <div className="flex flex-wrap gap-1">
                          {message.dependencyEditData.dependencies.map((dep, idx) => {
                            const sourceNode = nodes.find(node => node.id === dep.source);
                            const sourceName = sourceNode?.data?.title || sourceNode?.data?.label || dep.source;
                            return (
                              <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                {sourceName}
                              </span>
                            );
                          })}
                        </div>
                        <button
                          onClick={() => {
                            const targetNode = nodes.find(node => node.id === message.dependencyEditData.targetNodeId);
                            if (targetNode) {
                              const maxInputs = targetNode.data?.ui_properties?.max_inputs || 'unlimited';
                              handleEditDependency(message.dependencyEditData.targetNodeId, targetNode.data, maxInputs);
                            }
                          }}
                          className="ml-auto p-1 hover:bg-gray-200 rounded-full transition-colors"
                          title="Edit dependencies"
                        >
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}


                  {message.role === 'assistant' && message.formData && !message.formData.isConfirmation && !message.formData.isEmbeddedForm &&
                    (
                      message.formData.isTarget ||
                      message.formData.isMultiSourceSelect ||
                      message.formData.isSingleDependencySelect ||
                      message.formData.isMultiDependencySelect ||
                      message.formData.isDependencyEdit ||
                      (message.formData.schema && ((message.formData.schema as any).title || (message.formData.schema as any).module_name)) ||
                      message.formData.initialValues ||
                      message.formData.currentNodeId
                    ) && (
                    <div className="pl-8 mt-2 bg-white rounded-lg shadow-sm group relative">
                      <div className="space-y-3">

                        {(message.formData.schema?.module_name === 'Reader' || message.formData.initialValues?.reader_name || message.formData.initialValues?.sourceConfiguration || message.formData.initialValues?.source) ? (
                          <div className="form-wrapper">
                            <React.Suspense fallback={<div className="p-4 text-sm text-gray-600">Loading Reader form...</div>}>
                              <ReaderOptionsForm
                                initialData={(() => {
                                  const iv = message.formData.initialValues || {};
                                  const sc = iv.sourceConfiguration || {};
                                  return {
                                    reader_name: iv.reader_name || iv.name || sc.data_src_name || sc.source_name || '',
                                    name: iv.reader_name || iv.name || sc.data_src_name || sc.source_name || '',
                                    file_type: (iv.file_type || sc.file_type || 'CSV').toUpperCase(),
                                    source: {
                                      source_type: iv.source_type || sc.type || 'File',
                                      source_name: sc.source_name || sc.data_src_name || iv.reader_name || iv.name || '',
                                      name: sc.source_name || sc.data_src_name || iv.reader_name || iv.name || '',
                                      file_name: sc.file_name || iv.file_name || iv.name || '',
                                      table_name: sc.table_name || iv.table_name || iv.name || '',
                                      data_src_id: sc.data_src_id,
                                      data_src_name: sc.data_src_name || sc.source_name || iv.reader_name || iv.name || '',
                                      file_type: (sc.file_type || iv.file_type || 'CSV').toUpperCase(),
                                      connection: {
                                        connection_config_id: sc.connection_config_id || sc.connection_config?.custom_metadata?.connection_config_id,
                                        name: sc.connection_config?.connection_config_name || sc.connection_config?.connection_name,
                                        connection_type: sc.connection_config?.custom_metadata?.connection_type,
                                        database: sc.connection_config?.custom_metadata?.database,
                                        schema: sc.connection_config?.custom_metadata?.schema,
                                        secret_name: sc.connection_config?.custom_metadata?.secret_name,
                                        file_path_prefix: sc.connection_config?.custom_metadata?.file_path_prefix,
                                        bucket: sc.connection_config?.custom_metadata?.bucket,
                                      },
                                      connection_config_id: sc.connection_config_id || sc.connection_config?.custom_metadata?.connection_config_id,
                                    },
                                  };
                                })()}
                                onSourceUpdate={(sourceData: any) => {
                                  handleSourceUpdate({
                                    nodeId: message.formData.currentNodeId,
                                    sourceData,
                                  });
                                }}
                                nodeId={message.formData.currentNodeId}
                                onSubmit={() => {}}
                                onClose={() => {}}
                              />
                            </React.Suspense>
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

                                handleSourceUpdate({
                                  nodeId: message.formData.currentNodeId,
                                  sourceData
                                });

                                // Log the node after update (in next tick)
                                setTimeout(() => {
                                  const updatedNode = nodes.find(node => node.id === message.formData.currentNodeId);

                                  if (!updatedNode) {
                                    console.error('Could not find updated node with ID:', message.formData.currentNodeId);
                                    console.error('Available nodes:', nodes.map(n => ({ id: n.id, label: n.label })));
                                  }
                                }, 0);



                                let data;

                                if (sourceData.sourceData?.data) {
                                  data = sourceData.sourceData.data;
                                } else if (sourceData.data) {
                                  // Direct structure
                                  data = sourceData.data;
                                } else {
                                  // Try to use sourceData directly as a fallback
                                  data = sourceData;
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
                                        sep: ","
                                      }
                                    }
                                  };
                                }

                                // Create a safe form state object with fallbacks for missing properties
                                const updatedFormState = {
                                  ...(data.transformationData || {}),
                                  name: "output",
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
                                    sep: ","
                                  }
                                };


                                try {
                                  setFormStates(prevStates => {
                                    const newStates = {
                                      ...prevStates,
                                      [message.formData.currentNodeId]: updatedFormState
                                    };
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
                                      const updatedInitialValues = {
                                        ...msg.formData.initialValues,
                                        ...updatedFormState
                                      };
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
                                    content: "",
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
                                        ...updatedFormState,
                                        nodeId: message.formData.currentNodeId,
                                        name: updatedFormState.name || "output"
                                      }
                                    }
                                  }
                                ];

                                setMessages(prevMessages => {
                                  const updatedMessages = [...prevMessages, ...newTargetMessages];
                                  // Save chat history batch after target form submission with updated messages
                                  setTimeout(() => {
                                    saveChatHistoryBatchWithMessages(updatedMessages);
                                  }, 1000);
                                  // Show transformations dropdown after target configuration
                                  setTimeout(() => {
                                    handleShowTransformations();
                                  }, 500);
                                  return updatedMessages;
                                });
                              }}
                            />
                          </div>
                        ) : message.formData && message.formData.isMultiSourceSelect ? (
                          <div className="form-wrapper">
                            <MultiSourceSelectForm
                              sources={message.formData.schema.sources}
                              onSubmit={(selectedSources) => {
                                handleMultiSourceSubmit(selectedSources);
                              }}
                              onClose={() => {
                                // Handle form close
                              }}
                            />
                          </div>
                        ) : message.formData && message.formData.isSingleDependencySelect ? (
                          <div className="form-wrapper">
                            <SingleDependencySelectForm
                              dependencies={message.formData.dependencyData?.dependencies || []}
                              onSubmit={(selectedDependency) => {
                                handleSingleDependencySubmit(
                                  selectedDependency,
                                  message.formData.dependencyData?.targetNodeType,
                                  message.formData.dependencyData?.targetNodeId || '',
                                  message.formData.dependencyData?.maxInputs || 1
                                );
                              }}
                              onClose={() => {
                                // Handle form close
                              }}
                              targetNodeType={message.formData.dependencyData?.targetNodeType}
                              targetNodeId={message.formData.dependencyData?.targetNodeId || ''}
                              maxInputs={message.formData.dependencyData?.maxInputs || 1}
                            />
                          </div>
                        ) : message.formData && message.formData.isMultiDependencySelect ? (
                          <div className="form-wrapper">
                            <MultiDependencySelectForm
                              dependencies={message.formData.dependencyData?.dependencies || []}
                              onSubmit={(selectedDependencies) => {
                                handleMultiDependencySubmit(
                                  selectedDependencies,
                                  message.formData.dependencyData?.targetNodeType,
                                  message.formData.dependencyData?.targetNodeId || '',
                                  message.formData.dependencyData?.maxInputs || 'unlimited'
                                );
                              }}
                              onClose={() => {
                                // Handle form close
                              }}
                              targetNodeType={message.formData.dependencyData?.targetNodeType}
                              targetNodeId={message.formData.dependencyData?.targetNodeId || ''}
                              maxInputs={message.formData.dependencyData?.maxInputs || 'unlimited'}
                            />
                          </div>
                        ) : message.formData && message.formData.isDependencyEdit ? (
                          <div className="form-wrapper">
                            <DependencyEditForm
                              dependencies={message.formData.dependencyData?.dependencies || []}
                              currentConnections={message.formData.dependencyData?.currentConnections || []}
                              onSubmit={(selectedDependencies) => {
                                handleDependencyEditSubmit(
                                  selectedDependencies,
                                  message.formData.dependencyData?.targetNodeType,
                                  message.formData.dependencyData?.targetNodeId || '',
                                  message.formData.dependencyData?.maxInputs || 'unlimited'
                                );
                              }}
                              onClose={() => {
                                // Remove the dependency edit form from messages
                                setMessages(prevMessages => 
                                  prevMessages.filter(msg => 
                                    !(msg.formData?.isDependencyEdit && msg.formData?.currentNodeId === message.formData.currentNodeId)
                                  )
                                );
                              }}
                              targetNodeType={message.formData.dependencyData?.targetNodeType}
                              targetNodeId={message.formData.dependencyData?.targetNodeId || ''}
                              maxInputs={message.formData.dependencyData?.maxInputs || 'unlimited'}
                            />
                          </div>
                        ) : (
                          <div className="form-wrapper">
                            <PipelineForm
                              key={`pipeline-form-${message.formData.currentNodeId}-${message.formData.formId || 'rehydrated'}`}
                              isOpen={false}
                              onClose={() => {}}
                              selectedSchema={
                                (message.formData.schema && (message.formData.schema as any).title)
                                  ? message.formData.schema
                                  : getSchemaForTransformation(
                                      message.formData.initialValues?.type || message.formData.schema?.title || '',
                                      message.formData.currentNodeId,
                                      pipelineContext.pipelineDtl?.engine_type || 'pyspark'
                                    )
                              }
                              initialValues={message.formData.initialValues}
                              currentNodeId={message.formData.currentNodeId}
                              inline={true}
                              onSubmit={(formData: any) => {
                                console.log('🔧 PipelineForm onSubmit called with:', formData);
                                
                                // Handle form submission by updating the node data
                                handleSourceUpdate({
                                  nodeId: message.formData.currentNodeId,
                                  sourceData: formData
                                });

                                // Mark unsaved changes
                                setUnsavedChanges();

                                // Update form states
                                setFormStates(prevStates => ({
                                  ...prevStates,
                                  [message.formData.currentNodeId]: formData
                                }));

                                // Update local form states
                                setformsHanStates(prevStates => ({
                                  ...prevStates,
                                  [message.formData.currentNodeId]: formData
                                }));

                                // Update the chat message's formData.initialValues with the submitted data
                                setMessages(prevMessages => {
                                  return prevMessages.map(msg => {
                                    if (msg.formData && msg.formData.currentNodeId === message.formData.currentNodeId) {
                                      const updatedInitialValues = {
                                        ...msg.formData.initialValues,
                                        ...formData
                                      };
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

                                // Add confirmation messages
                                const transformationType = message.formData.schema?.title || message.formData.initialValues?.type || 'transformation';
                                const newConfirmationMessages = [
                                  {
                                    role: 'user' as const,
                                    content: `Configured ${transformationType}`,
                                    id: generateMessageId()
                                  },
                                  {
                                    role: 'assistant' as const,
                                    content: `Great! Your ${transformationType} has been configured successfully.`,
                                    id: generateMessageId(),
                                    formData: {
                                      schema: message.formData.schema,
                                      sourceColumns: message.formData.sourceColumns || [],
                                      currentNodeId: message.formData.currentNodeId,
                                      isTarget: message.formData.isTarget || false,
                                      isConfirmation: true,
                                      initialValues: {
                                        ...message.formData.initialValues,
                                        ...formData,
                                        nodeId: message.formData.currentNodeId
                                      }
                                    }
                                  }
                                ];

                                setMessages(prevMessages => [
                                  ...prevMessages,
                                  ...newConfirmationMessages
                                ]);

                                // Save chat history after form submission
                                setTimeout(() => {
                                  saveChatHistoryBatchWithMessages(newConfirmationMessages);
                                }, 500);
                              }}
                            />
                          </div>
                        )}
                      </div>
                      {/* Delete button for form messages */}
                      <button
                        onClick={() => handleDeleteMessage(index)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-red-100 rounded-full"
                        title="Delete message"
                      >
                        <Trash2 className="w-4 h-4 text-red-500 hover:text-red-700" />
                      </button>
                    </div>
                  )}

                  {/* Embedded Pipeline Form */}
                  {message.formData && message.formData.isEmbeddedForm && (
                    <div className="mt-4">
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 mt-1 rounded-full bg-blue-500 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">
                          AI
                        </div>
                        <div className="flex-1 rounded-lg px-3 py-2 shadow-sm bg-gray-50 border">
                         
                          <PipelineForm
                            key={`pipeline-form-${message.formData.currentNodeId}-${message.formData.formId}`}
                            isOpen={false}
                            onClose={message.formData.onClose}
                            selectedSchema={message.formData.schema}
                            initialValues={message.formData.initialValues}
                            currentNodeId={message.formData.currentNodeId}
                            onSubmit={message.formData.onSubmit}
                            inline={true}
                          />
                        </div>
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


              {/* Transformation Selection Dropdown */}
              {showTransformationDropdown && (
                <div className="mt-2 mb-3">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 mt-1 rounded-full bg-blue-500 flex-shrink-0" />
                    <div className="flex-1">
                      <Select onValueChange={(value) => handleTransformationSelection(value)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a transformation" />
                        </SelectTrigger>
                        <SelectContent style={{zIndex:9999}}>
                          {nodeDisplayData.nodes
                            .filter((node, index, self) => 
                              // Remove duplicates by keeping only the first occurrence of each module_name
                              index === self.findIndex(n => n.ui_properties.module_name === node.ui_properties.module_name)
                            )
                            .map((node) => (
                            <SelectItem 
                              key={node.ui_properties.module_name} 
                              value={node.ui_properties.module_name}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span>{node.ui_properties.module_name}</span>
                                <span className="text-xs text-gray-500 ml-2">
                                  {node.ui_properties.module_name === "Reader" ? "Source" : "Transform"}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>
      <div className="p-2 border-t border-slate-200 bg-white">

        <AIChatInput 
          variant='designer' 
          input={input} 
          onChange={setInput} 
          onSend={handleSend} 
          placeholder="Type a message..." 
          enableVoiceInput={true}
          disabled={isApiLoading}
          isLoading={isApiLoading}
          nodes={nodes}
          edges={edges}
          pipelineDtl={pipelineDtl}
        />
      </div>
      
      {/* Delete Message Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Message"
        description="Are you sure you want to delete this message? This action cannot be undone."
        confirmText="DELETE"
        isLoading={false}
        onConfirm={confirmDeleteMessage}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Chat History"
        description="This will permanently delete all chat history for this pipeline. This action cannot be undone."
        confirmText="DELETE"
        isLoading={isDeleting}
        onConfirm={async () => {
          if (!id) {
            toast.error('No pipeline id found');
            return;
          }
          
          setIsDeleting(true);
          try {
            await deletePipelineChatHistory(id);
            setMessages([]);
            setSavedMessageIds(new Set());
            if (saveTimeoutRef.current) {
              clearTimeout(saveTimeoutRef.current);
              saveTimeoutRef.current = null;
            }
            toast.success('Chat history deleted successfully');
            setShowDeleteConfirm(false);
          } catch (err) {
            console.error('Failed to delete chat history', err);
            toast.error('Failed to delete chat history');
          } finally {
            setIsDeleting(false);
          }
        }}
      />

    </div>
  );
};

export default PipeLineChatPanel;
