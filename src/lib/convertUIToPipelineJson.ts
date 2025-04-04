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
    console.log(uiNodes,"nodes")
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
   

    
    console.log(
        uiNodes,"uiNodes"
    )
    // Update the sources mapping with defensive checks
    const sources = uiNodes
        .filter(node => node.id.startsWith('Reader_'))
        .map(node => {
            const source = node.data.source || {};
            const connectionConfig = source?.connection_config?.custom_metadata;

            return {
                name: source.name || node.data.title || 'Unnamed Source',
                source_type: capitalizeFirstLetter(source.type) || "Relational",
                table_name: source?.table_name || source.data_src_name,
                file_name: source.file_name ? `${source.file_name}` : undefined,
                data_src_id: source.data_src_id,
                connection: connectionConfig
            };
        });

    // Update the reader transformations
    const readerTransformations = uiNodes
        .filter(node => node.id.startsWith('Reader_'))
        .map(node => {
            const connectionConfig =node.data.source?.connection_config?.custom_metadata;
            console.log(connectionConfig,"connectionConfig")
            return {
                name: node.data.title,
                dependent_on: [],
                transformation: "Reader",
                source: {
                    name: node.data.source.name || node.data.title,
                    source_type: capitalizeFirstLetter(node.data.source.type) || "Relational",
                    table_name: node.data?.source?.table_name|| node.data.source.data_src_name,
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
                    // Transform the group_by array to match the expected format
                    const formattedGroupBy = Array.isArray(node.data.transformationData?.group_by)
                        ? node.data.transformationData.group_by
                        : [];

                    // Transform aggregations to match the expected format
                    const formattedAggregations = node.data.transformationData?.aggregate?.map(agg => ({
                        target_column: agg.target_column || '',
                        expression: agg.expression || '',
                        alias: agg.alias || ''
                    })) || [];

                    return {
                        ...baseConfig,
                        name: node.data.title,
                        group_by: formattedGroupBy,
                        aggregate: formattedAggregations,
                        pivot: node.data.transformationData?.pivot || []
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
                            connection: node.data.source?.connection,
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
        connection: node?.data.source?.connection,
        load_mode: node?.data.source?.load_mode,
        
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