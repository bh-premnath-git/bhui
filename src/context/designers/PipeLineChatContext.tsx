import { createContext, useState, useEffect, useRef, useContext, useCallback, ReactNode, useMemo, useTransition } from "react";
import { Edge, Node, useReactFlow } from "reactflow";
import { useLocation } from "react-router-dom";
import { useChatMessages } from "@/hooks/useChatMessages";
import { usePipelineContext } from "@/context/designers/DataPipelineContext";
import { useAppDispatch } from "@/hooks/useRedux";
import { apiService } from '@/lib/api/api-service';
import { CATALOG_API_PORT } from "@/config/platformenv";
import { DataSource } from "@/types/data-catalog/dataCatalog";
import { buildPipelineTemplate, TransformationType } from "@/utils/pipelineTemplateUtils";
import { getConnectionConfigList } from "@/store/slices/dataCatalog/datasourceSlice";
import mdataJson from "@/pages/designers/data-pipeline/data/mdata.json";

// Define the context interface
interface PipeLineChatContextProps {
  // State
  input: string;
  setInput: (input: string) => void;
  messages: any[];
  isProcessing: boolean;
  pipelineJson: any;
  isNewChat: boolean;
  currentSourceData: any;
  foundSources: DataSource[];
  awaitingSourceSelection: boolean;
  sourceSuggestions: React.ReactNode[];
  sourceColumns: { name: string; dataType: string }[];
  mode: 'chat' | 'create';
  step: 'name' | 'source' | 'transformations' | 'confirm';
  pipelineName: string;
  pipelineDescription: string;
  selectedSources: any[];
  transformations: string[];
  targetConfig: any;
  transformationSubStep: 'select' |
    'filter_condition' |
    'schema_form' |
    'filter_dependency' |
    'schema_dependency' |
    'both_dependency' |
    'target_dependency' |
    'target_name' |
    'target_type' |
    'file_format' |
    'file_path' |
    'db_type' |
    'db_schema' |
    'db_name' |
    'connection_choice' |
    'summary' | 
    'target_form';
  showDependencySelection: boolean;
  dependencyOptions: any[];
  selectedDependency: string;
  useSourceConnection: boolean;
  filterCondition: string;
  targetName: string;
  activeForm: string | null;
  formInitialValues: Record<string, any>;
  filterSchema: any;
  schemaTransformationSchema: any;
  filterName: string;
  schemaName: string;
  isPending: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  nodes: Node[];
  edges: Edge[];

  // Functions
  addUserMessage: (message: string) => void;
  addAssistantMessage: (message: string) => void;
  clearMessages: () => void;
  updateLastAssistantMessage: (message: string) => void;
  setPipelineJson: (json: any) => void;
  setIsNewChat: (isNew: boolean) => void;
  setCurrentSourceData: (data: any) => void;
  setFoundSources: (sources: DataSource[]) => void;
  setAwaitingSourceSelection: (awaiting: boolean) => void;
  setSourceSuggestions: (suggestions: React.ReactNode[]) => void;
  setMode: (mode: 'chat' | 'create') => void;
  setStep: (step: 'name' | 'source' | 'transformations' | 'confirm') => void;
  setPipelineName: (name: string) => void;
  setPipelineDescription: (description: string) => void;
  setSelectedSources: (sources: any[]) => void;
  setTransformations: (transformations: string[]) => void;
  setTargetConfig: (config: any) => void;
  setTransformationSubStep: React.Dispatch<React.SetStateAction<'select' |
    'filter_condition' |
    'schema_form' |
    'filter_dependency' |
    'schema_dependency' |
    'both_dependency' |
    'target_dependency' |
    'target_name' |
    'target_type' |
    'file_format' |
    'file_path' |
    'db_type' |
    'db_schema' |
    'db_name' |
    'connection_choice' |
    'summary' | 
    'target_form'>>;
  setShowDependencySelection: (show: boolean) => void;
  setDependencyOptions: (options: any[]) => void;
  setSelectedDependency: (dependency: string) => void;
  setUseSourceConnection: (use: boolean) => void;
  setFilterCondition: (condition: string) => void;
  setTargetName: (name: string) => void;
  setActiveForm: (form: string | null) => void;
  setFormInitialValues: (values: Record<string, any> | ((prev: Record<string, any>) => Record<string, any>)) => void;
  setFilterSchema: (schema: any) => void;
  setSchemaTransformationSchema: (schema: any) => void;
  setFilterName: (name: string) => void;
  setSchemaName: (name: string) => void;
  startTransition: (callback: () => void) => void;
  handleSend: () => Promise<void>;
  resetPipelineCreationState: () => void;
  startPipelineCreation: () => void;
  generatePipelineTemplate: () => any;
  handleSourceStep: (input: string) => Promise<void>;
  processSelectedSource: (selectedSource: any) => void;
  handleTransformationsStep: (input: string) => Promise<void>;
  handleConfirmStep: (input: string) => Promise<void>;
  handleDependencySelection: (dependency: string) => void;
  updatePipelineWithDependency: (dependency: string, transformationType: string) => void;
  handleReaderOptionsUpdate: (sourceData: any) => void;
  handleTargetUpdate: (sourceData: any) => void;
  handleReaderFormSubmit: (formData: any) => void;
  handleFilterFormSubmit: (formData: any) => void;
  handleSchemaFormSubmit: (formData: any) => void;
}

// Create the context with a default value
const PipeLineChatContext = createContext<PipeLineChatContextProps | undefined>(undefined);

// Provider component
interface PipeLineChatProviderProps {
  children: ReactNode;
  onClose: () => void;
  onPipelineCreated?: (pipelineId: string) => void;
  imageSrc?: string;
}

export const PipeLineChatProvider = ({
  children,
  onClose,
  onPipelineCreated,
  imageSrc = "/assets/ai/ai.svg",
}: PipeLineChatProviderProps) => {
  const { messages, addUserMessage, addAssistantMessage, clearMessages, updateLastAssistantMessage } = useChatMessages();
  const [input, setInput] = useState("");
  const reactFlowInstance = useReactFlow();
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const { setPipelineJson: originalSetPipelineJson, pipelineJson, makePipeline } = usePipelineContext();
  const dispatch = useAppDispatch();

  // Create a custom setPipelineJson function that also calls makePipeline
  const setPipelineJson = useCallback((newPipelineJson: any) => {
    // First update the pipeline JSON using the original function
    originalSetPipelineJson(newPipelineJson);
    
    // Then call makePipeline with the new pipeline JSON
    if (newPipelineJson !== null && newPipelineJson !== undefined) {
      console.log(newPipelineJson, "pipelineJson updated and calling makePipeline");
      makePipeline({ pipeline_definition: newPipelineJson });
    }
  }, [originalSetPipelineJson, makePipeline]);
  
  // Get nodes and edges for the CreateForm component
  const nodes = reactFlowInstance.getNodes();
  const edges = reactFlowInstance.getEdges();
  
  // State declarations
  const [isNewChat, setIsNewChat] = useState(false);
  const [currentSourceData, setCurrentSourceData] = useState<any>(null);
  const [foundSources, setFoundSources] = useState<DataSource[]>([]);
  const [awaitingSourceSelection, setAwaitingSourceSelection] = useState(false);
  const [sourceSuggestions, setSourceSuggestions] = useState<React.ReactNode[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Source columns for the CreateForm component
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
    connection?: any;
    customConfig?: any;
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
  const [transformationSubStep, setTransformationSubStep] = useState<
    'select' |
    'filter_condition' |
    'schema_form' |
    'filter_dependency' |
    'schema_dependency' |
    'both_dependency' |
    'target_dependency' |
    'target_name' |
    'target_type' |
    'file_format' |
    'file_path' |
    'db_type' |
    'db_schema' |
    'db_name' |
    'connection_choice' |
    'summary' | 
    'target_form'
  >('select');

  // State for inline forms - using a single state for form visibility and initial values
  const [activeForm, setActiveForm] = useState<string | null>(null); // 'filter', 'schema', 'reader', 'writer' or null
  const [formInitialValues, setFormInitialValues] = useState<Record<string, any>>({
    filter: {},
    schema: {},
    reader: {},
    writer: {}
  });
  
  // Schema state for transformation forms
  const [filterSchema, setFilterSchema] = useState<any>(null);
  const [schemaTransformationSchema, setSchemaTransformationSchema] = useState<any>(null);
  const [filterName, setFilterName] = useState<string>('');
  const [schemaName, setSchemaName] = useState<string>('');
  
  // Add useTransition hook for smoother UI updates
  const [isPending, startTransition] = useTransition();

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

  const resetPipelineCreationState = useCallback(() => {
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
    setActiveForm(null);
    setFormInitialValues({
      filter: {},
      schema: {},
      reader: {},
      writer: {}
    });
    setCurrentSourceData(null);
    
    // Reset source selection state
    setFoundSources([]);
    setAwaitingSourceSelection(false);
    setSourceSuggestions([]);
    
    // Reset dependency selection state
    setShowDependencySelection(false);
    setDependencyOptions([]);
    setSelectedDependency('');
  }, []);

  const startPipelineCreation = useCallback(() => {
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
  }, [clearMessages, setPipelineJson, addAssistantMessage]);

  // Helper function to call the utility function with the current state
  const generatePipelineTemplate = useCallback(() => {
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
  }, [pipelineName, pipelineDescription, selectedSources, transformations, targetConfig, useSourceConnection, filterCondition]);

  const processSelectedSource = useCallback((selectedSource: any) => {
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
    setSelectedSources(prevSources => [...prevSources, selectedSource]);

    // Log the form values for debugging
    console.log("Reader form initial values:", readerInitialValues);

    setFormInitialValues(prev => ({
      ...prev,
      reader: readerInitialValues
    }));
    setActiveForm('reader');

    addAssistantMessage(
      `I'll use the data source "${selectedSource.data_src_name}". Please review and customize the reader configuration below:`
    );
  }, [addAssistantMessage, setCurrentSourceData, setSelectedSources, setFormInitialValues, setActiveForm]);

  const handleSourceStep = useCallback(async (input: string) => {
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
  }, [
    awaitingSourceSelection, foundSources, processSelectedSource, addAssistantMessage,
    generatePipelineTemplate, setPipelineJson, setAwaitingSourceSelection, setFoundSources,
    setSourceSuggestions, setIsProcessing, setStep
  ]);

  const handleTransformationsStep = useCallback(async (input: string) => {
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
          if (!newTransformations.includes(TransformationType.SCHEMA)) {
            newTransformations.push(TransformationType.SCHEMA);
          }
        }

        if (userInput.includes('filter') || userInput.includes('1')) {
          currentSelection = 'filter';
          if (!newTransformations.includes(TransformationType.FILTER)) {
            newTransformations.push(TransformationType.FILTER);
          }
        }

        if (userInput.includes('both') || userInput.includes('all')) {
          currentSelection = 'both';
          if (!newTransformations.includes(TransformationType.SCHEMA)) {
            newTransformations.push(TransformationType.SCHEMA);
          }
          if (!newTransformations.includes(TransformationType.FILTER)) {
            newTransformations.push(TransformationType.FILTER);
          }
        }

        // Check if user wants to move to target
        if (userInput.includes('target') || userInput.includes('3') || userInput.includes('skip') ||
          userInput.includes('complete') || userInput.includes('finish')) {
          currentSelection = 'target';
          // Add target to transformations
          if (!newTransformations.includes(TransformationType.TARGET)) {
            newTransformations.push(TransformationType.TARGET);
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
        if (transformations.includes(TransformationType.SCHEMA)) {
          existingNodes.push('schema_transformation');
        }
        if (transformations.includes(TransformationType.FILTER)) {
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
            setFormInitialValues(prev => ({
              ...prev,
              filter: {
                condition: filterCondition || '',
                name: 'filter_transformation',
                dependent_on: existingNodes.length > 0 ? [existingNodes[existingNodes.length - 1]] : []
              }
            }));
            setFilterName('filter_transformation');
              
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
            setFormInitialValues(prev => ({
              ...prev,
              schema: {
                name: 'schema_transformation',
                derived_fields: [{ name: '', expression: '' }],
                dependent_on: [] // Empty array - will be filled when user selects dependency
              }
            }));
            setSchemaName('schema_transformation');
              
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
            setFormInitialValues(prev => ({
              ...prev,
              filter: {
                condition: filterCondition || '',
                name: 'filter_transformation',
                dependent_on: existingNodes.length > 0 ? [existingNodes[existingNodes.length - 1]] : []
              }
            }));
            setFilterName('filter_transformation');
            
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
  
            setFormInitialValues(prev => ({
              ...prev,
              writer: initialValues
            }));
            
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
  }, [
    addAssistantMessage, filterCondition, generatePipelineTemplate, pipelineDescription, 
    pipelineName, pipelineJson, selectedSources, setPipelineJson, startTransition, 
    targetConfig, targetName, transformationSubStep, transformations, 
    setActiveForm, setDependencyOptions, setFilterCondition, setFilterName, 
    setFormInitialValues, setSchemaName, setSelectedSources, setShowDependencySelection, 
    setStep, setTargetConfig, setTargetName, setTransformationSubStep, 
    setTransformations, setUseSourceConnection, filterSchema, schemaTransformationSchema
  ]);

  const handleConfirmStep = useCallback(async (input: string) => {
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
  }, [
    addAssistantMessage, generatePipelineTemplate, onClose, onPipelineCreated, 
    pipelineDescription, pipelineName, resetPipelineCreationState, setIsProcessing, setStep
  ]);
  
  const handleSend = useCallback(async () => {
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
  }, [input, addUserMessage, mode, step, generatePipelineTemplate, addAssistantMessage, updateLastAssistantMessage, handleSourceStep, handleTransformationsStep, handleConfirmStep]);

  // Function to update the pipeline template with the selected dependency
  const updatePipelineWithDependency = useCallback((dependency: string, transformationType: string) => {
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
              name: 'filter_transformation',
              transformation: 'Filter',
              dependent_on: [dependency]
            }
          };
        });
      });
      
      // Make sure the transformation is in the transformations array
      setTransformations(prev => {
        if (!prev.includes(TransformationType.FILTER)) {
          return [...prev, TransformationType.FILTER];
        }
        return prev;
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
      
      // Make sure the transformation is in the transformations array
      setTransformations(prev => {
        if (!prev.includes(TransformationType.SCHEMA)) {
          return [...prev, TransformationType.SCHEMA];
        }
        return prev;
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
      
      // Make sure the transformation is in the transformations array
      setTransformations(prev => {
        if (!prev.includes(TransformationType.TARGET)) {
          return [...prev, TransformationType.TARGET];
        }
        return prev;
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
  }, [pipelineJson, setPipelineJson, generatePipelineTemplate, targetConfig, setSelectedSources, setTransformations, TransformationType]);

  const handleDependencySelection = useCallback((dependency: string) => {
    console.log("Dependency selected:", dependency);
    
    // Use startTransition to prevent UI from being replaced with loading indicator
    startTransition(() => {
      // Update the selected dependency in state
      setSelectedDependency(dependency);
      
      // Hide the dependency selection UI
      setShowDependencySelection(false);
      
      // Find the transformation type that needs to be updated
      const transformationToUpdate = transformationSubStep.split('_')[0]; // 'filter', 'schema', etc.
      
      // Make sure the transformation is in the transformations array with the correct enum value
      if (transformationToUpdate === 'filter') {
        setTransformations(prev => {
          if (!prev.includes(TransformationType.FILTER)) {
            return [...prev, TransformationType.FILTER];
          }
          return prev;
        });
      } else if (transformationToUpdate === 'schema') {
        setTransformations(prev => {
          if (!prev.includes(TransformationType.SCHEMA)) {
            return [...prev, TransformationType.SCHEMA];
          }
          return prev;
        });
      } else if (transformationToUpdate === 'target') {
        setTransformations(prev => {
          if (!prev.includes(TransformationType.TARGET)) {
            return [...prev, TransformationType.TARGET];
          }
          return prev;
        });
      }
      
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
          setFormInitialValues(prev => ({
            ...prev,
            filter: {
              ...prev.filter,
              dependent_on: [dependency]
            }
          }));
          
          if (filterSchemaLoaded) {
            setTransformationSubStep('filter_condition');
            setActiveForm('filter');
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
          setFormInitialValues(prev => ({
            ...prev,
            schema: schemaInitialValues
          }));
          
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
            setActiveForm('schema');
            addAssistantMessage(`Great! Now please define your schema transformations below:`);
          } else {
            addAssistantMessage("Sorry, there was an error loading the schema transformation form. Please try again.");
          }
          
        } else if (transformationSubStep === 'both_dependency') {
          // Update both filter and schema forms with the selected dependency
          setFormInitialValues(prev => ({
            ...prev,
            filter: {
              ...prev.filter,
              dependent_on: [dependency]
            },
            schema: {
              name: 'schema_transformation',
              derived_fields: [{ name: '', expression: '' }],
              dependent_on: [dependency]
            }
          }));
          
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
            setActiveForm('filter');
            addAssistantMessage(`Great! Let's start with the filter condition. Please define your filter condition below. After that, we'll set up the schema transformation.`);
          } else {
            addAssistantMessage("Sorry, there was an error loading the forms. Please try again.");
          }
          
        } else if (transformationSubStep === 'target_dependency') {
          // Update the writer form with the selected dependency
          setFormInitialValues(prev => ({
            ...prev,
            writer: {
              ...prev.writer,
              dependent_on: [dependency]
            }
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
          setActiveForm('writer');
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
  }, [
    transformationSubStep, addAssistantMessage, filterSchema, generatePipelineTemplate, 
    schemaTransformationSchema, setPipelineJson, setSelectedDependency, setShowDependencySelection, 
    setTransformationSubStep, setActiveForm, setFormInitialValues, setSelectedSources, 
    startTransition, updatePipelineWithDependency
  ]);

  
  

  

  

  // Handle ReaderOptionsForm source update
  const handleReaderOptionsUpdate = useCallback((sourceData: any) => {
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
    setActiveForm(null);
  }, [
    addAssistantMessage, currentSourceData, generatePipelineTemplate,
    selectedSources, setPipelineJson, setSelectedSources, setActiveForm
  ]);
  
  // Handle TargetPopUp source update
  const handleTargetUpdate = useCallback((sourceData: any) => {
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
    }
    
    // Hide the form
    setActiveForm(null);
  }, [
    addAssistantMessage, filterCondition, pipelineDescription, pipelineName,
    selectedSources, setPipelineJson, setSelectedSources, setStep,
    setTargetConfig, setTargetName, setTransformations, transformations,
    useSourceConnection, setActiveForm
  ]);

  // Handle reader form submission
  const handleReaderFormSubmit = useCallback((formData: any) => {
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
      setActiveForm(null);

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
  }, [
    addAssistantMessage, addUserMessage, currentSourceData, generatePipelineTemplate,
    selectedSources, setPipelineJson, setSelectedSources, setActiveForm
  ]);

  // Handle filter form submission
  const handleFilterFormSubmit = useCallback((formData: any) => {
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
    setActiveForm(null);

    // Check if we need to show the schema form next (when both transformations are selected)
    if (transformations.includes('schema') && transformations.includes('filter') && 
        !selectedSources.some(s => s.schema_transformation)) {
      // We need to show the schema form next
      setTransformationSubStep('schema_form');
      setActiveForm('schema');
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
  }, [
    addAssistantMessage, addUserMessage, generatePipelineTemplate, pipelineJson,
    selectedSources, setPipelineJson, setFilterCondition, setSelectedSources,
    setTransformationSubStep, setActiveForm, transformations
  ]);

  // Handle schema transformation form submission
  const handleSchemaFormSubmit = useCallback((formData: any) => {
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
    setActiveForm(null);

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
  }, [
    addAssistantMessage, addUserMessage, generatePipelineTemplate, pipelineJson,
    selectedDependency, selectedSources, setPipelineJson, setSelectedSources, 
    setTransformationSubStep, setActiveForm, transformations
  ]);

  // Context value
  const contextValue = {
    // State
    input,
    setInput,
    messages,
    isProcessing,
    pipelineJson,
    isNewChat,
    currentSourceData,
    foundSources,
    awaitingSourceSelection,
    sourceSuggestions,
    sourceColumns,
    mode,
    step,
    pipelineName,
    pipelineDescription,
    selectedSources,
    transformations,
    targetConfig,
    transformationSubStep,
    showDependencySelection,
    dependencyOptions,
    selectedDependency,
    useSourceConnection,
    filterCondition,
    targetName,
    activeForm,
    formInitialValues,
    filterSchema,
    schemaTransformationSchema,
    filterName,
    schemaName,
    isPending,
    messagesEndRef,
    nodes,
    edges,

    // Functions
    addUserMessage,
    addAssistantMessage,
    clearMessages,
    updateLastAssistantMessage,
    setPipelineJson,
    setIsNewChat,
    setCurrentSourceData,
    setFoundSources,
    setAwaitingSourceSelection,
    setSourceSuggestions,
    setMode,
    setStep,
    setPipelineName,
    setPipelineDescription,
    setSelectedSources,
    setTransformations,
    setTargetConfig,
    setTransformationSubStep,
    setShowDependencySelection,
    setDependencyOptions,
    setSelectedDependency,
    setUseSourceConnection,
    setFilterCondition,
    setTargetName,
    setActiveForm,
    setFormInitialValues,
    setFilterSchema,
    setSchemaTransformationSchema,
    setFilterName,
    setSchemaName,
    startTransition,
    handleSend,
    resetPipelineCreationState,
    startPipelineCreation,
    generatePipelineTemplate,
    handleSourceStep,
    processSelectedSource,
    handleTransformationsStep,
    handleConfirmStep,
    handleDependencySelection,
    updatePipelineWithDependency,
    handleReaderOptionsUpdate,
    handleTargetUpdate,
    handleReaderFormSubmit,
    handleFilterFormSubmit,
    handleSchemaFormSubmit
  };

  return (
    <PipeLineChatContext.Provider value={contextValue}>
      {children}
    </PipeLineChatContext.Provider>
  );
};

// Custom hook to use the context
export const usePipeLineChat = () => {
  const context = useContext(PipeLineChatContext);
  if (context === undefined) {
    throw new Error('usePipeLineChat must be used within a PipeLineChatProvider');
  }
  return context;
};