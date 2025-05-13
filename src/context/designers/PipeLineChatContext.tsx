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
import SuggestionButton from "@/features/designers/pipeline/components/SuggestionButton";
import { Database } from "lucide-react";
import { setBuildPipeLineDtl } from "@/store/slices/designer/buildPipeLine/BuildPipeLineSlice";

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
    'target_form' |
    'join_form' |
    'union_form' |
    'drop_form' |
    'select_form' |
    'sequence_form' |
    'join_dependency' |
    'union_dependency' |
    'drop_dependency' |
    'select_dependency' |
    'sequence_dependency';
  showDependencySelection: boolean;
  dependencyOptions: any[];
  selectedDependency: string;
  selectedDependencies: string[];
  isMultiSelect: boolean;
  minDependencies: number;
  useSourceConnection: boolean;
  filterCondition: string;
  targetName: string;
  activeForm: string | null;
  formInitialValues: Record<string, any>;
  filterFormInitialValues: any;
  schemaFormInitialValues: any;
  readerFormInitialValues: any;
  writerFormInitialValues: any;
  sorterFormInitialValues: any;
  aggregatorFormInitialValues: any;
  joinFormInitialValues: any;
  unionFormInitialValues: any;
  dropFormInitialValues: any;
  selectFormInitialValues: any;
  sequenceFormInitialValues: any;
  filterSchema: any;
  schemaTransformationSchema: any;
  sorterSchema: any;
  aggregatorSchema: any;
  joinSchema: any;
  unionSchema: any;
  dropSchema: any;
  selectSchema: any;
  sequenceSchema: any;
  filterName: string;
  schemaName: string;
  sorterName: string;
  aggregatorName: string;
  joinName: string;
  unionName: string;
  dropName: string;
  selectName: string;
  sequenceName: string;
  showFilterForm: boolean;
  showSchemaForm: boolean;
  showReaderForm: boolean;
  showWriterForm: boolean;
  showSorterForm: boolean;
  showAggregatorForm: boolean;
  showJoinForm: boolean;
  showUnionForm: boolean;
  showDropForm: boolean;
  showSelectForm: boolean;
  showSequenceForm: boolean;
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
    'target_form' |
    'join_form' |
    'union_form' |
    'drop_form' |
    'select_form' |
    'sequence_form' |
    'join_dependency' |
    'union_dependency' |
    'drop_dependency' |
    'select_dependency' |
    'sequence_dependency'>>;
  setShowDependencySelection: (show: boolean) => void;
  setDependencyOptions: (options: any[]) => void;
  setSelectedDependency: (dependency: string) => void;
  setSelectedDependencies: (dependencies: string[]) => void;
  setIsMultiSelect: (isMulti: boolean) => void;
  setMinDependencies: (min: number) => void;
  setUseSourceConnection: (use: boolean) => void;
  setFilterCondition: (condition: string) => void;
  setTargetName: (name: string) => void;
  setActiveForm: (form: string | null) => void;
  setFormInitialValues: (values: Record<string, any> | ((prev: Record<string, any>) => Record<string, any>)) => void;
  setFilterFormInitialValues: (values: any) => void;
  setSchemaFormInitialValues: (values: any) => void;
  setReaderFormInitialValues: (values: any) => void;
  setWriterFormInitialValues: (values: any) => void;
  setSorterFormInitialValues: (values: any) => void;
  setAggregatorFormInitialValues: (values: any) => void;
  setJoinFormInitialValues: (values: any) => void;
  setUnionFormInitialValues: (values: any) => void;
  setDropFormInitialValues: (values: any) => void;
  setSelectFormInitialValues: (values: any) => void;
  setSequenceFormInitialValues: (values: any) => void;
  setFilterSchema: (schema: any) => void;
  setSchemaTransformationSchema: (schema: any) => void;
  setSorterSchema: (schema: any) => void;
  setAggregatorSchema: (schema: any) => void;
  setJoinSchema: (schema: any) => void;
  setUnionSchema: (schema: any) => void;
  setDropSchema: (schema: any) => void;
  setSelectSchema: (schema: any) => void;
  setSequenceSchema: (schema: any) => void;
  setFilterName: (name: string) => void;
  setSchemaName: (name: string) => void;
  setSorterName: (name: string) => void;
  setAggregatorName: (name: string) => void;
  setJoinName: (name: string) => void;
  setUnionName: (name: string) => void;
  setDropName: (name: string) => void;
  setSelectName: (name: string) => void;
  setSequenceName: (name: string) => void;
  setShowFilterForm: (show: boolean) => void;
  setShowSchemaForm: (show: boolean) => void;
  setShowReaderForm: (show: boolean) => void;
  setShowWriterForm: (show: boolean) => void;
  setShowSorterForm: (show: boolean) => void;
  setShowAggregatorForm: (show: boolean) => void;
  setShowJoinForm: (show: boolean) => void;
  setShowUnionForm: (show: boolean) => void;
  setShowDropForm: (show: boolean) => void;
  setShowSelectForm: (show: boolean) => void;
  setShowSequenceForm: (show: boolean) => void;
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
  handleSorterFormSubmit : (formData: any) => void;
  handleAggregatorFormSubmit : (formData: any) => void;
  handleJoinFormSubmit : (formData: any) => void;
  handleUnionFormSubmit : (formData: any) => void;
  handleDropFormSubmit : (formData: any) => void;
  handleSelectFormSubmit : (formData: any) => void;
  handleSequenceFormSubmit : (formData: any) => void;
  handleWriterFormSubmit: (formData: any) => void;
  handleMultiDependencySelection: (dependencies: string[]) => void;

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
    dispatch(setBuildPipeLineDtl(newPipelineJson));
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
  const [selectedDependencies, setSelectedDependencies] = useState<string[]>([]);
  const [isMultiSelect, setIsMultiSelect] = useState<boolean>(false);
  const [minDependencies, setMinDependencies] = useState<number>(1);
  const [useSourceConnection, setUseSourceConnection] = useState(true);
  const [filterCondition, setFilterCondition] = useState('');
  const [targetName, setTargetName] = useState('');
  const [transformationSubStep, setTransformationSubStep]: any = useState<
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
    'summary' |
    'target_form' |
    'join_form' |
    'union_form' |
    'drop_form' |
    'select_form' |
    'sequence_form' |
    'join_dependency' |
    'union_dependency' |
    'drop_dependency' |
    'select_dependency' |
    'sequence_dependency'
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
  const [sorterSchema, setSorterSchema] = useState<any>(null);
  const [aggregatorSchema, setAggregatorSchema] = useState<any>(null);
  const [joinSchema, setJoinSchema] = useState<any>(null);
  const [unionSchema, setUnionSchema] = useState<any>(null);
  const [dropSchema, setDropSchema] = useState<any>(null);
  const [selectSchema, setSelectSchema] = useState<any>(null);
  const [sequenceSchema, setSequenceSchema] = useState<any>(null);
  const [filterName, setFilterName] = useState<string>('');
  const [schemaName, setSchemaName] = useState<string>('');
  const [sorterName, setSorterName] = useState<string>('');
  const [aggregatorName, setAggregatorName] = useState<string>('');
  const [joinName, setJoinName] = useState<string>('');
  const [unionName, setUnionName] = useState<string>('');
  const [dropName, setDropName] = useState<string>('');
  const [selectName, setSelectName] = useState<string>('');
  const [sequenceName, setSequenceName] = useState<string>('');
  
  // Form visibility states
  const [showFilterForm, setShowFilterForm] = useState(false);
  const [showSchemaForm, setShowSchemaForm] = useState(false);
  const [showReaderForm, setShowReaderForm] = useState(false);
  const [showWriterForm, setShowWriterForm] = useState(false);
  const [showSorterForm, setShowSorterForm] = useState(false);
  const [showAggregatorForm, setShowAggregatorForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [showUnionForm, setShowUnionForm] = useState(false);
  const [showDropForm, setShowDropForm] = useState(false);
  const [showSelectForm, setShowSelectForm] = useState(false);
  const [showSequenceForm, setShowSequenceForm] = useState(false);
  
  // Form initial values
  const [filterFormInitialValues, setFilterFormInitialValues] = useState<any>({});
  const [schemaFormInitialValues, setSchemaFormInitialValues] = useState<any>({});
  const [readerFormInitialValues, setReaderFormInitialValues] = useState<any>({});
  const [writerFormInitialValues, setWriterFormInitialValues] = useState<any>({});
  const [sorterFormInitialValues, setSorterFormInitialValues] = useState<any>({});
  const [aggregatorFormInitialValues, setAggregatorFormInitialValues] = useState<any>({});
  const [joinFormInitialValues, setJoinFormInitialValues] = useState<any>({});
  const [unionFormInitialValues, setUnionFormInitialValues] = useState<any>({});
  const [dropFormInitialValues, setDropFormInitialValues] = useState<any>({});
  const [selectFormInitialValues, setSelectFormInitialValues] = useState<any>({});
  const [sequenceFormInitialValues, setSequenceFormInitialValues] = useState<any>({});
  
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
    setShowFilterForm(false);
    setShowSchemaForm(false);
    setShowReaderForm(false);
    setShowWriterForm(false);
    setShowSorterForm(false);
    setShowAggregatorForm(false);
    setShowJoinForm(false);
    setShowUnionForm(false);
    setShowDropForm(false);
    setShowSelectForm(false);
    setShowSequenceForm(false);
    setFilterFormInitialValues({});
    setSchemaFormInitialValues({});
    setReaderFormInitialValues({});
    setWriterFormInitialValues({});
    setSorterFormInitialValues({});
    setAggregatorFormInitialValues({});
    setJoinFormInitialValues({});
    setUnionFormInitialValues({});
    setCurrentSourceData(null);

    // Reset source selection state
    setFoundSources([]);
    setAwaitingSourceSelection(false);
    setSourceSuggestions([]);

    // Reset dependency selection state
    setShowDependencySelection(false);
    setDependencyOptions([]);
    setSelectedDependency('');
    setSelectedDependencies([]);
    setIsMultiSelect(false);
    setMinDependencies(1);
  }, []);

  const startPipelineCreation = useCallback(() => {
    setMode('create');
    clearMessages();

    // Set default values for pipeline name and description
    setPipelineName("New Pipeline");
    setPipelineDescription("Data pipeline created with AI assistant");

    // Skip asking for name and description, directly ask for data source
    addAssistantMessage("Let’s start. Add a data source (e.g., sales_data)");

    // Set step directly to source
    setStep('source');

    // Build and update the pipeline template with the default values
    const pipelineTemplate = generatePipelineTemplate();
    setPipelineJson(pipelineTemplate);
  }, [clearMessages, setPipelineJson, addAssistantMessage]);

  // Helper function to call the utility function with the current state
  const generatePipelineTemplate = useCallback((customSources = null) => {
      // Use custom sources if provided, otherwise use the current state
      const sourcesToUse = customSources || selectedSources;
      
      // Log the current state before generating the template
      console.log("Generating pipeline template with state:", {
        pipelineName,
        pipelineDescription,
        sources: sourcesToUse,
        transformations,
        targetConfig,
        useSourceConnection,
        filterCondition
      });
  
      // Generate the template
      const template = buildPipelineTemplate(
        pipelineName,
        pipelineDescription,
        sourcesToUse,
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
    setSelectedSources([...selectedSources, selectedSource]);

    // Log the form values for debugging
    console.log("Reader form initial values:", readerInitialValues);

    setReaderFormInitialValues(readerInitialValues);
    setShowReaderForm(true);

    addAssistantMessage(
      `Using source: ${selectedSource.data_src_name}. Review and edit reader config.`
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
  "Great! Time to add transformations. Here’s what you can do:\n\n" +
  "1. **Schema** – Create or edit fields\n" +
  "2. **Filter** – Apply conditions\n" +
  "3. **Join** – Merge sources\n" +
  "4. **Union** – Stack datasets\n" +
  "5. **Sort** – Order by columns\n" +
  "6. **Aggregate** – Group and summarize\n" +
  "7. **Drop** – Remove columns\n" +
  "8. **Select** – Keep specific columns\n" +
  "9. **Sequence** – Add index/ID\n\n" +
  "Which ones would you like to add?"
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

        // Reset multi-select mode by default - only join and union should use multi-select
        setIsMultiSelect(false);
        setMinDependencies(1);

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

        if (userInput.includes('sorter')) {
          currentSelection = 'sorter';
          if (!newTransformations.includes('sorter')) {
            newTransformations.push('sorter');
          }
        }

        if (userInput.includes('aggregation') || userInput.includes('aggregator') || userInput.includes('6')) {
          currentSelection = 'aggregator';
          if (!newTransformations.includes('aggregator')) {
            newTransformations.push('aggregator');
          }
        }

        if (userInput.includes('join') || userInput.includes('3')) {
          currentSelection = 'join';
          if (!newTransformations.includes('join')) {
            newTransformations.push('join');
          }
          // Set multi-select mode for join transformation - join requires multiple dependencies
          setIsMultiSelect(true);
          setMinDependencies(2);
        }

        if (userInput.includes('union') || userInput.includes('4')) {
          currentSelection = 'union';
          if (!newTransformations.includes('union')) {
            newTransformations.push('union');
          }
          // Set multi-select mode for union transformation - union requires multiple dependencies
          setIsMultiSelect(true);
          setMinDependencies(2);
        }

        if (userInput.includes('drop')) {
          currentSelection = 'drop';
          if (!newTransformations.includes('drop')) {
            newTransformations.push('drop');
          }
        }

        if (userInput.includes('select')) {
          currentSelection = 'select';
          if (!newTransformations.includes('select')) {
            newTransformations.push('select');
          }
        }

        if (userInput.includes('sequence')) {
          currentSelection = 'sequence';
          if (!newTransformations.includes('sequence')) {
            newTransformations.push('sequence');
          }
        }
        
        // Ensure that only join and union use multi-select
        if (currentSelection !== 'join' && currentSelection !== 'union') {
          setIsMultiSelect(false);
          setMinDependencies(1);
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
        if (transformations.includes('sorter')) {
          existingNodes.push('sorter_transformation');
        }
        if (transformations.includes('aggregator')) {
          existingNodes.push('aggregator_transformation');
        }
        if (transformations.includes('join')) {
          existingNodes.push('join_transformation');
        }
        if (transformations.includes('union')) {
          existingNodes.push('union_transformation');
        }
        if (transformations.includes('drop')) {
          existingNodes.push('drop_transformation');
        }
        if (transformations.includes('select')) {
          existingNodes.push('select_transformation');
        }
        if (transformations.includes('sequence')) {
          existingNodes.push('sequence_transformation');
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

        if (currentSelection === 'sorter') {
          // Initialize sorter transformation with empty dependency array
          setSelectedSources(prevSources => {
            return prevSources.map(source => {
              return {
                ...source,
                sorter_transformation: {
                  ...(source.sorter_transformation || {}),
                  dependent_on: [], // Empty array - will be filled when user selects dependency
                  sort_columns: [{ column_name: 'id', sort_order: 'asc' }]
                }
              };
            });
          });
        }

        if (currentSelection === 'aggregator') {
          // Initialize aggregator transformation with empty dependency array
          setSelectedSources(prevSources => {
            return prevSources.map(source => {
              return {
                ...source,
                aggregator_transformation: {
                  ...(source.aggregator_transformation || {}),
                  dependent_on: [], // Empty array - will be filled when user selects dependency
                  aggregations: [{ target_column: 'total_count', expression: 'count(*)' }],
                  group_by: [{ group_by: 'category' }]
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

        if (currentSelection === 'drop') {
          // Initialize drop transformation with empty dependency array
          setSelectedSources(prevSources => {
            return prevSources.map(source => {
              return {
                ...source,
                drop_transformation: {
                  ...(source.drop_transformation || {}),
                  dependent_on: [], // Empty array - will be filled when user selects dependency
                  drop_columns: ['column_to_drop_1', 'column_to_drop_2']
                }
              };
            });
          });
        }

        if (currentSelection === 'select') {
          // Initialize select transformation with empty dependency array
          setSelectedSources(prevSources => {
            return prevSources.map(source => {
              return {
                ...source,
                select_transformation: {
                  ...(source.select_transformation || {}),
                  dependent_on: [], // Empty array - will be filled when user selects dependency
                  select_columns: ['column_to_select_1', 'column_to_select_2']
                }
              };
            });
          });
        }

        if (currentSelection === 'sequence') {
          // Initialize sequence transformation with empty dependency array
          setSelectedSources(prevSources => {
            return prevSources.map(source => {
              return {
                ...source,
                sequence_transformation: {
                  ...(source.sequence_transformation || {}),
                  dependent_on: [], // Empty array - will be filled when user selects dependency
                  sequence_column: 'id',
                  start_value: 1,
                  increment_by: 1
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
        } else if (currentSelection === 'sorter') {
          // Use startTransition to prevent UI from being replaced with loading indicator
          startTransition(() => {
            // First, ask for dependency selection
            setTransformationSubStep('sorter_dependency');

            // Create a message with dependency options
            let dependencyMessage = "After which step would you like to add this sorter transformation? Please select from the options below:";

            // Add the dependency selection options as buttons
            const dependencyButtons = existingNodes.map((node, index) => ({
              label: `${index + 1}. ${node}`,
              value: node
            }));

            // Set the dependency selection options
            setDependencyOptions(dependencyButtons);

            // Initialize sorter transformation with empty dependency array in selectedSources
            setSelectedSources(prevSources => {
              return prevSources.map(source => {
                return {
                  ...source,
                  sorter_transformation: {
                    ...(source.sorter_transformation || {}),
                    name: 'sorter_transformation',
                    transformation: 'Sorter',
                    sort_columns: [{ column_name: 'id', sort_order: 'asc' }],
                    dependent_on: [] // Empty array - will be filled when user selects dependency
                  }
                };
              });
            });

            // Show the dependency selection UI and add the message
            setShowDependencySelection(true);
            addAssistantMessage(dependencyMessage);
          });
        } else if (currentSelection === 'join') {
          // Use startTransition to prevent UI from being replaced with loading indicator
          startTransition(() => {
            // First, ask for dependency selection
            setTransformationSubStep('join_dependency');

            // Create a message with dependency options
            let dependencyMessage = "After which step would you like to add this join transformation? Please select from the options below:";

            // Add the dependency selection options as buttons
            const dependencyButtons = existingNodes.map((node, index) => ({
              label: `${index + 1}. ${node}`,
              value: node
            }));

            // Set the dependency selection options
            setDependencyOptions(dependencyButtons);

            // Initialize join transformation with empty dependency array in selectedSources
            setSelectedSources(prevSources => {
              return prevSources.map(source => {
                return {
                  ...source,
                  join_transformation: {
                    ...(source.join_transformation || {}),
                    name: 'join_transformation',
                    transformation: 'Join',
                    join_type: 'inner',
                    join_columns: [{ left_column: '', right_column: '' }],
                    dependent_on: [] // Empty array - will be filled when user selects dependency
                  }
                };
              });
            });

            // Set multi-select mode for join transformation
            setIsMultiSelect(true);
            setMinDependencies(2);
            setSelectedDependencies([]);

            // Show the dependency selection UI and add the message
            setShowDependencySelection(true);
            addAssistantMessage(dependencyMessage);
          });
        } else if (currentSelection === 'union') {
          // Use startTransition to prevent UI from being replaced with loading indicator
          startTransition(() => {
            // First, ask for dependency selection
            setTransformationSubStep('union_dependency');

            // Create a message with dependency options
            let dependencyMessage = "After which step would you like to add this union transformation? Please select from the options below:";

            // Add the dependency selection options as buttons
            const dependencyButtons = existingNodes.map((node, index) => ({
              label: `${index + 1}. ${node}`,
              value: node
            }));

            // Set the dependency selection options
            setDependencyOptions(dependencyButtons);

            // Initialize union transformation with empty dependency array in selectedSources
            setSelectedSources(prevSources => {
              return prevSources.map(source => {
                return {
                  ...source,
                  union_transformation: {
                    ...(source.union_transformation || {}),
                    name: 'union_transformation',
                    transformation: 'Union',
                    union_type: 'distinct',
                    dependent_on: [] // Empty array - will be filled when user selects dependency
                  }
                };
              });
            });

            // Set multi-select mode for union transformation
            setIsMultiSelect(true);
            setMinDependencies(2);
            setSelectedDependencies([]);

            // Show the dependency selection UI and add the message
            setShowDependencySelection(true);
            addAssistantMessage(dependencyMessage);
          });
        } else if (currentSelection === 'drop') {
          // Use startTransition to prevent UI from being replaced with loading indicator
          startTransition(() => {
            // First, ask for dependency selection
            setTransformationSubStep('drop_dependency');

            // Create a message with dependency options
            let dependencyMessage = "After which step would you like to add this drop transformation? Please select from the options below:";

            // Add the dependency selection options as buttons
            const dependencyButtons = existingNodes.map((node, index) => ({
              label: `${index + 1}. ${node}`,
              value: node
            }));

            // Set the dependency selection options
            setDependencyOptions(dependencyButtons);

            // Initialize drop transformation with empty dependency array in selectedSources
            setSelectedSources(prevSources => {
              return prevSources.map(source => {
                return {
                  ...source,
                  drop_transformation: {
                    ...(source.drop_transformation || {}),
                    name: 'drop_transformation',
                    transformation: 'Drop',
                    drop_columns: ['column_to_drop_1', 'column_to_drop_2'],
                    dependent_on: [] // Empty array - will be filled when user selects dependency
                  }
                };
              });
            });

            // Show the dependency selection UI and add the message
            setShowDependencySelection(true);
            addAssistantMessage(dependencyMessage);
          });
        } else if (currentSelection === 'select') {
          // Use startTransition to prevent UI from being replaced with loading indicator
          startTransition(() => {
            // First, ask for dependency selection
            setTransformationSubStep('select_dependency');

            // Create a message with dependency options
            let dependencyMessage = "After which step would you like to add this select transformation? Please select from the options below:";

            // Add the dependency selection options as buttons
            const dependencyButtons = existingNodes.map((node, index) => ({
              label: `${index + 1}. ${node}`,
              value: node
            }));

            // Set the dependency selection options
            setDependencyOptions(dependencyButtons);

            // Initialize select transformation with empty dependency array in selectedSources
            setSelectedSources(prevSources => {
              return prevSources.map(source => {
                return {
                  ...source,
                  select_transformation: {
                    ...(source.select_transformation || {}),
                    name: 'select_transformation',
                    transformation: 'Select',
                    select_columns: ['column_to_select_1', 'column_to_select_2'],
                    dependent_on: [] // Empty array - will be filled when user selects dependency
                  }
                };
              });
            });

            // Show the dependency selection UI and add the message
            setShowDependencySelection(true);
            addAssistantMessage(dependencyMessage);
          });
        } else if (currentSelection === 'sequence') {
          // Use startTransition to prevent UI from being replaced with loading indicator
          startTransition(() => {
            // First, ask for dependency selection
            setTransformationSubStep('sequence_dependency');

            // Create a message with dependency options
            let dependencyMessage = "After which step would you like to add this sequence transformation? Please select from the options below:";

            // Add the dependency selection options as buttons
            const dependencyButtons = existingNodes.map((node, index) => ({
              label: `${index + 1}. ${node}`,
              value: node
            }));

            // Set the dependency selection options
            setDependencyOptions(dependencyButtons);

            // Try to load the Sequence schema from mdata.json in advance
            try {
              // First check for "SequenceGenerator" title
              let sequenceSchemaFromMdata = mdataJson.schema.find((schema: any) => schema.title === "SequenceGenerator");
              
              // If not found, try "Sequence" title as fallback
              if (!sequenceSchemaFromMdata) {
                sequenceSchemaFromMdata = mdataJson.schema.find((schema: any) => schema.title === "Sequence");
              }
             
              
              // Add nodeId to the schema to match the format expected by CreateFormFormik
              setSequenceSchema({
                ...sequenceSchemaFromMdata,
                nodeId: 'sequence_transformation'
              });
              console.log("Preloaded sequence schema:", sequenceSchemaFromMdata);
            } catch (error) {
              console.error("Error preloading sequence schema:", error);
            }

            // Initialize sequence transformation with empty dependency array in selectedSources
            setSelectedSources(prevSources => {
              return prevSources.map(source => {
                return {
                  ...source,
                  sequence_transformation: {
                    ...(source.sequence_transformation || {}),
                    name: 'sequence_transformation',
                    transformation: 'Sequence',
                    for_column_name: 'id',
                    order_by: [{ column: 'id', order: 'asc' }],
                    increment_by: 1,
                    dependent_on: [] // Empty array - will be filled when user selects dependency
                  }
                };
              });
            });

            // Show the dependency selection UI and add the message
            setShowDependencySelection(true);
            addAssistantMessage(dependencyMessage);
          });
        } else if (currentSelection === 'aggregator') {
          // Use startTransition to prevent UI from being replaced with loading indicator
          startTransition(() => {
            // First, ask for dependency selection
            setTransformationSubStep('aggregator_dependency');

            // Create a message with dependency options
            let dependencyMessage = "After which step would you like to add this aggregation transformation? Please select from the options below:";

            // Add the dependency selection options as buttons
            const dependencyButtons = existingNodes.map((node, index) => ({
              label: `${index + 1}. ${node}`,
              value: node
            }));

            // Set the dependency selection options
            setDependencyOptions(dependencyButtons);

            // Initialize aggregator transformation with empty dependency array in selectedSources
            setSelectedSources(prevSources => {
              return prevSources.map(source => {
                return {
                  ...source,
                  aggregator_transformation: {
                    ...(source.aggregator_transformation || {}),
                    name: 'aggregator_transformation',
                    transformation: 'Aggregator',
                    aggregations: [{ target_column: 'total_count', expression: 'count(*)' }],
                    group_by: [{ group_by: 'category' }],
                    dependent_on: [] // Empty array - will be filled when user selects dependency
                  }
                };
              });
            });

            // Show the dependency selection UI and add the message
            setShowDependencySelection(true);
            addAssistantMessage(dependencyMessage);
          });
        } else if (currentSelection === 'target') {
          // Use startTransition to prevent UI from being replaced with loading indicator
          startTransition(() => {
            // First, ask for dependency selection
            setTransformationSubStep('target_dependency');
            
            // Target should always be single select
            setIsMultiSelect(false);
            setMinDependencies(1);

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
  "✅ Filter added. Want to add another?\n\n" +
  "1. Filter – Apply conditions\n" +
  "2. Schema – Modify fields\n" +
  "3. Join – Merge sources\n" +
  "4. Union – Stack datasets\n" +
  "5. Sort – Order rows\n" +
  "6. Aggregate – Group & summarize\n" +
  "7. Target – Set output\n\n" +
  "Pick an option below to continue."
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
    }
  }, [input, addUserMessage, mode, step, generatePipelineTemplate, addAssistantMessage, updateLastAssistantMessage, handleSourceStep, handleTransformationsStep, handleConfirmStep]);

  // Function to update the pipeline template with the selected dependency
  const updatePipelineWithDependency = useCallback((dependency: string, transformationType: string) => {
    console.log(`Updating pipeline with dependency: ${dependency} for transformation: ${transformationType}`);

    // Convert dependency to array if it's a string
    const dependencyArray = Array.isArray(dependency) ? dependency : [dependency];

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
              dependent_on: dependencyArray
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
              dependent_on: dependencyArray
            }
          };
        });
      });
    } else if (transformationType === 'sorter') {
      // Update the sorter transformation in the selected sources
      setSelectedSources(prevSources => {
        return prevSources.map(source => {
          // Create or update the sorter_transformation property
          return {
            ...source,
            sorter_transformation: {
              ...(source.sorter_transformation || {}),
              name: 'sorter_transformation',
              transformation: 'Sorter',
              sort_columns: source.sorter_transformation?.sort_columns || [{ column_name: 'id', sort_order: 'asc' }],
              dependent_on: dependencyArray
            }
          };
        });
      });
    } else if (transformationType === 'aggregator') {
      // Update the aggregator transformation in the selected sources
      setSelectedSources(prevSources => {
        return prevSources.map(source => {
          // Create or update the aggregator_transformation property
          return {
            ...source,
            aggregator_transformation: {
              ...(source.aggregator_transformation || {}),
              name: 'aggregator_transformation',
              transformation: 'Aggregator',
              aggregations: source.aggregator_transformation?.aggregations || [{ target_column: 'total_count', expression: 'count(*)' }],
              group_by: source.aggregator_transformation?.group_by || [{ group_by: 'category' }],
              dependent_on: dependencyArray
            }
          };
        });
      });
    } else if (transformationType === 'join') {
      // Update the join transformation in the selected sources
      setSelectedSources(prevSources => {
        return prevSources.map(source => {
          // Create or update the join_transformation property
          return {
            ...source,
            join_transformation: {
              ...(source.join_transformation || {}),
              name: 'join_transformation',
              transformation: 'Join',
              join_type: source.join_transformation?.join_type || 'inner',
              join_columns: source.join_transformation?.join_columns || [{ left_column: '', right_column: '' }],
              dependent_on: dependencyArray
            }
          };
        });
      });
    } else if (transformationType === 'union') {
      // Update the union transformation in the selected sources
      setSelectedSources(prevSources => {
        return prevSources.map(source => {
          // Create or update the union_transformation property
          return {
            ...source,
            union_transformation: {
              ...(source.union_transformation || {}),
              name: 'union_transformation',
              transformation: 'Union',
              union_type: source.union_transformation?.union_type || 'distinct',
              dependent_on: dependencyArray
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
              dependent_on: dependencyArray
            }
          };
        });
      });
    } else if (transformationType === 'drop') {
      // Update the drop transformation in the selected sources
      setSelectedSources(prevSources => {
        return prevSources.map(source => {
          // Create or update the drop_transformation property
          return {
            ...source,
            drop_transformation: {
              ...(source.drop_transformation || {}),
              name: 'drop_transformation',
              transformation: 'Drop',
              drop_columns: source.drop_transformation?.drop_columns || ['column_to_drop_1', 'column_to_drop_2'],
              dependent_on: dependencyArray
            }
          };
        });
      });
    } else if (transformationType === 'select') {
      // Update the select transformation in the selected sources
      setSelectedSources(prevSources => {
        return prevSources.map(source => {
          // Create or update the select_transformation property
          return {
            ...source,
            select_transformation: {
              ...(source.select_transformation || {}),
              name: 'select_transformation',
              transformation: 'Select',
              select_columns: source.select_transformation?.select_columns || ['column_to_select_1', 'column_to_select_2'],
              dependent_on: dependencyArray
            }
          };
        });
      });
    } else if (transformationType === 'sequence') {
      // Update the sequence transformation in the selected sources
      setSelectedSources(prevSources => {
        return prevSources.map(source => {
          // Create or update the sequence_transformation property
          return {
            ...source,
            sequence_transformation: {
              ...(source.sequence_transformation || {}),
              name: 'sequence_transformation',
              transformation: 'Sequence',
              sequence_column: source.sequence_transformation?.sequence_column || 'id',
              start_value: source.sequence_transformation?.start_value || 1,
              increment_by: source.sequence_transformation?.increment_by || 1,
              dependent_on: dependencyArray
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
          filterTransformation.dependent_on = dependencyArray;
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
      } else if (transformationType === 'sorter') {
        // Find the sorter transformation
        const sorterTransformation = updatedPipelineJson.transformations.find(
          (t: any) => t.name === 'sorter_transformation'
        );

        if (sorterTransformation) {
          sorterTransformation.dependent_on = [dependency];
          console.log("Updated sorter transformation dependency:", sorterTransformation);
        }
      } else if (transformationType === 'aggregator') {
        // Find the aggregator transformation
        const aggregatorTransformation = updatedPipelineJson.transformations.find(
          (t: any) => t.name === 'aggregator_transformation'
        );

        if (aggregatorTransformation) {
          aggregatorTransformation.dependent_on = [dependency];
          console.log("Updated aggregator transformation dependency:", aggregatorTransformation);
        }
      } else if (transformationType === 'join') {
        // Find the join transformation
        const joinTransformation = updatedPipelineJson.transformations.find(
          (t: any) => t.name === 'join_transformation'
        );

        if (joinTransformation) {
          joinTransformation.dependent_on = [dependency];
          console.log("Updated join transformation dependency:", joinTransformation);
        }
      } else if (transformationType === 'union') {
        // Find the union transformation
        const unionTransformation = updatedPipelineJson.transformations.find(
          (t: any) => t.name === 'union_transformation'
        );

        if (unionTransformation) {
          unionTransformation.dependent_on = [dependency];
          console.log("Updated union transformation dependency:", unionTransformation);
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
      } else if (transformationType === 'drop') {
        // Find the drop transformation
        const dropTransformation = updatedPipelineJson.transformations.find(
          (t: any) => t.name === 'drop_transformation'
        );

        if (dropTransformation) {
          dropTransformation.dependent_on = dependencyArray;
          console.log("Updated drop transformation dependency:", dropTransformation);
        }
      } else if (transformationType === 'select') {
        // Find the select transformation
        const selectTransformation = updatedPipelineJson.transformations.find(
          (t: any) => t.name === 'select_transformation'
        );

        if (selectTransformation) {
          selectTransformation.dependent_on = dependencyArray;
          console.log("Updated select transformation dependency:", selectTransformation);
        }
      } else if (transformationType === 'sequence') {
        // Find the sequence transformation
        const sequenceTransformation = updatedPipelineJson.transformations.find(
          (t: any) => t.name === 'sequence_transformation'
        );

        if (sequenceTransformation) {
          sequenceTransformation.dependent_on = dependencyArray;
          console.log("Updated sequence transformation dependency:", sequenceTransformation);
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
      console.log("Dependency selected:", dependency, "transformationSubStep:", transformationSubStep);
      
      // Log all schema titles to help debug
      console.log("Available schema titles:", mdataJson.schema.map((schema: any) => schema.title));
  
      // Use startTransition to prevent UI from being replaced with loading indicator
      startTransition(() => {
        // First update the state variables
        setSelectedDependency(dependency);
        setShowDependencySelection(false);
  
        // Find the transformation type that needs to be updated
        const transformationToUpdate = transformationSubStep.split('_')[0]; // 'filter', 'schema', etc.
  
        // Update the pipeline with the selected dependency
        updatePipelineWithDependency(dependency, transformationToUpdate);
  
        // Function to preload schemas and continue with the workflow
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
  
          } else if (transformationSubStep === 'sorter_dependency') {
            // Update the sorter transformation with the selected dependency
            setSelectedSources(prevSources => {
              return prevSources.map(source => {
                return {
                  ...source,
                  sorter_transformation: {
                    ...(source.sorter_transformation || {}),
                    name: 'sorter_transformation',
                    transformation: 'Sorter',
                    sort_columns: [{ column_name: 'id', sort_order: 'asc' }],
                    dependent_on: [dependency]
                  }
                };
              });
            });
  
            // Update the pipeline template with the dependency selection
            setTimeout(() => {
              const updatedTemplate = generatePipelineTemplate();
              setPipelineJson(updatedTemplate);
              console.log("Pipeline template updated after sorter dependency selection:", updatedTemplate);
  
              // Log the sorter transformation in the pipeline template
              const sorterTransformation = updatedTemplate.transformations.find(
                (t: any) => t.name === 'sorter_transformation'
              );
              console.log("Sorter transformation in pipeline template:", sorterTransformation);
            }, 0);
  
            // Try to load the Sorter schema from mdata.json
            try {
              const sorterSchemaFromMdata = mdataJson.schema.find((schema: any) => schema.title === "Sorter");
              if (sorterSchemaFromMdata) {
                // Add nodeId to the schema to match the format expected by CreateFormFormik
                setSorterSchema({
                  ...sorterSchemaFromMdata,
                  nodeId: 'sorter_transformation'
                });
                console.log("Loaded sorter schema from mdata.json");
  
                // Prepare sorter form initial values
                setSorterFormInitialValues({
                  name: 'sorter_transformation',
                  sort_columns: [{ column_name: 'id', sort_order: 'asc' }],
                  dependent_on: [dependency]
                });
                setSorterName('sorter_transformation');
  
                // Show the sorter form
                setTransformationSubStep('sorter_form');
                setShowSorterForm(true);
                addAssistantMessage("Please configure your sorter transformation below:");
              } else {
                console.error("Sorter schema not found in mdata.json");
                // Return to transformation selection if schema not found
                setTransformationSubStep('select');
                addAssistantMessage(
  "✅ Sorter added. Add another?\n\n" +
  "1. Filter – Apply conditions\n" +
  "2. Schema – Modify fields\n" +
  "3. Join – Merge sources\n" +
  "4. Union – Stack datasets\n" +
  "5. Sort – Order rows\n" +
  "6. Aggregate – Group & summarize\n" +
  "7. Target – Set output\n\n" +
  "Choose an option below to continue."
);

              }
            } catch (error) {
              console.error("Error loading sorter schema from mdata.json:", error);
              // Return to transformation selection if error
              setTransformationSubStep('select');
              addAssistantMessage(
  "✅ Sorter added. Want to add another?\n\n" +
  "1. Filter – Apply conditions\n" +
  "2. Schema – Modify fields\n" +
  "3. Join – Merge sources\n" +
  "4. Union – Stack datasets\n" +
  "5. Sort – Order rows\n" +
  "6. Aggregate – Group & summarize\n" +
  "7. Target – Set output\n\n" +
  "Pick an option to continue."
);

            }
  
          } else if (transformationSubStep === 'join_dependency') {
            // Update the join transformation with the selected dependency
            setSelectedSources(prevSources => {
              return prevSources.map(source => {
                return {
                  ...source,
                  join_transformation: {
                    ...(source.join_transformation || {}),
                    name: 'join_transformation',
                    transformation: 'Joiner',
                    conditions: [{
                      join_type: 'inner',
                      join_condition: 'a.id = b.id'
                    }],
                    dependent_on: [dependency]
                  }
                };
              });
            });
  
            // Update the pipeline template with the dependency selection
            setTimeout(() => {
              const updatedTemplate = generatePipelineTemplate();
              setPipelineJson(updatedTemplate);
              console.log("Pipeline template updated after join dependency selection:", updatedTemplate);
  
              // Log the join transformation in the pipeline template
              const joinTransformation = updatedTemplate.transformations.find(
                (t: any) => t.name === 'join_transformation'
              );
              console.log("Join transformation in pipeline template:", joinTransformation);
            }, 0);
  
            // Try to load the Joiner schema from mdata.json
            try {
              const joinSchemaFromMdata = mdataJson.schema.find((schema: any) => schema.title === "Joiner");
              if (joinSchemaFromMdata) {
                // Add nodeId to the schema to match the format expected by CreateFormFormik
                setJoinSchema({
                  ...joinSchemaFromMdata,
                  nodeId: 'join_transformation'
                });
                console.log("Loaded join schema from mdata.json");
  
                // Prepare join form initial values
                setJoinFormInitialValues({
                  name: 'join_transformation',
                  conditions: [{
                    join_type: 'inner',
                    join_condition: 'a.id = b.id'
                  }],
                  dependent_on: [dependency]
                });
                setJoinName('join_transformation');
  
                // Show the join form
                setTransformationSubStep('join_form');
                setShowJoinForm(true);
                addAssistantMessage("Please configure your join transformation below:");
              } else {
                console.error("Join schema not found in mdata.json");
                // Return to transformation selection if schema not found
                setTransformationSubStep('select');
                addAssistantMessage(
  "✅ Join added. Add another?\n\n" +
  "1. Schema – Modify fields\n" +
  "2. Filter – Apply conditions\n" +
  "3. Join – Merge sources\n" +
  "4. Union – Stack datasets\n" +
  "5. Sort – Order rows\n" +
  "6. Aggregate – Group & summarize\n" +
  "7. Target – Set output\n\n" +
  "Pick an option below."
);

              }
            } catch (error) {
              console.error("Error loading join schema from mdata.json:", error);
              // Return to transformation selection if error
              setTransformationSubStep('select');
              addAssistantMessage(
  "Join transformation added. Want to add another?\n\n" +
  "1. Schema - Create/modify fields\n" +
  "2. Filter - Filter data by conditions\n" +
  "3. Join - Combine data from sources\n" +
  "4. Union - Append data from sources\n" +
  "5. Sorter - Sort data by columns\n" +
  "6. Aggregation - Aggregate data (group by)\n" +
  "7. Target - Set output target\n\n" +
  "Select an option below."
);

            }
          } else if (transformationSubStep === 'union_dependency') {
            // Update the union transformation with the selected dependency
            setSelectedSources(prevSources => {
              return prevSources.map(source => {
                return {
                  ...source,
                  union_transformation: {
                    ...(source.union_transformation || {}),
                    name: 'union_transformation',
                    transformation: 'Union',
                    union_type: 'distinct',
                    dependent_on: [dependency]
                  }
                };
              });
            });
  
            // Update the pipeline template with the dependency selection
            setTimeout(() => {
              const updatedTemplate = generatePipelineTemplate();
              setPipelineJson(updatedTemplate);
              console.log("Pipeline template updated after union dependency selection:", updatedTemplate);
  
              // Log the union transformation in the pipeline template
              const unionTransformation = updatedTemplate.transformations.find(
                (t: any) => t.name === 'union_transformation'
              );
              console.log("Union transformation in pipeline template:", unionTransformation);
            }, 0);
  
            // Try to load the Union schema from mdata.json
            try {
              const unionSchemaFromMdata = mdataJson.schema.find((schema: any) => schema.title === "Union");
              if (unionSchemaFromMdata) {
                // Add nodeId to the schema to match the format expected by CreateFormFormik
                setUnionSchema({
                  ...unionSchemaFromMdata,
                  nodeId: 'union_transformation'
                });
                console.log("Loaded union schema from mdata.json");
  
                // Prepare union form initial values
                setUnionFormInitialValues({
                  name: 'union_transformation',
                  union_type: 'distinct',
                  dependent_on: [dependency]
                });
                setUnionName('union_transformation');
  
                // Show the union form
                setTransformationSubStep('union_form');
                setShowUnionForm(true);
                addAssistantMessage("Please configure your union transformation below:");
              } else {
                console.error("Union schema not found in mdata.json");
                // Return to transformation selection if schema not found
                setTransformationSubStep('select');
                addAssistantMessage(
  "Union transformation added. Want to add another?\n\n" +
  "1. Schema - Create/modify fields\n" +
  "2. Filter - Filter data by conditions\n" +
  "3. Join - Combine data from sources\n" +
  "4. Union - Append data from sources\n" +
  "5. Sorter - Sort data by columns\n" +
  "6. Aggregation - Aggregate data (group by)\n" +
  "7. Target - Set output target\n\n" +
  "Select an option below."
);

              }
            } catch (error) {
              console.error("Error loading union schema from mdata.json:", error);
              // Return to transformation selection if error
              setTransformationSubStep('select');
              addAssistantMessage(
  "Union transformation added. Add another?\n\n" +
  "1. Schema - Create/modify fields\n" +
  "2. Filter - Filter by conditions\n" +
  "3. Join - Combine data from sources\n" +
  "4. Union - Append data from sources\n" +
  "5. Sorter - Sort by columns\n" +
  "6. Aggregation - Aggregate (group by)\n" +
  "7. Target - Set output target\n\n" +
  "Select an option below."
);

            }
          } else if (transformationSubStep === 'join_dependency') {
            // Update the join transformation with the selected dependency
            setSelectedSources(prevSources => {
              return prevSources.map(source => {
                return {
                  ...source,
                  join_transformation: {
                    ...(source.join_transformation || {}),
                    name: 'join_transformation',
                    transformation: 'Join',
                    join_type: 'inner',
                    join_columns: [{ left_column: '', right_column: '' }],
                    dependent_on: [dependency]
                  }
                };
              });
            });
  
            // Update the pipeline template with the dependency selection
            setTimeout(() => {
              const updatedTemplate = generatePipelineTemplate();
              setPipelineJson(updatedTemplate);
              console.log("Pipeline template updated after join dependency selection:", updatedTemplate);
  
              // Log the join transformation in the pipeline template
              const joinTransformation = updatedTemplate.transformations.find(
                (t: any) => t.name === 'join_transformation'
              );
              console.log("Join transformation in pipeline template:", joinTransformation);
            }, 0);
  
            // Try to load the Join schema from mdata.json
            try {
              const joinSchemaFromMdata = mdataJson.schema.find((schema: any) => schema.title === "Join");
              if (joinSchemaFromMdata) {
                // Add nodeId to the schema to match the format expected by CreateFormFormik
                setJoinSchema({
                  ...joinSchemaFromMdata,
                  nodeId: 'join_transformation'
                });
                console.log("Loaded join schema from mdata.json");
  
                // Prepare join form initial values
                setJoinFormInitialValues({
                  name: 'join_transformation',
                  join_type: 'inner',
                  join_columns: [{ left_column: '', right_column: '' }],
                  dependent_on: [dependency]
                });
                setJoinName('join_transformation');
  
                // Show the join form
                setTransformationSubStep('join_form');
                setShowJoinForm(true);
                addAssistantMessage("Please configure your join transformation below:");
              } else {
                console.error("Join schema not found in mdata.json");
                // Return to transformation selection if schema not found
                setTransformationSubStep('select');
                addAssistantMessage(
  "Join transformation added. Add another?\n\n" +
  "1. Filter - Filter by conditions\n" +
  "2. Schema - Create/modify fields\n" +
  "3. Join - Combine data from sources\n" +
  "4. Union - Append data from sources\n" +
  "5. Sorter - Sort by columns\n" +
  "6. Aggregation - Aggregate (group by)\n" +
  "7. Target - Set output target\n\n" +
  "Select an option below."
);

              }
            } catch (error) {
              console.error("Error loading join schema from mdata.json:", error);
              // Return to transformation selection if error
              setTransformationSubStep('select');
              addAssistantMessage(
                "Great! The join transformation has been added. Would you like to add another transformation?\n\n" +
                "Please select an option from the buttons below."
              );
            }
          } else if (transformationSubStep === 'union_dependency') {
            // Update the union transformation with the selected dependency
            setSelectedSources(prevSources => {
              return prevSources.map(source => {
                return {
                  ...source,
                  union_transformation: {
                    ...(source.union_transformation || {}),
                    name: 'union_transformation',
                    transformation: 'Union',
                    union_type: 'distinct',
                    dependent_on: [dependency]
                  }
                };
              });
            });
  
            // Update the pipeline template with the dependency selection
            setTimeout(() => {
              const updatedTemplate = generatePipelineTemplate();
              setPipelineJson(updatedTemplate);
              console.log("Pipeline template updated after union dependency selection:", updatedTemplate);
  
              // Log the union transformation in the pipeline template
              const unionTransformation = updatedTemplate.transformations.find(
                (t: any) => t.name === 'union_transformation'
              );
              console.log("Union transformation in pipeline template:", unionTransformation);
            }, 0);
  
            // Try to load the Union schema from mdata.json
            try {
              const unionSchemaFromMdata = mdataJson.schema.find((schema: any) => schema.title === "Union");
              if (unionSchemaFromMdata) {
                // Add nodeId to the schema to match the format expected by CreateFormFormik
                setUnionSchema({
                  ...unionSchemaFromMdata,
                  nodeId: 'union_transformation'
                });
                console.log("Loaded union schema from mdata.json");
  
                // Prepare union form initial values
                setUnionFormInitialValues({
                  name: 'union_transformation',
                  union_type: 'distinct',
                  dependent_on: [dependency]
                });
                setUnionName('union_transformation');
  
                // Show the union form
                setTransformationSubStep('union_form');
                setShowUnionForm(true);
                addAssistantMessage("Please configure your union transformation below:");
              } else {
                console.error("Union schema not found in mdata.json");
                // Return to transformation selection if schema not found
                setTransformationSubStep('select');
                addAssistantMessage(
  "Union transformation added. Add another?\n\n" +
  "1. Filter - Filter by conditions\n" +
  "2. Schema - Create/modify fields\n" +
  "3. Join - Combine data from sources\n" +
  "4. Union - Append data from sources\n" +
  "5. Sorter - Sort by columns\n" +
  "6. Aggregation - Aggregate (group by)\n" +
  "7. Target - Set output target\n\n" +
  "Select an option below."
);

              }
            } catch (error) {
              console.error("Error loading union schema from mdata.json:", error);
              // Return to transformation selection if error
              setTransformationSubStep('select');
              addAssistantMessage(
                "Great! The union transformation has been added. Would you like to add another transformation?\n\n" +
                "Please select an option from the buttons below."
              );
            }
          } else if (transformationSubStep === 'drop_dependency') {
            // Update the drop transformation with the selected dependency
            setSelectedSources(prevSources => {
              return prevSources.map(source => {
                return {
                  ...source,
                  drop_transformation: {
                    ...(source.drop_transformation || {}),
                    name: 'drop_transformation',
                    transformation: 'Drop',
                    drop_columns: ['column_to_drop_1', 'column_to_drop_2'],
                    dependent_on: [dependency]
                  }
                };
              });
            });

            // Update the pipeline template with the dependency selection
            setTimeout(() => {
              const updatedTemplate = generatePipelineTemplate();
              setPipelineJson(updatedTemplate);
              console.log("Pipeline template updated after drop dependency selection:", updatedTemplate);

              // Log the drop transformation in the pipeline template
              const dropTransformation = updatedTemplate.transformations.find(
                (t: any) => t.name === 'drop_transformation'
              );
              console.log("Drop transformation in pipeline template:", dropTransformation);
            }, 0);

            // Try to load the Drop schema from mdata.json
            try {
              const dropSchemaFromMdata = mdataJson.schema.find((schema: any) => schema.title === "Drop");
              if (dropSchemaFromMdata) {
                // Add nodeId to the schema to match the format expected by CreateFormFormik
                setDropSchema({
                  ...dropSchemaFromMdata,
                  nodeId: 'drop_transformation'
                });
                console.log("Loaded drop schema from mdata.json");

                // Prepare drop form initial values
                setDropFormInitialValues({
                  name: 'drop_transformation',
                  drop_columns: ['column_to_drop_1', 'column_to_drop_2'],
                  dependent_on: [dependency]
                });
                setDropName('drop_transformation');

                // Show the drop form
                setTransformationSubStep('drop_form');
                setShowDropForm(true);
                addAssistantMessage("Please select the columns you want to drop below:");
              } else {
                console.error("Drop schema not found in mdata.json");
                // Return to transformation selection if schema not found
                setTransformationSubStep('select');
                addAssistantMessage(
                  "Great! The drop transformation has been added. Would you like to add another transformation?\n\n" +
                  "Please select an option from the buttons below."
                );
              }
            } catch (error) {
              console.error("Error loading drop schema from mdata.json:", error);
              // Return to transformation selection if error
              setTransformationSubStep('select');
              addAssistantMessage(
                "Great! The drop transformation has been added. Would you like to add another transformation?\n\n" +
                "Please select an option from the buttons below."
              );
            }
          } else if (transformationSubStep === 'select_dependency') {
            // Update the select transformation with the selected dependency
            setSelectedSources(prevSources => {
              return prevSources.map(source => {
                return {
                  ...source,
                  select_transformation: {
                    ...(source.select_transformation || {}),
                    name: 'select_transformation',
                    transformation: 'Select',
                    select_columns: ['column_to_select_1', 'column_to_select_2'],
                    dependent_on: [dependency]
                  }
                };
              });
            });

            // Update the pipeline template with the dependency selection
            setTimeout(() => {
              const updatedTemplate = generatePipelineTemplate();
              setPipelineJson(updatedTemplate);
              console.log("Pipeline template updated after select dependency selection:", updatedTemplate);

              // Log the select transformation in the pipeline template
              const selectTransformation = updatedTemplate.transformations.find(
                (t: any) => t.name === 'select_transformation'
              );
              console.log("Select transformation in pipeline template:", selectTransformation);
            }, 0);

            // Try to load the Select schema from mdata.json
            try {
              const selectSchemaFromMdata = mdataJson.schema.find((schema: any) => schema.title === "Select");
              if (selectSchemaFromMdata) {
                // Add nodeId to the schema to match the format expected by CreateFormFormik
                setSelectSchema({
                  ...selectSchemaFromMdata,
                  nodeId: 'select_transformation'
                });
                console.log("Loaded select schema from mdata.json");

                // Prepare select form initial values
                setSelectFormInitialValues({
                  name: 'select_transformation',
                  select_columns: ['column_to_select_1', 'column_to_select_2'],
                  dependent_on: [dependency]
                });
                setSelectName('select_transformation');

                // Show the select form
                setTransformationSubStep('select_form');
                setShowSelectForm(true);
                addAssistantMessage("Please select the columns you want to keep below:");
              } else {
                console.error("Select schema not found in mdata.json");
                // Return to transformation selection if schema not found
                setTransformationSubStep('select');
                addAssistantMessage(
                  "Great! The select transformation has been added. Would you like to add another transformation?\n\n" +
                  "Please select an option from the buttons below."
                );
              }
            } catch (error) {
              console.error("Error loading select schema from mdata.json:", error);
              // Return to transformation selection if error
              setTransformationSubStep('select');
              addAssistantMessage(
                "Great! The select transformation has been added. Would you like to add another transformation?\n\n" +
                "Please select an option from the buttons below."
              );
            }
          } else if (transformationSubStep === 'sequence_dependency') {
            // Update the sequence transformation with the selected dependency
            setSelectedSources(prevSources => {
              return prevSources.map(source => {
                return {
                  ...source,
                  sequence_transformation: {
                    ...(source.sequence_transformation || {}),
                    name: 'sequence_transformation',
                    transformation: 'Sequence',
                    sequence_column: 'id',
                    start_value: 1,
                    increment_by: 1,
                    dependent_on: [dependency]
                  }
                };
              });
            });

            // Update the pipeline template with the dependency selection
            setTimeout(() => {
              const updatedTemplate = generatePipelineTemplate();
              setPipelineJson(updatedTemplate);
              console.log("Pipeline template updated after sequence dependency selection:", updatedTemplate);

              // Log the sequence transformation in the pipeline template
              const sequenceTransformation = updatedTemplate.transformations.find(
                (t: any) => t.name === 'sequence_transformation'
              );
              console.log("Sequence transformation in pipeline template:", sequenceTransformation);
            }, 0);

            // Try to load the Sequence schema from mdata.json
            try {
              // First check for "SequenceGenerator" title
              let sequenceSchemaFromMdata = mdataJson.schema.find((schema: any) => schema.title === "SequenceGenerator");
              
              // If not found, try "Sequence" title as fallback
              if (!sequenceSchemaFromMdata) {
                sequenceSchemaFromMdata = mdataJson.schema.find((schema: any) => schema.title === "Sequence");
              }
              
              // If still not found, create a basic schema
              
              // Add nodeId to the schema to match the format expected by CreateFormFormik
              setSequenceSchema({
                ...sequenceSchemaFromMdata,
                nodeId: 'sequence_transformation'
              });
              console.log("Loaded/created sequence schema:", sequenceSchemaFromMdata);

              // Prepare sequence form initial values
              setSequenceFormInitialValues({
                name: 'sequence_transformation',
                for_column_name: "id",
                order_by: [{ column: "id", order: "asc" }],
                increment_by: 1,
                dependent_on: [dependency]
              });
              setSequenceName('sequence_transformation');

              // Show the sequence form
              setTransformationSubStep('sequence_form');
              setShowSequenceForm(true);
              addAssistantMessage("Please configure your sequence transformation below:");
            } catch (error) {
              console.error("Error loading sequence schema from mdata.json:", error);
              // Create a basic schema as fallback
              const basicSchema = {
                title: "Sequence",
                type: "object",
                properties: {
                  name: { type: "string" },
                  for_column_name: { type: "string" },
                  order_by: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        column: { type: "string" },
                        order: { type: "string", enum: ["asc", "desc"] }
                      }
                    }
                  },
                  increment_by: { type: "number" },
                  dependent_on: { type: "array", items: { type: "string" } }
                }
              };
              
              setSequenceSchema({
                ...basicSchema,
                nodeId: 'sequence_transformation'
              });
              
              // Prepare sequence form initial values
              setSequenceFormInitialValues({
                name: 'sequence_transformation',
                for_column_name: "id",
                order_by: [{ column: "id", order: "asc" }],
                increment_by: 1,
                dependent_on: [dependency]
              });
              setSequenceName('sequence_transformation');

              // Show the sequence form
              setTransformationSubStep('sequence_form');
              setShowSequenceForm(true);
              addAssistantMessage("Please configure your sequence transformation below:");
            }
          } else if (transformationSubStep === 'drop_dependency') {
            // Update the drop transformation with the selected dependency
            setSelectedSources(prevSources => {
              return prevSources.map(source => {
                return {
                  ...source,
                  drop_transformation: {
                    ...(source.drop_transformation || {}),
                    name: 'drop_transformation',
                    transformation: 'Drop',
                    drop_columns: ['column_to_drop_1', 'column_to_drop_2'],
                    dependent_on: [dependency]
                  }
                };
              });
            });

            // Update the pipeline template with the dependency selection
            setTimeout(() => {
              const updatedTemplate = generatePipelineTemplate();
              setPipelineJson(updatedTemplate);
              console.log("Pipeline template updated after drop dependency selection:", updatedTemplate);

              // Log the drop transformation in the pipeline template
              const dropTransformation = updatedTemplate.transformations.find(
                (t: any) => t.name === 'drop_transformation'
              );
              console.log("Drop transformation in pipeline template:", dropTransformation);
            }, 0);

            // Try to load the Drop schema from mdata.json
            try {
              const dropSchemaFromMdata = mdataJson.schema.find((schema: any) => schema.title === "Drop");
              if (dropSchemaFromMdata) {
                // Add nodeId to the schema to match the format expected by CreateFormFormik
                setDropSchema({
                  ...dropSchemaFromMdata,
                  nodeId: 'drop_transformation'
                });
                console.log("Loaded drop schema from mdata.json");

                // Prepare drop form initial values
                setDropFormInitialValues({
                  name: 'drop_transformation',
                  drop_columns: ['column_to_drop_1', 'column_to_drop_2'],
                  dependent_on: [dependency]
                });
                setDropName('drop_transformation');

                // Show the drop form
                setTransformationSubStep('drop_form');
                setShowDropForm(true);
                addAssistantMessage("Please select the columns you want to drop below:");
              } else {
                console.error("Drop schema not found in mdata.json");
                // Return to transformation selection if schema not found
                setTransformationSubStep('select');
                addAssistantMessage(
                  "Great! The drop transformation has been added. Would you like to add another transformation?\n\n" +
                  "Please select an option from the buttons below."
                );
              }
            } catch (error) {
              console.error("Error loading drop schema from mdata.json:", error);
              // Return to transformation selection if error
              setTransformationSubStep('select');
              addAssistantMessage(
                "Great! The drop transformation has been added. Would you like to add another transformation?\n\n" +
                "Please select an option from the buttons below."
              );
            }
          } else if (transformationSubStep === 'select_dependency') {
            // Update the select transformation with the selected dependency
            setSelectedSources(prevSources => {
              return prevSources.map(source => {
                return {
                  ...source,
                  select_transformation: {
                    ...(source.select_transformation || {}),
                    name: 'select_transformation',
                    transformation: 'Select',
                    select_columns: ['column_to_select_1', 'column_to_select_2'],
                    dependent_on: [dependency]
                  }
                };
              });
            });

            // Update the pipeline template with the dependency selection
            setTimeout(() => {
              const updatedTemplate = generatePipelineTemplate();
              setPipelineJson(updatedTemplate);
              console.log("Pipeline template updated after select dependency selection:", updatedTemplate);

              // Log the select transformation in the pipeline template
              const selectTransformation = updatedTemplate.transformations.find(
                (t: any) => t.name === 'select_transformation'
              );
              console.log("Select transformation in pipeline template:", selectTransformation);
            }, 0);

            // Try to load the Select schema from mdata.json
            try {
              const selectSchemaFromMdata = mdataJson.schema.find((schema: any) => schema.title === "Select");
              if (selectSchemaFromMdata) {
                // Add nodeId to the schema to match the format expected by CreateFormFormik
                setSelectSchema({
                  ...selectSchemaFromMdata,
                  nodeId: 'select_transformation'
                });
                console.log("Loaded select schema from mdata.json");

                // Prepare select form initial values
                setSelectFormInitialValues({
                  name: 'select_transformation',
                  select_columns: ['column_to_select_1', 'column_to_select_2'],
                  dependent_on: [dependency]
                });
                setSelectName('select_transformation');

                // Show the select form
                setTransformationSubStep('select_form');
                setShowSelectForm(true);
                addAssistantMessage("Please select the columns you want to keep below:");
              } else {
                console.error("Select schema not found in mdata.json");
                // Return to transformation selection if schema not found
                setTransformationSubStep('select');
                addAssistantMessage(
                  "Great! The select transformation has been added. Would you like to add another transformation?\n\n" +
                  "Please select an option from the buttons below."
                );
              }
            } catch (error) {
              console.error("Error loading select schema from mdata.json:", error);
              // Return to transformation selection if error
              setTransformationSubStep('select');
              addAssistantMessage(
                "Great! The select transformation has been added. Would you like to add another transformation?\n\n" +
                "Please select an option from the buttons below."
              );
            }
          } else if (transformationSubStep === 'sequence_dependency') {
            // Update the sequence transformation with the selected dependency
            setSelectedSources(prevSources => {
              return prevSources.map(source => {
                return {
                  ...source,
                  sequence_transformation: {
                    ...(source.sequence_transformation || {}),
                    name: 'sequence_transformation',
                    transformation: 'Sequence',
                    sequence_column: 'id',
                    start_value: 1,
                    increment_by: 1,
                    dependent_on: [dependency]
                  }
                };
              });
            });

            // Update the pipeline template with the dependency selection
            setTimeout(() => {
              const updatedTemplate = generatePipelineTemplate();
              setPipelineJson(updatedTemplate);
              console.log("Pipeline template updated after sequence dependency selection:", updatedTemplate);

              // Log the sequence transformation in the pipeline template
              const sequenceTransformation = updatedTemplate.transformations.find(
                (t: any) => t.name === 'sequence_transformation'
              );
              console.log("Sequence transformation in pipeline template:", sequenceTransformation);
            }, 0);

            // Try to load the Sequence schema from mdata.json
            try {
              const sequenceSchemaFromMdata = mdataJson.schema.find((schema: any) => schema.title === "SequenceGenerator");
              if (sequenceSchemaFromMdata) {
                // Add nodeId to the schema to match the format expected by CreateFormFormik
                setSequenceSchema({
                  ...sequenceSchemaFromMdata,
                  nodeId: 'sequence_transformation'
                });
                console.log("Loaded sequence schema from mdata.json");

                // Prepare sequence form initial values
                setSequenceFormInitialValues({
                  name: 'sequence_transformation',
                  sequence_column: 'id',
                  start_value: 1,
                  increment_by: 1,
                  dependent_on: [dependency]
                });
                setSequenceName('sequence_transformation');

                // Show the sequence form
                setTransformationSubStep('sequence_form');
                setShowSequenceForm(true);
                addAssistantMessage("Please configure your sequence transformation below:");
              } else {
                console.error("Sequence schema not found in mdata.json");
                // Return to transformation selection if schema not found
                setTransformationSubStep('select');
                addAssistantMessage(
                  "Great! The sequence transformation has been added. Would you like to add another transformation?\n\n" +
                  "Please select an option from the buttons below."
                );
              }
            } catch (error) {
              console.error("Error loading sequence schema from mdata.json:", error);
              // Return to transformation selection if error
              setTransformationSubStep('select');
              addAssistantMessage(
                "Great! The sequence transformation has been added. Would you like to add another transformation?\n\n" +
                "Please select an option from the buttons below."
              );
            }
          } else if (transformationSubStep === 'aggregator_dependency') {
            // Update the aggregator transformation with the selected dependency
            setSelectedSources(prevSources => {
              return prevSources.map(source => {
                return {
                  ...source,
                  aggregator_transformation: {
                    ...(source.aggregator_transformation || {}),
                    name: 'aggregator_transformation',
                    transformation: 'Aggregator',
                    aggregations: [{ target_column: 'total_count', expression: 'count(*)' }],
                    group_by: [{ group_by: 'category' }],
                    dependent_on: [dependency]
                  }
                };
              });
            });
  
            // Update the pipeline template with the dependency selection
            setTimeout(() => {
              const updatedTemplate = generatePipelineTemplate();
              setPipelineJson(updatedTemplate);
              console.log("Pipeline template updated after aggregator dependency selection:", updatedTemplate);
  
              // Log the aggregator transformation in the pipeline template
              const aggregatorTransformation = updatedTemplate.transformations.find(
                (t: any) => t.name === 'aggregator_transformation'
              );
              console.log("Aggregator transformation in pipeline template:", aggregatorTransformation);
            }, 0);
  
            // Try to load the Aggregator schema from mdata.json
            try {
              const aggregatorSchemaFromMdata = mdataJson.schema.find((schema: any) => schema.title === "Aggregator");
              if (aggregatorSchemaFromMdata) {
                // Add nodeId to the schema to match the format expected by CreateFormFormik
                setAggregatorSchema({
                  ...aggregatorSchemaFromMdata,
                  nodeId: 'aggregator_transformation'
                });
                console.log("Loaded aggregator schema from mdata.json");
  
                // Prepare aggregator form initial values
                setAggregatorFormInitialValues({
                  name: 'aggregator_transformation',
                  aggregations: [{ target_column: 'total_count', expression: 'count(*)' }],
                  group_by: [{ group_by: 'category' }],
                  dependent_on: [dependency]
                });
                setAggregatorName('aggregator_transformation');
  
                // Show the aggregator form
                setTransformationSubStep('aggregator_form');
                setShowAggregatorForm(true);
                addAssistantMessage("Please configure your aggregation transformation below:");
              } else {
                console.error("Aggregator schema not found in mdata.json");
                // Return to transformation selection if schema not found
                setTransformationSubStep('select');
                addAssistantMessage(
                  "Great! The aggregation transformation has been added. Would you like to add another transformation?\n\n" +
                  "Please select an option from the buttons below."
                );
              }
            } catch (error) {
              console.error("Error loading aggregator schema from mdata.json:", error);
              // Return to transformation selection if error
              setTransformationSubStep('select');
              addAssistantMessage(
                "Great! The aggregation transformation has been added. Would you like to add another transformation?\n\n" +
                "Please select an option from the buttons below."
              );
            }
  
          } else if (transformationSubStep === 'target_dependency') {
            // Ensure we're in single-select mode for target
            setIsMultiSelect(false);
            setMinDependencies(1);
            
            // Update the writer form with the selected dependency and proper initial values
            const initialValues = {
              name: targetName || 'write_output',
              target: {
                target_name: targetName || 'output_data',
                target_type: targetConfig.type || 'File',
                load_mode: 'append',
                connection: {
                  connection_type: targetConfig.connectionType || 'Local',
                  file_path_prefix: targetConfig.filePath || 'examples/'
                },
                file_name: `${(targetName || 'output').toLowerCase().replace(/\s+/g, '_')}.csv`
              },
              file_type: targetConfig.fileFormat || 'CSV',
              write_options: {
                header: true,
                sep: ',',
                createDisposition: 'CREATE_IF_NEEDED',
                writeMethod: 'APPEND'
              },
              dependent_on: [dependency]
            };
  
            console.log("Setting writer form initial values:", initialValues);
            setWriterFormInitialValues(initialValues);
  
            // Also update the form initial values in the context
            if (formInitialValues) {
              formInitialValues.writer = initialValues;
            }
  
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
  
            // Update the pipeline template with the dependency selection
            setTimeout(() => {
              const updatedTemplate = generatePipelineTemplate();
              setPipelineJson(updatedTemplate);
              console.log("Pipeline template updated after target dependency selection:", updatedTemplate);
            }, 0);
  
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
        `Saved reader for "${updatedSource.data_src_name}". Add another source or say "continue" to proceed to transformations.`
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
      const transformationData = targetData.transformationData;
      
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
      
      // Also update the writer form initial values for consistency
      const writerValues = {
        name: targetData.label || targetData.title || source.name,
        target: {
          target_name: source.target_name,
          target_type: source.target_type,
          load_mode: source.load_mode || 'append',
          connection: source.connection,
          file_name: source.file_name,
          table_name: source.table_name
        },
        file_type: source.file_type,
        write_options: transformationData?.write_options || {
          header: true,
          sep: ',',
          createDisposition: 'CREATE_IF_NEEDED',
          writeMethod: source.target_type === 'Relational' ? 'direct' : 'APPEND'
        }
      };
      
      console.log("Setting writer form initial values:", writerValues);
      setWriterFormInitialValues(writerValues);
      
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
    setShowWriterForm(false);
  }, [
    addAssistantMessage, filterCondition, pipelineDescription, pipelineName,
    selectedSources, setPipelineJson, setSelectedSources, setStep,
    setTargetConfig, setTargetName, setTransformations, transformations,
    useSourceConnection, setActiveForm, setWriterFormInitialValues, setShowWriterForm
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
      `Great! The filter transformation has been added.\nWould you like to add another transformation?\n\n` +
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
      "Please select an option from the buttons below."
    );
  }, [
    addAssistantMessage, addUserMessage, generatePipelineTemplate, pipelineJson,
    selectedDependency, selectedSources, setPipelineJson, setSelectedSources, 
    setTransformationSubStep, setActiveForm, transformations
  ]);

  // Handle sorter form submission
  const handleSorterFormSubmit = (formData: any) => {
    console.log("Sorter form submitted:", formData);

    // Ensure sort_columns is an array
    if (!Array.isArray(formData.sort_columns)) {
      formData.sort_columns = [{ column_name: 'id', sort_order: 'asc' }];
    }

    // Filter out empty sort columns
    formData.sort_columns = formData.sort_columns.filter((column: any) =>
      column.column_name && column.column_name.trim() !== ''
    );

    // Ensure sort_columns is an array
    const sortColumnsArray = Array.isArray(formData.sort_columns) 
      ? formData.sort_columns 
      : [formData.sort_columns].filter(Boolean);
    
    // If no valid sort columns, add a default one
    if (sortColumnsArray.length === 0) {
      formData.sort_columns = [{ column_name: 'id', sort_order: 'asc' }];
    } else {
      formData.sort_columns = sortColumnsArray;
    }

    // Save sorter transformation
    const sortColumns = formData.sort_columns.map((column: any) =>
      `${column.column_name} ${column.sort_order}`
    ).join(', ');

    // Process dependency selection if provided
    let dependencyMessage = "";
    if (formData.dependent_on && formData.dependent_on.length > 0) {
      dependencyMessage = ` (after ${formData.dependent_on.join(', ')})`;
      console.log("Using user-provided sorter dependencies:", formData.dependent_on);
    } else {
      // If no dependency provided, check if we have a selected dependency
      if (selectedDependency) {
        formData.dependent_on = [selectedDependency];
        dependencyMessage = ` (after ${selectedDependency})`;
        console.log("Using selected dependency for sorter:", selectedDependency);
      }
      // Otherwise, use an empty array - this will be filled when user selects dependency
      else {
        formData.dependent_on = [];
        console.log("No dependency provided for sorter transformation");
      }
    }

    // Store the sorter transformation data directly in the transformations array
    const sorterTransformationData = {
      name: "sorter_transformation",
      transformation: "Sorter",
      dependent_on: formData.dependent_on,
      sort_columns: formData.sort_columns
    };

    // Update the selected sources with the sorter transformation data
    if (selectedSources.length > 0) {
      const updatedSources = selectedSources.map(source => {
        return {
          ...source,
          sorter_transformation: sorterTransformationData
        };
      });
      setSelectedSources(updatedSources);
    }

    // Update the pipeline JSON directly
    const updatedPipelineJson = { ...pipelineJson };
    if (updatedPipelineJson && updatedPipelineJson.transformations) {
      // Find the sorter transformation
      const sorterTransformation = updatedPipelineJson.transformations.find(
        (t: any) => t.name === 'sorter_transformation'
      );

      if (sorterTransformation) {
        // Update existing sorter transformation
        sorterTransformation.sort_columns = formData.sort_columns;
        sorterTransformation.dependent_on = formData.dependent_on;
        console.log("Updated sorter transformation in pipeline JSON:", sorterTransformation);
      } else {
        // Add new sorter transformation
        updatedPipelineJson.transformations.push(sorterTransformationData);
        console.log("Added new sorter transformation to pipeline JSON:", sorterTransformationData);
      }

      // Update the pipeline JSON
      setPipelineJson(updatedPipelineJson);
    }

    // Add a message to show the selected sort columns
    addUserMessage(`Sorter transformation: ${sortColumns}${dependencyMessage}`);

    // Hide the form
    setShowSorterForm(false);

    // Regenerate the pipeline template with the updated sorter transformation
    setTimeout(() => {
      const sorterTransformTemplate = generatePipelineTemplate();
      setPipelineJson(sorterTransformTemplate);
      console.log("Updated pipeline template after sorter form submission:", sorterTransformTemplate);

      // Log the sorter transformation in the pipeline template
      const sorterTransformation = sorterTransformTemplate.transformations.find(
        (t: any) => t.name === 'sorter_transformation'
      );
      console.log("Sorter transformation in pipeline template:", sorterTransformation);
    }, 0);

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
    if (transformations.includes('sorter')) {
      existingNodes.push('sorter_transformation');
    }
    if (transformations.includes('aggregator')) {
      existingNodes.push('aggregator_transformation');
    }

    // Create a list of existing transformations for the message
    let transformationsList = "";
    if (existingNodes.length > 0) {
      transformationsList = "\n\nCurrent pipeline steps:\n";
      existingNodes.forEach((node, index) => {
        transformationsList += `${index + 1}. ${node}\n`;
      });
      transformationsList += "\nSorter transformation has been added.";
    }

    // Ask if the user wants to add more transformations
    addAssistantMessage(
      `Great! The sorter transformation has been added.${transformationsList}\n\nWould you like to add another transformation?\n\n` +
      "Please select an option from the buttons below."
    );
  };

  // Handle aggregator form submission
  const handleAggregatorFormSubmit = (formData: any) => {
    console.log("Aggregator form submitted:", formData);

    // Ensure aggregations is an array
    if (!Array.isArray(formData.aggregations)) {
      formData.aggregations = [{ target_column: 'total_count', expression: 'count(*)' }];
    }

    // Filter out empty aggregations
    formData.aggregations = formData.aggregations.filter((agg: any) =>
      agg.target_column && agg.target_column.trim() !== '' && agg.expression && agg.expression.trim() !== ''
    );

    // If no valid aggregations, add a default one
    if (formData.aggregations.length === 0) {
      formData.aggregations = [{ target_column: 'total_count', expression: 'count(*)' }];
    }

    // Ensure group_by is an array
    if (!Array.isArray(formData.group_by)) {
      formData.group_by = [{ group_by: 'category' }];
    }

    // Filter out empty group_by
    formData.group_by = formData.group_by.filter((group: any) =>
      group.group_by && group.group_by.trim() !== ''
    );

    // If no valid group_by, add a default one
    if (formData.group_by.length === 0) {
      formData.group_by = [{ group_by: 'category' }];
    }

    // Save aggregator transformation
    const aggregations = formData.aggregations.map((agg: any) =>
      `${agg.target_column}: ${agg.expression}`
    ).join(', ');

    const groupBy = formData.group_by.map((group: any) =>
      group.group_by
    ).join(', ');

    // Process dependency selection if provided
    let dependencyMessage = "";
    if (formData.dependent_on && formData.dependent_on.length > 0) {
      dependencyMessage = ` (after ${formData.dependent_on.join(', ')})`;
      console.log("Using user-provided aggregator dependencies:", formData.dependent_on);
    } else {
      // If no dependency provided, check if we have a selected dependency
      if (selectedDependency) {
        formData.dependent_on = [selectedDependency];
        dependencyMessage = ` (after ${selectedDependency})`;
        console.log("Using selected dependency for aggregator:", selectedDependency);
      }
      // Otherwise, use an empty array - this will be filled when user selects dependency
      else {
        formData.dependent_on = [];
        console.log("No dependency provided for aggregator transformation");
      }
    }

    // Store the aggregator transformation data directly in the transformations array
    const aggregatorTransformationData = {
      name: "aggregator_transformation",
      transformation: "Aggregator",
      dependent_on: formData.dependent_on,
      aggregations: formData.aggregations,
      group_by: formData.group_by
    };

    // Update the selected sources with the aggregator transformation data
    if (selectedSources.length > 0) {
      const updatedSources = selectedSources.map(source => {
        return {
          ...source,
          aggregator_transformation: aggregatorTransformationData
        };
      });
      setSelectedSources(updatedSources);
    }

    // Update the pipeline JSON directly
    const updatedPipelineJson = { ...pipelineJson };
    if (updatedPipelineJson && updatedPipelineJson.transformations) {
      // Find the aggregator transformation
      const aggregatorTransformation = updatedPipelineJson.transformations.find(
        (t: any) => t.name === 'aggregator_transformation'
      );

      if (aggregatorTransformation) {
        // Update existing aggregator transformation
        aggregatorTransformation.aggregations = formData.aggregations;
        aggregatorTransformation.group_by = formData.group_by;
        aggregatorTransformation.dependent_on = formData.dependent_on;
        console.log("Updated aggregator transformation in pipeline JSON:", aggregatorTransformation);
      } else {
        // Add new aggregator transformation
        updatedPipelineJson.transformations.push(aggregatorTransformationData);
        console.log("Added new aggregator transformation to pipeline JSON:", aggregatorTransformationData);
      }

      // Update the pipeline JSON
      setPipelineJson(updatedPipelineJson);
    }

    // Add a message to show the selected aggregations and group by
    addUserMessage(`Aggregator transformation: ${aggregations} grouped by ${groupBy}${dependencyMessage}`);

    // Hide the form
    setShowAggregatorForm(false);

    // Regenerate the pipeline template with the updated aggregator transformation
    setTimeout(() => {
      const aggregatorTransformTemplate = generatePipelineTemplate();
      setPipelineJson(aggregatorTransformTemplate);
      console.log("Updated pipeline template after aggregator form submission:", aggregatorTransformTemplate);

      // Log the aggregator transformation in the pipeline template
      const aggregatorTransformation = aggregatorTransformTemplate.transformations.find(
        (t: any) => t.name === 'aggregator_transformation'
      );
      console.log("Aggregator transformation in pipeline template:", aggregatorTransformation);
    }, 0);

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
    if (transformations.includes('sorter')) {
      existingNodes.push('sorter_transformation');
    }
    if (transformations.includes('aggregator')) {
      existingNodes.push('aggregator_transformation');
    }

    // Create a list of existing transformations for the message
    let transformationsList = "";
    if (existingNodes.length > 0) {
      transformationsList = "\n\nCurrent pipeline steps:\n";
      existingNodes.forEach((node, index) => {
        transformationsList += `${index + 1}. ${node}\n`;
      });
      transformationsList += "\nAggregator transformation has been added.";
    }

    // Ask if the user wants to add more transformations
    addAssistantMessage(
      `Great! The aggregation transformation has been added.${transformationsList}\n\nWould you like to add another transformation?\n\n` +
      "Please select an option from the buttons below."
    );
  };

  // Handle join form submission
  const handleJoinFormSubmit = (formData: any) => {
    console.log("Join form submitted with data:", formData);

    // Extract the join conditions and dependent_on from the form data
    const { conditions, dependent_on } = formData;

    // Format the join conditions for display
    const joinConditions = conditions.map((condition: any) =>
      `${condition.join_type} JOIN ON ${condition.join_condition}`
    ).join(', ');

    // Format the dependencies for display
    const dependencyMessage = dependent_on.length > 0
      ? ` (depends on: ${dependent_on.join(', ')})`
      : '';

    // Update the selected sources with the join transformation data
    const updatedSources = selectedSources.map(source => {
      return {
        ...source,
        join_transformation: {
          ...(source.join_transformation || {}),
          name: 'join_transformation',
          transformation: 'Join',
          conditions: conditions,
          dependent_on: dependent_on
        }
      };
    });
    setSelectedSources(updatedSources);

    // Update the pipeline JSON directly
    const updatedPipelineJson = { ...pipelineJson };
    if (updatedPipelineJson && updatedPipelineJson.transformations) {
      // Find the join transformation
      const joinTransformation = updatedPipelineJson.transformations.find(
        (t: any) => t.name === 'join_transformation'
      );

      if (joinTransformation) {
        // Update existing join transformation
        joinTransformation.conditions = conditions;
        joinTransformation.dependent_on = dependent_on;
        console.log("Updated join transformation in pipeline JSON:", joinTransformation);
      } else {
        // Add new join transformation
        const joinTransformationData = {
          name: 'join_transformation',
          transformation: 'Joiner',
          conditions: conditions,
          dependent_on: dependent_on
        };
        updatedPipelineJson.transformations.push(joinTransformationData);
        console.log("Added new join transformation to pipeline JSON:", joinTransformationData);
      }

      // Update the pipeline JSON
      setPipelineJson(updatedPipelineJson);
    }

    // Add a message to show the selected join conditions
    addUserMessage(`Join transformation: ${joinConditions}${dependencyMessage}`);

    // Hide the form
    setShowJoinForm(false);

    // Add join to the list of transformations if not already there
    if (!transformations.includes('join')) {
      setTransformations([...transformations, 'join']);
    }

    // Regenerate the pipeline template with the updated join transformation
    setTimeout(() => {
      const joinTransformTemplate = generatePipelineTemplate();
      setPipelineJson(joinTransformTemplate);
      console.log("Updated pipeline template after join form submission:", joinTransformTemplate);

      // Log the join transformation in the pipeline template
      const joinTransformation = joinTransformTemplate.transformations.find(
        (t: any) => t.name === 'join_transformation'
      );
      console.log("Join transformation in pipeline template:", joinTransformation);
    }, 0);

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
    if (transformations.includes('sorter')) {
      existingNodes.push('sorter_transformation');
    }
    if (transformations.includes('aggregator')) {
      existingNodes.push('aggregator_transformation');
    }
    if (transformations.includes('join')) {
      existingNodes.push('join_transformation');
    }

    // Create a list of existing transformations for the message
    let transformationsList = "";
    if (existingNodes.length > 0) {
      transformationsList = "\n\nCurrent pipeline steps:\n";
      existingNodes.forEach((node, index) => {
        transformationsList += `${index + 1}. ${node}\n`;
      });
      transformationsList += "\nJoin transformation has been added.";
    }

    // Ask if the user wants to add more transformations
    addAssistantMessage(
      `Great! The join transformation has been added.${transformationsList}\n\nWould you like to add another transformation?\n\n` +
      "Please select an option from the buttons below."
    );
  };

  // Handle union form submission
  const handleUnionFormSubmit = (formData: any) => {
    console.log("Union form submitted with data:", formData);

    // Extract the union type and dependent_on from the form data
    const { union_type, dependent_on } = formData;

    // Ensure dependent_on is an array with at least two dependencies
    const dependencies = Array.isArray(dependent_on) ? dependent_on : [];

    // Log warning if we don't have enough dependencies
    if (dependencies.length < 2) {
      console.warn("Union transformation requires at least two dependencies, but only found:", dependencies);
    }

    // Format the dependencies for display
    const dependencyMessage = dependencies.length > 0
      ? ` (depends on: ${dependencies.join(', ')})`
      : '';

    // Create a dummy source with the union transformation if none exists
    if (!selectedSources.some(source => source.union_transformation)) {
      // Create a dummy source with the union transformation
      const dummySource: any = {
        data_src_id: 'union_source',
        data_src_name: 'union_source',
        union_transformation: {
          name: 'union_transformation',
          transformation: 'Union',
          union_type: union_type,
          dependent_on: dependencies
        }
      };

      // Add the dummy source to the selected sources
      setSelectedSources(prevSources => [...prevSources, dummySource]);
      console.log("Created dummy source with union transformation:", dummySource);
    } else {
      // Update the selected sources with the union transformation data
      const updatedSources = selectedSources.map(source => {
        return {
          ...source,
          union_transformation: {
            ...(source.union_transformation || {}),
            name: 'union_transformation',
            transformation: 'Union',
            union_type: union_type,
            dependent_on: dependencies
          }
        };
      });
      setSelectedSources(updatedSources);
      console.log("Updated sources with union transformation:", updatedSources);
    }

    // Update the pipeline JSON directly
    const updatedPipelineJson = { ...pipelineJson };
    if (updatedPipelineJson && updatedPipelineJson.transformations) {
      // Find the union transformation
      const unionTransformation = updatedPipelineJson.transformations.find(
        (t: any) => t.name === 'union_transformation'
      );

      if (unionTransformation) {
        // Update existing union transformation
        unionTransformation.union_type = union_type;
        unionTransformation.dependent_on = dependencies;
        console.log("Updated union transformation in pipeline JSON:", unionTransformation);
      } else {
        // Add new union transformation
        const unionTransformationData = {
          name: 'union_transformation',
          transformation: 'Union',
          union_type: union_type,
          dependent_on: dependencies
        };
        updatedPipelineJson.transformations.push(unionTransformationData);
        console.log("Added new union transformation to pipeline JSON:", unionTransformationData);
      }

      // Update the pipeline JSON
      setPipelineJson(updatedPipelineJson);
    }

    // Add a message to show the selected union type
    addUserMessage(`Union transformation: ${union_type}${dependencyMessage}`);

    // Hide the form
    setShowUnionForm(false);

    // Add union to the list of transformations if not already there
    if (!transformations.includes('union')) {
      setTransformations(prev => [...prev, 'union']);
    }

    // First, ensure the selected sources have the updated union transformation with dependencies
    const updatedSources = selectedSources.map(source => {
      if (source.union_transformation) {
        // Update existing union transformation with the form data
        return {
          ...source,
          union_transformation: {
            ...source.union_transformation,
            name: 'union_transformation',
            transformation: 'Union',
            union_type: formData.union_type,
            dependent_on: formData.dependent_on
          }
        };
      }
      return source;
    });

    // If no source has a union transformation, create a dummy source
    if (!updatedSources.some(source => source.union_transformation)) {
      const dummySource = {
        data_src_id: 'union_source',
        data_src_name: 'union_source',
        union_transformation: {
          name: 'union_transformation',
          transformation: 'Union',
          union_type: formData.union_type,
          dependent_on: formData.dependent_on
        }
      };
      updatedSources.push(dummySource);
    }

    // Update the selectedSources state
    setSelectedSources(updatedSources);

    // Make sure 'union' is in the transformations array
    if (!transformations.includes('union')) {
      setTransformations(prev => [...prev, 'union']);
    }

    // Update the pipeline template again after the user has confirmed the form with final values
    // This ensures any changes made in the form are reflected in the pipeline template
    console.log("User confirmed union form, updating pipeline template with final form values");

    setTimeout(() => {
      // Create a new pipeline template using the updated sources
      const unionTransformTemplate = buildPipelineTemplate(
        pipelineName,
        pipelineDescription,
        updatedSources, // Use the updated sources with the form data
        transformations.includes('union') ? transformations : [...transformations, 'union'],
        targetConfig,
        useSourceConnection,
        filterCondition
      );

      // Update the pipeline JSON
      setPipelineJson(unionTransformTemplate);
      console.log("Updated pipeline template after union form submission:", unionTransformTemplate);

      // Log the union transformation in the pipeline template
      const unionTransformation = unionTransformTemplate.transformations.find(
        (t: any) => t.name === 'union_transformation'
      );
      console.log("Union transformation in pipeline template:", unionTransformation);
    }, 50); // Small delay to ensure state updates have been processed

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
    if (transformations.includes('sorter')) {
      existingNodes.push('sorter_transformation');
    }
    if (transformations.includes('aggregator')) {
      existingNodes.push('aggregator_transformation');
    }
    if (transformations.includes('join')) {
      existingNodes.push('join_transformation');
    }
    if (transformations.includes('union')) {
      existingNodes.push('union_transformation');
    }

    // Create a list of existing transformations for the message
    let transformationsList = "";
    if (existingNodes.length > 0) {
      transformationsList = "\n\nCurrent pipeline steps:\n";
      existingNodes.forEach((node, index) => {
        transformationsList += `${index + 1}. ${node}\n`;
      });
      transformationsList += "\nUnion transformation has been added.";
    }

    // Ask if the user wants to add more transformations
    addAssistantMessage(
      `Great! The union transformation has been added.${transformationsList}\n\nWould you like to add another transformation?\n\n` +
      "Please select an option from the buttons below."
    );
  };

  // Handle multi-dependency selection for join and union transformations
  const handleMultiDependencySelection = (dependencies: string[]) => {
    console.log("Multiple dependencies selected:", dependencies);

    // Ensure we have at least two dependencies for multi-select transformations
    if (dependencies.length < 2) {
      console.warn("Multi-dependency transformations require at least two dependencies, but only found:", dependencies);
      // Add a warning message to the user
      addAssistantMessage("Please select at least two dependencies for this transformation.");
      return;
    }
    
    // Only join and union transformations should use multi-dependency selection
    const transformationType = transformationSubStep.split('_')[0]; // 'join' or 'union'
    if (transformationType !== 'join' && transformationType !== 'union') {
      console.warn("Multi-dependency selection used for non-join/union transformation:", transformationType);
      // Fall back to single dependency selection with the first dependency
      if (dependencies.length > 0) {
        handleDependencySelection(dependencies[0]);
      }
      return;
    }

    // Use startTransition to prevent UI from freezing
    startTransition(() => {
      // Update the selected dependencies in state
      setSelectedDependencies(dependencies);

      // Hide the dependency selection UI
      setShowDependencySelection(false);

      // Find the transformation type that needs to be updated
      const transformationType = transformationSubStep.split('_')[0]; // 'join' or 'union'

      if (transformationType === 'join') {
        console.log("Handling join transformation with dependencies:", dependencies);

        // First, create a copy of the current selectedSources
        const updatedSources = [...selectedSources];
        
        // Check if any source already has a join transformation
        const sourceWithJoinIndex = updatedSources.findIndex(source => source.join_transformation);
        
        if (sourceWithJoinIndex >= 0) {
          // Update the existing join transformation with the new dependencies
          updatedSources[sourceWithJoinIndex] = {
            ...updatedSources[sourceWithJoinIndex],
            join_transformation: {
              ...(updatedSources[sourceWithJoinIndex].join_transformation || {}),
              name: 'join_transformation',
              transformation: 'Join',
              join_type: 'inner',
              conditions: [{ join_type: 'inner', join_condition: '' }],
              dependent_on: dependencies
            }
          };
          console.log("Updated existing source with join transformation dependencies:", dependencies);
        } else {
          // Create a dummy source with the join transformation
          const dummySource: any = {
            data_src_id: 'join_source',
            data_src_name: 'join_source',
            join_transformation: {
              name: 'join_transformation',
              transformation: 'Join',
              join_type: 'inner',
              conditions: [{ join_type: 'inner', join_condition: '' }],
              dependent_on: dependencies
            }
          };
          
          // Add the dummy source to the updated sources
          updatedSources.push(dummySource);
          console.log("Created dummy source with join transformation:", dummySource);
        }
        
        // Update the selectedSources state with the modified sources
        setSelectedSources(updatedSources);
        
        // Add join to the list of transformations if not already there
        if (!transformations.includes('join')) {
          // Use the callback form to ensure we're working with the latest state
          setTransformations((prev:any) => {
            const newTransformations = [...prev, 'join'];
            console.log("Updated transformations list with join:", newTransformations);
            return newTransformations;
          });
        }
        
        // Force a synchronous update to ensure the state is updated before generating the template
        console.log("Dependencies selected for join, updating pipeline template immediately");
        
        // Update the pipeline template with the dependency selection
        // Use a slightly longer timeout to ensure state updates have been processed
        setTimeout(() => {
          // First, ensure the selectedSources state is updated with the dependencies
          setSelectedSources(updatedSources);
          
          // Then generate the updated template with the new dependencies
          const updatedTemplate = generatePipelineTemplate(updatedSources);
          
          // Update the pipeline JSON
          setPipelineJson(updatedTemplate);
          console.log("Pipeline template updated after join multi-dependency selection:", updatedTemplate);
          
          // Log the join transformation in the pipeline template
          const joinTransformation = updatedTemplate.transformations.find(
            (t: any) => t.name === 'join_transformation'
          );
          console.log("Join transformation in pipeline template:", joinTransformation);
          
          // Show the join form immediately after updating dependencies
          setJoinFormInitialValues({
            name: 'join_transformation',
            conditions: [{ join_type: 'inner', join_condition: '' }],
            dependent_on: dependencies
          });
          setJoinName('join_transformation');
          setShowJoinForm(true);
          addAssistantMessage(`Please configure your join transformation below (dependencies: ${dependencies.join(', ')}):`);
          console.log("Showing join form with dependencies:", dependencies);
        }, 100);

        // Try to load the Join schema from mdata.json
        try {
          const joinSchemaFromMdata = mdataJson.schema.find((schema: any) => schema.title === "Joiner");
          if (joinSchemaFromMdata) {
            // Add nodeId to the schema to match the format expected by CreateFormFormik
            setJoinSchema({
              ...joinSchemaFromMdata,
              nodeId: 'join_transformation'
            });
            console.log("Loaded join schema from mdata.json");

            // Prepare join form initial values
            setJoinFormInitialValues({
              name: 'join_transformation',
              conditions: [{ join_type: 'inner', join_condition: '' }],
              dependent_on: dependencies
            });
            setJoinName('join_transformation');

            // Show the join form
            setTransformationSubStep('join_form');
            setShowJoinForm(true);
            addAssistantMessage(`Please configure your join transformation below (dependencies: ${dependencies.join(', ')}):`);
            console.log("Showing join form with dependencies:", dependencies);
          } else {
            console.error("Join schema not found in mdata.json");
            // Return to transformation selection if schema not found
            setTransformationSubStep('select');
            addAssistantMessage(
              "Great! The join transformation has been added. Would you like to add another transformation?\n\n" +
              "Please select an option from the buttons below."
            );
          }
        } catch (error) {
          console.error("Error loading join schema from mdata.json:", error);
          // Return to transformation selection if error
          setTransformationSubStep('select');
          addAssistantMessage(
            "Great! The join transformation has been added. Would you like to add another transformation?\n\n" +
            "Please select an option from the buttons below."
          );
        }
      } else if (transformationType === 'union') {
        console.log("Handling union transformation with dependencies:", dependencies);

        // First, create a copy of the current selectedSources
        const updatedSources = [...selectedSources];
        
        // Check if any source already has a union transformation
        const sourceWithUnionIndex = updatedSources.findIndex(source => source.union_transformation);
        
        if (sourceWithUnionIndex >= 0) {
          // Update the existing union transformation with the new dependencies
          updatedSources[sourceWithUnionIndex] = {
            ...updatedSources[sourceWithUnionIndex],
            union_transformation: {
              ...(updatedSources[sourceWithUnionIndex].union_transformation || {}),
              name: 'union_transformation',
              transformation: 'Union',
              union_type: 'distinct',
              dependent_on: dependencies
            }
          };
          console.log("Updated existing source with union transformation dependencies:", dependencies);
        } else {
          // Create a dummy source with the union transformation
          const dummySource: any = {
            data_src_id: 'union_source',
            data_src_name: 'union_source',
            union_transformation: {
              name: 'union_transformation',
              transformation: 'Union',
              union_type: 'distinct',
              dependent_on: dependencies
            }
          };
          
          // Add the dummy source to the updated sources
          updatedSources.push(dummySource);
          console.log("Created dummy source with union transformation:", dummySource);
        }
        
        // Update the selectedSources state with the modified sources
        setSelectedSources(updatedSources);
        
        // Add union to the list of transformations if not already there
        if (!transformations.includes('union')) {
          // Use the callback form to ensure we're working with the latest state
          setTransformations(prev => {
            const newTransformations = [...prev, 'union'];
            console.log("Updated transformations list with union:", newTransformations);
            return newTransformations;
          });
        }
        
        // Force a synchronous update to ensure the state is updated before generating the template
        console.log("Dependencies selected for union, updating pipeline template immediately");
        
        // Update the pipeline template with the dependency selection
        // Use a slightly longer timeout to ensure state updates have been processed
        setTimeout(() => {
          // First, ensure the selectedSources state is updated with the dependencies
          setSelectedSources(updatedSources);
          
          // Then generate the updated template with the new dependencies
          const updatedTemplate = generatePipelineTemplate(updatedSources);
          
          // Update the pipeline JSON
          setPipelineJson(updatedTemplate);
          console.log("Pipeline template updated after union multi-dependency selection:", updatedTemplate);
          
          // Log the union transformation in the pipeline template
          const unionTransformation = updatedTemplate.transformations.find(
            (t: any) => t.name === 'union_transformation'
          );
          console.log("Union transformation in pipeline template:", unionTransformation);
        }, 100);

        // Log the current pipeline template for debugging
        console.log("Current pipeline template before update:", pipelineJson);

        // Set up the union form with the selected dependencies
        setUnionFormInitialValues({
          name: 'union_transformation',
          union_type: 'distinct',
          dependent_on: dependencies
        });
        setUnionName('union_transformation');
        setShowUnionForm(true);
        addAssistantMessage(`Please configure your union transformation below (dependencies: ${dependencies.join(', ')}):`);
        console.log("Showing union form with dependencies:", dependencies);

        // Try to load the Union schema from mdata.json
        try {
          const unionSchemaFromMdata = mdataJson.schema.find((schema: any) => schema.title === "Union");
          if (unionSchemaFromMdata) {
            // Add nodeId to the schema to match the format expected by CreateFormFormik
            setUnionSchema({
              ...unionSchemaFromMdata,
              nodeId: 'union_transformation'
            });
            console.log("Loaded union schema from mdata.json");

            // Prepare union form initial values
            setUnionFormInitialValues({
              name: 'union_transformation',
              union_type: 'distinct',
              dependent_on: dependencies
            });
            console.log("Setting union form initial values:", {
              name: 'union_transformation',
              union_type: 'distinct',
              dependent_on: dependencies
            });
            setUnionName('union_transformation');

            // Show the union form
            setTransformationSubStep('union_form');
            setShowUnionForm(true);
            addAssistantMessage(`Please configure your union transformation below (dependencies: ${dependencies.join(', ')}):`);
            console.log("Showing union form with dependencies:", dependencies);
          } else {
            console.error("Union schema not found in mdata.json");
            // Return to transformation selection if schema not found
            setTransformationSubStep('select');
            addAssistantMessage(
              "Great! The union transformation has been added. Would you like to add another transformation?\n\n" +
              "Please select an option from the buttons below."
            );
          }
        } catch (error) {
          console.error("Error loading union schema from mdata.json:", error);
          // Return to transformation selection if error
          setTransformationSubStep('select');
          addAssistantMessage(
            "Great! The union transformation has been added. Would you like to add another transformation?\n\n" +
            "Please select an option from the buttons below."
          );
        }
      }
    }
  )}

  // Handle writer form submission
  // Handle drop form submission
  const handleDropFormSubmit = (formData: any) => {
    console.log("Drop form submitted with data:", formData);

    // Extract the column and dependent_on from the form data
    const { column, dependent_on } = formData;
    
    // Ensure column is an array before calling map
    const columnArray = Array.isArray(column) ? column : [column].filter(Boolean);
    
    // Convert column array to drop_columns array
    const drop_columns = columnArray.length > 0 
      ? columnArray.map((col: any) => col.column_list)
      : [];

    // Format the dependencies for display
    const dependencyMessage = dependent_on && dependent_on.length > 0
      ? ` (depends on: ${dependent_on.join(', ')})`
      : '';

    // Create a dummy source with the drop transformation if none exists
    if (!selectedSources.some(source => source.drop_transformation)) {
      // Create a dummy source with the drop transformation
      const dummySource: any = {
        data_src_id: 'drop_source',
        data_src_name: 'drop_source',
        drop_transformation: {
          name: 'drop_transformation',
          transformation: 'Drop',
          column: columnArray,
          dependent_on: dependent_on
        }
      };

      // Add the dummy source to the selected sources
      setSelectedSources([...selectedSources, dummySource]);
    } else {
      // Update the existing drop transformation in the selected sources
      setSelectedSources(prevSources => {
        return prevSources.map(source => {
          if (source.drop_transformation) {
            return {
              ...source,
              drop_transformation: {
                ...source.drop_transformation,
                column: columnArray,
                dependent_on: dependent_on
              }
            };
          }
          return source;
        });
      });
    }

    // Add the drop transformation to the transformations list if not already there
    if (!transformations.includes('drop')) {
      setTransformations([...transformations, 'drop']);
    }

    // Store the drop transformation data directly in the transformations array
    const dropTransformationData = {
      name: "drop_transformation",
      transformation: "Drop",
      dependent_on: dependent_on,
      column: columnArray
    };

    // Update the pipeline JSON directly
    const updatedPipelineJson = { ...pipelineJson };
    if (updatedPipelineJson && updatedPipelineJson.transformations) {
      // Find the drop transformation
      const dropTransformation = updatedPipelineJson.transformations.find(
        (t: any) => t.name === 'drop_transformation'
      );

      if (dropTransformation) {
        // Update existing drop transformation
        dropTransformation.column = columnArray;
        dropTransformation.dependent_on = dependent_on;
        console.log("Updated drop transformation in pipeline JSON:", dropTransformation);
      } else {
        // Add new drop transformation
        updatedPipelineJson.transformations.push(dropTransformationData);
        console.log("Added new drop transformation to pipeline JSON:", dropTransformationData);
      }

      // Update the pipeline JSON
      setPipelineJson(updatedPipelineJson);
    }

    // Add a message to show the selected drop columns
    addUserMessage(`Drop transformation: Dropping columns ${drop_columns.join(', ')}${dependencyMessage}`);

    // Hide the form
    setShowDropForm(false);

    // Regenerate the pipeline template with the updated drop transformation
    setTimeout(() => {
      const dropTransformTemplate = generatePipelineTemplate();
      setPipelineJson(dropTransformTemplate);
      console.log("Updated pipeline template after drop form submission:", dropTransformTemplate);

      // Log the drop transformation in the pipeline template
      const dropTransformation = dropTransformTemplate.transformations.find(
        (t: any) => t.name === 'drop_transformation'
      );
      console.log("Drop transformation in pipeline template:", dropTransformation);
    }, 0);

    // Return to transformation selection to allow adding more transformations
    setTransformationSubStep('select');
    
    // Add message asking for more transformations with suggestion buttons
    const dropTransformationSuggestions = [
      <SuggestionButton 
        key="schema" 
        icon={<Database size={16} />} 
        onClick={() => handleTransformationsStep("schema transformation")}
        text="Schema Transformation" 
      />,
      <SuggestionButton 
        key="filter" 
        icon={<Database size={16} />} 
        onClick={() => handleTransformationsStep("filter transformation")}
        text="Filter Transformation" 
      />,
      <SuggestionButton 
        key="join" 
        icon={<Database size={16} />} 
        onClick={() => handleTransformationsStep("join transformation")}
        text="Join Transformation" 
      />,
      <SuggestionButton 
        key="union" 
        icon={<Database size={16} />} 
        onClick={() => handleTransformationsStep("union transformation")}
        text="Union Transformation" 
      />,
      <SuggestionButton 
        key="sorter" 
        icon={<Database size={16} />} 
        onClick={() => handleTransformationsStep("sorter transformation")}
        text="Sorter Transformation" 
      />,
      <SuggestionButton 
        key="aggregator" 
        icon={<Database size={16} />} 
        onClick={() => handleTransformationsStep("aggregation transformation")}
        text="Aggregation Transformation" 
      />,
      <SuggestionButton 
        key="drop" 
        icon={<Database size={16} />} 
        onClick={() => handleTransformationsStep("drop transformation")}
        text="Drop Transformation" 
      />,
      <SuggestionButton 
        key="select" 
        icon={<Database size={16} />} 
        onClick={() => handleTransformationsStep("select transformation")}
        text="Select Transformation" 
      />,
      <SuggestionButton 
        key="sequence" 
        icon={<Database size={16} />} 
        onClick={() => handleTransformationsStep("sequence transformation")}
        text="Sequence Transformation" 
      />
    ];
    
    setSourceSuggestions(dropTransformationSuggestions);
    
    addAssistantMessage(
      "Great! The drop transformation has been added. Would you like to add another transformation?\n\n" +
      "Please select an option from the buttons below."
    );
  };

  // Handle select form submission
  const handleSelectFormSubmit = (formData: any) => {
    console.log("Select form submitted with data:", formData);

    // Extract the column_list and dependent_on from the form data
    const { column_list, dependent_on } = formData;
    
    // Ensure column_list is an array before calling map
    const columnListArray = Array.isArray(column_list) ? column_list : [column_list].filter(Boolean);
    
    // Convert column_list array to select_columns array
    const select_columns = columnListArray.length > 0
      ? columnListArray.map((col: any) => col.name)
      : [];

    // Format the dependencies for display
    const dependencyMessage = dependent_on && dependent_on.length > 0
      ? ` (depends on: ${dependent_on.join(', ')})`
      : '';

    // Create a dummy source with the select transformation if none exists
    if (!selectedSources.some(source => source.select_transformation)) {
      // Create a dummy source with the select transformation
      const dummySource: any = {
        data_src_id: 'select_source',
        data_src_name: 'select_source',
        select_transformation: {
          name: 'select_transformation',
          transformation: 'Select',
          column_list: columnListArray,
          dependent_on: dependent_on
        }
      };

      // Add the dummy source to the selected sources
      setSelectedSources([...selectedSources, dummySource]);
    } else {
      // Update the existing select transformation in the selected sources
      setSelectedSources(prevSources => {
        return prevSources.map(source => {
          if (source.select_transformation) {
            return {
              ...source,
              select_transformation: {
                ...source.select_transformation,
                column_list: columnListArray,
                dependent_on: dependent_on
              }
            };
          }
          return source;
        });
      });
    }

    // Add the select transformation to the transformations list if not already there
    if (!transformations.includes('select')) {
      setTransformations([...transformations, 'select']);
    }

    // Store the select transformation data directly in the transformations array
    const selectTransformationData = {
      name: "select_transformation",
      transformation: "Select",
      dependent_on: dependent_on,
      column_list: columnListArray
    };

    // Update the pipeline JSON directly
    const updatedPipelineJson = { ...pipelineJson };
    if (updatedPipelineJson && updatedPipelineJson.transformations) {
      // Find the select transformation
      const selectTransformation = updatedPipelineJson.transformations.find(
        (t: any) => t.name === 'select_transformation'
      );

      if (selectTransformation) {
        // Update existing select transformation
        selectTransformation.column_list = columnListArray;
        selectTransformation.dependent_on = dependent_on;
        console.log("Updated select transformation in pipeline JSON:", selectTransformation);
      } else {
        // Add new select transformation
        updatedPipelineJson.transformations.push(selectTransformationData);
        console.log("Added new select transformation to pipeline JSON:", selectTransformationData);
      }

      // Update the pipeline JSON
      setPipelineJson(updatedPipelineJson);
    }

    // Add a message to show the selected columns
    addUserMessage(`Select transformation: Keeping only columns ${select_columns.join(', ')}${dependencyMessage}`);

    // Hide the form
    setShowSelectForm(false);

    // Regenerate the pipeline template with the updated select transformation
    setTimeout(() => {
      const selectTransformTemplate = generatePipelineTemplate();
      setPipelineJson(selectTransformTemplate);
      console.log("Updated pipeline template after select form submission:", selectTransformTemplate);

      // Log the select transformation in the pipeline template
      const selectTransformation = selectTransformTemplate.transformations.find(
        (t: any) => t.name === 'select_transformation'
      );
      console.log("Select transformation in pipeline template:", selectTransformation);
    }, 0);

    // Return to transformation selection to allow adding more transformations
    setTransformationSubStep('select');
    
    // Add message asking for more transformations with suggestion buttons
    const selectTransformationSuggestions = [
      <SuggestionButton 
        key="schema" 
        icon={<Database size={16} />} 
        onClick={() => handleTransformationsStep("schema transformation")}
        text="Schema Transformation" 
      />,
      <SuggestionButton 
        key="filter" 
        icon={<Database size={16} />} 
        onClick={() => handleTransformationsStep("filter transformation")}
        text="Filter Transformation" 
      />,
      <SuggestionButton 
        key="join" 
        icon={<Database size={16} />} 
        onClick={() => handleTransformationsStep("join transformation")}
        text="Join Transformation" 
      />,
      <SuggestionButton 
        key="union" 
        icon={<Database size={16} />} 
        onClick={() => handleTransformationsStep("union transformation")}
        text="Union Transformation" 
      />,
      <SuggestionButton 
        key="sorter" 
        icon={<Database size={16} />} 
        onClick={() => handleTransformationsStep("sorter transformation")}
        text="Sorter Transformation" 
      />,
      <SuggestionButton 
        key="aggregator" 
        icon={<Database size={16} />} 
        onClick={() => handleTransformationsStep("aggregation transformation")}
        text="Aggregation Transformation" 
      />,
      <SuggestionButton 
        key="drop" 
        icon={<Database size={16} />} 
        onClick={() => handleTransformationsStep("drop transformation")}
        text="Drop Transformation" 
      />,
      <SuggestionButton 
        key="select" 
        icon={<Database size={16} />} 
        onClick={() => handleTransformationsStep("select transformation")}
        text="Select Transformation" 
      />,
      <SuggestionButton 
        key="sequence" 
        icon={<Database size={16} />} 
        onClick={() => handleTransformationsStep("sequence transformation")}
        text="Sequence Transformation" 
      />
    ];
    
    setSourceSuggestions(selectTransformationSuggestions);
    
    addAssistantMessage(
      "Great! The select transformation has been added. Would you like to add another transformation?\n\n" +
      "Please select an option from the buttons below."
    );
  };

  // Handle sequence form submission
  const handleSequenceFormSubmit = (formData: any) => {
    console.log("Sequence form submitted with data:", formData);

    // Extract the for_column_name, order_by and dependent_on from the form data
    const { for_column_name, order_by, dependent_on, increment_by = 1 } = formData;

    // Format the dependencies for display
    const dependencyMessage = dependent_on && dependent_on.length > 0
      ? ` (depends on: ${dependent_on.join(', ')})`
      : '';

    // Create a dummy source with the sequence transformation if none exists
    if (!selectedSources.some(source => source.sequence_transformation)) {
      // Create a dummy source with the sequence transformation
      const dummySource: any = {
        data_src_id: 'sequence_source',
        data_src_name: 'sequence_source',
        sequence_transformation: {
          name: 'sequence_transformation',
          transformation: 'Sequence',
          for_column_name: for_column_name,
          order_by: order_by,
          increment_by: increment_by,
          dependent_on: dependent_on
        }
      };

      // Add the dummy source to the selected sources
      setSelectedSources([...selectedSources, dummySource]);
    } else {
      // Update the existing sequence transformation in the selected sources
      setSelectedSources(prevSources => {
        return prevSources.map(source => {
          if (source.sequence_transformation) {
            return {
              ...source,
              sequence_transformation: {
                ...source.sequence_transformation,
                for_column_name: for_column_name,
                order_by: order_by,
                increment_by: increment_by,
                dependent_on: dependent_on
              }
            };
          }
          return source;
        });
      });
    }

    // Add the sequence transformation to the transformations list if not already there
    if (!transformations.includes('sequence')) {
      setTransformations([...transformations, 'sequence']);
    }

    // Store the sequence transformation data directly in the transformations array
    const sequenceTransformationData = {
      name: "sequence_transformation",
      transformation: "Sequence",
      dependent_on: dependent_on,
      for_column_name: for_column_name,
      order_by: order_by,
      increment_by: increment_by
    };

    // Update the pipeline JSON directly
    const updatedPipelineJson = { ...pipelineJson };
    if (updatedPipelineJson && updatedPipelineJson.transformations) {
      // Find the sequence transformation
      const sequenceTransformation = updatedPipelineJson.transformations.find(
        (t: any) => t.name === 'sequence_transformation'
      );

      if (sequenceTransformation) {
        // Update existing sequence transformation
        sequenceTransformation.for_column_name = for_column_name;
        sequenceTransformation.order_by = order_by;
        sequenceTransformation.dependent_on = dependent_on;
        console.log("Updated sequence transformation in pipeline JSON:", sequenceTransformation);
      } else {
        // Add new sequence transformation
        updatedPipelineJson.transformations.push(sequenceTransformationData);
        console.log("Added new sequence transformation to pipeline JSON:", sequenceTransformationData);
      }

      // Update the pipeline JSON
      setPipelineJson(updatedPipelineJson);
    }

    // Add a message to show the sequence configuration
    addUserMessage(`Sequence transformation: Adding sequence column '${for_column_name}' with ordering by ${order_by.map((o: any) => `${o.column} ${o.order}`).join(', ')}${dependencyMessage}`);

    // Hide the form
    setShowSequenceForm(false);

    // Regenerate the pipeline template with the updated sequence transformation
    setTimeout(() => {
      const sequenceTransformTemplate = generatePipelineTemplate();
      setPipelineJson(sequenceTransformTemplate);
      console.log("Updated pipeline template after sequence form submission:", sequenceTransformTemplate);

      // Log the sequence transformation in the pipeline template
      const sequenceTransformation = sequenceTransformTemplate.transformations.find(
        (t: any) => t.name === 'sequence_transformation'
      );
      console.log("Sequence transformation in pipeline template:", sequenceTransformation);
    }, 0);

    // Return to transformation selection to allow adding more transformations
    setTransformationSubStep('select');
    
    // Add message asking for more transformations with suggestion buttons
    const sequenceTransformationSuggestions = [
      <SuggestionButton 
        key="schema" 
        icon={<Database size={16} />} 
        onClick={() => handleTransformationsStep("schema transformation")}
        text="Schema Transformation" 
      />,
      <SuggestionButton 
        key="filter" 
        icon={<Database size={16} />} 
        onClick={() => handleTransformationsStep("filter transformation")}
        text="Filter Transformation" 
      />,
      <SuggestionButton 
        key="join" 
        icon={<Database size={16} />} 
        onClick={() => handleTransformationsStep("join transformation")}
        text="Join Transformation" 
      />,
      <SuggestionButton 
        key="union" 
        icon={<Database size={16} />} 
        onClick={() => handleTransformationsStep("union transformation")}
        text="Union Transformation" 
      />,
      <SuggestionButton 
        key="sorter" 
        icon={<Database size={16} />} 
        onClick={() => handleTransformationsStep("sorter transformation")}
        text="Sorter Transformation" 
      />,
      <SuggestionButton 
        key="aggregator" 
        icon={<Database size={16} />} 
        onClick={() => handleTransformationsStep("aggregation transformation")}
        text="Aggregation Transformation" 
      />,
      <SuggestionButton 
        key="drop" 
        icon={<Database size={16} />} 
        onClick={() => handleTransformationsStep("drop transformation")}
        text="Drop Transformation" 
      />,
      <SuggestionButton 
        key="select" 
        icon={<Database size={16} />} 
        onClick={() => handleTransformationsStep("select transformation")}
        text="Select Transformation" 
      />,
      <SuggestionButton 
        key="sequence" 
        icon={<Database size={16} />} 
        onClick={() => handleTransformationsStep("sequence transformation")}
        text="Sequence Transformation" 
      />
    ];
    
    setSourceSuggestions(sequenceTransformationSuggestions);
    
    addAssistantMessage(
      "Great! The sequence transformation has been added. Would you like to add another transformation?\n\n" +
      "Please select an option from the buttons below."
    );
  };

  const handleWriterFormSubmit = useCallback((formData: any) => {
    console.log("Writer form submitted:", formData);

    // Create a properly structured source data object for handleTargetUpdate
    const sourceData = {
      nodeId: `target_${formData.name || 'output'}`,
      sourceData: {
        data: {
          label: formData.name,
          title: formData.name,
          source: {
            name: formData.name,
            target_type: formData.target?.target_type || 'File',
            target_name: formData.target?.target_name || formData.name,
            table_name: formData.target?.table_name,
            file_type: formData.file_type || 'CSV',
            connection: formData.target?.connection || {
              connection_type: 'Local',
              file_path_prefix: 'examples/'
            },
            file_name: formData.target?.file_name,
            load_mode: formData.target?.load_mode || 'append'
          },
          transformationData: {
            write_options: formData.write_options || {
              header: true,
              sep: ",",
              createDisposition: 'CREATE_IF_NEEDED',
              writeMethod: formData.target?.target_type === 'Relational' ? 'direct' : 'APPEND'
            }
          }
        }
      }
    };

    // Use the existing handleTargetUpdate function to process the form data
    handleTargetUpdate(sourceData);

    // Close the form
    setShowWriterForm(false);
    setActiveForm(null);

    // Continue with the next step
    setTransformationSubStep('summary');
    addAssistantMessage("Target configuration updated. Let's review your pipeline.");
  }, [
    addAssistantMessage, setActiveForm, setShowWriterForm, setTransformationSubStep, handleTargetUpdate
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
    selectedDependencies,
    isMultiSelect,
    minDependencies,
    useSourceConnection,
    filterCondition,
    targetName,
    activeForm,
    formInitialValues,
    filterFormInitialValues,
    schemaFormInitialValues,
    readerFormInitialValues,
    writerFormInitialValues,
    sorterFormInitialValues,
    aggregatorFormInitialValues,
    joinFormInitialValues,
    unionFormInitialValues,
    filterSchema,
    schemaTransformationSchema,
    sorterSchema,
    aggregatorSchema,
    joinSchema,
    unionSchema,
    filterName,
    schemaName,
    sorterName,
    aggregatorName,
    joinName,
    unionName,
    showFilterForm,
    showSchemaForm,
    showReaderForm,
    showWriterForm,
    showSorterForm,
    showAggregatorForm,
    showJoinForm,
    showUnionForm,
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
    setSelectedDependencies,
    setIsMultiSelect,
    setMinDependencies,
    setUseSourceConnection,
    setFilterCondition,
    setTargetName,
    setActiveForm,
    setFormInitialValues,
    setFilterFormInitialValues,
    setSchemaFormInitialValues,
    setReaderFormInitialValues,
    setWriterFormInitialValues,
    setSorterFormInitialValues,
    setAggregatorFormInitialValues,
    setJoinFormInitialValues,
    setUnionFormInitialValues,
    setFilterSchema,
    setSchemaTransformationSchema,
    setSorterSchema,
    setAggregatorSchema,
    setJoinSchema,
    setUnionSchema,
    setFilterName,
    setSchemaName,
    setSorterName,
    setAggregatorName,
    setJoinName,
    setUnionName,
    setShowFilterForm,
    setShowSchemaForm,
    setShowReaderForm,
    setShowWriterForm,
    setShowSorterForm,
    setShowAggregatorForm,
    setShowJoinForm,
    setShowUnionForm,
    setShowDropForm,
    setShowSelectForm,
    setShowSequenceForm,
    setDropFormInitialValues,
    setSelectFormInitialValues,
    setSequenceFormInitialValues,
    setDropSchema,
    setSelectSchema,
    setSequenceSchema,
    setDropName,
    setSelectName,
    setSequenceName,
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
    handleSchemaFormSubmit,
    handleSorterFormSubmit,
    handleAggregatorFormSubmit,
    handleJoinFormSubmit,
    handleUnionFormSubmit,
    handleDropFormSubmit,
    handleSelectFormSubmit,
    handleSequenceFormSubmit,
    handleWriterFormSubmit,
    handleMultiDependencySelection,
    showDropForm,
    showSelectForm,
    showSequenceForm,
    dropFormInitialValues,
    selectFormInitialValues,
    sequenceFormInitialValues,
    dropSchema,
    selectSchema,
    sequenceSchema,
    dropName,
    selectName,
    sequenceName
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