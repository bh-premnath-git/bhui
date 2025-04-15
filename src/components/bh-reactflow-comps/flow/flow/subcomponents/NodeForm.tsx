import React, { useCallback, useMemo, useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGroupedProperties } from "@/hooks/useGroupedProperties";
import { useFlow } from "@/context/designers/FlowContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormLayout } from "./Form/FormLayout";
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { createShortUUID } from "@/lib/utils";
import { Save, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { useOtherTypes } from "@/hooks/useOtherTypes";
import { useNodeFormInput } from "@/hooks/useNodeFormInput";
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { updateFlowDefinition } from '@/store/slices/designer/flowSlice';
import schema from '@bh-ai/flow-schema';
import { RootState } from "@/store/";
import { Input } from "@/components/ui/input";

// Debug flag to control console logs - set to false to stop continuous logging
const DEBUG_MODE = false;

interface NodeFormProps {
    id: string;
    closeTap: () => void;
}

type TabType = "property" | "settings" | "parameters";

interface ParameterItem {
    key: string;
    value: string | number;
}

const ParameterRow: React.FC<{
    parameter: ParameterItem;
    onDelete: () => void;
    onChange: (field: 'key' | 'value', value: string) => void;
    canDelete: boolean;
}> = ({ parameter, onDelete, onChange, canDelete }) => (
    <div className="flex gap-2 items-center">
        <Input
            placeholder="Key"
            value={parameter.key}
            onChange={(e) => onChange('key', e.target.value)}
            className="w-1/2"
        />
        <Input
            placeholder="Value"
            value={parameter.value}
            onChange={(e) => onChange('value', e.target.value)}
            className="w-1/2"
        />
        <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="text-gray-400 hover:text-red-500"
            disabled={!canDelete}
        >
            <X className="h-4 w-4" />
        </Button>
    </div>
);

const ParametersSection = React.memo<{
    parameters: ParameterItem[] | string;
    onParameterChange: (index: number, field: 'key' | 'value', value: string) => void;
    onAddParameter: () => void;
    onRemoveParameter: (index: number) => void;
    defaultParameters?: ParameterItem[];
}>(({ parameters, onParameterChange, onAddParameter, onRemoveParameter, defaultParameters }) => {
    // Ensure parameters is always an array
    const parametersArray = useMemo(() => {
        if (typeof parameters === 'string') {
            try {
                const parsed = JSON.parse(parameters);
                if (DEBUG_MODE) console.log("Parsed parameters string:", parsed);
                return parsed;
            } catch (e) {
                if (DEBUG_MODE) console.log("Error parsing parameters string:", e);
                return defaultParameters || [{ key: '', value: '' }];
            }
        }
        if (Array.isArray(parameters)) {
            return parameters;
        }
        // If default parameters exist, use those
        if (defaultParameters && defaultParameters.length > 0) {
            return defaultParameters;
        }
        // Fallback to empty parameter
        return [{ key: '', value: '' }];
    }, [parameters, defaultParameters]);

    return (
        <div className="space-y-3">
            <div className="flex text-sm font-medium text-gray-500 px-3">
                <div className="w-1/2">Key</div>
                <div className="w-1/2">Value</div>
            </div>
            <div className="space-y-2">
                {parametersArray.map((parameter, index) => (
                    <ParameterRow
                        key={index}
                        parameter={parameter}
                        onDelete={() => onRemoveParameter(index)}
                        onChange={(field, value) => onParameterChange(index, field, value)}
                        canDelete={parametersArray.length > 1}
                    />
                ))}
            </div>

            <Button
                type="button"
                variant="ghost"
                onClick={onAddParameter}
                className="w-full mt-4 border border-dashed border-gray-200 hover:border-gray-300 text-gray-600 h-9"
            >
                <Plus className="h-4 w-4 mr-2" />
                Add Parameter
            </Button>
        </div>
    );
});

// Utility function to check if a field value is empty
const isFieldEmpty = (value: any): boolean => {
    if (!value) return true;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === "string") return value.trim() === "";
    return false;
};

// Utility function to update flow definition on the server
const updateFlowDefinitionOnServer = (
    selectedFlowId: string | null,
    selectedFlow: any,
    dispatch: any,
    hasFlowConfig: boolean,
    flowConfigMap: Record<string, any>,
    nodeFormData: any[] // Add nodeFormData as parameter
) => {
    if (!selectedFlowId || !selectedFlow?.flow_id) return;

    try {
        // Get the current flow structure from localStorage
        const flowStructure = localStorage.getItem(`flow-${selectedFlowId}`);
        if (!flowStructure) {
            console.error("No flow structure found");
            return;
        }

        const parsedStructure = JSON.parse(flowStructure);
        if (DEBUG_MODE) console.log("flowConfigMap >>>>", flowConfigMap?.flowconfig);
        
        // Ensure we have the most up-to-date nodeFormData
        const formData = nodeFormData?.length > 0 ? nodeFormData : parsedStructure.nodeFormData;
        
        // Make sure we have complete task data before saving
        if (!formData || formData.length === 0) {
            console.warn("No form data available for saving");
            return;
        }

        // Log task data before saving to help debug
        if (DEBUG_MODE) {
            console.log("Tasks being saved:", formData);
            formData.forEach((item: any, index: number) => {
                console.log(`Task ${index}:`, item.formData);
            });
        }

        // Process tasks to ensure parameters are JavaScript objects, not strings
        const processedTasks = formData?.map((item: any) => {
            // Create a deep copy to avoid mutations
            const processedItem = JSON.parse(JSON.stringify(item.formData));
            
            // Special handling for EmrCreateJobFlowOperator which seems to have issues
            if (processedItem.type === 'EmrCreateJobFlowOperator') {
                console.log("Special handling for EmrCreateJobFlowOperator");
                if (typeof processedItem.parameters === 'string') {
                    try {
                        processedItem.parameters = JSON.parse(processedItem.parameters);
                        console.log("Successfully parsed EmrCreateJobFlowOperator parameters from string to array");
                    } catch (e) {
                        console.error("Error parsing EmrCreateJobFlowOperator parameters:", e);
                        processedItem.parameters = [];
                    }
                }
            }
            
            // Make sure all parameters are arrays, not strings
            if (typeof processedItem.parameters === 'string') {
                console.log(`Found stringified parameters for task ${processedItem.task_id || 'unknown'}`);
                try {
                    processedItem.parameters = JSON.parse(processedItem.parameters);
                } catch (e) {
                    console.error(`Error parsing parameters string for task ${processedItem.task_id || 'unknown'}:`, e);
                    processedItem.parameters = [];
                }
            }
            
            // Function to convert string booleans to actual booleans
            const convertBooleanStrings = (obj: any): any => {
                if (!obj) return obj;
                
                // If it's a simple string value, convert if it's 'true'/'false'
                if (typeof obj === 'string') {
                    if (obj === 'true') return true;
                    if (obj === 'false') return false;
                    // Convert numeric strings to numbers
                    if (!isNaN(Number(obj)) && obj !== '') return Number(obj);
                    return obj;
                }
                
                // If it's an array, process each item
                if (Array.isArray(obj)) {
                    return obj.map(item => convertBooleanStrings(item));
                }
                
                // If it's an object, process each property
                if (typeof obj === 'object') {
                    const result: any = {};
                    for (const key in obj) {
                        result[key] = convertBooleanStrings(obj[key]);
                    }
                    return result;
                }
                
                return obj;
            };
            
            // Convert all string booleans in the entire form data
            const fullyProcessed = convertBooleanStrings(processedItem);
            
            // Log the changes to debug the issue
            console.log(`Processed task ${fullyProcessed.task_id || 'unknown'} with type ${fullyProcessed.type}:`, {
                parametersType: typeof fullyProcessed.parameters,
                isArray: Array.isArray(fullyProcessed.parameters),
                parameters: fullyProcessed.parameters
            });
            
            return fullyProcessed;
        });

        const flowJson = {
            $schema: schema["$schema"],
            description: `Flow for ${selectedFlow?.flow_name || 'Unnamed Flow'}`,
            name: selectedFlow?.flow_name || 'Unnamed Flow',
            version: schema.version,
            parameters: flowConfigMap?.flowconfig?.flow_config || [],
            tasks: processedTasks
        };

        // Always log the parameters for each task to verify proper format
        console.log("FINAL TASKS BEFORE SAVING:");
        for (let i = 0; i < flowJson.tasks.length; i++) {
            const task = flowJson.tasks[i];
            const isParamsString = typeof task.parameters === 'string';
            console.log(`Task[${i}] ${task.task_id} parameters:`, task.parameters);
            console.log(`  Is parameters a string? ${isParamsString}`);
            console.log(`  Parameters type: ${typeof task.parameters}`);
            if (isParamsString) {
                console.error(`  ERROR: Parameters for task ${task.task_id} are still a string!`);
            }
        }

        // Check if all tasks have valid IDs and types
        const allTasksValid = flowJson.tasks?.every((task: any) => {
            const isValid = !!task.task_id && task.type !== null;
            if (!isValid && DEBUG_MODE) {
                console.warn("Invalid task data:", task);
            }
            return isValid;
        });
        
        if (!allTasksValid) {
            console.warn("Some tasks are missing task_id or type");
        }

        dispatch(updateFlowDefinition({
            flow_id: selectedFlow.flow_id.toString(),
            flow_json: {
                flow_deployment_id: selectedFlow.flow_deployment?.[0]?.flow_deployment_id,
                flow_id: selectedFlow.flow_id.toString(),
                flow_json: {
                    flowJson: flowJson,
                    flowStructure: parsedStructure
                }
            }
        }));
    } catch (error) {
        console.error("Failed to update flow definition:", error);
    }
};

// Custom hook for form validation
const useFormValidation = (selectedNodeId: string, requiredFields: string[], getNodeFormData: any) => {
    // Check if save should be disabled
    const isSaveDisabled = useMemo(() => {
        const currentFields = getNodeFormData(selectedNodeId) || {};
        return requiredFields.some(field => isFieldEmpty(currentFields[field]));
    }, [getNodeFormData, requiredFields, selectedNodeId]);

    // Validate form fields
    const validateForm = useCallback(() => {
        const currentFields = getNodeFormData(selectedNodeId);
        if (!currentFields) {
            toast("Missing required fields", {
                style: { backgroundColor: "#f44336", color: "#fff" },
            });
            return false;
        }

        const missingFields = requiredFields.filter(field =>
            isFieldEmpty(currentFields[field])
        );

        if (missingFields.length > 0) {
            toast(`Missing required fields: ${missingFields.join(", ")}`, {
                style: { backgroundColor: "#f44336", color: "#fff" },
            });
            return false;
        }

        return true;
    }, [getNodeFormData, requiredFields, selectedNodeId]);

    return { isSaveDisabled, validateForm };
};

export const NodeForm: React.FC<NodeFormProps> = ({ closeTap, id }) => {
    const {
        saveFlow,
        selectedNode,
        setFormDataNum,
        nodeFormData,
        prevNodeFn,
        updateNodeFormData,
        updateNodeMeta,
        updatedSelectedNodeId,
        getNodeFormData,
        revertOrSaveData,
        updateNodeDependencies,
        selectedFlowId,
        hasFlowConfig,
        flowConfigMap
    } = useFlow();

    const dispatch = useAppDispatch();
    const { selectedFlow } = useAppSelector((state: RootState) => state.flow);

    const [activeTab, setActiveTab] = useState<TabType>("property");
    const [selectedValue, setSelectedValue] = useState<string>("");
    const [requiredFieldsState, setRequiredFieldsState] = useState<string[]>([]);
    
    // Ref to track if parameters have been initialized
    const parametersInitializedRef = useRef(false);

    if (!selectedNode) return null;

    const typesMatched = useOtherTypes(selectedNode.data.selectedData);

    // Form validation
    const { isSaveDisabled, validateForm } = useFormValidation(
        selectedNode.id,
        requiredFieldsState,
        getNodeFormData
    );

    // Get selected properties based on node type
    const selectedProperties = useMemo(() => {
        if (Array.isArray(selectedNode.data.meta.properties) && selectedValue) {
            const props = selectedNode.data.meta.properties.find(
                (item: any) =>
                    item.type === selectedValue || item.type === selectedNode.data.selectedData
            );
            return props;
        } else {
            return selectedNode.data.meta.properties;
        }
    }, [selectedNode.data.meta.properties, selectedValue]);
    
    // Get default parameters from schema
    const defaultParameters = useMemo(() => {
        if (!selectedProperties) return [];
        
        // Find the parameters property in the schema
        const parametersProperty = selectedProperties.properties?.parameters;
        
        if (parametersProperty?.ui_properties?.default) {
            return parametersProperty.ui_properties.default;
        }
        return [];
    }, [selectedProperties]);

    // Group properties for tabs
    const groupedProperties = useGroupedProperties({ properties: selectedProperties }) ??
        { property: [], settings: [], parameters: [] };
    
    // Check if the current operator type has parameters based on grouped properties
    const hasParameters = useMemo(() => {
        // Check if the parameters group exists and has at least one property
        return groupedProperties && 
               groupedProperties["parameters"] && 
               groupedProperties["parameters"].length > 0;
    }, [groupedProperties]);

    // Get current form data for the selected node
    const currentFormData = useMemo(
        () => nodeFormData.find((item) => item.nodeId === selectedNode.id)?.formData || {},
        [nodeFormData, selectedNode.id]
    );

    // Get dependencies for the selected node
    const dependsOn = useMemo(
        () => prevNodeFn(selectedNode.id)?.map((node) => node) ?? [],
        [prevNodeFn, selectedNode.id]
    );

    // Generate task ID for new nodes
    const taskID = useMemo(
        () => `${selectedNode.data.label}-${selectedValue}-${createShortUUID()}`,
        [selectedNode.data.label, selectedValue]
    );

    // Handle form input changes
    const handleInputChange = useNodeFormInput({
        selectedNode,
        currentFormData,
        dependsOn,
        updateNodeFormData,
        saveFlow,
        taskID,
    });

    // Reset parameters initialization flag when node or node type changes
    useEffect(() => {
        parametersInitializedRef.current = false;
    }, [selectedNode?.id, selectedValue]);

    // Initialize parameters with default values - more robust approach
    useEffect(() => {
        if (hasParameters && defaultParameters && defaultParameters.length > 0) {
            // Initialize parameters if they don't exist or are empty
            const isEmpty = 
                !currentFormData.parameters || 
                (typeof currentFormData.parameters === 'string' && 
                    (currentFormData.parameters === '[]' || currentFormData.parameters === '')) ||
                (Array.isArray(currentFormData.parameters) && 
                    currentFormData.parameters.length === 0);
                    
            if (isEmpty && !parametersInitializedRef.current) {
                // Store parameters directly as an array, not as a string
                updateNodeFormData(selectedNode.id, {
                    ...currentFormData,
                    parameters: defaultParameters
                });
                parametersInitializedRef.current = true;
            }
        }
    }, [hasParameters, defaultParameters, updateNodeFormData, currentFormData, selectedNode.id]);

    // Handle save button click
    const handleSave = useCallback(() => {
        if (!selectedNode || !validateForm()) return;

        // First, ensure form data is updated
        const newFormData = [...nodeFormData];
        const existingNodeIndex = newFormData.findIndex(item => item.nodeId === selectedNode.id);
        
        // Parse parameters from string to array if needed
        let parameters = currentFormData.parameters;
        if (typeof parameters === 'string') {
            try {
                parameters = JSON.parse(parameters);
                console.log("Converting string parameters to array in handleSave");
            } catch (e) {
                console.error("Error parsing parameters in handleSave:", e);
                parameters = [];
            }
        }
        
        const updatedFormData = {
            nodeId: selectedNode.id,
            formData: {
                ...currentFormData,
                task_id: currentFormData.task_id || taskID,
                type: selectedValue, // Ensure type is set
                dependsOn: prevNodeFn(selectedNode.id) || [],
                parameters: parameters // Make sure parameters are stored as an array
            }
        };
        
        if (existingNodeIndex >= 0) {
            newFormData[existingNodeIndex] = updatedFormData;
        } else {
            newFormData.push(updatedFormData);
        }

        // Save with a proper array for parameters
        console.log("Saving node with parameters:", {
            nodeId: selectedNode.id, 
            parametersType: typeof parameters,
            isArray: Array.isArray(parameters),
            parameters: parameters
        });

        // Update the form data state first
        updateNodeFormData(selectedNode.id, updatedFormData.formData);
        
        // Wait a moment for state to update before saving
        setTimeout(() => {
            // Update node dependencies based on current edges
            updateNodeDependencies();

            // Save the flow to local storage
            setFormDataNum((prev) => prev + 1);
            
            // Update flow definition on the server with the updated form data
            updateFlowDefinitionOnServer(
                selectedFlowId, 
                selectedFlow, 
                dispatch, 
                hasFlowConfig, 
                flowConfigMap,
                newFormData // Pass the updated form data
            );
            
            // Close the form
            closeTap();
            revertOrSaveData(id, true);
        }, 100);
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
        hasFlowConfig,
        flowConfigMap,
        nodeFormData,
        currentFormData,
        selectedValue,
        taskID,
        prevNodeFn,
        updateNodeFormData
    ]);

    // Handle tab change
    const handleTabChange = useCallback((tab: TabType) => {
        setActiveTab(tab);
    }, []);

    // Handle node type change
    const handleValueChange = useCallback(
        (value: string) => {
            setSelectedValue(value);
            const requiredFields = selectedNode.data.requiredFields.find(
                (item: any) => Object.keys(item)[0] === value
            );
            const reqfieldsVal = requiredFields?.[value] ?? [];
            setRequiredFieldsState(reqfieldsVal);
            updateNodeMeta(selectedNode.id, { type: value }, { type: value, requiredFields: reqfieldsVal });
            updatedSelectedNodeId(selectedNode.id, value);
        },
        [selectedNode?.id, selectedNode?.data?.requiredFields, updateNodeMeta, updatedSelectedNodeId]
    );

    // Set initial values when component mounts or node changes
    useEffect(() => {
        if (selectedNode?.data?.selectedData) {
            setSelectedValue(selectedNode.data.selectedData);
        }
    }, [selectedNode?.data?.selectedData]);

    useEffect(() => {
        if (selectedNode) {
            setRequiredFieldsState(selectedNode.data.requiredFields);
        }
    }, [selectedNode]);

    // Update the parameter handling functions
    const handleParameterChange = useCallback((index: number, field: 'key' | 'value', value: string) => {
        const currentParameters = typeof currentFormData.parameters === 'string' 
            ? JSON.parse(currentFormData.parameters)
            : Array.isArray(currentFormData.parameters) 
                ? currentFormData.parameters 
                : defaultParameters;
        
        const newParameters = [...currentParameters];
        if (!newParameters[index]) {
            newParameters[index] = { key: '', value: '' };
        }
        newParameters[index][field] = value;
        
        // Store directly as an array, not as a string
        updateNodeFormData(selectedNode.id, {
            ...currentFormData,
            parameters: newParameters
        });
    }, [currentFormData, updateNodeFormData, selectedNode, defaultParameters]);

    const addParameterRow = useCallback(() => {
        const currentParameters = typeof currentFormData.parameters === 'string' 
            ? JSON.parse(currentFormData.parameters)
            : Array.isArray(currentFormData.parameters) 
                ? currentFormData.parameters 
                : defaultParameters;
        
        const newParameters = [...currentParameters, { key: '', value: '' }];
        
        // Store directly as an array, not as a string
        updateNodeFormData(selectedNode.id, {
            ...currentFormData,
            parameters: newParameters
        });
    }, [currentFormData, updateNodeFormData, selectedNode, defaultParameters]);

    const removeParameterRow = useCallback((index: number) => {
        const currentParameters = typeof currentFormData.parameters === 'string' 
            ? JSON.parse(currentFormData.parameters)
            : Array.isArray(currentFormData.parameters) 
                ? currentFormData.parameters 
                : defaultParameters;
        
        if (currentParameters.length > 1) {
            const newParameters = [...currentParameters];
            newParameters.splice(index, 1);
            
            // Store directly as an array, not as a string
            updateNodeFormData(selectedNode.id, {
                ...currentFormData,
                parameters: newParameters
            });
        }
    }, [currentFormData, updateNodeFormData, selectedNode, defaultParameters]);

    return (
        <Card className="w-full max-w-3xl mx-auto shadow-lg">
            <CardContent className="p-6 space-y-6">
                {/* Node Type Selector */}
                <div className="grid grid-cols-2 gap-4 items-center">
                    <Label htmlFor="type-select" className="text-sm font-medium text-gray-700">
                        Select Node Type
                    </Label>
                    <Select onValueChange={handleValueChange} value={selectedValue}>
                        <SelectTrigger
                            id="type-select"
                            className="bg-white border-gray-200 hover:border-gray-300 focus:ring-black"
                        >
                            <SelectValue placeholder="Select a type" />
                        </SelectTrigger>
                        <SelectContent>
                            {Array.isArray(selectedNode.data.meta.properties)
                                ? selectedNode.data.meta.properties.map((prop: any) => (
                                    <SelectItem key={prop.type} value={prop.type}>
                                        {prop.type}
                                    </SelectItem>
                                ))
                                : Array.isArray(typesMatched) &&
                                typesMatched.map((type: string) => (
                                    <SelectItem key={type} value={type}>
                                        {type}
                                    </SelectItem>
                                ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Property Tabs */}
                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                    <TabsList className={`grid w-full ${hasParameters ? 'grid-cols-3' : 'grid-cols-2'} mb-6`}>
                        <TabsTrigger
                            value="property"
                            className="data-[state=active]:bg-black data-[state=active]:text-white"
                        >
                            Properties
                        </TabsTrigger>
                        <TabsTrigger
                            value="settings"
                            className="data-[state=active]:bg-black data-[state=active]:text-white"
                            disabled={!groupedProperties["settings"]?.length}
                        >
                            Settings
                        </TabsTrigger>
                        {hasParameters && (
                            <TabsTrigger
                                value="parameters"
                                className="data-[state=active]:bg-black data-[state=active]:text-white"
                            >
                                Parameters
                            </TabsTrigger>
                        )}
                    </TabsList>

                    <TabsContent value="property">
                        <ScrollArea className="h-[400px] pr-4 rounded-md border border-gray-200 bg-white p-4">
                            <FormLayout
                                properties={groupedProperties["property"]}
                                formValues={currentFormData}
                                onInputChange={handleInputChange}
                                dependsOn={dependsOn}
                            />
                        </ScrollArea>
                    </TabsContent>

                    <TabsContent value="settings">
                        <ScrollArea className="h-[400px] pr-4 rounded-md border border-gray-200 bg-white p-4">
                            <FormLayout
                                properties={groupedProperties["settings"]}
                                formValues={currentFormData}
                                onInputChange={handleInputChange}
                                dependsOn={dependsOn}
                            />
                        </ScrollArea>
                    </TabsContent>

                    {hasParameters && (
                        <TabsContent value="parameters">
                            <ScrollArea className="h-[400px] pr-4 rounded-md border border-gray-200 bg-white p-4">
                                <ParametersSection
                                    parameters={
                                        typeof currentFormData.parameters === 'string'
                                            ? JSON.parse(currentFormData.parameters)
                                            : currentFormData.parameters || defaultParameters
                                    }
                                    onParameterChange={handleParameterChange}
                                    onAddParameter={addParameterRow}
                                    onRemoveParameter={removeParameterRow}
                                    defaultParameters={defaultParameters}
                                />
                            </ScrollArea>
                        </TabsContent>
                    )}
                </Tabs>

                {/* Save Button */}
                <div className="flex justify-center pt-4">
                    <Button
                        onClick={handleSave}
                        className={`bg-black hover:bg-black/90 text-white px-8 ${isSaveDisabled ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                        disabled={isSaveDisabled}
                    >
                        <Save className="w-4 h-4 mr-2" />
                        Save
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
