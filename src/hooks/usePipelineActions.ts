import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import { 
    getTransformationCount, 
    runNextCheckpoint, 
    stopPipeLine,
    getPipelineById,
    setBuildPipeLineDtl
} from '@/store/slices/designer/buildPipeLine/BuildPipeLineSlice';
import { convertOptimisedPipelineJsonToPipelineJson, convertUIToPipelineJsonUpToNode, resolveRefsPipelineJson } from '@/lib/convertUIToPipelineJson';
import { convertPipelineToUIJson } from '@/lib/pipelineJsonConverter';
import { CATALOG_REMOTE_API_URL, USE_SECURE } from '@/config/platformenv';
import { apiService } from '@/lib/api/api-service';

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
    setUnsavedChanges
}: UsePipelineActionsProps) => {
    const dispatch = useDispatch<AppDispatch>();

    // Add type safety for the getInitialFormState function
    const getInitialFormState = useCallback((transformation: any, nodeId: string) => {
        if (!transformation || !nodeId) {
            return {};
        }

        try {
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
        let data;

        if (sourceData.sourceData?.data) {
            // Structure from TargetPopUp
            data = sourceData.sourceData.data;
        } else if (sourceData.data) {
            // Direct structure
            data = sourceData.data;
        } else {
            // Try to use sourceData directly as a fallback
            data = sourceData;
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
            setNodes(prevNodes =>
                prevNodes.map((node: any) => {
                    if (node.id === nodeId) {
                        // Make sure we have all the required data
                        if (!data.label) {
                            console.warn('Missing label in sourceData, using fallback');
                        }

                        return {
                            ...node,
                            label: data.label || node.label || 'Unnamed Node',
                            data: {
                                ...node.data,
                                title: data.label || node.data?.title || 'Unnamed Node',
                                source: data.source || node.data?.source || {},
                                transformationData: data.transformationData || node.data?.transformationData || {}
                            }
                        };
                    }
                    return node;
                })
            );
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

            setConversionLogs([{
                timestamp: new Date().toISOString(),
                message: 'Starting pipeline validation...',
                level: 'info'
            }]);

            const { pipeline_json }: any = await convertOptimisedPipelineJsonToPipelineJson(nodes, edges, pipelineDtl, pipelineName);
            pipeline_json.engine_type = "pyspark";
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
                // use_secure: USE_SECURE
            });
            
            // Add host parameter if cluster is attached
            if (attachedCluster?.master_ip) {
                params.append('host', attachedCluster.master_ip);
            } else {
                params.append('host', "host.docker.internal");
                params.append('port', "15003");
            }
            
            debuggedNodesList.forEach(checkpoint => {
                params.append('checkpoints', checkpoint?.title);
            });

            setSelectedFormState?.(pipeline_json);
            setRunDialogOpen?.(true);

            // Pass the request data directly
            let response: any = await apiService.post({
                baseUrl: CATALOG_REMOTE_API_URL,
                url: `/pipeline/debug/start_pipeline?${params.toString()}`,
                usePrefix: true,
                method: 'POST',
                data: params,
            });
            
            if (response.error) {
                throw new Error(response.error);
            }

            let countsResponse = await dispatch(getTransformationCount({
                params: pipelineName || pipelineDtl?.name || pipelineDtl?.pipeline_name,
                host: attachedCluster?.master_ip,
                use_secure: USE_SECURE
            })).unwrap();

            if (countsResponse.transformationOutputCounts) {
                setTransformationCounts(countsResponse.transformationOutputCounts);
            }

        } catch (error: any) {
            console.error('Error starting pipeline:', error);

            setTerminalLogs(prevLogs => [...prevLogs, {
                timestamp: new Date().toISOString(),
                message: `Error: ${error.message}`,
                level: 'error'
            }]);

            if (error.message.includes('Pipeline is incomplete or broken:')) {
                // const errorMessages = error.message.split('\n').slice(1);
                // setValidationErrors(errorMessages);
            }

            const errorDetail = error.response?.data?.detail || '';
            const errorMessage = error.message || '';
            
            if (
                errorMessage.includes('already exist') || 
                errorMessage.includes('already running') ||
                errorDetail.includes('ALREADY_EXISTS') ||
                errorDetail.includes('already running')
            ) {
                try {
                    let countsResponse = await dispatch(getTransformationCount({
                        params: pipelineName || pipelineDtl?.name || pipelineDtl?.pipeline_name
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

            setSaveError(error.message);
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
        setSaveError
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
            const pipelineName_val = pipelineDtl?.name || pipelineDtl?.pipeline_name || pipelineName;
            const host = attachedCluster?.master_ip;
            
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
        } catch (error) {
            console.error('Error in handleNext:', error);
            // Handle error appropriately (e.g., show error message to user)
        }
    }, [
        pipelineDtl?.pipeline_name, 
        pipelineDtl?.name,
        pipelineName,
        attachedCluster?.master_ip, 
        dispatch,
        setTransformationCounts
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
                target_node: nodeId // Add target node info for backend
            });
            
            // Add host parameter if cluster is attached
            if (attachedCluster?.master_ip) {
                params.append('host', attachedCluster.master_ip);
            }

            // Execute the partial pipeline
            const response: any = await apiService.post({
                baseUrl: CATALOG_REMOTE_API_URL,
                url: `/pipeline/debug/reload_and_rerun_pipeline?${params.toString()}`,
                usePrefix: true,
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
                const host = attachedCluster?.master_ip;
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
            // Check if id exists and is valid
            if (!id) {
                return;
            }

            // Fetch pipeline details
            const response = await dispatch(getPipelineById({ id })).unwrap();
            if (!response || !response.pipeline_json) {
                setNodes([]);
                setEdges([]);
                throw new Error('Invalid pipeline data received');
            }
            
            // Update pipeline name and JSON safely
            setPipeLineName(selectedPipeline?.pipeline_name || response.pipeline_json.name);
            dispatch(setBuildPipeLineDtl(response.pipeline_json));
            let optimised = await resolveRefsPipelineJson(response?.pipeline_json, response?.pipeline_json);
            setPipelineJson(optimised);

            // Convert pipeline to UI JSON
            const uiJson = await convertPipelineToUIJson(optimised, handleSourceUpdate);

            if (!uiJson || !uiJson.nodes) {
                setNodes([]);
                setEdges([]);
                throw new Error('Failed to convert pipeline to UI format');
            }

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
            const initialFormStates = {};
            response.pipeline_json.transformations?.forEach((transformation: any) => {
                const matchingNode = nodesWithTitles.find(
                    (node: any) =>
                        node?.data?.label === transformation?.transformation &&
                        node?.data?.title === transformation?.name
                );

                if (matchingNode?.id) {
                    initialFormStates[matchingNode.id] = getInitialFormState(transformation, matchingNode.id);
                }
            });

            setFormStates(initialFormStates);

        } catch (error) {
            console.error("Error fetching pipeline details:", error);
            // Optionally set an error state or show a notification
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