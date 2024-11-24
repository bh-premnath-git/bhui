import React, { useState, useCallback, useMemo } from "react";
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
import { FormFields } from "./Form/FormFields";

interface NodeFormProps {
    closeTap: () => void;
}
type TabType = "property" | "settings";

export const NodeForm: React.FC<NodeFormProps> = ({ closeTap }) => {
    const { selectedNode, nodeFormData, prevNodeFn, updateNodeFormData } = useFlow();
    const [activeTab, setActiveTab] = useState<TabType>("property");

    // Guard clause for when no node is selected
    if (!selectedNode) {
        return null;
    }

    const groupedProperties = useGroupedProperties(selectedNode);

    // Memoize form data lookup
    const currentFormData = useMemo(() =>
        nodeFormData.find(item => item.nodeId === selectedNode.id)?.formData || {},
        [nodeFormData, selectedNode.id]
    );

    // Memoize depends on calculation
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
    }, [closeTap]);

    const handleTabChange = useCallback((tab: TabType) => {
        setActiveTab(tab);
    }, []);

    return (
        <div className="w-full max-w-3xl mx-auto space-y-6">
            {/* Replace TabButtons with Tabs */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="property">Property</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                {/* Property Tab Content */}
                <TabsContent value="property" className="space-y-4">
                    <ScrollArea className="h-[400px] pr-4">
                        <FormFields
                            properties={groupedProperties['property']}
                            formValues={currentFormData}
                            onInputChange={handleInputChange}
                            dependsOn={dependsOn}
                        />
                    </ScrollArea>
                </TabsContent>

                {/* Settings Tab Content */}
                <TabsContent value="settings" className="space-y-4">
                    <ScrollArea className="h-[400px] pr-4">
                        <FormFields
                            properties={groupedProperties['settings']}
                            formValues={currentFormData}
                            onInputChange={handleInputChange}
                            dependsOn={dependsOn}
                        />
                    </ScrollArea>
                </TabsContent>
            </Tabs>

            <div className="flex justify-center gap-4 pt-4">
                <Button
                    variant="outline"
                    onClick={handleSave}>
                    Save
                </Button>
            </div>
        </div>
    );
};
