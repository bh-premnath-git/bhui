import { GroupedProperties, Property } from '@/types/designer/flow';
import { useMemo } from 'react';

export const useGroupedProperties = (selectedNode: any) => {
  return useMemo(() => {
    // Return empty grouped properties if selectedNode is undefined
    if (!selectedNode) {
      return {
        property: [],
        settings: [],
        parameters: []
      };
    }

    const properties = selectedNode.properties || {};
    const grouped: GroupedProperties = {
      property: [],
      settings: [],
      parameters: []
    };

    Object.entries(properties).forEach(([key, value]: [string, any]) => {
      if (key !== 'type' && key !== 'task_id' && key !== 'depends_on') {
        const group = value.ui_properties?.group_key;
        if (group === "property" || group === "settings" || group === "parameters") {
          grouped[group].push({
            key,
            ...value,
            ui_properties: {
              ...value.ui_properties,
              property_key: key
            }
          });
        }
      }
    });

    Object.keys(grouped).forEach(group => {
      grouped[group].sort((a: Property, b: Property) =>
        (a.ui_properties?.order || 0) - (b.ui_properties?.order || 0)
      );
    });
    
    return grouped;
  }, [selectedNode]); // Keep a single dependency
};