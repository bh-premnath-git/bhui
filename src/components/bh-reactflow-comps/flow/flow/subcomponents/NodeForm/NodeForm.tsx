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
import { Save} from "lucide-react";
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
import { FormLayout } from "../Form/FormLayout";

interface NodeFormProps {
    id: string;
    closeTap: () => void;
}

export const NodeForm: React.FC<NodeFormProps> = ({ closeTap, id }) => {
    /* --------------------------- Context / Hooks ------------------------- */
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
        flowConfigMap,
    } = useFlow();

    const dispatch = useAppDispatch();
    const { selectedFlow } = useAppSelector((s: RootState) => s.flow);

    /* ------------------------------ State -------------------------------- */
    const [activeTab, setActiveTab] = useState<TabType>("property");
    const [selectedValue, setSelectedValue] = useState<string>("");
    const [requiredFieldsState, setRequiredFieldsState] = useState<string[]>([]);
    const paramsInitRef = useRef(false);

    if (!selectedNode) return null;

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

    const groupedProperties =
        useGroupedProperties({ properties: selectedProperties }) ?? {
            property: [],
            settings: [],
            parameters: [],
        };

    const hasParameters = useMemo(
        () => groupedProperties.parameters.length > 0 && !!selectedValue,
        [groupedProperties, selectedValue]
    );

    const currentFormData = useMemo(
        () => nodeFormData.find((i) => i.nodeId === selectedNode.id)?.formData || {},
        [nodeFormData, selectedNode.id]
    );

    const dependsOn = useMemo(
        () => prevNodeFn(selectedNode.id) ?? [],
        [prevNodeFn, selectedNode.id]
    );

    const taskID = useMemo(
        () => `${selectedNode.data.label}-${selectedValue}-${createShortUUID()}`,
        [selectedNode.data.label, selectedValue]
    );

    /* --------------------------- Input handler --------------------------- */
    const handleInputChange = useNodeFormInput({
        selectedNode,
        currentFormData,
        dependsOn,
        updateNodeFormData,
        saveFlow,
        taskID,
    });

    /* ---------------------- Parameters initialisation -------------------- */
    useEffect(() => {
        const hasExistingParams =
            Array.isArray(currentFormData.parameters) &&
            currentFormData.parameters.length > 0;

        if (!hasExistingParams) {
            paramsInitRef.current = false;

            if (hasParameters && defaultParameters.length) {
                updateNodeFormData(selectedNode.id, {
                    ...currentFormData,
                    parameters: defaultParameters,
                });
                paramsInitRef.current = true;
            }
        }
    }, [
        selectedNode.id,
        selectedValue,
        hasParameters,
        defaultParameters,
        updateNodeFormData,
        currentFormData,
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
            updateNodeFormData(selectedNode.id, {
                ...currentFormData,
                parameters: defaultParameters,
            });
            paramsInitRef.current = true;
        }
    }, [
        hasParameters,
        defaultParameters,
        updateNodeFormData,
        currentFormData,
        selectedNode.id,
    ]);

    /* ------------------------------ Save --------------------------------- */
    const { isSaveDisabled, validateForm } = useFormValidation(
        selectedNode.id,
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
        const idx = newFormData.findIndex((i) => i.nodeId === selectedNode.id);

        let parameters: ParameterItem[] = [];
        if (Array.isArray(currentFormData.parameters)) {
            parameters = [...currentFormData.parameters];
        } else if (defaultParameters.length) {
            parameters = [...defaultParameters];
        } else {
            parameters = [{ key: "", value: "" }];
        }

        const updatedFormData = {
            nodeId: selectedNode.id,
            formData: {
                ...currentFormData,
                task_id: currentFormData.task_id || taskID,
                type: selectedValue,
                dependsOn: prevNodeFn(selectedNode.id) || [],
                parameters,
            },
        };

        if (idx >= 0) newFormData[idx] = updatedFormData;
        else newFormData.push(updatedFormData);

        console.log("Updating node form data");
        updateNodeFormData(selectedNode.id, updatedFormData.formData);

        console.log("Calling updateNodeDependencies and setFormDataNum");
        updateNodeDependencies();
        setFormDataNum((p) => p + 1);

        console.log("Calling updateFlowDefinitionOnServer");
        console.log("Selected flow:", selectedFlow);
        console.log("Selected flow ID:", selectedFlowId);
        console.log("Flow config map:", flowConfigMap);
        
        // Call updateFlowDefinitionOnServer directly without setTimeout
        updateFlowDefinitionOnServer(
            selectedFlowId,
            selectedFlow,
            dispatch,
            flowConfigMap,
            newFormData
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
            updateNodeFormData(selectedNode.id, {
                ...currentFormData,
                parameters: updated,
            });
        },
        [currentFormData, defaultParameters, selectedNode.id, updateNodeFormData]
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

        updateNodeFormData(selectedNode.id, {
            ...currentFormData,
            parameters: currentParams,
            type: selectedValue || selectedNode.data.selectedData,
            task_id: currentFormData.task_id || `task-${selectedNode.id}`,
        });
    }, [
        currentFormData,
        defaultParameters,
        selectedNode,
        selectedValue,
        updateNodeFormData,
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
                updateNodeFormData(selectedNode.id, {
                    ...currentFormData,
                    parameters: newParams,
                });
            }
        },
        [
            currentFormData,
            defaultParameters,
            selectedNode.id,
            updateNodeFormData,
        ]
    );
    /* --------------------------- Misc handlers --------------------------- */
    const handleTabChange = useCallback((t: TabType) => setActiveTab(t), []);
    const handleValueChange = useCallback(
        (val: string) => {
            setSelectedValue(val);
            const req = selectedNode.data.requiredFields.find(
                (i: any) => Object.keys(i)[0] === val
            );
            const fields = req?.[val] || [];
            setRequiredFieldsState(fields);
            updateNodeMeta(
                selectedNode.id,
                { type: val },
                { type: val, requiredFields: fields }
            );
            updatedSelectedNodeId(selectedNode.id, val);
        },
        [selectedNode, updateNodeMeta, updatedSelectedNodeId]
    );

    useEffect(() => {
        if (selectedNode.data.selectedData)
            setSelectedValue(selectedNode.data.selectedData);
    }, [selectedNode.data.selectedData]);

    useEffect(() => {
        setRequiredFieldsState(selectedNode.data.requiredFields);
    }, [selectedNode.data.requiredFields]);
    
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
                        <SelectContent>
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
                                dependsOn={dependsOn}
                            />
                        </ScrollArea>
                    </TabsContent>

                    <TabsContent value="settings">
                        <ScrollArea className="h-[400px] p-2 bg-white">
                            <FormLayout
                                properties={groupedProperties.settings}
                                formValues={currentFormData}
                                onInputChange={handleInputChange}
                                dependsOn={dependsOn}
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
