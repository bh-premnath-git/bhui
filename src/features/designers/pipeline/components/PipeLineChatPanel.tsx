import { useState, useEffect, useRef, ReactNode, useMemo, useCallback, useTransition } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useChatMessages } from "@/hooks/useChatMessages";
import { AIChatInput } from "@/components/shared/AIChatInput";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { useFlow } from "@/context/designers/FlowContext";
import {
  clearFlowAgentConversation,
  clearFormStates
} from "@/store/slices/designer/flowSlice";
import { useLocation, useNavigate } from "react-router-dom";
import { usePipelineContext } from "@/context/designers/DataPipelineContext";
import { useReactFlow } from "reactflow";
import { apiService } from '@/lib/api/api-service';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Plus, MessageSquare, ChevronDown, Check, X, Filter, Database, FileText, Layers } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { CATALOG_API_PORT } from "@/config/platformenv";
import SchemaFormLoader from "./SchemaFormLoader";
import { DataSource } from "@/types/data-catalog/dataCatalog";
import CreateFormFormik from "./form-sections/CreateForm";
import { buildPipelineTemplate } from "@/utils/pipelineTemplateUtils";
import { getConnectionConfigList } from "@/store/slices/dataCatalog/datasourceSlice";
import mdataJson from "@/pages/designers/data-pipeline/data/mdata.json";
import TargetPopUp from "@/components/bh-reactflow-comps/TargetPopUp";


interface SuggestionButtonProps {
  text: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  className?: string;
}

const SuggestionButton = ({
  text,
  icon,
  onClick,
  variant = 'outline',
  className = ''
}: SuggestionButtonProps) => {
  // Create a handler that directly executes the action without setting input
  const handleClick = () => {
    // Call the onClick handler directly
    onClick();
  };

  return (
    <Button
      variant={variant}
      size="sm"
      onClick={handleClick}
      className={`mr-2 mb-2 flex items-center gap-2 transition-all duration-200 ${className}`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="truncate">{text}</span>
    </Button>
  );
};


export const PipeLineChatPanel = ({
  onClose,
  imageSrc = "/assets/ai/ai.svg",
  onPipelineCreated,
  className = ""
}: any) => {
  const { messages, addUserMessage, addAssistantMessage, clearMessages, updateLastAssistantMessage } = useChatMessages();
  const [input, setInput] = useState("");
  const { selectedPipeline } = useAppSelector((state) => state.pipeline);
  const reactFlowInstance = useReactFlow();
  const nodes = reactFlowInstance.getNodes();
  const edges = reactFlowInstance.getEdges();
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const { setPipelineJson, pipelineJson, setNodes, setEdges, setFormStates } = usePipelineContext();
  const [isNewChat, setIsNewChat] = useState(false);
  const [currentSourceData, setCurrentSourceData] = useState<any>(null);
  
  // Define sourceColumns based on currentSourceData
  const sourceColumns = useMemo(() => {
    // Extract columns from the current source data or return empty array
    if (currentSourceData && currentSourceData.columns) {
      return currentSourceData.columns.map((col: any) => ({
        name: col.name,
        dataType: col.dataType || 'string'
      }));
    }
    return [];
  }, [currentSourceData]);
  const [foundSources, setFoundSources] = useState<DataSource[]>([]);
  const [awaitingSourceSelection, setAwaitingSourceSelection] = useState(false);
  const [sourceSuggestions, setSourceSuggestions] = useState<React.ReactNode[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Pipeline creation state
  const [mode, setMode] = useState<'chat' | 'create'>('chat');
  const [step, setStep] = useState<'name' | 'source' | 'transformations' | 'confirm'>('name');
  const [pipelineName, setPipelineName] = useState('');
  const [pipelineDescription, setPipelineDescription] = useState('');
  const [selectedSources, setSelectedSources] = useState<any[]>([]);
  const [transformations, setTransformations] = useState<string[]>([]);

  // Target configuration state
  const [targetConfig, setTargetConfig]:any = useState<{
    type: 'Database' | 'File' | 'Custom';
    connectionType: string;
    schema?: string;
    database?: string;
    filePath?: string;
    fileFormat?: string;
    connection?: any;
  }>({
    type: 'File',
    connectionType: 'Local',
    filePath: 'examples/',
    fileFormat: 'CSV'
  });
  
  // Dependency selection state
  const [showDependencySelection, setShowDependencySelection] = useState<boolean>(false);
  const [dependencyOptions, setDependencyOptions] = useState<any[]>([]);
  const [selectedDependency, setSelectedDependency] = useState<string>('');
  const [useSourceConnection, setUseSourceConnection] = useState(true);
  const [filterCondition, setFilterCondition] = useState('');
  const [targetName, setTargetName] = useState('');
  const [transformationSubStep, setTransformationSubStep]:any = useState<
    'select' |
    'filter_condition' |
    'schema_form' |
    'target_name' |
    'target_type' |
    'file_format' |
    'file_path' |
    'db_type' |
    'db_schema' |
    'db_name' |
    'connection_choice' |
    'summary' | 'target_form'
  >('select');

  // State for inline forms
  const [showFilterForm, setShowFilterForm] = useState(false);
  const [showSchemaForm, setShowSchemaForm] = useState(false);
  const [showReaderForm, setShowReaderForm] = useState(false);
  const [showWriterForm, setShowWriterForm] = useState(false);
  const [filterFormInitialValues, setFilterFormInitialValues] = useState<any>({});
  const [schemaFormInitialValues, setSchemaFormInitialValues] = useState<any>({});
  const [readerFormInitialValues, setReaderFormInitialValues] = useState<any>({});
  const [writerFormInitialValues, setWriterFormInitialValues] = useState<any>({});
  
  // Schema state for transformation forms
  const [filterSchema, setFilterSchema] = useState<any>(null);
  const [schemaTransformationSchema, setSchemaTransformationSchema] = useState<any>(null);
  const [filterName, setFilterName] = useState<string>('');
  const [schemaName, setSchemaName] = useState<string>('');
  
  // Add useTransition hook for smoother UI updates
  const [isPending, startTransition] = useTransition();
const dispatch = useAppDispatch();
  // Fetch connection config list only once when component mounts
  useEffect(() => {
    dispatch(getConnectionConfigList({}));
  }, [dispatch]);
  
  // Update pipeline template whenever selectedDependency changes
  useEffect(() => {
    if (selectedDependency) {
      console.log("selectedDependency changed, updating pipeline template");
      // Use a timeout to ensure all state updates have been processed
      setTimeout(() => {
        const updatedTemplate = generatePipelineTemplate();
        setPipelineJson(updatedTemplate);
        console.log("Pipeline template updated after dependency change:", updatedTemplate);
      }, 0);
    }
  }, [selectedDependency, selectedSources, transformations, pipelineName, pipelineDescription, targetConfig, useSourceConnection, filterCondition]);
  
  // Update pipeline template whenever transformationSubStep changes to a dependency selection step
  useEffect(() => {
    const isDependencyStep = transformationSubStep.includes('dependency');
    if (isDependencyStep) {
      console.log("Dependency selection step detected:", transformationSubStep);
      // Use a timeout to ensure all state updates have been processed
      setTimeout(() => {
        const updatedTemplate = generatePipelineTemplate();
        setPipelineJson(updatedTemplate);
        console.log("Pipeline template updated for dependency selection step:", updatedTemplate);
      }, 0);
    }
  }, [transformationSubStep, selectedSources, transformations, pipelineName, pipelineDescription, targetConfig, useSourceConnection, filterCondition]);
  
  // Update pipeline template whenever showDependencySelection changes to true
  useEffect(() => {
    if (showDependencySelection) {
      console.log("Dependency selection UI shown, preparing pipeline template");
      // Use a timeout to ensure all state updates have been processed
      setTimeout(() => {
        const updatedTemplate = generatePipelineTemplate();
        setPipelineJson(updatedTemplate);
        console.log("Pipeline template updated for dependency selection UI:", updatedTemplate);
      }, 0);
    }
  }, [showDependencySelection, selectedSources, transformations, pipelineName, pipelineDescription, targetConfig, useSourceConnection, filterCondition]);
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Escape key handler removed as chat panel is always visible
  // No need to close the panel with Escape key

  // Panel is always open, so we don't need to clear state when closed
  // This effect has been removed

  const resetPipelineCreationState = () => {
    setStep('name');
    setPipelineName('');
    setPipelineDescription('');
    setSelectedSources([]);
    setTransformations([]);

    // Reset target configuration
    setTargetConfig({
      type: 'File',
      connectionType: 'Local',
      filePath: 'examples/',
      fileFormat: 'CSV'
    });

    // Reset form states
    setShowFilterForm(false);
    setShowSchemaForm(false);
    setShowReaderForm(false);
    setShowWriterForm(false);
    setFilterFormInitialValues({});
    setSchemaFormInitialValues({});
    setReaderFormInitialValues({});
    setWriterFormInitialValues({});
    setCurrentSourceData(null);
    
    // Reset source selection state
    setFoundSources([]);
    setAwaitingSourceSelection(false);
    setSourceSuggestions([]);
    
    // Reset dependency selection state
    setShowDependencySelection(false);
    setDependencyOptions([]);
    setSelectedDependency('');
  };

  const startPipelineCreation = () => {
    setMode('create');
    clearMessages();

    // Set default values for pipeline name and description
    setPipelineName("New Pipeline");
    setPipelineDescription("Data pipeline created with AI assistant");

    // Skip asking for name and description, directly ask for data source
    addAssistantMessage("Hi! I'll help you create a new data pipeline. Let's add a data source to your pipeline. Please enter the name of a data source you'd like to search for (e.g., \"sales_data\").");

    // Set step directly to source
    setStep('source');

    // Build and update the pipeline template with the default values
    const pipelineTemplate = generatePipelineTemplate();
    setPipelineJson(pipelineTemplate);
  };

  // Helper function to call the utility function with the current state
  // Helper function to get existing nodes from the pipeline template
  const getExistingNodesFromTemplate = () => {
    // Generate the current pipeline template
    const template = buildPipelineTemplate(
      pipelineName,
      pipelineDescription,
      selectedSources,
      transformations.filter(t => t !== 'schema' && t !== 'filter' && t !== 'target'), // Exclude the transformation we're currently adding
      targetConfig,
      useSourceConnection,
      filterCondition
    );
    
    // Extract node names from transformations
    const existingNodes = template.transformations.map(t => t.name);
    
    console.log("Existing nodes from template:", existingNodes);
    return existingNodes;
  };

  const generatePipelineTemplate = () => {
    // Log the current state before generating the template
    console.log("Generating pipeline template with state:", {
      pipelineName,
      pipelineDescription,
      selectedSources,
      transformations,
      targetConfig,
      useSourceConnection,
      filterCondition
    });
    
    // Generate the template
    const template = buildPipelineTemplate(
      pipelineName,
      pipelineDescription,
      selectedSources,
      transformations,
      targetConfig,
      useSourceConnection,
      filterCondition
    );
    
    return template;
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    setIsProcessing(true);
    try {
      // Add user message to chat
      addUserMessage(input);

      if (mode === 'create') {
        // Handle pipeline creation flow
        switch (step) {
          // Name step is skipped as we set a default name
          case 'source':
            await handleSourceStep(input);
            break;
          case 'transformations':
            await handleTransformationsStep(input);
            break;
          case 'confirm':
            await handleConfirmStep(input);
            break;
        }

        // Log the current pipeline template
        console.log("Current pipeline template:", generatePipelineTemplate());
      } else {
        // Regular chat mode
        addAssistantMessage("This is a placeholder response. The actual API functionality has been removed.");
      }

      // Clear the input field
      setInput("");
    } catch (error) {
      console.error("Error in chat:", error);
      updateLastAssistantMessage("An error occurred. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

 
  const handleSourceStep = async (input: string) => {
    const userInput = input.toLowerCase().trim();
    console.log(userInput);
    
    // If we're awaiting a source selection from multiple options
    if (awaitingSourceSelection && foundSources.length > 0) {
      // Check if the input is a number corresponding to a source index
      const sourceIndex = parseInt(userInput) - 1;
      if (!isNaN(sourceIndex) && sourceIndex >= 0 && sourceIndex < foundSources.length) {
        // User selected a valid source by number
        processSelectedSource(foundSources[sourceIndex]);
        setAwaitingSourceSelection(false);
        return;
      } 
      // Check if the input matches a source name
      const matchedSource = foundSources.find(source => 
        source.data_src_name.toLowerCase() === userInput.toLowerCase()
      );
      if (matchedSource) {
        // User selected a valid source by name
        processSelectedSource(matchedSource);
        setAwaitingSourceSelection(false);
        return;
      }
      
      // If input doesn't match any source, ask again
      addAssistantMessage(
        `I couldn't identify which source you want to use. Please enter the number or exact name of the source you want to select.`
      );
      return;
    }
    
    // Check if user wants to move to transformations
    if (userInput.includes('continue') || userInput.includes('next') || userInput.includes('transformation')) {
      setStep('transformations');
      
      // Update the pipeline template when moving to transformations step
      const transformationsStepTemplate = generatePipelineTemplate();
      setPipelineJson(transformationsStepTemplate);
      console.log("Pipeline template updated when moving to transformations step:", transformationsStepTemplate);
      
      addAssistantMessage(
        "Great! Now let's add some transformations to your pipeline. " +
        "I can add the following types of transformations:\n\n" +
        "1. Schema Transformation - Create new fields or modify existing ones\n" +
        "2. Filter Transformation - Filter data based on conditions\n\n" +
        "Which transformations would you like to add? You can say things like 'add schema transformation' or 'add both'."
      );
      return;
    }

    // Search for data sources
    try {
      setIsProcessing(true);
      const response: any = await apiService.get({
        portNumber: CATALOG_API_PORT,
        url: `/data_source/list/`,
        usePrefix: true,
        method: 'GET',
        params: {
          data_src_name: userInput,
          offset: 0,
          limit: 10,
          order_desc: false
        }
      });

      if (response && response.length > 0) {
        // Store the found sources
        const sources: DataSource[] = response;
        setFoundSources(sources);
        
        if (sources.length > 1) {
          // Multiple sources found, ask user to select one
          setAwaitingSourceSelection(true);
          
          // Create suggestion buttons for each source
          const suggestions = sources.map((source, index) => (
            <SuggestionButton
              key={source.data_src_id}
              text={source.data_src_name}
              icon={<Database size={16} />}
              onClick={() => {
                processSelectedSource(source);
                setAwaitingSourceSelection(false);
                setSourceSuggestions([]);
              }}
              variant="outline"
              className="bg-white/90 hover:bg-white"
            />
          ));
          
          // Set the suggestion buttons
          setSourceSuggestions(suggestions);
          
          // Create a message with the list of sources
          let sourcesMessage = `I found ${sources.length} data sources matching "${userInput}". Please select one:`;
          
          addAssistantMessage(sourcesMessage);
        } else {
          // Only one source found, use it directly
          processSelectedSource(sources[0]);
          setSourceSuggestions([]);
        }
      } else {
        addAssistantMessage(
          `I couldn't find any data sources matching "${userInput}". ` +
          `Please try a different search term, or say "continue" to proceed with your current selections.`
        );
      }
    } catch (error) {
      console.error("Error searching for data sources:", error);
      addAssistantMessage("I encountered an error while searching for data sources. Please try again with a different search term.");
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Helper function to process a selected source
  const processSelectedSource = (selectedSource: any) => {
    console.log(selectedSource);

    // Store the source data for the form
    setCurrentSourceData(selectedSource);

    // Log the source data for debugging
    console.log("Selected source data:", selectedSource);

    // Determine if it's a relational or file source
    const isRelational = selectedSource.connection_config.custom_metadata.connection_type == "S3" || selectedSource.connection_config.custom_metadata.connection_type == "Local" ? false : true;

    // Create initial values for the reader form - format for ReaderOptionsForm
    const readerInitialValues: any = {
      reader_name: selectedSource.data_src_name,
      name: `read_${selectedSource.data_src_name}`,
      source: {
        type: isRelational ? 'Relational' : 'File',
        name: selectedSource.data_src_name,
        table_name: selectedSource.data_src_name,
        data_src_id: selectedSource?.data_src_id,
        source_name: selectedSource.data_src_name,
        file_name: isRelational ? null : selectedSource.file_name || `${selectedSource.data_src_name}.csv`,
        connection: selectedSource.connection_config?.custom_metadata,
        connection_config_id: selectedSource.connection_config_id,
      },
      file_type: isRelational ? null : selectedSource.file_type || 'CSV',
      read_options: {
        header: selectedSource.read_options?.header !== undefined ? selectedSource.read_options.header : true,
        delimiter: selectedSource.read_options?.delimiter || ',',
        quote: selectedSource.read_options?.quote || '"'
      }
    };

    // If there's a query, add it
    if (selectedSource.query) {
      readerInitialValues.query = selectedSource.query;
    }

    // Add the selected source to the pipeline
    setSelectedSources([...selectedSources, selectedSource]);

    // Log the form values for debugging
    console.log("Reader form initial values:", readerInitialValues);

    setReaderFormInitialValues(readerInitialValues);
    setShowReaderForm(true);

    addAssistantMessage(
      `I'll use the data source "${selectedSource.data_src_name}". Please review and customize the reader configuration below:`
    );
  };

  // State for additional pipeline configuration
  
  // Load schemas from mdata.json
  useEffect(() => {
    if (mdataJson && mdataJson.schema) {
      // Find the filter schema
      const filterSchemaFromMdata = mdataJson.schema.find((schema: any) => schema.title === "Filter");
      if (filterSchemaFromMdata) {
        // Add nodeId to the schema to match the format expected by CreateFormFormik
        setFilterSchema({
          ...filterSchemaFromMdata,
          nodeId: 'filter_transformation'
        });
      }
      
      // Find the schema transformation schema
      const schemaTransformationSchemaFromMdata = mdataJson.schema.find((schema: any) => schema.title === "SchemaTransformation");
      if (schemaTransformationSchemaFromMdata) {
        // Add nodeId to the schema to match the format expected by CreateFormFormik
        setSchemaTransformationSchema({
          ...schemaTransformationSchemaFromMdata,
          nodeId: 'schema_transformation'
        });
      }
      
      console.log("Loaded schemas from mdata.json:", { 
        filter: filterSchemaFromMdata, 
        schemaTransformation: schemaTransformationSchemaFromMdata 
      });
    }
  }, []);

  // Function to update the pipeline template with the selected dependency
  const updatePipelineWithDependency = (dependency: string, transformationType: string) => {
    console.log(`Updating pipeline with dependency: ${dependency} for transformation: ${transformationType}`);
    
    // Update the source objects with the dependency information
    // This ensures the generatePipelineTemplate function will use the correct dependencies
    if (transformationType === 'filter') {
      // Update the filter transformation in the selected sources
      setSelectedSources(prevSources => {
        return prevSources.map(source => {
          // Create or update the filter_transformation property
          return {
            ...source,
            filter_transformation: {
              ...(source.filter_transformation || {}),
              dependent_on: [dependency]
            }
          };
        });
      });
    } else if (transformationType === 'schema') {
      // Update the schema transformation in the selected sources
      setSelectedSources(prevSources => {
        return prevSources.map(source => {
          // Create or update the schema_transformation property
          return {
            ...source,
            schema_transformation: {
              ...(source.schema_transformation || {}),
              name: 'schema_transformation',
              transformation: 'SchemaTransformation',
              derived_fields: source.schema_transformation?.derived_fields || [{ name: '', expression: '' }],
              dependent_on: [dependency]
            }
          };
        });
      });
    } else if (transformationType === 'target') {
      // Update the target transformation in the selected sources
      setSelectedSources(prevSources => {
        return prevSources.map(source => {
          // Create or update the target_transformation property
          return {
            ...source,
            target_transformation: {
              ...(source.target_transformation || {}),
              dependent_on: [dependency]
            }
          };
        });
      });
    }
    
    // Also update the pipeline JSON directly for immediate effect
    const updatedPipelineJson = { ...pipelineJson };
    
    // Update the dependency in the pipeline template
    if (updatedPipelineJson && updatedPipelineJson.transformations) {
      // Update the dependency for the specific transformation
      if (transformationType === 'filter') {
        // Find the filter transformation
        const filterTransformation = updatedPipelineJson.transformations.find(
          (t: any) => t.name === 'filter_transformation'
        );
        
        if (filterTransformation) {
          filterTransformation.dependent_on = [dependency];
          console.log("Updated filter transformation dependency:", filterTransformation);
        }
      } else if (transformationType === 'schema') {
        // Find the schema transformation
        const schemaTransformation = updatedPipelineJson.transformations.find(
          (t: any) => t.name === 'schema_transformation'
        );
        
        if (schemaTransformation) {
          schemaTransformation.dependent_on = [dependency];
          console.log("Updated schema transformation dependency:", schemaTransformation);
        }
      } else if (transformationType === 'target') {
        // Find the target transformation - it might have a custom name
        const targetName = targetConfig.customConfig?.name || targetConfig.connection?.name || "Target";
        const targetTransformation = updatedPipelineJson.transformations.find(
          (t: any) => t.name === targetName || t.transformation === 'Target'
        );
        
        if (targetTransformation) {
          targetTransformation.dependent_on = [dependency];
          console.log("Updated target transformation dependency:", targetTransformation);
        }
      }
      
      // Update the pipeline JSON
      setPipelineJson(updatedPipelineJson);
    }
    
    // Generate a new pipeline template with the updated dependency
    setTimeout(() => {
      const newTemplate = generatePipelineTemplate();
      setPipelineJson(newTemplate);
      console.log(`Pipeline template updated with ${transformationType} dependency:`, newTemplate);
    }, 0);
  };

  // Function to handle dependency selection
  const handleDependencySelection = (dependency: string) => {
    console.log("Dependency selected:", dependency);
    
    // Use startTransition to prevent UI from being replaced with loading indicator
    startTransition(() => {
      // Update the selected dependency in state
      setSelectedDependency(dependency);
      
      // Hide the dependency selection UI
      setShowDependencySelection(false);
      
      // Find the transformation type that needs to be updated
      const transformationToUpdate = transformationSubStep.split('_')[0]; // 'filter', 'schema', etc.
      
      // Update the pipeline with the selected dependency
      updatePipelineWithDependency(dependency, transformationToUpdate);
      
      // Check if schemas are loaded from mdata.json
      const preloadSchemas = () => {
        // Check if schemas are loaded
        const filterSchemaLoaded = !!filterSchema;
        const schemaTransformationSchemaLoaded = !!schemaTransformationSchema;
        
        console.log("Schema loading status:", { 
          filterSchemaLoaded, 
          schemaTransformationSchemaLoaded,
          filterSchema,
          schemaTransformationSchema
        });
        
        // Now proceed with form setup based on transformation type
        if (transformationSubStep === 'filter_dependency') {
          setFilterFormInitialValues(prev => ({
            ...prev,
            dependent_on: [dependency]
          }));
          
          if (filterSchemaLoaded) {
            setTransformationSubStep('filter_condition');
            setShowFilterForm(true);
            addAssistantMessage(`Great! Now please define your filter condition below:`);
          } else {
            addAssistantMessage("Sorry, there was an error loading the filter form. Please try again.");
          }
          
        } else if (transformationSubStep === 'schema_dependency') {
          // Make sure we're setting the proper dependency for schema transformation
          // Initialize with an empty derived field to ensure the form renders correctly
          const schemaInitialValues = {
            name: 'schema_transformation',
            derived_fields: [{ name: '', expression: '' }],
            dependent_on: [dependency]
          };
          console.log("Setting schema form initial values:", schemaInitialValues);
          setSchemaFormInitialValues(schemaInitialValues);
          
          // Also update the schema transformation in the selected sources
          // This ensures the generatePipelineTemplate function will use the correct dependencies
          setSelectedSources(prevSources => {
            return prevSources.map(source => {
              // Create or update the schema_transformation property
              return {
                ...source,
                schema_transformation: {
                  ...(source.schema_transformation || {}),
                  name: 'schema_transformation',
                  transformation: 'SchemaTransformation',
                  derived_fields: [{ name: '', expression: '' }],
                  dependent_on: [dependency]
                }
              };
            });
          });
          
          // Update the pipeline template with the dependency selection
          // Use a timeout to ensure state updates have been processed
          setTimeout(() => {
            const updatedTemplate = generatePipelineTemplate();
            setPipelineJson(updatedTemplate);
            console.log("Pipeline template updated after schema dependency selection:", updatedTemplate);
            
            // Log the schema transformation in the pipeline template
            const schemaTransformation = updatedTemplate.transformations.find(
              (t: any) => t.name === 'schema_transformation'
            );
            console.log("Schema transformation in pipeline template:", schemaTransformation);
          }, 0);
          
          if (schemaTransformationSchemaLoaded) {
            setTransformationSubStep('schema_form');
            setShowSchemaForm(true);
            addAssistantMessage(`Great! Now please define your schema transformations below:`);
          } else {
            addAssistantMessage("Sorry, there was an error loading the schema transformation form. Please try again.");
          }
          
        } else if (transformationSubStep === 'both_dependency') {
          // Update both filter and schema forms with the selected dependency
          setFilterFormInitialValues(prev => ({
            ...prev,
            dependent_on: [dependency]
          }));
          
          // Initialize with an empty derived field to ensure the form renders correctly
          setSchemaFormInitialValues({
            name: 'schema_transformation',
            derived_fields: [{ name: '', expression: '' }],
            dependent_on: [dependency]
          });
          
          // Update both transformations in the selected sources
          // This ensures the generatePipelineTemplate function will use the correct dependencies
          setSelectedSources(prevSources => {
            return prevSources.map(source => {
              return {
                ...source,
                filter_transformation: {
                  ...(source.filter_transformation || {}),
                  dependent_on: [dependency]
                },
                schema_transformation: {
                  ...(source.schema_transformation || {}),
                  name: 'schema_transformation',
                  transformation: 'SchemaTransformation',
                  derived_fields: [{ name: '', expression: '' }],
                  dependent_on: [dependency]
                }
              };
            });
          });
          
          // Update the pipeline template with the dependency selection
          // Use a timeout to ensure state updates have been processed
          setTimeout(() => {
            const updatedTemplate = generatePipelineTemplate();
            setPipelineJson(updatedTemplate);
            console.log("Pipeline template updated after both dependency selection:", updatedTemplate);
            
            // Log the transformations in the pipeline template
            const filterTransformation = updatedTemplate.transformations.find(
              (t: any) => t.name === 'filter_transformation'
            );
            const schemaTransformation = updatedTemplate.transformations.find(
              (t: any) => t.name === 'schema_transformation'
            );
            console.log("Filter transformation in pipeline template:", filterTransformation);
            console.log("Schema transformation in pipeline template:", schemaTransformation);
          }, 0);
          
          // Make sure both schemas are loaded
          if (filterSchemaLoaded && schemaTransformationSchemaLoaded) {
            // Start with the filter form
            setTransformationSubStep('filter_condition');
            setShowFilterForm(true);
            addAssistantMessage(`Great! Let's start with the filter condition. Please define your filter condition below. After that, we'll set up the schema transformation.`);
          } else {
            addAssistantMessage("Sorry, there was an error loading the forms. Please try again.");
          }
          
        } else if (transformationSubStep === 'target_dependency') {
          // Update the writer form with the selected dependency
          setWriterFormInitialValues(prev => ({
            ...prev,
            dependent_on: [dependency]
          }));
          
          // Also update the target transformation in the selected sources
          // This ensures the generatePipelineTemplate function will use the correct dependencies
          setSelectedSources(prevSources => {
            return prevSources.map(source => {
              // Create or update the target_transformation property
              return {
                ...source,
                target_transformation: {
                  ...(source.target_transformation || {}),
                  dependent_on: [dependency]
                }
              };
            });
          });
          
          // Show the writer form
          setTransformationSubStep('target_form');
          setShowWriterForm(true);
          addAssistantMessage(`Please configure your output target below:`);
        }
        
        // Update the pipeline template with the dependency selection
        // We need to use a timeout to ensure the state updates have been processed
        setTimeout(() => {
          const dependencySelectionTemplate = generatePipelineTemplate();
          setPipelineJson(dependencySelectionTemplate);
          console.log("Pipeline template updated after dependency selection:", dependencySelectionTemplate);
        }, 0);
      };
      
      // Start preloading schemas
      preloadSchemas();
    });
  };

  const handleTransformationsStep = async (input: string) => {
    const userInput = input.toLowerCase().trim();

    // Check if user wants to add another source
    if (userInput.includes('add another') || userInput.includes('search') || userInput.includes('new source')) {
      setStep('source');
      setTransformationSubStep('select');
      
      // Update the pipeline template when changing steps
      const updatedTemplate = generatePipelineTemplate();
      setPipelineJson(updatedTemplate);
      console.log("Pipeline template updated when returning to source step:", updatedTemplate);
      
      addAssistantMessage("Sure! Please enter the name of another data source you'd like to search for.");
      return;
    }

    // Check if this is the initial "continue to transformations" request
    if ((userInput.includes('continue to transformation') || userInput.includes('continue')) &&
      !userInput.includes('filter') && !userInput.includes('schema') && !userInput.includes('target')) {
      // Make sure we're in the transformations step and select sub-step
      setStep('transformations');
      setTransformationSubStep('select');

      // Ask the user what transformations they want to add
      addAssistantMessage(
        "Great! Now let's add some transformations to your pipeline. I can add the following types of transformations:\n\n" +
        "1. Schema Transformation - Create new fields or modify existing ones\n" +
        "2. Filter Transformation - Filter data based on conditions\n\n" +
        "Which transformations would you like to add? You can say things like 'add schema transformation' or 'add both'."
      );

      // Build and update the pipeline template
      const pipelineTemplate = generatePipelineTemplate();
      setPipelineJson(pipelineTemplate);
      console.log("Current pipeline template:", pipelineTemplate);

      return;
    }

    // Handle different sub-steps within the transformations step
    switch (transformationSubStep) {
      case 'select':
        // Process transformation selection
        const newTransformations = [...transformations];
        let currentSelection = '';

        // Track what the user is selecting in this step
        if (userInput.includes('schema') || userInput.includes('2')) {
          currentSelection = 'schema';
          if (!newTransformations.includes('schema')) {
            newTransformations.push('schema');
          }
        }

        if (userInput.includes('filter') || userInput.includes('1')) {
          currentSelection = 'filter';
          if (!newTransformations.includes('filter')) {
            newTransformations.push('filter');
          }
        }

        if (userInput.includes('both') || userInput.includes('all')) {
          currentSelection = 'both';
          if (!newTransformations.includes('schema')) {
            newTransformations.push('schema');
          }
          if (!newTransformations.includes('filter')) {
            newTransformations.push('filter');
          }
        }

        // Check if user wants to move to target
        if (userInput.includes('target') || userInput.includes('3') || userInput.includes('skip') ||
          userInput.includes('complete') || userInput.includes('finish')) {
          currentSelection = 'target';
          // Add target to transformations
          if (!newTransformations.includes('target')) {
            newTransformations.push('target');
          }

          // If the user already has a target name saved, use it
          if (targetName) {
            setTargetConfig(prev => ({
              ...prev,
              customConfig: {
                ...prev.customConfig,
                name: targetName
              }
            }));
          }
        }

        // Update transformations state
        setTransformations(newTransformations);
        
        // Get existing transformations and sources for suggestions
        const existingNodes = [];
        
        // Add reader nodes from sources
        if (selectedSources.length > 0) {
          selectedSources.forEach(source => {
            existingNodes.push(`read_${source.data_src_name}`);
          });
        }
        
        // Add existing transformation nodes
        if (transformations.includes('schema')) {
          existingNodes.push('schema_transformation');
        }
        if (transformations.includes('filter')) {
          existingNodes.push('filter_transformation');
        }
        
        // Initialize transformations with empty dependency arrays
        // This ensures they start with empty dependencies until the user selects them
        if (currentSelection === 'filter' || currentSelection === 'both') {
          // Initialize filter transformation with empty dependency array
          setSelectedSources(prevSources => {
            return prevSources.map(source => {
              return {
                ...source,
                filter_transformation: {
                  ...(source.filter_transformation || {}),
                  dependent_on: [] // Empty array - will be filled when user selects dependency
                }
              };
            });
          });
        }
        
        if (currentSelection === 'schema' || currentSelection === 'both') {
          // Initialize schema transformation with empty dependency array
          setSelectedSources(prevSources => {
            return prevSources.map(source => {
              return {
                ...source,
                schema_transformation: {
                  ...(source.schema_transformation || {}),
                  dependent_on: [] // Empty array - will be filled when user selects dependency
                }
              };
            });
          });
        }
        
        if (currentSelection === 'target') {
          // Initialize target transformation with empty dependency array
          setSelectedSources(prevSources => {
            return prevSources.map(source => {
              return {
                ...source,
                target_transformation: {
                  ...(source.target_transformation || {}),
                  dependent_on: [] // Empty array - will be filled when user selects dependency
                }
              };
            });
          });
        }
        
        // Immediately update the pipeline template with the new transformations
        // This ensures the template is updated as soon as a transformation is selected
        // Use a timeout to ensure state updates have been processed
        setTimeout(() => {
          const updatedTemplate = generatePipelineTemplate();
          setPipelineJson(updatedTemplate);
          console.log("Pipeline template updated with new transformations:", updatedTemplate);
        }, 0);

        // Handle the current selection
        if (currentSelection === 'filter') {
          // Use startTransition to prevent UI from being replaced with loading indicator
          startTransition(() => {
            // First, ask for dependency selection
            setTransformationSubStep('filter_dependency');
            
            // Create a message with dependency options
            let dependencyMessage = "After which step would you like to add this filter? Please select from the options below:";
            
            // Add the dependency selection options as buttons
            const dependencyButtons = existingNodes.map((node, index) => ({
              label: `${index + 1}. ${node}`,
              value: node
            }));
            
            // Set the dependency selection options
            setDependencyOptions(dependencyButtons);
            
            // Prepare filter form initial values (will be updated after dependency selection)
            setFilterFormInitialValues({
              condition: filterCondition || '',
              name: 'filter_transformation',
              dependent_on: existingNodes.length > 0 ? [existingNodes[existingNodes.length - 1]] : []
            });
            setFilterName('filter_transformation');
            
            // Pre-load the filter schema in advance
            // import('@/components/bh-reactflow-comps/builddata/json/Filter.json')
            //   .then(schema => {
            //     setFilterSchema(schema.default || schema);
            //   })
            //   .catch(error => {
            //     console.error("Error loading filter schema:", error);
            //   });
              
            // Show the dependency selection UI and add the message
            // These should be done last to ensure everything is ready
            setShowDependencySelection(true);
            addAssistantMessage(dependencyMessage);
          });
        } else if (currentSelection === 'schema') {
          // Use startTransition to prevent UI from being replaced with loading indicator
          startTransition(() => {
            // First, ask for dependency selection
            setTransformationSubStep('schema_dependency');
            
            // Create a message with dependency options
            let dependencyMessage = "After which step would you like to add this schema transformation? Please select from the options below:";
            
            // Add the dependency selection options as buttons
            const dependencyButtons = existingNodes.map((node, index) => ({
              label: `${index + 1}. ${node}`,
              value: node
            }));
            
            // Set the dependency selection options
            setDependencyOptions(dependencyButtons);
            
            // Initialize schema transformation with empty dependency array in selectedSources
            setSelectedSources(prevSources => {
              return prevSources.map(source => {
                return {
                  ...source,
                  schema_transformation: {
                    ...(source.schema_transformation || {}),
                    name: 'schema_transformation',
                    transformation: 'SchemaTransformation',
                    derived_fields: [{ name: '', expression: '' }],
                    dependent_on: [] // Empty array - will be filled when user selects dependency
                  }
                };
              });
            });
            
            // Prepare schema form initial values (will be updated after dependency selection)
            // Initialize with proper structure to ensure the form renders correctly
            setSchemaFormInitialValues({
              name: 'schema_transformation',
              derived_fields: [{ name: '', expression: '' }],
              dependent_on: [] // Empty array - will be filled when user selects dependency
            });
            setSchemaName('schema_transformation');
            
            // Use schema transformation schema from mdata.json
            if (!schemaTransformationSchema) {
              const schemaTransformationSchemaFromMdata = mdataJson.schema.find((schema: any) => schema.title === "SchemaTransformation");
              if (schemaTransformationSchemaFromMdata) {
                // Add nodeId to the schema to match the format expected by CreateFormFormik
                setSchemaTransformationSchema({
                  ...schemaTransformationSchemaFromMdata,
                  nodeId: 'schema_transformation'
                });
                console.log("Loaded schema transformation schema from mdata.json");
              } else {
                console.error("Schema transformation schema not found in mdata.json");
              }
            }
              
            // Show the dependency selection UI and add the message
            // These should be done last to ensure everything is ready
            setShowDependencySelection(true);
            addAssistantMessage(dependencyMessage);
          });
        } else if (currentSelection === 'both') {
          // Use startTransition to prevent UI from being replaced with loading indicator
          startTransition(() => {
            // First, ask for dependency selection for both transformations
            setTransformationSubStep('both_dependency');
            
            // Create a message with dependency options
            let dependencyMessage = "After which step would you like to add these transformations? Please select from the options below:";
            
            // Add the dependency selection options as buttons
            const dependencyButtons = existingNodes.map((node, index) => ({
              label: `${index + 1}. ${node}`,
              value: node
            }));
            
            // Set the dependency selection options
            setDependencyOptions(dependencyButtons);
            
            // Prepare filter form initial values (will be updated after dependency selection)
            setFilterFormInitialValues({
              condition: filterCondition || '',
              name: 'filter_transformation',
              dependent_on: existingNodes.length > 0 ? [existingNodes[existingNodes.length - 1]] : []
            });
            setFilterName('filter_transformation');
            
            // Use schemas from mdata.json
            try {
              if (!filterSchema) {
                const filterSchemaFromMdata = mdataJson.schema.find((schema: any) => schema.title === "Filter");
                if (filterSchemaFromMdata) {
                  // Add nodeId to the schema to match the format expected by CreateFormFormik
                  setFilterSchema({
                    ...filterSchemaFromMdata,
                    nodeId: 'filter_transformation'
                  });
                  console.log("Loaded filter schema from mdata.json");
                } else {
                  console.error("Filter schema not found in mdata.json");
                }
              }
              
              if (!schemaTransformationSchema) {
                const schemaTransformationSchemaFromMdata = mdataJson.schema.find((schema: any) => schema.title === "SchemaTransformation");
                if (schemaTransformationSchemaFromMdata) {
                  // Add nodeId to the schema to match the format expected by CreateFormFormik
                  setSchemaTransformationSchema({
                    ...schemaTransformationSchemaFromMdata,
                    nodeId: 'schema_transformation'
                  });
                  console.log("Loaded schema transformation schema from mdata.json");
                } else {
                  console.error("Schema transformation schema not found in mdata.json");
                }
              }
            } catch (error) {
              console.error("Error loading schemas from mdata.json:", error);
            }
            
            // Show the dependency selection UI and add the message
            // These should be done last to ensure everything is ready
            setShowDependencySelection(true);
            addAssistantMessage(dependencyMessage);
          });
        } else if (currentSelection === 'target') {
          // Use startTransition to prevent UI from being replaced with loading indicator
          startTransition(() => {
            // First, ask for dependency selection
            setTransformationSubStep('target_dependency');
            
            // Create a message with dependency options
            let dependencyMessage = "After which step would you like to add this output target? Please select from the options below:";
            
            // Add the dependency selection options as buttons
            const dependencyButtons = existingNodes.map((node, index) => ({
              label: `${index + 1}. ${node}`,
              value: node
            }));
            
            // Set the dependency selection options
            setDependencyOptions(dependencyButtons);
            
            // Prepare initial values for the Writer form (will be updated after dependency selection)
            const initialValues = {
              name: targetName || 'write_output',
              target: {
                target_name: targetName || 'output_data',
                target_type: 'File',
                load_mode: 'append',
                connection: {
                  connection_type: 'Local',
                  file_path_prefix: 'examples/'
                },
                file_name: `${(targetName || 'output').toLowerCase().replace(/\s+/g, '_')}.csv`
              },
              file_type: 'CSV',
              write_options: {
                header: true,
                sep: ',',
                createDisposition: 'CREATE_IF_NEEDED',
                writeMethod: 'APPEND'
              },
              dependent_on: existingNodes.length > 0 ? [existingNodes[existingNodes.length - 1]] : []
            };
  
            setWriterFormInitialValues(initialValues);
            
            // Show the dependency selection UI and add the message
            // These should be done last to ensure everything is ready
            setShowDependencySelection(true);
            addAssistantMessage(dependencyMessage);
          });
        } else {
          // No valid selection made
          setTransformationSubStep('select');
          addAssistantMessage("Please select at least one transformation type or target configuration.");
        }
        break;

      case 'filter_condition':
        // Save the filter condition
        setFilterCondition(input);

        // Return to transformation selection to allow adding more transformations
        setTransformationSubStep('select');
        addAssistantMessage(
          "Great! The filter transformation has been added. Would you like to add another transformation?\n\n" +
          "1. Filter Transformation - Filter data based on conditions\n" +
          "2. Schema Transformation - Create new fields or modify existing ones\n" +
          "3. Target - Skip transformations not needed\n\n" +
          "Please select an option from the buttons below."
        );
        break;

      case 'target_name':
        // Save the target name and update target configuration
        setTargetConfig(prev => ({
          ...prev,
          customConfig: {
            ...prev.customConfig,
            name: input
          }
        }));
        setTargetName(input);

        // Return to transformation selection to allow adding more transformations
        setTransformationSubStep('select');

        // Build and update the pipeline template
        const targetNameTemplate = generatePipelineTemplate();
        setPipelineJson(targetNameTemplate);

        // Ask if the user wants to add more transformations
        addAssistantMessage(
          "Great! I've saved your output name. Would you like to add more transformations to your pipeline?\n\n" +
          "1. Filter Transformation - Filter data based on conditions\n" +
          "2. Schema Transformation - Create new fields or modify existing ones\n" +
          "3. Target - Skip transformations not needed\n\n" +
          "Please select an option from the buttons below."
        );
        break;

      case 'target_type':
        // Process target type selection
        let targetType: 'File' | 'Database' | 'Custom' = 'File';
        const typeInput = input.toLowerCase().trim();

        if (typeInput.includes('1') || typeInput.includes('file')) {
          targetType = 'File';
          setTargetConfig(prev => ({
            ...prev,
            type: 'File',
            connectionType: 'Local',
            filePath: 'examples/'
          }));

          // Ask for file format
          setTransformationSubStep('file_format');
          addAssistantMessage(
            `What file format would you like to use for your output?\n\n` +
            `1. CSV\n` +
            `2. JSON\n` +
            `3. Parquet\n` +
            `4. Other\n\n` +
            `Please select a number or type your preference.`
          );
        } else if (typeInput.includes('2') || typeInput.includes('database') || typeInput.includes('db')) {
          targetType = 'Database';
          setTargetConfig(prev => ({
            ...prev,
            type: 'Database',
            connectionType: 'PostgreSQL' // Default, can be changed
          }));

          // Ask for database type
          setTransformationSubStep('db_type');
          addAssistantMessage(
            `What type of database would you like to use?\n\n` +
            `1. PostgreSQL\n` +
            `2. MySQL\n` +
            `3. SQLite\n` +
            `4. Other\n\n` +
            `Please select a number or type your preference.`
          );
        } else if (typeInput.includes('3') || typeInput.includes('custom')) {
          targetType = 'Custom';
          setTargetConfig(prev => ({
            ...prev,
            type: 'Custom',
            customConfig: {
              ...prev.customConfig,
              target_type: 'Custom'
            }
          }));

          // Skip to summary for custom - user can configure details elsewhere
          setTransformationSubStep('summary');

          // Build the final pipeline template
          const customTargetTemplate = generatePipelineTemplate();
          setPipelineJson(customTargetTemplate);

          // Show summary and ask for confirmation
          addAssistantMessage(
            `Great! I've configured your pipeline with the following details:\n\n` +
            `- Name: ${pipelineName}\n` +
            `- Description: ${pipelineDescription || "(none)"}\n` +
            `- Sources: ${selectedSources.map(s => s.data_src_name).join(", ")}\n` +
            `- Transformations: ${transformations.filter(t => t !== 'target').join(", ") || "(none)"}\n` +
            `- Output: ${input || "output_data"} (Custom)\n\n` +
            `Would you like to create this pipeline now?`
          );

          setStep('confirm');
        } else {
          // Default to File if input is unclear
          targetType = 'File';
          setTargetConfig(prev => ({
            ...prev,
            type: 'File'
          }));

          // Skip to summary
          setTransformationSubStep('summary');

          // Build the final pipeline template
          const fileTargetSummaryTemplate = generatePipelineTemplate();
          setPipelineJson(fileTargetSummaryTemplate);

          // Show summary and ask for confirmation
          addAssistantMessage(
            `Great! I've configured your pipeline with the following details:\n\n` +
            `- Name: ${pipelineName}\n` +
            `- Description: ${pipelineDescription || "(none)"}\n` +
            `- Sources: ${selectedSources.map(s => s.data_src_name).join(", ")}\n` +
            `- Transformations: ${transformations.filter(t => t !== 'target').join(", ") || "(none)"}\n` +
            `- Output: ${input || "output_data"} (File)\n\n` +
            `Would you like to create this pipeline now?`
          );

          setStep('confirm');
        }
        break;

      case 'file_format':
        // Process file format selection
        let fileFormat = 'CSV';
        const formatInput = input.toLowerCase().trim();

        if (formatInput.includes('1') || formatInput.includes('csv')) {
          fileFormat = 'CSV';
        } else if (formatInput.includes('2') || formatInput.includes('json')) {
          fileFormat = 'JSON';
        } else if (formatInput.includes('3') || formatInput.includes('parquet')) {
          fileFormat = 'Parquet';
        } else if (formatInput.includes('4') || formatInput.includes('other')) {
          // If other, use what they typed after "other"
          const match = formatInput.match(/other\s+(.+)/i);
          if (match && match[1]) {
            fileFormat = match[1].toUpperCase();
          } else {
            // Ask for the specific format
            addAssistantMessage("Please specify the file format you'd like to use:");
            return; // Wait for next input
          }
        } else {
          // Use whatever they typed
          fileFormat = input.trim();
        }

        // Update target config with file format
        setTargetConfig(prev => ({
          ...prev,
          fileFormat
        }));

        // Ask for file path
        setTransformationSubStep('file_path');
        addAssistantMessage(
          `What directory path would you like to use for your output file? (Default: examples/)`
        );
        break;

      case 'file_path':
        // Process file path
        const filePath = input.trim() || 'examples/';

        // Update target config with file path
        setTargetConfig(prev => ({
          ...prev,
          filePath
        }));

        // Move to summary
        setTransformationSubStep('summary');

        // Build the final pipeline template
        const fileTargetTemplate = generatePipelineTemplate();
        setPipelineJson(fileTargetTemplate);

        // Show summary and ask for confirmation
        addAssistantMessage(
          `Great! I've configured your pipeline with the following details:\n\n` +
          `- Name: ${pipelineName}\n` +
          `- Description: ${pipelineDescription || "(none)"}\n` +
          `- Sources: ${selectedSources.map(s => s.data_src_name).join(", ")}\n` +
          `- Transformations: ${transformations.filter(t => t !== 'target').join(", ") || "(none)"}\n` +
          `- Output: ${targetConfig.customConfig?.name || "output_data"} (${targetConfig.type}: ${targetConfig.fileFormat})\n\n` +
          `Would you like to create this pipeline now?`
        );

        setStep('confirm');
        break;

      case 'db_type':
        // Process database type selection
        let dbType = 'PostgreSQL';
        const dbTypeInput = input.toLowerCase().trim();

        if (dbTypeInput.includes('1') || dbTypeInput.includes('postgres')) {
          dbType = 'PostgreSQL';
        } else if (dbTypeInput.includes('2') || dbTypeInput.includes('mysql')) {
          dbType = 'MySQL';
        } else if (dbTypeInput.includes('3') || dbTypeInput.includes('sqlite')) {
          dbType = 'SQLite';
        } else if (dbTypeInput.includes('4') || dbTypeInput.includes('other')) {
          // If other, use what they typed after "other"
          const match = dbTypeInput.match(/other\s+(.+)/i);
          if (match && match[1]) {
            dbType = match[1];
          } else {
            // Ask for the specific database type
            addAssistantMessage("Please specify the database type you'd like to use:");
            return; // Wait for next input
          }
        } else {
          // Use whatever they typed
          dbType = input.trim();
        }

        // Update target config with database type
        setTargetConfig(prev => ({
          ...prev,
          connectionType: dbType
        }));

        // Ask for schema
        setTransformationSubStep('db_schema');
        addAssistantMessage(
          `What schema would you like to use for your database target? (Default: public)`
        );
        break;

      case 'db_schema':
        // Process database schema
        const schema = input.trim() || 'public';

        // Update target config with schema
        setTargetConfig(prev => ({
          ...prev,
          schema
        }));

        // Ask for database name
        setTransformationSubStep('db_name');
        addAssistantMessage(
          `What is the name of the database you'd like to use? (Default: postgres)`
        );
        break;

      case 'db_name':
        // Process database name
        const database = input.trim() || 'postgres';

        // Update target config with database name
        setTargetConfig(prev => ({
          ...prev,
          database
        }));

        // Move to summary
        setTransformationSubStep('summary');

        // Build the final pipeline template
        const dbTargetTemplate = generatePipelineTemplate();
        setPipelineJson(dbTargetTemplate);

        // Show summary and ask for confirmation
        addAssistantMessage(
          `Great! I've configured your pipeline with the following details:\n\n` +
          `- Name: ${pipelineName}\n` +
          `- Description: ${pipelineDescription || "(none)"}\n` +
          `- Sources: ${selectedSources.map(s => s.data_src_name).join(", ")}\n` +
          `- Transformations: ${transformations.filter(t => t !== 'target').join(", ") || "(none)"}\n` +
          `- Output: ${targetConfig.customConfig?.name || "output_data"} (${targetConfig.type}: ${targetConfig.connectionType})\n\n` +
          `Would you like to create this pipeline now?`
        );

        setStep('confirm');
        break;

      case 'connection_choice':
        // Save the connection choice
        const useDbConnection = input.toLowerCase().includes('yes') || input.toLowerCase().includes('y');
        setUseSourceConnection(useDbConnection);

        if (useDbConnection) {
          // Update target config to use database connection from source
          const sourceConnectionType = selectedSources[0].connection_config?.custom_metadata?.connection_type || 'PostgreSQL';
          const sourceSchema = selectedSources[0].connection_config?.custom_metadata?.schema || 'public';
          const sourceDatabase = selectedSources[0].connection_config?.custom_metadata?.database || 'postgres';

          setTargetConfig(prev => ({
            ...prev,
            type: 'Database',
            connectionType: sourceConnectionType,
            schema: sourceSchema,
            database: sourceDatabase
          }));
        } else {
          // Ask for target type since they don't want to use source connection
          setTransformationSubStep('target_type');

          addAssistantMessage(
            `What type of target would you like to use for your output?\n\n` +
            `1. File (CSV, JSON, etc.)\n` +
            `2. Database (different from source)\n` +
            `3. Custom\n\n` +
            `Please select a number or type your preference.`
          );
          return; // Wait for next input
        }

        // Move to summary
        setTransformationSubStep('summary');

        // Build the final pipeline template with the updated connection choice
        const connectionChoiceTemplate = generatePipelineTemplate();
        setPipelineJson(connectionChoiceTemplate);
        console.log("Final pipeline template with connection choice:", connectionChoiceTemplate);

        // Show summary and ask for confirmation
        addAssistantMessage(
          `Great! I've configured your pipeline with the following details:\n\n` +
          `- Name: ${pipelineName}\n` +
          `- Description: ${pipelineDescription || "(none)"}\n` +
          `- Sources: ${selectedSources.map(s => s.data_src_name).join(", ")}\n` +
          `- Transformations: ${transformations.filter(t => t !== 'target').join(", ") || "(none)"}\n` +
          `- Output: ${targetConfig.customConfig?.name || "output_data"} (${targetConfig.type}: ${targetConfig.connectionType})\n\n` +
          `Would you like to create this pipeline now?`
        );

        setStep('confirm');
        break;

      default:
        break;
    }

    // Update the pipeline template
    const pipelineTemplate = generatePipelineTemplate();
    setPipelineJson(pipelineTemplate);
  };

  const handleConfirmStep = async (input: string) => {
    const userInput = input.toLowerCase().trim();

    if (userInput.includes('yes') || userInput.includes('create') || userInput.includes('confirm')) {
      // User confirmed, create the pipeline
      try {
        setIsProcessing(true);

        // Get the final pipeline template
        const finalTemplate = generatePipelineTemplate();

        // Log the final template for debugging
        console.log("Final pipeline template for creation:", finalTemplate);

        // Create the pipeline
        const response: any = await apiService.post({
          portNumber: CATALOG_API_PORT,
          url: `/pipeline/`,
          usePrefix: true,
          method: 'POST',
          data: {
            pipeline_name: pipelineName,
            pipeline_desc: pipelineDescription || `Pipeline created with AI assistant`,
            pipeline_json: JSON.stringify(finalTemplate),
            pipeline_type: "DATA"
          }
        });

        if (response && response.pipeline_id) {
          // Success!
          addAssistantMessage(
            `Success! I've created your pipeline "${pipelineName}". ` +
            `You can now view and edit it in the pipeline designer.`
          );

          // Notify the parent component that a pipeline was created
          if (onPipelineCreated) {
            onPipelineCreated(response.pipeline_id);
          }

          // Close the chat after a delay
          setTimeout(() => {
            onClose();
          }, 3000);
        } else {
          throw new Error("Failed to create pipeline");
        }
      } catch (error) {
        console.error("Error creating pipeline:", error);
        addAssistantMessage("I encountered an error while creating your pipeline. Please try again later.");
      } finally {
        setIsProcessing(false);
      }
    } else {
      // User wants to edit, go back to the beginning
      addAssistantMessage("No problem! Let's start over. What would you like to name your pipeline?");
      setStep('name');
      resetPipelineCreationState();
    }
  };

 
  
  // Handle ReaderOptionsForm source update
  const handleReaderOptionsUpdate = (sourceData: any) => {
    console.log("Source updated:", sourceData);
    
    // Handle the source update
    if (currentSourceData && sourceData.sourceData) {
      // Update the current source data with the new configuration
      const updatedSource = {
        ...currentSourceData,
        ...sourceData.sourceData.data.source
      };
      
      // Update selected sources
      const updatedSources = selectedSources.map(source => 
        source.data_src_id === updatedSource.data_src_id ? updatedSource : source
      );
      
      if (updatedSources.length === 0) {
        // If no sources were updated, add the new source
        updatedSources.push(updatedSource);
      }
      
      setSelectedSources(updatedSources);
      
      // Add a message to show the configuration
      addAssistantMessage(
        `Reader configuration saved for "${updatedSource.data_src_name}". ` +
        `Would you like to add another data source, or continue to the next step? ` +
        `Say "continue" to proceed to transformations.`
      );
      
      // Build and update the pipeline template
      const pipelineTemplate = generatePipelineTemplate();
      setPipelineJson(pipelineTemplate);
    }
    
    // Hide the form
    setShowReaderForm(false);
  };
  
  // Handle TargetPopUp source update
  const handleTargetUpdate = (sourceData: any) => {
    console.log("Target updated:", sourceData);
    
    // Save target configuration
    if (sourceData.sourceData) {
      const targetData = sourceData.sourceData.data;
      
      // Extract the source data from the form
      const source = targetData.source;
      
      // Update the target name
      setTargetName(targetData.label || targetData.title || source.name);
      
      // Update the target configuration with the correct mapping
      const newTargetConfig = {
        type: source.target_type, // Use target_type instead of type
        connectionType: source.connection?.connection_type || source.connection?.type || 'Local',
        filePath: source.connection?.file_path_prefix || 'examples/',
        fileFormat: source.file_type,
        schema: source.connection?.schema,
        database: source.connection?.database,
        connection: source.connection,
        customConfig: {
          name: targetData.label || targetData.title || source.name,
          targetName: source.target_name,
          tableName: source.table_name,
          loadMode: source.load_mode,
          fileName: source.file_name,
        }
      };
      
      setTargetConfig(newTargetConfig);
      
      // Process dependency selection if provided
      let dependencyMessage = "";
      let updatedSources = [...selectedSources];
      
      if (targetData.dependent_on && targetData.dependent_on.length > 0) {
        dependencyMessage = ` (after ${targetData.dependent_on.join(', ')})`;
        
        // Store the dependency information in the source data
        if (selectedSources.length > 0) {
          updatedSources = selectedSources.map(source => {
            return {
              ...source,
              target_transformation: {
                ...source.target_transformation,
                dependent_on: targetData.dependent_on
              }
            };
          });
          setSelectedSources(updatedSources);
        }
      }
      
      // Add a message to show the target configuration
      const targetType = source.target_type;
      let targetDetails = '';
      
      if (targetType === 'File') {
        targetDetails = `${source.file_type} file: ${source.file_name}`;
      } else if (targetType === 'Relational') {
        targetDetails = `Database: ${source.connection?.database || 'default'}`;
      }
      
      // Get existing transformations and sources for suggestions
      const existingNodes = [];
      
      // Add reader nodes from sources
      if (updatedSources.length > 0) {
        updatedSources.forEach(source => {
          existingNodes.push(`read_${source.data_src_name}`);
        });
      }
      
      // Add existing transformation nodes
      if (transformations.includes('schema')) {
        existingNodes.push('schema_transformation');
      }
      if (transformations.includes('filter')) {
        existingNodes.push('filter_transformation');
      }

      // Create a list of existing transformations for the message
      let transformationsList = "";
      if (existingNodes.length > 0) {
        transformationsList = "\n\nFinal pipeline steps:\n";
        existingNodes.forEach((node, index) => {
          transformationsList += `${index + 1}. ${node}\n`;
        });
        transformationsList += `${existingNodes.length + 1}. write_output (${targetDetails})`;
      }
      
      // Add 'target' to transformations if not already included
      let updatedTransformations = [...transformations];
      if (!transformations.includes('target')) {
        updatedTransformations = [...transformations, 'target'];
        setTransformations(updatedTransformations);
      }
      
      addAssistantMessage(
        `Target configuration saved: ${targetType} target (${targetDetails})${dependencyMessage}.${transformationsList}\n\n` +
        `Your pipeline is now ready to be created. Would you like to review the pipeline or create it now?`
      );
      
      // Move to confirm step
      setStep('confirm');
      
      // Immediately update the pipeline template with current values
      // This ensures we're using the most up-to-date state
      const pipelineTemplate = buildPipelineTemplate(
        pipelineName,
        pipelineDescription,
        updatedSources,
        updatedTransformations,
        newTargetConfig,
        useSourceConnection,
        filterCondition
      );
      
      console.log("Updated pipeline template after target configuration:", pipelineTemplate);
      setPipelineJson(pipelineTemplate);
      
      // Remove the setTimeout call that was causing the reset issue
      // The pipeline JSON is already updated with the correct target configuration
    }
    
    // Hide the form
    setShowWriterForm(false);
  };

  // Handle reader form submission
  const handleReaderFormSubmit = (formData: any) => {
    console.log("Reader form submitted:", formData);

    // Add the source with the updated configuration
    if (currentSourceData) {
      // Create a deep copy of the current source data
      const updatedSource = JSON.parse(JSON.stringify(currentSourceData));

      // Update basic properties
      updatedSource.data_src_name = formData.reader_name;
      updatedSource.file_type = formData.file_type;

      // Update source-specific properties
      if (formData.source.type === 'File') {
        updatedSource.file_path = formData.source.file_path;
        updatedSource.file_path_prefix = formData.source.file_path;

        // Update read options if present
        if (formData.read_options) {
          updatedSource.read_options = {
            header: formData.read_options.header,
            delimiter: formData.read_options.delimiter,
            quote: formData.read_options.quote
          };
        }

        // Clear any relational-specific properties
        delete updatedSource.table_name;
        delete updatedSource.query;

        // Set connection config to null or default for file sources
        updatedSource.connection_config = null;
      } else if (formData.source.type === 'Relational') {
        // Set up connection config for relational sources
        updatedSource.connection_config = {
          connection_config_name: currentSourceData.connection_config?.connection_config_name || "custom",
          custom_metadata: {
            connection_type: formData.source.connection.type,
            database: formData.source.connection.database,
            schema: formData.source.connection.schema
          }
        };

        // Set table name
        updatedSource.table_name = formData.source.connection.table;

        // Set query if present
        if (formData.query) {
          updatedSource.query = formData.query;
        }

        // Clear any file-specific properties
        delete updatedSource.file_path;
        delete updatedSource.file_path_prefix;
        delete updatedSource.read_options;
      }

      // Log the updated source for debugging
      console.log("Updated source:", updatedSource);

      // Add to selected sources
      const updatedSources = [...selectedSources, updatedSource];
      setSelectedSources(updatedSources);

      // Add a message to show the configuration
      addUserMessage(`Reader configuration saved for "${formData.reader_name}"`);

      // Hide the form
      setShowReaderForm(false);

      // Regenerate the pipeline template with the updated reader configuration
      const readerConfigTemplate = generatePipelineTemplate();
      setPipelineJson(readerConfigTemplate);
      console.log("Updated pipeline template after reader form submission:", readerConfigTemplate);

      // Ask if they want to add another source or continue
      addAssistantMessage(
        `I've added the data source "${formData.reader_name}" to your pipeline. ` +
        `Would you like to add another data source, or shall we move on to adding transformations? ` +
        `Say "add another" to search for another source, or "continue" to proceed to transformations.`
      );
    }
  };

  // Handle filter form submission
  const handleFilterFormSubmit = (formData: any) => {
    console.log("Filter form submitted:", formData);

    // Save filter condition
    setFilterCondition(formData.condition);

    // Process dependency selection if provided
    let dependencyMessage = "";
    if (formData.dependent_on && formData.dependent_on.length > 0) {
      dependencyMessage = ` (after ${formData.dependent_on.join(', ')})`;
      
      // Store the dependency information in the source data
      if (selectedSources.length > 0) {
        const updatedSources = selectedSources.map(source => {
          return {
            ...source,
            filter_transformation: {
              ...source.filter_transformation,
              dependent_on: formData.dependent_on
            }
          };
        });
        setSelectedSources(updatedSources);
      }
      
      // Update the pipeline JSON directly
      const updatedPipelineJson = { ...pipelineJson };
      if (updatedPipelineJson && updatedPipelineJson.transformations) {
        // Find the filter transformation
        const filterTransformation = updatedPipelineJson.transformations.find(
          (t: any) => t.name === 'filter_transformation'
        );
        
        if (filterTransformation) {
          // Update the dependency
          filterTransformation.dependent_on = formData.dependent_on;
          console.log("Updated filter transformation dependency in pipeline JSON:", filterTransformation);
        }
        
        // Update the pipeline JSON
        setPipelineJson(updatedPipelineJson);
      }
    }

    // Add a message to show the selected condition
    addUserMessage(`Filter condition: ${formData.condition}${dependencyMessage}`);
    
    // Regenerate the pipeline template with the updated filter condition
    const filterConditionTemplate = generatePipelineTemplate();
    setPipelineJson(filterConditionTemplate);
    console.log("Updated pipeline template after filter form submission:", filterConditionTemplate);

    // Hide the form
    setShowFilterForm(false);

    // Check if we need to show the schema form next (when both transformations are selected)
    if (transformations.includes('schema') && transformations.includes('filter') && 
        !selectedSources.some(s => s.schema_transformation)) {
      // We need to show the schema form next
      setTransformationSubStep('schema_form');
      setShowSchemaForm(true);
      addAssistantMessage(`Great! Now let's define your schema transformations below:`);
      return; // Exit early to prevent showing the transformation selection message
    }

    // Return to transformation selection to allow adding more transformations
    setTransformationSubStep('select');

    // Get existing transformations and sources for suggestions
    const existingNodes = [];
    
    // Add reader nodes from sources
    if (selectedSources.length > 0) {
      selectedSources.forEach(source => {
        existingNodes.push(`read_${source.data_src_name}`);
      });
    }
    
    // Add existing transformation nodes
    if (transformations.includes('schema')) {
      existingNodes.push('schema_transformation');
    }
    if (transformations.includes('filter')) {
      existingNodes.push('filter_transformation');
    }

    // Create a list of existing transformations for the message
    let transformationsList = "";
    if (existingNodes.length > 0) {
      transformationsList = "\n\nCurrent pipeline steps:\n";
      existingNodes.forEach((node, index) => {
        transformationsList += `${index + 1}. ${node}\n`;
      });
      transformationsList += "\nFilter transformation has been added.";
    }

    // Ask if the user wants to add more transformations
    addAssistantMessage(
      `Great! The filter transformation has been added.${transformationsList}\n\nWould you like to add another transformation?\n\n` +
      "1. Filter Transformation - Filter data based on conditions\n" +
      "2. Schema Transformation - Create new fields or modify existing ones\n" +
      "3. Target - Skip transformations not needed\n\n" +
      "Please select an option from the buttons below."
    );

    // Note: The pipeline template is now automatically updated by the SchemaFormLoader component
  };

  // Handle schema transformation form submission
  const handleSchemaFormSubmit = (formData: any) => {
    console.log("Schema form submitted:", formData);

    // Ensure derived_fields is an array
    if (!Array.isArray(formData.derived_fields)) {
      formData.derived_fields = [{ name: '', expression: '' }];
    }

    // Filter out empty derived fields
    formData.derived_fields = formData.derived_fields.filter((field: any) => 
      field.name && field.name.trim() !== '' && field.expression && field.expression.trim() !== ''
    );

    // If no valid derived fields, add a default one
    if (formData.derived_fields.length === 0) {
      formData.derived_fields = [{ name: 'derived_field', expression: 'column1' }];
    }

    // Save schema transformation
    const derivedFields = formData.derived_fields.map((field: any) =>
      `${field.name}: ${field.expression}`
    ).join(', ');

    // Process dependency selection if provided
    let dependencyMessage = "";
    if (formData.dependent_on && formData.dependent_on.length > 0) {
      dependencyMessage = ` (after ${formData.dependent_on.join(', ')})`;
      console.log("Using user-provided schema dependencies:", formData.dependent_on);
    } else {
      // If no dependency provided, check if we have a selected dependency
      if (selectedDependency) {
        formData.dependent_on = [selectedDependency];
        dependencyMessage = ` (after ${selectedDependency})`;
        console.log("Using selected dependency for schema:", selectedDependency);
      } 
      // Otherwise, use an empty array - this will be filled when user selects dependency
      else {
        formData.dependent_on = [];
        console.log("No dependency provided for schema transformation");
      }
    }
    
    // Store the schema transformation data directly in the transformations array
    // This ensures it's properly included in the pipeline template
    const schemaTransformationData = {
      name: "schema_transformation",
      transformation: "SchemaTransformation",
      dependent_on: formData.dependent_on,
      derived_fields: formData.derived_fields
    };
    
    // Update the selected sources with the schema transformation data
    if (selectedSources.length > 0) {
      const updatedSources = selectedSources.map(source => {
        return {
          ...source,
          schema_transformation: schemaTransformationData
        };
      });
      setSelectedSources(updatedSources);
    }
    
    // Update the pipeline JSON directly
    const updatedPipelineJson = { ...pipelineJson };
    if (updatedPipelineJson && updatedPipelineJson.transformations) {
      // Find the schema transformation
      const schemaTransformation = updatedPipelineJson.transformations.find(
        (t: any) => t.name === 'schema_transformation'
      );
      
      if (schemaTransformation) {
        // Update existing schema transformation
        schemaTransformation.derived_fields = formData.derived_fields;
        schemaTransformation.dependent_on = formData.dependent_on;
        console.log("Updated schema transformation in pipeline JSON:", schemaTransformation);
      } else {
        // Add new schema transformation
        updatedPipelineJson.transformations.push(schemaTransformationData);
        console.log("Added new schema transformation to pipeline JSON:", schemaTransformationData);
      }
      
      // Update the pipeline JSON
      setPipelineJson(updatedPipelineJson);
    }

    // Add a message to show the selected derived fields
    addUserMessage(`Schema transformation: ${derivedFields}${dependencyMessage}`);

    // Hide the form
    setShowSchemaForm(false);

    // Regenerate the pipeline template with the updated schema transformation
    // Use a timeout to ensure state updates have been processed
    setTimeout(() => {
      const schemaTransformTemplate = generatePipelineTemplate();
      setPipelineJson(schemaTransformTemplate);
      console.log("Updated pipeline template after schema form submission:", schemaTransformTemplate);
      
      // Log the schema transformation in the pipeline template
      const schemaTransformation = schemaTransformTemplate.transformations.find(
        (t: any) => t.name === 'schema_transformation'
      );
      console.log("Schema transformation in pipeline template:", schemaTransformation);
    }, 0);

    // Add assistant message confirming the schema transformation was added
    addAssistantMessage(`Great! I've added the schema transformation with the following derived fields: ${derivedFields}${dependencyMessage}`);

    // Return to transformation selection to allow adding more transformations
    setTransformationSubStep('select');

    // Get existing transformations and sources for suggestions
    const existingNodes = [];
    
    // Add reader nodes from sources
    if (selectedSources.length > 0) {
      selectedSources.forEach(source => {
        existingNodes.push(`read_${source.data_src_name}`);
      });
    }
    
    // Add existing transformation nodes
    if (transformations.includes('schema')) {
      existingNodes.push('schema_transformation');
    }
    if (transformations.includes('filter')) {
      existingNodes.push('filter_transformation');
    }

    // Create a list of existing transformations for the message
    let transformationsList = "";
    if (existingNodes.length > 0) {
      transformationsList = "\n\nCurrent pipeline steps:\n";
      existingNodes.forEach((node, index) => {
        transformationsList += `${index + 1}. ${node}\n`;
      });
      transformationsList += "\nSchema transformation has been added.";
    }

    // Ask if the user wants to add more transformations
    addAssistantMessage(
      `Great! The schema transformation has been added.${transformationsList}\n\nWould you like to add another transformation?\n\n` +
      "1. Filter Transformation - Filter data based on conditions\n" +
      "2. Schema Transformation - Create new fields or modify existing ones\n" +
      "3. Target - Skip transformations not needed\n\n" +
      "Please select an option from the buttons below."
    );
  };

  return (
    <>

      {/* Chat panel - always visible, not sliding */}
      <div
        className={`h-full flex flex-col bg-background/95 backdrop-blur-md border-l border-border shadow-lg opacity-100 ${className}`}
      >


        {isNewChat || messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-8 space-y-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
              <img
                src={imageSrc}
                alt="AI"
                className="w-5 h-7 transform -rotate-[40deg]"
              />
            </div>
            <div className="text-center space-y-1.5 max-w-sm">
              <p className="text-lg font-medium">How can I assist with your pipeline?</p>
              <div className="flex justify-center items-center"> {/* Updated here */}
                <Button
                  onClick={startPipelineCreation}
                  className="bg-black text-white hover:bg-black/90 flex justify-center items-center gap-2 px-4 py-2 text-sm"
                >
                  <Plus className="h-4 w-4" />
                  Start Pipeline
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <ScrollArea className="flex-1 px-6 py-4">
            <div className="space-y-6 py-4">
              {messages.map((message, i) => (
                <div
                  key={i}
                  className={`flex ${message.role === "user" ? "justify-end" : "items-start gap-4 px-1"
                    }`}
                >
                  {message.role === "assistant" && (
                    <Avatar className="w-10 h-10 mr-0 flex-shrink-0 mt-1 justify-center bg-gradient-to-br from-primary/20 to-blue-300/30 border border-slate-100 shadow-sm">
                      <AvatarImage src={imageSrc} className="object-contain object-center h-full w-full p-2 drop-shadow-sm" />
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`flex flex-col ${message.role === "user" ? "items-end" : "max-w-[85%]"
                      }`}
                  >
                    <div
                      className={`rounded-2xl px-4 py-3 ${message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-card border border-border/40 shadow-sm"
                        }`}
                    >
                      <div className="whitespace-pre-wrap">{message.content}</div>

                      {/* Render message buttons if available */}
                      {message.role === "assistant" && message.buttons && message.buttons.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {message.buttons}
                        </div>
                      )}

                      {/* Show inline forms after specific assistant messages */}
                      {message.role === "assistant" && i === messages.length - 1 && (
                        <>
                          {/* Source selection suggestion buttons */}
                          {awaitingSourceSelection && sourceSuggestions.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                              {sourceSuggestions}
                            </div>
                          )}
                          
                          {showReaderForm && message.content.includes("Please review and customize the reader configuration") && (
                            <SchemaFormLoader
                              schemaType="Reader"
                              initialValues={readerFormInitialValues}
                              onSubmit={handleReaderFormSubmit}
                              submitLabel="Save Reader Configuration"
                              updatePipelineTemplate={true}
                            />
                          )}

                          {showFilterForm && (
                            <div className="mt-4 rounded-lg bg-white">
                              <div className="flex justify-between items-center px-5 py-3 border-b border-gray-100 bg-white">
                                <div className="flex items-center gap-3">
                                  <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-black to-black flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">F</span>
                                  </div>
                                  <h2 className="text-lg font-medium text-gray-800">
                                    Filter Configuration
                                  </h2>
                                </div>
                              </div>
                              <div className="py-4">
                                {/* Use CreateFormFormik directly for filter */}
                                {filterSchema ? (
                                  <CreateFormFormik
                                    schema={{
                                      ...filterSchema,
                                      initialValues: {
                                        name: 'filter_transformation',
                                        condition: '',
                                        dependent_on: filterFormInitialValues.dependent_on || []
                                      }
                                    }}
                                    initialValues={{
                                      name: 'filter_transformation',
                                      condition: '',
                                      dependent_on: filterFormInitialValues.dependent_on || []
                                    }}
                                    onSubmit={handleFilterFormSubmit}
                                    nodes={nodes}
                                    sourceColumns={sourceColumns}
                                    onClose={() => setShowFilterForm(false)}
                                    pipelineDtl={pipelineJson}
                                    currentNodeId={`filter_${filterName || 'condition'}`}
                                    edges={edges}
                                    isDialog={false}
                                  />
                                ) : (
                                  <div className="flex justify-center items-center p-4">
                                    <div className="animate-spin h-6 w-6 border-2 border-black border-t-transparent rounded-full"></div>
                                    <span className="ml-2">Loading filter form...</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {showSchemaForm && (
                              <div className="mt-4 rounded-lg bg-white">
                                <div className="flex justify-between items-center px-5 py-3 border-b border-gray-100 bg-white">
                                  <div className="flex items-center gap-3">
                                    <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-black to-black flex items-center justify-center">
                                      <span className="text-white text-sm font-medium">S</span>
                                    </div>
                                    <h2 className="text-lg font-medium text-gray-800">
                                      Schema Transformation
                                    </h2>
                                  </div>
                                </div>
                                <div className="py-4">
                                  {/* Use CreateFormFormik directly for schema transformation */}
                                  {schemaTransformationSchema ? (
                                    <CreateFormFormik
                                      schema={{
                                        ...schemaTransformationSchema,
                                        initialValues: {
                                          name: 'schema_transformation',
                                          derived_fields: [{ name: '', expression: '' }],
                                          dependent_on: schemaFormInitialValues.dependent_on || []
                                        }
                                      }}
                                      initialValues={{
                                        name: 'schema_transformation',
                                        derived_fields: [{ name: '', expression: '' }],
                                        dependent_on: schemaFormInitialValues.dependent_on || []
                                      }}
                                      onSubmit={handleSchemaFormSubmit}
                                      nodes={nodes}
                                      sourceColumns={sourceColumns}
                                      onClose={() => setShowSchemaForm(false)}
                                      pipelineDtl={pipelineJson}
                                      currentNodeId={`schema_${schemaName || 'transformation'}`}
                                      edges={edges}
                                      isDialog={false}
                                    />
                                  ) : (
                                    <div className="flex justify-center items-center p-4">
                                      <div className="animate-spin h-6 w-6 border-2 border-black border-t-transparent rounded-full"></div>
                                      <span className="ml-2">Loading schema transformation form...</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                          {showDependencySelection && (
                            <div className="mt-4 rounded-lg bg-white p-4">
                              <h3 className="text-lg font-medium mb-2">Select Dependency</h3>
                              <div className="flex flex-col space-y-2">
                                {dependencyOptions.map((option, index) => (
                                  <button
                                    key={index}
                                    className="px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded-md text-left"
                                    onClick={() => handleDependencySelection(option.value)}
                                  >
                                    {option.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {showWriterForm && (
                            <div className="mt-4 rounded-lg bg-white">
                              <TargetPopUp
                                isOpen={false} // Use inline mode
                                onClose={() => setShowWriterForm(false)}
                                initialData={writerFormInitialValues}
                                onSourceUpdate={handleTargetUpdate}
                                nodeId={`target_${targetName || 'output'}`}
                                source={{
                                  title: targetName || 'output_data',
                                  source: {
                                    name: targetName || 'output_data',
                                    target_type: targetConfig.type,
                                    file_type: targetConfig.fileFormat,
                                    load_mode: targetConfig.customConfig?.loadMode || 'append',
                                    connection: {
                                      connection_type: targetConfig.connectionType,
                                      file_path_prefix: targetConfig.filePath
                                    }
                                  }
                                }}
                              />
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Suggestion buttons for guided flow */}
                    {message.role === "assistant" && i === messages.length - 1 && (
                      <div className="mt-3 flex flex-wrap">
                        {mode === 'create' && (
                          <>
                            {/* Description question buttons removed as we're skipping this step */}

                            {/* Description input suggestions removed as we're skipping this step */}

                            {/* Add data source buttons - appears immediately after starting pipeline creation */}
                            {step === 'source' && messages.length === 1 && message.content.includes("Please enter the name of a data source") && (
                              <div className="flex flex-col gap-2 w-full mt-2">
                                <div className="text-sm font-medium text-muted-foreground mb-1">Common Data Sources:</div>
                                <div className="grid grid-cols-2 gap-2">
                                  <SuggestionButton
                                    text="top_sales_regions"
                                    icon={<Database className="h-4 w-4 mr-2" />}
                                    onClick={() => {
                                      const dataSource = "top_sales_regions";
                                      addUserMessage(dataSource);
                                      // Build and update the pipeline template before handling the step
                                      const pipelineTemplate = generatePipelineTemplate();
                                      setPipelineJson(pipelineTemplate);
                                      console.log("Current pipeline template:", pipelineTemplate);
                                      handleSourceStep(dataSource);
                                    }}
                                    className="justify-start py-3 px-4 bg-card hover:bg-accent"
                                  />
                                  <SuggestionButton
                                    text="customer_records"
                                    icon={<Database className="h-4 w-4 mr-2" />}
                                    onClick={() => {
                                      const dataSource = "customer_records";
                                      addUserMessage(dataSource);
                                      // Build and update the pipeline template before handling the step
                                      const pipelineTemplate = generatePipelineTemplate();
                                      setPipelineJson(pipelineTemplate);
                                      console.log("Current pipeline template:", pipelineTemplate);
                                      handleSourceStep(dataSource);
                                    }}
                                    className="justify-start py-3 px-4 bg-card hover:bg-accent"
                                  />
                                </div>
                              </div>
                            )}

                            {step === 'source' && messages.length > 3 && selectedSources.length > 0 && (
                              <>
                                <SuggestionButton
                                  text="Add another source"
                                  icon={<Plus className="h-3 w-3 mr-1" />}
                                  onClick={() => {
                                    addUserMessage("Add another source");
                                    // Build and update the pipeline template before handling the step
                                    const pipelineTemplate = generatePipelineTemplate();
                                    setPipelineJson(pipelineTemplate);
                                    console.log("Current pipeline template:", pipelineTemplate);
                                    handleTransformationsStep("Add another source");
                                  }}
                                  className="justify-start py-2 px-3"
                                />
                                <SuggestionButton
                                  text="Continue to transformations"
                                  icon={<ChevronDown className="h-3 w-3" />}
                                  //tooltip="Proceed to the next step"
                                  onClick={() => {
                                    addUserMessage("Continue to transformations");
                                    // Explicitly set the step to 'transformations' and sub-step to 'select'
                                    setStep('transformations');
                                    setTransformationSubStep('select');
                                    // Build and update the pipeline template before handling the step
                                    const pipelineTemplate = generatePipelineTemplate();
                                    setPipelineJson(pipelineTemplate);
                                    console.log("Current pipeline template:", pipelineTemplate);
                                    handleTransformationsStep("Continue to transformations");
                                  }}
                                  className="justify-start py-2 px-3"
                                />
                              </>
                            )}

                            {step === 'transformations' && (
                              transformationSubStep === 'select' ||
                              messages[messages.length - 1]?.content?.includes("Please select an option from the buttons below") ||
                              messages[messages.length - 1]?.content?.includes("What type of transformation would you like to add") ||
                              messages[messages.length - 1]?.content?.includes("Which transformations would you like to add") ||
                              messages[messages.length - 1]?.content?.includes("Would you like to add another transformation")
                            ) && (
                                <div className="flex flex-col gap-2 w-full mt-2">
                                  <div className="text-sm font-medium text-muted-foreground mb-1">Select Transformation(s):</div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <SuggestionButton
                                      text="Filter Transformation"
                                      icon={<Filter className="h-4 w-4 mr-2" />}
                                      onClick={async () =>  {
                                        addUserMessage("Filter Transformation");
                                        
                                        // Add filter to transformations
                                        const newTransformations = [...transformations];
                                        if (!newTransformations.includes('filter')) {
                                          newTransformations.push('filter');
                                        }
                                        setTransformations(newTransformations);
                                        
                                        // Get existing nodes for dependency selection from the pipeline template
                                        const existingNodes = getExistingNodesFromTemplate();
                                        
                                        // Set the transformation sub-step to filter_dependency
                                        setTransformationSubStep('filter_dependency');
                                        
                                        // Create a message with dependency options
                                        let dependencyMessage = "After which step would you like to add this filter? Please select from the options below:";
                                        
                                        // Add the dependency selection options as buttons
                                        const dependencyButtons = existingNodes.map((node, index) => ({
                                          label: `${index + 1}. ${node}`,
                                          value: node
                                        }));
                                        
                                        // Set the dependency options
                                        setDependencyOptions(dependencyButtons);
                                        
                                        // Generate buttons UI for each dependency option
                                        const dependencyButtonsUI = dependencyButtons.map((option, index) => (
                                          <SuggestionButton
                                            key={`dependency-${index}`}
                                            text={option.label}
                                            onClick={() => {
                                              addUserMessage(option.label);
                                              handleDependencySelection(option.value);
                                            }}
                                            className="justify-start py-2 px-3 bg-card hover:bg-accent"
                                          />
                                        ));
                                        
                                        // If no dependency options are available, add a default option for the first reader
                                        if (dependencyButtonsUI.length === 0 && selectedSources.length > 0) {
                                          const defaultNode = `read_${selectedSources[0].data_src_name}`;
                                          dependencyButtonsUI.push(
                                            <SuggestionButton
                                              key="default-dependency"
                                              text={`1. ${defaultNode}`}
                                              onClick={() => {
                                                addUserMessage(`1. ${defaultNode}`);
                                                handleDependencySelection(defaultNode);
                                              }}
                                              className="justify-start py-2 px-3 bg-card hover:bg-accent"
                                            />
                                          );
                                        }
                                        
                                        // Log the dependency options for debugging
                                        console.log("Filter dependency options:", {
                                          existingNodes,
                                          dependencyButtons,
                                          selectedSources,
                                          transformations
                                        });
                                        
                                        // Add the message with dependency buttons
                                        addAssistantMessage(dependencyMessage, dependencyButtonsUI);
                                        
                                        // Build and update the pipeline template
                                        const pipelineTemplate = generatePipelineTemplate();
                                        setPipelineJson(pipelineTemplate);
                                        console.log("Current pipeline template:", pipelineTemplate);
                                      }}
                                      className="justify-start py-3 px-4 bg-card hover:bg-accent"
                                    />
                                    <SuggestionButton
                                      text="Schema Transformation"
                                      icon={<Database className="h-4 w-4 mr-2" />}
                                      onClick={() => {
                                        addUserMessage("Schema Transformation");
                                        
                                        // Add schema to transformations
                                        const newTransformations = [...transformations];
                                        if (!newTransformations.includes('schema')) {
                                          newTransformations.push('schema');
                                        }
                                        setTransformations(newTransformations);
                                        
                                        // Get existing nodes for dependency selection from the pipeline template
                                        const existingNodes = getExistingNodesFromTemplate();
                                        
                                        // Set the transformation sub-step to schema_dependency
                                        setTransformationSubStep('schema_dependency');
                                        
                                        // Create a message with dependency options
                                        let dependencyMessage = "After which step would you like to add this schema transformation? Please select from the options below:";
                                        
                                        // Add the dependency selection options as buttons
                                        const dependencyButtons = existingNodes.map((node, index) => ({
                                          label: `${index + 1}. ${node}`,
                                          value: node
                                        }));
                                        
                                        // Set the dependency options
                                        setDependencyOptions(dependencyButtons);
                                        
                                        // Generate buttons UI for each dependency option
                                        const dependencyButtonsUI = dependencyButtons.map((option, index) => (
                                          <SuggestionButton
                                            key={`dependency-${index}`}
                                            text={option.label}
                                            onClick={() => {
                                              addUserMessage(option.label);
                                              handleDependencySelection(option.value);
                                            }}
                                            className="justify-start py-2 px-3 bg-card hover:bg-accent"
                                          />
                                        ));
                                        
                                        // If no dependency options are available, add a default option for the first reader
                                        if (dependencyButtonsUI.length === 0 && selectedSources.length > 0) {
                                          const defaultNode = `read_${selectedSources[0].data_src_name}`;
                                          dependencyButtonsUI.push(
                                            <SuggestionButton
                                              key="default-dependency"
                                              text={`1. ${defaultNode}`}
                                              onClick={() => {
                                                addUserMessage(`1. ${defaultNode}`);
                                                handleDependencySelection(defaultNode);
                                              }}
                                              className="justify-start py-2 px-3 bg-card hover:bg-accent"
                                            />
                                          );
                                        }
                                        
                                        // Log the dependency options for debugging
                                        console.log("Schema dependency options:", {
                                          existingNodes,
                                          dependencyButtons,
                                          selectedSources,
                                          transformations
                                        });
                                        
                                        // Add the message with dependency buttons
                                        addAssistantMessage(dependencyMessage, dependencyButtonsUI);
                                        
                                        // Build and update the pipeline template
                                        const pipelineTemplate = generatePipelineTemplate();
                                        setPipelineJson(pipelineTemplate);
                                        console.log("Current pipeline template:", pipelineTemplate);
                                      }}
                                      className="justify-start py-3 px-4 bg-card hover:bg-accent"
                                    />
                                    <SuggestionButton
                                      text="Target (Skip Transformations)"
                                      icon={<FileText className="h-4 w-4 mr-2" />}
                                      onClick={() => {
                                        addUserMessage("Target - Skip transformations not needed");
                                        
                                        // Add target to transformations
                                        const newTransformations = [...transformations];
                                        if (!newTransformations.includes('target')) {
                                          newTransformations.push('target');
                                        }
                                        setTransformations(newTransformations);
                                        
                                        // Get existing nodes for dependency selection from the pipeline template
                                        const existingNodes = getExistingNodesFromTemplate();
                                        
                                        // Set the transformation sub-step to target_dependency
                                        setTransformationSubStep('target_dependency');
                                        
                                        // Create a message with dependency options
                                        let dependencyMessage = "After which step would you like to add the target? Please select from the options below:";
                                        
                                        // Add the dependency selection options as buttons
                                        const dependencyButtons = existingNodes.map((node, index) => ({
                                          label: `${index + 1}. ${node}`,
                                          value: node
                                        }));
                                        
                                        // Set the dependency options
                                        setDependencyOptions(dependencyButtons);
                                        
                                        // Show dependency selection message with buttons
                                        const dependencyButtonsUI = dependencyButtons.map((option, index) => (
                                          <SuggestionButton
                                            key={`dependency-${index}`}
                                            text={option.label}
                                            onClick={() => {
                                              addUserMessage(option.label);
                                              handleDependencySelection(option.value);
                                            }}
                                            className="justify-start py-2 px-3 bg-card hover:bg-accent"
                                          />
                                        ));
                                        
                                        addAssistantMessage(dependencyMessage, dependencyButtonsUI);
                                        
                                        // Build and update the pipeline template
                                        const pipelineTemplate = generatePipelineTemplate();
                                        setPipelineJson(pipelineTemplate);
                                        console.log("Current pipeline template:", pipelineTemplate);
                                      }}
                                      className="justify-start py-3 px-4 bg-card hover:bg-accent"
                                    />
                                    <SuggestionButton
                                      text="Add Both Transformations"
                                      icon={<Layers className="h-4 w-4 mr-2" />}
                                      onClick={() => {
                                        addUserMessage("Add both transformations");
                                        
                                        // Add both transformations
                                        const newTransformations = [...transformations];
                                        if (!newTransformations.includes('filter')) {
                                          newTransformations.push('filter');
                                        }
                                        if (!newTransformations.includes('schema')) {
                                          newTransformations.push('schema');
                                        }
                                        setTransformations(newTransformations);
                                        
                                        // Get existing nodes for dependency selection from the pipeline template
                                        const existingNodes = getExistingNodesFromTemplate();
                                        
                                        // Set the transformation sub-step to both_dependency
                                        setTransformationSubStep('both_dependency');
                                        
                                        // Create a message with dependency options
                                        let dependencyMessage = "After which step would you like to add these transformations? Please select from the options below:";
                                        
                                        // Add the dependency selection options as buttons
                                        const dependencyButtons = existingNodes.map((node, index) => ({
                                          label: `${index + 1}. ${node}`,
                                          value: node
                                        }));
                                        
                                        // Set the dependency options
                                        setDependencyOptions(dependencyButtons);
                                        
                                        // Generate buttons UI for each dependency option
                                        const dependencyButtonsUI = dependencyButtons.map((option, index) => (
                                          <SuggestionButton
                                            key={`dependency-${index}`}
                                            text={option.label}
                                            onClick={() => {
                                              addUserMessage(option.label);
                                              handleDependencySelection(option.value);
                                            }}
                                            className="justify-start py-2 px-3 bg-card hover:bg-accent"
                                          />
                                        ));
                                        
                                        // If no dependency options are available, add a default option for the first reader
                                        if (dependencyButtonsUI.length === 0 && selectedSources.length > 0) {
                                          const defaultNode = `read_${selectedSources[0].data_src_name}`;
                                          dependencyButtonsUI.push(
                                            <SuggestionButton
                                              key="default-dependency"
                                              text={`1. ${defaultNode}`}
                                              onClick={() => {
                                                addUserMessage(`1. ${defaultNode}`);
                                                handleDependencySelection(defaultNode);
                                              }}
                                              className="justify-start py-2 px-3 bg-card hover:bg-accent"
                                            />
                                          );
                                        }
                                        
                                        // Log the dependency options for debugging
                                        console.log("Both transformations dependency options:", {
                                          existingNodes,
                                          dependencyButtons,
                                          selectedSources,
                                          transformations
                                        });
                                        
                                        // Add the message with dependency buttons
                                        addAssistantMessage(dependencyMessage, dependencyButtonsUI);
                                        
                                        // Build and update the pipeline template
                                        const pipelineTemplate = generatePipelineTemplate();
                                        setPipelineJson(pipelineTemplate);
                                        console.log("Current pipeline template:", pipelineTemplate);
                                      }}
                                      className="justify-start py-3 px-4 bg-card hover:bg-accent"
                                    />
                                  </div>
                                </div>
                              )}


                            {step === 'transformations' && transformationSubStep === 'target_name' && (
                              <div className="flex flex-col gap-2 w-full mt-2">
                                <div className="text-sm font-medium text-muted-foreground mb-1">Suggested Output Names:</div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  <SuggestionButton
                                    text="processed_data"
                                    icon={<FileText className="h-4 w-4 mr-2" />}
                                    onClick={() => {
                                      // Set target name directly
                                      setTargetName("processed_data");
                                      addUserMessage("processed_data");

                                      // If we have a source with connection config, ask if they want to use the same connection
                                      if (selectedSources.length > 0 && selectedSources[0].connection_config?.custom_metadata?.connection_type) {
                                        setTransformationSubStep('connection_choice');
                                        addAssistantMessage(
                                          `Would you like to use the same connection (${selectedSources[0].connection_config.custom_metadata.connection_type}) ` +
                                          `for your output? This will write the results to a table named "processed_data" in the same database.`
                                        );
                                      } else {
                                        // Skip to summary
                                        setTransformationSubStep('summary');

                                        // Build the final pipeline template
                                        const finalTemplate = generatePipelineTemplate();
                                        setPipelineJson(finalTemplate);

                                        // Show summary and ask for confirmation
                                        addAssistantMessage(
                                          `Great! I've configured your pipeline with the following details:\n\n` +
                                          `- Name: ${pipelineName}\n` +
                                          `- Description: ${pipelineDescription || "(none)"}\n` +
                                          `- Sources: ${selectedSources.map(s => s.data_src_name).join(", ")}\n` +
                                          `- Transformations: ${transformations.filter(t => t !== 'target').join(", ") || "(none)"}\n` +
                                          `- Output: processed_data\n\n` +
                                          `Would you like to create this pipeline now?`
                                        );

                                        setStep('confirm');
                                      }
                                    }}
                                    className="justify-start py-3 px-4 bg-card hover:bg-accent"
                                  />
                                  <SuggestionButton
                                    text="analysis_results"
                                    icon={<FileText className="h-4 w-4 mr-2" />}
                                    onClick={() => {
                                      // Set target name directly
                                      setTargetName("analysis_results");
                                      addUserMessage("analysis_results");

                                      // If we have a source with connection config, ask if they want to use the same connection
                                      if (selectedSources.length > 0 && selectedSources[0].connection_config?.custom_metadata?.connection_type) {
                                        setTransformationSubStep('connection_choice');
                                        addAssistantMessage(
                                          `Would you like to use the same connection (${selectedSources[0].connection_config.custom_metadata.connection_type}) ` +
                                          `for your output? This will write the results to a table named "analysis_results" in the same database.`
                                        );
                                      } else {
                                        // Skip to summary
                                        setTransformationSubStep('summary');

                                        // Build the final pipeline template
                                        const finalTemplate = generatePipelineTemplate();
                                        setPipelineJson(finalTemplate);

                                        // Show summary and ask for confirmation
                                        addAssistantMessage(
                                          `Great! I've configured your pipeline with the following details:\n\n` +
                                          `- Name: ${pipelineName}\n` +
                                          `- Description: ${pipelineDescription || "(none)"}\n` +
                                          `- Sources: ${selectedSources.map(s => s.data_src_name).join(", ")}\n` +
                                          `- Transformations: ${transformations.filter(t => t !== 'target').join(", ") || "(none)"}\n` +
                                          `- Output: analysis_results\n\n` +
                                          `Would you like to create this pipeline now?`
                                        );

                                        setStep('confirm');
                                      }
                                    }}
                                    className="justify-start py-3 px-4 bg-card hover:bg-accent"
                                  />
                                </div>
                              </div>
                            )}

                            {step === 'transformations' && transformationSubStep === 'connection_choice' && (
                              <div className="flex flex-col gap-2 w-full mt-2">
                                <div className="text-sm font-medium text-muted-foreground mb-1">Use Same Database Connection?</div>
                                <div className="grid grid-cols-2 gap-2">
                                  <SuggestionButton
                                    text="Yes, use same database"
                                    icon={<Check className="h-4 w-4 mr-2" />}
                                    onClick={() => {
                                      // Set connection choice directly
                                      setUseSourceConnection(true);
                                      addUserMessage("Yes");

                                      // Move to summary
                                      setTransformationSubStep('summary');

                                      // Build the final pipeline template
                                      const finalTemplate = generatePipelineTemplate();
                                      setPipelineJson(finalTemplate);

                                      // Show summary and ask for confirmation
                                      addAssistantMessage(
                                        `Great! I've configured your pipeline with the following details:\n\n` +
                                        `- Name: ${pipelineName}\n` +
                                        `- Description: ${pipelineDescription || "(none)"}\n` +
                                        `- Sources: ${selectedSources.map(s => s.data_src_name).join(", ")}\n` +
                                        `- Transformations: ${transformations.filter(t => t !== 'target').join(", ") || "(none)"}\n` +
                                        `- Output: ${targetName || "output_data"} (Database)\n\n` +
                                        `Would you like to create this pipeline now?`
                                      );

                                      setStep('confirm');
                                    }}
                                    className="justify-start py-3 px-4 bg-card hover:bg-accent"
                                  />
                                  <SuggestionButton
                                    text="No, use file output"
                                    icon={<X className="h-4 w-4 mr-2" />}
                                    onClick={() => {
                                      // Set connection choice directly
                                      setUseSourceConnection(false);
                                      addUserMessage("No");

                                      // Move to summary
                                      setTransformationSubStep('summary');

                                      // Build the final pipeline template
                                      const finalTemplate = generatePipelineTemplate();
                                      setPipelineJson(finalTemplate);

                                      // Show summary and ask for confirmation
                                      addAssistantMessage(
                                        `Great! I've configured your pipeline with the following details:\n\n` +
                                        `- Name: ${pipelineName}\n` +
                                        `- Description: ${pipelineDescription || "(none)"}\n` +
                                        `- Sources: ${selectedSources.map(s => s.data_src_name).join(", ")}\n` +
                                        `- Transformations: ${transformations.filter(t => t !== 'target').join(", ") || "(none)"}\n` +
                                        `- Output: ${targetName || "output_data"} (File)\n\n` +
                                        `Would you like to create this pipeline now?`
                                      );

                                      setStep('confirm');
                                    }}
                                    className="justify-start py-3 px-4 bg-card hover:bg-accent"
                                  />
                                </div>
                              </div>
                            )}

                            {(step === 'transformations' && transformationSubStep === 'summary') || step === 'confirm' ? (
                              <div className="flex flex-col gap-2 w-full mt-2">
                                <div className="text-sm font-medium text-muted-foreground mb-1">Ready to Create?</div>
                                <div className="grid grid-cols-2 gap-2">
                                  <SuggestionButton
                                    text="Create Pipeline"
                                    icon={<Check className="h-4 w-4 mr-2" />}
                                    variant="default"
                                    onClick={() => {
                                      addUserMessage("Yes, create the pipeline");
                                      handleConfirmStep("Yes");
                                    }}
                                    className="justify-start py-3 px-4"
                                  />
                                  <SuggestionButton
                                    text="Start Over"
                                    icon={<X className="h-4 w-4 mr-2" />}
                                    onClick={() => {
                                      addUserMessage("No, I want to edit it");
                                      handleConfirmStep("No");
                                    }}
                                    className="justify-start py-3 px-4 bg-card hover:bg-accent"
                                  />
                                </div>
                              </div>
                            ) : null}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isProcessing && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex items-start gap-4 px-1">
                  <Avatar className="w-12 h-12 mr-0 flex-shrink-0 mt-1 justify-center bg-gradient-to-br from-primary/20 to-blue-300/30 border border-slate-100 shadow-sm">
                    <AvatarImage src={imageSrc} className="object-contain object-center h-full w-full p-2 drop-shadow-sm" />
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col max-w-[85%]">
                    <div className="rounded-2xl px-4 py-3 bg-card border border-border/40 shadow-sm">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-primary/30 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-primary/30 rounded-full animate-bounce delay-150"></div>
                        <div className="w-2 h-2 bg-primary/30 rounded-full animate-bounce delay-300"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        )}

        <div className="p-4 bg-background/70 backdrop-blur-md border-t">
          <AIChatInput
            input={input}
            onChange={setInput}
            onSend={handleSend}
            placeholder={mode === 'create' ? "Reply to create your pipeline..." : "Ask about your pipeline..."}
            disabled={isProcessing}
          />
        </div>
      </div>
    </>
  );
};