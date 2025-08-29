import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {ReactFlow,  Background, Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Table, Pencil, Trash2, ChevronDown, Hammer } from 'lucide-react';
import { usePipelineContext } from '@/context/designers/DataPipelineContext';
import { useInfiniteQuery } from '@tanstack/react-query';
import { apiService } from '@/lib/api/api-service';
import { AGENT_REMOTE_URL, CATALOG_REMOTE_API_URL } from '@/config/platformenv';

const ITEMS_PER_PAGE = 1000;

// Query keys
const dataSourceKeys = {
  list: () => ['data-sources'] as const,
  layout: (dataSrcId: string) => ['data-source-layout', dataSrcId] as const,
};

// Type definitions for API responses
type DataSourceLayout = {
  data_src_lyt_id: number;
  data_src_lyt_name: string;
  data_src_lyt_fmt_cd: number;
  data_src_lyt_delimiter_cd: number;
  data_src_lyt_cust_delimiter: string;
  data_src_lyt_header: boolean;
  data_src_lyt_encoding: string | null;
  data_src_lyt_quote_chars_cd: number;
  data_src_lyt_escape_chars_cd: number;
  data_src_lyt_regex: string;
  data_src_lyt_pk: boolean;
  data_src_lyt_total_records: number;
  data_src_lyt_type_cd: number;
  data_src_lyt_is_mandatory: boolean;
  data_src_id: number;
  layout_fields: Array<{
    lyt_fld_id: number;
    lyt_fld_name: string;
    lyt_fld_desc: string;
    lyt_fld_order: number;
    lyt_fld_is_pk: boolean;
    lyt_fld_start: number;
    lyt_fld_length: number;
    lyt_fld_data_type_cd: number;
    lyt_fld_tags: any;
    lyt_id: number;
    lyt_fld_key: string;
    lyt_fld_data_type: string | null;
    pii_classification: string | null;
    pii_justification: string | null;
  }>;
  connection_config: any;
};

type DataSource = {
  data_src_id: number;
  data_src_name: string;
  data_src_desc: string;
  data_src_tags: any;
  data_src_key: string;
  connection_config_id: number | null;
  bh_project_id: number;
  data_src_quality: string;
  data_src_status_cd: number;
  file_name: string;
  connection_type: string | null;
  file_path_prefix: string;
  data_source_metadata: any[];
  bh_project_name: string;
  total_records: number;
  total_customer: number;
  data_source_layout: DataSourceLayout[];
  connection_config: any;
  data_src_relationships: any;
  pii_classification: string | null;
};

type DataSourceListResponse = {
  total: number;
  next: boolean;
  prev: boolean;
  offset: number;
  limit: number;
  data: DataSource[];
};

const mockDataTypes = ['INT', 'VARCHAR', 'DATE', 'DECIMAL(10,2)', 'CHAR(1)', '-'];

type Mapping = {
  targetTable: string;
  targetColumn: string;
  sourceTable: string;
  sourceColumns: string[];
  businessRule: string;
  technicalRule: string;
  joinDetails: string;
  // Hidden field to store the full transformation data from the API
  _transformations?: Array<{
    name: string;
    transformation: string;
    dependent_on: string[];
    condition?: string;
    group_by?: string[];
    aggregate?: Array<{
      target_column: string;
      expression: string;
    }>;
  }>;
};

const emptyMapping: Mapping = {
  targetTable: '',
  targetColumn: '',
  sourceTable: '', // Keep this for backward compatibility, but it won't be used in the UI
  sourceColumns: [],
  businessRule: '',
  technicalRule: '',
  joinDetails: '',
  _transformations: [],
};

const validateMapping = (mapping: Mapping) => {
  const errors: Partial<Record<keyof Mapping, string>> = {};
  if (!mapping.targetTable) errors.targetTable = 'Target Table is required';
  if (!mapping.targetColumn) errors.targetColumn = 'Target Column is required';
  if (!mapping.sourceColumns || mapping.sourceColumns.length === 0) errors.sourceColumns = 'At least one Source Column is required';
  if (!mapping.businessRule) errors.businessRule = 'Business Rule is required';
  // technicalRule is auto-generated
  return errors;
};

const RequirementForm: React.FC = () => {
  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [editingRows, setEditingRows] = useState<Set<number>>(new Set());
  const [errors, setErrors] = useState<Record<number, Partial<Record<keyof Mapping, string>>>>({});
  const [formErrors, setFormErrors] = useState<{ [k: string]: string }>({});
  const [activeTab, setActiveTab] = useState<string>('output');
  const [sourceColumns, setSourceColumns] = useState<Record<string, Array<{ id: number, name: string }>>>({});
  const [loadingColumns, setLoadingColumns] = useState<Record<string, boolean>>({});
  const [creatingRows, setCreatingRows] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ message: string, type: 'info' | 'success' | 'error' } | null>(null);
  const [convertingRules, setConvertingRules] = useState<Record<number, boolean>>({});
const {pipelineDtl}=usePipelineContext();
  // New state for top-level source and target selection
  const [selectedSourceTables, setSelectedSourceTables] = useState<string[]>([]);
  const [selectedTargetTables, setSelectedTargetTables] = useState<string[]>([]);
  const [suggestedJoins, setSuggestedJoins] = useState<Array<{
    leftTable: string;
    rightTable: string;
    leftColumn: string;
    rightColumn: string;
    confidence: number;
    reason: string;
  }>>([]);

  // Auto-hide notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Debug logging for state changes (remove in production)
  useEffect(() => {
    console.log('sourceColumns state updated:', sourceColumns);
  }, [sourceColumns]);

  useEffect(() => {
    console.log('loadingColumns state updated:', loadingColumns);
  }, [loadingColumns]);

  // Get pipeline name and project name from context
  const context = usePipelineContext();
  const { pipelineName: contextPipelineName, projectName: contextProjectName } = context;
  // Use context values if available, otherwise use local state
  const [localPipelineName, setLocalPipelineName] = useState('');
  const [localProjectName, setLocalProjectName] = useState('');

  const pipelineName = pipelineDtl?.name || pipelineDtl?.pipeline_name || contextPipelineName;
  const projectName = pipelineDtl?.project_name || pipelineDtl?.bh_project_name || contextProjectName;
  useEffect(() => {
    if (contextPipelineName) {
      setLocalPipelineName(contextPipelineName);
    }
    if (contextProjectName) {
      setLocalProjectName(contextProjectName);
    }
  }, [contextPipelineName, contextProjectName]);

  // Fetch data sources
  const {
    data: dataSourcesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingDataSources
  } = useInfiniteQuery({
    queryKey: dataSourceKeys.list(),
    queryFn: async ({ pageParam = 1 }) => {
      const response = await apiService.get({
        baseUrl: CATALOG_REMOTE_API_URL,
        url: '/data_source/list/',
        usePrefix: true,
        method: 'GET',
        metadata: {
          errorMessage: 'Failed to fetch data sources'
        },
        params: { limit: ITEMS_PER_PAGE }
      });
      return (response as DataSourceListResponse);
    },
    getNextPageParam: (lastPage: DataSourceListResponse, allPages) => {
      return lastPage?.data?.length === ITEMS_PER_PAGE ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1
  });

  // Flatten data sources from all pages
  const dataSources = dataSourcesData?.pages?.flatMap(page => page.data) || [];

  // Function to suggest join conditions based on column names and types
  const suggestJoinConditions = (sourceTables: string[]) => {
    const suggestions: Array<{
      leftTable: string;
      rightTable: string;
      leftColumn: string;
      rightColumn: string;
      confidence: number;
      reason: string;
    }> = [];

    // Common join column patterns
    const joinPatterns = [
      { pattern: /^id$/i, weight: 0.9, reason: 'Primary key match' },
      { pattern: /^.*_id$/i, weight: 0.8, reason: 'Foreign key pattern' },
      { pattern: /^.*_key$/i, weight: 0.7, reason: 'Key column pattern' },
      { pattern: /^key$/i, weight: 0.7, reason: 'Key column' },
      { pattern: /^code$/i, weight: 0.6, reason: 'Code column match' },
      { pattern: /^.*_code$/i, weight: 0.6, reason: 'Code column pattern' },
      { pattern: /^name$/i, weight: 0.5, reason: 'Name column match' },
    ];

    // Compare columns between tables
    for (let i = 0; i < sourceTables.length; i++) {
      for (let j = i + 1; j < sourceTables.length; j++) {
        const leftTable = sourceTables[i];
        const rightTable = sourceTables[j];

        const leftTableData = dataSources.find(ds => ds.data_src_name === leftTable);
        const rightTableData = dataSources.find(ds => ds.data_src_name === rightTable);

        if (leftTableData && rightTableData) {
          const leftTableId = leftTableData.data_src_id.toString();
          const rightTableId = rightTableData.data_src_id.toString();

          const leftColumns = sourceColumns[leftTableId] || [];
          const rightColumns = sourceColumns[rightTableId] || [];

          // Find matching columns
          leftColumns.forEach(leftCol => {
            rightColumns.forEach(rightCol => {
              // Exact name match
              if (leftCol.name.toLowerCase() === rightCol.name.toLowerCase()) {
                suggestions.push({
                  leftTable,
                  rightTable,
                  leftColumn: leftCol.name,
                  rightColumn: rightCol.name,
                  confidence: 0.95,
                  reason: 'Exact column name match'
                });
              } else {
                // Pattern-based matching
                joinPatterns.forEach(pattern => {
                  if (pattern.pattern.test(leftCol.name) && pattern.pattern.test(rightCol.name)) {
                    suggestions.push({
                      leftTable,
                      rightTable,
                      leftColumn: leftCol.name,
                      rightColumn: rightCol.name,
                      confidence: pattern.weight,
                      reason: pattern.reason
                    });
                  }
                });
              }
            });
          });
        }
      }
    }

    // Sort by confidence and remove duplicates
    const uniqueSuggestions = suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .filter((suggestion, index, arr) =>
        arr.findIndex(s =>
          s.leftTable === suggestion.leftTable &&
          s.rightTable === suggestion.rightTable &&
          s.leftColumn === suggestion.leftColumn &&
          s.rightColumn === suggestion.rightColumn
        ) === index
      );

    setSuggestedJoins(uniqueSuggestions);
  };

  // Handle source table selection
  const handleSourceTablesChange = async (tables: string[]) => {
    setSelectedSourceTables(tables);

    // Load columns for all selected tables
    const promises = tables.map(async (tableName) => {
      const selectedTable = dataSources.find(ds => ds.data_src_name === tableName);
      if (selectedTable) {
        await fetchSourceColumns(selectedTable.data_src_id.toString());
      }
    });

    await Promise.all(promises);

    // Generate join suggestions
    if (tables.length > 1) {
      suggestJoinConditions(tables);
    } else {
      setSuggestedJoins([]);
    }
  };

  // Handle target table selection and create rows
  const handleTargetTablesChange = async (tables: string[]) => {
    setSelectedTargetTables(tables);

    if (tables.length === 0) {
      setMappings([]);
      return;
    }

    setCreatingRows(true);

    try {
      // Load columns for all selected target tables
      const allColumns: Array<{ tableName: string, columns: Array<{ id: number, name: string }> }> = [];

      for (const tableName of tables) {
        const selectedTable = dataSources.find(ds => ds.data_src_name === tableName);
        if (selectedTable) {
          const columns = await fetchSourceColumns(selectedTable.data_src_id.toString());
          allColumns.push({ tableName, columns });
        }
      }

      // Create mappings for all target tables and their columns
      const newMappings: Mapping[] = [];
      allColumns.forEach(({ tableName, columns }) => {
        columns.forEach(column => {
          newMappings.push({
            ...emptyMapping,
            targetTable: tableName,
            targetColumn: column.name
          });
        });
      });

      setMappings(newMappings);

      // Set all rows to editing mode
      setEditingRows(new Set(newMappings.map((_, idx) => idx)));

      const totalRows = newMappings.length;
      const totalColumns = allColumns.reduce((sum, table) => sum + table.columns.length, 0);

      setNotification({
        message: `Created ${totalRows} mapping rows for ${tables.length} target table(s) with ${totalColumns} columns total`,
        type: 'success'
      });

    } catch (error) {
      console.error('Error creating target table mappings:', error);
      setNotification({
        message: 'Error creating mappings. Please try again.',
        type: 'error'
      });
    } finally {
      setCreatingRows(false);
    }
  };

  // Fetch columns for a specific data source
  const fetchSourceColumns = async (dataSrcId: string): Promise<Array<{ id: number, name: string }>> => {
    console.log('fetchSourceColumns called with ID:', dataSrcId);
    console.log('Current sourceColumns:', sourceColumns);
    console.log('Current loadingColumns:', loadingColumns);

    if (sourceColumns[dataSrcId]) {
      console.log('Already have columns, returning existing');
      return sourceColumns[dataSrcId];
    }

    if (loadingColumns[dataSrcId]) {
      console.log('Already loading, waiting...');
      // Wait for the existing request to complete
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (!loadingColumns[dataSrcId]) {
            clearInterval(checkInterval);
            resolve(sourceColumns[dataSrcId] || []);
          }
        }, 100);
      });
    }

    console.log('Setting loading state for:', dataSrcId);
    setLoadingColumns(prev => ({ ...prev, [dataSrcId]: true }));

    try {
      console.log('Making API call for dataSrcId:', dataSrcId);
      const response: DataSourceLayout[] = await apiService.get({
        baseUrl: CATALOG_REMOTE_API_URL,
        url: `/data_source_layout/list_full/?data_src_id=${dataSrcId}`,
        usePrefix: true,
        method: 'GET',
        metadata: {
          errorMessage: 'Failed to fetch source layout fields'
        }
      });

      console.log('API response:', response);

      // Extract columns from the layout fields
      const columns = response[0]?.layout_fields?.map(field => ({
        id: field.lyt_fld_id,
        name: field.lyt_fld_name
      })) || [];

      console.log('Extracted columns:', columns);
      setSourceColumns(prev => ({ ...prev, [dataSrcId]: columns }));
      return columns;
    } catch (error) {
      console.error('Error fetching source columns:', error);
      return [];
    } finally {
      setLoadingColumns(prev => ({ ...prev, [dataSrcId]: false }));
    }
  };



  // Multi-select component for tables
  const MultiSelectTables: React.FC<{
    value: string[];
    onValueChange: (value: string[]) => void;
    disabled?: boolean;
    placeholder: string;
    type: 'source' | 'target';
  }> = ({ value = [], onValueChange, disabled, placeholder, type }) => {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full justify-between min-h-[2.5rem]"
            disabled={disabled}
          >
            {value.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {value.slice(0, 3).map((tableName) => (
                  <Badge key={tableName} variant="secondary" className="text-xs">
                    {tableName}
                  </Badge>
                ))}
                {value.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{value.length - 3} more
                  </Badge>
                )}
              </div>
            ) : (
              placeholder
            )}
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0">
          <div className="p-4 space-y-2">
            <div className="text-sm font-medium">Select {type} Tables</div>
            {isLoadingDataSources ? (
              <div className="text-sm text-muted-foreground">Loading tables...</div>
            ) : dataSources.length === 0 ? (
              <div className="text-sm text-muted-foreground">No tables available</div>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-1">
                {dataSources.map((table) => (
                  <div key={table.data_src_id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${type}-table-${table.data_src_id}`}
                      checked={value.includes(table.data_src_name)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          onValueChange([...value, table.data_src_name]);
                        } else {
                          onValueChange(value.filter(name => name !== table.data_src_name));
                        }
                      }}
                    />
                    <label
                      htmlFor={`${type}-table-${table.data_src_id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                    >
                      {table.data_src_name}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    );
  };





  // Generate mock sample data for output
  const generateSampleRows = (cols: string[], n = 5) => {
    return Array.from({ length: n }, (_, i) =>
      Object.fromEntries(cols.map(col => [col, `${col}_val${i + 1}`]))
    );
  };

  // Output columns: all target columns in mappings
  const outputColumns = mappings.map(m => m.targetColumn).filter(Boolean);
  const outputSampleRows = generateSampleRows(outputColumns);

  // Unique source tables from mappings
  const uniqueSourceTables = Array.from(new Set(mappings.map(m => m.sourceTable).filter(Boolean)));
  // Sample data for each source table
  const tableSampleData = uniqueSourceTables.reduce((acc, tbl) => {
    // Get columns for this table from our sourceColumns state
    const selectedTable = dataSources.find(ds => ds.data_src_name === tbl);
    const tableId = selectedTable?.data_src_id?.toString();
    const columns = tableId ? sourceColumns[tableId]?.map(c => c.name) || [] : [];

    acc[tbl] = {
      columns,
      rows: generateSampleRows(columns),
    };
    return acc;
  }, {} as Record<string, { columns: string[]; rows: any[] }>);

  const handleSubmit = async () => {
    console.log('HandleSubmit called');
    console.log('pipelineDtl:', pipelineDtl);
    console.log('Pipeline name:', pipelineName);
    console.log('Project name:', projectName);
    console.log('Mappings:', mappings);
    console.log('Selected source tables:', selectedSourceTables); 
    console.log('Selected target tables:', selectedTargetTables);
    
    const newErrors: { [k: string]: string } = {};
    if (!pipelineName.trim()) newErrors.pipelineName = 'Pipeline Name is required';
    if (!projectName.trim()) newErrors.projectName = 'Project Name is required';
    if (mappings.length === 0) newErrors.mappings = 'At least one mapping is required';

    // Validate all mappings
    const mappingErrors: Record<number, Partial<Record<keyof Mapping, string>>> = {};
    let hasErrors = false;

    mappings.forEach((mapping, idx) => {
      const validation = validateMapping(mapping);
      if (Object.keys(validation).length > 0) {
        mappingErrors[idx] = validation;
        hasErrors = true;
      }
    });

    setFormErrors(newErrors);
    setErrors(mappingErrors);

    console.log('Form errors:', newErrors);
    console.log('Mapping errors:', mappingErrors);
    console.log('Has errors:', hasErrors);

    if (Object.keys(newErrors).length > 0 || hasErrors) {
      console.log('Validation failed, not submitting');
      return;
    }

    console.log('Validation passed, proceeding with API call');

    try {
      // Prepare source tables with their columns and connections
      const sourceTablesPayload = selectedSourceTables.map(tableName => {
        const tableData = dataSources.find(ds => ds.data_src_name === tableName);
        const tableColumns = sourceColumns[tableData?.data_src_id.toString() || ''] || [];
        
        return {
          table_name: tableName,
          data_src_id: tableData?.data_src_id,
          connection_config: tableData?.connection_config,
          connection_config_id: tableData?.connection_config_id,
          connection_type: tableData?.connection_type,
          file_path_prefix: tableData?.file_path_prefix,
          file_name: tableData?.file_name,
          columns: tableColumns.map(col => ({
            column_name: col.name,
            column_id: col.id
          }))
        };
      });

      // Prepare target tables with their columns and connections
      const targetTablesPayload = selectedTargetTables.map(tableName => {
        const tableData = dataSources.find(ds => ds.data_src_name === tableName);
        const tableColumns = sourceColumns[tableData?.data_src_id.toString() || ''] || [];
        
        return {
          table_name: tableName,
          data_src_id: tableData?.data_src_id,
          connection_config: tableData?.connection_config,
          connection_config_id: tableData?.connection_config_id,
          connection_type: tableData?.connection_type,
          file_path_prefix: tableData?.file_path_prefix,
          file_name: tableData?.file_name,
          columns: tableColumns.map(col => ({
            column_name: col.name,
            column_id: col.id 
          }))
        };
      });

      // Prepare technical rules list
      const technicalRules = mappings.map(mapping => ({
        target_table: mapping.targetTable,
        target_column: mapping.targetColumn,
        source_columns: mapping.sourceColumns,
        business_rule: mapping.businessRule,
        technical_rule: mapping.technicalRule,
        join_details: mapping.joinDetails
      }));

      // Prepare the payload for create_requirement_pipeline
      const payload = {
        pipeline_name: pipelineName,
        project_name: projectName,
        source_tables: sourceTablesPayload,
        target_tables: targetTablesPayload,
        technical_rules: technicalRules,
        suggested_joins: suggestedJoins
      };

      console.log('Submitting requirement payload:', payload);
      console.log('Source tables payload:', sourceTablesPayload);
      console.log('Target tables payload:', targetTablesPayload);
      console.log('API Base URL:', AGENT_REMOTE_URL);
      console.log('Full API URL will be:', `${AGENT_REMOTE_URL}/api/v1/business_rule/create_requirement_pipeline`);
      
      // Validate payload structure
      if (!payload.pipeline_name || !payload.project_name) {
        throw new Error('Pipeline name and project name are required');
      }
      
      if (!payload.source_tables || payload.source_tables.length === 0) {
        throw new Error('At least one source table is required');
      }
      
      if (!payload.target_tables || payload.target_tables.length === 0) {
        throw new Error('At least one target table is required');
      }
      
      if (!payload.technical_rules || payload.technical_rules.length === 0) {
        throw new Error('At least one technical rule is required');
      }

      // Call the API to create requirement pipeline
      const response = await apiService.post({
        url: '/api/v1/business_rule/create_requirement_pipeline',
        data: payload,
        baseUrl: AGENT_REMOTE_URL,
        usePrefix: false,
        method: 'POST',
        metadata: {
          errorMessage: 'Failed to create requirement pipeline'
        }
      });

      console.log('Create requirement pipeline response:', response);

      setNotification({
        message: 'Requirement pipeline created successfully!',
        type: 'success'
      });

    } catch (error) {
      console.error('Error creating requirement pipeline:', error);
      setNotification({
        message: 'Failed to create requirement pipeline',
        type: 'error'
      });
    }
  };

  const handleAddMapping = () => {
    const newMapping = { ...emptyMapping };
    const newMappings = [...mappings, newMapping];
    setMappings(newMappings);

    // Set the new row to editing mode
    const newEditingRows = new Set(editingRows);
    newEditingRows.add(newMappings.length - 1);
    setEditingRows(newEditingRows);
  };

  const handleEdit = (idx: number) => {
    const newEditingRows = new Set(editingRows);
    newEditingRows.add(idx);
    setEditingRows(newEditingRows);
  };

  const handleSave = (idx: number) => {
    const validation = validateMapping(mappings[idx]);
    if (Object.keys(validation).length > 0) {
      setErrors(prev => ({ ...prev, [idx]: validation }));
      return;
    }

    // Remove from editing mode and clear errors
    const newEditingRows = new Set(editingRows);
    newEditingRows.delete(idx);
    setEditingRows(newEditingRows);

    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[idx];
      return newErrors;
    });
  };

  const handleCancel = (idx: number) => {
    const newEditingRows = new Set(editingRows);
    newEditingRows.delete(idx);
    setEditingRows(newEditingRows);

    // Clear errors for this row
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[idx];
      return newErrors;
    });
  };

  const handleDelete = (idx: number) => {
    setMappings(mappings.filter((_, i) => i !== idx));

    // Remove from editing mode and clear errors
    const newEditingRows = new Set(editingRows);
    newEditingRows.delete(idx);
    setEditingRows(newEditingRows);

    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[idx];
      return newErrors;
    });
  };

  // Function to convert business rule to technical rule via API
  const convertBusinessRuleToTechnical = async (idx: number, businessRule: string) => {
    if (!businessRule.trim()) {
      return;
    }

    // Set loading state for this row
    setConvertingRules(prev => ({ ...prev, [idx]: true }));

    try {
      // Get the mapping to access source columns
      const mapping = mappings[idx];

      console.log('Debug - mapping for idx', idx, ':', mapping);
      console.log('Debug - mapping.sourceColumns:', mapping.sourceColumns);
      console.log('Debug - selectedSourceTables:', selectedSourceTables);

      // Group source columns by table
      const sourceTableGroups: Record<string, Array<{ name: string, description: string, type: string }>> = {};

      // If sourceColumns is empty but we have selectedSourceTables, use all columns from selected source tables
      let columnsToProcess = mapping.sourceColumns;
      if (columnsToProcess.length === 0 && selectedSourceTables.length > 0) {
        // Auto-populate with all columns from selected source tables
        columnsToProcess = [];
        selectedSourceTables.forEach(tableName => {
          const dataSource = dataSources.find(ds => ds.data_src_name === tableName);
          if (dataSource) {
            const dataSourceId = dataSource.data_src_id.toString();
            const columns = sourceColumns[dataSourceId] || [];
            columns.forEach(column => {
              columnsToProcess.push(`${tableName}.${column.name}`);
            });
          }
        });
        console.log('Debug - Auto-populated columnsToProcess:', columnsToProcess);
      }

      columnsToProcess.forEach(colName => {
        // Extract column name from "table.column" format
        const columnName = colName.includes('.') ? colName.split('.')[1] : colName;
        const sourceTable = colName.includes('.') ? colName.split('.')[0] : '';

        if (!sourceTableGroups[sourceTable]) {
          sourceTableGroups[sourceTable] = [];
        }

        // Find the data source and column details
        const dataSource = dataSources.find(ds => ds.data_src_name === sourceTable);

        if (dataSource) {
          const dataSourceId = dataSource.data_src_id.toString();
          const columns = sourceColumns[dataSourceId] || [];

          // Find the column details
          const columnDetails = columns.find(col => col.name === columnName);

          sourceTableGroups[sourceTable].push({
            name: columnName,
            description: `Column from ${sourceTable}`,
            type: columnDetails ? "string" : "string" // Default to string if type is unknown
          });
        } else {
          sourceTableGroups[sourceTable].push({
            name: columnName,
            description: "Source column",
            type: "string"
          });
        }
      });

      // Prepare source tables payload
      const sourceTablesPayload = Object.entries(sourceTableGroups).map(([tableName, columns]) => ({
        table_name: tableName,
        columns: getColumns()
      }));

      function getColumns() {
        let allColumns;

        selectedSourceTables.forEach(tableName => {
          const selectedTable = dataSources.find(ds => ds.data_src_name === tableName);
          if (selectedTable) {
            const tableId = selectedTable.data_src_id.toString();
            const columns = sourceColumns[tableId] || [];
            allColumns = columns.map((col:any) => ({
              name: col.name,
              description: `Column from ${tableName}`,
              type: col.type || "string" // Default to string if type is unknown
            }));
          }
        });
        return allColumns;

      }

      // Prepare target table payload
      const targetTablePayload = {
        table_name: mapping.targetTable,
        columns: [{
          name: mapping.targetColumn,
          description: `Target column in ${mapping.targetTable}`,
          type: "string"
        }]
      };

      // Prepare the API payload
      const payload = {
        business_rule: businessRule,
        context: `Mapping from source to ${mapping.targetTable}.${mapping.targetColumn}`,
        source_tables: sourceTablesPayload,
        target_tables: [targetTablePayload]
      };

      console.log('Sending payload to convert business rule:', payload);

      // Call the API to convert business rule
      const response:any = await apiService.post({
        url: '/business_rule/convert-business-rule',
        data: payload,
        baseUrl: AGENT_REMOTE_URL,
        usePrefix: true,
        method: 'POST',
        metadata: {
          errorMessage: 'Failed to convert business rule'
        }
      });

      console.log('Business rule conversion response:', response);

      // Update the technical rule with the response
      if (response && response.rule_description) {
        setMappings(prev => {
          const newMappings = [...prev];
          newMappings[idx] = {
            ...newMappings[idx],
            technicalRule: response.rule_description,
            // Store the full transformation data but don't display it in UI
            _transformations: response.transform
          };
          return newMappings;
        });
      }
    } catch (error) {
      console.error('Error converting business rule:', error);
      setNotification({
        message: 'Failed to convert business rule to technical rule',
        type: 'error'
      });
    } finally {
      // Clear loading state
      setConvertingRules(prev => ({ ...prev, [idx]: false }));
    }
  };

  const updateMapping = (idx: number, field: keyof Mapping, value: any) => {
    setMappings(prev => {
      const newMappings = [...prev];
      newMappings[idx] = { ...newMappings[idx], [field]: value };

      // If business rule changes, don't auto-generate technical rule anymore
      // It will be generated when the user clicks on the technical rule input

      return newMappings;
    });
  };

  // Source table selection is now handled in the top section, not in the table

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Notification */}
      {notification && (
        <div className={`mb-4 p-3 rounded-md border ${notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
            notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
              'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{notification.message}</p>
            <button
              onClick={() => setNotification(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Form */}
      <div className="space-y-4 mt-2">
        {/* Source and Target Selection */}
        <div className="bg-card rounded-lg border p-4">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-sm mb-4">Table Selection</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Source Tables */}
                <div>
                  <label className="block text-sm font-medium mb-2">Source Tables</label>
                  <MultiSelectTables
                    value={selectedSourceTables}
                    onValueChange={handleSourceTablesChange}
                    disabled={creatingRows}
                    placeholder="Select source tables..."
                    type="source"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Select multiple tables to read data from
                  </p>
                </div>

                {/* Target Tables */}
                <div>
                  <label className="block text-sm font-medium mb-2">Target Tables</label>
                  <MultiSelectTables
                    value={selectedTargetTables}
                    onValueChange={handleTargetTablesChange}
                    disabled={creatingRows}
                    placeholder="Select target tables..."
                    type="target"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Select tables to write data to (creates mapping rows automatically)
                  </p>
                </div>
              </div>
            </div>

            {/* Suggested Join Conditions */}
            {suggestedJoins.length > 0 && (
              <div className="border-t pt-4">
                <h4 className="font-semibold text-sm mb-3">Suggested Join Conditions</h4>
                <div className="space-y-2">
                  {suggestedJoins.slice(0, 5).map((join, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-blue-50 rounded border hover:bg-blue-100 transition-colors cursor-pointer"
                      onClick={() => {
                        // Apply this join condition to all relevant mappings
                        const joinCondition = `${join.leftTable}.${join.leftColumn} = ${join.rightTable}.${join.rightColumn}`;
                        setMappings(prev => prev.map(mapping => {
                          if ((mapping.sourceTable === join.leftTable || mapping.sourceTable === join.rightTable) &&
                            (selectedTargetTables.includes(mapping.targetTable))) {
                            return { ...mapping, joinDetails: joinCondition };
                          }
                          return mapping;
                        }));
                        setNotification({
                          message: `Applied join condition "${joinCondition}" to relevant mappings`,
                          type: 'success'
                        });
                      }}>
                      <div className="flex items-center space-x-2">
                        <div className="text-sm">
                          <span className="font-medium">{join.leftTable}</span>.
                          <span className="text-blue-600">{join.leftColumn}</span>
                          <span className="mx-2">=</span>
                          <span className="font-medium">{join.rightTable}</span>.
                          <span className="text-blue-600">{join.rightColumn}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {Math.round(join.confidence * 100)}% confidence
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {join.reason} • Click to apply
                      </div>
                    </div>
                  ))}
                  {suggestedJoins.length > 5 && (
                    <div className="text-xs text-muted-foreground">
                      +{suggestedJoins.length - 5} more suggestions available
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mappings Section */}
        <div className="bg-card rounded-lg border p-4">
          {/* Mappings Header */}
          <div className="flex justify-between items-center ">
            <div>
              <h3 className="font-semibold text-sm">Data Mappings</h3>
              <p className="text-xs text-muted-foreground">Define how data flows from source to target</p>
              <p className="text-xs text-blue-600 mt-1">
                💡 Tip: Mappings are automatically created when you select target tables above
              </p>
            </div>
            <Button
              size="sm"
              onClick={handleAddMapping}
              disabled={selectedTargetTables.length === 0}
            >
              + Add Mapping
            </Button>
          </div>
        </div>

        {/* Mappings Table */}
        <div className="bg-card rounded-lg border">
          {mappings.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <div className="mb-4">
                <Table className="w-12 h-12 mx-auto opacity-50" />
              </div>
              <h3 className="font-medium mb-2">No mappings defined yet</h3>
              <p className="text-sm">Select target tables above to automatically create mappings</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium text-sm">Target Column</th>
                    <th className="text-left p-3 font-medium text-sm">Source Columns</th>
                    <th className="text-left p-3 font-medium text-sm">Business Rule</th>
                    <th className="text-left p-3 font-medium text-sm">Technical Rule</th>
                    <th className="text-left p-3 font-medium text-sm">Join Details</th>
                    <th className="text-left p-3 font-medium text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mappings.map((mapping, idx) => (
                    <tr key={idx} className="border-b hover:bg-muted/30">
                      {editingRows.has(idx) ? (
                        <>
                          {/* Target Column - Dropdown with table.column format */}
                          <td className="p-3">
                            <Select
                              value={mapping.targetColumn}
                              onValueChange={val => updateMapping(idx, 'targetColumn', val)}
                              disabled={!mapping.targetTable}
                            >
                              <SelectTrigger className="h-8 text-sm">
                                <SelectValue placeholder={!mapping.targetTable ? "Select target table first..." : "Select column..."} />
                              </SelectTrigger>
                              <SelectContent style={{ zIndex: 9999 }}>
                                {/* Get columns for the current target table */}
                                {(() => {
                                  const selectedTable = dataSources.find(ds => ds.data_src_name === mapping.targetTable);
                                  const tableId = selectedTable?.data_src_id?.toString();
                                  const columns = tableId ? sourceColumns[tableId] || [] : [];
                                  const isLoading = tableId ? loadingColumns[tableId] : false;

                                  if (isLoading) {
                                    return <SelectItem value="loading" disabled>Loading columns...</SelectItem>;
                                  }

                                  return columns.map(col => (
                                    <SelectItem key={col.id} value={col.name}>
                                      {mapping.targetTable}.{col.name}
                                    </SelectItem>
                                  ));
                                })()}
                              </SelectContent>
                            </Select>
                            {errors[idx]?.targetColumn && (
                              <div className="text-xs text-destructive mt-1">{errors[idx].targetColumn}</div>
                            )}
                          </td>

                          {/* Source Columns - Show ALL available columns from ALL selected source tables */}
                          <td className="p-3">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  className="w-full justify-between h-8 text-sm"
                                  disabled={selectedSourceTables.length === 0}
                                >
                                  {(() => {
                                    const selectedColumns = Array.isArray(mapping.sourceColumns) ? mapping.sourceColumns : [];
                                    if (selectedColumns.length === 0) {
                                      return selectedSourceTables.length === 0 ? "Select source tables first..." : "Select columns...";
                                    } else if (selectedColumns.length === 1) {
                                      return selectedColumns[0];
                                    } else {
                                      return `${selectedColumns.length} columns selected`;
                                    }
                                  })()}
                                  <ChevronDown className="h-4 w-4 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-80 p-0 max-h-96 overflow-y-auto" style={{ zIndex: 9999 }}>
                                <div className="p-4 space-y-2">
                                  <div className="text-sm font-medium">Select Source Columns</div>
                                  {(() => {
                                    let hasLoadingTable = false;
                                    const allColumns: Array<{ id: number, name: string, tableName: string }> = [];

                                    selectedSourceTables.forEach(tableName => {
                                      const selectedTable = dataSources.find(ds => ds.data_src_name === tableName);
                                      if (selectedTable) {
                                        const tableId = selectedTable.data_src_id.toString();
                                        const columns = sourceColumns[tableId] || [];
                                        const isLoading = loadingColumns[tableId];

                                        if (isLoading) {
                                          hasLoadingTable = true;
                                        } else {
                                          columns.forEach(col => {
                                            allColumns.push({
                                              id: col.id,
                                              name: col.name,
                                              tableName: tableName
                                            });
                                          });
                                        }
                                      }
                                    });

                                    if (hasLoadingTable) {
                                      return <div className="text-sm text-muted-foreground">Loading columns...</div>;
                                    }

                                    if (allColumns.length === 0) {
                                      return <div className="text-sm text-muted-foreground">No columns available</div>;
                                    }

                                    // Group columns by table
                                    const groupedColumns = allColumns.reduce((acc, col) => {
                                      if (!acc[col.tableName]) acc[col.tableName] = [];
                                      acc[col.tableName].push(col);
                                      return acc;
                                    }, {} as Record<string, typeof allColumns>);

                                    return (
                                      <div className="space-y-3">
                                        {Object.entries(groupedColumns).map(([tableName, columns]) => (
                                          <div key={tableName} className="space-y-2">
                                            <div className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                                              {tableName}
                                            </div>
                                            {columns.map((column) => {
                                              const fullColumnName = `${tableName}.${column.name}`;
                                              const selectedColumns = Array.isArray(mapping.sourceColumns) ? mapping.sourceColumns : [];
                                              return (
                                                <div key={column.id} className="flex items-center space-x-2 pl-2">
                                                  <Checkbox
                                                    id={`source-column-${idx}-${column.id}`}
                                                    checked={selectedColumns.includes(fullColumnName)}
                                                    onCheckedChange={(checked) => {
                                                      const currentColumns = Array.isArray(mapping.sourceColumns) ? mapping.sourceColumns : [];
                                                      if (checked) {
                                                        updateMapping(idx, 'sourceColumns', [...currentColumns, fullColumnName]);
                                                      } else {
                                                        updateMapping(idx, 'sourceColumns', currentColumns.filter(name => name !== fullColumnName));
                                                      }
                                                    }}
                                                  />
                                                  <label
                                                    htmlFor={`source-column-${idx}-${column.id}`}
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                  >
                                                    {fullColumnName}
                                                  </label>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        ))}
                                      </div>
                                    );
                                  })()}
                                </div>
                              </PopoverContent>
                            </Popover>
                            {errors[idx]?.sourceColumns && (
                              <div className="text-xs text-destructive mt-1">{errors[idx].sourceColumns}</div>
                            )}
                          </td>

                          {/* Business Rule */}
                          <td className="p-3">
                            <Input
                              value={mapping.businessRule}
                              onChange={e => {
                                // Update the business rule
                                updateMapping(idx, 'businessRule', e.target.value);
                                // Clear the technical rule when business rule changes
                                // It will be regenerated when the user clicks on the technical rule input
                                updateMapping(idx, 'technicalRule', '');
                              }}
                              placeholder="Business rule..."
                              className="h-8 text-sm"
                            />
                            {errors[idx]?.businessRule && (
                              <div className="text-xs text-destructive mt-1">{errors[idx].businessRule}</div>
                            )}
                          </td>

                          {/* Technical Rule (now editable) */}
                          <td className="p-3">
                            <div className="flex gap-2">
                              <Input
                                value={mapping.technicalRule}
                                onChange={e => updateMapping(idx, 'technicalRule', e.target.value)}
                                placeholder={convertingRules[idx] ? "Converting..." : "Technical rule will be generated or can be typed..."}
                                className={`h-8 text-sm flex-1 ${convertingRules[idx] ? 'animate-pulse' : ''}`}
                                disabled={convertingRules[idx]}
                              />
                              {mapping.businessRule && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => convertBusinessRuleToTechnical(idx, mapping.businessRule)}
                                  title="Generate technical rule from business rule"
                                  disabled={convertingRules[idx]}
                                >
                                  {convertingRules[idx] ? <Hammer className="h-4 w-4 animate-pulse" /> : <Hammer className="h-4 w-4" />}
                                </Button>
                              )}
                            </div>
                          </td>

                          {/* Join Details */}
                          <td className="p-3">
                            <Input
                              value={mapping.joinDetails}
                              onChange={e => updateMapping(idx, 'joinDetails', e.target.value)}
                              placeholder="Join details..."
                              className="h-8 text-sm"
                            />
                          </td>

                          {/* Actions */}
                          <td className="p-3">
                            <div className="flex items-center gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-green-600 hover:bg-green-100"
                                onClick={() => handleSave(idx)}
                                title="Save"
                              >
                                ✓
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-red-600 hover:bg-red-100"
                                onClick={() => handleCancel(idx)}
                                title="Cancel"
                              >
                                ✕
                              </Button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          {/* Display Mode */}
                          <td className="p-3 text-sm">{mapping.targetTable && mapping.targetColumn ? `${mapping.targetTable}.${mapping.targetColumn}` : (mapping.targetColumn || '-')}</td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-1">
                              {Array.isArray(mapping.sourceColumns) ? (
                                mapping.sourceColumns.slice(0, 2).map((col, colIdx) => (
                                  <Badge key={colIdx} variant="secondary" className="text-xs h-5">
                                    {col}
                                  </Badge>
                                ))
                              ) : (
                                <Badge variant="secondary" className="text-xs h-5">
                                  {mapping.sourceColumns || '-'}
                                </Badge>
                              )}
                              {Array.isArray(mapping.sourceColumns) && mapping.sourceColumns.length > 2 && (
                                <Badge variant="secondary" className="text-xs h-5">
                                  +{mapping.sourceColumns.length - 2}
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="p-3 text-sm max-w-xs truncate" title={mapping.businessRule}>
                            {mapping.businessRule || '-'}
                          </td>
                          <td className="p-3 text-sm max-w-xs truncate" title={mapping.technicalRule}>
                            {mapping.technicalRule || '-'}
                            {/* Hidden transformations are not displayed in the UI */}
                          </td>
                          <td className="p-3 text-sm max-w-xs truncate" title={mapping.joinDetails}>
                            {mapping.joinDetails || '-'}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                onClick={() => handleEdit(idx)}
                                title="Edit"
                              >
                                <Pencil className="w-3 h-3" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                onClick={() => handleDelete(idx)}
                                title="Delete"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Submit Button */}
          {mappings.length > 0 && (
            <div className="p-4 border-t flex justify-end">
              <Button onClick={handleSubmit} disabled={mappings.length === 0}>
                Submit Requirement
              </Button>
            </div>
          )}
        </div>

        {/* Preview Section - Only show if mappings exist */}
        {mappings.length > 0 && (
          <div className="bg-card rounded-lg border">
            <div className="border-b">
              <div className="flex gap-1 p-1">
                <button
                  className={`px-3 py-2 text-sm font-medium rounded transition-colors ${activeTab === 'output' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                  onClick={() => setActiveTab('output')}
                >
                  Output Preview
                </button>
                {uniqueSourceTables.map(tbl => (
                  <button
                    key={tbl}
                    className={`px-3 py-2 text-sm font-medium rounded transition-colors ${activeTab === `table-${tbl}` ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                    onClick={() => setActiveTab(`table-${tbl}`)}
                  >
                    {tbl}
                  </button>
                ))}
                <button
                  className={`px-3 py-2 text-sm font-medium rounded transition-colors ${activeTab === 'pipeline' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                  onClick={() => setActiveTab('pipeline')}
                >
                  Pipeline
                </button>
              </div>
            </div>
            <div className="p-4">
              {activeTab === 'output' && (
                <div>
                  <h4 className="font-medium mb-3 text-sm">Expected Output Structure</h4>
                  {outputColumns.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No output columns defined yet.</p>
                  ) : (
                    <div className="border rounded-md overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                          <tr>
                            {outputColumns.map(col => (
                              <th key={col} className="px-3 py-2 text-left font-medium">{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {outputSampleRows.slice(0, 3).map((row, idx) => (
                            <tr key={idx} className="border-t">
                              {outputColumns.map(col => (
                                <td key={col} className="px-3 py-2 text-muted-foreground">{row[col] || '-'}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {uniqueSourceTables.map(tbl => (
                activeTab === `table-${tbl}` && (
                  <div key={tbl}>
                    <h4 className="font-medium mb-3 text-sm">{tbl} Sample Data</h4>
                    {tableSampleData[tbl] ? (
                      <div className="border rounded-md overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/50">
                            <tr>
                              {tableSampleData[tbl].columns.slice(0, 6).map(col => (
                                <th key={col} className="px-3 py-2 text-left font-medium">{col}</th>
                              ))}
                              {tableSampleData[tbl].columns.length > 6 && (
                                <th className="px-3 py-2 text-left font-medium text-muted-foreground">...</th>
                              )}
                            </tr>
                          </thead>
                          <tbody>
                            {tableSampleData[tbl].rows.slice(0, 3).map((row, idx) => (
                              <tr key={idx} className="border-t">
                                {tableSampleData[tbl].columns.slice(0, 6).map(col => (
                                  <td key={col} className="px-3 py-2 text-muted-foreground">{row[col] || '-'}</td>
                                ))}
                                {tableSampleData[tbl].columns.length > 6 && (
                                  <td className="px-3 py-2 text-muted-foreground">...</td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">No data available.</p>
                    )}
                  </div>
                )
              ))}

              {activeTab === 'pipeline' && (
                <div>
                  <h4 className="font-medium mb-3 text-sm">Pipeline Visualization</h4>
                  <div className="border rounded-md" style={{ height: 250 }}>
                    <ReactFlow
                      nodes={mappings.map((m, idx) => ({
                        id: String(idx + 1),
                        data: { label: m.targetColumn || `Mapping ${idx + 1}` },
                        position: { x: idx * 200, y: 100 },
                      }))}
                      edges={mappings.length > 1
                        ? mappings.slice(1).map((_, idx) => ({
                          id: `e${idx + 1}-${idx + 2}`,
                          source: String(idx + 1),
                          target: String(idx + 2),
                        }))
                        : []}
                      fitView
                    >
                      <Background />
                      <Controls />
                    </ReactFlow>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequirementForm;