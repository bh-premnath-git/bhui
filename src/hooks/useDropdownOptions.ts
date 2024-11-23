import { useState, useEffect } from 'react';
import { ApiService } from '@/services/apiServices';

export const useDropdownOptions = (endpoint: string) => {
    const [options, setOptions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        console.log('useDropdownOptions - endpoint:', endpoint); // Debug log

        if (!endpoint) {
            console.log('No endpoint provided, skipping fetch');
            setOptions([]);
            return;
        }

        const fetchOptions = async () => {
            setIsLoading(true);
            try {
                let urlParts = endpoint
                    .replace('{catalog_base_url}', '')
                    .replace('{env_id}', '')
                    .split('/')
                    .filter(Boolean);

                console.log('Processed URL parts:', urlParts); // Debug log

                if (urlParts[0] === 'api' && urlParts[1] === 'v1') {
                    urlParts = urlParts.slice(2);
                }

                const path = urlParts.slice(0, -1).join('/');
                const connections = urlParts[urlParts.length - 1];

                console.log('Making API call with:', { // Debug log
                    port: "8011",
                    path: `${path}/24/${connections}`
                });

                const data = await ApiService(
                    "8011", 
                    "get", 
                    `${path}/24/${connections}`
                );

                console.log('API Response:', data); // Debug log

                setOptions(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Detailed error in fetchOptions:', {
                    error,
                    endpoint,
                    message: error instanceof Error ? error.message : 'Unknown error'
                });
                setOptions([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOptions();
    }, [endpoint]);

    return { options, isLoading };
};