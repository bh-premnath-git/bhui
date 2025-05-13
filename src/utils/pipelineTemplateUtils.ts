/**
 * Utility functions for building pipeline templates with strong typing
 */

/**
 * Enum for pipeline transformation types
 */
export enum TransformationType {
  SCHEMA = 'schema',
  FILTER = 'filter',
  AGGREGATOR = 'aggregator',
  SORTER = 'sorter',
  TARGET = 'target',
  JOIN = 'join',
  UNION = 'union',
  DROP = 'drop',
  SELECT = 'select',
  SEQUENCE = 'sequence'
}

// Map string transformation types to enum values for easier lookup
export const transformationTypeMap: Record<string, TransformationType> = {
  'schema': TransformationType.SCHEMA,
  'filter': TransformationType.FILTER,
  'aggregator': TransformationType.AGGREGATOR,
  'sorter': TransformationType.SORTER,
  'target': TransformationType.TARGET,
  'join': TransformationType.JOIN,
  'union': TransformationType.UNION,
  'drop': TransformationType.DROP,
  'select': TransformationType.SELECT,
  'sequence': TransformationType.SEQUENCE
};

/**
 * Enum for target types
 */
export enum TargetType {
  DATABASE = 'Database',
  RELATIONAL = 'Relational',
  FILE = 'File',
  CUSTOM = 'Custom'
}

/**
 * Enum for source types
 */
export enum SourceType {
  FILE = 'File',
  RELATIONAL = 'Relational'
}

/**
 * Interface for a data source
 */
export interface DataSource {
  data_src_id: number | string;
  data_src_name: string;
  file_name?: string;
  file_path?: string;
  file_path_prefix?: string;
  file_type?: string;
  table_name?: string;
  query?: string;
  connection_config?: {
    connection_config_name?: string;
    connection_config_id?: string;
    custom_metadata?: {
      connection_type: string;
      database?: string;
      schema?: string;
      secret_name?: string;
      [key: string]: any;
    };
  };
  read_options?: {
    header?: boolean;
    delimiter?: string;
    quote?: string;
    [key: string]: any;
  };
  // Transformation configurations stored on the source
  schema_transformation?: TransformationConfig;
  filter_transformation?: TransformationConfig;
  aggregator_transformation?: TransformationConfig;
  sorter_transformation?: TransformationConfig;
  target_transformation?: TransformationConfig;
  join_transformation?: TransformationConfig;
  union_transformation?: TransformationConfig;
  drop_transformation?: TransformationConfig;
  select_transformation?: TransformationConfig;
  sequence_transformation?: TransformationConfig;
  columns?: Array<{ name: string; dataType: string }>;
  [key: string]: any;
}

/**
 * Interface for transformation configuration
 */
export interface TransformationConfig {
  name?: string;
  dependent_on?: string[];
  transformation?: string;
  condition?: string;
  derived_fields?: Array<{ name: string; expression: string }>;
  aggregations?: Array<{ target_column: string; expression: string }>;
  group_by?: Array<{ group_by: string }>;
  sort_columns?: Array<{ column_name: string; sort_order: 'asc' | 'desc' }>;
  drop_columns?: string[];
  select_columns?: string[];
  sequence_column?: string;
  start_value?: number;
  increment_by?: number;
  [key: string]: any;
}

/**
 * Interface for target configuration
 */
export interface TargetConfig {
  type: TargetType | string;
  connectionType: string;
  schema?: string;
  database?: string;
  filePath?: string;
  fileFormat?: string;
  connection?: {
    name?: string;
    connection_type?: string;
    connection_config_id?: string;
    schema?: string;
    database?: string;
    secret_name?: string;
    file_path_prefix?: string;
    [key: string]: any;
  };
  customConfig?: {
    name?: string;
    targetName?: string;
    tableName?: string;
    loadMode?: string;
    fileName?: string;
    writeOptions?: Record<string, any>;
    [key: string]: any;
  };
  [key: string]: any;
}

/**
 * Interface for pipeline template
 */
export interface PipelineTemplate {
  $schema: string;
  name: string;
  description: string;
  version: string;
  parameters: any[];
  connections: Record<string, any>;
  sources: Record<string, any>;
  targets: Record<string, any>;
  transformations: any[];
  [key: string]: any;
}

/**
 * Creates a default pipeline template
 */
export const createDefaultTemplate = (name: string, description: string): PipelineTemplate => ({
  $schema: "https://json-schema.org/draft-07/schema#",
  name: name || "New Pipeline",
  description: description || "",
  version: "1.0",
  parameters: [],
  connections: {},
  sources: {},
  targets: {},
  transformations: []
});

/**
 * Creates a connection object for a data source
 */
export const createConnectionForSource = (source: DataSource): Record<string, any> => {
  if (source.connection_config?.custom_metadata?.connection_type) {
    // Database connection
    return source.connection_config.custom_metadata;
  } else {
    // File connection
    return {
      "name": `${source.data_src_name}_connection`,
      "connection_type": "Local",
      "file_path_prefix": source.file_path_prefix || `examples/`
    };
  }
};

/**
 * Creates a source object for the pipeline template
 */
export const createSourceObject = (source: DataSource, connectionId: string, connection: any): Record<string, any> => {
  if (source.connection_config?.custom_metadata?.connection_type) {
    // Database source
    return {
      "name": `${source.data_src_name}`,
      "source_type": SourceType.RELATIONAL,
      "file_name": source.data_src_name,
      "table_name": source.table_name || source.data_src_name,
      "data_src_id": source.data_src_id.toString(),
      "connection": connection
    };
  } else {
    // File source
    return {
      "name": `${source.data_src_name}`,
      "source_type": SourceType.FILE,
      "file_name": source.file_name || source.data_src_name,
      "data_src_id": source.data_src_id.toString(),
      "connection": connection
    };
  }
};

/**
 * Creates a reader transformation for a data source
 */
export const createReaderTransformation = (source: DataSource, sourceObj: any): any => ({
  "name": `read_${source.data_src_name}`,
  "dependent_on": [],
  "transformation": "Reader",
  "source": sourceObj,
  "read_options": source.read_options || {
    "header": true
  }
});

/**
 * Creates a schema transformation
 */
const createSchemaTransformation = (sources: DataSource[]): any => {
  // Find schema transformation in existing transformations
  const schemaTransformation = sources.find(source => 
    source.schema_transformation);
  
  // Determine the correct dependencies for schema transformation
  const dependencies = schemaTransformation?.schema_transformation?.dependent_on || [];
  
  // Use derived fields from the user-submitted schema transformation if available
  let derivedFields = [];
  
  if (schemaTransformation?.schema_transformation?.derived_fields && 
      schemaTransformation.schema_transformation.derived_fields.length > 0) {
    // Use user-submitted derived fields
    derivedFields = schemaTransformation.schema_transformation.derived_fields;
  } else {
    // Only use defaults if no user-submitted fields are available
    derivedFields = [
      {
        "name": "full_name",
        "expression": "concat(`first_name`, ' ', `last_name`)"
      },
      {
        "name": "is_adult",
        "expression": "case when `age` >= 18 then 'Yes' else 'No' end"
      }
    ];
  }
  
  return {
    "name": "schema_transformation",
    "dependent_on": dependencies,
    "transformation": "SchemaTransformation",
    "derived_fields": derivedFields
  };
};

/**
 * Creates a filter transformation
 */
const createFilterTransformation = (sources: DataSource[], filterCondition: string): any => {
  // Find filter transformation in existing transformations
  const filterTransformation = sources.find(source => 
    source.filter_transformation);
  
  // Determine dependencies
  const dependencies = filterTransformation?.filter_transformation?.dependent_on || [];
  
  // Get user-provided filter condition or use default
  const condition = filterTransformation?.filter_transformation?.condition || 
                    filterCondition || 
                    "age >= 18";
  
  return {
    "name": "filter_transformation",
    "dependent_on": dependencies,
    "transformation": "Filter",
    "condition": condition
  };
};

/**
 * Creates an aggregator transformation
 */
const createAggregatorTransformation = (sources: DataSource[]): any => {
  // Find aggregator transformation in existing transformations
  const aggregatorTransformation = sources.find(source => 
    source.aggregator_transformation);
  
  // Determine dependencies
  const dependencies = aggregatorTransformation?.aggregator_transformation?.dependent_on || [];
  
  // Get user-provided aggregation settings or use defaults
  const aggregations = aggregatorTransformation?.aggregator_transformation?.aggregations || 
                      [{ target_column: 'total_count', expression: 'count(*)' }];
  
  const groupBy = aggregatorTransformation?.aggregator_transformation?.group_by || 
                 [{ group_by: 'category' }];
  
  return {
    "name": "aggregator_transformation",
    "dependent_on": dependencies,
    "transformation": "Aggregator",
    "aggregations": aggregations,
    "group_by": groupBy
  };
};

/**
 * Creates a sorter transformation
 */
const createSorterTransformation = (sources: DataSource[]): any => {
  // Find sorter transformation in existing transformations
  const sorterTransformation = sources.find(source => 
    source.sorter_transformation);
  
  // Determine dependencies
  const dependencies = sorterTransformation?.sorter_transformation?.dependent_on || [];
  
  // Get user-provided sort columns or use defaults
  const sortColumns = sorterTransformation?.sorter_transformation?.sort_columns || 
                     [{ column_name: 'id', sort_order: 'asc' }];
  
  return {
    "name": "sorter_transformation",
    "dependent_on": dependencies,
    "transformation": "Sorter",
    "sort_columns": sortColumns
  };
};

/**
 * Creates a join transformation
 */
const createJoinTransformation = (sources: DataSource[]): any => {
  // Find join transformation in existing transformations
  const joinTransformation = sources.find(source => 
    source.join_transformation);
  
  if (!joinTransformation) {
    console.warn("No join transformation found in sources");
    return null;
  }
  
  // Determine dependencies - Join requires at least two dependencies
  let dependencies = joinTransformation.join_transformation?.dependent_on || [];
  
  // Ensure dependencies is an array
  if (!Array.isArray(dependencies)) {
    // If it's a comma-separated string, split it
    if (typeof dependencies === 'string' && dependencies.includes(',')) {
      dependencies = dependencies.split(',').map(dep => dep.trim());
    } else {
      // If it's a single string or other value, convert to array
      dependencies = [dependencies].filter(Boolean);
    }
  }
  
  // Get user-provided join conditions or use defaults
  const conditions = joinTransformation.join_transformation?.conditions || [
    {
      join_type: 'inner',
      join_condition: 'a.id = b.id'
    }
  ];
  
  console.log("Creating join transformation with dependencies:", dependencies);
  console.log("Join transformation source data:", joinTransformation.join_transformation);
  
  // Ensure we have at least two dependencies for join transformation
  if (dependencies.length < 2) {
    console.warn("Join transformation requires at least two dependencies, but only found:", dependencies);
    return null; // Return null if we still don't have enough dependencies
  }
  
  return {
    "name": "join_transformation",
    "dependent_on": dependencies,
    "transformation": "Joiner",
    "conditions": conditions,
    "join_type": conditions[0]?.join_type || 'inner'
  };
};

/**
 * Creates a union transformation
 */
const createUnionTransformation = (sources: DataSource[]): any => {
  // Find union transformation in existing transformations
  const unionTransformation = sources.find(source => 
    source.union_transformation);
  
  // If no union transformation is found in sources, return null
  // This prevents automatic dependency selection
  if (!unionTransformation) {
    console.warn("No union transformation found in sources");
    return null;
  }
  
  // Determine dependencies - Union requires at least two dependencies
  let dependencies = unionTransformation.union_transformation?.dependent_on || [];
  
  // Ensure dependencies is an array
  if (!Array.isArray(dependencies)) {
    // If it's a comma-separated string, split it
    if (typeof dependencies === 'string' && dependencies.includes(',')) {
      dependencies = dependencies.split(',').map(dep => dep.trim());
    } else {
      // If it's a single string or other value, convert to array
      dependencies = [dependencies].filter(Boolean);
    }
  }
  
  // Get user-provided union settings or use defaults
  const unionType = unionTransformation.union_transformation?.union_type || 'distinct';
  
  console.log("Creating union transformation with dependencies:", dependencies);
  console.log("Union transformation source data:", unionTransformation.union_transformation);
  
  // Ensure we have at least two dependencies for union transformation
  if (dependencies.length < 2) {
    console.warn("Union transformation requires at least two dependencies, but only found:", dependencies);
    return null; // Return null if we still don't have enough dependencies
  }
  
  return {
    "name": "union_transformation",
    "dependent_on": dependencies,
    "transformation": "Union",
    "union_type": unionType
  };
};

/**
 * Creates a drop transformation
 */
const createDropTransformation = (sources: DataSource[]): any => {
  // Find drop transformation in existing transformations
  const dropTransformation = sources.find(source => 
    source.drop_transformation);
  
  // If no drop transformation is found in sources, return null
  if (!dropTransformation) {
    console.warn("No drop transformation found in sources");
    return null;
  }
  
  // Determine dependencies
  const dependencies = dropTransformation?.drop_transformation?.dependent_on || [];
  
  // Get user-provided drop columns or use defaults
  const dropColumns = dropTransformation?.drop_transformation?.drop_columns || 
                     ['column_to_drop_1', 'column_to_drop_2'];
  
  return {
    "name": "drop_transformation",
    "dependent_on": dependencies,
    "transformation": "Drop",
    "drop_columns": dropColumns
  };
};

/**
 * Creates a select transformation
 */
const createSelectTransformation = (sources: DataSource[]): any => {
  // Find select transformation in existing transformations
  const selectTransformation = sources.find(source => 
    source.select_transformation);
  
  // If no select transformation is found in sources, return null
  if (!selectTransformation) {
    console.warn("No select transformation found in sources");
    return null;
  }
  
  // Determine dependencies
  const dependencies = selectTransformation?.select_transformation?.dependent_on || [];
  
  // Get user-provided select columns or use defaults
  const selectColumns = selectTransformation?.select_transformation?.select_columns || 
                       ['column_to_select_1', 'column_to_select_2'];
  
  return {
    "name": "select_transformation",
    "dependent_on": dependencies,
    "transformation": "Select",
    "select_columns": selectColumns
  };
};

/**
 * Creates a sequence transformation
 */
const createSequenceTransformation = (sources: DataSource[]): any => {
  // Find sequence transformation in existing transformations
  const sequenceTransformation = sources.find(source => 
    source.sequence_transformation);
  
  // If no sequence transformation is found in sources, return null
  if (!sequenceTransformation) {
    console.warn("No sequence transformation found in sources");
    return null;
  }
  
  // Determine dependencies
  const dependencies = sequenceTransformation?.sequence_transformation?.dependent_on || [];
  
  // Get user-provided sequence settings or use defaults
  const sequenceColumn = sequenceTransformation?.sequence_transformation?.sequence_column || 'id';
  const startValue = sequenceTransformation?.sequence_transformation?.start_value || 1;
  const incrementBy = sequenceTransformation?.sequence_transformation?.increment_by || 1;
  
  return {
    "name": "sequence_transformation",
    "dependent_on": dependencies,
    "transformation": "SequenceGenerator",
    "sequence_column": sequenceColumn,
    "start_value": startValue,
    "increment_by": incrementBy
  };
};

/**
 * Creates a target object for the pipeline template
 */
const createTargetObject = (
  targetConfig: TargetConfig, 
  pipelineName: string,
  useSourceConnection: boolean,
  selectedSources: DataSource[],
  connections: Record<string, any>
): Record<string, any> => {
  const targetName = targetConfig.customConfig?.name || targetConfig.connection?.name || "Target";
  
  // Build the target object based on the target configuration
  const targetObj: Record<string, any> = {
    "name": targetName,
    "target_type": targetConfig.type,
    "target_name": targetConfig.customConfig?.targetName || targetName,
    "load_mode": targetConfig.customConfig?.loadMode || "append",
    "file_type": targetConfig.fileFormat?.toLowerCase() || "csv"
  };

  // Add type-specific properties
  if (targetConfig.type === TargetType.RELATIONAL || targetConfig.type === TargetType.DATABASE) {
    // Add table_name for relational targets
    targetObj.table_name = targetConfig.customConfig?.tableName || targetObj.target_name;
    // Create connection object
    targetObj.connection = targetConfig.connection || {};
    
    // Add connection_config_id if available
    if (targetConfig.connection?.connection_config_id) {
      targetObj.connection.connection_config_id = targetConfig.connection.connection_config_id;
    }

    // If using source connection, copy connection details from source
    if (useSourceConnection && selectedSources.length > 0 &&
      selectedSources[0].connection_config?.custom_metadata?.connection_type) {
      const sourceId = `connection_${selectedSources[0].data_src_id}`;
      const sourceConnection = connections[sourceId];

      targetObj.connection = {
        ...targetObj.connection,
        "name": sourceConnection.name,
        "connection_type": sourceConnection.connection_type,
        "schema": sourceConnection.schema,
        "database": sourceConnection.database,
        "secret_name": sourceConnection.secret_name
      };
    }
  } else if (targetConfig.type === TargetType.FILE) {
    // Use custom file name if provided, otherwise generate one
    targetObj.file_name = targetConfig.customConfig?.fileName || 
                         `${(targetName || pipelineName || "new_pipeline").toLowerCase().replace(/\s+/g, '_')}_output.${targetConfig.fileFormat?.toLowerCase() || 'csv'}`;
    
    targetObj.connection = targetConfig.connection || {};
    if (targetConfig.connection?.connection_config_id) {
      targetObj.connection.connection_config_id = targetConfig.connection.connection_config_id;
    }
  } else if (targetConfig.type === TargetType.CUSTOM) {
    // For custom target types, use the customConfig directly
    Object.assign(targetObj, targetConfig.customConfig || {});
  }

  return targetObj;
};

/**
 * Creates a target transformation
 */
const createTargetTransformation = (
  targetName: string, 
  targetObj: any, 
  sources: DataSource[],
  targetConfig: TargetConfig
): any => {
  // Find target transformation in existing transformations
  const targetTransformation = sources.find(source => 
    source.target_transformation);
  
  // Determine dependencies
  const dependencies = targetTransformation?.target_transformation?.dependent_on || [];
  
  // Determine write options based on target type
  let writeOptions = {
    "createDisposition": "CREATE_IF_NEEDED",
    "writeMethod": targetObj.target_type === 'Relational' ? 'direct' : 'APPEND',
    "header": true,
    "sep": ","
  };
  
  // Use custom write options if provided
  if (targetConfig.customConfig?.writeOptions) {
    writeOptions = {
      ...writeOptions,
      ...targetConfig.customConfig.writeOptions
    };
  }

  return {
    "name": targetName,
    "dependent_on": dependencies,
    "transformation": "Target",
    "target": targetObj,
    "write_options": writeOptions,
    "file_type": targetObj.file_type || targetConfig.fileFormat || "csv"
  };
};

/**
 * Builds a pipeline template based on the provided parameters
 * 
 * @param pipelineName - Name of the pipeline
 * @param pipelineDescription - Description of the pipeline
 * @param selectedSources - Array of selected data sources
 * @param transformations - Array of transformation types
 * @param targetConfig - Configuration for the target
 * @param useSourceConnection - Whether to use source connection for target
 * @param filterCondition - Condition for filter transformation
 * @returns Pipeline template object
 */
export const buildPipelineTemplate = (
  pipelineName: string,
  pipelineDescription: string,
  selectedSources: DataSource[],
  transformations: string[],
  targetConfig: TargetConfig,
  useSourceConnection: boolean,
  filterCondition: string
): PipelineTemplate => {
  // Create the base pipeline template
  const pipelineTemplate = createDefaultTemplate(pipelineName, pipelineDescription);

  // Add connections
  const connections: Record<string, any> = {};
  selectedSources.forEach((source) => {
    const sourceId = `connection_${source.data_src_id}`;
    connections[sourceId] = createConnectionForSource(source);
  });
  pipelineTemplate.connections = connections;

  // Add sources
  const sources: Record<string, any> = {};
  selectedSources.forEach((source) => {
    const sourceId = `source_${source.data_src_id}`;
    const connectionId = `connection_${source.data_src_id}`;
    sources[sourceId] = createSourceObject(source, connectionId, connections[connectionId]);
  });
  pipelineTemplate.sources = sources;

  // Add transformations
  const transformationsList: any[] = [];

  // Add reader transformations for each source
  selectedSources.forEach((source) => {
    const sourceId = `source_${source.data_src_id}`;
    transformationsList.push(createReaderTransformation(source, pipelineTemplate.sources[sourceId]));
  });

  // Convert string transformation types to enum values
  const transformationTypes = transformations.map(t => 
    transformationTypeMap[t] || t
  );

  // Add schema transformation if selected
  if (transformationTypes.includes(TransformationType.SCHEMA) || transformations.includes(TransformationType.SCHEMA)) {
    transformationsList.push(createSchemaTransformation(selectedSources));
  }

  // Add filter transformation if selected
  if (transformationTypes.includes(TransformationType.FILTER) || transformations.includes(TransformationType.FILTER)) {
    transformationsList.push(createFilterTransformation(selectedSources, filterCondition));
  }
  
  // Add aggregator transformation if selected
  if (transformationTypes.includes(TransformationType.AGGREGATOR) || transformations.includes(TransformationType.AGGREGATOR)) {
    transformationsList.push(createAggregatorTransformation(selectedSources));
  }
  
  // Add sorter transformation if selected
  if (transformationTypes.includes(TransformationType.SORTER) || transformations.includes(TransformationType.SORTER)) {
    transformationsList.push(createSorterTransformation(selectedSources));
  }
  
  // Add join transformation if selected
  if (transformationTypes.includes(TransformationType.JOIN) || transformations.includes(TransformationType.JOIN) || transformations.includes('join')) {
    const joinTransform = createJoinTransformation(selectedSources);
    console.log("Adding join transformation to pipeline:", joinTransform);
    if (joinTransform) {
      transformationsList.push(joinTransform);
    } else {
      console.warn("Join transformation was selected but could not be created");
      
      // Check if any source has a join_transformation property with empty dependencies
      const sourceWithEmptyDependencies = selectedSources.find(
        source => source.join_transformation && 
                 (!source.join_transformation.dependent_on || 
                  (Array.isArray(source.join_transformation.dependent_on) && 
                   source.join_transformation.dependent_on.length === 0))
      );
      
      // Only create a placeholder if we have a source with join_transformation but no dependencies
      if (sourceWithEmptyDependencies) {
        const placeholderJoinTransform = {
          "name": "join_transformation",
          "dependent_on": [], // Empty array - will be filled when user selects dependencies
          "transformation": "Joiner",
          "conditions": [{ join_type: 'inner', join_condition: '' }],
          "join_type": 'inner'
        };
        
        console.log("Created placeholder join transformation:", placeholderJoinTransform);
        transformationsList.push(placeholderJoinTransform);
      }
    }
  }
  
  // Add union transformation if selected
  if (transformationTypes.includes(TransformationType.UNION) || transformations.includes(TransformationType.UNION) || transformations.includes('union')) {
    // Log the selected sources to help with debugging
    console.log("Selected sources for union transformation:", selectedSources);
    
    // Check if we have at least two sources for union
    if (selectedSources.length < 2) {
      console.warn("Union transformation requires at least two sources, but only found:", selectedSources.length);
    }
    
    // Try to create the union transformation
    const unionTransform = createUnionTransformation(selectedSources);
    console.log("Adding union transformation to pipeline:", unionTransform);
    
    if (unionTransform) {
      // Add the union transformation to the list
      transformationsList.push(unionTransform);
      
      // Log the updated transformations list
      console.log("Updated transformations list with union:", transformationsList);
    } else {
      console.warn("Union transformation was selected but could not be created");
      
      // Check if any source has a union_transformation property with empty dependencies
      const sourceWithEmptyDependencies = selectedSources.find(
        source => source.union_transformation && 
                 (!source.union_transformation.dependent_on || 
                  (Array.isArray(source.union_transformation.dependent_on) && 
                   source.union_transformation.dependent_on.length === 0))
      );
      
      // Only create a placeholder if we have a source with union_transformation but no dependencies
      if (sourceWithEmptyDependencies) {
        const placeholderUnionTransform = {
          "name": "union_transformation",
          "dependent_on": [], // Empty array - will be filled when user selects dependencies
          "transformation": "Union",
          "union_type": "distinct"
        };
        
        console.log("Created placeholder union transformation:", placeholderUnionTransform);
        transformationsList.push(placeholderUnionTransform);
      }
    }
  }
  
  // Add drop transformation if selected
  if (transformationTypes.includes(TransformationType.DROP) || transformations.includes(TransformationType.DROP) || transformations.includes('drop')) {
    const dropTransform = createDropTransformation(selectedSources);
    console.log("Adding drop transformation to pipeline:", dropTransform);
    if (dropTransform) {
      transformationsList.push(dropTransform);
    } else {
      console.warn("Drop transformation was selected but could not be created");
      
      // Check if any source has a drop_transformation property with empty dependencies
      const sourceWithEmptyDependencies = selectedSources.find(
        source => source.drop_transformation && 
                 (!source.drop_transformation.dependent_on || 
                  (Array.isArray(source.drop_transformation.dependent_on) && 
                   source.drop_transformation.dependent_on.length === 0))
      );
      
      // Only create a placeholder if we have a source with drop_transformation but no dependencies
      if (sourceWithEmptyDependencies) {
        const placeholderDropTransform = {
          "name": "drop_transformation",
          "dependent_on": [], // Empty array - will be filled when user selects dependencies
          "transformation": "Drop",
          "drop_columns": ['column_to_drop_1', 'column_to_drop_2']
        };
        
        console.log("Created placeholder drop transformation:", placeholderDropTransform);
        transformationsList.push(placeholderDropTransform);
      }
    }
  }
  
  // Add select transformation if selected
  if (transformationTypes.includes(TransformationType.SELECT) || transformations.includes(TransformationType.SELECT) || transformations.includes('select')) {
    const selectTransform = createSelectTransformation(selectedSources);
    console.log("Adding select transformation to pipeline:", selectTransform);
    if (selectTransform) {
      transformationsList.push(selectTransform);
    } else {
      console.warn("Select transformation was selected but could not be created");
      
      // Check if any source has a select_transformation property with empty dependencies
      const sourceWithEmptyDependencies = selectedSources.find(
        source => source.select_transformation && 
                 (!source.select_transformation.dependent_on || 
                  (Array.isArray(source.select_transformation.dependent_on) && 
                   source.select_transformation.dependent_on.length === 0))
      );
      
      // Only create a placeholder if we have a source with select_transformation but no dependencies
      if (sourceWithEmptyDependencies) {
        const placeholderSelectTransform = {
          "name": "select_transformation",
          "dependent_on": [], // Empty array - will be filled when user selects dependencies
          "transformation": "Select",
          "select_columns": ['column_to_select_1', 'column_to_select_2']
        };
        
        console.log("Created placeholder select transformation:", placeholderSelectTransform);
        transformationsList.push(placeholderSelectTransform);
      }
    }
  }
  
  // Add sequence transformation if selected
  if (transformationTypes.includes(TransformationType.SEQUENCE) || transformations.includes(TransformationType.SEQUENCE) || transformations.includes('sequence')) {
    const sequenceTransform = createSequenceTransformation(selectedSources);
    console.log("Adding sequence transformation to pipeline:", sequenceTransform);
    if (sequenceTransform) {
      transformationsList.push(sequenceTransform);
    } else {
      console.warn("Sequence transformation was selected but could not be created");
      
      // Check if any source has a sequence_transformation property with empty dependencies
      const sourceWithEmptyDependencies = selectedSources.find(
        source => source.sequence_transformation && 
                 (!source.sequence_transformation.dependent_on || 
                  (Array.isArray(source.sequence_transformation.dependent_on) && 
                   source.sequence_transformation.dependent_on.length === 0))
      );
      
      // Only create a placeholder if we have a source with sequence_transformation but no dependencies
      if (sourceWithEmptyDependencies) {
        const placeholderSequenceTransform = {
          "name": "sequence_transformation",
          "dependent_on": [], // Empty array - will be filled when user selects dependencies
          "transformation": "Sequence",
          "sequence_column": 'id',
          "start_value": 1,
          "increment_by": 1
        };
        
        console.log("Created placeholder sequence transformation:", placeholderSequenceTransform);
        transformationsList.push(placeholderSequenceTransform);
      }
    }
  }

  // Only add target if the user has explicitly selected it as a transformation
  if (transformationTypes.includes(TransformationType.TARGET) || transformations.includes(TransformationType.TARGET) || transformations.includes('target')) {
    // Add target - dynamically build based on target configuration
    const targetName = targetConfig.customConfig?.name || targetConfig.connection?.name || "Target";
    const targetId = targetName; // Use the target name as the ID to match the sample JSON

    // Create the target object
    const targetObj = createTargetObject(
      targetConfig, 
      pipelineName, 
      useSourceConnection, 
      selectedSources,
      connections
    );

    // Add the target to the pipeline
    pipelineTemplate.targets[targetId] = targetObj;
    
    // Add the connection to the connections section of the pipeline
    if (targetObj.connection) {
      pipelineTemplate.connections[targetId] = { ...targetObj.connection };
    }

    // Add target transformation
    transformationsList.push(createTargetTransformation(
      targetName, 
      targetObj, 
      selectedSources,
      targetConfig
    ));
  }
  
  // Add transformations to pipeline template
  pipelineTemplate.transformations = transformationsList;
  console.log(pipelineTemplate)
  return pipelineTemplate;
};