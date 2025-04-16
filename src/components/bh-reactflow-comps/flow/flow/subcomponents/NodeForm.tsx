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

// Memoize the ParameterRow component for better performance
const ParameterRow = React.memo<{
    parameter: ParameterItem;
    onDelete: () => void;
    onChange: (field: 'key' | 'value', value: string) => void;
    canDelete: boolean;
}>(({ parameter, onDelete, onChange, canDelete }) => (
    <div className="flex gap-2 items-center px-1 overflow-visible">
        <div className="w-1/2">
            <Input
                placeholder="Key"
                value={parameter.key}
                onChange={(e) => onChange('key', e.target.value)}
                className="w-full focus:ring-2 focus:ring-offset-0 focus:ring-blue-500"
            />
        </div>
        <div className="w-1/2">
            <Input
                placeholder="Value"
                value={parameter.value}
                onChange={(e) => onChange('value', e.target.value)}
                className="w-full focus:ring-2 focus:ring-offset-0 focus:ring-blue-500"
            />
        </div>
        <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="text-gray-400 hover:text-red-500 flex-shrink-0"
            disabled={!canDelete}
        >
            <X className="h-4 w-4" />
        </Button>
    </div>
));

// Memoize the ParametersSection component
const ParametersSection = React.memo<{
    parameters: ParameterItem[] | string;
    onParameterChange: (index: number, field: 'key' | 'value', value: string) => void;
    onAddParameter: () => void;
    onRemoveParameter: (index: number) => void;
    defaultParameters?: ParameterItem[];
}>(({ parameters, onParameterChange, onAddParameter, onRemoveParameter, defaultParameters }) => {
    // Ensure parameters is always an array
    const parametersArray = useMemo(() => {
        // Always convert to array if not already
        if (!Array.isArray(parameters)) {
            try {
                if (typeof parameters === 'string' && parameters) {
                    const parsed = JSON.parse(parameters);
                    return Array.isArray(parsed) ? parsed : defaultParameters || [{ key: '', value: '' }];
                }
            } catch (e) {
                // Silent error handling - fall back to defaults
            }
            return defaultParameters || [{ key: '', value: '' }];
        }
        return parameters;
    }, [parameters, defaultParameters]);

    return (
        <div className="space-y-3 px-3 overflow-visible">
            <div className="flex text-sm font-medium text-gray-500 px-3">
                <div className="w-1/2">Key</div>
                <div className="w-1/2">Value</div>
            </div>
            <div className="space-y-2 overflow-visible">
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
                className="w-full mt-4 border border-dashed border-gray-200 hover:border-gray-300 text-gray-600 h-9 mx-auto px-4"
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
        
        // Only process parameters if they exist
        if (processedItem.parameters !== undefined) {
        // Ensure parameters is always an array
            if (!Array.isArray(processedItem.parameters)) {
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

            if (DEBUG_MODE) {
                console.log(`Processed task ${fullyProcessed.task_id || 'unknown'} with type ${fullyProcessed.type}:`, {
                    parametersType: typeof fullyProcessed.parameters,
                    isArray: Array.isArray(fullyProcessed.parameters),
                    parameters: fullyProcessed.parameters
                });
            }

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
        if (DEBUG_MODE) {
            console.log("FINAL TASKS BEFORE SAVING:");
            for (let i = 0; i < flowJson.tasks.length; i++) {
                const task = flowJson.tasks[i];
                // Only log parameters if they exist
                if (task.parameters !== undefined) {
                    console.log(`Task[${i}] ${task.task_id} parameters:`, task.parameters);
                    if (!Array.isArray(task.parameters)) {
                        console.error(`  ERROR: Parameters for task ${task.task_id} are not an array!`);
                    }
                } else {
                    console.log(`Task[${i}] ${task.task_id} has no parameters`);
                }
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

// Custom hook for form validation - with memoization for better performance
const useFormValidation = (selectedNodeId: string, requiredFields: string[], getNodeFormData: any) => {
    // Check if save should be disabled - memoized for performance
    const isSaveDisabled = useMemo(() => {
        const currentFields = getNodeFormData(selectedNodeId) || {};
        return requiredFields.some(field => isFieldEmpty(currentFields[field]));
    }, [getNodeFormData, requiredFields, selectedNodeId]);

    // Validate form fields - memoized callback for performance
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
    groupedProperties["parameters"].length > 0 &&
               selectedValue; // Only show parameters when a node type is selected
    }, [groupedProperties, selectedValue]);

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
    // Only initialize parameters if this node type actually has parameters
    if (hasParameters && defaultParameters && defaultParameters.length > 0) {
    // Initialize parameters if they don't exist or are not an array
    const shouldInitialize = 
    !currentFormData.parameters || 
    !Array.isArray(currentFormData.parameters) || 
    currentFormData.parameters.length === 0;
            
    if (shouldInitialize && !parametersInitializedRef.current) {
    // Always store as an array
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

        // Always ensure parameters is an array
        let parameters = currentFormData.parameters;
        if (!Array.isArray(parameters)) {
            // Convert to array if not already
            parameters = Array.isArray(defaultParameters) && defaultParameters.length > 0 ?
                defaultParameters : [{ key: '', value: '' }];
        }

        // Only include parameters if this node type has parameter properties
        const updatedFormData = {
            nodeId: selectedNode.id,
            formData: {
                ...currentFormData,
                task_id: currentFormData.task_id || taskID,
                type: selectedValue, // Ensure type is set
                dependsOn: prevNodeFn(selectedNode.id) || [],
                // Only include parameters if this node type has them
                ...(hasParameters ? { parameters: parameters } : {})
            }
        };

        if (existingNodeIndex >= 0) {
            newFormData[existingNodeIndex] = updatedFormData;
        } else {
            newFormData.push(updatedFormData);
        }

        // Save with a proper array for parameters if needed
        if (DEBUG_MODE && hasParameters) {
            console.log("Saving node with parameters:", parameters);
        }

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
        // Always ensure parameters is an array
        const currentParameters = Array.isArray(currentFormData.parameters)
            ? currentFormData.parameters
            : defaultParameters?.length > 0
                ? defaultParameters
                : [{ key: '', value: '' }];

        const newParameters = [...currentParameters];
        if (!newParameters[index]) {
            newParameters[index] = { key: '', value: '' };
        }
        newParameters[index][field] = value;

        // Always store as an array
        updateNodeFormData(selectedNode.id, {
            ...currentFormData,
            parameters: newParameters
        });
    }, [currentFormData, updateNodeFormData, selectedNode, defaultParameters]);

    const addParameterRow = useCallback(() => {
        // Always ensure parameters is an array
        const currentParameters = Array.isArray(currentFormData.parameters)
            ? currentFormData.parameters
            : defaultParameters?.length > 0
                ? defaultParameters
                : [{ key: '', value: '' }];

        const newParameters = [...currentParameters, { key: '', value: '' }];

        // Always store as an array
        updateNodeFormData(selectedNode.id, {
            ...currentFormData,
            parameters: newParameters
        });
    }, [currentFormData, updateNodeFormData, selectedNode, defaultParameters]);

    const removeParameterRow = useCallback((index: number) => {
        // Always ensure parameters is an array
        const currentParameters = Array.isArray(currentFormData.parameters)
            ? currentFormData.parameters
            : defaultParameters?.length > 0
                ? defaultParameters
                : [{ key: '', value: '' }];

        if (currentParameters.length > 1) {
            const newParameters = [...currentParameters];
            newParameters.splice(index, 1);

            // Always store as an array
            updateNodeFormData(selectedNode.id, {
                ...currentFormData,
                parameters: newParameters
            });
        }
    }, [currentFormData, updateNodeFormData, selectedNode, defaultParameters]);

    return (
        <Card className="w-full max-w-3xl mx-auto shadow-lg overflow-visible">
            <CardContent className="p-6 space-y-6 overflow-visible">
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
                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full overflow-visible">
                    <TabsList className={`grid w-full ${hasParameters ? 'grid-cols-3' : 'grid-cols-2'} mb-6 overflow-visible`}>
                        <TabsTrigger
                            value="property"
                            className="data-[state=active]:bg-black data-[state=active]:text-white focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 focus:outline-none"
                        >
                            Properties
                        </TabsTrigger>
                        <TabsTrigger
                            value="settings"
                            className="data-[state=active]:bg-black data-[state=active]:text-white focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 focus:outline-none"
                            disabled={!groupedProperties["settings"]?.length}
                        >
                            Settings
                        </TabsTrigger>
                        {hasParameters && (
                            <TabsTrigger
                                value="parameters"
                                className="data-[state=active]:bg-black data-[state=active]:text-white focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 focus:outline-none"
                            >
                                Parameters
                            </TabsTrigger>
                        )}
                    </TabsList>

                    <TabsContent value="property" className="overflow-visible">
                        <ScrollArea className="h-[400px] pr-4 rounded-md border border-gray-200 bg-white p-4 overflow-visible">
                            <FormLayout
                                properties={groupedProperties["property"]}
                                formValues={currentFormData}
                                onInputChange={handleInputChange}
                                dependsOn={dependsOn}
                            />
                        </ScrollArea>
                    </TabsContent>

                    <TabsContent value="settings" className="overflow-visible">
                        <ScrollArea className="h-[400px] pr-4 rounded-md border border-gray-200 bg-white p-4 overflow-visible">
                            <FormLayout
                                properties={groupedProperties["settings"]}
                                formValues={currentFormData}
                                onInputChange={handleInputChange}
                                dependsOn={dependsOn}
                            />
                        </ScrollArea>
                    </TabsContent>

                    {hasParameters && (
                        <TabsContent value="parameters" className="overflow-visible">
                            <ScrollArea className="h-[400px] pr-4 rounded-md border border-gray-200 bg-white p-4 overflow-visible">
                                <ParametersSection
                                    parameters={
                                        Array.isArray(currentFormData.parameters)
                                            ? currentFormData.parameters
                                            : defaultParameters || [{ key: '', value: '' }]
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
