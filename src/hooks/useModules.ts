import { useMemo } from 'react';
import schema from '@/pages/manageFlow/data/flow_schema.json';

export function useModules() {
  return useMemo(() => {
    const modules = new Map<string, any>();

    schema.properties.tasks.items.oneOf.forEach((operator: any, index: number) => {
      const requiredFields = operator.required.filter((item: any) => !["type", "task_id"].includes(item));

      const { module_name, color, icon } = operator.properties.type.ui_properties;
      const operatorType = operator.properties.type.enum[0];

      if (!modules.has(module_name)) {
        modules.set(module_name, {
          id: index + 1,
          label: module_name,
          color,
          icon,
          operators: [],
        });
      }

      const moduleData = modules.get(module_name);
      if (moduleData) {
        moduleData.operators.push({
          type: operatorType,
          description: operator.properties.type.description,
          requiredFields,
          properties: {
            type: operatorType,
            task_id: "",
            ...Object.keys(operator.properties).reduce((acc: any, key: string) => {
              if (key !== "type") {
                acc[key] = operator.properties[key] || null;
              }
              return acc;
            }, {}),
          },
        });
      }
    });

    return [Array.from(modules.values())];
  }, []);
}
