import { useState, useEffect } from 'react';
import { ApiService } from '@/services/apiServices';

export const useDropdownOptions = (endpoint: string, id: string) => {
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

                const data = await ApiService(
                    "8011", 
                    "get", 
                    `${path}/${id}/${connections}`
                );

                setOptions(Array.isArray(data) ? data : []);
            } catch (error) {
                setOptions([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOptions();
    }, [endpoint]);

    return { options, isLoading };
};