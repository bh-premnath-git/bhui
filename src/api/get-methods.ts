import { useFetchData } from "@/hooks/useFetchData";
import { AUDIT_PORT, CATALOG_API_PORT } from "@/services/environment";
import { fetchData as releaseFetchData } from "@/services/releaseApi";
import { useQuery } from '@tanstack/react-query';

export const getDataSources = {
    dataSources: () => {
        const queryKey = ['data-sources'];
        const { data, error, isLoading } = useFetchData(
            queryKey,
            {
                portNumber: CATALOG_API_PORT,
                url: '/data_source/list/',
                params: { offset: 0, limit: 1000 },
                usePrefix: true,
                metadata: {
                    errorMessage: 'Failed to load data sources',
                    successMessage: 'Data sources loaded successfully',
                }
            }
        );
        return {
            data,
            error,
            isLoading
        }
    },
    manageProjects: () => {
        const queryKey = ['manage-projects'];
        const { data, error, isLoading } = useFetchData(
            queryKey,
            {
                portNumber: CATALOG_API_PORT,
                url: '/projects',
                params: { offset: 0, limit: 1000 },
                usePrefix: false,
                metadata: {
                    errorMessage: 'Failed to load projects',
                    successMessage: 'Projects loaded successfully',
                }
            })
        return {
            data,
            error,
            isLoading
        }
    },
    manageEnvironments: () => {
        const queryKey = ['manage-environment'];
        const { data, error, isLoading } = useFetchData(
            queryKey,
            {
                portNumber: CATALOG_API_PORT,
                url: '/environments',
                params: { offset: 0, limit: 1000 },
                usePrefix: false,
                metadata: {
                    errorMessage: 'Failed to load environments',
                    successMessage: 'Environments loaded successfully',
                }
            }
        );
        return {
            data,
            error,
            isLoading
        }
    },
    manageUsers: () => {
        const queryKey = ['manage-users'];
        const { data, error, isLoading } = useFetchData(
            queryKey,
            {
                portNumber: CATALOG_API_PORT,
                url: '/users',
                params: { offset: 0, limit: 1000 },
                usePrefix: false,
                metadata: {
                    errorMessage: 'Failed to load users',
                    successMessage: 'Users loaded successfully',
                }
            }
        );

        return {
            data,
            error,
            isLoading
        }
    },
    operations: () => {
        const queryKey = ['operations'];
        const { data, error, isLoading } = useFetchData(
            queryKey,
            {
                portNumber: AUDIT_PORT,
                url: '/job_details/list',
                params: { offset: 0, limit: 1000 },
                usePrefix: true,
                metadata: {
                    errorMessage: 'Failed to load operations',
                    successMessage: 'Operations loaded successfully',
                }
            }
        );

        return {
            data,
            error,
            isLoading
        }
    },
    dataPipeline: () => {
        const queryKey = ['data-pipeline'];
        const { data, error, isLoading } = useFetchData(
            queryKey,
            {
                portNumber: CATALOG_API_PORT,
                url: '/pipeline/list/',
                params: { offset: 0, limit: 1000, order_desc: true, order_by: 'pipeline_id' },
                usePrefix: true,
                metadata: {
                    errorMessage: 'Failed to load data pipeline',
                    successMessage: 'Data pipeline loaded successfully',
                }
            }
        );
        return {
            data,
            error,
            isLoading
        }
    },
    flows: () => {
        const queryKey = ['flows'];
        const { data, error, isLoading } = useFetchData(
            queryKey,
            {
                portNumber: CATALOG_API_PORT,
                url: '/flow/list/',
                params: { offset: 0, limit: 1000, order_desc: true, order_by: 'flow_id' },
                usePrefix: true,
                metadata: {
                    errorMessage: 'Failed to load flows',
                    successMessage: 'Flows loaded successfully',
                }
            }
        );
        return {
            data,
            error,
            isLoading
        }
    },
    alerts: () => {
        const queryKey = ['alerts'];
        const { data, error, isLoading } = useFetchData(
            queryKey,
            {
                portNumber: CATALOG_API_PORT,
                url: '/alerts',
                params: { offset: 0, limit: 1000 },
                usePrefix: false,
                metadata: {
                    errorMessage: 'Failed to load alerts',
                    successMessage: 'Alerts loaded successfully',
                }
            }
        );

        return {
            data,
            error,
            isLoading
        }
    },
    releases: () => {
        const { isLoading, error, data } = useQuery({
            queryKey: ['releases'],
            queryFn: async () => {
                const response = await releaseFetchData();
                return response;
            },
        });

        return {
            data,
            error,
            isLoading
        }
    }
}