import { Node, Edge } from 'reactflow';
import { UINode } from './pipelineJsonConverter';
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
    
    // Get ordered nodes using topological sort
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

        // Start with target nodes
        const targetNodes = uiNodes.filter(node => node.id.startsWith('Target_'));
        targetNodes.forEach(node => {
            processNode(node.id);
        });

        return orderedNodes;
    };

    const orderedUiNodes = getOrderedNodes();
   
    // First, let's create connection factory interfaces
    interface ConnectionConfig {
        name: string;
        connection_type: string;
        [key: string]: any;
    }

    class ConnectionFactory {
        static createConnection(connectionData: any): ConnectionConfig {
            const connectionType = connectionData?.connection_name?.toLowerCase();
            
            switch (connectionType) {
                case 'postgresql':
                case 'postgres':
                    return {
                        name: connectionData.connection_config_name,
                        connection_type: 'postgresql',
                        database: connectionData?.custom_metadata?.database,
                        schema: connectionData?.custom_metadata?.schema || 'public',
                        secret_name: connectionData?.secret_name
                    };
                
                case 'local':
                case 's3':
                    return {
                        name: connectionData?.connection_config_name,
                        connection_type: connectionData?.connection_name,
                        file_path_prefix: connectionData?.file_path_prefix || '${file_path_prefix}'
                    };
                    
                default:
                    return {
                        name: connectionData?.connection_config_name,
                        connection_type: connectionData?.connection_name
                    };
            }
        }
    }

    // Update the sources mapping
    const sources = uiNodes
        .filter(node => node.id.startsWith('Reader_'))
        .map(node => {
            const connectionConfig = ConnectionFactory.createConnection(node.data.source?.custom_metadata);
            
            return {
                name: node.data.source.name || node.data.title,
                source_type: capitalizeFirstLetter(node.data.source.type) || "Relational",
                table_name: node.data?.source?.table_name,
                file_name: `${node.data.source.file_name}`,
                data_src_id: node.data.source.data_src_id,
                connection: connectionConfig
            };
        });
console.log(sources)
    // Update the reader transformations
    const readerTransformations = uiNodes
        .filter(node => node.id.startsWith('Reader_'))
        .map(node => {
            const connectionConfig = ConnectionFactory.createConnection(node.data.source?.custom_metadata);
            
            return {
                name: node.data.title,
                dependent_on: [],
                transformation: "Reader",
                source: {
                    name: node.data.source.name || node.data.title,
                    source_type: capitalizeFirstLetter(node.data.source.type) || "Relational",
                    table_name: node.data?.source?.table_name,
                    file_name: `${node.data.source.file_name}`,
                    connection: connectionConfig
                },
                read_options: {
                    header: true
                }
            };
        });
    // Process regular transformations using ordered nodes
    const regularTransformations = orderedUiNodes
        .filter(node => !node.id.startsWith('Reader_') )
        .map(node => {
            const baseConfig = {
                name: node.data.title, // Use the node's title as the transformation name
                transformation: node.data.label,
                dependent_on: edges
                    .filter(edge => edge.target === node.id)
                    .map(edge => {
                        const sourceNode = uiNodes.find(n => n.id === edge.source);
                        // console.log(sourceNode)
                        return sourceNode?.data?.title || '';
                    })
            };

            // Rest of the transformation configuration...
            switch (node.data.label) {
                case 'Aggregator':

                    return {
                        ...baseConfig,
                        name: node.data.title, // Explicitly set the name
                        group_by: Array.isArray(node.data.transformationData?.group_by)
                            ? node.data.transformationData?.group_by.map(item => item?.group_by)
                            : [],
                        aggregate: node.data.transformationData?.aggregations || [],
                        pivot: node.data.transformationData?.pivot_by || []
                    };
                case 'Filter':
                    return {
                        ...baseConfig,
                        condition: node.data.transformationData?.condition || ''
                    };
                case 'SQL Transformation':
                    return {
                        ...baseConfig,
                        sql: node.data.transformationData?.sql || "true"
                    };
                case 'Joiner':
                    // debugger
                    console.log(node.data.transformationData)
                    return {
                        ...baseConfig,
                        conditions: node.data.transformationData?.conditions || [],
                        expressions: node.data.transformationData?.expressions?.map(item=>{
                            return {
                                target_column: item?.name,
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
                    return {
                        ...baseConfig,
                        derived_fields: node.data.transformationData?.derived_fields || []
                    };
                case 'Sorter':
                    return {
                        ...baseConfig,
                        sort_columns: node.data.transformationData?.sort_columns 
                    };
                case 'DQ Check':
                    return {
                        ...baseConfig,
                        transformation: node.data.transformationData?.transformation || "",
                        name: node.data.transformationData?.name || "",
                        limit: node.data.transformationData?.limit,
                        dq_rules: node.data.transformationData?.dq_rules || []
                    };
                case 'Dedup':
                    return {
                        ...baseConfig,
                        keep: node.data.transformationData?.keep || "any",
                        dedup_by: node.data.transformationData?.dedup_by || [],
                        order_by: node.data.transformationData?.order_by || []
                    };
                case 'Repartition':
                    return {
                        ...baseConfig,
                        repartition_type: node.data.transformationData?.repartition_type || "repartition",
                        repartition_value: node.data.transformationData?.repartition_value,
                        override_partition: node.data.transformationData?.override_partition || "",
                        repartition_expression: node.data.transformationData?.repartition_expression || [],
                        limit: node.data.transformationData?.limit
                    };
                case 'Union':
                    return {
                        ...baseConfig,
                        operation_type: node.data.transformationData?.operation_type || "union",
                        allow_missing_columns: node.data.transformationData?.allow_missing_columns || false
                    };
                case 'Select':
                    return {
                        ...baseConfig,
                        column_list: node.data.transformationData?.column_list || [],
                        limit: node.data.transformationData?.limit || ''
                    };
                case 'SequenceGenerator':
                    return {
                        ...baseConfig,
                        for_column_name: node.data.transformationData?.for_column_name || "",
                        order_by: node.data.transformationData?.order_by || [],
                        start_with: node.data.transformationData?.start_with || 1,
                        step: node.data.transformationData?.step || ''
                    };
                case 'Drop':
                    return {
                        ...baseConfig,
                        column_list: node.data.transformationData?.column_list || [],
                        pattern: node.data.transformationData?.pattern
                    };
                case 'Target':
                    console.log(node.data)
                    return {
                        ...baseConfig,
                        name: node.data.title,
                        transformation: "Target",
                        target: {
                            name: node.data.source?.name,
                            target_type: node?.data.source?.target_type?.toLowerCase()=="local" || node?.data.source?.target_type?.toLowerCase()=="s3"?"File":"Relational",
            target_name: node?.data.source?.target_name,
            table_name: node?.data.source?.table_name||'sample_table',
                            connection: {
                                name: node.data.source?.connection?.name,
                                connection_type:node?.data?.source?.connection?.connection_type?.toLowerCase()=="postgres"?"postgresql":node?.data?.source?.connection?.connection_type,
                                file_path_prefix: node.data.source?.connection?.file_path_prefix,
                                connection_config_id: node.data.source?.connection?.connection_config_id,
                                database: node?.data?.source?.connection?.database,
                                schema: node?.data?.source?.connection?.schema || "public",
                                secret_name: node?.data?.source?.connection?.secret_name||"bh-postgres-out5",

                            },
                            file_name: node.data.source?.file_name,
                            load_mode: node.data.source?.load_mode
                        },
                        file_type: node.data?.source?.file_type?.toLowerCase(),
                        write_options: node.data.transformationData?.write_options || {
                            header: true,
                            sep: "|"
                        },
                    };
                default:
                    return {
                        ...baseConfig,
                        ...node.data.transformationData
                    };
            }
        });

    // Create target configuration and writer transformation
    console.log(uiNodes
        .filter(node => node.id.startsWith('Target_')), "target befor transform")
    const targets = uiNodes
    .filter(node => node.id.startsWith('Target_'))
    .map(node => ({
        name: node?.data.source?.name,
        type: node?.data.source?.target_type,
        connection: {
            type: node?.data.source?.connection?.connection_type,
            file_path: node?.data.source?.connection?.file_path_prefix,
        },
        load_mode: node?.data.source?.load_mode,
        target: {
            target_type: node?.data.source?.target_type?.toLowerCase()=="local" || node?.data.source?.target_type?.toLowerCase()=="s3"?"File":"Relational",
            target_name: node?.data.source?.target_name,
            name: node?.data.source?.name ,
            load_mode: node?.data.source?.load_mode,
            file_name: node?.data.source?.file_name,
            file_type: node?.data.source?.file_type?.toLowerCase(),
            table_name: node?.data.source?.table_name||'sample_table',
            connection: {
                type: node?.data.source?.connection?.connection_type,
                connection_type:node?.data?.source?.connection?.connection_type?.toLowerCase()=="postgres"?"postgresql":node?.data?.source?.connection?.connection_type,
                file_path: node?.data.source?.connection?.file_path_prefix ,
                connection_config_id: node?.data.source?.connection?.connection_config_id,
                name: node?.data.source?.connection?.name,
                database: node?.data?.source?.connection?.database,
                schema: node?.data?.source?.connection?.schema || "public",
                secret_name: node?.data?.source?.connection?.secret_name ||"bh-postgres-out5"
            },
            
        }
    }));
console.log(targets,"targets")
   
    return {
        pipeline_json: {
            $schema: "https://json-schema.org/draft-07/schema#",
            name: pipelineDtl?.pipeline_name || "sample_pipeline",
            description: pipelineDtl?.pipeline_description || " ",
            version: "1.0",
            mode: "DEBUG",
            parameters: [],
            sources,
            targets,
            transformations: [
                ...readerTransformations,
                ...regularTransformations.filter(Boolean),
                // ...writerTransformations
            ]
        }
    };
};



function capitalizeFirstLetter(str: string): string {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : str;
}