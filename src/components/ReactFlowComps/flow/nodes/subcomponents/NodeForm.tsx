import React, { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGroupedProperties } from "@/hooks/useGroupedProperties";
import { useFlow } from "@/contexts/FlowContext";
import { TabButtons } from "./Form/TabButtons";
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
            <TabButtons 
                activeTab={activeTab} 
                onTabChange={handleTabChange} 
            />

            <ScrollArea className="h-[400px]">
                <div className="pr-4">
                    <FormFields
                        properties={groupedProperties[activeTab]}
                        formValues={currentFormData}
                        onInputChange={handleInputChange}
                        dependsOn={dependsOn}
                    />
                </div>
            </ScrollArea>

            <div className="flex justify-center gap-4 pt-4">
                <Button 
                    variant="outline" 
                    onClick={closeTap}
                >
                    Close
                </Button>
                <Button onClick={handleSave}>
                    Save
                </Button>
            </div>
        </div>
    );
};