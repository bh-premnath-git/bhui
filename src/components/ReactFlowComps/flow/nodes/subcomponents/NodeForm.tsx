import React, { useCallback, useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGroupedProperties } from "@/hooks/useGroupedProperties";
import { useFlow } from "@/contexts/FlowContext";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import { FormLayout } from "./Form/FormLayout";
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface NodeFormProps {
    id: string;
    closeTap: () => void;
}

type TabType = "property" | "settings";

export const NodeForm: React.FC<NodeFormProps> = ({ closeTap, id }) => {
    const { selectedNode, nodeFormData, prevNodeFn, updateNodeFormData, updatedSelectedNodeId, revertOrSaveData } = useFlow();
    const [activeTab, setActiveTab] = useState<TabType>("property");
    const [selectedValue, setSelectedValue] = useState<string>("");

    if (!selectedNode) {
        return null;
    }

    // Update selectedProperties with selectedValue dependency
    const selectedProperties = useMemo(() => 
        selectedNode.data.meta.properties.find(
            (item: any) => item.type === selectedValue || item.type === selectedNode.data.selectedData
        ),
        [selectedNode.data.meta.properties, selectedNode.data.selectedData, selectedValue]
    );

    const groupedProperties = useGroupedProperties(selectedProperties) ?? { property: [], settings: [] };

    const currentFormData = useMemo(() =>
        nodeFormData.find(item => item.nodeId === selectedNode.id)?.formData || {},
        [nodeFormData, selectedNode.id]
    );

    const dependsOn = useMemo(() =>
        prevNodeFn(selectedNode.id)?.map(node => node.data.meta.type) ?? [],
        [prevNodeFn, selectedNode.id]
    );

    const handleInputChange = useCallback((key: string, value: string) => {
        if (!selectedNode) return;

        updateNodeFormData(selectedNode.id, {
            ...currentFormData,
            type: selectedNode.data.meta.type,
            task_id: selectedNode.data.label,
            dependsOn,
            [key]: value,
        });
    }, [selectedNode, currentFormData, dependsOn, updateNodeFormData]);

    const handleSave = useCallback(() => {
        closeTap();
        revertOrSaveData(id, true)
    }, [closeTap]);

    const handleTabChange = useCallback((tab: TabType) => {
        setActiveTab(tab);
    }, []);

    const handleValueChange = useCallback((value: string) => {
        setSelectedValue(value);
        updatedSelectedNodeId(selectedNode.id, value);
    }, [selectedNode?.id, updatedSelectedNodeId]);

    // Synchronize selectedValue with selectedNode.data.selectedData
    useEffect(() => {
        if (selectedNode?.data?.selectedData) {
            setSelectedValue(selectedNode.data.selectedData);
        }
    }, [selectedNode?.data?.selectedData]);

    return (
        <Card className="w-full max-w-3xl mx-auto shadow-lg">
            <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4 items-center">
                    <Label htmlFor="type-select" className="text-sm font-medium text-gray-700">
                        Select Node Type
                    </Label>
                    <Select
                        onValueChange={handleValueChange}
                        value={selectedValue}
                    >
                        <SelectTrigger
                            id="type-select"
                            className="bg-white border-gray-200 hover:border-gray-300 focus:ring-black"
                        >
                            <SelectValue placeholder="Select a type" />
                        </SelectTrigger>
                        <SelectContent>
                            {selectedNode.data.meta.properties.map((prop: any) => (
                                <SelectItem key={prop.type} value={prop.type}>
                                    {prop.type}
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
                        >
                            Settings
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="property">
                        <ScrollArea className="h-[400px] pr-4 rounded-md border border-gray-200 bg-white p-4">
                            <FormLayout
                                properties={groupedProperties['property']}
                                formValues={currentFormData}
                                onInputChange={handleInputChange}
                                dependsOn={dependsOn}
                            />
                        </ScrollArea>
                    </TabsContent>

                    <TabsContent value="settings">
                        <ScrollArea className="h-[400px] pr-4 rounded-md border border-gray-200 bg-white p-4">
                            <FormLayout
                                properties={groupedProperties['settings']}
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
                        className="bg-black hover:bg-black/90 text-white px-8"
                    >
                        Save Changes
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};