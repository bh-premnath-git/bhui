import { useReducer } from 'react';
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EnvironmentTab } from '@/features/adminconsole/environments/environtabs/EnvironmentTab';
import { useNavigate } from 'react-router-dom';
import { createEnvironment } from '@/store/oldstore/EnvironmentSlice';
import { useAppDispatch } from '@/hooks/useRedux';
import { encrypt_string } from '@/services/encryption';
import { toast } from 'sonner';
import { LoadingState } from '@/components/shared/LoadingState';
import { EnvironmentTabState, State, Action, TABS, initialState, TabType } from "@/types/features/environment/types";
import { areAllRequiredFieldsFilled } from '@/lib/environment';

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    case 'SET_TAGS':
      return { ...state, tags: action.payload };
    case 'SET_SELECTED_PLATFORM':
      return { ...state, selectedPlatform: action.payload };
    case 'SET_ENVIRONMENT_TAB':
      return {
        ...state,
        environmentTab: { ...state.environmentTab, ...action.payload }
      };
    case 'SET_VERIFICATION':
      return {
        ...state,
        environmentTab: { ...state.environmentTab, verification: action.payload }
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

export default function EnvironmentConsoleComponent(): JSX.Element {
  const [state, dispatch] = useReducer(reducer, initialState);
  const dispatchApi = useAppDispatch();
  const navigate = useNavigate();

  const disabledPlatforms = ["google-cloud"];
  const canProceed = areAllRequiredFieldsFilled(state.environmentTab, state.selectedPlatform)
    && state.environmentTab.verification;

  const handleBack = (): void => {
    const currentIndex = TABS.indexOf(state.activeTab);
    if (currentIndex > 0) {
      dispatch({ type: 'SET_ACTIVE_TAB', payload: TABS[currentIndex - 1] });
    }
  };

  const handleNext = async (): Promise<void> => {
    const currentIndex = TABS.indexOf(state.activeTab);
    if (currentIndex < TABS.length - 1) {
      dispatch({ type: 'SET_ACTIVE_TAB', payload: TABS[currentIndex + 1] });
    } else {
      const { encryptedString, initVector } = encrypt_string(state.environmentTab.secretAccessKey);
      const { encryptedString: encryptedString1 } = encrypt_string(state.environmentTab.accessKey, initVector);
      const formattedTags = state.tags.filter(tag => tag && tag.tagList).flatMap(tag => tag?.tagList);
      const values = {
        bh_env_name: state.environmentTab.environmentName,
        bh_env_provider: parseInt(state.environmentTab.environment),
        cloud_provider_cd: state.selectedPlatform === "aws" ? 101 : 102,
        cloud_region_cd: parseInt(state.environmentTab.location),
        status_cd: "active",
        project_id: state.environmentTab.projectId,
        file: state.environmentTab.privateKeyFile,
        access_key: encryptedString1,
        secret_access_key: encryptedString,
        init_vector: initVector,
        airflow_url: state.environmentTab.airflowUrl,
        airflow_bucket_name: (state.environmentTab.airflowDagBucket).match(/([^:]+)$/)[1],
        airflow_env_name: state.environmentTab.selectedMwaaEnv,
        pvt_key: state.environmentTab.awsPvtKey,
        tags: JSON.stringify({
          tagList: formattedTags
        }),
      };

      dispatch({ type: 'SET_LOADING', payload: true });
      dispatchApi(createEnvironment(values))
        .then((response: any) => {
          if (response.type === "environment/create/fulfilled") {
            toast.success('Environment created successfully');
          }
          setTimeout(() => {
            navigate('/admin-console/environment');
          }, 1000);
        })
        .catch((error: any) => {
          console.error(error);
          toast.error(error.response?.data?.message || 'Error submitting form');
          navigate('/admin-console/environment');
        })
        .finally(() => {
          dispatch({ type: 'SET_LOADING', payload: false });
        });
    }
  };

  const handleTabChange = (value: string): void => {
    if (TABS.includes(value as TabType)) {
      dispatch({ type: 'SET_ACTIVE_TAB', payload: value as TabType });
    }
  };

  const handleEnvironmentTabChange = (changes: Partial<EnvironmentTabState>) => {
    dispatch({ type: 'SET_ENVIRONMENT_TAB', payload: changes });
  };

  const handleChangeVerification = (data: boolean) => {
    dispatch({ type: 'SET_VERIFICATION', payload: data });
  };

  return (
    <div className="container p-0 space-y-2">
      <Tabs value={state.activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="flex justify-end items-center">
          <Button
            variant="default"
            className="bg-gray-800 text-white hover:bg-gray-700"
            onClick={() => navigate('/admin-console/environment')}
          >
            View All Environments
          </Button>
        </div>
        <Card className="w-full mt-2">
          <CardContent className="p-2">
            <div className="max-w-[1050px] mx-auto">
              <TabsContent value="environment">
                <EnvironmentTab
                  selectedPlatform={state.selectedPlatform}
                  setSelectedPlatform={(platform) =>
                    dispatch({ type: 'SET_SELECTED_PLATFORM', payload: platform })
                  }
                  tags={state.tags}
                  setTags={(newTags) => {
                    if (typeof newTags === 'function') {
                      dispatch({ type: 'SET_TAGS', payload: newTags(state.tags) });
                    } else {
                      dispatch({ type: 'SET_TAGS', payload: newTags });
                    }
                  }}
                  onChange={handleEnvironmentTabChange}
                  environmentName={state.environmentTab.environmentName}
                  environment={state.environmentTab.environment}
                  projectId={state.environmentTab.projectId}
                  location={state.environmentTab.location}
                  accessKey={state.environmentTab.accessKey}
                  secretAccessKey={state.environmentTab.secretAccessKey}
                  airflowUrl={state.environmentTab.airflowUrl}
                  airflowDagBucket={state.environmentTab.airflowDagBucket}
                  privateKeyFile={state.environmentTab.privateKeyFile}
                  changeVerification={handleChangeVerification}
                  disabledPlatforms={disabledPlatforms}
                />
              </TabsContent>
            </div>
          </CardContent>
        </Card>
      </Tabs>
      <div className="flex justify-center space-x-4">
        <Button variant="outline" onClick={handleBack} disabled={state.activeTab === TABS[0]}>
          Back
        </Button>
        <Button
          className="bg-gray-900 text-white hover:bg-gray-800"
          onClick={handleNext}
          disabled={!canProceed}
        >
          {state.activeTab === TABS[TABS.length - 1] ? (
            <>
              {state.isLoading ? <LoadingState className="max-h-[10px]" /> : null}
              Create Environment
            </>
          ) : (
            "Next"
          )}
        </Button>
      </div>
    </div>
  );
}
