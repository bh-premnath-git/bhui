import { useState, useEffect } from 'react';
import { apiService } from '@/lib/api/api-service';
import { CATALOG_REMOTE_API_URL } from '@/config/platformenv';
import { ApiConfig } from '@/lib/api/api-config';

interface FieldSchema {
  ui_properties?: {
    mandatory?: boolean;
    property_key?: string;
    endpoint?: string;
  };
  type?: string;
}

interface MandatoryFieldOption {
  label: string;
  value: string | number;
  description?: string;
}

export const useMandatoryFieldOptions = (fieldSchema: FieldSchema, envId: string | null) => {
  const [options, setOptions] = useState<MandatoryFieldOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOptions = async () => {
      // Skip if not mandatory or no envId
      if (!fieldSchema?.ui_properties?.mandatory || !envId) {
        setOptions([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const config: ApiConfig = {
          method: 'GET',
          baseUrl: CATALOG_REMOTE_API_URL,
          url: `/api/v1/mandatory-fields/${envId}`,
          params: {
            field_key: fieldSchema.ui_properties.property_key,
            field_type: fieldSchema.type
          },
          usePrefix: true
        };

        const response = await apiService.get(config);

        if (response) {
          // Ensure response data matches expected format
          const formattedOptions = Array.isArray(response) 
            ? response.map(item => ({
                label: item.label || item.name || item.value,
                value: item.value || item.id,
                description: item.description
              }))
            : [];
          setOptions(formattedOptions);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch mandatory field options');
        console.error('Error fetching mandatory field options:', err);
        setOptions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOptions();
  }, [fieldSchema, envId]);

  return { options, isLoading, error };
};
