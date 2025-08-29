import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { apiService } from '@/lib/api/api-service';
import { AGENT_REMOTE_URL } from '@/config/platformenv';

// Define an interface for the expected API response structure
interface RecommendationApiResponse {
  recommended_questions: string[];
}

// Helper function to shuffle an array and pick N elements
function getRandomSubset<T>(array: T[], count: number): T[] {
  if (!array || array.length === 0) {
    return [];
  }
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, array.length));
}

export function useRecommendation(
  moduleName = 'dataops',
  connectionId = null,
  hookOptions?: Omit<UseQueryOptions<string[], Error, string[], readonly ["dataops-recommendations", string, string | null]>, 'queryKey' | 'queryFn'>
) {
  // Include connectionId in the query key to ensure different cache entries for different connections
  const queryKey = ['dataops-recommendations', moduleName, connectionId] as const;

  const queryFn = async (): Promise<string[]> => {
    // Prepare the URL and query parameters
    let url = '/recommendation';
    
    // Add connection_config_id as URL query parameter if connectionId exists
    if (connectionId && moduleName === 'explorer') {
      url = `${url}?connection_config_id=${connectionId}`;
    }
    
    // Expect the API to return the RecommendationApiResponse structure
    const response = await apiService.post<RecommendationApiResponse>({
      baseUrl: AGENT_REMOTE_URL,
      usePrefix: true,
      url: url,
      method: 'POST',
      data: { module: moduleName }
    });
    
    // Extract the questions and select a random subset of 3
    const allSuggestions = response.recommended_questions || [];
    return getRandomSubset(allSuggestions, 3);
  };

  // Combine all configurations into a single options object for useQuery
  // The TData for UseQueryOptions is string[] because queryFn returns Promise<string[]>
  const combinedQueryOptions: UseQueryOptions<string[], Error, string[], typeof queryKey> = {
    queryKey: queryKey,
    queryFn: queryFn,
    staleTime: 1000 * 60 * 5, // cache for 5m
    ...hookOptions
  };

  return useQuery(combinedQueryOptions);
}
