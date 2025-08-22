import { Node, Edge } from '@xyflow/react';
import { convertToOptimizedPipelineJson, resolveRefs, UINode } from './pipelineJsonConverter';
import { validatePipelineConnections } from './validatePipelineConnections';


export const convertUIToPipelineJson = (nodes: Node[], edges: Edge[], pipelineDtl: any, validateOnly: boolean = false) => {
    const uiNodes = nodes as UINode[];

    if (validateOnly) {
        // Perform validation and return logs
        const validation = validatePipelineConnections(uiNodes, edges);

        if (!validation.isValid) {
            const error = new Error(`Pipeline is incomplete or broken:\n${validation.errors.join('\n')}`);
            (error as any).logs = validation.logs;
            throw error;
        }

        // Return early if only validating
        return validation;
    }
    
    const getOrderedNodes = () => {
        const orderedNodes: UINode[] = [];
        const visited = new Set<string>();

        const processNode = (nodeId: string) => {
            if (visited.has(nodeId)) return;
            visited.add(nodeId);

            // Process incoming edges first
            const incomingEdges = edges.filter(edge => edge.target === nodeId);
            incomingEdges.forEach(edge => {
                if (!visited.has(edge.source)) {
                    processNode(edge.source);
                }
            });

            const node = uiNodes.find(n => n.id === nodeId);
            if (node) {
                orderedNodes.push(node);
            }
        };

        // Start with target nodes if they exist
        const targetNodes = uiNodes.filter(node => node.id.startsWith('Target_'));
        
        if (targetNodes.length > 0) {
            // If there are target nodes, process them
            targetNodes.forEach(node => {
                processNode(node.id);
            });
        } else {
            // If there are no target nodes, process all nodes
            // Start with nodes that have no outgoing edges (terminal nodes)
            const nodeIds = new Set(uiNodes.map(node => node.id));
            const nodesWithOutgoingEdges = new Set(edges.map(edge => edge.source));
            
            // Find nodes that have no outgoing edges
            const terminalNodes = uiNodes.filter(node => !nodesWithOutgoingEdges.has(node.id) || 
                                                        // Also include nodes that only connect to themselves
                                                        edges.filter(edge => edge.source === node.id)
                                                             .every(edge => edge.target === node.id));
            
            if (terminalNodes.length > 0) {
                // Process terminal nodes
                terminalNodes.forEach(node => {
                    processNode(node.id);
                });
            } else {
                // If there are no terminal nodes, process all nodes
                uiNodes.forEach(node => {
                    if (!visited.has(node.id)) {
                        processNode(node.id);
                    }
                });
            }
            
            // Ensure all nodes are processed
            uiNodes.forEach(node => {
                if (!visited.has(node.id)) {
                    processNode(node.id);
                }
            });
        }

        return orderedNodes;
    };

    const orderedUiNodes = getOrderedNodes();



    
    // Update the sources mapping with defensive checks
    const readerSources = uiNodes
        .filter(node => node.id.startsWith('Reader_'))
        .map(node => {
            const source = node.data.source || {};
            const connectionConfig = source?.connection_config?.custom_metadata;
            let fullConnectionConfig:any = source?.connection_config?.custom_metadata?.custom_metadata || source?.connection_config?.custom_metadata || { custom_metadata: connectionConfig };
            fullConnectionConfig.connection_config_id = source?.connection_config_id || source?.connection?.connection_config_id;
            const source_type = source.type || source.source_type;
            const isFileSource = connectionConfig?.connection_type == "Local" || connectionConfig?.connection_type == "S3";
            
            return {
                name: source.name || node.data.title || 'Unnamed Source',
                source_type: isFileSource ? "File" : "Relational",
                ...(isFileSource ? {} : { table_name: source?.table_name || source.data_src_name }),
                file_name: source.file_name ? `${source.file_name}` : undefined,
                data_src_id: source.data_src_id,
                connection: fullConnectionConfig
            };
        });

    // Collect lookup sources from Lookup transformations
    const lookupSources = uiNodes
        .filter(node => node.data.label === 'Lookup')
        .map(node => {
            const lookupConfig = node.data.transformationData?.lookup_config;
            if (lookupConfig && lookupConfig.source && 
                (lookupConfig.source.data_src_name || lookupConfig.source.name)) {
                
                const source = lookupConfig.source;
                // Extract connection metadata consistently
                const connectionConfig = source?.connection_config?.custom_metadata || 
                                       source?.connection?.custom_metadata || 
                                       source?.connection || {};
                const source_type = source.type || source.source_type;
                const isFileSource = connectionConfig?.connection_type == "Local" || 
                                    connectionConfig?.connection_type == "S3" ||
                                    source.source_type === "File";
                const sourceName = source.data_src_name || source.name;

                // Normalize connection object to the expected shape
                const normalizedConnection: any = {
                    custom_metadata: connectionConfig || {}
                };
                const connCfgId = source?.connection_config_id || source?.connection?.connection_config_id;
                if (connCfgId !== undefined && connCfgId !== null && connCfgId !== '') {
                    normalizedConnection.connection_config_id = connCfgId;
                }
                
                console.log('🔧 Processing lookup source:', {
                    sourceName,
                    source,
                    connectionConfig,
                    normalizedConnection,
                    isFileSource
                });
                return {
                    name: sourceName,
                    source_type: isFileSource ? "File" : "Relational",
                    ...(isFileSource ? {} : { table_name: source?.table_name || source.data_src_name }),
                    file_name: source.file_name ? `${source.file_name}` : undefined,
                    data_src_id: source.data_src_id,
                    connection: normalizedConnection
                };
            }
            return null;
        })
        .filter(Boolean); // Remove null entries

    // Combine reader sources and lookup sources, ensuring lookup sources are included
    const allSources = [...readerSources];
    lookupSources.forEach(lookupSource => {
        const existingSource = allSources.find(source => source.name === lookupSource.name);
        if (!existingSource) {
            // Add new lookup source
            allSources.push(lookupSource);
        } else {
            // Update existing source with lookup source data if it has more complete connection info
            if (lookupSource.connection && (!existingSource.connection || !existingSource.connection.custom_metadata)) {
                existingSource.connection = lookupSource.connection;
            }
        }
    });

    const sources = allSources;
    
    console.log('🔧 Final sources array:', sources);

    // Update the reader transformations
    const readerTransformations = uiNodes
        .filter(node => node.id.startsWith('Reader_'))
        .map(node => {
            const connectionConfig = node.data.source?.connection_config?.custom_metadata;
            const fullConnectionConfig = node.data.source?.connection_config || { custom_metadata: connectionConfig };
            const isFileSource = connectionConfig?.connection_type == "Local" || connectionConfig?.connection_type == "S3";
            //console.log(connectionConfig, "connectionConfig")
            
            // Base reader configuration
            const readerConfig:any = {
                name: node.data.title,
                dependent_on: [],
                transformation: "Reader",
                source: {
                    name: node.data.source.name || node.data.title,
                    source_type: capitalizeFirstLetter(node.data.source.type || node.data.source.source_type) || "Relational",
                    ...(isFileSource ? {} : { table_name: node.data?.source?.table_name || node.data.source.data_src_name }),
                    file_name: `${node.data.source.file_name}`,
                    connection: fullConnectionConfig.custom_metadata
                },
                read_options: {
                    header: true
                }
            };
            
            // Add schema transformation fields if they exist in transformationData
            const transformationData = node.data.transformationData;
            if (transformationData) {
                // Always include these fields if they exist, even if empty
                if (transformationData.select_columns !== undefined) {
                    readerConfig.select_columns = transformationData.select_columns;
                }
                
                if (transformationData.drop_columns !== undefined) {
                    readerConfig.drop_columns = transformationData.drop_columns;
                }
                
                if (transformationData.rename_columns !== undefined) {
                    readerConfig.rename_columns = transformationData.rename_columns;
                }
            }
            
            return readerConfig;
        });
        // debugger
    // Process regular transformations using ordered nodes
    const regularTransformations = orderedUiNodes
        .filter(node => !node.id.startsWith('Reader_'))
        .map(node => {
           
            
            const baseConfig = {
                name: node.data.title, // Use the node's title as the transformation name
                transformation: node.data.label,
                dependent_on: edges
                    .filter(edge => edge.target === node.id)
                    .map(edge => {
                        const sourceNode = uiNodes.find(n => n.id === edge.source);
                        // //console.log(sourceNode)
                        return sourceNode?.data?.title || '';
                    })
            };
            

            // Rest of the transformation configuration...
            switch (node.data.label) {
                case 'Aggregator':
                    // Transform the group_by array to match the expected format
                    const groupByData = node.data.transformationData?.group_by || [];
                    const formattedGroupBy = Array.isArray(groupByData)
                        ? groupByData.map(group => {
                            // Handle both object format {group_by: "column"} and string format "column"
                            if (typeof group === 'object' && group.group_by) {
                              return group.group_by;
                            } else if (typeof group === 'string') {
                              return group;
                            }
                            return '';
                          }).filter(item => item.trim())
                        : [];

                    // Transform aggregations to match the expected format
                    // Note: Form uses 'aggregations' (plural) but API expects 'aggregate' (singular)
                    // Also check for 'aggregate' as fallback for backward compatibility
                    const aggregationsData = node.data.transformationData?.aggregations || 
                                           node.data.transformationData?.aggregate || 
                                           [];
                    
                    const formattedAggregations = Array.isArray(aggregationsData) 
                        ? aggregationsData.map(agg => ({
                            target_column: agg.target_column || '',
                            expression: agg.expression || '',
                            alias: agg.alias || ''
                          }))
                        : [];

                    

                    return {
                        ...baseConfig,
                        name: node.data.title,
                        group_by: formattedGroupBy,
                        aggregate: formattedAggregations,
                        pivot: node.data.transformationData?.pivot_by || node.data.transformationData?.pivot || []
                    };
                case 'Filter':
                    //console.log('Filter node data:', node.data);
                    //console.log('Filter transformationData:', node.data.transformationData);
                    
                    // Extract condition from transformationData
                    let condition = '';
                    if (node.data.transformationData) {
                        if (typeof node.data.transformationData.condition === 'string') {
                            condition = node.data.transformationData.condition;
                        } else if (node.data.transformationData.condition !== undefined) {
                            condition = String(node.data.transformationData.condition);
                        }
                    }
                    
                    //console.log('Extracted filter condition:', condition);
                    
                    return {
                        ...baseConfig,
                        condition: condition
                    };
                case 'SQLTransformation':
                    return {
                        ...baseConfig,
                        query: node.data.transformationData?.query || "true"
                    };
                case 'Joiner':
                    // debugger
                    //console.log(node.data.transformationData)
                    return {
                        ...baseConfig,
                        conditions: node.data.transformationData?.conditions || [],
                        expressions: node.data.transformationData?.expressions?.map(item => {
                            return {
                                target_column: item?.name || item?.target_column,
                                expression: item?.expression
                            }
                        }) || [],
                        advanced: Array.isArray(node.data.transformationData?.advanced) ?
                            {
                                hints: node.data.transformationData.advanced.map(item => ({
                                    join_input: item?.join_input,
                                    hint_type: item?.hint_type
                                }))
                            }
                            : { hints: [] }
                    };
                case 'SchemaTransformation':
                    console.log('SchemaTransformation transformationData:', node.data.transformationData);
                    const schemaTransformConfig: any = {
                        ...baseConfig,
                        derived_fields: node.data.transformationData?.derived_fields || []
                    };
                    
                    // Always include these fields, even if empty
                    if (node.data.transformationData?.select_columns !== undefined) {
                        schemaTransformConfig.select_columns = node.data.transformationData.select_columns;
                    }
                    
                    if (node.data.transformationData?.drop_columns !== undefined) {
                        schemaTransformConfig.drop_columns = node.data.transformationData.drop_columns;
                    }
                    
                    if (node.data.transformationData?.rename_columns !== undefined) {
                        console.log('Adding rename_columns to config:', node.data.transformationData.rename_columns);
                        schemaTransformConfig.rename_columns = node.data.transformationData.rename_columns;
                    } else {
                        console.log('rename_columns is undefined in transformationData');
                        schemaTransformConfig.rename_columns = {};
                    }
                    
                    console.log('Final schemaTransformConfig:', schemaTransformConfig);
                    return schemaTransformConfig;
                case 'Sorter':
                    return {
                        ...baseConfig,
                        sort_columns: node.data.transformationData?.sort_columns
                    };
                case 'DQCheck':
                    const dqCheckConfig: any = {
                        name: node.data.transformationData?.name || node.data.title,
                        dependent_on: edges
                            .filter(edge => edge.target === node.id)
                            .map(edge => {
                                const sourceNode = uiNodes.find(n => n.id === edge.source);
                                return sourceNode?.data?.title || '';
                            }),
                        transformation: "DQCheck",
                        dq_rules: node.data.transformationData?.dq_rules || []
                    };
                    
                    // Convert limit to integer if it has a value
                    if (node.data.transformationData?.limit !== undefined && 
                        node.data.transformationData?.limit !== null && 
                        node.data.transformationData?.limit !== '') {
                        const limitValue = parseInt(node.data.transformationData.limit, 10);
                        if (!isNaN(limitValue)) {
                            dqCheckConfig.limit = limitValue;
                        }
                    }
                    
                    return dqCheckConfig;
                case 'Deduplicator':
                    return {
                        ...baseConfig,
                        keep: node.data.transformationData?.keep || "any",
                        dedup_by: node.data.transformationData?.dedup_by || [],
                        order_by: node.data.transformationData?.order_by || []
                    };
                case 'Repartition':
                    const repartitionConfig:any = {
                        ...baseConfig,
                        repartition_type: node.data.transformationData?.repartition_type || "repartition"
                    };
                    
                    // Convert repartition_value to integer if it exists
                    if (node.data.transformationData?.repartition_value !== undefined && 
                        node.data.transformationData?.repartition_value !== null && 
                        node.data.transformationData?.repartition_value !== '') {
                        const repartitionValue = parseInt(node.data.transformationData.repartition_value, 10);
                        if (!isNaN(repartitionValue)) {
                            repartitionConfig.repartition_value = repartitionValue;
                        }
                    }
                    
                    // Only add override_partition if it has a non-empty value
                    if (node.data.transformationData?.override_partition) {
                        repartitionConfig.override_partition = node.data.transformationData.override_partition;
                    }
                    
                    // Only add repartition_expression if it's an array with at least one item
                    if (Array.isArray(node.data.transformationData?.repartition_expression) && 
                        node.data.transformationData.repartition_expression.length > 0) {
                        repartitionConfig.repartition_expression = node.data.transformationData.repartition_expression;
                    }
                    
                    // Convert limit to integer if it has a value
                    if (node.data.transformationData?.limit !== undefined && 
                        node.data.transformationData?.limit !== null && 
                        node.data.transformationData?.limit !== '') {
                        const limitValue = parseInt(node.data.transformationData.limit, 10);
                        if (!isNaN(limitValue)) {
                            repartitionConfig.limit = limitValue;
                        }
                    }
                    
                    return repartitionConfig;
                case 'Union':
                case 'SetCombiner': // Handle both Union and SetCombiner as they're the same
                    return {
                        ...baseConfig,
                        operation_type: node.data.transformationData?.operation_type || "union",
                        allow_missing_columns: node.data.transformationData?.allow_missing_columns || false
                    };
                case 'Select':
                    const selectConfig:any = {
                        ...baseConfig,
                        column_list: node.data.transformationData?.column_list || []
                    };
                    
                    // Convert limit to integer if it has a value
                    if (node.data.transformationData?.limit !== undefined && 
                        node.data.transformationData?.limit !== null && 
                        node.data.transformationData?.limit !== '') {
                        const limitValue = parseInt(node.data.transformationData.limit, 10);
                        if (!isNaN(limitValue)) {
                            selectConfig.limit = limitValue;
                        }
                    }
                    
                    return selectConfig;
                case 'SequenceGenerator':
                    const seqGenConfig:any = {
                        ...baseConfig,
                        for_column_name: node.data.transformationData?.for_column_name || ""
                    };
                    
                    // Convert start_with to integer
                    const startWith = node.data.transformationData?.start_with;
                    if (startWith !== undefined && startWith !== null && startWith !== '') {
                        const startWithValue = parseInt(startWith, 10);
                        seqGenConfig.start_with = !isNaN(startWithValue) ? startWithValue : 1;
                    } else {
                        seqGenConfig.start_with = 1;
                    }
                    
                    // Convert step to integer if it has a value
                    if (node.data.transformationData?.step !== undefined && 
                        node.data.transformationData?.step !== null && 
                        node.data.transformationData?.step !== '') {
                        const stepValue = parseInt(node.data.transformationData.step, 10);
                        if (!isNaN(stepValue)) {
                            seqGenConfig.step = stepValue;
                        }
                    }
                    
                    // Only add order_by if it's an array with at least one item
                    if (Array.isArray(node.data.transformationData?.order_by) && 
                        node.data.transformationData.order_by.length > 0) {
                        seqGenConfig.order_by = node.data.transformationData.order_by;
                    }
                    
                    return seqGenConfig;
                case 'Drop':
                    const dropConfig:any = {
                        ...baseConfig
                    };
                    
                    // Get column list from either column_list or column property
                    const columnList = node.data.transformationData?.column_list || node.data.transformationData?.column || [];
                    
                    // Only add column_list if it's an array with at least one item
                    if (Array.isArray(columnList) && columnList.length > 0) {
                        dropConfig.column_list = columnList;
                    }
                    
                    // Only add pattern if it has a value
                    if (node.data.transformationData?.pattern) {
                        dropConfig.pattern = node.data.transformationData.pattern;
                    }
                    
                    return dropConfig;
                case 'Lookup':
                    const lookupConfig:any = {
                        ...baseConfig,
                        lookup_type: node.data.transformationData?.lookup_type || 'Column Based'
                    };
                    
                    // Handle lookup_config with proper source reference format
                    if (node.data.transformationData?.lookup_config && 
                        (node.data.transformationData.lookup_config.name || 
                         Object.keys(node.data.transformationData.lookup_config.source || {}).length > 0)) {
                        
                        const lookupConfigData = { ...node.data.transformationData.lookup_config };
                        
                        // Convert source to $ref format if it has a data_src_name or name
                        if (lookupConfigData.source && 
                            (lookupConfigData.source.data_src_name || lookupConfigData.source.name)) {
                            const sourceName = lookupConfigData.source.data_src_name || lookupConfigData.source.name;
                            lookupConfigData.source = { "$ref": `#/sources/${sourceName}` };
                        }
                        
                        lookupConfig.lookup_config = lookupConfigData;
                    }
                    
                    // Only add lookup_data if it's an array with at least one item
                    if (Array.isArray(node.data.transformationData?.lookup_data) && 
                        node.data.transformationData.lookup_data.length > 0) {
                        lookupConfig.lookup_data = node.data.transformationData.lookup_data;
                    }
                    
                    // Only add lookup_columns if it's an array with at least one item
                    if (Array.isArray(node.data.transformationData?.lookup_columns) && 
                        node.data.transformationData.lookup_columns.length > 0) {
                        lookupConfig.lookup_columns = node.data.transformationData.lookup_columns;
                    }
                    
                    // Handle lookup_conditions - convert single object to array
                    if (node.data.transformationData?.lookup_conditions) {
                        const conditions = node.data.transformationData.lookup_conditions;
                        
                        if (Array.isArray(conditions)) {
                            // If it's already an array, use it directly
                            lookupConfig.lookup_conditions = conditions.filter(condition => 
                                condition && (condition.column_name || condition.lookup_with)
                            );
                        } else if (conditions && (conditions.column_name || conditions.lookup_with)) {
                            // If it's a single object, convert it to an array
                            lookupConfig.lookup_conditions = [conditions];
                        }
                    }
                    
                    // Only add keep if it has a value
                    if (node.data.transformationData?.keep) {
                        lookupConfig.keep = node.data.transformationData.keep;
                    }
                    
                    return lookupConfig;
                case 'Target':
                    //console.log("Target node data:", node.data);
                    // Determine the correct target_type
                    let targetType = node.data.source?.target_type;
                    // If connection type is Local or S3, ensure target_type is File
                    if (node.data.source?.connection?.connection_type?.toLowerCase() === "local" || 
                        node.data.source?.connection?.connection_type?.toLowerCase() === "s3") {
                        targetType = "File";
                    } else if (targetType !== "File") {
                        targetType = "Relational";
                    }
                    
                    return {
                        ...baseConfig,
                        name: node.data.title,
                        transformation: "Writer", // Changed from "Target" to "Writer"
                        target: {
                            name: node.data.source?.name,
                            target_type: targetType,
                            target_name: node?.data.source?.target_name,
                            table_name: node?.data.source?.table_name || 'sample_table',
                            connection: node.data.source?.connection,
                            file_name: node.data.source?.file_name,
                            load_mode: node.data.source?.load_mode
                        },
                        file_type: node.data?.source?.file_type?.toLowerCase(),
                        file_name: node.data.source?.file_name,
                        write_options: node.data.transformationData?.write_options || {
                            header: true,
                            sep: ","
                        },
                    };
                case 'CustomPySpark':
                    return {
                        ...baseConfig,
                        user_code: node.data.transformationData?.user_code || ''
                    };
                default:
                    console.warn(`Unknown transformation type: ${node.data.label}. Using default handling.`);
                    //console.log('Default case - node.data.transformationData:', node.data.transformationData);
                    return {
                        ...baseConfig,
                        ...node.data.transformationData
                    };
            }
        });

    
    const targets = uiNodes
        .filter(node => node.id.startsWith('Target_'))
        .map(node => {
            console.log('🔧 convertUIToPipelineJson - Processing target node:', node.id);
            console.log('🔧 convertUIToPipelineJson - Target node data:', node.data);
            console.log('🔧 convertUIToPipelineJson - Target source data:', node.data.source);
            console.log('🔧 convertUIToPipelineJson - Target source connection:', node.data.source?.connection);
            console.log('🔧 convertUIToPipelineJson - Target source connection_config_id:', node.data.source?.connection?.connection_config_id);
            console.log('🔧 convertUIToPipelineJson - Target transformation data:', node.data.transformationData);
            
            // Determine the correct target_type
            let targetType = node.data.source?.target_type;
            // If connection type is Local or S3, ensure target_type is File
            if (node.data.source?.connection?.connection_type?.toLowerCase() === "local" || 
                node.data.source?.connection?.connection_type?.toLowerCase() === "s3") {
                targetType = "File";
            } else if (targetType !== "File") {
                targetType = "Relational";
            }
            
            const targetData = {
                name: node?.data.source?.name || node?.data.source?.target_name || node?.data.title,
                target_type: targetType, // Use target_type instead of type
                connection: node?.data.source?.connection,
                load_mode: node?.data.source?.load_mode || 'append',
                file_name: node?.data.source?.file_name,
                table_name: node?.data.source?.table_name,
                target_name: node?.data.source?.target_name,
                file_type: node?.data.source?.file_type?.toLowerCase(),
                write_options: node.data.transformationData?.write_options
            };
            
            console.log('🔧 convertUIToPipelineJson - Generated target data:', targetData);
            
            // Validate that required fields are present
            if (!targetData.connection) {
                console.error('🔧 convertUIToPipelineJson - Missing connection for target:', targetData.name);
            }
            if (!targetData.target_type) {
                console.error('🔧 convertUIToPipelineJson - Missing target_type for target:', targetData.name);
            }
            
            return targetData;
        });
    // Clean transformations to remove UI-only fields like nodeId and type
    const transformationsCleaned = [
        ...readerTransformations,
        ...regularTransformations.filter(Boolean),
        // ...writerTransformations
    ].map((t: any) => {
        if (!t) return t;
        const { nodeId, type, ...rest } = t;
        return rest;
    });

    console.log('🔧 Final targets array:', {
            $schema: "https://json-schema.org/draft-07/schema#",
            name: pipelineDtl?.pipeline_name||pipelineDtl?.name ,
            description: pipelineDtl?.pipeline_description || " ",
            version: "1.0.0",
            // mode: "DEBUG",
            parameters: [],
            sources,
            targets,
            transformations: transformationsCleaned
        });

    return {
        pipeline_json: {
            $schema: "https://json-schema.org/draft-07/schema#",
            name: pipelineDtl?.pipeline_name||pipelineDtl?.name ,
            description: pipelineDtl?.pipeline_description || " ",
            version: "1.0.0",
            // mode: "DEBUG",
            parameters: [],
            sources,
            targets,
            transformations: transformationsCleaned
        }
    };
};



function capitalizeFirstLetter(str: string): string {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : str;
}

/**
 * Converts UI to pipeline JSON up to a specific target node (for refresh functionality)
 * @param nodes - All nodes in the pipeline
 * @param edges - All edges in the pipeline  
 * @param pipelineDtl - Pipeline details
 * @param targetNodeId - The node ID to convert up to (inclusive)
 * @param pipelineName - Optional pipeline name
 * @returns Partial pipeline JSON up to the target node
 */
export const convertUIToPipelineJsonUpToNode = async (
    nodes: Node[], 
    edges: Edge[], 
    pipelineDtl: any, 
    targetNodeId: string,
    pipelineName?: string
) => {
    //console.log(`🔄 Converting UI to Pipeline JSON up to node: ${targetNodeId}`);
    
    // Find all nodes that lead to the target node (including the target node itself)
    const getNodesUpToTarget = (targetId: string): Set<string> => {
        const relevantNodes = new Set<string>();
        const visited = new Set<string>();
        
        const traverse = (nodeId: string) => {
            if (visited.has(nodeId)) return;
            visited.add(nodeId);
            relevantNodes.add(nodeId);
            
            // Find all nodes that feed into this node
            const incomingEdges = edges.filter(edge => edge.target === nodeId);
            incomingEdges.forEach(edge => {
                traverse(edge.source);
            });
        };
        
        traverse(targetId);
        return relevantNodes;
    };
    
    const relevantNodeIds = getNodesUpToTarget(targetNodeId);
    
    // Filter nodes and edges to only include relevant ones
    const filteredNodes = nodes.filter(node => relevantNodeIds.has(node.id));
    const filteredEdges = edges.filter(edge => 
        relevantNodeIds.has(edge.source) && relevantNodeIds.has(edge.target)
    );
    
    // Convert the filtered nodes to pipeline JSON
    const partialPipelineJson = await convertUIToPipelineJson(filteredNodes, filteredEdges, pipelineDtl, false);
    
    return partialPipelineJson;
};

export const convertOptimisedPipelineJsonToPipelineJson = async (nodes: Node[], edges: Edge[], pipelineDtl: any,pipelineName?:string, validateOnly: boolean = false) => {
    let pipelineJson: any = await convertUIToPipelineJson(nodes, edges, pipelineDtl, validateOnly);
    
    // Ensure all transformations are properly converted
    if (pipelineJson?.pipeline_json?.transformations && Array.isArray(pipelineJson.pipeline_json.transformations)) {
        pipelineJson.pipeline_json.transformations = pipelineJson.pipeline_json.transformations.map(transform => {
            // Convert Target to Writer
            if (transform.transformation === "Target") {
                return {
                    ...transform,
                    transformation: "Writer"
                };
            }
            return transform;
        });
    }
    
    console.log('🔧 Pipeline JSON before optimization:', pipelineJson?.pipeline_json);
    let optimized = convertToOptimizedPipelineJson(pipelineJson?.pipeline_json,pipelineName);
    console.log('🔧 Optimized pipeline JSON:', optimized);
    
    // Ensure all transformations in the optimized pipeline are properly converted
    if (optimized?.transformations && Array.isArray(optimized.transformations)) {
        optimized.transformations = optimized.transformations.map(transform => {
            // Convert Target to Writer
            if (transform.transformation === "Target") {
                return {
                    ...transform,
                    transformation: "Writer"
                };
            }
            return transform;
        });
    }
    
    let resolved = resolveRefs(optimized, optimized);
    return { pipeline_json: optimized };
}


export const resolveRefsPipelineJson = (optimized: any, pipelineJson: any) => {
    // Check if optimized or pipelineJson is undefined/null
    if (!optimized || !pipelineJson) {
        console.error("resolveRefsPipelineJson: optimized or pipelineJson is undefined/null");
        return optimized || {}; // Return the original optimized object or an empty object
    }

    let resolved = resolveRefs(optimized, pipelineJson);

    // Check if resolved is undefined/null
    if (!resolved) {
        console.error("resolveRefsPipelineJson: resolved is undefined/null");
        return optimized; // Return the original optimized object
    }

    // Convert sources from object to array
    if (resolved.sources && typeof resolved.sources === 'object' && !Array.isArray(resolved.sources)) {
        resolved.sources = Object.values(resolved.sources);
    }

    // Convert targets from object to array
    if (resolved.targets && typeof resolved.targets === 'object' && !Array.isArray(resolved.targets)) {
        resolved.targets = Object.values(resolved.targets);
    }

    return resolved;
}