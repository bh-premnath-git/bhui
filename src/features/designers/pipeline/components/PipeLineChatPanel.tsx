import { useState, useEffect, useRef, ReactNode } from "react";
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
import { Plus, MessageSquare, ChevronDown, Check, X, Filter, Database, FileText, Layers } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { CATALOG_API_PORT } from "@/config/platformenv";
import SchemaFormLoader from "./SchemaFormLoader";


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
  imageSrc="/assets/ai/ai.svg",
  onPipelineCreated,
  className = ""
}: any) => {
  const { messages, addUserMessage, addAssistantMessage, clearMessages, updateLastAssistantMessage } = useChatMessages();
  const [input, setInput] = useState("");
  const { selectedPipeline } = useAppSelector((state) => state.pipeline);
  const reactFlowInstance = useReactFlow();
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const { setPipelineJson, setNodes, setEdges, setFormStates } = usePipelineContext();
  const [isNewChat, setIsNewChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Pipeline creation state
  const [mode, setMode] = useState<'chat' | 'create'>('chat');
  const [step, setStep] = useState<'name' | 'source' | 'transformations' | 'confirm'>('name');
  const [pipelineName, setPipelineName] = useState('');
  const [pipelineDescription, setPipelineDescription] = useState('');
  const [selectedSources, setSelectedSources] = useState<any[]>([]);
  const [transformations, setTransformations] = useState<string[]>([]);
  
  // Target configuration state
  const [targetConfig, setTargetConfig] = useState<{
    type: 'Database' | 'File' | 'Custom';
    connectionType: string;
    schema?: string;
    database?: string;
    filePath?: string;
    fileFormat?: string;
    customConfig?: Record<string, any>;
  }>({
    type: 'File',
    connectionType: 'Local',
    filePath: 'examples/',
    fileFormat: 'CSV'
  });

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
    const pipelineTemplate = buildPipelineTemplate();
    setPipelineJson(pipelineTemplate);
  };

  // Common function to build the pipeline template based on current state
  // This function follows the schema defined in pipeline_template.json
  const buildPipelineTemplate = () => {
    // Generate pipeline JSON based on current state
    const pipelineTemplate = {
      "$schema": "https://json-schema.org/draft-07/schema#",
      "name": pipelineName || "New Pipeline",
      "description": pipelineDescription || "",
      "version": "1.0",
      "parameters": [],
      "mode": "DEBUG",
      "connections": {},
      "sources": {},
      "targets": {},
      "transformations": []
    };

    // Add connections
    const connections: Record<string, any> = {};
    selectedSources.forEach((source: any) => {
      const sourceId = `connection_${source.data_src_id}`;
      if (source.connection_config?.custom_metadata?.connection_type) {
        // Database connection
        const connectionType = source.connection_config.custom_metadata.connection_type;
        connections[sourceId] = {
          "name": `${source.data_src_name}_connection`,
          "connection_type": connectionType,
          "schema": source.connection_config.custom_metadata.schema || "",
          "database": source.connection_config.custom_metadata.database || "",
          "secret_name": source.connection_config.secret_name || "default_secret"
        };
      } else {
        // File connection
        connections[sourceId] = {
          "name": `${source.data_src_name}_connection`,
          "connection_type": "Local",
          "file_path_prefix": source.file_path_prefix || `examples/`
        };
      }
    });
    pipelineTemplate.connections = connections;

    // Add sources - build step by step based on selected sources
    const sources: Record<string, any> = {};
    selectedSources.forEach((source: any) => {
      const sourceId = `source_${source.data_src_id}`;
      const connectionId = `connection_${source.data_src_id}`;
      
      if (source.connection_config?.custom_metadata?.connection_type) {
        // Database source
        sources[sourceId] = {
          "name": `input_${source.data_src_name}`,
          "source_type": "Database",
          "file_name": source.data_src_name,
          "data_src_id": source.data_src_id.toString(),
          "connection": connections[connectionId]
        };
      } else {
        // File source
        sources[sourceId] = {
          "name": `input_${source.data_src_name}`,
          "source_type": "File",
          "file_name": source.file_name || source.data_src_name,
          "data_src_id": source.data_src_id.toString(),
          "connection": connections[connectionId]
        };
      }
    });
    pipelineTemplate.sources = sources;

    // Only add target if the user has explicitly selected it as a transformation
    if (transformations.includes('target')) {
      // Add target - dynamically build based on target configuration
      const targetId = "target_output";
      const targetName = targetConfig.customConfig?.name || "output_data";
      
      // Build the target object based on the target configuration
      const targetObj: Record<string, any> = {
        "name": targetName,
        "target_type": targetConfig.type,
        "load_mode": targetConfig.customConfig?.loadMode || "overwrite"
      };
      
      // Add type-specific properties
      if (targetConfig.type === 'Database') {
        targetObj.table_name = targetName;
        targetObj.connection = {
          "name": `${targetName}_connection`,
          "connection_type": targetConfig.connectionType,
          "schema": targetConfig.schema || "",
          "database": targetConfig.database || "",
          "secret_name": targetConfig.customConfig?.secretName || "default_secret"
        };
        
        // If using source connection, copy connection details from source
        if (useSourceConnection && selectedSources.length > 0 && 
            selectedSources[0].connection_config?.custom_metadata?.connection_type) {
          const sourceId = `connection_${selectedSources[0].data_src_id}`;
          const sourceConnection = connections[sourceId];
          
          targetObj.connection = {
            "name": sourceConnection.name,
            "connection_type": sourceConnection.connection_type,
            "schema": sourceConnection.schema,
            "database": sourceConnection.database,
            "secret_name": sourceConnection.secret_name
          };
        }
      } else if (targetConfig.type === 'File') {
        targetObj.file_name = `${(targetName || pipelineName || "new_pipeline").toLowerCase().replace(/\s+/g, '_')}_output.${targetConfig.fileFormat?.toLowerCase() || 'csv'}`;
        targetObj.connection = {
          "name": "output_connection",
          "connection_type": targetConfig.connectionType || "Local",
          "file_path_prefix": targetConfig.filePath || "examples/"
        };
      } else if (targetConfig.type === 'Custom') {
        // For custom target types, use the customConfig directly
        Object.assign(targetObj, targetConfig.customConfig || {});
      }
      
      pipelineTemplate.targets[targetId] = targetObj;
    }

    // Add transformations
    const transformationsList = [];

    // Add reader transformations for each source
    const readerTransformations = selectedSources.map((source: any, index: number) => {
      const sourceId = `source_${source.data_src_id}`;
      const readerTransformation = {
        "name": `read_${source.data_src_name}`,
        "dependent_on": [],
        "transformation": "Reader",
        "source": pipelineTemplate.sources[sourceId],
        "read_options": {
          "header": true
        }
      };
      return readerTransformation;
    });
    transformationsList.push(...readerTransformations);

    // Add schema transformation if selected
    if (transformations.includes('schema')) {
      transformationsList.push({
        "name": "schema_transformation",
        "dependent_on": readerTransformations.map(t => t.name),
        "transformation": "SchemaTransformation",
        "derived_fields": [
          {
            "name": "full_name",
            "expression": "concat(`first_name`, ' ', `last_name`)"
          },
          {
            "name": "is_adult",
            "expression": "case when `age` >= 18 then 'Yes' else 'No' end"
          }
        ]
      });
    }

    // Add filter transformation if selected
    if (transformations.includes('filter')) {
      // Create filter transformation with user-provided condition or default
      transformationsList.push({
        "name": "filter_transformation",
        "dependent_on": transformations.includes('schema') 
          ? ["schema_transformation"] 
          : readerTransformations.map(t => t.name),
        "transformation": "Filter",
        "condition": filterCondition || "age >= 18"
      });
    }

    // Add writer transformation only if target is selected
    if (transformations.includes('target') && pipelineTemplate.targets["target_output"]) {
      const lastTransformationName = transformationsList.length > 0 
        ? transformationsList[transformationsList.length - 1].name 
        : readerTransformations.map(t => t.name);
      
      transformationsList.push({
        "name": "write_output",
        "dependent_on": Array.isArray(lastTransformationName) ? lastTransformationName : [lastTransformationName],
        "transformation": "Target",
        "target": pipelineTemplate.targets["target_output"],
        "write_options": {
          "createDisposition": "CREATE_IF_NEEDED",
          "writeMethod": "APPEND",
          "header": true,
          "sep": ","
        },
        "file_type": targetConfig.fileFormat || "CSV"
      });
    }

    pipelineTemplate.transformations = transformationsList;

    return pipelineTemplate;
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
        console.log("Current pipeline template:", buildPipelineTemplate());
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

  const handleNameStep = async (input: string) => {
    // Extract pipeline name from user input
    const name = input.trim();
    setPipelineName(name);
    
    // Ask for description with yes/no options
    addAssistantMessage(`Great! Your pipeline will be named "${name}". Would you like to add a description for your pipeline? (Yes/No)`);
    
    // Move to description or source step based on next user input
    setStep('source');
    
    // Build and update the pipeline template
    const pipelineTemplate = buildPipelineTemplate();
    setPipelineJson(pipelineTemplate);
  };

  const handleSourceStep = async (input: string) => {
    const userInput = input.toLowerCase().trim();
    console.log(userInput)
    // Check if user wants to move to transformations
    if (userInput.includes('continue') || userInput.includes('next') || userInput.includes('transformation')) {
      setStep('transformations');
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
      const response:any = await apiService.get({
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
        const sources: any[] = response;
        
        // Get the first source
        const selectedSource:any = sources[0];
        console.log(selectedSource);
        
        // Store the source data for the form
        setCurrentSourceData(selectedSource);
        
        // Log the source data for debugging
        console.log("Selected source data:", selectedSource);
        
        // Determine if it's a relational or file source
        const isRelational = selectedSource.connection_config.custom_metadata.connection_type =="S3" || selectedSource.connection_config.custom_metadata.connection_type =="Local" ? false : true;
        
        // Create initial values for the reader form
        const readerInitialValues:any = {
          reader_name: selectedSource.data_src_name,
          source: {
            type: isRelational ? 'Relational' : 'File',
            file_path:isRelational? null: selectedSource.file_path_prefix || selectedSource.file_path || `examples/${selectedSource.data_src_name}.csv`,
            data_src_id:selectedSource?.data_src_id,
            connection: selectedSource.connection_config.custom_metadata
          },
          file_type:isRelational?null: selectedSource.file_type || 'CSV',
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
        
        // Log the form values for debugging
        console.log("Reader form initial values:", readerInitialValues);
        
        setReaderFormInitialValues(readerInitialValues);
        setShowReaderForm(true);
        
        addAssistantMessage(
          `I found the data source "${selectedSource.data_src_name}". Please review and customize the reader configuration below:`
        );
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

  // State for additional pipeline configuration
  const [filterCondition, setFilterCondition] = useState('');
  const [targetName, setTargetName] = useState('');
  const [useSourceConnection, setUseSourceConnection] = useState(true);
  const [transformationSubStep, setTransformationSubStep] = useState<
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
  const [currentSourceData, setCurrentSourceData] = useState<any>(null);

  const handleTransformationsStep = async (input: string) => {
    const userInput = input.toLowerCase().trim();
    
    // Check if user wants to add another source
    if (userInput.includes('add another') || userInput.includes('search') || userInput.includes('new source')) {
      setStep('source');
      setTransformationSubStep('select');
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
      const pipelineTemplate = buildPipelineTemplate();
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
        
        setTransformations(newTransformations);
        
        // Handle the current selection
        if (currentSelection === 'filter') {
          // Show filter form
          setTransformationSubStep('filter_condition');
          setFilterFormInitialValues({ 
            condition: filterCondition || '',
            name: 'filter_transformation'
          });
          setShowFilterForm(true);
          addAssistantMessage("Great! Please define your filter condition below:");
        } else if (currentSelection === 'schema') {
          // Show schema form
          setTransformationSubStep('schema_form');
          setSchemaFormInitialValues({ 
            name: 'schema_transformation',
            derived_fields: [{ name: '', expression: '' }] 
          });
          setShowSchemaForm(true);
          addAssistantMessage("Great! Please define your schema transformations below:");
        } else if (currentSelection === 'both') {
          // Start with filter form first
          setTransformationSubStep('filter_condition');
          setFilterFormInitialValues({ 
            condition: filterCondition || '',
            name: 'filter_transformation'
          });
          setShowFilterForm(true);
          addAssistantMessage("Great! Let's start with the filter condition. Please define your filter condition below:");
        } else if (currentSelection === 'target') {
          // Show Writer form instead of asking questions
          setTransformationSubStep('target_form');
          
          // Prepare initial values for the Writer form
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
            }
          };
          
          setWriterFormInitialValues(initialValues);
          setShowWriterForm(true);
          addAssistantMessage("Please configure your output target below:");
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
        const updatedTemplate = buildPipelineTemplate();
        setPipelineJson(updatedTemplate);
        
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
          const finalTemplate = buildPipelineTemplate();
          setPipelineJson(finalTemplate);
          
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
          const finalTemplate = buildPipelineTemplate();
          setPipelineJson(finalTemplate);
          
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
        const fileTargetTemplate = buildPipelineTemplate();
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
        const dbTargetTemplate = buildPipelineTemplate();
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
        const finalTemplate = buildPipelineTemplate();
        setPipelineJson(finalTemplate);
        console.log("Final pipeline template with connection choice:", finalTemplate);
        
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
    setTimeout(() => {
      const pipelineTemplate = buildPipelineTemplate();
      setPipelineJson(pipelineTemplate);
    }, 0);
  };

  const handleConfirmStep = async (input: string) => {
    const userInput = input.toLowerCase().trim();
    
    if (userInput.includes('yes') || userInput.includes('create') || userInput.includes('confirm')) {
      // User confirmed, create the pipeline
      try {
        setIsProcessing(true);
        
        // Get the final pipeline template
        const finalTemplate = buildPipelineTemplate();
        
        // Log the final template for debugging
        console.log("Final pipeline template for creation:", finalTemplate);
        
        // Create the pipeline
        const response:any = await apiService.post({
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

  const handleNewChat = () => {
    clearMessages();
    setIsNewChat(true);
    setMode('chat');
    resetPipelineCreationState();
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
      
      // Note: The pipeline template is now automatically updated by the SchemaFormLoader component
      
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
    
    // Add a message to show the selected condition
    addUserMessage(`Filter condition: ${formData.condition}`);
    
    // Hide the form
    setShowFilterForm(false);
    
    // Return to transformation selection to allow adding more transformations
    setTransformationSubStep('select');
    
    // Ask if the user wants to add more transformations
    addAssistantMessage(
      "Great! The filter transformation has been added. Would you like to add another transformation?\n\n" +
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
    
    // Save schema transformation
    const derivedFields = formData.derived_fields.map((field: any) => 
      `${field.name}: ${field.expression}`
    ).join(', ');
    
    // Add a message to show the selected derived fields
    addUserMessage(`Schema transformation: ${derivedFields}`);
    
    // Hide the form
    setShowSchemaForm(false);
    
    // Return to transformation selection to allow adding more transformations
    setTransformationSubStep('select');
    
    // Ask if the user wants to add more transformations
    addAssistantMessage(
      "Great! The schema transformation has been added. Would you like to add another transformation?\n\n" +
      "1. Filter Transformation - Filter data based on conditions\n" +
      "2. Schema Transformation - Create new fields or modify existing ones\n" +
      "3. Target - Skip transformations not needed\n\n" +
      "Please select an option from the buttons below."
    );
  };
  
  // Handle writer form submission
  const handleWriterFormSubmit = (formData: any) => {
    console.log("Writer form submitted:", formData);
    
    // Save target configuration
    setTargetName(formData.target.target_name);
    setTargetConfig({
      type: formData.target.target_type,
      connectionType: formData.target.connection.connection_type,
      filePath: formData.target.connection.file_path_prefix,
      fileFormat: formData.file_type,
      customConfig: {
        name: formData.target.target_name,
        loadMode: formData.target.load_mode
      }
    });
    
    // Add a message to show the target configuration
    const targetType = formData.target.target_type;
    let targetDetails = '';
    
    if (targetType === 'File') {
      targetDetails = `${formData.file_type} file: ${formData.target.file_name}`;
    } else if (targetType === 'Relational') {
      targetDetails = `Database: ${formData.target.connection.database || 'default'}`;
    }
    
    // Add target to transformations if not already there
    if (!transformations.includes('target')) {
      const newTransformations = [...transformations, 'target'];
      setTransformations(newTransformations);
      console.log("Added target to transformations:", newTransformations);
    }
    
    // Update the pipeline template manually to ensure the target is added
    const updatedTemplate = buildPipelineTemplate();
    setPipelineJson(updatedTemplate);
    console.log("Updated pipeline template after writer form submission:", updatedTemplate);
    
    addUserMessage(`Target configuration: ${formData.target.target_name} (${targetDetails})`);
    
    // Hide the form
    setShowWriterForm(false);
    
    // Ask for more transformations instead of going directly to target
    setTransformationSubStep('select');
    addAssistantMessage(
      "Great! The target configuration has been added. Would you like to add another transformation?\n\n" +
      "1. Filter Transformation - Filter data based on conditions\n" +
      "2. Schema Transformation - Create new fields or modify existing ones\n" +
      "3. Target - Skip transformations not needed\n\n" +
      "Please select an option from the buttons below."
    );
    
    // Note: The pipeline template is now automatically updated by the SchemaFormLoader component
  };

  return (
    <>
      
      {/* Chat panel - always visible, not sliding */}
      <div 
        className={`h-full flex flex-col bg-background/95 backdrop-blur-md border-l border-border/50 shadow-lg opacity-100 transition-all duration-300 ${className}`}
      >
     
      
      {isNewChat || messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full py-8 space-y-6">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10">
            <img 
              src={imageSrc} 
              alt="AI" 
              className="w-8 h-8 transform -rotate-[40deg]"
            />
          </div>
          <div className="text-center space-y-1.5 max-w-sm">
            <p className="text-lg font-medium">How can I assist with your pipeline?</p>
            <p className="text-sm text-muted-foreground">
              Describe your pipeline needs or create a new pipeline
            </p>
            <div className="pt-4">
              <Button 
                onClick={startPipelineCreation}
                className="bg-primary text-white hover:bg-primary/90 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create New Pipeline
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
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "items-start gap-4 px-1"
                  }`}
                >
                  {message.role === "assistant" && (
                    <Avatar className="w-8 h-8 mr-0 flex-shrink-0 mt-1 justify-center">
                      <AvatarImage src={imageSrc} className="w-4 h-6 transform -rotate-[40deg]" />
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`flex flex-col ${
                      message.role === "user" ? "items-end" : "max-w-[85%]"
                    }`}
                  >
                    <div
                      className={`rounded-2xl px-4 py-3 transition-all duration-200 ${
                        message.role === "user"
                          ? "bg-green-600 text-white shadow-sm"
                          : "bg-card border border-border/40 shadow-sm hover:border-border/60"
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      
                      {/* Show inline forms after specific assistant messages */}
                      {message.role === "assistant" && i === messages.length - 1 && (
                        <>
                          {showReaderForm && message.content.includes("Please review and customize the reader configuration") && (
                            <SchemaFormLoader
                              schemaType="Reader"
                              initialValues={readerFormInitialValues}
                              onSubmit={handleReaderFormSubmit}
                              submitLabel="Save Reader Configuration"
                              updatePipelineTemplate={true}
                            />
                          )}
                          
                          {showFilterForm && message.content.includes("Please define your filter condition") && (
                            <SchemaFormLoader
                              schemaType="Filter"
                              initialValues={filterFormInitialValues}
                              onSubmit={handleFilterFormSubmit}
                              submitLabel="Apply Filter"
                              updatePipelineTemplate={true}
                            />
                          )}
                          
                          {showSchemaForm && (
                            message.content.includes("Please define your schema transformations") || 
                            transformationSubStep === 'schema_form'
                          ) && (
                            <SchemaFormLoader
                              schemaType="SchemaTransformation"
                              initialValues={schemaFormInitialValues}
                              onSubmit={handleSchemaFormSubmit}
                              submitLabel="Apply Schema Transformation"
                              updatePipelineTemplate={true}
                            />
                          )}
                          
                          {showWriterForm && message.content.includes("Please configure your output target below") && (
                            <SchemaFormLoader
                              schemaType="Writer"
                              initialValues={writerFormInitialValues}
                              onSubmit={handleWriterFormSubmit}
                              submitLabel="Save Target Configuration"
                              updatePipelineTemplate={true}
                            />
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
                              <div className="flex flex-col gap-3 w-full mt-3 bg-muted/30 p-3 rounded-lg border border-border/30">
                                <div className="text-sm font-medium text-foreground mb-1">Common Data Sources:</div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <SuggestionButton 
                                    text="top_sales_regions" 
                                    icon={<Database className="h-4 w-4" />}
                                    //tooltip="Sales data by region"
                                    onClick={() => {
                                      const dataSource = "top_sales_regions";
                                      addUserMessage(dataSource);
                                      // Build and update the pipeline template before handling the step
                                      const pipelineTemplate = buildPipelineTemplate();
                                      setPipelineJson(pipelineTemplate);
                                      console.log("Current pipeline template:", pipelineTemplate);
                                      handleSourceStep(dataSource);
                                    }}
                                    className="justify-start py-3 px-4 bg-card hover:bg-accent"
                                  />
                                  <SuggestionButton 
                                    text="customer_records" 
                                    icon={<Database className="h-4 w-4" />}
                                    //tooltip="Customer information database"
                                    onClick={() => {
                                      const dataSource = "customer_records";
                                      addUserMessage(dataSource);
                                      // Build and update the pipeline template before handling the step
                                      const pipelineTemplate = buildPipelineTemplate();
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
                                  icon={<Plus className="h-3 w-3" />}
                                  //tooltip="Include an additional data source"
                                  onClick={() => {
                                    addUserMessage("Add another source");
                                    // Build and update the pipeline template before handling the step
                                    const pipelineTemplate = buildPipelineTemplate();
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
                                    const pipelineTemplate = buildPipelineTemplate();
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
                              <div className="flex flex-col gap-3 w-full mt-3 bg-muted/30 p-3 rounded-lg border border-border/30">
                                <div className="text-sm font-medium text-foreground mb-1">Select Transformation(s):</div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <SuggestionButton 
                                    text="Filter Transformation" 
                                    icon={<Filter className="h-4 w-4" />}
                                    onClick={() => {
                                      addUserMessage("Filter Transformation");
                                      // Build and update the pipeline template before handling the step
                                      const pipelineTemplate = buildPipelineTemplate();
                                      setPipelineJson(pipelineTemplate);
                                      console.log("Current pipeline template:", pipelineTemplate);
                                      handleTransformationsStep("1. Filter Transformation");
                                    }}
                                    className="justify-start py-3 px-4 bg-card hover:bg-accent"
                                  />
                                  <SuggestionButton 
                                    text="Schema Transformation" 
                                    icon={<Database className="h-4 w-4" />}
                                    //tooltip="Modify data structure and add derived fields"
                                    onClick={() => {
                                      addUserMessage("Schema Transformation");
                                      // Build and update the pipeline template before handling the step
                                      const pipelineTemplate = buildPipelineTemplate();
                                      setPipelineJson(pipelineTemplate);
                                      console.log("Current pipeline template:", pipelineTemplate);
                                      handleTransformationsStep("2. Schema Transformation");
                                    }}
                                    className="justify-start py-3 px-4 bg-card hover:bg-accent"
                                  />
                                  <SuggestionButton 
                                    text="Target (Skip Transformations)" 
                                    icon={<FileText className="h-4 w-4" />}
                                    //tooltip="Proceed directly to output configuration"
                                    onClick={() => {
                                      addUserMessage("Target - Skip transformations not needed");
                                      // Build and update the pipeline template before handling the step
                                      const pipelineTemplate = buildPipelineTemplate();
                                      setPipelineJson(pipelineTemplate);
                                      console.log("Current pipeline template:", pipelineTemplate);
                                      handleTransformationsStep("3. Target");
                                    }}
                                    className="justify-start py-3 px-4 bg-card hover:bg-accent"
                                  />
                                  <SuggestionButton 
                                    text="Add Both Transformations" 
                                    icon={<Layers className="h-4 w-4" />}
                                    //tooltip="Include both filter and schema transformations"
                                    onClick={() => {
                                      addUserMessage("Add both transformations");
                                      // Build and update the pipeline template before handling the step
                                      const pipelineTemplate = buildPipelineTemplate();
                                      setPipelineJson(pipelineTemplate);
                                      console.log("Current pipeline template:", pipelineTemplate);
                                      handleTransformationsStep("Add both");
                                    }}
                                    className="justify-start py-3 px-4 bg-card hover:bg-accent"
                                  />
                                </div>
                              </div>
                            )}
                            
                            {step === 'transformations' && transformationSubStep === 'filter_condition' && (
                              <div className="flex flex-col gap-3 w-full mt-3 bg-muted/30 p-3 rounded-lg border border-border/30">
                                <div className="text-sm font-medium text-foreground mb-1">Common Filter Conditions:</div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <SuggestionButton 
                                    text="age >= 18" 
                                    icon={<Filter className="h-4 w-4" />}
                                    //tooltip="Filter for adults only"
                                    onClick={() => {
                                      // Set filter condition directly
                                      setFilterCondition("age >= 18");
                                      addUserMessage("age >= 18");
                                      
                                      // Build and update the pipeline template
                                      const pipelineTemplate = buildPipelineTemplate();
                                      setPipelineJson(pipelineTemplate);
                                      console.log("Current pipeline template:", pipelineTemplate);
                                      
                                      // If schema transformation is also selected, show the schema form
                                      if (transformations.includes('schema')) {
                                        addAssistantMessage("Now, please fill out the schema transformation form.");
                                      } else {
                                        // Otherwise, move to target name
                                        setTransformationSubStep('target_name');
                                        addAssistantMessage("Thanks! Now, what would you like to name your output dataset?");
                                      }
                                    }}
                                    className="justify-start py-3 px-4 bg-card hover:bg-accent"
                                  />
                                  <SuggestionButton 
                                    text="sales_amount > 1000" 
                                    icon={<Filter className="h-4 w-4" />}
                                    //tooltip="Filter for high-value sales"
                                    onClick={() => {
                                      // Set filter condition directly
                                      setFilterCondition("sales_amount > 1000");
                                      addUserMessage("sales_amount > 1000");
                                      
                                      // Build and update the pipeline template
                                      const pipelineTemplate = buildPipelineTemplate();
                                      setPipelineJson(pipelineTemplate);
                                      console.log("Current pipeline template:", pipelineTemplate);
                                      
                                      // If schema transformation is also selected, show the schema form
                                      if (transformations.includes('schema')) {
                                        addAssistantMessage("Now, please fill out the schema transformation form.");
                                      } else {
                                        // Otherwise, move to target name
                                        setTransformationSubStep('target_name');
                                        addAssistantMessage("Thanks! Now, what would you like to name your output dataset?");
                                      }
                                    }}
                                    className="justify-start py-3 px-4 bg-card hover:bg-accent"
                                  />
                                  <SuggestionButton 
                                    text="status = 'active'" 
                                    icon={<Filter className="h-4 w-4 mr-2" />}
                                    onClick={() => {
                                      // Set filter condition directly
                                      setFilterCondition("status = 'active'");
                                      addUserMessage("status = 'active'");
                                      
                                      // Build and update the pipeline template
                                      const pipelineTemplate = buildPipelineTemplate();
                                      setPipelineJson(pipelineTemplate);
                                      console.log("Current pipeline template:", pipelineTemplate);
                                      
                                      // If schema transformation is also selected, show the schema form
                                      if (transformations.includes('schema')) {
                                        addAssistantMessage("Now, please fill out the schema transformation form.");
                                      } else {
                                        // Otherwise, move to target name
                                        setTransformationSubStep('target_name');
                                        addAssistantMessage("Thanks! Now, what would you like to name your output dataset?");
                                      }
                                    }}
                                    className="justify-start py-3 px-4 bg-card hover:bg-accent"
                                  />
                                  <SuggestionButton 
                                    text="date_column >= '2023-01-01'" 
                                    icon={<Filter className="h-4 w-4 mr-2" />}
                                    onClick={() => {
                                      // Set filter condition directly
                                      setFilterCondition("date_column >= '2023-01-01'");
                                      addUserMessage("date_column >= '2023-01-01'");
                                      
                                      // Build and update the pipeline template
                                      const pipelineTemplate = buildPipelineTemplate();
                                      setPipelineJson(pipelineTemplate);
                                      console.log("Current pipeline template:", pipelineTemplate);
                                      
                                      // If schema transformation is also selected, show the schema form
                                      if (transformations.includes('schema')) {
                                        addAssistantMessage("Now, please fill out the schema transformation form.");
                                      } else {
                                        // Otherwise, move to target name
                                        setTransformationSubStep('target_name');
                                        addAssistantMessage("Thanks! Now, what would you like to name your output dataset?");
                                      }
                                    }}
                                    className="justify-start py-3 px-4 bg-card hover:bg-accent"
                                  />
                                </div>
                              </div>
                            )}
                            
                            {step === 'transformations' && transformationSubStep === 'target_name' && (
                              <div className="flex flex-col gap-3 w-full mt-3 bg-muted/30 p-3 rounded-lg border border-border/30">
                                <div className="text-sm font-medium text-foreground mb-1">Suggested Output Names:</div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                                        const finalTemplate = buildPipelineTemplate();
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
                                        const finalTemplate = buildPipelineTemplate();
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
                              <div className="flex flex-col gap-3 w-full mt-3 bg-muted/30 p-3 rounded-lg border border-border/30">
                                <div className="text-sm font-medium text-foreground mb-1">Use Same Database Connection?</div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                                      const finalTemplate = buildPipelineTemplate();
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
                                      const finalTemplate = buildPipelineTemplate();
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
                              <div className="flex flex-col gap-3 w-full mt-3 bg-muted/30 p-3 rounded-lg border border-border/30">
                                <div className="text-sm font-medium text-foreground mb-1">Ready to Create?</div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  <Avatar className="w-8 h-8 mr-0 flex-shrink-0 mt-1 justify-center">
                    <AvatarImage src={imageSrc} className="w-4 h-6 transform -rotate-[40deg]" />
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col max-w-[85%]">
                    <div className="rounded-2xl px-4 py-3 bg-card border border-border/40 shadow-sm">
                    <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce delay-150"></div>
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce delay-300"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        )}
        
        <div className="p-4 bg-background/80 backdrop-blur-md border-t border-border/30 shadow-sm">
          <div className="max-w-3xl mx-auto">
            <AIChatInput
              input={input}
              onChange={setInput}
              onSend={handleSend}
              placeholder={mode === 'create' ? "Reply to create your pipeline..." : "Ask about your pipeline..."}
              disabled={isProcessing}
            />
          </div>
        </div>
      </div>
    </>
  );
};