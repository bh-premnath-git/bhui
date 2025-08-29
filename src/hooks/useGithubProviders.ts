import { useAppSelector } from '@/hooks/useRedux';
import type { GithubProvider, GithubProvidersResponse } from '@/store/slices/globalGitSlice';

interface FormattedProvider {
  label: string;
  value: string;
}

export const useGithubProviders = () => {
  const { githubProviders, isLoading, error } = useAppSelector<{
    githubProviders: GithubProvidersResponse | null;
    isLoading: boolean;
    error: string | null;
  }>((state) => state.global);

  const formattedProviders: FormattedProvider[] = (githubProviders?.codes_dtl ?? []).slice(0, 2).map((provider: GithubProvider) => ({
    label: (provider.dtl_desc).toLowerCase(),
    value: provider.id.toString(),
  }));

  return {
    providers: formattedProviders,
    isLoading,
    error,
  };
};
