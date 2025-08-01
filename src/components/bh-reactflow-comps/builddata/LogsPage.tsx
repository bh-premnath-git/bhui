import * as React from "react"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs"
// import { fetchPipelineStreamLogs } from "@/lib/api/log-stream-service"
import { usePipelineContext } from "@/context/designers/DataPipelineContext"
import { useEventStream } from "@/features/admin/connection/hooks/useEventStream"
import { DataTable } from "@/components/bh-table/data-table"
import { 
  getCoreRowModel, 
  getFilteredRowModel, 
  getPaginationRowModel, 
  useReactTable 
} from "@tanstack/react-table"
import { SimpleTopSection } from "@/components/bh-table/simple-top-section"
import { TableContent } from "@/components/bh-table/table-content"
import { TablePagination } from "@/components/bh-table/table-pagination"
import { CATALOG_REMOTE_API_URL, API_PREFIX_URL } from '@/config/platformenv';
import { useAppSelector } from "@/hooks/useRedux";
import { RootState } from "@/store";
import { apiService } from "@/lib/api/api-service";
import { validatePipelineConnections } from "@/lib/validatePipelineConnections";
import { validateFormData } from "@/components/bh-reactflow-comps/builddata/validation";
import schemaData from '@/pages/designers/data-pipeline/data/mdata.json';
import { usePipelineModules } from '@/hooks/usePipelineModules';

export interface Log {
  timestamp: string
  message: string
  level: "info" | "error" | "warning"
}

// Define the structure for preview data
export interface PreviewData {
  transformationName: string;
  outputs: Array<{
    name: string;
    rows: Array<Record<string, string>>;
  }>;
}

interface TerminalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  terminalLogs?: Log[]
  proplesLogs?: Log[]
  previewData?: PreviewData
  defaultHeight?: string
  minHeight?: string
  pipelineName?: string
  activeTabOnOpen?: "terminal" | "proples" | "preview"
}

// Custom client-side pagination table component
const PreviewDataTable: React.FC<{
  data: Array<Record<string, string>>;
  columns: any[];
}> = ({ data, columns }) => {
  const [columnFilters, setColumnFilters] = React.useState<any[]>([])
  const [globalFilter, setGlobalFilter] = React.useState("")

  console.log('PreviewDataTable rendering with data length:', data.length);

  const table = useReactTable({
    data: data || [],
    columns,
    state: {
      columnFilters,
      globalFilter,
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    // Client-side pagination - no manual pagination
    manualPagination: false,
  })

  return (
    <div className="space-y-4 w-full">
      <SimpleTopSection table={table} />
      
      <div className="relative w-full [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300">
        <div style={{ minWidth: '100%' }}>
          <TableContent table={table} />
        </div>
      </div>

      <TablePagination table={table} />
    </div>
  );
};

// Helper function to get node display configuration
const getNodeDisplayConfig = (moduleName: string, pipelineModules: any[]) => {
  // First check hardcoded nodes (Reader and Target)
  const hardcodedNodes = [
    {
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
    },
    {
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
    }
  ];
  
  const hardcodedNode = hardcodedNodes.find(node => 
    node.ui_properties.module_name === moduleName
  );
  
  if (hardcodedNode) {
    return hardcodedNode.ui_properties;
  }
  
  // Then check pipeline modules
  for (const module of pipelineModules) {
    if (module.label === moduleName) {
      return {
        module_name: module.label,
        color: module.color,
        icon: module.icon,
        ports: module.ports
      };
    }
  }
  
  return null;
};

// Helper function to validate Reader/Source form data
const validateReaderFormData = (formData: any, sourceData: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Check if we have either formData or sourceData
  const readerData = formData || sourceData?.source;
  
  if (!readerData && !sourceData) {
    return { isValid: false, errors: ['Reader configuration is missing'] };
  }

  // For Reader nodes, we need to check both formData structure and sourceData structure
  // as they can be stored in different formats depending on the context
  
  // Check reader name (can be in different locations)
  const readerName = formData?.reader_name || formData?.source?.name || sourceData?.source?.name || sourceData?.data?.label;
  if (!readerName) {
    errors.push('Reader name is required');
  }

  // Check source configuration
  const source = formData?.source || sourceData?.source;
  if (!source) {
    errors.push('Source configuration is required');
  } else {
    // Check source type
    const sourceType = source.type;
    if (!sourceType) {
      errors.push('Source type is required');
    }
    
    // Check connection
    const connection = source.connection || source.connection_config;
    if (!connection) {
      errors.push('Connection configuration is required');
    } else {
      const connectionId = connection.connection_config_id;
      if (!connectionId) {
        errors.push('Connection ID is required');
      }
    }

    // Validate based on source type
    if (sourceType === 'File') {
      const fileType = formData?.file_type || source.file_type;
      if (!fileType) {
        errors.push('File type is required for file sources');
      }
      
      const fileName = source.file_name;
      if (!fileName) {
        errors.push('File name is required for file sources');
      }
    } else if (sourceType === 'Relational') {
      const tableName = source.table_name;
      if (!tableName) {
        errors.push('Table name is required for relational sources');
      }
    }
  }

  return { isValid: errors.length === 0, errors };
};

// Helper function to validate Target form data
const validateTargetFormData = (formData: any, sourceData: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Check if we have either formData or sourceData
  const targetData = formData || sourceData?.source;
  
  if (!targetData && !sourceData) {
    return { isValid: false, errors: ['Target configuration is missing'] };
  }

  // For Target nodes, we need to check both formData structure and sourceData structure
  // as they can be stored in different formats depending on the context
  
  // Check name field (can be in different locations)
  const targetName = formData?.name || sourceData?.source?.name || sourceData?.data?.label;
  if (!targetName) {
    errors.push('Target name is required');
  }

  // Check target configuration
  const target = formData?.target || sourceData?.source;
  if (!target) {
    errors.push('Target configuration is required');
  } else {
    // Check target type
    const targetType = target.target_type;
    if (!targetType) {
      errors.push('Target type is required');
    }
    
    // Check connection
    const connection = target.connection;
    if (!connection) {
      errors.push('Connection configuration is required');
    } else {
      if (!connection.connection_config_id) {
        errors.push('Connection ID is required');
      }
    }

    // Validate based on target type
    if (targetType === 'File') {
      const fileType = formData?.file_type || sourceData?.source?.file_type;
      if (!fileType) {
        errors.push('File type is required for file targets');
      }
      
      const fileName = target.file_name;
      if (!fileName) {
        errors.push('File name is required for file targets');
      }
    } else if (targetType === 'Relational') {
      const tableName = target.table_name;
      if (!tableName) {
        errors.push('Table name is required for relational targets');
      }
    }

    // Check load mode
    const loadMode = target.load_mode;
    if (!loadMode) {
      errors.push('Load mode is required');
    }
  }

  return { isValid: errors.length === 0, errors };
};

// Helper function to validate node connections based on port configuration
const validateNodeConnections = (node: any, edges: any[], nodes: any[], pipelineModules: any[]): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const nodeTitle = node.data?.title || node.data?.label || node.id;
  const moduleName = node.data?.module_name;
  
  if (!moduleName) {
    return { isValid: false, errors: [`${nodeTitle}: Module name not found`] };
  }

  const displayConfig = getNodeDisplayConfig(moduleName, pipelineModules);
  if (!displayConfig) {
    return { isValid: false, errors: [`${nodeTitle}: Display configuration not found for module ${moduleName}`] };
  }

  const ports = displayConfig.ports;
  
  // Count actual connections
  const incomingEdges:any = edges.filter(edge => edge.target === node.id);
  const outgoingEdges = edges.filter(edge => edge.source === node.id);
  
  // Validate input connections
  if (ports.inputs === 0 && incomingEdges.length > 0) {
    errors.push(`${nodeTitle}: Should not have any input connections (found ${incomingEdges.length})`);
  } else if (ports.inputs > 0 && incomingEdges.length === 0) {
    errors.push(`${nodeTitle}: Missing required input connection(s) (expected ${ports.inputs})`);
  } else if (ports.maxInputs !== "unlimited" && incomingEdges.length > ports.maxInputs) {
    errors.push(`${nodeTitle}: Too many input connections (found ${incomingEdges.length}, max allowed ${ports.maxInputs})`);
  }
  
  // Validate output connections
  if (ports.outputs === 0 && outgoingEdges.length > 0) {
    errors.push(`${nodeTitle}: Should not have any output connections (found ${outgoingEdges.length})`);
  } else if (ports.outputs > 0 && outgoingEdges.length === 0) {
    errors.push(`${nodeTitle}: Missing required output connection (expected ${ports.outputs})`);
  }

  return { isValid: errors.length === 0, errors };
};

export const Terminal: React.FC<TerminalProps> = ({
  isOpen,
  onClose,
  title = "Logs",
  terminalLogs = [],
  proplesLogs = [],
  previewData,
  defaultHeight = "40%",
  minHeight = "40px",
  pipelineName: propPipelineName,
  activeTabOnOpen = "preview",
}:any) => {
  const [isMinimized, setIsMinimized] = React.useState(false)
  const [isMaximized, setIsMaximized] = React.useState(false)
  const { isFlow } = useAppSelector((state: RootState) => state.buildPipeline);
  
  // Get pipeline modules from the hook
  const pipelineModules = usePipelineModules('pyspark');

  // For flow context, default to "terminal" tab regardless of activeTabOnOpen
  const [activeTab, setActiveTab] = React.useState<"terminal" | "proples" | "preview">(
    isFlow ? "terminal" : activeTabOnOpen,
  )
  const [localTerminalLogs, setLocalTerminalLogs]: any = React.useState<Log[]>(terminalLogs)
  const [localProplesLogs, setLocalProplesLogs] = React.useState<Log[]>(proplesLogs)
  const [localPreviewData, setLocalPreviewData] = React.useState<PreviewData | undefined>(previewData)
  const [isStreaming, setIsStreaming] = React.useState(false)
  const logsEndRef = React.useRef<HTMLDivElement>(null)
  
  // State for selected task ID when in flow context
  const [selectedTaskId, setSelectedTaskId] = React.useState<string>("")
  
  // State for validation logs
  const [validationLogs, setValidationLogs] = React.useState<Log[]>([])
  const [validationProblems, setValidationProblems] = React.useState<Log[]>([])
  const [isValidating, setIsValidating] = React.useState(false)
  
  // State for preview data tabs when multiple outputs are present
  const [activePreviewTab, setActivePreviewTab] = React.useState<string>("0")
  
  // Get all nodes from the pipeline context to extract task IDs
  const { nodes, edges, formStates } = usePipelineContext()
  
  // Add error boundary for validation function
  const [validationError, setValidationError] = React.useState<string | null>(null)
  
  // Extract task IDs from flow nodes
  const taskIds = React.useMemo(() => {
    if (!isFlow || !nodes || nodes.length === 0) return [];
    
    // Extract task IDs from node data
    return nodes
      .filter(node => node.data) // Filter nodes with valid data
      .map(node => {
        // Try to get the task_id from formData if available
        const taskId = node.data?.formData?.task_id || node.id;
        const title = node.data.title || node.data.label || 'Unknown Node';
        return {
          id: taskId, // Use the task_id from formData if available, otherwise use node.id
          nodeId: node.id, // Keep the original node ID for reference
          title: title,
          type: node.type
        };
      });
  }, [isFlow, nodes]);

  // Validation function for both pipelines and flows
  const runValidation = React.useCallback(() => {
    // Clear any previous validation errors
    setValidationError(null);
    
    if (!nodes || nodes.length === 0) {
      const emptyLog: Log = {
        timestamp: new Date().toISOString(),
        message: 'No nodes to validate',
        level: 'warning'
      };
      setValidationLogs([emptyLog]);
      setValidationProblems([emptyLog]);
      return;
    }

    setIsValidating(true);
    const allLogs: Log[] = [];
    const problemLogs: Log[] = [];

    try {
      // Start validation log
      const startLog: Log = {
        timestamp: new Date().toISOString(),
        message: `Starting ${isFlow ? 'flow' : 'pipeline'} validation...`,
        level: 'info'
      };
      allLogs.push(startLog);

      // Validate pipeline/flow structure (connections)
      const connectionValidation = validatePipelineConnections(nodes, edges);
      
      // Add connection validation logs
      connectionValidation.logs.forEach(log => {
        const validationLog: Log = {
          timestamp: log.timestamp,
          message: log.message,
          level: log.level
        };
        allLogs.push(validationLog);
        
        // Add errors and warnings to problems
        if (log.level === 'error' || log.level === 'warning') {
          problemLogs.push(validationLog);
        }
      });

      // Validate individual node forms (only for pipelines, flows handle this differently)
      if (!isFlow) {
        nodes.forEach(node => {
          const nodeId = node.id;
          const formData = formStates[nodeId];
          
          // Log node validation start
          const nodeStartLog: Log = {
            timestamp: new Date().toISOString(),
            message: `Validating node: ${node.data?.title || node.data?.label || nodeId}`,
            level: 'info'
          };
          allLogs.push(nodeStartLog);
          
          // Debug log for form data (can be removed in production)
          if (formData && Object.keys(formData).length > 0) {
            const debugLog: Log = {
              timestamp: new Date().toISOString(),
              message: `${node.data?.title || node.data?.label}: Form data keys: [${Object.keys(formData).join(', ')}]`,
              level: 'info'
            };
            allLogs.push(debugLog);
          }
          
          // Check if form data exists and is filled
          const hasFormData = formData && typeof formData === 'object' && Object.keys(formData).length > 0;
          
          // More comprehensive check for filled fields
          const hasRequiredFields = hasFormData && Object.entries(formData).some(([key, value]) => {
            // Skip empty strings, null, undefined, and empty arrays/objects
            if (value === null || value === undefined || value === '') return false;
            if (Array.isArray(value) && value.length === 0) return false;
            if (typeof value === 'object' && Object.keys(value).length === 0) return false;
            return true;
          });

          // Safety check for schemaData and schema
          if (!schemaData || !schemaData.schema || !Array.isArray(schemaData.schema)) {
            // Even without schema, we can still validate basic form completion
            if (!hasFormData) {
              const noFormDataLog: Log = {
                timestamp: new Date().toISOString(),
                message: `${node.data?.title || node.data?.label}: No form data found - please configure this node`,
                level: 'error'
              };
              allLogs.push(noFormDataLog);
              problemLogs.push(noFormDataLog);
            } else if (!hasRequiredFields) {
              const emptyFormLog: Log = {
                timestamp: new Date().toISOString(),
                message: `${node.data?.title || node.data?.label}: Form data exists but appears to be empty - please fill required fields`,
                level: 'error'
              };
              allLogs.push(emptyFormLog);
              problemLogs.push(emptyFormLog);
            } else {
              const basicValidLog: Log = {
                timestamp: new Date().toISOString(),
                message: `${node.data?.title || node.data?.label}: Form appears to be filled (Schema validation unavailable)`,
                level: 'info'
              };
              allLogs.push(basicValidLog);
            }
            return; // Continue to next node
          }
          
          const nodeSchema = schemaData.schema.find(s => 
            s.title === node.data?.module_name
          );

          if (nodeSchema && !node.id.startsWith('Reader_')) {
            try {
              const validation = validateFormData(
                formData,
                nodeSchema,
                node.id.startsWith('Source_'),
                node.data?.sourceData,
                Boolean(formData)
              );

              if (!validation.isValid) {
                const errorLog: Log = {
                  timestamp: new Date().toISOString(),
                  message: `${node.data?.title || node.data?.label}: ${validation.warnings.join(', ')}`,
                  level: 'error'
                };
                allLogs.push(errorLog);
                problemLogs.push(errorLog);
              } else if (validation.status === 'warning') {
                const warningLog: Log = {
                  timestamp: new Date().toISOString(),
                  message: `${node.data?.title || node.data?.label}: ${validation.warnings.join(', ')}`,
                  level: 'warning'
                };
                allLogs.push(warningLog);
                problemLogs.push(warningLog);
              } else {
                const successLog: Log = {
                  timestamp: new Date().toISOString(),
                  message: `${node.data?.title || node.data?.label}: Validation passed`,
                  level: 'info'
                };
                allLogs.push(successLog);
              }
            } catch (error) {
              const errorLog: Log = {
                timestamp: new Date().toISOString(),
                message: `${node.data?.title || node.data?.label}: Validation failed - ${error instanceof Error ? error.message : 'Unknown error'}`,
                level: 'error'
              };
              allLogs.push(errorLog);
              problemLogs.push(errorLog);
            }
          } else if (!nodeSchema && !node.id.startsWith('Reader_')) {
            // Schema not found, but we can still validate basic form completion
            if (!hasFormData) {
              const noFormDataLog: Log = {
                timestamp: new Date().toISOString(),
                message: `${node.data?.title || node.data?.label}: No form data found - please configure this node (Module: ${node.data?.module_name})`,
                level: 'error'
              };
              allLogs.push(noFormDataLog);
              problemLogs.push(noFormDataLog);
            } else if (!hasRequiredFields) {
              const emptyFormLog: Log = {
                timestamp: new Date().toISOString(),
                message: `${node.data?.title || node.data?.label}: Form data exists but appears to be empty - please fill required fields (Module: ${node.data?.module_name})`,
                level: 'error'
              };
              allLogs.push(emptyFormLog);
              problemLogs.push(emptyFormLog);
            } else {
              const noSchemaLog: Log = {
                timestamp: new Date().toISOString(),
                message: `${node.data?.title || node.data?.label}: Form appears to be filled but schema validation unavailable (Module: ${node.data?.module_name})`,
                level: 'warning'
              };
              allLogs.push(noSchemaLog);
              problemLogs.push(noSchemaLog);
            }
          } else {
            // Reader nodes or nodes with schema - check basic form completion
            if (!hasFormData) {
              const noFormDataLog: Log = {
                timestamp: new Date().toISOString(),
                message: `${node.data?.title || node.data?.label}: No form data found - please configure this node`,
                level: 'error'
              };
              allLogs.push(noFormDataLog);
              problemLogs.push(noFormDataLog);
            } else if (!hasRequiredFields) {
              const emptyFormLog: Log = {
                timestamp: new Date().toISOString(),
                message: `${node.data?.title || node.data?.label}: Form data exists but appears to be empty - please fill required fields`,
                level: 'error'
              };
              allLogs.push(emptyFormLog);
              problemLogs.push(emptyFormLog);
            } else {
              const readerLog: Log = {
                timestamp: new Date().toISOString(),
                message: `${node.data?.title || node.data?.label}: Form validation passed`,
                level: 'info'
              };
              allLogs.push(readerLog);
            }
          }
        });
      } else {
        // For flows, add comprehensive node validation
        nodes.forEach(node => {
          const nodeId = node.id;
          const nodeTitle = node.data?.title || node.data?.label || nodeId;
          const moduleName = node.data?.module_name;
          const transformation = node.data?.transformation;
          
          // Log flow node validation start
          const nodeType = moduleName || (transformation ? `${transformation} (transformation)` : 'Unknown');
          const nodeStartLog: Log = {
            timestamp: new Date().toISOString(),
            message: `Validating flow node: ${nodeTitle} (Type: ${nodeType})`,
            level: 'info'
          };
          allLogs.push(nodeStartLog);
          
          // Check for basic node requirements
          if (!node.data) {
            const noDataLog: Log = {
              timestamp: new Date().toISOString(),
              message: `${nodeTitle}: No node data found`,
              level: 'error'
            };
            allLogs.push(noDataLog);
            problemLogs.push(noDataLog);
            return;
          }
          
          // Check for module name or transformation
          if (!moduleName && !transformation) {
            const noModuleLog: Log = {
              timestamp: new Date().toISOString(),
              message: `${nodeTitle}: Node type not specified - cannot validate node configuration`,
              level: 'warning'
            };
            allLogs.push(noModuleLog);
            problemLogs.push(noModuleLog);
          }
          
          // Validate node connections based on port configuration (only if we have module name)
          if (moduleName) {
            const connectionValidation = validateNodeConnections(node, edges, nodes, pipelineModules);
            connectionValidation.errors.forEach(error => {
              const connectionLog: Log = {
                timestamp: new Date().toISOString(),
                message: error,
                level: 'error'
              };
              allLogs.push(connectionLog);
              problemLogs.push(connectionLog);
            });
            
            if (connectionValidation.isValid) {
              const connectionSuccessLog: Log = {
                timestamp: new Date().toISOString(),
                message: `${nodeTitle}: Connection validation passed`,
                level: 'info'
              };
              allLogs.push(connectionSuccessLog);
            }
          }
          
          // Get form data for validation
          const formData = formStates[nodeId] || node.data?.formData;
          const sourceData = node.data?.sourceData;
          
          // Validate specific node types with their respective validation functions
          if (moduleName === 'Reader') {
            // Use Reader-specific validation
            const readerValidation = validateReaderFormData(formData, sourceData);
            if (!readerValidation.isValid) {
              readerValidation.errors.forEach(error => {
                const readerLog: Log = {
                  timestamp: new Date().toISOString(),
                  message: `${nodeTitle}: ${error}`,
                  level: 'error'
                };
                allLogs.push(readerLog);
                problemLogs.push(readerLog);
              });
            } else {
              const readerSuccessLog: Log = {
                timestamp: new Date().toISOString(),
                message: `${nodeTitle}: Reader configuration is valid`,
                level: 'info'
              };
              allLogs.push(readerSuccessLog);
            }
          } else if (moduleName === 'Target' || transformation?.toLowerCase() === 'target') {
            // Use Target-specific validation
            const targetValidation = validateTargetFormData(formData, sourceData);
            if (!targetValidation.isValid) {
              targetValidation.errors.forEach(error => {
                const targetLog: Log = {
                  timestamp: new Date().toISOString(),
                  message: `${nodeTitle}: ${error}`,
                  level: 'error'
                };
                allLogs.push(targetLog);
                problemLogs.push(targetLog);
              });
            } else {
              const targetSuccessLog: Log = {
                timestamp: new Date().toISOString(),
                message: `${nodeTitle}: Target configuration is valid`,
                level: 'info'
              };
              allLogs.push(targetSuccessLog);
            }
          } else if (moduleName || transformation) {
            // For other transformation nodes, use existing validation logic
            if (!formData || Object.keys(formData).length === 0) {
              const noFormDataLog: Log = {
                timestamp: new Date().toISOString(),
                message: `${nodeTitle}: Node configuration is incomplete - please configure this transformation`,
                level: 'error'
              };
              allLogs.push(noFormDataLog);
              problemLogs.push(noFormDataLog);
            } else {
              // Check if we have schema data for this module
              const schemaTitle = moduleName || transformation;
              const nodeSchema = schemaData?.schema?.find(s => s.title === schemaTitle);
              
              if (nodeSchema) {
                try {
                  const validation = validateFormData(
                    formData,
                    nodeSchema,
                    false, // Not a source node
                    sourceData,
                    Boolean(formData)
                  );

                  if (!validation.isValid) {
                    const errorLog: Log = {
                      timestamp: new Date().toISOString(),
                      message: `${nodeTitle}: ${validation.warnings.join(', ')}`,
                      level: 'error'
                    };
                    allLogs.push(errorLog);
                    problemLogs.push(errorLog);
                  } else if (validation.status === 'warning') {
                    const warningLog: Log = {
                      timestamp: new Date().toISOString(),
                      message: `${nodeTitle}: ${validation.warnings.join(', ')}`,
                      level: 'warning'
                    };
                    allLogs.push(warningLog);
                    problemLogs.push(warningLog);
                  } else {
                    const successLog: Log = {
                      timestamp: new Date().toISOString(),
                      message: `${nodeTitle}: Configuration validation passed`,
                      level: 'info'
                    };
                    allLogs.push(successLog);
                  }
                } catch (error) {
                  const errorLog: Log = {
                    timestamp: new Date().toISOString(),
                    message: `${nodeTitle}: Validation failed - ${error instanceof Error ? error.message : 'Unknown error'}`,
                    level: 'error'
                  };
                  allLogs.push(errorLog);
                  problemLogs.push(errorLog);
                }
              } else {
                // No schema found, basic validation
                const basicValidLog: Log = {
                  timestamp: new Date().toISOString(),
                  message: `${nodeTitle}: Basic configuration check passed (Schema validation unavailable for ${schemaTitle})`,
                  level: 'info'
                };
                allLogs.push(basicValidLog);
              }
            }
          } else {
            // Node has no identifiable type
            const unknownNodeLog: Log = {
              timestamp: new Date().toISOString(),
              message: `${nodeTitle}: Unknown node type - cannot validate configuration`,
              level: 'warning'
            };
            allLogs.push(unknownNodeLog);
            problemLogs.push(unknownNodeLog);
          }
          
          // Check for task_id (flow-specific requirement)
          if (isFlow && !node.data.formData?.task_id) {
            const noTaskIdLog: Log = {
              timestamp: new Date().toISOString(),
              message: `${nodeTitle}: Missing task ID configuration`,
              level: 'warning'
            };
            allLogs.push(noTaskIdLog);
            problemLogs.push(noTaskIdLog);
          }
          
          // Check for required properties based on node type
          if (node.type === 'sensor' && !node.data.formData?.schedule) {
            const noScheduleLog: Log = {
              timestamp: new Date().toISOString(),
              message: `${nodeTitle}: Sensor node missing schedule configuration`,
              level: 'error'
            };
            allLogs.push(noScheduleLog);
            problemLogs.push(noScheduleLog);
          }
        });
      }

      // Summary log
      const errorCount = problemLogs.filter(log => log.level === 'error').length;
      const warningCount = problemLogs.filter(log => log.level === 'warning').length;
      const summaryLog: Log = {
        timestamp: new Date().toISOString(),
        message: `Validation complete: ${errorCount} errors, ${warningCount} warnings found${errorCount === 0 && warningCount === 0 ? ' - All validations passed!' : ''}`,
        level: errorCount > 0 ? 'error' : warningCount > 0 ? 'warning' : 'info'
      };
      allLogs.push(summaryLog);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setValidationError(errorMessage);
      
      const fatalErrorLog: Log = {
        timestamp: new Date().toISOString(),
        message: `Fatal validation error: ${errorMessage}`,
        level: 'error'
      };
      allLogs.push(fatalErrorLog);
      problemLogs.push(fatalErrorLog);
      
      console.error('Validation error:', error);
    } finally {
      setIsValidating(false);
    }

    setValidationLogs(allLogs);
    setValidationProblems(problemLogs);
  }, [nodes, edges, formStates, isFlow]);

  // Run validation when nodes, edges, or formStates change, or when opening relevant tabs
  React.useEffect(() => {
    if (isOpen && (activeTab === 'proples' || (isFlow && activeTab === 'terminal'))) {
      runValidation();
    }
  }, [nodes, edges, formStates, isOpen, activeTab, runValidation]);

  // Run validation when component first opens and relevant tab is active
  React.useEffect(() => {
    if (isOpen && (activeTab === 'proples' || (isFlow && activeTab === 'terminal'))) {
      // Delay validation slightly to allow component to fully mount
      const timer = setTimeout(() => {
        runValidation();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, activeTab, runValidation]);

  // Get pipeline name from context if not provided as prop
  const { pipelineName: contextPipelineName, pipelineDtl } = usePipelineContext();
  
  // Get flow information from Redux store
  const { selectedFlow, currentFlow, dagRunId, selectedEnvironment } = useAppSelector((state: RootState) => state.flow);
  const [fetchedTaskIds, setFetchedTaskIds] = React.useState<Set<string>>(new Set());

  // Determine the actual name to use (flow or pipeline)
  const actualName = React.useMemo(() => {
    if (isFlow) {
      // For flow context, use flow name from currentFlow or selectedFlow
      // First try the prop name, then fall back to Redux store values
      return propPipelineName || 
             currentFlow?.flow_name || 
             selectedFlow?.flow_name || 
             "Unknown Flow";
    } else {
      // For pipeline context, use pipeline name from props or context
      return propPipelineName ||
             (pipelineDtl?.name) ||
             (pipelineDtl?.pipeline_name) ||
             (contextPipelineName?.pipeLineName) ||
             "Unknown Pipeline";
    }
  }, [isFlow, currentFlow, selectedFlow, propPipelineName, pipelineDtl, contextPipelineName]);

  // Determine the appropriate endpoint based on context
  const streamEndpoint = React.useMemo(() => {
    if (isFlow) {
      // For flow context, include task ID if selected
      const taskParam = selectedTaskId ? `?task_id=${selectedTaskId}` : '';
      return `${CATALOG_REMOTE_API_URL}/${API_PREFIX_URL}/flow/stream-logs/${actualName}${taskParam}`;
    } else {
      return `${CATALOG_REMOTE_API_URL}${API_PREFIX_URL}/pipeline/stream-logs/${actualName}`;
    }
  }, [isFlow, actualName, selectedTaskId]);

  // Setup event stream for logs
  const { start, stop } = useEventStream({
    url: streamEndpoint,
    token: sessionStorage.getItem("kc_token")?.replace("Bearer ", "") || "",
    onMessage: (msg: any) => {
      
      try {
        // Try to parse the message if it's a string that contains JSON
        let parsedMsg = msg;
        if (typeof msg === 'string') {
          try {
            // Check if the string is JSON
            if (msg.trim().startsWith('{') || msg.trim().startsWith('[')) {
              parsedMsg = JSON.parse(msg);
            }
          } catch (e) {
            // If parsing fails, keep the original string
            parsedMsg = msg;
            console.warn("Failed to parse SSE message as JSON:", e);
          }
        }
        
        // Now handle the message based on its type
        if (typeof parsedMsg === 'string') {
          // Simple string message
          const newLog: Log = {
            timestamp: new Date().toISOString(),
            message: parsedMsg,
            level: "info"
          };
          setLocalTerminalLogs(prev => [...prev, newLog]);
        } else if (typeof parsedMsg === 'object') {
          // Handle structured log objects
          // Check for different possible formats from both flow and pipeline
          const newLog: Log = {
            timestamp: parsedMsg.timestamp || parsedMsg.time || new Date().toISOString(),
            message: parsedMsg.message || parsedMsg.msg || parsedMsg.text || JSON.stringify(parsedMsg),
            level: parsedMsg.level || parsedMsg.severity || "info"
          };
          setLocalTerminalLogs(prev => [...prev, newLog]);
        }
      } catch (error) {
        console.error("Error processing SSE message:", error);
        const fallbackLog: Log = {
          timestamp: new Date().toISOString(),
          message: typeof msg === 'string' ? msg : JSON.stringify(msg),
          level: "info"
        };
        setLocalTerminalLogs(prev => [...prev, fallbackLog]);
      }
    },
  });

  // Cleanup function reference
  const cleanupRef = React.useRef<(() => void) | null>(null);

  /**
   * Instead of querying the DOM for `.MuiDrawer-paper`,
   * we store a local height state and apply it to our container.
   */
  const [height, setHeight] = React.useState(defaultHeight)
  const [drawerHeight, setDrawerHeight] = React.useState<number>(520); // Track drawer height for responsive tables
  const initialLogFetchRef = React.useRef<Set<string>>(new Set());

  // Update local logs when props change
  React.useEffect(() => {
    if (terminalLogs?.length > 0) {
      setLocalTerminalLogs(prevLogs => {
        // Only add logs that don't already exist (based on timestamp + message)
        const existingLogKeys = new Set(
          prevLogs.map(log => `${log.timestamp}-${log.message}`)
        );

        const newLogs = terminalLogs.filter(
          log => !existingLogKeys.has(`${log.timestamp}-${log.message}`)
        );

        return [...prevLogs, ...newLogs];
      });
    }
  }, [terminalLogs]);

  React.useEffect(() => {
    if (proplesLogs.length > 0) {
      setLocalProplesLogs(prevLogs => {
        // Only add logs that don't already exist (based on timestamp + message)
        const existingLogKeys = new Set(
          prevLogs.map(log => `${log.timestamp}-${log.message}`)
        );

        const newLogs = proplesLogs.filter(
          log => !existingLogKeys.has(`${log.timestamp}-${log.message}`)
        );

        return [...prevLogs, ...newLogs];
      });
    }
  }, [proplesLogs]);

  // Update local preview data when prop changes
  React.useEffect(() => {
    if (previewData) {
      setLocalPreviewData(previewData);
      // Reset preview tab to first tab when new data arrives
      setActivePreviewTab("0");
      // If preview data is provided and not in flow context, switch to the preview tab
      if (!isFlow) {
        setActiveTab("preview");
      }
    }
  }, [previewData, isFlow]);

  // Listen for drawer resize events to update table height
  React.useEffect(() => {
    const handleDrawerResize = (event: CustomEvent) => {
      const newHeight = event.detail.height;
      setDrawerHeight(newHeight);
    };

    // Add event listener for drawer resize
    document.addEventListener('bottomDrawerResize', handleDrawerResize as EventListener);

    // Also listen for window resize events
    const handleWindowResize = () => {
      // Update drawer height from the container if it exists
      const container = document.getElementById('bottom-drawer-container');
      if (container) {
        const containerHeight = container.getBoundingClientRect().height;
        setDrawerHeight(containerHeight);
      }
    };

    window.addEventListener('resize', handleWindowResize);
    
    // Initial height check
    handleWindowResize();

    return () => {
      document.removeEventListener('bottomDrawerResize', handleDrawerResize as EventListener);
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);
  const startStreaming = React.useCallback(async () => {
    // First, ensure any existing stream is stopped
    if (isStreaming && cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
      setIsStreaming(false);
    }
    
    // Now start a new stream if we have a valid name
    if (actualName && actualName !== "Unknown Flow" && actualName !== "Unknown Pipeline") {
      setIsStreaming(true);
      try {
        await start();
        cleanupRef.current = stop;
        
        // Add a system log to indicate stream started
        const systemLog: Log = {
          timestamp: new Date().toISOString(),
          message: `Connected to ${isFlow ? 'flow' : 'pipeline'} logs for: ${actualName}`,
          level: "info"
        };
        setLocalTerminalLogs(prev => [...prev, systemLog]);
      } catch (error) {
        console.error("Error starting stream:", error);
        setIsStreaming(false);
        
        // Add an error log
        const errorLog: Log = {
          timestamp: new Date().toISOString(),
          message: `Failed to connect to log stream: ${error instanceof Error ? error.message : String(error)}`,
          level: "error"
        };
        setLocalTerminalLogs(prev => [...prev, errorLog]);
      }
    } else if (!actualName || actualName === "Unknown Flow" || actualName === "Unknown Pipeline") {
      // Add a warning log if we don't have a valid name
      const warningLog: Log = {
        timestamp: new Date().toISOString(),
        message: `Cannot connect to log stream: ${isFlow ? 'Flow' : 'Pipeline'} name is not available`,
        level: "warning"
      };
      setLocalTerminalLogs(prev => [...prev, warningLog]);
    }
  }, [isStreaming, start, stop, actualName, isFlow, cleanupRef]);
  // We use a ref to track if we've already attempted to start streaming to prevent multiple calls
  const hasAttemptedStreamingRef = React.useRef(false);
  
  // Handle tab changes
  React.useEffect(() => {
    // When switching to the terminal tab in pipeline context
    if (activeTab === "terminal" && !isFlow && isOpen) {
      // If we're not streaming, start streaming
      if (!isStreaming && !hasAttemptedStreamingRef.current) {
        hasAttemptedStreamingRef.current = true;
        startStreaming();
      }
    } else {
      // When switching away from the terminal tab, reset the attempt tracking
      // but don't stop the stream (it will continue in the background)
      hasAttemptedStreamingRef.current = false;
    }
  }, [activeTab, isFlow, isOpen, isStreaming, startStreaming]);
  
  // Handle initial streaming setup when component mounts or isOpen changes
  React.useEffect(() => {
    // Only attempt to start streaming if:
    // 1. We're not in flow context
    // 2. The terminal is open
    // 3. The terminal tab is active
    // 4. We're not already streaming
    // 5. We haven't already attempted to start streaming
    if (!isFlow && isOpen && activeTab === "terminal" && !isStreaming && !hasAttemptedStreamingRef.current) {
      hasAttemptedStreamingRef.current = true;
      startStreaming();
    }
    
    // Cleanup function to reset the ref when component unmounts or closes
    return () => {
      if (!isOpen) {
        hasAttemptedStreamingRef.current = false;
      }
    };
  }, [isFlow, isOpen, activeTab, isStreaming, startStreaming]);
  
  const stopStreaming = React.useCallback(() => {
    if (isStreaming && cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
      setIsStreaming(false);
      
      // Add a system log to indicate stream stopped
      const systemLog: Log = {
        timestamp: new Date().toISOString(),
        message: `Disconnected from ${isFlow ? 'flow' : 'pipeline'} logs`,
        level: "info"
      };
      setLocalTerminalLogs(prev => [...prev, systemLog]);
    }
  }, [isStreaming, isFlow]);

 const fetchTaskLogs = React.useCallback(async (force = false) => {
    
    if (!dagRunId) {
      const noDagRunLog: Log = {
        timestamp: new Date().toISOString(),
        message: "No active DAG run. Please deploy the flow to see logs.",
        level: "warning"
      };
      setLocalTerminalLogs(prev => [...prev, noDagRunLog]);
      return;
    }
    
    if (!selectedEnvironment) {
      const noEnvLog: Log = {
        timestamp: new Date().toISOString(),
        message: "No environment selected. Please select an environment and deploy the flow.",
        level: "warning"
      };
      setLocalTerminalLogs(prev => [...prev, noEnvLog]);
      return;
    }
    
    // Generate a unique key for this task and DAG run
    // Treat empty string and "all" the same way
    const effectiveTaskId = (!selectedTaskId || selectedTaskId === "all") ? 'all' : selectedTaskId;
    const taskKey = `${dagRunId.dag_run_id}-${effectiveTaskId}`;
    try {
      setIsFetchingLogs(true);
      
      // Add a system log to indicate logs are being fetched
      const fetchingLog: Log = {
        timestamp: new Date().toISOString(),
        message: `Fetching logs for ${selectedTaskId ? `task: ${taskIds.find(t => t.id === selectedTaskId)?.title || selectedTaskId}` : 'all tasks'}...`,
        level: "info"
      };
      setLocalTerminalLogs(prev => [...prev, fetchingLog]);
      
      // Format the DAG ID (replace spaces with underscores)
      const formattedDagId = selectedFlow?.flow_name?.replace(/\s+/g, '_') || 
                             currentFlow?.flow_name?.replace(/\s+/g, '_') || '';

     let params:any={
        dag_id: formattedDagId,
        dag_run_id: dagRunId.dag_run_id,
        bh_env_name: selectedEnvironment.bh_env_name,
        // Only include task_id if it's not empty and not "all"
        ...(selectedTaskId && selectedTaskId !== "all" ? { task_id: selectedTaskId } : {}),
        airflow_env_name: dagRunId?.airflow_env_name
      }
      const response:any = await apiService.get({
      baseUrl: CATALOG_REMOTE_API_URL,
      url: '/api/v1/bh_airflow/get_dag_logs',
      method: 'GET',
      params
      });
      setFetchedTaskIds(prev => new Set([...prev, taskKey]));
      const logs = response?.data || response;
      
      if (logs) {
        // Check if logs is a string or an object
        let logsText = '';
        
        if (typeof logs === 'string') {
          logsText = logs;
        } else if (typeof logs === 'object') {
          // If it's an object, it might be a JSON response with a specific structure
          if (logs.log) {
            // If there's a log property, use that
            logsText = logs.log;
          } else {
            // Otherwise stringify the whole object
            logsText = JSON.stringify(logs, null, 2);
          }
        }
        
        
        // If we have no logs text, add a message
        if (!logsText || logsText.trim() === '') {
          const noContentLog: Log = {
            timestamp: new Date().toISOString(),
            message: `No log content available for ${selectedTaskId ? `task: ${selectedTaskId}` : 'this flow'}`,
            level: "warning"
          };
          setLocalTerminalLogs(prev => [...prev, noContentLog]);
          return;
        }
        
        // Split the logs by line and convert to Log objects
        const logLines = logsText.split('\n').filter(line => line.trim());
        
        const parsedLogs: Log[] = logLines.map(line => {
          // Try to extract timestamp if available
          const timestampMatch = line.match(/^\[(.*?)\]/);
          const timestamp = timestampMatch ? timestampMatch[1] : new Date().toISOString();
          
          // Determine log level based on content
          let level: "info" | "error" | "warning" = "info";
          if (line.toLowerCase().includes('error') || line.toLowerCase().includes('exception')) {
            level = "error";
          } else if (line.toLowerCase().includes('warn')) {
            level = "warning";
          }
          
          return {
            timestamp,
            message: line,
            level
          };
        });
        
        // Add the logs to the terminal
        setLocalTerminalLogs(prev => [...prev, ...parsedLogs]);
        
        // Add a success message
        const successLog: Log = {
          timestamp: new Date().toISOString(),
          message: `Successfully fetched ${parsedLogs.length} log entries`,
          level: "info"
        };
        setLocalTerminalLogs(prev => [...prev, successLog]);
      } else {
        // Add a message if no logs were found
        const noLogsLog: Log = {
          timestamp: new Date().toISOString(),
          message: `No logs found for ${selectedTaskId ? `task: ${selectedTaskId}` : 'this flow'}`,
          level: "warning"
        };
        setLocalTerminalLogs(prev => [...prev, noLogsLog]);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      
      // Add an error message
      const errorLog: Log = {
        timestamp: new Date().toISOString(),
        message: `Error fetching logs: ${error instanceof Error ? error.message : String(error)}`,
        level: "error"
      };
      setLocalTerminalLogs(prev => [...prev, errorLog]);
    } finally {
      setIsFetchingLogs(false);
    }
  }, [isFlow, dagRunId, selectedEnvironment, selectedTaskId, taskIds, selectedFlow, currentFlow, setLocalTerminalLogs, fetchedTaskIds, initialLogFetchRef]);

  // For flow context, fetch logs when task ID changes - only when terminal is open and active
  React.useEffect(() => {
    // Only run this effect if the terminal is open, we're in flow context, and the terminal tab is active
    // Also check if the task ID has actually changed to prevent unnecessary calls
    if (isOpen && isFlow && activeTab === "terminal" && prevTaskIdRef.current !== selectedTaskId) {
      prevTaskIdRef.current = selectedTaskId;
      const taskInfo = taskIds.find(t => t.id === selectedTaskId);
      const systemLog: Log = {
        timestamp: new Date().toISOString(),
        message: selectedTaskId === "" || selectedTaskId === "all"
          ? `Showing logs for all tasks`
          : `Showing logs for: ${taskInfo?.title || ""} (${selectedTaskId})`,
        level: "info"
      };
      setLocalTerminalLogs(prev => [...prev, systemLog]);
      
      // If already streaming, stop it (we don't restart for flow)
      if (isStreaming) {
        stopStreaming();
      }
      
      // Fetch logs for the selected task if we have a DAG run ID
      if (dagRunId && selectedEnvironment) {
        // Generate a unique key for this task and DAG run
        // Treat empty string and "all" the same way
        const effectiveTaskId = (!selectedTaskId || selectedTaskId === "all") ? 'all' : selectedTaskId;
        const taskKey = `${dagRunId.dag_run_id}-${effectiveTaskId}`;
        
        setLocalTerminalLogs(prev => {
          // Keep system messages and logs from other tasks
          return prev.filter(log => 
            log.level === "info" && 
            (log.message.includes("Select a task") || 
             log.message.includes("Showing logs for"))
          );
        });
        
        // Force fetch logs for the new task ID
        fetchTaskLogs(true);
      } else {
        const noRunLog: Log = {
          timestamp: new Date().toISOString(),
          message: !selectedEnvironment
            ? "No environment selected. Please select an environment and deploy the flow."
            : "No active DAG run. Please deploy the flow to see logs.",
          level: "warning"
        };
        setLocalTerminalLogs(prev => [...prev, noRunLog]);
      }
    }
  }, [isOpen, selectedTaskId, isFlow, isStreaming, activeTab, stopStreaming, taskIds, dagRunId, selectedEnvironment, fetchedTaskIds]);

  // Set initial selected task ID when taskIds change
  React.useEffect(() => {
    if (isFlow && taskIds.length > 0 && !selectedTaskId) {
      // Default to the first task in the list
      if (taskIds[0]) {
        setSelectedTaskId(taskIds[0].id);
      }
    }
  }, [isFlow, taskIds, selectedTaskId]);
  
  // Clear fetchedTaskIds when DAG run ID changes
  React.useEffect(() => {
    if (dagRunId) {
      setFetchedTaskIds(new Set());
      initialLogFetchRef.current = new Set();
    }
  }, [dagRunId?.dag_run_id]);

  // Scroll to bottom when logs change
  React.useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [localTerminalLogs, localProplesLogs, activeTab]);

  // We'll manually start streaming when needed, not automatically on mount

  // Create a ref to track initial log fetch
  
  // Track previous task ID to detect actual changes
  const prevTaskIdRef = React.useRef<string>("");
  
  // Track whether the terminal has been opened before
  const hasOpenedBeforeRef = React.useRef<boolean>(false);

  // Handle open/close state changes
  React.useEffect(() => {
    if (isOpen) {
      // When opening, set initial states
      setIsMinimized(false);
      setIsMaximized(false);
      setHeight(defaultHeight);

      // For flow context, fetch logs when the terminal is opened and the terminal tab is active
      if (isFlow && activeTab === "terminal") {
        // Flow-specific logic (if needed)
      }
      // We'll handle pipeline streaming in a separate useEffect to avoid multiple calls
    } else {
      // When closing, clean up
      setIsMinimized(false);
      setIsMaximized(false);
      setHeight(defaultHeight);

      // Always stop streaming when closed
      stopStreaming();
      
      // Reset the streaming attempt tracking
      hasAttemptedStreamingRef.current = false;
    }

    // Return cleanup function to stop streaming when component unmounts
    return () => {
      stopStreaming();
      hasAttemptedStreamingRef.current = false;
    };
  }, [isOpen, defaultHeight, stopStreaming, isFlow, activeTab])

  React.useEffect(() => {
    // Only apply scroll lock when the terminal is actually open
    if (isOpen) {
      // We don't need to lock scrolling as the drawer handles this
      document.body.style.pointerEvents = 'auto !important';
    }

    return () => {
      // Clean up when the component is unmounted
      document.body.removeAttribute('data-scroll-locked');
    };
  }, [isOpen]);

  // State to track streaming mode
  const [streamMode, setStreamMode] = React.useState<'sse' | 'regular'>('sse');
  
  // State to track if logs are being fetched
  const [isFetchingLogs, setIsFetchingLogs] = React.useState(false);
  
  // State to track which tasks we've already fetched logs for
  
  // Function to fetch logs for a specific task
 


  // Only render the component when it's supposed to be open
  if (!isOpen) {
    return null;
  }

  return (
    <div className="flex flex-col h-full">
      {!isMinimized && (
        <Tabs

          value={activeTab}
          onValueChange={(val) => {
            const newTab = val as "terminal" | "proples" | "preview";
            setActiveTab(newTab);
            
            // Trigger validation when problems tab is clicked
            if (newTab === "proples") {
              runValidation();
            }
          }}
        >
          <div className="flex justify-between items-center border-b bg-neutral-100 w-full">
            <TabsList className="bg-transparent">
              {/* Only show Preview tab for pipeline context, not for flow */}
              {!isFlow && (
                <TabsTrigger
                  value="preview"
                  className="px-4 py-1 text-sm"
                  disabled={!localPreviewData}
                >
                  Preview
                </TabsTrigger>
              )}
              <TabsTrigger
                value="terminal"
                className="px-4 py-1 text-sm"
              >
                Logs
              </TabsTrigger>
              <TabsTrigger
                value="proples"
                className="px-4 py-1 text-sm relative"
              >
                Problems
                {validationProblems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {validationProblems.length > 9 ? '9+' : validationProblems.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
            
            {/* Task ID select box - only show in flow context */}
            {isFlow && taskIds.length > 0 && (
              <div className="flex items-center mr-4">
                <label htmlFor="task-select" className="text-xs mr-2 text-gray-600 whitespace-nowrap">
                  Logs for:
                </label>
                <select
                  id="task-select"
                  value={selectedTaskId}
                  onChange={(e) => {
                    const newTaskId = e.target.value;
                    setSelectedTaskId(newTaskId);
                  }}
                  className="text-xs border rounded px-2 py-1 bg-white shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 max-w-[220px]"
                >
                  <option value="">Select a task...</option>
                  {taskIds.map((task) => (
                    <option key={task.id} value={task.id}>
                      {task.title} {task.id !== task.nodeId ? `(Task ID: ${task.id})` : ''}
                    </option>
                  ))}
                </select>
                <button 
                  onClick={() => fetchTaskLogs(true)} 
                  disabled={isFetchingLogs}
                  className="ml-2 text-xs px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-300 rounded flex items-center"
                >
                  {isFetchingLogs ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </>
                  ) : (
                    "Refresh Logs"
                  )}
                </button>
              </div>
            )}
          </div>

          <div
            className="flex-1 overflow-auto p-3 text-sm font-mono bg-white"
            // Custom scrollbars if desired
            style={{
              lineHeight: "1.4rem",
              height: `${Math.max(drawerHeight - 120, 300)}px`, // Responsive height based on drawer height
              maxHeight: "calc(100vh - 150px)",
              overflowY: "auto"
            }}
          >
            <TabsContent value="terminal">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  {!isFlow ? (
                    // For pipeline context, show streaming status
                    isStreaming ? (
                      <div className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                        <span className="text-xs text-green-600">Stream active ({streamMode === 'sse' ? 'SSE' : 'Regular'} mode)</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-gray-400 mr-2"></div>
                        <span className="text-xs text-gray-500">Stream inactive</span>
                      </div>
                    )
                  ) : (
                    // For flow context, show fetching status
                    isFetchingLogs ? (
                      <div className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-yellow-500 mr-2 animate-pulse"></div>
                        <span className="text-xs text-yellow-600">Fetching logs...</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-blue-400 mr-2"></div>
                        <span className="text-xs text-blue-600">Flow logs mode</span>
                        <button 
                          onClick={() => fetchTaskLogs(true)} 
                          className="ml-2 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-0.5 rounded transition-colors"
                          disabled={isFetchingLogs || !dagRunId || !selectedEnvironment}
                        >
                          {isFetchingLogs ? "Fetching..." : "Refresh Logs"}
                        </button>
                      </div>
                    )
                  )}
                  
                  {/* Show which task is being filtered if one is selected */}
                  {isFlow && selectedTaskId && (
                    <div className="ml-4 flex items-center">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                        {selectedTaskId === "" ? "All Tasks" : 
                          `${taskIds.find(t => t.id === selectedTaskId)?.title || ""} (${selectedTaskId})`}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center">
                  <div className="text-xs text-gray-400 mr-3">
                    {(isFlow ? validationLogs : localTerminalLogs)?.length > 0 ? 
                      `${(isFlow ? validationLogs : localTerminalLogs)?.length} log entries` : ''}
                  </div>
                  {(isFlow ? validationLogs : localTerminalLogs)?.length > 0 && (
                    <button 
                      onClick={() => isFlow ? setValidationLogs([]) : setLocalTerminalLogs([])} 
                      className="text-xs text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded px-2 py-0.5 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                  {isFlow && (
                    <button 
                      onClick={runValidation} 
                      disabled={isValidating}
                      className="ml-2 text-xs text-blue-500 hover:text-blue-700 bg-blue-100 hover:bg-blue-200 rounded px-2 py-0.5 transition-colors disabled:opacity-50"
                    >
                      {isValidating ? 'Validating...' : 'Re-validate'}
                    </button>
                  )}
                </div>
              </div>

              {(isFlow ? validationLogs : localTerminalLogs)?.length > 0 ? (
                <>
                  {(isFlow ? validationLogs : localTerminalLogs)?.map((log, index) => (
                    <div
                      key={index}
                      className="mb-1 flex items-start"
                      style={{
                        color:
                          log.level === "error"
                            ? "#dc3545"
                            : log.level === "warning"
                              ? "#ffc107"
                              : "#28a745",
                      }}
                    >
                      <span className="text-neutral-500 mr-2">
                        {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : index}
                      </span>
                      <span>{log.message}</span>
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </>
              ) : (
                <div className="italic text-neutral-500">
                  {isFlow ? (
                    isValidating ? "Running validation..." : "No validation logs available..."
                  ) : (
                    isStreaming ? "Waiting for logs..." : "No terminal logs available..."
                  )}
                </div>
              )}
            </TabsContent>
            <TabsContent value="proples">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700">
                    {isFlow ? 'Flow Validation Issues' : 'Pipeline Validation Issues'}
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="text-xs text-gray-400 mr-3">
                    {validationProblems?.length > 0 ? `${validationProblems?.length} issue(s) found` : ''}
                  </div>
                  {validationProblems?.length > 0 && (
                    <button 
                      onClick={() => setValidationProblems([])} 
                      className="text-xs text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded px-2 py-0.5 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                  <button 
                    onClick={runValidation} 
                    disabled={isValidating}
                    className="ml-2 text-xs text-blue-500 hover:text-blue-700 bg-blue-100 hover:bg-blue-200 rounded px-2 py-0.5 transition-colors disabled:opacity-50"
                  >
                    {isValidating ? 'Validating...' : 'Re-validate'}
                  </button>
                </div>
              </div>
              {validationProblems.length > 0 ? (
                <>
                  {validationProblems.map((log, index) => (
                    <div
                      key={index}
                      className="mb-2 p-2 rounded-md border-l-4 bg-gray-50"
                      style={{
                        borderLeftColor: log.level === "error" ? "#dc3545" : "#ffc107",
                        backgroundColor: log.level === "error" ? "#fff5f5" : "#fffbf0"
                      }}
                    >
                      <div className="flex items-start">
                        <span 
                          className="inline-block w-2 h-2 rounded-full mr-2 mt-2 flex-shrink-0"
                          style={{
                            backgroundColor: log.level === "error" ? "#dc3545" : "#ffc107"
                          }}
                        />
                        <div className="flex-1">
                          <div className="flex items-center mb-1">
                            <span 
                              className="text-xs font-medium px-2 py-0.5 rounded-full"
                              style={{
                                backgroundColor: log.level === "error" ? "#dc3545" : "#ffc107",
                                color: "white"
                              }}
                            >
                              {log.level.toUpperCase()}
                            </span>
                            <span className="text-xs text-gray-500 ml-2">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="text-sm text-gray-700">{log.message}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="italic text-neutral-500 mb-2">
                    {isValidating ? "Running validation..." : "No validation issues found"}
                  </div>
                  {!isValidating && validationProblems.length === 0 && validationLogs.length > 0 && (
                    <div className="text-sm text-green-600">
                      ✓ All validations passed successfully!
                    </div>
                  )}
                  {!isValidating && validationLogs.length === 0 && (
                    <button 
                      onClick={runValidation} 
                      className="text-sm text-blue-500 hover:text-blue-700 bg-blue-100 hover:bg-blue-200 rounded px-3 py-1 transition-colors"
                    >
                      Run Validation
                    </button>
                  )}
                </div>
              )}
            </TabsContent>

            {/* Only render Preview tab content for pipeline context, not for flow */}
            {!isFlow && (
              <TabsContent value="preview">
                {localPreviewData && localPreviewData.outputs && localPreviewData.outputs.length > 0 ? (
                  <div className="font-sans">
                    {localPreviewData.outputs.length > 1 ? (
                      // Multiple outputs - show tabs
                      <Tabs value={activePreviewTab} onValueChange={setActivePreviewTab}>
                        <TabsList className="inline-flex">
                          {localPreviewData.outputs.map((output, index) => (
                            <TabsTrigger key={index} value={index.toString()}>
                              {output.name || `Output ${index + 1}`}
                            </TabsTrigger>
                          ))}
                        </TabsList>
                        {localPreviewData.outputs.map((output, index) => {
                          // Create columns for the DataTable based on the first row
                          const columns = output.rows.length > 0
                            ? Object.keys(output.rows[0]).map(key => ({
                              accessorKey: key,
                              header: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
                              cell: ({ row }: any) => (
                                <div className="truncate max-w-[200px]" title={row.getValue(key)}>
                                  {row.getValue(key)}
                                </div>
                              )
                            }))
                            : [];

                          return (
                            <TabsContent key={index} value={index.toString()}>
                              {output.rows.length > 0 ? (
                                <div className="h-full">
                                  <PreviewDataTable
                                    data={output.rows}
                                    columns={columns}
                                  />
                                </div>
                              ) : (
                                <div className="italic text-neutral-500 p-4 text-center border rounded">
                                  No data available for this output
                                </div>
                              )}
                            </TabsContent>
                          );
                        })}
                      </Tabs>
                    ) : (
                      // Single output - show directly without tabs
                      localPreviewData.outputs.map((output, index) => {
                        // Create columns for the DataTable based on the first row
                        const columns = output.rows.length > 0
                          ? Object.keys(output.rows[0]).map(key => ({
                            accessorKey: key,
                            header: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
                            cell: ({ row }: any) => (
                              <div className="truncate max-w-[200px]" title={row.getValue(key)}>
                                {row.getValue(key)}
                              </div>
                            )
                          }))
                          : [];

                        return (
                          <div key={index} className="">
                            {output.name && output.name !== localPreviewData.transformationName && (
                              <h4 className="text-sm font-medium mb-2">{output.name}</h4>
                            )}

                            {output.rows.length > 0 ? (
                              <div className="h-full">
                                <PreviewDataTable
                                  data={output.rows}
                                  columns={columns}
                                />
                              </div>
                            ) : (
                              <div className="italic text-neutral-500 p-4 text-center border rounded">
                                No data available for this output
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                ) : (
                  <div className="italic text-neutral-500 flex items-center justify-center h-40">
                    No preview data available...
                  </div>
                )}
              </TabsContent>
            )}
          </div>
        </Tabs>
      )}
    </div> 
  )
}
  