import React from "react";
import { useFlow } from "@/contexts/FlowContext";
import { ModuleButton } from "./ModuleButton";
import { OperatorList } from "./OperatorList";
import { PlaybackButton } from "./PlaybackButton";
import { ModuleType, SelectedOperator } from "@/types/flow";
import { useModules } from "@/hooks/useModules";

export function ToolbarNodes() {
  const { nodes, isPlaying, togglePlayback, addNode } = useFlow();
  const [activeType, setActiveType] = React.useState<number | null>(null);
  const [hoveredType, setHoveredType] = React.useState<number | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedOperator, setSelectedOperator] = React.useState<SelectedOperator | null>(null);

  const moduleTypes = useModules();
  const handleOperatorSelect = React.useCallback(
    (operator: ModuleType["operators"][number], moduleInfo: ModuleType) => {
      const selectedData: SelectedOperator = {
        type: operator.type,
        description: operator.description,
        moduleInfo: {
          icon: moduleInfo.icon,
          color: moduleInfo.color,
          label: moduleInfo.label,
        },
        properties: operator.properties,
      };

      setSelectedOperator(selectedData);

      const id = (nodes.length + 1).toString();
      const lastNode = nodes[nodes.length - 1];
      const position = {
        x: (lastNode?.position?.x ?? 100) + 140, y: 150,
      };

      addNode({
        id,
        type: "custom",
        position,
        data: {
          label: moduleInfo.label,
          type: operator.type,
          status: "pending",
          meta: {
            type: operator.type,
            moduleInfo: {
              color: moduleInfo.color,
              icon: moduleInfo.icon,
              label: moduleInfo.label,
            },
            properties: operator.properties,
            description: operator.description,
          },
        },
      });

      setActiveType(null);
    },
    [nodes.length, addNode]
  );

  const activeModule = moduleTypes.find((type) => type.id === activeType);

  return (
    <div className="relative w-full">
      <div className="p-2 bg-white">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="w-10" />
          <div className="flex gap-2 flex-wrap justify-center">
            {moduleTypes.map((type) => (
              <ModuleButton
                key={type.id}
                color={type.color}
                icon={type.icon}
                label={type.label}
                isActive={activeType === type.id}
                isHovered={hoveredType === type.id}
                onClick={() => setActiveType(activeType === type.id ? null : type.id)}
                onMouseEnter={() => setHoveredType(type.id)}
                onMouseLeave={() => setHoveredType(null)}
              />
            ))}
          </div>
          <PlaybackButton isPlaying={isPlaying} onToggle={togglePlayback} />
        </div>
      </div>

      {activeModule && (
        <div className="absolute left-1/2 -translate-x-1/2 z-20">
          <OperatorList
            module={activeModule}
            searchTerm={searchTerm}
            selectedOperator={selectedOperator}
            onSearchChange={setSearchTerm}
            onClose={() => setActiveType(null)}
            onOperatorSelect={(operator) => handleOperatorSelect(operator, activeModule)}
          />
        </div>
      )}
    </div>
  );
}