import { useQuery } from '@tanstack/react-query';
import { CATALOG_API_PORT } from '@/config/platformenv';
import { apiService } from '@/lib/api/api-service';

const processEndpoint = (endpoint: string | undefined) => {
  if (!endpoint) {
    return { path: '', connections: '' };
  }

  let urlParts = endpoint
    .replace('{catalog_base_url}', '')
    .replace('{env_id}', '')
    .split('/')
    .filter(Boolean);

  if (urlParts[0] === 'api' && urlParts[1] === 'v1') {
    urlParts = urlParts.slice(2);
  }

  const path = urlParts.slice(0, -1).join('/');
  const connections = urlParts[urlParts.length - 1];

  return { path, connections };
};

export const useDropdownOptions = (
  endpoint: string | null | undefined,
  id: string | null
) => {
  const queryResult = useQuery({
    queryKey: ['dropdownOptions', endpoint, id],

    queryFn: async () => {
      if (!endpoint) {
        console.warn('[useDropdownOptions] endpoint is falsy, returning []');
        return [];
      }

      const { path, connections } = processEndpoint(endpoint);
      if (!path || !connections) {
        console.warn('[useDropdownOptions] path or connections is empty, returning []');
        return [];
      }
      let url = '';
      if (id && path !== 'pipeline') {
        url = `/${path}/${id}/${connections}`;
      } else {
        url = `/${path}/${connections}/`;
      }

      const data = await apiService.get({
        url,
        portNumber: CATALOG_API_PORT,
        method: 'GET',
        usePrefix: true
      });

      // 6. If path === 'pipeline', return pipeline names specifically
      if (path === 'pipeline') {
        return Array.isArray(data)
          ? data.map((item: any) => item.pipeline_name || '')
          : [];
      }

      if (Array.isArray(data)) {
        return data.map((item: any) => {
          if (typeof item === 'string') return item;
          if (typeof item === 'object' && item !== null) {
            const stringProps = ['name', 'id', 'value', 'label', 'title'];
            for (const prop of stringProps) {
              if (typeof item[prop] === 'string') return item[prop];
            }
            return JSON.stringify(item);
          }
          return String(item);
        });
      }
      return [];
    },
    enabled: !!endpoint,
    
  });

  const { data: options = [], isLoading, isError, error } = queryResult;

  return { options, isLoading, isError, error };
};
