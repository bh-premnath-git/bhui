import React, {
    useCallback,
    useMemo,
    useState,
    useEffect,
    useRef,
} from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Save } from "lucide-react";
import { useGroupedProperties } from "@/hooks/useGroupedProperties";
import { useFlow } from "@/context/designers/FlowContext";
import { useOtherTypes } from "@/hooks/useOtherTypes";
import { useNodeFormInput } from "@/hooks/useNodeFormInput";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { RootState } from "@/store";
import { createShortUUID } from "@/lib/utils";
import { updateFlowDefinitionOnServer } from "./utils/updateFlowDefinitionOnServer";
import { useFormValidation } from "./hooks/useFormValidation";
import { ParametersSection } from "./components/ParametersSection";
import { TabType, ParameterItem } from "./types";
import { Property } from "@/types/designer/flow";
import { FormLayout } from "../Form/FormLayout";
import { usePipelineContext } from "@/context/designers/DataPipelineContext";

interface NodeFormProps {
    id: string;
    closeTap: () => void;
}

export const NodeForm: React.FC<NodeFormProps> = ({ closeTap, id }) => {
    /* --------------------------- Context / Hooks ------------------------- */
    const {
        saveFlow,
        selectedNode,
        setSelectedNode, // Add this to get the setSelectedNode function
        setFormDataNum,
        nodeFormData,
        prevNodeFn,
        updateNodeFormData,
        updateNodeMeta,
        getNodeFormData,
        revertOrSaveData,
        updateNodeDependencies,
        selectedFlowId,
        flowConfigMap,
        getPipelineDetails,
        flowPipeline,
    } = useFlow();
    
    // Log the selectedNode from the Flow context
    console.log("NodeForm: selectedNode from Flow context:", selectedNode);
    const {
        updatedSelectedNodeId,
        nodes,
        formStates,
        setFormStates,
        setNodes,
        updateSetNode,
        updateAllNodeDependencies
    } = usePipelineContext();

    // Early return if critical context values are not available
    if (!updatedSelectedNodeId || nodes === undefined || !formStates || !setFormStates) {
        console.warn('NodeForm: Critical context values are not available:', {
            updatedSelectedNodeId: !!updatedSelectedNodeId,
            nodes: nodes !== undefined,
            formStates: !!formStates,
            setFormStates: !!setFormStates
        });
        return <div>Loading node form...</div>;
    }

    const dispatch = useAppDispatch();
    const { selectedFlow, currentFlow } = useAppSelector((s: RootState) => s.flow);
    const { edges } = usePipelineContext();
    /* ------------------------------ State -------------------------------- */
    const [activeTab, setActiveTab] = useState<TabType>("property");
    // Get the initial value from the node's form data in formStates
    const nodeFormState = useMemo(() => formStates[id] || {}, [formStates, id]);
    const initialNodeType = useMemo(() => {
        // First check if the node has a type in formStates
        if (nodeFormState.type) {
            return nodeFormState.type;
        }
        // Add null check for nodes array
        if (!nodes || !Array.isArray(nodes)) {
            console.warn('initialNodeType: nodes is undefined or not an array:', nodes);
            return "";
        }
        // Then check if the node has a selectedData property
        const node = nodes.find(n => n.id === id);
        return node?.data?.selectedData || "";
    }, [nodeFormState, nodes, id]);

    const [selectedValue, setSelectedValue] = useState<string>(initialNodeType);
    const [requiredFieldsState, setRequiredFieldsState] = useState<string[]>([]);
    const paramsInitRef = useRef(false);

    const [pipelineData, setPipelineData] = useState<any>(null);
    console.log(currentFlow, "currentFlow")
    // When the pipeline changes, reset the pipeline data
    useEffect(() => {
        console.log("Resetting pipeline data due to pipeline change");
        setPipelineData(null); // Clear current data
        // Then fetch the new data (happens in the next effect)
    }, [flowPipeline]); // Only flowPipeline, not getPipelineDetails to avoid over-triggering

    // Use effect to update pipeline data when it changes
    useEffect(() => {
        const details = getPipelineDetails(null);
        setPipelineData(details);
        console.log("Updated pipelineDetails in NodeForm:", details);
    }, [getPipelineDetails, flowPipeline]); // Added flowPipeline as dependency
    
    // Add an effect to log when selectedNode changes
    useEffect(() => {
        console.log("NodeForm: selectedNode changed:", selectedNode);
        if (selectedNode) {
            console.log("NodeForm: selectedNode ID:", selectedNode.id);
            console.log("NodeForm: This component's ID:", id);
            console.log("NodeForm: Do they match?", selectedNode.id === id);
        }
    }, [selectedNode, id]);

    // Add more detailed logging for debugging
    console.log("NodeForm: Checking selectedNode:", selectedNode);
    console.log("NodeForm: Checking id:", id);
    console.log("NodeForm: Checking if selectedNode exists:", !!selectedNode);
    
    // If selectedNode is not available, try to find it in the nodes array
    if (!selectedNode) {
        console.log("NodeForm: No selected node found for id:", id);
        
        // Add null check for nodes array
        if (!nodes || !Array.isArray(nodes)) {
            console.warn('NodeForm: nodes is undefined or not an array:', nodes);
            return <div>Error: Unable to load node data</div>;
        }
        
        // Try to find the node in the nodes array
        const nodeFromId = nodes.find(n => n.id === id);
        
        if (nodeFromId) {
            console.log("NodeForm: Found node in nodes array:", nodeFromId);
            // We found the node, but we need to update the selectedNode in the FlowContext
            // This is a workaround - in a real app, you'd want to fix the root cause
            setTimeout(() => {
                console.log("NodeForm: Setting selectedNode from nodes array");
                setSelectedNode(nodeFromId);
            }, 0);
            
            // Continue with the found node
            console.log("NodeForm: Continuing with found node");
            return (
                <div className="p-4">
                    <div className="animate-pulse flex space-x-4">
                        <div className="flex-1 space-y-4 py-1">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="space-y-2">
                                <div className="h-4 bg-gray-200 rounded"></div>
                                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                            </div>
                        </div>
                    </div>
                    <p className="text-center mt-4">Loading node data...</p>
                </div>
            );
        }
        
        // Add a delay and check again
        setTimeout(() => {
            console.log("NodeForm: Checking selectedNode after delay:", selectedNode);
        }, 500);
        return null;
    }

    console.log("NodeForm: Rendering form for node:", id, selectedNode);

    /* -------------------------- Derived values --------------------------- */
    const typesMatched = useOtherTypes(selectedNode.data.selectedData);

    const selectedProperties = useMemo(() => {
        if (Array.isArray(selectedNode.data.meta.properties) && selectedValue) {
            return selectedNode.data.meta.properties.find(
                (p: any) =>
                    p.type === selectedValue || p.type === selectedNode.data.selectedData
            );
        }
        return selectedNode.data.meta.properties;
    }, [selectedNode.data.meta.properties, selectedValue]);

    const defaultParameters = useMemo<ParameterItem[]>(() => {
        const p1 = selectedProperties?.parameters?.ui_properties?.default;
        const p2 =
            selectedProperties?.properties?.parameters?.ui_properties?.default;
        return p1 || p2 || [];
    }, [selectedProperties]);

    // Get the base grouped properties
    const baseGroupedProperties =
        useGroupedProperties({ properties: selectedProperties }) ?? {
            property: [],
            settings: [],
            parameters: [],
        };

    // Add custom properties including task_id and cluster_task_id
    const groupedProperties = useMemo(() => {
        let enhancedProperties = { ...baseGroupedProperties };
        
        // Always add task_id field
        const taskIdProperty: any = {
            key: "task_id",
            description: "Unique identifier for this task",
            ui_properties: {
                property_name: "Task ID",
                property_key: "task_id",
                ui_type: "textfield",
                order: 1,
                mandatory: true,
                group_key: "property"
            }
        };
        
        // Check if task_id property already exists
        const taskIdExists = enhancedProperties.property.some(
            prop => prop.key === "task_id"
        );
        
        // Add task_id if it doesn't exist
        if (!taskIdExists) {
            enhancedProperties = {
                ...enhancedProperties,
                property: [
                    taskIdProperty,
                    ...enhancedProperties.property
                ]
            };
        }
        
        // Add cluster_task_id field for specific node types
        if (selectedValue === 'EmrAddStepsOperator' || selectedValue === 'EmrTerminateJobFlowOperator') {
            const clusterTaskIdProperty: any = {
                key: "cluster_task_id",
                description: "The task ID of the EMR cluster creation task",
                ui_properties: {
                    property_name: "Cluster Task ID",
                    property_key: "cluster_task_id",
                    ui_type: "get_from_ui",
                    parameter_name: "task_id",
                    order: 4,
                    mandatory: true,
                    group_key: "property"
                }
            };
            
            // Check if cluster_task_id property already exists
            const clusterTaskIdExists = enhancedProperties.property.some(
                prop => prop.key === "cluster_task_id"
            );
            
            // Only add if it doesn't already exist
            if (!clusterTaskIdExists) {
                enhancedProperties = {
                    ...enhancedProperties,
                    property: [
                        ...enhancedProperties.property,
                        clusterTaskIdProperty
                    ]
                };
            }
        }
        
        return enhancedProperties;
    }, [baseGroupedProperties, selectedValue]);

    const hasParameters = useMemo(
        () => groupedProperties.parameters.length > 0 && !!selectedValue,
        [groupedProperties, selectedValue]
    );

    // Get task ID from flow JSON if available, otherwise generate a new one
    const taskID = useMemo(() => {
        // First check if there's a task_id in the node data
        if (selectedNode.data?.formData?.task_id) {
            console.log(`Using task_id from node data: ${selectedNode.data.formData.task_id}`);
            return selectedNode.data.formData.task_id;
        }
        
        // Then check nodeFormData for existing task_id
        const existingFormData = nodeFormData.find((i) => i.nodeId === selectedNode.id)?.formData;
        if (existingFormData?.task_id) {
            console.log(`Using existing task_id from form data: ${existingFormData.task_id}`);
            return existingFormData.task_id;
        }
        
        // If no existing task_id is found, generate a new one
        const newTaskId = `${selectedNode.data.label}_${selectedValue}_${createShortUUID()}`;
        console.log(`Generated new task_id: ${newTaskId}`);
        return newTaskId;
    }, [selectedNode.data, selectedValue, nodeFormData, selectedNode.id]);

    const currentFormData = useMemo(() => {
        const existingFormData = nodeFormData.find((i) => i.nodeId === selectedNode.id)?.formData || {};
        
        // Merge data from both Flow context (nodeFormData) and Pipeline context (nodeFormState)
        // Pipeline context (nodeFormState) takes precedence as it contains the most recent saved data
        const mergedFormData = {
            ...existingFormData,
            ...nodeFormState
        };
        
        // Ensure task_id is always present
        return {
            ...mergedFormData,
            task_id: mergedFormData.task_id || taskID
        };
    }, [nodeFormData, selectedNode.id, taskID, nodeFormState]);

    const depends_on = useMemo(
        () => prevNodeFn(selectedNode.id) ?? [],
        [prevNodeFn, selectedNode.id]
    );

    /* --------------------------- Input handler --------------------------- */
    const handleInputChange = useNodeFormInput({
        selectedNode,
        currentFormData,
        depends_on,
        updateNodeFormData,
        saveFlow,
        taskID,
    });

    /* ---------------------- Task ID and Parameters initialisation -------------------- */
    // Initialize task_id when the form is first opened
    useEffect(() => {
        if (!currentFormData.task_id) {
            const updatedData = {
                ...currentFormData,
                task_id: taskID,
                type: selectedValue || currentFormData.type,
            };

            // Update both the node form data and the form states
            updateNodeFormData(selectedNode.id, updatedData);

            // Also update in the pipeline context form states
            setFormStates(prev => ({
                ...prev,
                [selectedNode.id]: updatedData
            }));
        }
    }, [selectedNode.id, taskID, currentFormData, selectedValue, updateNodeFormData, setFormStates]);

    useEffect(() => {
        console.log(nodes)
        // Check if we have existing parameters in the node form state
        const hasExistingParamsInNodeState =
            Array.isArray(nodeFormState.parameters) &&
            nodeFormState.parameters.length > 0;

        // Check if we have existing parameters in the current form data
        const hasExistingParamsInFormData =
            Array.isArray(currentFormData.parameters) &&
            currentFormData.parameters.length > 0;

        if (!hasExistingParamsInFormData && !hasExistingParamsInNodeState) {
            paramsInitRef.current = false;

            if (hasParameters && defaultParameters.length) {
                // Initialize with default parameters
                const updatedData = {
                    ...currentFormData,
                    parameters: defaultParameters,
                    type: selectedValue || currentFormData.type,
                    task_id: currentFormData.task_id || taskID, // Ensure task_id is preserved
                };

                // Update both the node form data and the form states
                updateNodeFormData(selectedNode.id, updatedData);

                // Also update in the pipeline context form states
                setFormStates(prev => ({
                    ...prev,
                    [selectedNode.id]: updatedData
                }));

                paramsInitRef.current = true;
            }
        } else if (hasExistingParamsInNodeState && !hasExistingParamsInFormData) {
            // If we have parameters in the node state but not in form data, use those
            updateNodeFormData(selectedNode.id, {
                ...currentFormData,
                parameters: nodeFormState.parameters,
                type: selectedValue || nodeFormState.type || currentFormData.type,
                task_id: currentFormData.task_id || taskID, // Ensure task_id is preserved
            });
        }
    }, [
        selectedNode.id,
        selectedValue,
        hasParameters,
        defaultParameters,
        updateNodeFormData,
        currentFormData,
        nodeFormState,
        setFormStates,
        taskID
    ]);

    useEffect(() => {
        const hasNoParameters =
            !currentFormData.parameters ||
            !Array.isArray(currentFormData.parameters) ||
            currentFormData.parameters.length === 0;

        if (
            hasParameters &&
            defaultParameters.length &&
            hasNoParameters &&
            !paramsInitRef.current
        ) {
            // Create updated data with default parameters
            const updatedData = {
                ...currentFormData,
                parameters: defaultParameters,
                type: selectedValue || currentFormData.type,
            };

            // Update both the node form data and the form states
            updateNodeFormData(selectedNode.id, updatedData);

            // Also update in the pipeline context form states
            setFormStates(prev => ({
                ...prev,
                [selectedNode.id]: updatedData
            }));

            paramsInitRef.current = true;
        }
    }, [
        hasParameters,
        defaultParameters,
        updateNodeFormData,
        currentFormData,
        selectedNode.id,
        selectedValue,
        setFormStates
    ]);

    /* ------------------------------ Save --------------------------------- */
    const { isSaveDisabled, validateForm } = useFormValidation(
        selectedNode?.id || '',
        requiredFieldsState,
        getNodeFormData
    );

    const handleSave = useCallback(() => {
        console.log("Save button clicked");
        if (!selectedNode || !validateForm()) {
            console.log("Validation failed or no selected node");
            return;
        }

        console.log("Creating form data");
        const newFormData = [...nodeFormData];
        console.log(newFormData)
        console.log(selectedNode.id)
        const idx = newFormData.findIndex((i) => i.nodeId === selectedNode.id);
        console.log(idx)
        let rawParameters: ParameterItem[] = [];
        if (Array.isArray(currentFormData.parameters)) {
            rawParameters = [...currentFormData.parameters];
        } else if (defaultParameters.length) {
            rawParameters = [...defaultParameters];
        } else {
            rawParameters = [];
        }

        // console.log("[NodeForm] Raw parameters before filtering:", JSON.stringify(rawParameters));

        // Filter out parameters where the value is null OR the parameter itself is null
        const parameters = rawParameters.filter(p => p !== null && p.value !== null);
        // console.log("[NodeForm] Parameters after filtering:", JSON.stringify(parameters));

        // Get the dependencies based on incoming edges
        const incomingEdges = edges.filter(edge => edge.target === selectedNode.id);
        const dependsOn: string[] = [];

        console.log(`[NodeForm] Processing dependencies for node ${selectedNode.id}`);
        console.log(`[NodeForm] Found ${incomingEdges.length} incoming edges:`, incomingEdges);

        // Collect task_ids from source nodes
        incomingEdges.forEach(edge => {
            console.log(`[NodeForm] Processing edge from ${edge.source} to ${edge.target}`);

            // Try to find the source node in the nodes array
            const sourceNode = nodes.find(n => n.id === edge.source);
            if (sourceNode && sourceNode.data?.formData?.task_id) {
                const taskId = sourceNode.data.formData.task_id;
                console.log(`[NodeForm] Found task_id in nodes data: ${taskId}`);
                dependsOn.push(taskId);
            } else {
                // If not found in nodes, try to find in formStates
                const sourceFormState = formStates[edge.source];
                if (sourceFormState && sourceFormState.task_id) {
                    const taskId = sourceFormState.task_id;
                    console.log(`[NodeForm] Found task_id in formStates: ${taskId}`);
                    dependsOn.push(taskId);
                } else {
                    console.log(`[NodeForm] Could not find task_id for source node: ${edge.source}`);
                }
            }
        });

        // Use the dependencies from edges, or fall back to prevNodeFn if no edges found
        const finalDependsOn = dependsOn.length > 0 ? dependsOn : (prevNodeFn(selectedNode.id) || []);
        console.log(`[NodeForm] Final depends_on array: ${JSON.stringify(finalDependsOn)}`);

        // Prepare the form data
        const formData: any = {
            ...currentFormData,
            task_id: `${currentFormData.task_id || taskID}`.toLowerCase(),
            type: selectedValue,
            depends_on: finalDependsOn,
            parameters,
        };

        // Add cluster_task_id for EmrAddStepsOperator and EmrTerminateJobFlowOperator
        if (selectedValue === 'EmrAddStepsOperator' || selectedValue === 'EmrTerminateJobFlowOperator') {
            console.log("NodeForm - Setting cluster_task_id for", selectedValue);
            console.log("NodeForm - Current formData:", currentFormData);

            // If cluster_task_id is not set, initialize it with a task_id from EmrCreateJobFlowOperator node
            if (!currentFormData.cluster_task_id) {
                console.log("NodeForm - No cluster_task_id found, looking for EMR cluster nodes");

                // Find all EMR cluster creation nodes
                const clusterNodes = nodes.filter(node =>
                    node.data?.formData?.type === 'EmrCreateJobFlowOperator'
                );

                console.log("NodeForm - Found EMR cluster nodes:", clusterNodes.map(n => ({
                    id: n.id,
                    label: n.data?.label,
                    task_id: n.data?.formData?.task_id
                })));

                // Use the first EMR cluster node found
                const clusterNode = clusterNodes[0];

                if (clusterNode && clusterNode.data?.formData?.task_id) {
                    console.log("NodeForm - Using task_id from EMR cluster node:", clusterNode.data.formData.task_id);
                    formData.cluster_task_id = clusterNode.data.formData.task_id;
                } else {
                    // If no EmrCreateJobFlowOperator node is found, use the current task_id
                    console.log("NodeForm - No EMR cluster node found, using current task_id:", formData.task_id);
                    formData.cluster_task_id = formData.task_id;
                }
            } else {
                // Keep the existing cluster_task_id
                console.log("NodeForm - Using existing cluster_task_id:", currentFormData.cluster_task_id);
                formData.cluster_task_id = currentFormData.cluster_task_id;
            }
        }

        const updatedFormData: any = {
            nodeId: selectedNode.id,
            formData,
        };

        if (idx >= 0) newFormData[idx] = updatedFormData;
        else newFormData.push(updatedFormData);
        console.log(updatedFormData.formData);

        // Safely parse pipeline_name if it exists and appears to be JSON
        if (updatedFormData.formData?.pipeline_name) {
            try {
                // Check if the pipeline_name looks like JSON (starts with { and ends with })
                if (typeof updatedFormData.formData.pipeline_name === 'string' &&
                    updatedFormData.formData.pipeline_name.trim().startsWith('{') &&
                    updatedFormData.formData.pipeline_name.trim().endsWith('}')) {

                    let pipeline = JSON.parse(updatedFormData.formData.pipeline_name);
                    console.log("Parsed pipeline:", pipeline);

                    if (pipeline && typeof pipeline === 'object') {
                        updatedFormData.formData.pipeline_name = pipeline?.pipeline_key;
                        updatedFormData.formData.pipeline_id = pipeline?.id;

                    }
                }
                // If it's not JSON, keep the original value
            } catch (error) {
                console.error("Error parsing pipeline_name:", error);
                // Keep the original value if parsing fails
            }
        }


        // Update the form data in the Flow context
        updateNodeFormData(selectedNode.id, updatedFormData.formData);

        // Update the form data in the Pipeline context
        setFormStates(prev => ({
            ...prev,
            [selectedNode.id]: updatedFormData.formData
        }));
        console.log(selectedNode.id)
        console.log(nodes)

        // Update the node data in the Pipeline context
        // First create the updated nodes array
        const updatedNodes = nodes.map(node => {
            if (node.id === selectedNode.id) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        selectedData: selectedValue,
                        formData: updatedFormData.formData,
                        // Update any other relevant node data
                        transformationData: {
                            ...node.data.transformationData,
                            ...updatedFormData.formData,
                            type: selectedValue,
                            cluster_task_id: updatedFormData.formData.cluster_task_id
                        }
                    }
                };
            }
            return node;
        });

        // Use updateSetNode to update both nodes and edges at once
        updateSetNode(updatedNodes, edges);

        updateNodeDependencies();
        setFormDataNum((p) => p + 1);


        // Update all node dependencies based on the current edges
        console.log("Updating all node dependencies before saving");
        updateAllNodeDependencies();

        // Call updateFlowDefinitionOnServer directly without setTimeout
        updateFlowDefinitionOnServer(
            selectedFlowId,
            selectedFlow,
            dispatch,
            flowConfigMap,
            newFormData,
            updatedNodes,
            edges,
            currentFlow
        );

        console.log("Closing form");
        closeTap();
        revertOrSaveData(id, true);
    }, [
        closeTap,
        id,
        validateForm,
        revertOrSaveData,
        updateNodeDependencies,
        selectedNode,
        selectedFlowId,
        selectedFlow,
        dispatch,
        setFormDataNum,
        flowConfigMap,
        nodeFormData,
        currentFormData,
        selectedValue,
        taskID,
        prevNodeFn,
        updateNodeFormData,
        defaultParameters,
        nodes,
        edges,
        formStates,
        setFormStates,
        updateSetNode,
        currentFlow,
        updateAllNodeDependencies
    ]);

    /* -------------------------- Parameter CRUD --------------------------- */
    const handleParameterChange = useCallback(
        (index: number, field: "key" | "value", value: string) => {
            const list = Array.isArray(currentFormData.parameters)
                ? currentFormData.parameters
                : defaultParameters;
            const updated = [...list];
            if (!updated[index]) updated[index] = { key: "", value: "" };
            (updated[index] as any)[field] = value;

            // Create updated form data
            const updatedData = {
                ...currentFormData,
                parameters: updated,
                type: selectedValue
            };

            // Update in Flow context
            updateNodeFormData(selectedNode.id, updatedData);

            // Update in Pipeline context form states
            setFormStates(prev => ({
                ...prev,
                [selectedNode.id]: updatedData
            }));

            // Update the node data in the Pipeline context
            const updatedNodes = nodes.map(node => {
                if (node.id === selectedNode.id) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            selectedData: selectedValue,
                            formData: updatedData,
                            transformationData: {
                                ...node.data.transformationData,
                                ...updatedData,
                                type: selectedValue
                            }
                        }
                    };
                }
                return node;
            });

            // Use updateSetNode to update nodes
            updateSetNode(updatedNodes, edges);
        },
        [currentFormData, defaultParameters, selectedNode, updateNodeFormData, selectedValue, setFormStates, nodes, edges, updateSetNode]
    );

    const addParameterRow = useCallback(() => {
        let currentParams: ParameterItem[] = [];

        if (
            Array.isArray(currentFormData.parameters) &&
            currentFormData.parameters.length
        ) {
            currentParams = [...currentFormData.parameters];
        } else if (defaultParameters.length) {
            currentParams = [...defaultParameters];
        }

        currentParams.push({ key: "", value: "" });

        // Create updated form data
        const updatedData = {
            ...currentFormData,
            parameters: currentParams,
            type: selectedValue || selectedNode.data.selectedData,
            task_id: currentFormData.task_id || `task-${selectedNode.id}`,
        };

        // Update in Flow context
        updateNodeFormData(selectedNode.id, updatedData);

        // Update in Pipeline context form states
        setFormStates(prev => ({
            ...prev,
            [selectedNode.id]: updatedData
        }));

        // Update the node data in the Pipeline context
        const updatedNodes = nodes.map(node => {
            if (node.id === selectedNode.id) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        selectedData: selectedValue || selectedNode.data.selectedData,
                        formData: updatedData,
                        transformationData: {
                            ...node.data.transformationData,
                            ...updatedData,
                            type: selectedValue || selectedNode.data.selectedData
                        }
                    }
                };
            }
            return node;
        });

        // Use updateSetNode to update nodes
        updateSetNode(updatedNodes, edges);
    }, [
        currentFormData,
        defaultParameters,
        selectedNode,
        selectedValue,
        updateNodeFormData,
        setFormStates,
        nodes,
        edges,
        updateSetNode
    ]);

    const removeParameterRow = useCallback(
        (index: number) => {
            let currentParams: ParameterItem[] = [];

            if (Array.isArray(currentFormData.parameters)) {
                currentParams = [...currentFormData.parameters];
            } else if (defaultParameters.length) {
                currentParams = [...defaultParameters];
                return; // cannot remove default set
            } else return;

            const paramToRemove = currentParams[index];
            const isDefault = defaultParameters.some(
                (d) => d.key === paramToRemove.key
            );
            if (isDefault) return;

            if (currentParams.length > 1) {
                const newParams = currentParams.filter((_, i) => i !== index);

                // Create updated form data
                const updatedData = {
                    ...currentFormData,
                    parameters: newParams,
                    type: selectedValue || selectedNode.data.selectedData
                };

                // Update in Flow context
                updateNodeFormData(selectedNode.id, updatedData);

                // Update in Pipeline context form states
                setFormStates(prev => ({
                    ...prev,
                    [selectedNode.id]: updatedData
                }));

                // Update the node data in the Pipeline context
                const updatedNodes = nodes.map(node => {
                    if (node.id === selectedNode.id) {
                        return {
                            ...node,
                            data: {
                                ...node.data,
                                selectedData: selectedValue || selectedNode.data.selectedData,
                                formData: updatedData,
                                transformationData: {
                                    ...node.data.transformationData,
                                    ...updatedData,
                                    type: selectedValue || selectedNode.data.selectedData
                                }
                            }
                        };
                    }
                    return node;
                });

                // Use updateSetNode to update nodes
                updateSetNode(updatedNodes, edges);
            }
        },
        [
            currentFormData,
            defaultParameters,
            selectedNode,
            selectedValue,
            updateNodeFormData,
            setFormStates,
            nodes,
            edges,
            updateSetNode
        ]
    );
    /* --------------------------- Misc handlers --------------------------- */
    const handleTabChange = useCallback((t: TabType) => setActiveTab(t), []);
    const handleValueChange = useCallback(
        (val: string) => {
            // Add null check for selectedNode
            if (!selectedNode || !selectedNode.data) {
                console.warn('handleValueChange: selectedNode or its data is undefined:', selectedNode);
                return;
            }
            
            console.log('handleValueChange: selectedNode.data:', selectedNode.data);
            console.log('handleValueChange: selectedNode.data.requiredFields:', selectedNode.data.requiredFields);
            
            setSelectedValue(val);
            
            // Handle case where requiredFields might be undefined
            const requiredFields = selectedNode.data.requiredFields || [];
            const req = requiredFields.find(
                (i: any) => Object.keys(i)[0] === val
            );
            const fields = req?.[val] || [];
            setRequiredFieldsState(fields);

            // Create basic updated form data
            const updatedData: any = {
                ...currentFormData,
                type: val
            };

            // Initialize cluster_task_id for EmrAddStepsOperator and EmrTerminateJobFlowOperator
            if (val === 'EmrAddStepsOperator' || val === 'EmrTerminateJobFlowOperator') {
                console.log("handleValueChange - Setting cluster_task_id for", val);

                // If cluster_task_id is not set, initialize it with a task_id from EmrCreateJobFlowOperator node
                if (!currentFormData.cluster_task_id) {
                    console.log("handleValueChange - No cluster_task_id found, looking for EMR cluster nodes");

                    // Find all EMR cluster creation nodes
                    const clusterNodes = nodes.filter(node =>
                        node.data?.formData?.type === 'EmrCreateJobFlowOperator'
                    );

                    console.log("handleValueChange - Found EMR cluster nodes:", clusterNodes.map(n => ({
                        id: n.id,
                        label: n.data?.label,
                        task_id: n.data?.formData?.task_id
                    })));

                    // Use the first EMR cluster node found
                    const clusterNode = clusterNodes[0];

                    if (clusterNode && clusterNode.data?.formData?.task_id) {
                        console.log("handleValueChange - Using task_id from EMR cluster node:", clusterNode.data.formData.task_id);
                        updatedData.cluster_task_id = clusterNode.data.formData.task_id;
                    } else {
                        // If no EmrCreateJobFlowOperator node is found, use the current task_id
                        console.log("handleValueChange - No EMR cluster node found, using current task_id:", currentFormData.task_id);
                        updatedData.cluster_task_id = currentFormData.task_id || `task-${selectedNode.id}`;
                    }
                } else {
                    // Keep the existing cluster_task_id
                    console.log("handleValueChange - Using existing cluster_task_id:", currentFormData.cluster_task_id);
                    updatedData.cluster_task_id = currentFormData.cluster_task_id;
                }
            }

            // Update in Flow context
            updateNodeFormData(selectedNode.id, updatedData);

            // Update in Pipeline context form states
            setFormStates(prev => ({
                ...prev,
                [selectedNode.id]: updatedData
            }));

            // Update node metadata
            updateNodeMeta(
                selectedNode.id,
                { type: val },
                { type: val, requiredFields: fields }
            );

            // Update the node data in the Pipeline context
            // Additional null check for nodes array
            if (!nodes || !Array.isArray(nodes)) {
                console.warn('handleValueChange: nodes is undefined or not an array during update:', nodes);
                return;
            }
            
            const updatedNodes = nodes.map(node => {
                if (node.id === selectedNode.id) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            selectedData: val,
                            formData: updatedData,
                            transformationData: {
                                ...node.data.transformationData,
                                ...updatedData,
                                type: val
                            }
                        }
                    };
                }
                return node;
            });

            // Use updateSetNode to update nodes
            updateSetNode(updatedNodes, edges);

            // Add null check for selectedNode
            if (selectedNode && selectedNode.id) {
                updatedSelectedNodeId(selectedNode.id, val);
            } else {
                console.warn('selectedNode is undefined or missing id:', selectedNode);
            }

            // When EmrAddStepsOperator is selected, initialize with pipeline parameters
            if (val === 'EmrAddStepsOperator' && pipelineData?.pipeline_parameters?.length) {
                console.log("Adding pipeline parameters to form data for EmrAddStepsOperator");

                // Get current parameters (if any)
                let currentParams = Array.isArray(currentFormData.parameters)
                    ? [...currentFormData.parameters]
                    : [];

                // Create a map of current parameters by key for efficient lookup
                const paramMap = new Map();
                currentParams.forEach(p => {
                    if (p && p.key) paramMap.set(p.key, p);
                });

                // Add pipeline parameters that aren't already in currentParams
                pipelineData.pipeline_parameters.forEach(p => {
                    if (p && p.key && !paramMap.has(p.key)) {
                        currentParams.push(p);
                    }
                });

                // Create updated form data
                const updatedData: any = {
                    ...currentFormData,
                    parameters: currentParams,
                    type: val
                };

                // Update in Flow context
                updateNodeFormData(selectedNode.id, updatedData);

                // Update in Pipeline context form states
                setFormStates(prev => ({
                    ...prev,
                    [selectedNode.id]: updatedData
                }));

                // Update the node data in the Pipeline context
                const updatedNodes = nodes.map(node => {
                    if (node.id === selectedNode.id) {
                        return {
                            ...node,
                            data: {
                                ...node.data,
                                selectedData: val,
                                formData: updatedData,
                                transformationData: {
                                    ...node.data.transformationData,
                                    ...updatedData,
                                    type: val,
                                    cluster_task_id: updatedData.cluster_task_id
                                }
                            }
                        };
                    }
                    return node;
                });

                // Use updateSetNode to update nodes
                updateSetNode(updatedNodes, edges);
            }
        },
        [selectedNode, updateNodeMeta, updatedSelectedNodeId, pipelineData, currentFormData, updateNodeFormData, setFormStates, nodes, edges, updateSetNode, selectedValue]
    );

    // Effect to initialize selectedValue from node data or form state
    useEffect(() => {
        if (initialNodeType) {
            setSelectedValue(initialNodeType);

            if (selectedNode && selectedNode.id && selectedNode.data) {
                // Handle case where requiredFields might be undefined
                const requiredFields = selectedNode.data.requiredFields || [];
                const req = requiredFields.find(
                    (i: any) => Object.keys(i)[0] === initialNodeType
                );
                const fields = req?.[initialNodeType] || [];
                setRequiredFieldsState(fields);

                // Update node metadata with the type
                updateNodeMeta(
                    selectedNode.id,
                    { type: initialNodeType },
                    { type: initialNodeType, requiredFields: fields }
                );
                // Add null check before calling updatedSelectedNodeId
                if (selectedNode && selectedNode.id) {
                    updatedSelectedNodeId(selectedNode.id, initialNodeType);
                }
            }
        } else if (selectedNode?.data?.selectedData) {
            setSelectedValue(selectedNode.data.selectedData);
        }
    }, [selectedNode, initialNodeType, updateNodeMeta, updatedSelectedNodeId]);

    useEffect(() => {
        // Handle case where requiredFields might be undefined
        if (selectedNode?.data) {
            const requiredFields = selectedNode.data.requiredFields || [];
            setRequiredFieldsState(requiredFields);
        }
    }, [selectedNode?.data?.requiredFields]);

    // Initialize pipeline parameters when pipelineData changes and type is EmrAddStepsOperator
    useEffect(() => {
        if (selectedValue === 'EmrAddStepsOperator' && pipelineData?.pipeline_parameters?.length) {
            console.log("Initializing pipeline parameters for EmrAddStepsOperator from effect");

            // Get current parameters (if any)
            let currentParams = Array.isArray(currentFormData.parameters)
                ? [...currentFormData.parameters]
                : [];

            // Create a map of current parameters by key
            const paramMap = new Map();
            currentParams.forEach(p => {
                if (p && p.key) paramMap.set(p.key, p);
            });

            // Add pipeline parameters that aren't already in currentParams
            let hasNewParams = false;
            pipelineData.pipeline_parameters.forEach(p => {
                if (p && p.key && !paramMap.has(p.key)) {
                    currentParams.push(p);
                    hasNewParams = true;
                }
            });

            // Only update if we added new parameters
            if (hasNewParams) {
                updateNodeFormData(selectedNode.id, {
                    ...currentFormData,
                    parameters: currentParams,
                });
            }
        }
    }, [pipelineData, selectedValue, currentFormData, selectedNode, updateNodeFormData]);

    return (
        <Card className="w-full max-w-3xl mx-auto shadow-lg overflow-visible">
            <CardContent className="p-6 space-y-6 overflow-visible">
               
                {/* Node type selector */}
                <div className="grid grid-cols-2 gap-4 items-center">
                    <Label
                        htmlFor="type-select"
                        className="text-sm font-medium text-gray-700"
                    >
                        Select Node Type
                    </Label>
                    <Select value={selectedValue} onValueChange={handleValueChange}>
                        <SelectTrigger
                            id="type-select"
                            className="bg-white border-gray-200 hover:border-gray-300 focus:outline-none focus:ring-0"
                        >
                            <SelectValue placeholder="Select a type" />
                        </SelectTrigger>
                        <SelectContent style={{ zIndex: 9999,backgroundColor: "white",color: "black" }}>
                            {Array.isArray(selectedNode.data.meta.properties)
                                ? selectedNode.data.meta.properties.map((p: any) => (
                                    <SelectItem key={p.type} value={p.type}>
                                        {p.type}
                                    </SelectItem>
                                ))
                                : typesMatched.map((t: string) => (
                                    <SelectItem key={t} value={t}>
                                        {t}
                                    </SelectItem>
                                ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Tabs */}
                <Tabs
                    value={activeTab}
                    onValueChange={handleTabChange}
                    className="w-full overflow-visible"
                >
                    <TabsList
                        className={`grid w-full ${hasParameters ? "grid-cols-3" : "grid-cols-2"
                            } mb-3 overflow-visible`}
                    >
                        <TabsTrigger value="property" className="data-[state=active]:bg-black data-[state=active]:text-white focus:outline-none focus:ring-0">
                            Properties
                        </TabsTrigger>
                        <TabsTrigger
                            value="settings"
                            className="data-[state=active]:bg-black data-[state=active]:text-white focus:outline-none focus:ring-0"
                            disabled={!groupedProperties.settings.length}
                        >
                            Settings
                        </TabsTrigger>
                        {hasParameters && (
                            <TabsTrigger value="parameters" className="data-[state=active]:bg-black data-[state=active]:text-white focus:outline-none focus:ring-0">
                                Parameters
                            </TabsTrigger>
                        )}
                    </TabsList>

                    <TabsContent value="property">
                        <ScrollArea className="h-[400px] p-2 bg-white">
                            <FormLayout
                                properties={groupedProperties.property}
                                formValues={currentFormData}
                                onInputChange={handleInputChange}
                                depends_on={depends_on}
                            />
                        </ScrollArea>
                    </TabsContent>

                    <TabsContent value="settings">
                        <ScrollArea className="h-[400px] p-2 bg-white">
                            <FormLayout
                                properties={groupedProperties.settings}
                                formValues={currentFormData}
                                onInputChange={handleInputChange}
                                depends_on={depends_on}
                            />
                        </ScrollArea>
                    </TabsContent>

                    {hasParameters && (
                        <TabsContent value="parameters">
                            <ScrollArea className="h-[400px] p-2 bg-white">
                                <ParametersSection
                                    parameters={currentFormData.parameters || defaultParameters}
                                    onParameterChange={handleParameterChange}
                                    onAddParameter={addParameterRow}
                                    onRemoveParameter={removeParameterRow}
                                    defaultParameters={defaultParameters}
                                    pipeline_parameters={
                                        (selectedValue) === 'EmrAddStepsOperator'
                                            ? (pipelineData?.pipeline_parameters || [])
                                            : []
                                    }
                                />
                            </ScrollArea>
                        </TabsContent>
                    )}
                </Tabs>

                {/* Save button */}
                <div className="flex justify-center pt-4">
                    <Button
                        onClick={handleSave}
                        disabled={isSaveDisabled}
                        className={`bg-black hover:bg-black/90 text-white px-8 focus:outline-none focus:ring-0 ${isSaveDisabled ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                    >
                        <Save className="w-4 h-4 mr-2" />
                        Save
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
