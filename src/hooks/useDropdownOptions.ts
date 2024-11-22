import { useState, useEffect } from 'react';
import { ApiService } from '@/services/apiServices';

export const useDropdownOptions = (endpoint: string) => {
    const [options, setOptions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchOptions = async () => {
            if (!endpoint) return;

            setIsLoading(true);
            try {
                let urlParts = endpoint
                    .replace('{catalog_base_url}', '')
                    .replace('{env_id}', '')
                    .split('/')
                    .filter(Boolean);

                // Remove 'api/v1' from the beginning if present
                if (urlParts[0] === 'api' && urlParts[1] === 'v1') {
                    urlParts = urlParts.slice(2);
                }

                const path = urlParts.slice(0, -1).join('/');
                const connections = urlParts[urlParts.length - 1];
                const data = await ApiService("8011", "get", `${path}/24/${connections}`);

                setOptions(data);
            } catch (error) {
                console.error('Error fetching dropdown options:', error);
                setOptions([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOptions();
    }, [endpoint]);

    return { options, isLoading };
};