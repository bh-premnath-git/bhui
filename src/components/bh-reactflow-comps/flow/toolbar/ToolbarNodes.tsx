import React, { useEffect } from "react";
import { useFlow } from "@/context/designers/FlowContext";
import { ModuleButton } from "./ModuleButton";
import { ModuleType, SelectedOperator } from "@/types/designer/flow";
import { useModules } from "@/hooks/useModules";

export function ToolbarNodes() {
  const { nodes, addNode } = useFlow();
  const [activeType, setActiveType] = React.useState<number | null>(null);
  const [hoveredType, setHoveredType] = React.useState<number | null>(null);

  const [moduleTypes] = useModules();
  const activeModule = moduleTypes.find((type) => type.id === activeType);
  let flowNodes=moduleTypes.map((type) => {
    return {
      "ui_properties": {
        "module_name": type.label,
        "color": type.color,
        "icon":type.icon,
        "ports": {
          "inputs": 1,
          "outputs": 1,
          "maxInputs": 1
        }
      }
    };
  });
  console.log(flowNodes)
  // Update handleOperatorSelect to accept requiredFields
  const handleOperatorSelect = React.useCallback(
    (moduleInfo: ModuleType, requiredFields: string[]) => {
      const [selectedOperator] = moduleInfo.operators;
      const selectedData: SelectedOperator = {
        type: selectedOperator.type,
        description: selectedOperator.description,
        moduleInfo: {
          icon: moduleInfo.icon,
          color: moduleInfo.color,
          label: moduleInfo.label,
        },
        properties: moduleInfo.operators.map((op) => op.properties),
      };

      const id = (nodes.length + 1).toString();
      addNode({
        id,
        type: "custom",
        data: {
          tempSave: false,
          label: moduleInfo.label,
          selectedData: null,
          type: "",
          status: "pending",
          meta: {
            type: "",
            moduleInfo: {
              color: moduleInfo.color,
              icon: moduleInfo.icon,
              label: moduleInfo.label,
            },
            properties: selectedData.properties,
            description: selectedData.description,
            fullyOptimized: false,
          },
          requiredFields,
        },
      });

      setActiveType(null);
    },
    [nodes.length, addNode]
  );

  useEffect(() => {
    if (activeModule) {
      const requiredFields = activeModule.operators?.map?.((op:any) => {
        return ({[op.type]:op.requiredFields})
      }) || [];

      handleOperatorSelect(activeModule, requiredFields);
    }
  }, [activeModule, activeType, handleOperatorSelect]);

  return (
    <div className="relative w-full">
      <div className="p-2 bg-transparent">
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
                  setActiveType(activeType === type.id ? null : type.id);
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
