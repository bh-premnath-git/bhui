import { Node, Edge } from 'reactflow';
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
    console.log(uiNodes, "nodes")
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



    console.log(
        uiNodes, "uiNodes"
    )
    // Update the sources mapping with defensive checks
    const sources = uiNodes
        .filter(node => node.id.startsWith('Reader_'))
        .map(node => {
            const source = node.data.source || {};
            const connectionConfig = source?.connection_config?.custom_metadata;
            const source_type = source.type || source.source_type;
            console.log(source_type, "firstName")
            return {
                name: source.name || node.data.title || 'Unnamed Source',
                source_type: connectionConfig?.connection_type == "Local" || connectionConfig?.connection_type == "S3" ? "File" : "Relational",
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
            const connectionConfig = node.data.source?.connection_config?.custom_metadata;
            console.log(connectionConfig, "connectionConfig")
            return {
                name: node.data.title,
                dependent_on: [],
                transformation: "Reader",
                source: {
                    name: node.data.source.name || node.data.title,
                    source_type: capitalizeFirstLetter(node.data.source.type || node.data.source.source_type) || "Relational",
                    table_name: node.data?.source?.table_name || node.data.source.data_src_name,
                    file_name: `${node.data.source.file_name}`,
                    connection: connectionConfig
                },
                read_options: {
                    header: true
                }
            };
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
                        // console.log(sourceNode)
                        return sourceNode?.data?.title || '';
                    })
            };
            

            // Rest of the transformation configuration...
            switch (node.data.label) {
                case 'Aggregator':
                    // Transform the group_by array to match the expected format
                    const formattedGroupBy = Array.isArray(node.data.transformationData?.group_by)
                        ? node.data.transformationData.group_by.map(group => (group.group_by || ''))
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
                    console.log('Filter node data:', node.data);
                    console.log('Filter transformationData:', node.data.transformationData);
                    
                    // Extract condition from transformationData
                    let condition = '';
                    if (node.data.transformationData) {
                        if (typeof node.data.transformationData.condition === 'string') {
                            condition = node.data.transformationData.condition;
                        } else if (node.data.transformationData.condition !== undefined) {
                            condition = String(node.data.transformationData.condition);
                        }
                    }
                    
                    console.log('Extracted filter condition:', condition);
                    
                    return {
                        ...baseConfig,
                        condition: condition
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
                case 'Deduplicator':
                    return {
                        ...baseConfig,
                        keep: node.data.transformationData?.keep || "any",
                        dedup_by: node.data.transformationData?.dedup_by || [],
                        order_by: node.data.transformationData?.order_by || []
                    };
                case 'Repartition':
                    const repartitionConfig = {
                        ...baseConfig,
                        repartition_type: node.data.transformationData?.repartition_type || "repartition",
                        repartition_value: node.data.transformationData?.repartition_value
                    };
                    
                    // Only add override_partition if it has a non-empty value
                    if (node.data.transformationData?.override_partition) {
                        repartitionConfig.override_partition = node.data.transformationData.override_partition;
                    }
                    
                    // Only add repartition_expression if it's an array with at least one item
                    if (Array.isArray(node.data.transformationData?.repartition_expression) && 
                        node.data.transformationData.repartition_expression.length > 0) {
                        repartitionConfig.repartition_expression = node.data.transformationData.repartition_expression;
                    }
                    
                    // Only add limit if it has a value
                    if (node.data.transformationData?.limit) {
                        repartitionConfig.limit = node.data.transformationData.limit;
                    }
                    
                    return repartitionConfig;
                case 'Union':
                    return {
                        ...baseConfig,
                        operation_type: node.data.transformationData?.operation_type || "union",
                        allow_missing_columns: node.data.transformationData?.allow_missing_columns || false
                    };
                case 'Select':
                    const selectConfig = {
                        ...baseConfig,
                        column_list: node.data.transformationData?.column_list || []
                    };
                    
                    // Only add limit if it has a value
                    if (node.data.transformationData?.limit) {
                        selectConfig.limit = node.data.transformationData.limit;
                    }
                    
                    return selectConfig;
                case 'SequenceGenerator':
                    const seqGenConfig = {
                        ...baseConfig,
                        for_column_name: node.data.transformationData?.for_column_name || "",
                        start_with: node.data.transformationData?.start_with || 1
                    };
                    
                    // Only add order_by if it's an array with at least one item
                    if (Array.isArray(node.data.transformationData?.order_by) && 
                        node.data.transformationData.order_by.length > 0) {
                        seqGenConfig.order_by = node.data.transformationData.order_by;
                    }
                    
                    // Only add step if it has a value
                    if (node.data.transformationData?.step) {
                        seqGenConfig.step = node.data.transformationData.step;
                    }
                    
                    return seqGenConfig;
                case 'Drop':
                    const dropConfig = {
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
                    const lookupConfig = {
                        ...baseConfig,
                        lookup_type: node.data.transformationData?.lookup_type || 'Column Based'
                    };
                    
                    // Only add lookup_config if it has meaningful values
                    if (node.data.transformationData?.lookup_config && 
                        (node.data.transformationData.lookup_config.name || 
                         Object.keys(node.data.transformationData.lookup_config.source || {}).length > 0)) {
                        lookupConfig.lookup_config = node.data.transformationData.lookup_config;
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
                    
                    // Only add lookup_conditions if it has meaningful values
                    if (node.data.transformationData?.lookup_conditions && 
                        (node.data.transformationData.lookup_conditions.column_name || 
                         node.data.transformationData.lookup_conditions.lookup_with)) {
                        lookupConfig.lookup_conditions = node.data.transformationData.lookup_conditions;
                    }
                    
                    // Only add keep if it has a value
                    if (node.data.transformationData?.keep) {
                        lookupConfig.keep = node.data.transformationData.keep;
                    }
                    
                    return lookupConfig;
                case 'Target':
                    console.log("Target node data:", node.data);
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
                            sep: ",",
                            createDisposition: 'CREATE_IF_NEEDED',
                            writeMethod: targetType === 'Relational' ? 'direct' : 'APPEND'
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
        .map(node => {
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
                name: node?.data.source?.name,
                target_type: targetType, // Use target_type instead of type
                connection: node?.data.source?.connection,
                load_mode: node?.data.source?.load_mode,
                file_name: node?.data.source?.file_name,
                table_name: node?.data.source?.table_name,
                target_name: node?.data.source?.target_name,
                file_type: node?.data.source?.file_type?.toLowerCase(),
                write_options: node.data.transformationData?.write_options
            };
        });
    console.log(targets, "targets")
    //    let optimized=convertToOptimizedPipelineJson({
    //     $schema: "https://json-schema.org/draft-07/schema#",
    //     name: pipelineDtl?.pipeline_name ,
    //     description: pipelineDtl?.pipeline_description || " ",
    //     version: "1.0",
    //     mode: "DEBUG",
    //     parameters: [],
    //     sources,
    //     targets,
    //     transformations: [
    //         ...readerTransformations,
    //         ...regularTransformations.filter(Boolean),
    //         // ...writerTransformations
    //     ]
    // })
    // console.log(optimized,"optimized")
    // let resolved=resolveRefs(optimized,optimized)
    // console.log(resolved,"resolved")
    // return optimized;
    console.log(regularTransformations)
    // debugger
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

export const convertOptimisedPipelineJsonToPipelineJson = async (nodes: Node[], edges: Edge[], pipelineDtl: any,pipelineName?:string, validateOnly: boolean = false) => {
    let pipelineJson: any = await convertUIToPipelineJson(nodes, edges, pipelineDtl, validateOnly);
    console.log(pipelineJson, "pipelineJson");
    
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
    
    let optimized = convertToOptimizedPipelineJson(pipelineJson?.pipeline_json,pipelineName);
    console.log(optimized, "optimized");
    
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
    console.log(resolved, "resolved");
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