import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { showErrorToast } from '@/components/ui/error-toast';
import {
    getTransformationCount,
    runNextCheckpoint,
    stopPipeLine,
    getPipelineById,
    setBuildPipeLineDtl,
    setPipeLineType
} from '@/store/slices/designer/buildPipeLine/BuildPipeLineSlice';
import { convertOptimisedPipelineJsonToPipelineJson, convertUIToPipelineJsonUpToNode, resolveRefsPipelineJson } from '@/lib/convertUIToPipelineJson';
import { convertPipelineToUIJson } from '@/lib/pipelineJsonConverter';
import { CATALOG_LIVE_API_URL, CATALOG_REMOTE_API_URL, ENVIRONMENT, USE_SECURE, SPARK_PORT, PANDAS_PORT, FLINK_PORT } from '@/config/platformenv';
import { apiService } from '@/lib/api/api-service';
import { ValidEngineTypes } from '@/types/pipeline';

// Utility function to get port based on engine type
const getPortByEngineType = (engineType: ValidEngineTypes): string => {
    switch (engineType) {
        case 'pyspark':
            return SPARK_PORT;
        case 'pandas':
            return PANDAS_PORT;
        case 'pyflink':
            return FLINK_PORT;
        default:
            return SPARK_PORT; // Default fallback
    }
};

interface UsePipelineActionsProps {
    nodes: any[];
    edges: any[];
    pipelineDtl: any;
    pipelineName: any;
    selectedMode: 'engine' | 'debug' | 'interactive';
    attachedCluster: any;
    debuggedNodesList: Array<{ id: string; title: string }>;
    setIsCanvasLoading: (loading: boolean) => void;
    setIsPipelineRunning: (running: boolean) => void;
    setConversionLogs: React.Dispatch<React.SetStateAction<Array<{ timestamp: string; message: string; level: 'info' | 'error' | 'warning' }>>>;
    setTerminalLogs: React.Dispatch<React.SetStateAction<Array<{ timestamp: string; message: string; level: 'info' | 'error' | 'warning' }>>>;
    setTransformationCounts: React.Dispatch<React.SetStateAction<Array<{ transformationName: string; rowCount: string }>>>;
    setSaveError: (error: string) => void;
    handleRunClick: (e: React.MouseEvent) => any;
    setSelectedFormState?: (state: any) => void;
    setRunDialogOpen?: (open: boolean) => void;
    // For fetchPipelineDetails
    id?: string;
    setNodes: React.Dispatch<React.SetStateAction<any>>;
    setEdges: React.Dispatch<React.SetStateAction<any>>;
    setPipeLineName: (name: any) => void;
    setPipelineJson: (json: any) => void;
    setFormStates: React.Dispatch<React.SetStateAction<{ [key: string]: any }>>;
    selectedPipeline?: any;
    // For handleSourceUpdate
    setUnsavedChanges: () => void;
    // For showing logs
    setShowLogs?: (show: boolean) => void;
    // For showing error banner
    setErrorBanner?: (banner: { title: string; description: string } | null) => void;
}

export const usePipelineActions = ({
    nodes,
    edges,
    pipelineDtl,
    pipelineName,
    selectedMode,
    attachedCluster,
    debuggedNodesList,
    setIsCanvasLoading,
    setIsPipelineRunning,
    setConversionLogs,
    setTerminalLogs,
    setTransformationCounts,
    setSaveError,
    handleRunClick,
    setSelectedFormState,
    setRunDialogOpen,
    // For fetchPipelineDetails
    id,
    setNodes,
    setEdges,
    setPipeLineName,
    setPipelineJson,
    setFormStates,
    selectedPipeline,
    // For handleSourceUpdate
    setUnsavedChanges,
    // For showing logs
    setShowLogs,
    // For showing error banner
    setErrorBanner
}: UsePipelineActionsProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const selectedEngineType = useSelector((state: RootState) => state.buildPipeline.selectedEngineType);

    // Helper function to extract detailed error information
    const extractErrorDetails = useCallback((error: any) => {
        const errorDetail = error.response?.data?.detail || '';
        const errorMessage = error.message || '';

        let detailedErrorInfo = '';
        let formattedErrorInfo = '';

        if (errorDetail) {
            try {
                // Try to extract the meaningful error from the detail field
                if (errorDetail.includes('_InactiveRpcError')) {
                    // Extract the actual error message from the RPC error
                    const detailsMatch = errorDetail.match(/details = "([^"]+)"/);
                    if (detailsMatch && detailsMatch[1]) {
                        const cleanedDetails = detailsMatch[1]
                            .replace(/\\n/g, '\n')
                            .replace(/\\'/g, "'")
                            .replace(/\\"/g, '"');
                        detailedErrorInfo = cleanedDetails;

                        // Format the error for better readability
                        if (cleanedDetails.includes('Failed validating')) {
                            const lines = cleanedDetails.split('\n');
                            const mainError = lines[0];
                            const instanceMatch = cleanedDetails.match(/On instance\['[^']+'\]\['([^']+)'\]:/);
                            const instanceName = instanceMatch ? instanceMatch[1] : 'unknown';

                            // Create a more user-friendly error message
                            formattedErrorInfo = `🔴 Validation Error on '${instanceName}'\n\n`;
                            formattedErrorInfo += `❌ Issue: ${mainError}\n\n`;

                            // Extract required fields if available
                            const requiredMatch = cleanedDetails.match(/required.*:\s*\[(.*?)\]/);
                            if (requiredMatch) {
                                const requiredFields = requiredMatch[1].split(',').map(field => field.trim().replace(/'/g, ''));
                                formattedErrorInfo += `📋 Required fields: ${requiredFields.join(', ')}\n\n`;
                            }

                            // Add instance details if available
                            const instanceDataMatch = cleanedDetails.match(/On instance\['[^']+'\]\['[^']+'\]:\s*({.*})/s);
                            if (instanceDataMatch) {
                                try {
                                    const instanceData = instanceDataMatch[1];
                                    formattedErrorInfo += `📊 Current configuration:\n${instanceData}\n\n`;
                                } catch (e) {
                                    // If parsing fails, just add the raw data
                                    formattedErrorInfo += `📊 Current configuration:\n${instanceDataMatch[1]}\n\n`;
                                }
                            }

                            // Add suggestion based on error type
                            if (mainError.includes('required property')) {
                                const missingField = mainError.match(/'([^']+)' is a required property/);
                                if (missingField) {
                                    formattedErrorInfo += `💡 Solution: Please add the missing '${missingField[1]}' field to your configuration.`;
                                }
                            }
                        } else {
                            formattedErrorInfo = cleanedDetails;
                        }
                    }
                } else {
                    detailedErrorInfo = errorDetail;
                    formattedErrorInfo = errorDetail;
                }
            } catch (parseError) {
                detailedErrorInfo = errorDetail;
                formattedErrorInfo = errorDetail;
            }
        }

        return {
            errorMessage,
            detailedErrorInfo,
            formattedErrorInfo,
            errorDetail
        };
    }, []);

    // Add type safety for the getInitialFormState function
    const getInitialFormState = useCallback((transformation: any, nodeId: string, matchingNode?: any, pipelineDefinition?: any) => {
        if (!transformation || !nodeId) {
            return {};
        }

        try {
            // Handle Reader transformations with reference resolution
            if (transformation?.transformation === 'Reader') {
                // Resolve source reference if it exists
                let resolvedSource = transformation.source;
                if (resolvedSource && resolvedSource.$ref && pipelineDefinition) {
                    // Resolve the reference manually
                    const refPath = resolvedSource.$ref.substring(2); // Remove '#/'
                    const pathParts = refPath.split('/');
                    let resolved = pipelineDefinition;

                    for (const part of pathParts) {
                        if (resolved && resolved[part]) {
                            resolved = resolved[part];
                        } else {
                            resolved = null;
                            break;
                        }
                    }

                    if (resolved) {
                        resolvedSource = resolved;
                    }
                }

                // Also resolve connection reference if it exists
                let resolvedConnection = resolvedSource?.connection;
                if (resolvedConnection && resolvedConnection.$ref && pipelineDefinition) {
                    const refPath = resolvedConnection.$ref.substring(2);
                    const pathParts = refPath.split('/');
                    let resolved = pipelineDefinition;

                    for (const part of pathParts) {
                        if (resolved && resolved[part]) {
                            resolved = resolved[part];
                        } else {
                            resolved = null;
                            break;
                        }
                    }

                    if (resolved) {
                        resolvedConnection = {
                            ...resolved,
                            // Ensure connection_config_id is available for form validation
                            connection_config_id: resolved.connection_config_id ||
                                resolved.id ||
                                resolved.name ||
                                // Extract from $ref path if needed
                                pathParts[pathParts.length - 1]
                        };
                    }
                }

                // Structure the data properly for the ReaderOptionsForm
                const readerFormData = {
                    ...transformation,
                    nodeId,
                    // Nest source data under 'source' key as expected by the form schema
                    source: {
                        ...resolvedSource,
                        connection: resolvedConnection,
                        // Ensure source_type is properly set based on the source data
                        source_type: resolvedSource?.source_type ||
                            (resolvedSource?.table_name ? 'Relational' :
                                resolvedSource?.file_name ? 'File' : 'Relational'),
                        // Add file_type if it's a file source
                        file_type: resolvedSource?.file_name ?
                            (resolvedSource.file_name.toLowerCase().endsWith('.csv') ? 'CSV' :
                                resolvedSource.file_name.toLowerCase().endsWith('.json') ? 'JSON' :
                                    resolvedSource.file_name.toLowerCase().endsWith('.parquet') ? 'Parquet' : 'CSV') : undefined
                    },
                    // Ensure read_options is properly structured
                    read_options: transformation.read_options || {},
                    // Ensure column arrays are properly initialized
                    select_columns: transformation.select_columns || [],
                    drop_columns: transformation.drop_columns || [],
                    rename_columns: transformation.rename_columns || {}
                };

                console.log(`🔧 usePipelineActions: Structured Reader form data for ${nodeId}:`, readerFormData);
                return readerFormData;
            }

            // Use the normalized transformation data from the matching node if available
            const nodeTransformationData = matchingNode?.data?.transformationData;
            if (nodeTransformationData) {
                console.log(`🔧 Using normalized data for ${transformation.transformation} (${nodeId}):`, nodeTransformationData);
                return {
                    ...nodeTransformationData,
                    nodeId
                };
            }

            return {
                ...transformation,
                nodeId
            };
        } catch (error) {
            console.error(`Error creating initial form state for node ${nodeId}:`, error);
            return {};
        }
    }, []);

    const handleSourceUpdate = useCallback(async ({ nodeId, sourceData }: { nodeId: string, sourceData: any }) => {
        // Guard: if pipeline is hydrating from AI/canvas init, skip source updates to avoid reverting nodes
        // const isHydrating = (window as any).__bh_isHydratingPipeline === true;
        // if (isHydrating) {
        //     console.log('🔧 usePipelineActions: Skipping handleSourceUpdate during initial hydration');
        //     return;
        // }

        console.log('🔧 usePipelineActions: handleSourceUpdate called with:', { nodeId, sourceData });

        let data;

        if (sourceData.sourceData?.data) {
            // Structure from TargetPopUp
            data = sourceData.sourceData.data;
            console.log('🔧 usePipelineActions: Using sourceData.sourceData.data structure');
        } else if (sourceData.data) {
            // Direct structure
            data = sourceData.data;
            console.log('🔧 usePipelineActions: Using sourceData.data structure');
        } else {
            // Try to use sourceData directly as a fallback
            data = sourceData;
            console.log('🔧 usePipelineActions: Using sourceData directly as fallback');
        }

        if (!data) {
            console.error('Invalid sourceData structure:', sourceData);
            // Create a minimal data object to avoid errors
            data = {
                label: 'Unnamed Node',
                title: 'Unnamed Node',
                source: {},
                transformationData: {}
            };
        }

        try {
            console.log('🔧 usePipelineActions: About to update node with data:', data);

            setNodes(prevNodes => {
                const updatedNodes = prevNodes.map((node: any) => {
                    if (node.id === nodeId) {
                        // Make sure we have all the required data
                        if (!data.label) {
                            console.warn('🔧 usePipelineActions: Missing label in sourceData, using fallback');
                        }

                        const updatedNode = {
                            ...node,
                            label: data.label || node.label || 'Unnamed Node',
                            data: {
                                ...node.data,
                                title: data.label || node.data?.title || 'Unnamed Node',
                                source: data.source || node.data?.source || {},
                                transformationData: data.transformationData || node.data?.transformationData || {}
                            }
                        };

                        console.log('🔧 usePipelineActions: Updated node:', {
                            nodeId,
                            oldNode: node,
                            updatedNode,
                            transformationData: updatedNode.data.transformationData
                        });

                        return updatedNode;
                    }
                    return node;
                });

                console.log('🔧 usePipelineActions: All nodes after update:', updatedNodes);
                return updatedNodes;
            });
        } catch (error) {
            console.error('Error updating node:', error);
            console.error('Node ID:', nodeId);
            console.error('Source data:', sourceData);
        }
        setUnsavedChanges();
    }, [setNodes, setUnsavedChanges]);

    const handleRun = useCallback(async () => {
        try {
            setIsCanvasLoading(true);
            setIsPipelineRunning(true);
            // setShowLogs(true);

            // Clear any existing error banner
            if (typeof setErrorBanner === 'function') {
                setErrorBanner(null);
            }

            setConversionLogs([{
                timestamp: new Date().toISOString(),
                message: 'Starting pipeline validation...',
                level: 'info'
            }]);

            const { pipeline_json }: any = await convertOptimisedPipelineJsonToPipelineJson(nodes, edges, pipelineDtl, pipelineName);
            pipeline_json.engine_type = selectedEngineType;
            pipeline_json.transformations = pipeline_json.transformations.map(transform => {
                if (transform.transformation.toLowerCase() === "target") {
                    return {
                        ...transform,
                        transformation: "Writer"
                    };
                }
                return transform;
            });

            // Convert selectedMode to API parameter format
            const modeAction = selectedMode === 'debug' ? 'DEBUG' :
                selectedMode === 'interactive' ? 'INTERACTIVE' : 'ENGINE';
            const params: any = new URLSearchParams({
                pipeline_name: `${pipelineName || pipelineDtl?.name || pipelineDtl?.pipeline_name}`,
                pipeline_json: JSON.stringify(pipeline_json),
                mode: modeAction,
                use_secure: USE_SECURE
            });

            // Add host parameter if cluster is attached
            if (attachedCluster?.master_ip) {
                params.append('host', attachedCluster.master_ip);
            } else {
                params.append('host', "host.docker.internal");
                params.append('port', getPortByEngineType(selectedEngineType));
            }

            debuggedNodesList.forEach(checkpoint => {
                params.append('checkpoints', checkpoint?.title);
            });

            setSelectedFormState?.(pipeline_json);
            setRunDialogOpen?.(true);

            // Pass the request data directly
            let response: any = await apiService.post({
                baseUrl: CATALOG_REMOTE_API_URL,
                url: `/api/v1/pipeline/debug/start_pipeline?${params.toString()}`,
                // usePrefix: true,
                method: 'POST',
                data: params,
            });

            if (response.error) {
                throw new Error(response.error);
            }

            let countsResponse = await dispatch(getTransformationCount({
                params: pipelineName || pipelineDtl?.name || pipelineDtl?.pipeline_name,
                host: attachedCluster?.master_ip || 'host.docker.internal',
                use_secure: USE_SECURE
            })).unwrap();

            if (countsResponse.transformationOutputCounts) {
                setTransformationCounts(countsResponse.transformationOutputCounts);
            }

        } catch (error: any) {
            console.error('Error starting pipeline:', error);

            // Extract detailed error information using helper function
            const { errorMessage, formattedErrorInfo, errorDetail } = extractErrorDetails(error);

            // Add the main error message
            setTerminalLogs(prevLogs => [...prevLogs, {
                timestamp: new Date().toISOString(),
                message: `Error: ${errorMessage}`,
                level: 'error'
            }]);

            // Add detailed error information if available
            if (formattedErrorInfo) {
                setTerminalLogs(prevLogs => [...prevLogs, {
                    timestamp: new Date().toISOString(),
                    message: `Detailed Error: ${formattedErrorInfo}`,
                    level: 'error'
                }]);
            }

            // Auto-open terminal to show errors
            if (typeof setShowLogs === 'function') {
                setShowLogs(true);
            }

            // Show error banner at the top of the screen
            if (typeof setErrorBanner === 'function') {
                setErrorBanner({
                    title: 'Pipeline Error',
                    description: formattedErrorInfo || errorMessage
                });
            }

            if (error.message.includes('Pipeline is incomplete or broken:')) {
                // const errorMessages = error.message.split('\n').slice(1);
                // setValidationErrors(errorMessages);
            }

            if (
                errorMessage.includes('already exist') ||
                errorMessage.includes('already running') ||
                errorDetail.includes('ALREADY_EXISTS') ||
                errorDetail.includes('already running')
            ) {
                try {
                    let countsResponse = await dispatch(getTransformationCount({
                        params: pipelineName || pipelineDtl?.name || pipelineDtl?.pipeline_name,
                        host: attachedCluster?.master_ip || 'host.docker.internal',
                        use_secure: USE_SECURE
                    })).unwrap();

                    if (countsResponse.transformationOutputCounts) {
                        setTransformationCounts(countsResponse.transformationOutputCounts);
                        setIsPipelineRunning(true);

                        setTerminalLogs(prevLogs => [...prevLogs, {
                            timestamp: new Date().toISOString(),
                            message: 'Pipeline is already running. Fetched current transformation counts.',
                            level: 'info'
                        }]);
                    }
                } catch (countError) {
                    console.error('Error getting transformation counts after pipeline error:', countError);
                }
                return;
            }

            setSaveError(formattedErrorInfo || errorMessage);
            setIsPipelineRunning(false);
        } finally {
            setIsCanvasLoading(false);
        }
    }, [
        handleRunClick,
        debuggedNodesList,
        nodes,
        edges,
        pipelineDtl,
        pipelineName,
        dispatch,
        selectedMode,
        attachedCluster,
        setIsCanvasLoading,
        setIsPipelineRunning,
        setConversionLogs,
        setTerminalLogs,
        setTransformationCounts,
        setSaveError,
        extractErrorDetails,
        setShowLogs,
        setErrorBanner
    ]);

    const handleStop = useCallback(async () => {
        try {
            const pipelineName_val = pipelineDtl?.name || pipelineDtl?.pipeline_name || pipelineName;
            const host = attachedCluster?.master_ip;

            let response = await dispatch(stopPipeLine({
                params: pipelineName_val,
                host: host,
                use_secure: USE_SECURE
            })).unwrap();

            if (response.message) {
                setIsPipelineRunning(false);
                // Clear transformation counts when stopping the pipeline
                setTransformationCounts([]);
            }
        } catch (error) {
            console.error('Error stopping pipeline:', error);
        }
    }, [
        pipelineDtl?.pipeline_name,
        pipelineDtl?.name,
        pipelineName,
        attachedCluster?.master_ip,
        dispatch,
        setIsPipelineRunning,
        setTransformationCounts
    ]);

    const handleNext = useCallback(async () => {
        try {
            // Clear any existing error banner
            if (typeof setErrorBanner === 'function') {
                setErrorBanner(null);
            }

            const pipelineName_val = pipelineDtl?.name || pipelineDtl?.pipeline_name || pipelineName;
            const host = attachedCluster?.master_ip || 'host.docker.internal';

            let result: any = await dispatch(runNextCheckpoint({
                pipeline_name: pipelineName_val,
                host: host
            })).unwrap();

            // Only proceed if first API call was successful
            if (result && !result.error) {
                let countsResponse = await dispatch(getTransformationCount({
                    params: pipelineName_val,
                    host: host,
                    use_secure: USE_SECURE
                })).unwrap();

                if (countsResponse.error) {
                    throw new Error(countsResponse.error);
                }
                if (countsResponse.transformationOutputCounts) {
                    setTransformationCounts(countsResponse.transformationOutputCounts);
                }
            } else {
                throw new Error(result.error || 'Failed to run next checkpoint');
            }
        } catch (error: any) {
            console.error('Error in handleNext:', error);

            // Extract detailed error information using helper function
            const { errorMessage, formattedErrorInfo } = extractErrorDetails(error);

            // Add the main error message to terminal logs
            setTerminalLogs(prevLogs => [...prevLogs, {
                timestamp: new Date().toISOString(),
                message: `Error in Next Checkpoint: ${errorMessage}`,
                level: 'error'
            }]);

            // Add detailed error information if available
            if (formattedErrorInfo) {
                setTerminalLogs(prevLogs => [...prevLogs, {
                    timestamp: new Date().toISOString(),
                    message: `Detailed Error: ${formattedErrorInfo}`,
                    level: 'error'
                }]);
            }

            // Auto-open terminal to show errors
            if (typeof setShowLogs === 'function') {
                setShowLogs(true);
            }

            // Show error banner at the top of the screen
            if (typeof setErrorBanner === 'function') {
                setErrorBanner({
                    title: 'Next Checkpoint Error',
                    description: formattedErrorInfo || errorMessage
                });
            }
        }
    }, [
        pipelineDtl?.pipeline_name,
        pipelineDtl?.name,
        pipelineName,
        attachedCluster?.master_ip,
        dispatch,
        setTransformationCounts,
        setTerminalLogs,
        extractErrorDetails,
        setShowLogs,
        setErrorBanner
    ]);

    const handleRefreshNode = useCallback(async (nodeId: string) => {
        try {
            setIsCanvasLoading(true);

            // Add log for refresh start
            setTerminalLogs(prevLogs => [...prevLogs, {
                timestamp: new Date().toISOString(),
                message: `Starting refresh for node: ${nodeId}`,
                level: 'info'
            }]);

            const partialPipelineJson: any = await convertUIToPipelineJsonUpToNode(
                nodes,
                edges,
                pipelineDtl,
                nodeId,
                pipelineName || pipelineDtl?.name || pipelineDtl?.pipeline_name
            );

            // Convert selectedMode to API parameter format
            const modeAction = selectedMode === 'debug' ? 'DEBUG' :
                selectedMode === 'interactive' ? 'INTERACTIVE' : 'ENGINE';

            // Create API parameters for partial pipeline execution
            const params = new URLSearchParams({
                pipeline_name: `${pipelineName || pipelineDtl?.name || pipelineDtl?.pipeline_name}`,
                pipeline_json: JSON.stringify(partialPipelineJson?.pipeline_json || partialPipelineJson),
                mode: modeAction,
                use_secure: USE_SECURE,
                target_node: nodeId // Add target node info for backend
            });

            // Add host parameter if cluster is attached
            if (attachedCluster?.master_ip) {
                params.append('host', attachedCluster.master_ip);
            }

            // Execute the partial pipeline
            const response: any = await apiService.post({
                baseUrl: CATALOG_REMOTE_API_URL,
                url: `/api/v1/pipeline/debug/reload_and_rerun_pipeline?${params.toString()}`,
                // usePrefix: true,
                method: 'POST',
                data: params
            });

            if (response.error) {
                throw new Error(response.error);
            }

            // Add success log
            setTerminalLogs(prevLogs => [...prevLogs, {
                timestamp: new Date().toISOString(),
                message: `✅ Node ${nodeId} refreshed successfully`,
                level: 'info'
            }]);

            // Optionally update transformation counts for the refreshed portion
            try {
                const host = attachedCluster?.master_ip || 'host.docker.internal';
                const countsResponse = await dispatch(getTransformationCount({
                    params: `${pipelineName || pipelineDtl?.name || pipelineDtl?.pipeline_name}`,
                    host: host
                })).unwrap();

                if (countsResponse.transformationOutputCounts) {
                    // Update only the counts for nodes up to the target node
                    setTransformationCounts(prevCounts => {
                        const newCounts = [...prevCounts];
                        countsResponse.transformationOutputCounts.forEach(newCount => {
                            const existingIndex = newCounts.findIndex(c => c.transformationName === newCount.transformationName);
                            if (existingIndex >= 0) {
                                newCounts[existingIndex] = newCount;
                            } else {
                                newCounts.push(newCount);
                            }
                        });
                        return newCounts;
                    });
                }
            } catch (countError) {
                console.warn('Could not update transformation counts after refresh:', countError);
            }

        } catch (error: any) {
            console.error(`❌ Error refreshing node ${nodeId}:`, error);

            // Add error log
            setTerminalLogs(prevLogs => [...prevLogs, {
                timestamp: new Date().toISOString(),
                message: `❌ Error refreshing node ${nodeId}: ${error.message}`,
                level: 'error'
            }]);
        } finally {
            setIsCanvasLoading(false);
        }
    }, [
        nodes,
        edges,
        pipelineDtl,
        pipelineName,
        selectedMode,
        dispatch,
        attachedCluster,
        setIsCanvasLoading,
        setTerminalLogs,
        setTransformationCounts
    ]);

    const fetchPipelineDetails = useCallback(async () => {
        try {
            // Determine effective pipeline ID from multiple sources
            const effectiveId = id || pipelineDtl?.pipeline_id || selectedPipeline?.pipeline_id || localStorage.getItem("pipeline_id")


            // Set loading state
            setIsCanvasLoading(true);

            // Fetch pipeline details
            if (effectiveId) {
                const response = await dispatch(getPipelineById({ id: effectiveId })).unwrap();
                console.log('🔧 fetchPipelineDetails: Received response:', response);
                // if (!response || !response.pipeline_json) {
                //     setNodes([]);
                //     setEdges([]);
                //     throw new Error('Invalid pipeline data received');
                // }
                const pipelineName = response?.pipeline_json?.name || response?.pipeline_name || selectedPipeline?.pipeline_name || `Pipeline ${effectiveId}`;
                console.log('🔧 fetchPipelineDetails: Setting pipeline name:', pipelineName);
                setPipeLineName(pipelineName);
                dispatch(setPipeLineType(response?.pipeline_type || null));
                // dispatch(setSelectedPipeline(response.));
                if (!response?.pipeline_json) {
                    dispatch(setBuildPipeLineDtl(null));
                    setPipelineJson(null);
                    setNodes([]);
                    setEdges([]);
                    setFormStates({});
                    setIsCanvasLoading(false);
                    return;
                }
                dispatch(setBuildPipeLineDtl(response.pipeline_json));
                let optimised = await resolveRefsPipelineJson(response.pipeline_json, response.pipeline_json);
                setPipelineJson(optimised);
                const uiJson = await convertPipelineToUIJson(optimised, handleSourceUpdate);

                // Map nodes with titles safely
                const nodesWithTitles = uiJson.nodes.map(node => {
                    const matchingTransformation = response.pipeline_json.transformations?.find(
                        (t: any) => t?.title === node?.data?.title && t?.name
                    );

                    if (matchingTransformation) {
                        return {
                            ...node,
                            data: {
                                ...node.data,
                                title: matchingTransformation.name,
                                transformationData: {
                                    ...node.data.transformationData,
                                    name: matchingTransformation.name
                                }
                            }
                        };
                    }
                    return node;
                });

                if (response?.pipeline_json == null) {
                    setPipelineJson(null);
                    setNodes([]);
                    setEdges([]);
                } else {
                    setNodes(nodesWithTitles);
                    setEdges(uiJson.edges || []);
                }

                // Initialize form states
                const initialFormStates: { [key: string]: any } = {};
                response.pipeline_json.transformations?.forEach((transformation: any) => {
                    const matchingNode = nodesWithTitles.find(
                        (node: any) =>
                            node?.data?.label === transformation?.transformation &&
                            node?.data?.title === transformation?.name
                    );

                    if (matchingNode?.id) {
                        initialFormStates[matchingNode.id] = getInitialFormState(transformation, matchingNode.id, matchingNode, response.pipeline_json);
                    }
                });

                console.log('🔧 usePipelineActions: Setting form states:', {
                    initialFormStates,
                    transformationsCount: response.pipeline_json.transformations?.length || 0,
                    nodesCount: nodesWithTitles.length,
                    pipelineId: effectiveId,
                    pipelineName: pipelineName
                });
                setFormStates(initialFormStates);
            }

            // Update pipeline name and JSON safely - prioritize response data

            // Convert pipeline to UI JSON



            // Clear loading state on success
            setIsCanvasLoading(false);

        } catch (error) {
            console.error("Error fetching pipeline details:", error);

            // Clear states on error to prevent stale data
            setNodes([]);
            setEdges([]);
            setFormStates({});

            // Clear loading state on error
            setIsCanvasLoading(false);

            // Show error banner if available
            if (setErrorBanner) {
                setErrorBanner({
                    title: "Failed to Load Pipeline",
                    description: `Unable to load pipeline details. ${error instanceof Error ? error.message : 'Please try again.'}`
                });
            }
        }
    }, [
        id,
        dispatch,
        selectedPipeline?.pipeline_name,
        setNodes,
        setEdges,
        setPipeLineName,
        setPipelineJson,
        setFormStates,
        handleSourceUpdate,
        getInitialFormState
    ]);

    return {
        handleRun,
        handleStop,
        handleNext,
        handleRefreshNode,
        fetchPipelineDetails,
        handleSourceUpdate
    };
};