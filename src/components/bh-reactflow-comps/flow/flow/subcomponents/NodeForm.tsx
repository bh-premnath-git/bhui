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
import {toast} from "sonner";
import { useOtherTypes } from "@/hooks/useOtherTypes";
import { useNodeFormInput } from "@/hooks/useNodeFormInput";

interface NodeFormProps {
    id: string;
    closeTap: () => void;
}

type TabType = "property" | "settings";

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
    } = useFlow();

    const [activeTab, setActiveTab] = useState<TabType>("property");
    const [selectedValue, setSelectedValue] = useState<string>("");
    const [requiredFieldsState, setRequiredFieldsState] = useState<string[]>([]);
    const typesMatched = useOtherTypes(selectedNode.data.selectedData);

    if (!selectedNode) {
        return null;
    }

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

    const groupedProperties =
        useGroupedProperties({ properties: selectedProperties }) ??
        { properties: { property: [], settings: [] } };

    const currentFormData = useMemo(
        () => nodeFormData.find((item) => item.nodeId === selectedNode.id)?.formData || {},
        [nodeFormData, selectedNode.id]
    );

    const dependsOn = useMemo(
        () => prevNodeFn(selectedNode.id)?.map((node) => node) ?? [],
        [prevNodeFn, selectedNode.id]
    );

    const taskID = useMemo(
        () => `${selectedNode.data.label}-${selectedValue}-${createShortUUID()}`,
        [selectedNode.data.label, selectedValue]
    );

    const isSaveDisabled = useMemo(() => {
        const currentFields = getNodeFormData(selectedNode.id) || {};
        return requiredFieldsState.some((field) => {
            const value = currentFields[field];

            if (!value) {
                return true;
            }

            if (Array.isArray(value)) {
                return value.length === 0;
            }

            if (typeof value === "string") {
                return value.trim() === "";
            }

            return false;
        });
    }, [getNodeFormData, requiredFieldsState, selectedNode.id]);

    const handleInputChange = useNodeFormInput({
        selectedNode,
        currentFormData,
        dependsOn,
        updateNodeFormData,
        saveFlow,
        taskID,
    });

    const handleSave = useCallback(() => {
        if (!selectedNode) return;

        const currentFields = getNodeFormData(selectedNode.id);
        if (!currentFields) {
          toast("Missing required fields", {
            style: {
              backgroundColor: "#f44336",
              color: "#fff",
            },
          });
            return;
        }
        const missingFields = requiredFieldsState.filter((field) => {
            const value = currentFields[field];
          
            if (!value) {
              return true;
            }
          
            if (Array.isArray(value)) {
              return value.length === 0;
            }
          
            if (typeof value === "string") {
              return value.trim() === "";
            }
          
            return false;
          });

        if (missingFields.length > 0) {
          toast(`Missing required fields: ${missingFields.join(", ")}`, {
            style: {
              backgroundColor: "#f44336",
              color: "#fff",
            },
          });
            return;
        }
        setFormDataNum((prev) => prev + 1);
        closeTap();
        revertOrSaveData(id, true);
    }, [closeTap, id, getNodeFormData, revertOrSaveData]);

    const handleTabChange = useCallback((tab: TabType) => {
        setActiveTab(tab);
    }, []);

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
        [selectedNode?.id, updatedSelectedNodeId]
    );

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

                <div className="flex justify-center pt-4">
                    <Button
                        onClick={handleSave}
                        className={`bg-black hover:bg-black/90 text-white px-8 ${isSaveDisabled ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                    >
                        <Save className="w-4 h-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
