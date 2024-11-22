import { GroupedProperties, Property } from '@/types/flow';
import { useMemo } from 'react';

export const useGroupedProperties = (selectedNode: any) => {
  return useMemo(() => {
    const properties = selectedNode.data.meta.properties || {};
    const grouped: GroupedProperties = {
      property: [],
      settings: []
    };

    Object.entries(properties).forEach(([key, value]: [string, any]) => {
      if (key !== 'type' && key !== 'task_id') {
        const group = value.ui_properties?.group_key;
        if (group === "property" || group === "settings") {
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
  }, [selectedNode]);
};