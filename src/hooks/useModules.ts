import { useMemo } from 'react';
import {flowSchema as schema} from "@bh-ai/schemas";

export function useModules() {
  return useMemo(() => {
    const operators = schema.properties.tasks.items.oneOf;
    const normalizedOperators = operators.map((operator: any, index: number) => {
      const { description } = operator.properties.type;
      const { module_name, color, icon } = operator.properties.type.ui_properties;
      const operatorType = operator.properties.type.enum[0];

      const requiredFields = (operator.required || []).filter(
        (item: string) => !["type", "task_id"].includes(item)
      );

      const properties = {
        type: operatorType,
        task_id: "",
        ...Object.keys(operator.properties).reduce((acc: any, key: string) => {
          if (key !== "type") {
            acc[key] = operator.properties[key] || null;
          }
          return acc;
        }, {}),
      };

      return {
        module_name,
        operator: {
          type: operatorType,
          description: description,
          requiredFields,
          properties,
        },
        module_meta: { color, icon },
      };
    });

    const modulesMap = new Map<string, any>();

    normalizedOperators.forEach((item, index) => {
      const { module_name, module_meta, operator } = item;

      if (!modulesMap.has(module_name)) {
        modulesMap.set(module_name, {
          id: index + 1,
          label: module_name,
          color: module_meta.color,
          icon: module_meta.icon,
          operators: [],
        });
      }

      const moduleData = modulesMap.get(module_name);
      moduleData.operators.push(operator);
    });

    return [Array.from(modulesMap.values())];
  }, []);
}
