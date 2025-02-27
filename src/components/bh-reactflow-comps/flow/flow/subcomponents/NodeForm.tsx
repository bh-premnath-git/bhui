import React, { useCallback, useMemo, useState, useEffect } from "react";
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
import { Save } from "lucide-react";
import { toast } from "sonner";
import { useOtherTypes } from "@/hooks/useOtherTypes";
import { useNodeFormInput } from "@/hooks/useNodeFormInput";
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { updateFlowDefinition } from '@/store/slices/designer/flowSlice';
import { RootState } from "@/store/";

interface NodeFormProps {
    id: string;
    closeTap: () => void;
}

type TabType = "property" | "settings";

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
    dispatch: any
) => {
    if (!selectedFlowId || !selectedFlow?.flow_id) return;
    
    try {
        const flowStructure = localStorage.getItem(`flow-${selectedFlowId}`);
        if (!flowStructure) {
            console.error("No flow structure found");
            return;
        }

        const parsedStructure = JSON.parse(flowStructure);
        const flowJson = parsedStructure.nodeFormData?.map((item: any) => item.formData);
        
        // Check if all tasks have valid IDs
        const allTasksValid = flowJson.every((task: any) => !!task.task_id);
        if (!allTasksValid) {
            console.warn("Some tasks are missing task_id");
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
        
        console.log("Flow definition update triggered");
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
        selectedFlowId
    } = useFlow();
    
    const dispatch = useAppDispatch();
    const { selectedFlow } = useAppSelector((state: RootState) => state.flow);

    const [activeTab, setActiveTab] = useState<TabType>("property");
    const [selectedValue, setSelectedValue] = useState<string>("");
    const [requiredFieldsState, setRequiredFieldsState] = useState<string[]>([]);
    
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
            return selectedNode.data.meta.properties.find(
                (item: any) =>
                    item.type === selectedValue || item.type === selectedNode.data.selectedData
            );
        } else {
            return selectedNode.data.meta.properties;
        }
    }, [selectedNode.data.meta.properties, selectedValue]);

    // Group properties for tabs
    const groupedProperties = useGroupedProperties({ properties: selectedProperties }) ?? 
        { properties: { property: [], settings: [] } };

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

    // Handle save button click
    const handleSave = useCallback(() => {
        if (!selectedNode || !validateForm()) return;
        
        // Update node dependencies based on current edges
        updateNodeDependencies();
        
        // Save the flow to local storage
        setFormDataNum((prev) => prev + 1);
        closeTap();
        revertOrSaveData(id, true);
        
        // Update flow definition on the server
        updateFlowDefinitionOnServer(selectedFlowId, selectedFlow, dispatch);
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
        setFormDataNum
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
                    <TabsList className="grid w-full grid-cols-2 mb-6">
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
                </Tabs>

                {/* Save Button */}
                <div className="flex justify-center pt-4">
                    <Button
                        onClick={handleSave}
                        className={`bg-black hover:bg-black/90 text-white px-8 ${
                            isSaveDisabled ? "opacity-50 cursor-not-allowed" : ""
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
