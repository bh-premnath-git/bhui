import { useState, useEffect } from 'react';
import { ApiService } from '@/services/api.services';
import { CATALOG_API_PORT } from '@/services/environment';

export const useDropdownOptions = (endpoint: string, id: string | null) => {
    const [options, setOptions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!endpoint) {
            setOptions([]);
            return;
        }

        const fetchOptions = async () => {
            setIsLoading(true);
            try {
                let data: any;
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

                let url = '';
                if (id && path !== 'pipeline') {
                    url = `${path}/${id}/${connections}`;
                    data = await ApiService({portNumber: CATALOG_API_PORT, method:"get", url: url});
                } else {
                    url = `${path}/${connections}/`;
                    data = await ApiService({portNumber: CATALOG_API_PORT, method: "get", url: url});

                    data = Array.isArray(data)
                        ? data.map((item: any) => item.pipeline_name || '')
                        : [];
                }

                setOptions(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Error fetching options:', error);
                setOptions([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOptions();
    }, [endpoint, id]);

    return { options, isLoading };
};
