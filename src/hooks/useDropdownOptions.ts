import { useQuery } from '@tanstack/react-query';
import { CATALOG_API_PORT } from '@/config/platformenv';

export const useDropdownOptions = (endpoint: string, id: string | null) => {
    const processEndpoint = (endpoint: string) => {
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

    const { data: options = [], isLoading } = useQuery({
        queryKey: ['dropdownOptions', endpoint, id],
        queryFn: async () => {
            const { path, connections } = processEndpoint(endpoint);
            let url = '';
            
            if (id && path !== 'pipeline') {
                url = `${path}/${id}/${connections}`;
            } else {
                url = `${path}/${connections}/`;
            }

            const response = await fetch(`${CATALOG_API_PORT}/${url}`, {
                method: 'GET',
            });

            const data = await response.json();

            if (path === 'pipeline') {
                return Array.isArray(data)
                    ? data.map((item: any) => item.pipeline_name || '')
                    : [];
            }

            return Array.isArray(data) ? data : [];
        },
        enabled: !!endpoint,
    });

    return { options, isLoading };
};
