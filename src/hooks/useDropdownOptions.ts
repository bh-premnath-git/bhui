import { useState, useEffect } from 'react';
import { ApiService } from '@/services/apiServices';

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

                // Construct the URL conditionally based on the presence of `id`
                let url = '';
                if (id && path !== 'pipeline') {
                    url = `${path}/${id}/${connections}`;
                    data = await ApiService("8011", "get", url);
                } else {
                    url = `${path}/${connections}/`;
                    data = await ApiService("8011", "get", url);

                    // Map the result to extract pipeline_name
                    data = Array.isArray(data)
                        ? data.map((item: any) => item.pipeline_name || '')
                        : [];
                }

                // Set the mapped options
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
