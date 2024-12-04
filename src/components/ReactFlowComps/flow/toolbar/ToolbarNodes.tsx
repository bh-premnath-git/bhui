import React, { useEffect } from "react";
import { useFlow } from "@/contexts/FlowContext";
import { ModuleButton } from "./ModuleButton";
import { ModuleType, SelectedOperator } from "@/types/flow";
import { useModules } from "@/hooks/useModules";

export function ToolbarNodes() {
  const { nodes, addNode } = useFlow();
  const [activeType, setActiveType] = React.useState<number | null>(null);
  const [hoveredType, setHoveredType] = React.useState<number | null>(null);


  const moduleTypes = useModules();
  const handleOperatorSelect = React.useCallback(
    (moduleInfo: ModuleType) => {
      const selectedData: SelectedOperator = {
        type: moduleInfo.type,
        description: moduleInfo.description,
        moduleInfo: {
          icon: moduleInfo.icon,
          color: moduleInfo.color,
          label: moduleInfo.label,
        },
        properties: moduleInfo.operators,
      };

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
          selectedData: null,
          type: selectedData.type,
          status: "pending",
          meta: {
            type: selectedData.type,
            moduleInfo: {
              color: moduleInfo.color,
              icon: moduleInfo.icon,
              label: moduleInfo.label,
            },
            properties: selectedData.properties,
            description: selectedData.description,
          },
        },
      });

      setActiveType(null);
    },
    [nodes.length, addNode]
  );

  const activeModule = moduleTypes.find((type) => type.id === activeType);

  useEffect(() => {
    if (activeModule) {
      handleOperatorSelect(activeModule);
    }
  }, [activeModule, activeType]);

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
                isHovered={hoveredType === type.id}
                onClick={() => {
                  setActiveType(activeType === type.id ? null : type.id)
                }}
                onMouseEnter={() => setHoveredType(type.id)}
                onMouseLeave={() => setHoveredType(null)}
              />
            ))}
          </div>
          <div></div>
        </div>
      </div>
    </div>
  );
}