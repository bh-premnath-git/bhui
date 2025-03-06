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
    
    // Extract sources and create reader transformations
    const sources = uiNodes
        .filter(node => node.id.startsWith('Reader_'))
        .map(node => ({
            name: node.data.source.name || node.data.title,
            source_type: "File",
            file_name: `${node.data.source.file_path_prefix}/${node.data.source.file_name}`,
            data_src_id: node.data.source.data_src_id,
            connection: {
                name: node.data.source.connection?.name || "local_connection",
                connection_type: capitalizeFirstLetter(node.data.source.connection_type),
                file_path_prefix: `${node.data.source.file_path_prefix}/`
            }
        }));

    // Create reader transformations
    const readerTransformations = uiNodes
        .filter(node => node.id.startsWith('Reader_'))
        .map(node => ({
            name: node.data.title,
            dependent_on: [],
            transformation: "Reader",
            source: {
                name: node.data.source.name || node.data.title,
                source_type: "File",
                file_name: node.data.source.file_name,
                connection: {
                    name: node.data.source.connection?.name || "local_connection",
                    connection_type: capitalizeFirstLetter(node.data.source.connection_type),
                    file_path_prefix: node.data.source.file_path_prefix
                }
            },
            read_options: {
                header: true
            }
        }));

    // Process regular transformations using ordered nodes
    const regularTransformations = orderedUiNodes
        .filter(node => !node.id.startsWith('Reader_') && !node.id.startsWith('Target_'))
        .map(node => {
            // console.log(node.data.title)
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
                        group_by: node.data.transformationData?.group_by || [],
                        aggregations: node.data.transformationData?.aggregations || [],
                        pivot_by: node.data.transformationData?.pivot_by || []
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
                    return {
                        ...baseConfig,
                        conditions: node.data.transformationData?.conditions || [],
                        expressions: node.data.transformationData?.expressions || [],
                        advanced: node.data.transformationData?.advanced || {
                            hints: []
                        }
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
                default:
                    return {
                        ...baseConfig,
                        ...node.data.transformationData
                    };
            }
        });

    // Create target configuration and writer transformation
    const targets = uiNodes
        .filter(node => node.id.startsWith('Target_'))
        .map(node => ({
            name: "output_data",
            type: "File",
            connection: {
                type: "File",
                file_path: "examples/output.csv"
            },
            load_mode: "overwrite"
        }));

    // const writerTransformations = uiNodes
    //     .filter(node => node.id.startsWith('Target_'))
    //     .map(node => {
    //         const lastTransformation = uiNodes
    //             .filter(n => !n.id.startsWith('Target_'))
    //             .slice(-1)[0];
            
    //         return {
    //             name: "write_output",
    //             dependent_on: [lastTransformation?.data.title || ""],
    //             transformation: "Writer",
    //             target: {
    //                 name: "output_data",
    //                 type: "File",
    //                 connection: {
    //                     type: "File",
    //                     file_path: "examples/output.csv"
    //                 },
    //                 load_mode: "overwrite"
    //             }
    //         };
    //     });
console.log({
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
})
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